// Money formatting for the React site. These functions are copied from the static loader
// (public/consultation/ax-content.js) so both halves of the site print a price the same
// way: $1,500 and $0.35 from money(), $440 or $3,190 (including GST) from gst(), and
// "2 November 2026" from fmtDate(). scripts/check-prices.mjs asserts the loader's output
// matches for every value in content/site-content.json.

export function money(n) {
  n = Number(n)
  if (!isFinite(n)) return ''
  var dp = Number.isInteger(n) ? 0 : 2
  return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: dp, maximumFractionDigits: dp })
}

export function gst(n) {
  return '$' + (Math.round(Number(n) * 110) / 100).toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

export function fmtDate(iso) {
  var d = new Date(iso + (String(iso).length === 10 ? 'T00:00:00' : ''))
  if (isNaN(d)) return String(iso || '')
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
}
