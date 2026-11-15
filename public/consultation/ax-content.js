/* ArchonX site content loader for the static pages (/consultation/ and the fact sheet).
   - Ships the committed defaults (content/site-content.json, injected between the markers
     below by scripts/sync-content.mjs; do not edit the JSON by hand here).
   - Fetches the live content from the admin backend when an API URL is configured, merges it
     over the defaults, and re-applies every [data-p] binding on the page.
   - Exposes window.AX for the page scripts: AX.content, AX.get(path), AX.money(n), AX.gst(n),
     AX.apply(root), AX.onUpdate(fn), AX.ready (a promise), AX.api (base URL or ''),
     AX.postLead(kind, payload).
   The page must render correctly from the defaults alone: the API is an override, never a
   dependency. */
(function () {
  'use strict';
  var DEFAULTS = /*AX_DEFAULTS_START*/{"version":1,"pricing":{"packs":{"front":{"name":"Front Desk","monthly":400,"setup":1500,"own":3900},"back":{"name":"Back Office","monthly":800,"setup":4000,"own":8800},"whole":{"name":"Whole Shop","monthly":1200,"setup":6900,"own":14100}},"industries":{"trades":{"name":"Trades","setup":1500,"own":3900},"dental":{"name":"Dental and allied health","setup":2000,"own":4400},"realestate":{"name":"Real estate and property management","setup":1800,"own":4200},"accounting":{"name":"Accounting and bookkeeping","setup":1500,"own":3900},"legal":{"name":"Legal","setup":2000,"own":4400},"hospitality":{"name":"Hospitality","setup":1500,"own":3900},"retail":{"name":"Retail","setup":1500,"own":3900},"salons":{"name":"Barbershops and salons","setup":1500,"own":3900},"automotive":{"name":"Automotive workshops","setup":1700,"own":4100},"cleaning":{"name":"Cleaning services","setup":1500,"own":3900},"gyms":{"name":"Gyms and fitness studios","setup":1700,"own":4100},"logistics":{"name":"Freight, logistics and warehousing","setup":1800,"own":4200}},"frontDesk":{"receptionist":{"monthly":300,"setup":500,"ownFrom":2900,"includedMinutes":300,"extraMinute":0.35},"chat":{"monthly":200,"setup":500,"includedConversations":500,"extraConversation":0.2},"leadFollowUp":{"monthly":200,"setup":500,"smsCost":0.1},"reviews":{"monthly":100}},"backOffice":{"inbox":{"monthly":500,"setup":1000},"quotesInvoices":{"from":1900},"meetings":{"monthly":100,"setup":500},"content":{"monthly":200,"setup":700}},"builds":{"workflow":{"from":2900,"multiSystemFrom":9000,"toolsLow":50,"toolsHigh":150},"documents":{"from":7500,"monthly":300},"pilot":{"upTo20":5900,"upTo50":8900},"takeover":{"from":1000}},"advice":{"audit":{"fixed":1000},"governance":{"from":1500},"training":{"perSeatFrom":300,"teamDay":1500,"buildDay":3900,"policyMorning":500},"carePlan":{"light":200,"standard":500,"full":1000}},"app":{"review":2900,"launch":10000,"care":500,"careAdvisor":1000,"hourly":200,"prepaidBlock":1500},"engineer":{"twoWeekSystem":10000,"fourWeekBuild":20000,"embeddedTwoDays":8800,"embeddedThreeDays":12900},"extras":{"extraMinutes500":200,"phoneNumberMonthly":15,"frontDeskExtrasLow":20,"frontDeskExtrasHigh":80,"providerCostsLow":60,"providerCostsHigh":250},"bluework":{"perEmployeeMonthly":8,"minimumEmployees":4}},"text":{"announcement":"Free AI audit for Australian businesses, with one free build:","announcementLink":"see your result in two minutes","opening":"We turn the latest AI into working systems inside your business.","openingSub":"One job first, a person approving anything that matters, and everything built in your name.","email":"hello@archonx.ai","hours":"Monday to Friday 8am to 6pm AEST","location":"Brisbane, working across Australia","pricesCorrectAt":"2026-11-02"},"home":{"doctrineQuote":"AI does the repetitive work.","doctrineQuoteEmphasis":"People make the decisions"}}/*AX_DEFAULTS_END*/;
  var API_URL = /*AX_API_URL_START*/''/*AX_API_URL_END*/;

  var meta = document.querySelector('meta[name="ax-api"]');
  if (meta && meta.content) API_URL = meta.content;
  if (window.AX_API_URL) API_URL = window.AX_API_URL;
  API_URL = String(API_URL || '').replace(/\/+$/, '');

  function isObj(v) { return v && typeof v === 'object' && !Array.isArray(v); }
  function merge(base, over) {
    if (!isObj(base) || !isObj(over)) return over === undefined ? base : over;
    var out = {};
    Object.keys(base).forEach(function (k) { out[k] = base[k]; });
    Object.keys(over).forEach(function (k) { out[k] = isObj(base[k]) && isObj(over[k]) ? merge(base[k], over[k]) : over[k]; });
    return out;
  }
  function get(path, obj) {
    var cur = obj || AX.content;
    var parts = String(path).split('.');
    for (var i = 0; i < parts.length; i++) { if (cur == null) return undefined; cur = cur[parts[i]]; }
    return cur;
  }
  function money(n) {
    n = Number(n);
    if (!isFinite(n)) return '';
    var dp = Number.isInteger(n) ? 0 : 2;
    return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: dp, maximumFractionDigits: dp });
  }
  function gst(n) {
    return '$' + (Math.round(Number(n) * 110) / 100).toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }
  function fmtDate(iso) {
    var d = new Date(iso + (String(iso).length === 10 ? 'T00:00:00' : ''));
    if (isNaN(d)) return String(iso || '');
    return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  /* Formats: money (default), gst, plain (text as-is), date, int (no $). A missing value leaves the element untouched. */
  function apply(root) {
    var nodes = (root || document).querySelectorAll('[data-p]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var v = get(el.getAttribute('data-p'));
      if (v === undefined || v === null) continue;
      var f = el.getAttribute('data-fmt') || 'money';
      var text = f === 'gst' ? gst(v) : f === 'plain' ? String(v) : f === 'date' ? fmtDate(v) : f === 'int' ? Number(v).toLocaleString('en-AU') : money(v);
      if (el.textContent !== text) el.textContent = text;
    }
  }

  var listeners = [];
  var AX = {
    defaults: DEFAULTS,
    content: DEFAULTS,
    api: API_URL,
    live: false,
    get: get,
    money: money,
    gst: gst,
    fmtDate: fmtDate,
    apply: apply,
    onUpdate: function (fn) { listeners.push(fn); if (AX.live) { try { fn(AX.content); } catch (e) {} } },
    postLead: function (kind, payload) {
      if (!API_URL || !window.fetch) return Promise.resolve(false);
      return fetch(API_URL + '/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ kind: kind, payload: payload, page: location.pathname, submittedAt: new Date().toISOString() })
      }).then(function (res) {
        if (!res.ok) throw { code: 'send_failed', status: res.status };
        return true;
      });
    }
  };
  window.AX = AX;

  function applyAll() {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { apply(); });
    else apply();
  }
  applyAll();

  AX.ready = (function () {
    if (!API_URL || !window.fetch) return Promise.resolve(AX.content);
    var ctl = window.AbortController ? new AbortController() : null;
    var timer = ctl ? setTimeout(function () { ctl.abort(); }, 6000) : null;
    return fetch(API_URL + '/api/content', { signal: ctl ? ctl.signal : undefined, headers: { Accept: 'application/json' } })
      .then(function (res) { if (!res.ok) throw new Error('content ' + res.status); return res.json(); })
      .then(function (data) {
        var live = data && data.content ? data.content : data;
        if (!isObj(live)) throw new Error('content shape');
        AX.content = merge(DEFAULTS, live);
        AX.live = true;
        applyAll();
        listeners.forEach(function (fn) { try { fn(AX.content); } catch (e) { if (window.console) console.warn('AX.onUpdate', e); } });
        return AX.content;
      })
      .catch(function () { return AX.content; })
      .then(function (c) { if (timer) clearTimeout(timer); return c; });
  })();
})();
