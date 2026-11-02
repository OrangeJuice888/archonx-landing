// One-off refactor of the static consulting pages: binds every ArchonX price to the content file
// (data-p spans), marks external figures (data-market), loads the content loader in <head>,
// makes the inline scripts read prices from the content, removes the dead admin view, and
// sends leads to the admin backend as well as Web3Forms.
//
//   node scripts/refactor-bind-prices.mjs
//
// CRLF-safe. Line-based wraps run on the original line numbers first (they never add lines);
// the structural edits use split/join with exact-count assertions. Never String.replace with a
// replacement string containing "$".
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const LOADER_TAG = '<script src="/consultation/ax-content.js"></script>'

function open(rel) {
  const raw = readFileSync(resolve(root, rel), 'utf8')
  const crlf = raw.includes('\r\n')
  return { rel, crlf, lines: raw.replace(/\r\n/g, '\n').split('\n') }
}
function save(doc, text) {
  writeFileSync(resolve(root, doc.rel), doc.crlf ? text.replace(/\n/g, '\r\n') : text)
}
const span = (key, fmt, text) => `<span data-p="${key}"${fmt ? ` data-fmt="${fmt}"` : ''}>${text}</span>`

/** Wraps amounts on one line, in order of appearance. items: [amount, key, fmt?] or ['market', amount]. */
function bind(doc, lineNo, items) {
  const i = lineNo - 1
  let line = doc.lines[i]
  if (line === undefined) throw new Error(`${doc.rel}:${lineNo} does not exist`)
  let cursor = 0
  for (const item of items) {
    const market = item[0] === 'market'
    const amount = market ? item[1] : item[0]
    const idx = line.indexOf(amount, cursor)
    if (idx < 0) throw new Error(`${doc.rel}:${lineNo}: "${amount}" not found after column ${cursor}: ${line.slice(cursor, cursor + 160)}`)
    const after = line[idx + amount.length]
    if (after && /[0-9,]/.test(after) && !(after === ',' && !/[0-9]/.test(line[idx + amount.length + 1] || ''))) throw new Error(`${doc.rel}:${lineNo}: "${amount}" is a prefix of a longer amount`)
    const repl = market ? `<span data-market>${amount}</span>` : span(item[1], item[2], amount)
    line = line.slice(0, idx) + repl + line.slice(idx + amount.length)
    cursor = idx + repl.length
  }
  doc.lines[i] = line
}
/** Exact substring replacement on one line (must occur exactly once on that line). */
function sub(doc, lineNo, from, to) {
  const i = lineNo - 1
  const n = doc.lines[i].split(from).length - 1
  if (n !== 1) throw new Error(`${doc.rel}:${lineNo}: ${n} matches for "${from.slice(0, 80)}"`)
  doc.lines[i] = doc.lines[i].split(from).join(to)
}
/** Whole-text replacement with an exact match count. */
function rep(text, from, to, count = 1, label = '') {
  const n = text.split(from).length - 1
  if (n !== count) throw new Error(`${label}: ${n} matches (expected ${count}) for "${from.slice(0, 90)}"`)
  return text.split(from).join(to)
}

/* =====================================================================================
   index.html
   ===================================================================================== */
const page = open('public/consultation/index.html')
const P = 'pricing.'

// -- attribute amounts first (same lines are bound below; the attribute amounts must go)
sub(page, 977, 'data-prefill="App review ($2,900)"', 'data-prefill="App review"')
sub(page, 992, 'data-prefill="App review ($2,900)"', 'data-prefill="App review"')
sub(page, 978, 'data-prefill="App launch package ($10,000)"', 'data-prefill="App launch package"')
sub(page, 979, 'data-prefill="App care plan ($500 a month)"', 'data-prefill="App care plan"')

// -- text bindings
sub(page, 564, '<p>Free AI audit for Australian businesses, with one free build: <a href="#audit">see your result in two minutes</a></p>',
  `<p>${span('text.announcement', 'plain', 'Free AI audit for Australian businesses, with one free build:')} <a href="#audit" data-p="text.announcementLink" data-fmt="plain">see your result in two minutes</a></p>`)
sub(page, 602, '<p>We turn the latest AI into working systems inside your business. <span>One job first, a person approving anything that matters, and everything built in your name.</span></p>',
  `<p>${span('text.opening', 'plain', 'We turn the latest AI into working systems inside your business.')} ${span('text.openingSub', 'plain', 'One job first, a person approving anything that matters, and everything built in your name.')}</p>`)
sub(page, 1235, 'Monday to Friday 8am to 6pm AEST', span('text.hours', 'plain', 'Monday to Friday 8am to 6pm AEST'))
sub(page, 1264, 'Monday to Friday 8am to 6pm AEST', span('text.hours', 'plain', 'Monday to Friday 8am to 6pm AEST'))
sub(page, 1273, 'correct at 10 October 2026', `correct at ${span('text.pricesCorrectAt', 'date', '2 November 2026')}`)

// -- prose prices
bind(page, 700, [['$400', P + 'packs.front.monthly'], ['$1,500', P + 'packs.front.setup'], ['$3,900', P + 'packs.front.own']])
for (const [ln, amounts] of [[827, ['$300']], [828, ['$300', '$600']], [829, ['$600', '$1,000']], [830, ['$1,000', '$2,000']], [831, ['$2,000']], [838, ['$1,000']], [839, ['$1,000', '$3,000']], [840, ['$3,000', '$6,000']], [841, ['$6,000', '$12,000']], [842, ['$12,000']]]) bind(page, ln, amounts.map((a) => ['market', a]))
sub(page, 902, 'Includes 300 call minutes', `Includes ${span(P + 'frontDesk.receptionist.includedMinutes', 'int', '300')} call minutes`)
bind(page, 902, [['$300', P + 'frontDesk.receptionist.monthly'], ['$500', P + 'frontDesk.receptionist.setup'], ['$0.35', P + 'frontDesk.receptionist.extraMinute'], ['$15', P + 'extras.phoneNumberMonthly'], ['$2,900', P + 'frontDesk.receptionist.ownFrom']])
sub(page, 903, 'Includes 500 conversations', `Includes ${span(P + 'frontDesk.chat.includedConversations', 'int', '500')} conversations`)
bind(page, 903, [['$200', P + 'frontDesk.chat.monthly'], ['$500', P + 'frontDesk.chat.setup'], ['$0.20', P + 'frontDesk.chat.extraConversation']])
bind(page, 904, [['$200', P + 'frontDesk.leadFollowUp.monthly'], ['$500', P + 'frontDesk.leadFollowUp.setup'], ['$0.10', P + 'frontDesk.leadFollowUp.smsCost']])
bind(page, 905, [['$100', P + 'frontDesk.reviews.monthly']])
bind(page, 912, [['$500', P + 'backOffice.inbox.monthly'], ['$1,000', P + 'backOffice.inbox.setup']])
bind(page, 913, [['$1,900', P + 'backOffice.quotesInvoices.from']])
bind(page, 914, [['$100', P + 'backOffice.meetings.monthly'], ['$500', P + 'backOffice.meetings.setup']])
bind(page, 915, [['$200', P + 'backOffice.content.monthly'], ['$700', P + 'backOffice.content.setup']])
bind(page, 922, [['$2,900', P + 'builds.workflow.from'], ['$9,000', P + 'builds.workflow.multiSystemFrom'], ['$50', P + 'builds.workflow.toolsLow'], ['$150', P + 'builds.workflow.toolsHigh']])
bind(page, 923, [['$7,500', P + 'builds.documents.from'], ['$300', P + 'builds.documents.monthly']])
bind(page, 924, [['$2,900', P + 'builds.workflow.from'], ['$9,000', P + 'builds.workflow.multiSystemFrom'], ['$7,500', P + 'builds.documents.from'], ['$300', P + 'builds.documents.monthly']])
bind(page, 925, [['$5,900', P + 'builds.pilot.upTo20'], ['$8,900', P + 'builds.pilot.upTo50']])
bind(page, 926, [['$1,000', P + 'builds.takeover.from']])
bind(page, 933, [['$1,000', P + 'advice.audit.fixed']])
bind(page, 934, [['$1,500', P + 'advice.governance.from']])
bind(page, 935, [['$300', P + 'advice.training.perSeatFrom'], ['$1,500', P + 'advice.training.teamDay'], ['$3,900', P + 'advice.training.buildDay']])
bind(page, 936, [['$200', P + 'advice.carePlan.light'], ['$500', P + 'advice.carePlan.standard'], ['$1,000', P + 'advice.carePlan.full']])
bind(page, 940, [['$2,900', P + 'app.review'], ['$10,000', P + 'app.launch'], ['$500', P + 'app.care']])
bind(page, 963, [['market', '$56,600']])
bind(page, 977, [['$2,900', P + 'app.review'], ['$3,190', P + 'app.review', 'gst']])
bind(page, 978, [['$10,000', P + 'app.launch'], ['$11,000', P + 'app.launch', 'gst']])
bind(page, 979, [['$500', P + 'app.care'], ['$550', P + 'app.care', 'gst']])
bind(page, 981, [['$200', P + 'app.hourly'], ['$1,500', P + 'app.prepaidBlock'], ['$1,000', P + 'app.careAdvisor']])
bind(page, 1008, [['$10,000', P + 'engineer.twoWeekSystem']])
sub(page, 1008, '<td>Brisbane pilots', '<td data-market>Brisbane pilots')
bind(page, 1009, [['$20,000', P + 'engineer.fourWeekBuild']])
sub(page, 1009, '<td>Six-week fixed projects', '<td data-market>Six-week fixed projects')
bind(page, 1010, [['$8,800', P + 'engineer.embeddedTwoDays']])
sub(page, 1010, '<td>Part-time AI engineers', '<td data-market>Part-time AI engineers')
bind(page, 1011, [['$12,900', P + 'engineer.embeddedThreeDays']])
sub(page, 1011, '<td>Part-time AI engineers', '<td data-market>Part-time AI engineers')
sub(page, 1012, '<td>Embedded engineers', '<td data-market>Embedded engineers')
bind(page, 1013, [['$3,900', P + 'packs.front.own']])
bind(page, 1029, [['$1,500', P + 'advice.training.teamDay']])
bind(page, 1030, [['$500', P + 'advice.training.policyMorning']])
bind(page, 1032, [['$5,900', P + 'builds.pilot.upTo20']])
bind(page, 1038, [['market', '$17']])
bind(page, 1040, [['market', '$20,000'], ['market', '$60,000'], ['market', '$10']])
bind(page, 1041, [['market', '$50,000'], ['market', '$5,000'], ['market', '$100,000']])
bind(page, 1053, [['$1,000', P + 'advice.audit.fixed']])
bind(page, 1065, [['$400', P + 'packs.front.monthly'], ['$440', P + 'packs.front.monthly', 'gst']])
const INDUSTRY_LINES = [[1079, 'trades', '$1,500'], [1080, 'dental', '$2,000'], [1081, 'realestate', '$1,800'], [1082, 'accounting', '$1,500'], [1083, 'legal', '$2,000'], [1084, 'hospitality', '$1,500'], [1085, 'retail', '$1,500'], [1086, 'salons', '$1,500'], [1087, 'automotive', '$1,700'], [1088, 'cleaning', '$1,500'], [1089, 'gyms', '$1,700'], [1090, 'logistics', '$1,800']]
for (const [ln, key, amount] of INDUSTRY_LINES) bind(page, ln, [[amount, P + 'industries.' + key + '.setup']])
bind(page, 1095, [['$3,900', P + 'packs.front.own'], ['$4,100', P + 'industries.automotive.own'], ['$4,200', P + 'industries.realestate.own'], ['$4,400', P + 'industries.dental.own'], ['$8,800', P + 'packs.back.own'], ['$14,100', P + 'packs.whole.own'], ['$60', P + 'extras.providerCostsLow'], ['$250', P + 'extras.providerCostsHigh']])
bind(page, 1102, [['$2,900', P + 'app.review']])
bind(page, 1103, [['$10,000', P + 'app.launch']])
bind(page, 1104, [['$500', P + 'app.care']])
bind(page, 1105, [['$1,000', P + 'app.careAdvisor']])
bind(page, 1106, [['$200', P + 'app.hourly'], ['$1,500', P + 'app.prepaidBlock']])
bind(page, 1112, [['$200', P + 'extras.extraMinutes500'], ['$0.35', P + 'frontDesk.receptionist.extraMinute']])
bind(page, 1113, [['$15', P + 'extras.phoneNumberMonthly']])
bind(page, 1114, [['$2,900', P + 'builds.workflow.from']])
bind(page, 1115, [['$7,500', P + 'builds.documents.from'], ['$300', P + 'builds.documents.monthly']])
bind(page, 1116, [['$1,000', P + 'advice.audit.fixed']])
bind(page, 1117, [['$200', P + 'advice.carePlan.light'], ['$500', P + 'advice.carePlan.standard'], ['$1,000', P + 'advice.carePlan.full']])
bind(page, 1121, [['$0.10', P + 'frontDesk.leadFollowUp.smsCost']])
sub(page, 1122, '<p class="small muted"><b>Market context, published so you can check:</b>', '<p class="small muted" data-market><b>Market context, published so you can check:</b>')
bind(page, 1216, [['$15', P + 'extras.phoneNumberMonthly'], ['$0.35', P + 'frontDesk.receptionist.extraMinute'], ['$20', P + 'extras.frontDeskExtrasLow'], ['$80', P + 'extras.frontDeskExtrasHigh']])
bind(page, 1224, [['$1,000', P + 'advice.audit.fixed']])

// -- head: the loader, right after the stylesheet links
sub(page, 19, '<link rel="stylesheet" href="https://fonts.cdnfonts.com/css/conthrax">', '<link rel="stylesheet" href="https://fonts.cdnfonts.com/css/conthrax">\n' + LOADER_TAG)

let html = page.lines.join('\n')

// -- scripts: constants from the content, formatters from the loader, re-render on update
html = rep(html, `/* ---------- pricing constants (must match the Pricing section) ---------- */
const PACKS = {`, `/* ---------- pricing constants: from the site content (ax-content.js); the literals are the committed defaults ---------- */
const PACKS = {`, 1, 'PACKS header')
html = rep(html, `const money = n => '$' + n.toLocaleString('en-AU');
const gst = n => '$' + (Math.round(n * 110) / 100).toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 2 });`,
`const syncPricing = c => {
  const PR = c && c.pricing; if (!PR) return;
  Object.keys(PACKS).forEach(k => { const v = PR.packs && PR.packs[k]; if (v) Object.assign(PACKS[k], { name: v.name, monthly: v.monthly, setup: v.setup, own: v.own }); });
  Object.keys(IND).forEach(k => { const v = PR.industries && PR.industries[k]; if (v) Object.assign(IND[k], { name: v.name, setup: v.setup, own: v.own }); });
};
if (window.AX) syncPricing(window.AX.content);
/* PRICE(path, fallback): a number from the site content, or the committed default. */
const PRICE = (path, fallback) => { const v = window.AX ? window.AX.get(path) : undefined; return typeof v === 'number' ? v : fallback; };
const money = n => window.AX ? window.AX.money(n) : '$' + n.toLocaleString('en-AU');
const gst = n => window.AX ? window.AX.gst(n) : '$' + (Math.round(n * 110) / 100).toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
/* Sends a lead to the admin backend and to Web3Forms at the same time; true when either took it. */
async function sendBoth(kind, subject, fields) {
  const viaApi = window.AX && window.AX.api ? window.AX.postLead(kind, fields) : Promise.resolve(false);
  const viaForm = window.AXFORM ? window.AXFORM.send(subject, fields) : Promise.resolve(false);
  const results = await Promise.allSettled([viaApi, viaForm]);
  if (results.some(r => r.status === 'fulfilled' && r.value === true)) return true;
  const failed = results.find(r => r.status === 'rejected');
  if (failed) throw failed.reason;
  return false;
}`, 1, 'money/gst helpers')
html = rep(html, `${'$'}{p.name}`, `${'$'}{esc(p.name)}`, 1, 'renderTotals pack name')
html = rep(html, `${'$'}{PACKS[r.half].name}`, `${'$'}{esc(PACKS[r.half].name)}`, 1, 'halfLine pack name')
html = rep(html, `' (from $4,400 with clinic or legal setup)'`, `' (from ' + money(IND.dental.own) + ' with clinic or legal setup)'`, 1, 'renderPacks literal')
html = rep(html, `window.OP = { PACKS, IND, money, gst, esc, use, reduceMotion, renderStatic, fmtH };`,
`if (window.AX) window.AX.onUpdate(c => { syncPricing(c); renderPacks(); if (current.items.length) renderTotals(); });
window.OP = { PACKS, IND, money, gst, esc, use, reduceMotion, renderStatic, fmtH, PRICE, sendBoth };`, 1, 'OP export')
html = rep(html, `const OP = window.OP || {}; const { PACKS, IND, money, esc, use, reduceMotion } = OP; if (!PACKS) return;`,
`const OP = window.OP || {}; const { PACKS, IND, money, esc, use, reduceMotion, PRICE, sendBoth } = OP; if (!PACKS) return;`, 1, 'OP import')
html = rep(html, `workflow: mk(0, 2900, 2900) }[pkg];`, `workflow: mk(0, PRICE('pricing.builds.workflow.from', 2900), PRICE('pricing.builds.workflow.from', 2900)) }[pkg];`, 1, 'mk workflow')
html = rep(html, `const comp = { 'reception': ['AI Receptionist', 300, 500], 'follow-up': ['Instant Lead Follow-up', 200, 500], 'chat': ['Website and Social Chat Agent', 200, 500], 'reviews': ['Reviews and Reputation', 100, 0], 'inbox': ['Inbox and Admin Assistant', 500, 1000], 'quotes/invoices': ['Quotes, Invoices and Bookkeeping Automation', 0, 1900], 'bookkeeping': ['Quotes, Invoices and Bookkeeping Automation', 0, 1900], 'documents': ['Document chasing inside Inbox and Admin Assistant', 500, 1000], 'meetings': ['Meeting Notes and CRM Updates', 100, 500], 'content': ['Content and Marketing Automation', 200, 700], 'workflow': ['A single workflow build', 0, 2900] }[tl];`,
`const F = 'pricing.frontDesk.', B = 'pricing.backOffice.';
    const comp = { 'reception': ['AI Receptionist', PRICE(F + 'receptionist.monthly', 300), PRICE(F + 'receptionist.setup', 500)], 'follow-up': ['Instant Lead Follow-up', PRICE(F + 'leadFollowUp.monthly', 200), PRICE(F + 'leadFollowUp.setup', 500)], 'chat': ['Website and Social Chat Agent', PRICE(F + 'chat.monthly', 200), PRICE(F + 'chat.setup', 500)], 'reviews': ['Reviews and Reputation', PRICE(F + 'reviews.monthly', 100), 0], 'inbox': ['Inbox and Admin Assistant', PRICE(B + 'inbox.monthly', 500), PRICE(B + 'inbox.setup', 1000)], 'quotes/invoices': ['Quotes, Invoices and Bookkeeping Automation', 0, PRICE(B + 'quotesInvoices.from', 1900)], 'bookkeeping': ['Quotes, Invoices and Bookkeeping Automation', 0, PRICE(B + 'quotesInvoices.from', 1900)], 'documents': ['Document chasing inside Inbox and Admin Assistant', PRICE(B + 'inbox.monthly', 500), PRICE(B + 'inbox.setup', 1000)], 'meetings': ['Meeting Notes and CRM Updates', PRICE(B + 'meetings.monthly', 100), PRICE(B + 'meetings.setup', 500)], 'content': ['Content and Marketing Automation', PRICE(B + 'content.monthly', 200), PRICE(B + 'content.setup', 700)], 'workflow': ['A single workflow build', 0, PRICE('pricing.builds.workflow.from', 2900)] }[tl];`, 1, 'comp table')
// FREE.up is never rendered: drop it from every entry.
{
  const start = html.indexOf('const FREE = {')
  const end = html.indexOf('\n};', start)
  if (start < 0 || end < 0) throw new Error('FREE block not found')
  const block = html.slice(start, end)
  const cleaned = block.replace(/, up: '(?:[^'\\]|\\.)*'/g, () => '')
  const removed = (block.match(/, up: '/g) || []).length
  if (removed !== 9) throw new Error(`expected 9 FREE.up properties, found ${removed}`)
  html = html.slice(0, start) + cleaned + html.slice(end)
}
// Lead forms: both channels.
html = rep(html, `async function saveLead(lead) {
  if (!window.AXFORM) return false;
  return window.AXFORM.send('Booking request: ' + lead.business, {`, `async function saveLead(lead) {
  return sendBoth('booking', 'Booking request: ' + lead.business, {`, 1, 'saveLead')
html = rep(html, `async function saveAudit(rec) {
  if (!window.AXFORM) return false;
  const c = rec.contact || {};
  return window.AXFORM.send('Free AI audit: ' + c.business + ' (' + rec.industry_name + ', ' + rec.fit_status + ')', {`, `async function saveAudit(rec) {
  const c = rec.contact || {};
  return sendBoth('audit', 'Free AI audit: ' + c.business + ' (' + rec.industry_name + ', ' + rec.fit_status + ')', {`, 1, 'saveAudit')
// Hours inside the booking fallback template.
html = rep(html, `<p class="help">Monday to Friday 8am to 6pm AEST.</p>`, `<p class="help">${'$'}{esc((window.AX && window.AX.get('text.hours')) || 'Monday to Friday 8am to 6pm AEST')}.</p>`, 1, 'help hours')
// Audit result: re-render with the live prices when they arrive after the result is on screen.
html = rep(html, `const PKGNAME = k => k === 'workflow' ? 'a single workflow build' : PACKS[k].name;
function renderResult(r) {`, `const PKGNAME = k => k === 'workflow' ? 'a single workflow build' : PACKS[k].name;
if (window.AX) window.AX.onUpdate(() => { const aRes = $('#aRes'); if (A.result && aRes && aRes.innerHTML && !aRes.hidden) { try { A.result = computeResult(); renderResult(A.result); } catch (e) {} } });
function renderResult(r) {`, 1, 'renderResult hook')

// -- the dead admin view
html = rep(html, `#admin{display:none!important}\n`, '', 1, 'admin css 23')
html = rep(html, `/* admin */
body.admin-mode main > section:not(#admin), body.admin-mode .bottom-bar, body.admin-mode footer{display:none}
#admin{display:none}
body.admin-mode #admin{display:block}
`, '', 1, 'admin css block')
html = rep(html, `.admin-link{margin-top:1rem;font-size:.8rem}\n`, '', 1, 'admin-link css')
html = rep(html, `.px-nav.scrolled,.px-nav.menu-open,body.admin-mode .px-nav{`, `.px-nav.scrolled,.px-nav.menu-open{`, 1, 'nav css')
html = rep(html, `body.admin-mode .px-nav{margin-bottom:0}
body.admin-mode .px-annc{display:none}
`, '', 1, 'admin nav css')
html = rep(html, `.px-nav.scrolled .px-brand img,.px-nav.menu-open .px-brand img,body.admin-mode .px-brand img{filter:none}`, `.px-nav.scrolled .px-brand img,.px-nav.menu-open .px-brand img{filter:none}`, 1, 'brand css')
html = rep(html, `.px-nav.scrolled .px-cta .btn,body.admin-mode .px-cta .btn{`, `.px-nav.scrolled .px-cta .btn{`, 1, 'cta css')
html = rep(html, `body:not(.admin-mode) .px-nav:not(.scrolled):not(.menu-open) :focus-visible{`, `.px-nav:not(.scrolled):not(.menu-open) :focus-visible{`, 1, 'focus css')
html = rep(html, `body:not(.admin-mode) .px-nav:not(.scrolled):not(.menu-open) .px-burger:focus-visible`, `.px-nav:not(.scrolled):not(.menu-open) .px-burger:focus-visible`, 1, 'burger css')
html = rep(html, `.px-nav.scrolled .px-cta .btn:hover,body.admin-mode .px-cta .btn:hover{`, `.px-nav.scrolled .px-cta .btn:hover{`, 1, 'hover css')
html = rep(html, `body.admin-mode .px-cta,body.admin-mode #mnav [data-book]{display:none}\n`, '', 1, 'cta hide css')
{
  const start = html.indexOf('<section id="admin">')
  const end = html.indexOf('</section>', start)
  if (start < 0 || end < 0) throw new Error('admin section not found')
  html = html.slice(0, start) + html.slice(end + '</section>'.length + 1)
}
html = rep(html, `      <p class="admin-link" id="adminLink" hidden><a href="#admin">Staff: open the admin view (audits and leads)</a></p>\n`, '', 1, 'admin link')
{
  const start = html.indexOf('/* ---------- admin view (editors only) ---------- */')
  const end = html.indexOf('/* deep-link: #audit scrolls; the first script handles industry hashes */', start)
  if (start < 0 || end < 0) throw new Error('admin script block not found')
  html = html.slice(0, start) + html.slice(end)
}
save(page, html)
console.log('index.html refactored')

/* =====================================================================================
   fact-sheet.html
   ===================================================================================== */
const sheet = open('public/consultation/fact-sheet.html')
sub(sheet, 11, '<link rel="stylesheet" href="https://fonts.cdnfonts.com/css/conthrax">', '<link rel="stylesheet" href="https://fonts.cdnfonts.com/css/conthrax">\n' + LOADER_TAG)
bind(sheet, 81, [['$400', P + 'packs.front.monthly'], ['$1,500', P + 'packs.front.setup']])
sub(sheet, 81, '<td>Managed receptionists', '<td data-market>Managed receptionists')
bind(sheet, 82, [['$800', P + 'packs.back.monthly'], ['$4,000', P + 'packs.back.setup']])
sub(sheet, 82, '<td>Managed automation retainers', '<td data-market>Managed automation retainers')
bind(sheet, 83, [['$1,200', P + 'packs.whole.monthly'], ['$6,900', P + 'packs.whole.setup']])
bind(sheet, 84, [['$10,000', P + 'engineer.twoWeekSystem']])
sub(sheet, 84, '<td>Pilots', '<td data-market>Pilots')
bind(sheet, 85, [['$8,800', P + 'engineer.embeddedTwoDays'], ['$12,900', P + 'engineer.embeddedThreeDays']])
sub(sheet, 85, '<td>Part-time AI engineers', '<td data-market>Part-time AI engineers')
bind(sheet, 86, [['$2,900', P + 'builds.workflow.from']])
sub(sheet, 86, '<td>Single-workflow builds', '<td data-market>Single-workflow builds')
bind(sheet, 87, [['$1,000', P + 'advice.audit.fixed']])
sub(sheet, 103, 'Monday to Friday, 8am to 6pm AEST', span('text.hours', 'plain', 'Monday to Friday 8am to 6pm AEST'))
sub(sheet, 103, 'Brisbane, working across Australia', span('text.location', 'plain', 'Brisbane, working across Australia'))
sub(sheet, 107, 'correct at 1 November 2026', `correct at ${span('text.pricesCorrectAt', 'date', '2 November 2026')}`)
save(sheet, sheet.lines.join('\n'))
console.log('fact-sheet.html refactored')
