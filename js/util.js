// Small helpers shared by the layout and the editor.

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

export function words(n) {
  n = Math.floor(Number(n));
  if (!Number.isFinite(n) || n < 0 || n > 99999) return '';
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '');
  if (n < 1000) return ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + words(n % 100) : '');
  return words(Math.floor(n / 1000)) + ' thousand' + (n % 1000 ? ' ' + words(n % 1000) : '');
}

// "#30 (thirty)" or "#1 tube (one)". Words are written out so the number
// cannot be changed by hand without it showing.
export function qtyText(m) {
  const q = String(m.qty ?? '').trim();
  if (!q) return '';
  const unit = (m.qtyUnit || '').trim();
  const w = /^\d+$/.test(q) ? words(q) : '';
  return '#' + q + (unit ? ' ' + unit : '') + (w ? ' (' + w + ')' : '');
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function fmtDate(iso) {
  if (!iso) return '';
  const [y, m, d] = String(iso).split('-').map(Number);
  if (!y || !m || !d) return String(iso);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export function todayISO(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

export function addDays(iso, days) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d + days);
  return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
}

// Age on the prescription date, from the birthdate when there is one. Babies
// under two get months, since a dose for them goes by months.
export function ageText(p, onISO) {
  if (p.birthdate) {
    const [by, bm, bd] = p.birthdate.split('-').map(Number);
    const [ty, tm, td] = (onISO || todayISO()).split('-').map(Number);
    let months = (ty - by) * 12 + (tm - bm) - (td < bd ? 1 : 0);
    if (months < 0) return '';
    if (months < 24) return months + ' mo';
    return String(Math.floor(months / 12));
  }
  return p.age ? String(p.age) : '';
}

export function uid(prefix = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function slug(s) {
  return String(s || '').replace(/[^A-Za-z0-9 ._()-]+/g, ' ').replace(/\s+/g, ' ').trim();
}
