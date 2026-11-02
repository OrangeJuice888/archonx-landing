/* ArchonX admin app. Plain script, no build step. Everything that came from the server is put
   into the page with textContent (never innerHTML). Mutating requests carry
   X-Requested-With: ax-admin and same-origin credentials. */
(function () {
  'use strict';

  var FIELDS = window.AX_FIELDS || {};
  var LIVE_PAGE = 'https://archonx.ai/consultation/#pricing';
  var STATUS_LABELS = { 'new': 'New', contacted: 'Contacted', quoted: 'Quoted', won: 'Won', lost: 'Lost', 'not-yet': 'Not yet' };
  var DECIMAL_KEYS = { extraMinute: true, extraConversation: true, smsCost: true };
  var PRICING_GROUPS = [
    ['Packages', 'pricing.packs.'],
    ['Industry setups', 'pricing.industries.'],
    ['Front desk services', 'pricing.frontDesk.'],
    ['Back office services', 'pricing.backOffice.'],
    ['Builds', 'pricing.builds.'],
    ['Advice and training', 'pricing.advice.'],
    ['App review and launch', 'pricing.app.'],
    ['Engineer', 'pricing.engineer.'],
    ['Extras', 'pricing.extras.'],
    ['Bluework', 'pricing.bluework.']
  ];
  var TEXT_FIELDS = [
    ['text.announcement', 'Announcement bar', 'The sentence in the bar at the top of the consulting page, before the link.'],
    ['text.announcementLink', 'Announcement link text', 'The linked words at the end of the announcement bar.'],
    ['text.opening', 'Opening sentence', 'The first sentence under the consulting page headline.'],
    ['text.openingSub', 'Opening, second sentence', 'The sentence that follows the opening sentence.'],
    ['text.hours', 'Hours', 'Shown with the contact details on the consulting page and the fact sheet.'],
    ['text.location', 'Location', 'Shown on the fact sheet.'],
    ['text.pricesCorrectAt', 'Prices correct at', 'The date in the pricing footnote on the consulting page and the fact sheet.', 'date'],
    ['home.doctrineQuote', 'Home page quote, first part', 'The large quote on the home page, before the underlined words.'],
    ['home.doctrineQuoteEmphasis', 'Home page quote, underlined part', 'The underlined words of the home page quote (a full stop is added after them).']
  ];
  var PAIRS = [['automotive', 'gyms', 'workshop or studio setup'], ['realestate', 'logistics', 'property or freight setup'], ['dental', 'legal', 'clinic or legal setup']];

  var state = { me: null, loaded: null, content: null, version: null, updatedAt: null, updatedBy: null, leads: { items: [], total: 0, offset: 0, limit: 50 }, route: 'overview' };

  /* ---------- small helpers ---------- */

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) for (var k in attrs) if (Object.prototype.hasOwnProperty.call(attrs, k)) {
      if (k === 'class') node.className = attrs[k];
      else if (k === 'text') node.textContent = attrs[k];
      else if (k === 'for') node.htmlFor = attrs[k];
      else if (k === 'hidden') node.hidden = Boolean(attrs[k]);
      else if (k === 'disabled') node.disabled = Boolean(attrs[k]);
      else if (k === 'checked') node.checked = Boolean(attrs[k]);
      else if (k === 'value') node.value = attrs[k];
      else node.setAttribute(k, attrs[k]);
    }
    if (children) for (var i = 0; i < children.length; i++) {
      var c = children[i];
      if (c === null || c === undefined) continue;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    }
    return node;
  }
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); return node; }
  function $(id) { return document.getElementById(id); }
  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function isPlain(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }
  function get(obj, path) { var cur = obj; var parts = path.split('.'); for (var i = 0; i < parts.length; i++) { if (!isPlain(cur)) return undefined; cur = cur[parts[i]]; } return cur; }
  function set(obj, path, value) { var parts = path.split('.'); var cur = obj; for (var i = 0; i < parts.length - 1; i++) cur = cur[parts[i]]; cur[parts[parts.length - 1]] = value; }
  function leaves(obj, prefix, out) { out = out || []; for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) { var p = prefix ? prefix + '.' + k : k; if (isPlain(obj[k])) leaves(obj[k], p, out); else out.push(p); } return out; }
  function money(n) { n = Number(n); if (!isFinite(n)) return ''; var dp = Number.isInteger(n) ? 0 : 2; return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: dp, maximumFractionDigits: dp }); }
  function gst(n) { return '$' + (Math.round(Number(n) * 110) / 100).toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 2 }); }
  function fmtDate(iso) { if (!iso) return ''; var d = new Date(iso); if (isNaN(d)) return String(iso); return d.toLocaleString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }); }
  function todayLocal() { var d = new Date(); var m = d.getMonth() + 1, day = d.getDate(); return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day; }
  function labelFor(path) { var f = FIELDS[path]; if (f) return f.label; for (var i = 0; i < TEXT_FIELDS.length; i++) if (TEXT_FIELDS[i][0] === path) return TEXT_FIELDS[i][1]; return path; }
  function fmtValue(path, v) { var f = FIELDS[path]; if (f && (f.kind === 'price' || f.kind === 'cost')) return money(v); if (typeof v === 'number') return String(v); return '"' + String(v) + '"'; }

  function notice(message, isError) {
    var box = $('notice');
    clear(box);
    box.className = 'notice' + (isError ? ' error' : '');
    var close = el('button', { type: 'button', class: 'linkbtn close', text: 'Close' });
    close.addEventListener('click', function () { box.hidden = true; });
    box.appendChild(close);
    if (typeof message === 'string') box.appendChild(document.createTextNode(message));
    else box.appendChild(message);
    box.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function api(method, path, body) {
    var opts = { method: method, credentials: 'same-origin', headers: { Accept: 'application/json' } };
    if (method !== 'GET') opts.headers['X-Requested-With'] = 'ax-admin';
    if (body !== undefined) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
    return fetch(path, opts).then(function (res) {
      if (res.status === 401) { location.replace('/admin/login'); return new Promise(function () {}); }
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (res.status === 403 && data && data.error === 'password_change_required') { showGate(true); }
        return { status: res.status, ok: res.ok, data: data };
      });
    });
  }

  function confirmDialog(title, bodyNode, okLabel) {
    var dlg = $('confirmDialog');
    $('confirmTitle').textContent = title;
    clear($('confirmBody')).appendChild(bodyNode);
    $('confirmOk').textContent = okLabel || 'Save';
    return new Promise(function (resolve) {
      function done(v) { $('confirmOk').removeEventListener('click', yes); $('confirmCancel').removeEventListener('click', no); dlg.removeEventListener('cancel', no); if (dlg.open) dlg.close(); resolve(v); }
      function yes() { done(true); }
      function no(e) { if (e && e.preventDefault) e.preventDefault(); done(false); }
      $('confirmOk').addEventListener('click', yes);
      $('confirmCancel').addEventListener('click', no);
      dlg.addEventListener('cancel', no);
      dlg.showModal();
    });
  }

  /* ---------- gate and boot ---------- */

  function showGate(on) {
    $('gate').hidden = !on;
    $('nav').hidden = on;
    var sections = document.querySelectorAll('section[data-section]');
    for (var i = 0; i < sections.length; i++) sections[i].hidden = true;
    if (!on) route();
  }

  function boot() {
    api('GET', '/api/admin/me').then(function (r) {
      if (!r.ok) { location.replace('/admin/login'); return; }
      state.me = r.data;
      $('whoEmail').textContent = r.data.email;
      if (r.data.mustChangePassword) { showGate(true); return; }
      return loadContent().then(function () { showGate(false); refreshBadge(); });
    });
  }

  function loadContent() {
    return api('GET', '/api/admin/content').then(function (r) {
      if (!r.ok) { notice('Could not load the content.', true); return; }
      state.loaded = r.data.content;
      state.content = clone(r.data.content);
      state.version = r.data.version;
      state.updatedAt = r.data.updatedAt;
      state.updatedBy = r.data.updatedBy;
    });
  }

  function refreshBadge() {
    api('GET', '/api/admin/leads?limit=1').then(function (r) {
      var badge = $('leadsBadge');
      if (!r.ok) return;
      badge.textContent = String(r.data.newCount);
      badge.hidden = !r.data.newCount;
    });
  }

  /* ---------- routing ---------- */

  function dirtyPaths() {
    if (!state.loaded || !state.content) return [];
    var all = leaves(state.loaded), out = [];
    for (var i = 0; i < all.length; i++) if (get(state.loaded, all[i]) !== get(state.content, all[i])) out.push(all[i]);
    return out;
  }

  var lastRoute = null;
  function route() {
    var name = (location.hash || '#overview').slice(1);
    var known = ['overview', 'pricing', 'text', 'leads', 'history', 'settings'];
    if (known.indexOf(name) < 0) name = 'overview';
    if (lastRoute && lastRoute !== name && (lastRoute === 'pricing' || lastRoute === 'text') && dirtyPaths().length) {
      if (!window.confirm('You have unsaved changes. Leave without saving?')) { location.hash = '#' + lastRoute; return; }
      state.content = clone(state.loaded);
    }
    lastRoute = name;
    state.route = name;
    var sections = document.querySelectorAll('section[data-section]');
    for (var i = 0; i < sections.length; i++) sections[i].hidden = sections[i].id !== name;
    var links = document.querySelectorAll('#nav a');
    for (var j = 0; j < links.length; j++) links[j].classList.toggle('active', links[j].getAttribute('data-route') === name);
    ({ overview: renderOverview, pricing: renderPricing, text: renderText, leads: loadLeads, history: renderHistory, settings: renderSettings })[name]();
  }

  window.addEventListener('beforeunload', function (e) { if (dirtyPaths().length) { e.preventDefault(); e.returnValue = ''; } });

  /* ---------- overview ---------- */

  function renderOverview() {
    var body = clear($('overviewBody'));
    var dl = el('dl', { class: 'facts' });
    dl.appendChild(el('dt', { text: 'Live content' }));
    dl.appendChild(el('dd', { text: 'Version ' + state.version + ', saved ' + fmtDate(state.updatedAt) + ' by ' + (state.updatedBy || 'system') + '.' }));
    dl.appendChild(el('dt', { text: 'Website refresh' }));
    dl.appendChild(el('dd', { text: 'Visitors see a change within a minute of saving. The site also carries a built-in copy of the content in case this server is off; see Settings to keep it in step.' }));
    dl.appendChild(el('dt', { text: 'Address the website reads from' }));
    dl.appendChild(el('dd', { text: location.origin + '  (set this as the API_URL variable of the website repository)' }));
    var leadsDt = el('dt', { text: 'Leads' });
    var leadsDd = el('dd', { text: 'Loading…' });
    dl.appendChild(leadsDt); dl.appendChild(leadsDd);
    body.appendChild(dl);
    var statuses = Object.keys(STATUS_LABELS);
    Promise.all(statuses.map(function (s) { return api('GET', '/api/admin/leads?limit=1&status=' + encodeURIComponent(s)); })).then(function (rs) {
      var parts = [], total = 0;
      for (var i = 0; i < rs.length; i++) if (rs[i].ok) { total += rs[i].data.total; if (rs[i].data.total) parts.push(rs[i].data.total + ' ' + STATUS_LABELS[statuses[i]].toLowerCase()); }
      leadsDd.textContent = total ? total + ' in total: ' + parts.join(', ') + '.' : 'No enquiries received yet.';
    });
  }

  /* ---------- pricing editor ---------- */

  function numericPathsUnder(prefix) {
    return leaves(state.content).filter(function (p) { return p.indexOf(prefix) === 0 && typeof get(state.content, p) === 'number'; });
  }

  function parseNumber(raw, path) {
    var s = String(raw).replace(/[\s$,]/g, '');
    if (s === '') return { error: 'Enter a number' };
    if (!/^\d+(\.\d+)?$/.test(s)) return { error: 'Enter a number, digits only' };
    var n = Number(s);
    var key = path.split('.').pop();
    if (DECIMAL_KEYS[key]) { if (Math.round(n * 100) / 100 !== n) return { error: 'At most two decimal places' }; }
    else if (!Number.isInteger(n)) return { error: 'Whole dollars only' };
    return { value: n };
  }

  function pricingWarnings(content) {
    var w = {};
    function add(path, text, fix) { (w[path] = w[path] || []).push({ text: text, fix: fix }); }
    var paths = leaves(content).filter(function (p) { return p.indexOf('pricing.') === 0 && typeof get(content, p) === 'number'; });
    for (var i = 0; i < paths.length; i++) {
      var p = paths[i], f = FIELDS[p] || {}, v = get(content, p);
      if (f.kind === 'price' && !f.exempt && v !== 0 && Number.isInteger(v) && v % 100 !== 0) add(p, money(v) + ' does not end in 00. ArchonX prices end in 00.');
    }
    var inds = content.pricing.industries, packs = content.pricing.packs;
    var minSetup = Infinity, minOwn = Infinity;
    for (var k in inds) if (Object.prototype.hasOwnProperty.call(inds, k)) { minSetup = Math.min(minSetup, inds[k].setup); minOwn = Math.min(minOwn, inds[k].own); }
    if (packs.front.setup !== minSetup) add('pricing.packs.front.setup', 'The page says "from ' + money(packs.front.setup) + '" but the lowest industry setup is ' + money(minSetup) + '.', { path: 'pricing.packs.front.setup', value: minSetup });
    if (packs.front.own !== minOwn) add('pricing.packs.front.own', 'The page says "from ' + money(packs.front.own) + '" but the lowest industry own price is ' + money(minOwn) + '.', { path: 'pricing.packs.front.own', value: minOwn });
    for (var j = 0; j < PAIRS.length; j++) {
      var a = inds[PAIRS[j][0]], b = inds[PAIRS[j][1]];
      if (!a || !b) continue;
      ['setup', 'own'].forEach(function (field) {
        if (a[field] !== b[field]) {
          var msg = a.name + ' and ' + b.name + ' differ on ' + field + ' (' + money(a[field]) + ' vs ' + money(b[field]) + '). The pricing page pairs them in one sentence: "from … with ' + PAIRS[j][2] + '".';
          add('pricing.industries.' + PAIRS[j][0] + '.' + field, msg);
          add('pricing.industries.' + PAIRS[j][1] + '.' + field, msg);
        }
      });
    }
    return w;
  }

  var fieldErrors = {};

  function shownLine(path, v) {
    var f = FIELDS[path] || {};
    if (f.kind === 'count') return String(v);
    if (f.kind === 'cost') return 'about ' + money(v) + (f.unit ? ' ' + f.unit : '') + ', billed by the provider (estimate)';
    var line = money(v) + (f.unit ? ' ' + f.unit : '') + ' + GST';
    if (Number.isInteger(v)) line += ' · ' + gst(v) + ' including GST';
    return line;
  }

  function renderPricing() {
    var body = clear($('pricingBody'));
    if (!state.content) return;
    var warnings = pricingWarnings(state.content);
    for (var g = 0; g < PRICING_GROUPS.length; g++) {
      var group = el('div', { class: 'group' });
      group.appendChild(el('h2', { text: PRICING_GROUPS[g][0] }));
      var paths = numericPathsUnder(PRICING_GROUPS[g][1]);
      for (var i = 0; i < paths.length; i++) group.appendChild(numberField(paths[i], warnings[paths[i]] || []));
      body.appendChild(group);
    }
    updateSavebar('pricing');
  }

  function numberField(path, warns) {
    var f = FIELDS[path] || { label: path, unit: '', kind: 'price', shownAs: '' };
    var v = get(state.content, path);
    var id = 'f_' + path.replace(/\./g, '_');
    var wrap = el('div', { class: 'field' });
    wrap.appendChild(el('label', { for: id, text: f.label }));
    var input = el('input', { id: id, type: 'text', inputmode: 'decimal', autocomplete: 'off', value: String(v) });
    var row = el('div', { class: 'row' }, [f.kind === 'count' ? null : el('span', { class: 'prefix', text: '$' }), input, f.unit ? el('span', { class: 'unit', text: f.unit }) : null]);
    wrap.appendChild(row);
    var shown = el('p', { class: 'shown', text: 'Shown on the site as: ' + shownLine(path, v) });
    wrap.appendChild(shown);
    if (f.shownAs) wrap.appendChild(el('p', { class: 'where', text: f.shownAs }));
    var errLine = el('p', { class: 'err', hidden: !fieldErrors[path], text: fieldErrors[path] || '' });
    wrap.appendChild(errLine);
    for (var i = 0; i < warns.length; i++) {
      var w = el('p', { class: 'warn', text: warns[i].text });
      if (warns[i].fix) {
        var btn = el('button', { type: 'button', class: 'btn small', text: 'Set from industries' });
        btn.addEventListener('click', (function (fix) { return function () { set(state.content, fix.path, fix.value); renderPricing(); }; })(warns[i].fix));
        w.appendChild(btn);
      }
      wrap.appendChild(w);
    }
    input.addEventListener('input', function () {
      var r = parseNumber(input.value, path);
      if (r.error) { fieldErrors[path] = r.error; errLine.textContent = r.error; errLine.hidden = false; updateSavebar('pricing'); return; }
      delete fieldErrors[path];
      errLine.hidden = true;
      set(state.content, path, r.value);
      shown.textContent = 'Shown on the site as: ' + shownLine(path, r.value);
      updateSavebar('pricing');
    });
    input.addEventListener('change', function () { if (!fieldErrors[path]) renderPricing(); });
    return wrap;
  }

  function updateSavebar(section) {
    var bar = $(section).querySelector('[data-savebar]');
    var n = dirtyPaths().length;
    var errs = Object.keys(fieldErrors).length;
    bar.querySelector('[data-count]').textContent = errs ? 'Fix the highlighted fields first.' : n ? n + ' unsaved change' + (n === 1 ? '' : 's') : 'No unsaved changes';
    bar.querySelector('[data-save]').disabled = !n || errs > 0;
    bar.querySelector('[data-discard]').disabled = !n && !errs;
  }

  function discard() {
    state.content = clone(state.loaded);
    fieldErrors = {};
    if (state.route === 'pricing') renderPricing(); else renderText();
  }

  function saveFlow() {
    var changed = dirtyPaths();
    if (!changed.length) return;
    var pricingChanged = changed.some(function (p) { return p.indexOf('pricing.') === 0; });
    var body = el('div');
    var list = el('ul', { class: 'changes' });
    for (var i = 0; i < changed.length; i++) list.appendChild(el('li', { text: labelFor(changed[i]) + ': ' + fmtValue(changed[i], get(state.loaded, changed[i])) + ' → ' + fmtValue(changed[i], get(state.content, changed[i])) }));
    body.appendChild(list);
    var warnMap = pricingWarnings(state.content), seen = {}, warnList = el('ul', { class: 'warnings' });
    for (var p in warnMap) if (Object.prototype.hasOwnProperty.call(warnMap, p)) for (var j = 0; j < warnMap[p].length; j++) { var t = warnMap[p][j].text; if (!seen[t]) { seen[t] = true; warnList.appendChild(el('li', { text: t })); } }
    if (warnList.childNodes.length) { body.appendChild(el('p', { text: 'Warnings (you can still save):' })); body.appendChild(warnList); }
    var dateBox = null;
    if (pricingChanged && get(state.content, 'text.pricesCorrectAt') !== todayLocal()) {
      dateBox = el('input', { type: 'checkbox', checked: true });
      body.appendChild(el('label', { class: 'inline' }, [dateBox, "Set 'prices correct at' to today (" + todayLocal() + ')']));
    }
    confirmDialog('Save ' + changed.length + ' change' + (changed.length === 1 ? '' : 's') + '?', body, 'Save').then(function (ok) {
      if (!ok) return;
      if (dateBox && dateBox.checked) set(state.content, 'text.pricesCorrectAt', todayLocal());
      var summary = 'Changed ' + changed.map(labelFor).join(', ');
      return api('PUT', '/api/admin/content', { content: state.content, expectedVersion: state.version, summary: summary.slice(0, 200) }).then(function (r) {
        if (r.status === 409) { notice('Someone else saved the content since you loaded it. Your changes were not saved; the latest version has been loaded.', true); return loadContent().then(function () { fieldErrors = {}; route(); }); }
        if (r.status === 400 && r.data.errors) {
          fieldErrors = {};
          for (var k = 0; k < r.data.errors.length; k++) fieldErrors[r.data.errors[k].path] = r.data.errors[k].message;
          notice('Some fields were not accepted. Fix the highlighted fields and save again.', true);
          if (state.route === 'pricing') renderPricing(); else renderText();
          return;
        }
        if (!r.ok) { notice('Saving failed (' + r.status + '). Try again.', true); return; }
        var msg = el('span');
        msg.appendChild(document.createTextNode('Saved as version ' + r.data.version + '. '));
        var a = el('a', { href: LIVE_PAGE, target: '_blank', rel: 'noopener', text: 'Open the live page' });
        msg.appendChild(a);
        msg.appendChild(document.createTextNode(' (it may take up to a minute to update).'));
        notice(msg);
        return loadContent().then(function () { fieldErrors = {}; refreshBadge(); route(); });
      });
    });
  }

  /* ---------- text editor ---------- */

  function renderText() {
    var body = clear($('textBody'));
    if (!state.content) return;
    for (var i = 0; i < TEXT_FIELDS.length; i++) body.appendChild(textField(TEXT_FIELDS[i]));
    var email = el('div', { class: 'field textfield' });
    email.appendChild(el('label', { for: 'f_text_email', text: 'Contact email' }));
    email.appendChild(el('input', { id: 'f_text_email', type: 'text', readonly: 'readonly', value: get(state.content, 'text.email') }));
    email.appendChild(el('p', { class: 'where', text: 'Changed by the developer: the address appears in links and scripts across the site.' }));
    body.appendChild(email);
    updateSavebar('text');
  }

  function textField(def) {
    var path = def[0], label = def[1], where = def[2], type = def[3] || 'text';
    var id = 'f_' + path.replace(/\./g, '_');
    var wrap = el('div', { class: 'field textfield' });
    wrap.appendChild(el('label', { for: id, text: label }));
    var input = el('input', { id: id, type: type, autocomplete: 'off', value: String(get(state.content, path)) });
    if (type === 'text') input.setAttribute('maxlength', '500');
    wrap.appendChild(input);
    wrap.appendChild(el('p', { class: 'where', text: where }));
    var errLine = el('p', { class: 'err', hidden: !fieldErrors[path], text: fieldErrors[path] || '' });
    wrap.appendChild(errLine);
    input.addEventListener('input', function () {
      var v = input.value;
      var error = null;
      if (/[<>]/.test(v)) error = 'No < or > characters';
      else if (type === 'date' && v && !/^\d{4}-\d{2}-\d{2}$/.test(v)) error = 'Enter a date';
      else if (!v.trim() && path !== 'text.location') error = 'Enter some text';
      if (error) { fieldErrors[path] = error; errLine.textContent = error; errLine.hidden = false; }
      else { delete fieldErrors[path]; errLine.hidden = true; set(state.content, path, v); }
      updateSavebar('text');
    });
    return wrap;
  }

  /* ---------- leads ---------- */

  function leadQuery() {
    var form = $('leadFilters');
    var q = [];
    ['status', 'kind', 'q'].forEach(function (k) { var v = form.elements[k].value.trim(); if (v) q.push(k + '=' + encodeURIComponent(v)); });
    return q;
  }

  function loadLeads(offset) {
    state.leads.offset = offset || 0;
    var q = leadQuery();
    $('leadsCsv').href = '/api/admin/leads/export.csv' + (q.length ? '?' + q.join('&') : '');
    q.push('limit=' + state.leads.limit, 'offset=' + state.leads.offset);
    api('GET', '/api/admin/leads?' + q.join('&')).then(function (r) {
      if (!r.ok) { notice('Could not load the leads.', true); return; }
      state.leads.items = r.data.items; state.leads.total = r.data.total;
      $('leadsBadge').textContent = String(r.data.newCount); $('leadsBadge').hidden = !r.data.newCount;
      renderLeads();
    });
  }

  function renderLeads() {
    var body = clear($('leadsBody'));
    if (!state.leads.items.length) { body.appendChild(el('p', { class: 'muted', text: state.leads.total ? 'No leads on this page.' : 'No leads match. Enquiries from the consulting page appear here the moment they are sent.' })); return; }
    var table = el('table');
    var head = el('tr');
    ['Received', 'Kind', 'Name', 'Business', 'Email', 'Mobile', 'Status'].forEach(function (h) { head.appendChild(el('th', { text: h })); });
    table.appendChild(el('thead', null, [head]));
    var tbody = el('tbody');
    state.leads.items.forEach(function (item) {
      var tr = el('tr', { class: 'clickable', tabindex: '0' });
      [fmtDate(item.createdAt), item.kind, item.summary.name, item.summary.business, item.summary.email, item.summary.mobile, STATUS_LABELS[item.status] || item.status].forEach(function (v, i) { tr.appendChild(el('td', { class: i === 0 ? 'num' : '', text: v || '' })); });
      tr.addEventListener('click', function () { openLead(item.id); });
      tr.addEventListener('keydown', function (e) { if (e.key === 'Enter') openLead(item.id); });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    body.appendChild(el('div', { class: 'table-wrap' }, [table]));
    var pager = el('div', { class: 'pager' });
    var from = state.leads.offset + 1, to = Math.min(state.leads.total, state.leads.offset + state.leads.items.length);
    pager.appendChild(el('span', { text: from + ' to ' + to + ' of ' + state.leads.total }));
    var prev = el('button', { type: 'button', class: 'btn small', text: 'Previous', disabled: state.leads.offset === 0 });
    var next = el('button', { type: 'button', class: 'btn small', text: 'Next', disabled: to >= state.leads.total });
    prev.addEventListener('click', function () { loadLeads(Math.max(0, state.leads.offset - state.leads.limit)); });
    next.addEventListener('click', function () { loadLeads(state.leads.offset + state.leads.limit); });
    pager.appendChild(prev); pager.appendChild(next);
    body.appendChild(pager);
  }

  function flatten(obj, prefix, out) {
    for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) {
      var p = prefix ? prefix + ' › ' + k : k, v = obj[k];
      if (isPlain(v)) flatten(v, p, out);
      else out.push([p, Array.isArray(v) ? v.map(function (x) { return isPlain(x) ? JSON.stringify(x) : String(x); }).join('; ') : v === null ? '' : String(v)]);
    }
    return out;
  }

  var currentLead = null;
  function openLead(id) {
    api('GET', '/api/admin/leads/' + id).then(function (r) {
      if (!r.ok) { notice('Could not load that lead.', true); return; }
      currentLead = r.data;
      var dlg = $('leadDialog');
      $('leadTitle').textContent = (r.data.summary.name || 'Lead') + (r.data.summary.business ? ' · ' + r.data.summary.business : '');
      var body = clear($('leadBody'));
      var dl = el('dl', { class: 'kv' });
      dl.appendChild(el('dt', { text: 'Received' })); dl.appendChild(el('dd', { text: fmtDate(r.data.createdAt) + ' · ' + r.data.kind + (r.data.page ? ' · ' + r.data.page : '') }));
      flatten(r.data.payload, '', []).forEach(function (pair) { dl.appendChild(el('dt', { text: pair[0] })); dl.appendChild(el('dd', { text: pair[1] })); });
      body.appendChild(dl);
      body.appendChild(el('label', { for: 'leadStatusSel', text: 'Status' }));
      var sel = el('select', { id: 'leadStatusSel' });
      Object.keys(STATUS_LABELS).forEach(function (s) { var o = el('option', { value: s, text: STATUS_LABELS[s] }); if (s === r.data.status) o.selected = true; sel.appendChild(o); });
      body.appendChild(sel);
      body.appendChild(el('label', { for: 'leadNotes', text: 'Notes' }));
      body.appendChild(el('textarea', { id: 'leadNotes', maxlength: '5000', value: r.data.notes || '' }));
      dlg.showModal();
    });
  }

  function saveLead() {
    if (!currentLead) return;
    api('PATCH', '/api/admin/leads/' + currentLead.id, { status: $('leadStatusSel').value, notes: $('leadNotes').value }).then(function (r) {
      if (!r.ok) { notice('Could not save the lead.', true); return; }
      $('leadDialog').close();
      notice('Lead updated.');
      loadLeads(state.leads.offset);
    });
  }

  function deleteLead() {
    if (!currentLead) return;
    var id = currentLead.id;
    $('leadDialog').close();
    confirmDialog('Delete this lead?', el('p', { text: 'This removes the enquiry permanently. There is no undo.' }), 'Delete').then(function (ok) {
      if (!ok) return;
      api('DELETE', '/api/admin/leads/' + id).then(function (r) {
        if (!r.ok) { notice('Could not delete the lead.', true); return; }
        notice('Lead deleted.');
        loadLeads(state.leads.offset);
      });
    });
  }

  /* ---------- history ---------- */

  function renderHistory() {
    var body = clear($('historyBody'));
    clear($('historyDiff'));
    api('GET', '/api/admin/content/versions').then(function (r) {
      if (!r.ok) { notice('Could not load the history.', true); return; }
      var ul = el('ul', { class: 'plain' });
      r.data.forEach(function (v) {
        var row = el('div', { class: 'version-row' });
        row.appendChild(el('strong', { text: 'Version ' + v.version + (v.version === state.version ? ' (live)' : '') }));
        row.appendChild(el('span', { class: 'meta', text: fmtDate(v.createdAt) + ' · ' + (v.createdBy || 'system') + (v.summary ? ' · ' + v.summary : '') }));
        var view = el('button', { type: 'button', class: 'btn small', text: 'View' });
        view.addEventListener('click', function () { viewVersion(v.version); });
        row.appendChild(view);
        if (v.version !== state.version) {
          var restore = el('button', { type: 'button', class: 'btn small', text: 'Restore' });
          restore.addEventListener('click', function () { restoreVersion(v.version); });
          row.appendChild(restore);
        }
        ul.appendChild(el('li', null, [row]));
      });
      body.appendChild(ul);
    });
    api('GET', '/api/admin/audit-log?limit=60').then(function (r) {
      var act = clear($('activityBody'));
      if (!r.ok) return;
      if (!r.data.length) { act.appendChild(el('p', { class: 'muted', text: 'Nothing yet.' })); return; }
      var ul = el('ul', { class: 'plain' });
      r.data.forEach(function (row) {
        var li = el('li');
        li.appendChild(el('span', { class: 'when', text: fmtDate(row.at) }));
        li.appendChild(document.createTextNode((row.adminEmail || 'system') + ' · ' + row.action.replace(/_/g, ' ')));
        if (row.detail) li.appendChild(el('span', { class: 'detail', text: describeDetail(row.detail) }));
        ul.appendChild(li);
      });
      act.appendChild(ul);
    });
  }

  function describeDetail(detail) {
    try {
      var d = JSON.parse(detail);
      if (d && d.paths) return d.paths.map(labelFor).join(', ');
      if (d && d.from !== undefined && d.to !== undefined) return 'lead ' + d.id + ': ' + d.from + ' → ' + d.to;
      if (d && d.id !== undefined) return 'lead ' + d.id;
      if (d && d.email) return d.email;
      if (d && d.ip) return '';
      return '';
    } catch (e) { return detail; }
  }

  function diffList(fromContent, toContent, fromLabel, toLabel) {
    var paths = leaves(toContent), ul = el('ul', { class: 'changes' }), n = 0;
    paths.forEach(function (p) {
      var a = get(fromContent, p), b = get(toContent, p);
      if (a === b) return;
      n++;
      ul.appendChild(el('li', { text: labelFor(p) + ': ' + fmtValue(p, a) + ' (' + fromLabel + ') → ' + fmtValue(p, b) + ' (' + toLabel + ')' }));
    });
    if (!n) ul.appendChild(el('li', { text: 'Identical to what is live now.' }));
    return ul;
  }

  function viewVersion(version) {
    api('GET', '/api/admin/content/versions/' + version).then(function (r) {
      if (!r.ok) { notice('Could not load that version.', true); return; }
      var box = clear($('historyDiff'));
      box.appendChild(el('h3', { text: 'Version ' + version + ' compared with what is live now' }));
      box.appendChild(diffList(state.loaded, r.data.content, 'live', 'version ' + version));
    });
  }

  function restoreVersion(version) {
    api('GET', '/api/admin/content/versions/' + version).then(function (r) {
      if (!r.ok) { notice('Could not load that version.', true); return; }
      var body = el('div');
      body.appendChild(el('p', { text: 'Restoring creates a new version with these values:' }));
      body.appendChild(diffList(state.loaded, r.data.content, 'live', 'restored'));
      confirmDialog('Restore version ' + version + '?', body, 'Restore').then(function (ok) {
        if (!ok) return;
        api('POST', '/api/admin/content/versions/' + version + '/restore').then(function (r2) {
          if (!r2.ok) { notice('Restore failed.', true); return; }
          notice('Restored version ' + version + ' as version ' + r2.data.version + '.');
          loadContent().then(renderHistory);
        });
      });
    });
  }

  /* ---------- settings ---------- */

  function renderSettings() {
    api('GET', '/api/admin/admins').then(function (r) {
      var box = clear($('adminsBody'));
      if (!r.ok) return;
      var ul = el('ul', { class: 'plain' });
      r.data.forEach(function (a) { ul.appendChild(el('li', { text: a.email + (a.lastLoginAt ? ' · last signed in ' + fmtDate(a.lastLoginAt) : ' · has not signed in yet') + (a.mustChangePassword ? ' · must change password' : '') })); });
      box.appendChild(ul);
    });
    api('GET', '/api/admin/content/drift').then(function (r) {
      var line = $('driftLine'), list = clear($('driftList'));
      if (!r.ok) return;
      var n = r.data.behind.length;
      line.textContent = n ? "The website's built-in fallback is " + n + ' field' + (n === 1 ? '' : 's') + ' behind the live content.' : "The website's built-in fallback matches the live content.";
      r.data.behind.forEach(function (p) { list.appendChild(el('li', { text: labelFor(p) })); });
    });
  }

  function formError(form, message) {
    var line = form.querySelector('[data-error]');
    line.textContent = message || '';
    line.hidden = !message;
  }

  function changePassword(form, afterGate) {
    formError(form, '');
    var current = form.elements.currentPassword.value, next = form.elements.newPassword.value, again = form.elements.confirmPassword.value;
    if (next !== again) { formError(form, 'The new passwords do not match.'); return; }
    if (next.length < 12) { formError(form, 'The new password must be at least 12 characters.'); return; }
    api('POST', '/api/admin/password', { currentPassword: current, newPassword: next }).then(function (r) {
      if (r.status === 400 && r.data.errors) { formError(form, r.data.errors.map(function (e) { return e.message; }).join(' ')); return; }
      if (!r.ok) { formError(form, 'Could not change the password (' + r.status + ').'); return; }
      form.reset();
      if (afterGate) { state.me.mustChangePassword = false; loadContent().then(function () { showGate(false); refreshBadge(); notice('Password changed. Welcome.'); }); }
      else notice('Password changed. Other devices have been signed out.');
    });
  }

  function addAdmin(form) {
    formError(form, '');
    api('POST', '/api/admin/admins', { email: form.elements.email.value, temporaryPassword: form.elements.temporaryPassword.value }).then(function (r) {
      if (r.status === 400 && r.data.errors) { formError(form, r.data.errors.map(function (e) { return e.message; }).join(' ')); return; }
      if (!r.ok) { formError(form, 'Could not add the login (' + r.status + ').'); return; }
      form.reset();
      notice('Login added for ' + r.data.email + '. They must change the temporary password at first sign-in.');
      renderSettings();
    });
  }

  /* ---------- wiring ---------- */

  window.addEventListener('hashchange', route);
  $('signOut').addEventListener('click', function () { api('POST', '/api/admin/logout').then(function () { location.replace('/admin/login'); }); });
  $('gateForm').addEventListener('submit', function (e) { e.preventDefault(); changePassword(e.target, true); });
  $('pwForm').addEventListener('submit', function (e) { e.preventDefault(); changePassword(e.target, false); });
  $('addAdminForm').addEventListener('submit', function (e) { e.preventDefault(); addAdmin(e.target); });
  $('revokeAll').addEventListener('click', function () {
    confirmDialog('Sign out everywhere?', el('p', { text: 'Every device, including this one, will be signed out.' }), 'Sign out everywhere').then(function (ok) {
      if (ok) api('POST', '/api/admin/sessions/revoke-all').then(function () { location.replace('/admin/login'); });
    });
  });
  $('leadFilters').addEventListener('submit', function (e) { e.preventDefault(); loadLeads(0); });
  $('leadClose').addEventListener('click', function () { $('leadDialog').close(); });
  $('leadSave').addEventListener('click', saveLead);
  $('leadDelete').addEventListener('click', deleteLead);
  var bars = document.querySelectorAll('[data-savebar]');
  for (var b = 0; b < bars.length; b++) {
    bars[b].querySelector('[data-save]').addEventListener('click', saveFlow);
    bars[b].querySelector('[data-discard]').addEventListener('click', discard);
  }

  boot();
})();
