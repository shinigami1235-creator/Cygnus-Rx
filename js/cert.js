// Medical certificate, fit to work and medical clearance. The wording is
// built from the boxes and the patient, and the doctor can change it.

import { fmtDate, ageText } from './util.js';

export const CERT_TYPES = {
  med: { label: 'Medical certificate', title: 'Medical certificate' },
  fit: { label: 'Fit to work', title: 'Certificate of fitness to work' },
  clear: { label: 'Medical clearance', title: 'Medical clearance' },
};

export function blankCert(type = 'med') {
  return { type, diagnosis: '', from: '', to: '', back: '', activity: '', findings: '', remarks: '', purpose: '', text: '', edited: false };
}

function days(a, b) {
  const [y1, m1, d1] = a.split('-').map(Number), [y2, m2, d2] = b.split('-').map(Number);
  return Math.round((new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, d1)) / 86400000) + 1;
}

export function certText(c, p, date) {
  const age = ageText(p, date);
  const ageWords = age ? (/mo/.test(age) ? parseInt(age, 10) + ' months old' : age + ' years old') : '';
  const sex = p.sex === 'F' ? 'female' : p.sex === 'M' ? 'male' : '';
  const who = [p.name?.trim() || 'the patient', ageWords, sex].filter(Boolean).join(', ') + (p.address ? ', of ' + p.address.trim() : '');
  const out = [`This is to certify that ${who}, was seen and examined in this clinic on ${fmtDate(date)}.`];
  if (c.type === 'clear') {
    if (c.findings) out.push('Findings: ' + c.findings.trim());
    out.push(`Based on the history and physical examination, the patient is cleared for ${c.activity?.trim() || '(what the patient is cleared for)'}.`);
  } else {
    if (c.diagnosis) out.push('Diagnosis: ' + c.diagnosis.trim());
    const span = c.from && c.to && c.to >= c.from ? days(c.from, c.to) : 0;
    if (c.type === 'med' && span) out.push(`The patient is advised to rest for ${span} day${span > 1 ? 's' : ''}, from ${fmtDate(c.from)} to ${fmtDate(c.to)}.`);
    if (c.type === 'fit' && span) out.push(`The patient was unable to work from ${fmtDate(c.from)} to ${fmtDate(c.to)}.`);
    if (c.type === 'fit') out.push(`The patient is fit to return to work${c.back ? ' on ' + fmtDate(c.back) : ''}.`);
  }
  if (c.remarks) out.push((c.type === 'med' ? 'Recommendation: ' : 'Remarks: ') + c.remarks.trim());
  out.push(`This certificate is issued at the request of the patient for ${c.purpose?.trim() || 'whatever purpose it may serve'}, except for medico-legal purposes.`);
  return out.join('\n\n');
}
