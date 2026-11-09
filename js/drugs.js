// Starter list for the generic-name box. Generic names go first, since the
// Philippine Generics Act (RA 6675) asks for the generic name on every
// prescription with the brand optional after it. Strengths are the common
// ones on the market; the doctor can type any other.
//
// f: form, s: strengths, r: route, u: what the quantity counts

export const DRUGS = [
  // skin and aesthetics
  { g: 'Tretinoin', f: 'cream', s: ['0.025%', '0.05%', '0.1%'], r: 'topical', u: 'tube' },
  { g: 'Tretinoin', f: 'gel', s: ['0.025%', '0.05%'], r: 'topical', u: 'tube' },
  { g: 'Adapalene', f: 'gel', s: ['0.1%', '0.3%'], r: 'topical', u: 'tube' },
  { g: 'Adapalene', f: 'cream', s: ['0.1%'], r: 'topical', u: 'tube' },
  { g: 'Adapalene + Benzoyl peroxide', f: 'gel', s: ['0.1%/2.5%'], r: 'topical', u: 'tube' },
  { g: 'Benzoyl peroxide', f: 'gel', s: ['2.5%', '5%'], r: 'topical', u: 'tube' },
  { g: 'Clindamycin', f: 'gel', s: ['1%'], r: 'topical', u: 'tube' },
  { g: 'Clindamycin', f: 'capsule', s: ['150 mg', '300 mg'], r: 'oral', u: '' },
  { g: 'Clindamycin', f: 'topical solution', s: ['1%'], r: 'topical', u: 'bottle' },
  { g: 'Azelaic acid', f: 'cream', s: ['20%'], r: 'topical', u: 'tube' },
  { g: 'Azelaic acid', f: 'gel', s: ['15%'], r: 'topical', u: 'tube' },
  { g: 'Hydroquinone', f: 'cream', s: ['2%', '4%'], r: 'topical', u: 'tube' },
  { g: 'Tranexamic acid', f: 'capsule', s: ['250 mg', '500 mg'], r: 'oral', u: '' },
  { g: 'Tranexamic acid', f: 'tablet', s: ['500 mg'], r: 'oral', u: '' },
  { g: 'Doxycycline', f: 'capsule', s: ['100 mg'], r: 'oral', u: '' },
  { g: 'Doxycycline', f: 'tablet', s: ['100 mg'], r: 'oral', u: '' },
  { g: 'Isotretinoin', f: 'capsule', s: ['10 mg', '20 mg'], r: 'oral', u: '' },
  { g: 'Minoxidil', f: 'topical solution', s: ['2%', '5%'], r: 'topical', u: 'bottle' },
  { g: 'Minoxidil', f: 'foam', s: ['5%'], r: 'topical', u: 'can' },
  { g: 'Minoxidil', f: 'tablet', s: ['2.5 mg', '5 mg', '10 mg'], r: 'oral', u: '' },
  { g: 'Finasteride', f: 'tablet', s: ['1 mg', '5 mg'], r: 'oral', u: '' },
  { g: 'Mupirocin', f: 'ointment', s: ['2%'], r: 'topical', u: 'tube' },
  { g: 'Fusidic acid', f: 'cream', s: ['2%'], r: 'topical', u: 'tube' },
  { g: 'Hydrocortisone', f: 'cream', s: ['1%'], r: 'topical', u: 'tube' },
  { g: 'Hydrocortisone', f: 'ointment', s: ['1%'], r: 'topical', u: 'tube' },
  { g: 'Mometasone furoate', f: 'cream', s: ['0.1%'], r: 'topical', u: 'tube' },
  { g: 'Mometasone furoate', f: 'ointment', s: ['0.1%'], r: 'topical', u: 'tube' },
  { g: 'Mometasone furoate', f: 'lotion', s: ['0.1%'], r: 'topical', u: 'bottle' },
  { g: 'Lidocaine + Prilocaine', f: 'cream', s: ['2.5%/2.5%'], r: 'topical', u: 'tube' },
  { g: 'Silver sulfadiazine', f: 'cream', s: ['1%'], r: 'topical', u: 'tube' },
  { g: 'Ketoconazole', f: 'cream', s: ['2%'], r: 'topical', u: 'tube' },
  { g: 'Ketoconazole', f: 'shampoo', s: ['2%'], r: 'topical', u: 'bottle' },
  { g: 'Ketoconazole', f: 'tablet', s: ['200 mg'], r: 'oral', u: '' },
  { g: 'Terbinafine', f: 'cream', s: ['1%'], r: 'topical', u: 'tube' },
  { g: 'Terbinafine', f: 'tablet', s: ['250 mg'], r: 'oral', u: '' },
  { g: 'Acyclovir', f: 'cream', s: ['5%'], r: 'topical', u: 'tube' },
  { g: 'Acyclovir', f: 'tablet', s: ['200 mg', '400 mg', '800 mg'], r: 'oral', u: '' },
  { g: 'Acyclovir', f: 'suspension', s: ['200 mg/5 mL'], r: 'oral', u: 'bottle' },
  { g: 'Valacyclovir', f: 'tablet', s: ['500 mg', '1 g'], r: 'oral', u: '' },
  { g: 'Cetirizine', f: 'tablet', s: ['10 mg'], r: 'oral', u: '' },
  { g: 'Levocetirizine', f: 'tablet', s: ['5 mg'], r: 'oral', u: '' },
  { g: 'Levocetirizine', f: 'syrup', s: ['2.5 mg/5 mL'], r: 'oral', u: 'bottle' },
  { g: 'Loratadine', f: 'tablet', s: ['10 mg'], r: 'oral', u: '' },
  { g: 'Loratadine', f: 'syrup', s: ['5 mg/5 mL'], r: 'oral', u: 'bottle' },
  { g: 'Fexofenadine', f: 'tablet', s: ['60 mg', '120 mg', '180 mg'], r: 'oral', u: '' },
  { g: 'Fexofenadine', f: 'suspension', s: ['30 mg/5 mL'], r: 'oral', u: 'bottle' },
  { g: 'Cetirizine', f: 'syrup', s: ['5 mg/5 mL'], r: 'oral', u: 'bottle' },
  { g: 'Cetirizine', f: 'drops', s: ['10 mg/mL'], r: 'oral', u: 'bottle' },
  { g: 'Chlorphenamine', f: 'tablet', s: ['4 mg'], r: 'oral', u: '' },
  { g: 'Chlorphenamine', f: 'syrup', s: ['2 mg/5 mL'], r: 'oral', u: 'bottle' },
  { g: 'Hydroxyzine', f: 'tablet', s: ['10 mg', '25 mg'], r: 'oral', u: '' },
  { g: 'Hydroxyzine', f: 'syrup', s: ['10 mg/5 mL'], r: 'oral', u: 'bottle' },
  { g: 'Ivermectin', f: 'cream', s: ['1%'], r: 'topical', u: 'tube' },
  { g: 'Ivermectin', f: 'tablet', s: ['3 mg', '6 mg', '12 mg'], r: 'oral', u: '' },
  { g: 'Tacrolimus', f: 'ointment', s: ['0.03%', '0.1%'], r: 'topical', u: 'tube' },
  { g: 'Clobetasol propionate', f: 'cream', s: ['0.05%'], r: 'topical', u: 'tube' },
  { g: 'Clobetasol propionate', f: 'ointment', s: ['0.05%'], r: 'topical', u: 'tube' },
  { g: 'Clobetasol propionate', f: 'topical solution', s: ['0.05%'], r: 'topical', u: 'bottle' },
  { g: 'Betamethasone valerate', f: 'cream', s: ['0.1%'], r: 'topical', u: 'tube' },
  { g: 'Betamethasone valerate', f: 'ointment', s: ['0.1%'], r: 'topical', u: 'tube' },
  { g: 'Clotrimazole', f: 'cream', s: ['1%'], r: 'topical', u: 'tube' },
  { g: 'Clotrimazole', f: 'vaginal cream', s: ['1%', '2%'], r: 'vaginal', u: 'tube' },
  { g: 'Clotrimazole', f: 'vaginal tablet', s: ['100 mg', '200 mg', '500 mg'], r: 'vaginal', u: '' },
  { g: 'Permethrin', f: 'cream', s: ['5%'], r: 'topical', u: 'tube' },
  { g: 'Spironolactone', f: 'tablet', s: ['25 mg', '50 mg', '100 mg'], r: 'oral', u: '' },
  { g: 'Ethinylestradiol + Drospirenone', f: 'tablet', s: ['30 mcg/3 mg', '20 mcg/3 mg'], r: 'oral', u: 'pack' },
  { g: 'Ethinylestradiol + Cyproterone acetate', f: 'tablet', s: ['35 mcg/2 mg'], r: 'oral', u: 'pack' },
  // pain and fever
  { g: 'Paracetamol', f: 'tablet', s: ['500 mg'], r: 'oral', u: '' },
  { g: 'Paracetamol', f: 'syrup', s: ['120 mg/5 mL', '250 mg/5 mL'], r: 'oral', u: 'bottle' },
  { g: 'Paracetamol', f: 'drops', s: ['100 mg/mL'], r: 'oral', u: 'bottle' },
  { g: 'Ibuprofen', f: 'tablet', s: ['200 mg', '400 mg'], r: 'oral', u: '' },
  { g: 'Ibuprofen', f: 'suspension', s: ['100 mg/5 mL', '200 mg/5 mL'], r: 'oral', u: 'bottle' },
  { g: 'Mefenamic acid', f: 'capsule', s: ['250 mg', '500 mg'], r: 'oral', u: '' },
  { g: 'Mefenamic acid', f: 'tablet', s: ['500 mg'], r: 'oral', u: '' },
  { g: 'Mefenamic acid', f: 'suspension', s: ['50 mg/5 mL'], r: 'oral', u: 'bottle' },
  { g: 'Celecoxib', f: 'capsule', s: ['100 mg', '200 mg'], r: 'oral', u: '' },
  { g: 'Naproxen sodium', f: 'tablet', s: ['275 mg', '550 mg'], r: 'oral', u: '' },
  { g: 'Tramadol', f: 'capsule', s: ['50 mg'], r: 'oral', u: '' },
  { g: 'Colchicine', f: 'tablet', s: ['500 mcg'], r: 'oral', u: '' },
  { g: 'Allopurinol', f: 'tablet', s: ['100 mg', '300 mg'], r: 'oral', u: '' },
  // antibiotics
  { g: 'Amoxicillin', f: 'capsule', s: ['250 mg', '500 mg'], r: 'oral', u: '' },
  { g: 'Amoxicillin', f: 'suspension', s: ['125 mg/5 mL', '250 mg/5 mL'], r: 'oral', u: 'bottle' },
  { g: 'Amoxicillin', f: 'drops', s: ['100 mg/mL'], r: 'oral', u: 'bottle' },
  { g: 'Co-amoxiclav', f: 'tablet', s: ['375 mg', '625 mg', '1 g'], r: 'oral', u: '' },
  { g: 'Co-amoxiclav', f: 'suspension', s: ['125 mg/31.25 mg per 5 mL', '250 mg/62.5 mg per 5 mL', '200 mg/28.5 mg per 5 mL', '400 mg/57 mg per 5 mL'], r: 'oral', u: 'bottle' },
  { g: 'Cefalexin', f: 'capsule', s: ['250 mg', '500 mg'], r: 'oral', u: '' },
  { g: 'Cefalexin', f: 'suspension', s: ['125 mg/5 mL', '250 mg/5 mL'], r: 'oral', u: 'bottle' },
  { g: 'Cefalexin', f: 'drops', s: ['100 mg/mL'], r: 'oral', u: 'bottle' },
  { g: 'Cefuroxime', f: 'tablet', s: ['250 mg', '500 mg'], r: 'oral', u: '' },
  { g: 'Cefuroxime', f: 'suspension', s: ['125 mg/5 mL', '250 mg/5 mL'], r: 'oral', u: 'bottle' },
  { g: 'Cefixime', f: 'capsule', s: ['200 mg', '400 mg'], r: 'oral', u: '' },
  { g: 'Cefixime', f: 'suspension', s: ['100 mg/5 mL'], r: 'oral', u: 'bottle' },
  { g: 'Cefixime', f: 'drops', s: ['20 mg/mL'], r: 'oral', u: 'bottle' },
  { g: 'Azithromycin', f: 'tablet', s: ['250 mg', '500 mg'], r: 'oral', u: '' },
  { g: 'Azithromycin', f: 'suspension', s: ['200 mg/5 mL'], r: 'oral', u: 'bottle' },
  { g: 'Clarithromycin', f: 'tablet', s: ['250 mg', '500 mg'], r: 'oral', u: '' },
  { g: 'Clarithromycin', f: 'suspension', s: ['125 mg/5 mL', '250 mg/5 mL'], r: 'oral', u: 'bottle' },
  { g: 'Ciprofloxacin', f: 'tablet', s: ['250 mg', '500 mg'], r: 'oral', u: '' },
  { g: 'Levofloxacin', f: 'tablet', s: ['500 mg', '750 mg'], r: 'oral', u: '' },
  { g: 'Co-trimoxazole', f: 'tablet', s: ['400 mg/80 mg', '800 mg/160 mg'], r: 'oral', u: '' },
  { g: 'Co-trimoxazole', f: 'suspension', s: ['200 mg/40 mg per 5 mL'], r: 'oral', u: 'bottle' },
  { g: 'Metronidazole', f: 'tablet', s: ['250 mg', '500 mg'], r: 'oral', u: '' },
  { g: 'Metronidazole', f: 'suspension', s: ['125 mg/5 mL'], r: 'oral', u: 'bottle' },
  { g: 'Metronidazole', f: 'gel', s: ['0.75%', '1%'], r: 'topical', u: 'tube' },
  { g: 'Nitrofurantoin', f: 'capsule', s: ['100 mg'], r: 'oral', u: '' },
  // antivirals, antifungals, worms
  { g: 'Oseltamivir', f: 'capsule', s: ['75 mg'], r: 'oral', u: '' },
  { g: 'Oseltamivir', f: 'suspension', s: ['6 mg/mL'], r: 'oral', u: 'bottle' },
  { g: 'Fluconazole', f: 'capsule', s: ['50 mg', '150 mg', '200 mg'], r: 'oral', u: '' },
  { g: 'Albendazole', f: 'tablet', s: ['400 mg'], r: 'oral', u: '' },
  { g: 'Albendazole', f: 'suspension', s: ['200 mg/5 mL'], r: 'oral', u: 'bottle' },
  { g: 'Mebendazole', f: 'tablet', s: ['100 mg', '500 mg'], r: 'oral', u: '' },
  // stomach
  { g: 'Omeprazole', f: 'capsule', s: ['20 mg', '40 mg'], r: 'oral', u: '' },
  { g: 'Esomeprazole', f: 'tablet', s: ['20 mg', '40 mg'], r: 'oral', u: '' },
  { g: 'Famotidine', f: 'tablet', s: ['20 mg', '40 mg'], r: 'oral', u: '' },
  { g: 'Domperidone', f: 'tablet', s: ['10 mg'], r: 'oral', u: '' },
  { g: 'Domperidone', f: 'suspension', s: ['5 mg/5 mL'], r: 'oral', u: 'bottle' },
  { g: 'Ondansetron', f: 'tablet', s: ['4 mg', '8 mg'], r: 'oral', u: '' },
  { g: 'Ondansetron', f: 'syrup', s: ['4 mg/5 mL'], r: 'oral', u: 'bottle' },
  { g: 'Hyoscine butylbromide', f: 'tablet', s: ['10 mg'], r: 'oral', u: '' },
  { g: 'Loperamide', f: 'capsule', s: ['2 mg'], r: 'oral', u: '' },
  { g: 'Oral rehydration salts', f: 'sachet', s: [''], r: 'oral', u: '' },
  { g: 'Zinc sulfate', f: 'syrup', s: ['10 mg/5 mL', '20 mg/5 mL'], r: 'oral', u: 'bottle' },
  { g: 'Zinc sulfate', f: 'drops', s: ['10 mg/mL'], r: 'oral', u: 'bottle' },
  // long-term
  { g: 'Metformin', f: 'tablet', s: ['500 mg', '850 mg', '1 g'], r: 'oral', u: '' },
  { g: 'Amlodipine', f: 'tablet', s: ['5 mg', '10 mg'], r: 'oral', u: '' },
  { g: 'Losartan potassium', f: 'tablet', s: ['50 mg', '100 mg'], r: 'oral', u: '' },
  { g: 'Atorvastatin', f: 'tablet', s: ['10 mg', '20 mg', '40 mg', '80 mg'], r: 'oral', u: '' },
  { g: 'Rosuvastatin', f: 'tablet', s: ['5 mg', '10 mg', '20 mg'], r: 'oral', u: '' },
  { g: 'Simvastatin', f: 'tablet', s: ['10 mg', '20 mg', '40 mg'], r: 'oral', u: '' },
  { g: 'Levothyroxine', f: 'tablet', s: ['25 mcg', '50 mcg', '100 mcg'], r: 'oral', u: '' },
  { g: 'Aspirin', f: 'tablet', s: ['80 mg', '100 mg'], r: 'oral', u: '' },
  { g: 'Clopidogrel', f: 'tablet', s: ['75 mg'], r: 'oral', u: '' },
  { g: 'Warfarin', f: 'tablet', s: ['1 mg', '2.5 mg', '5 mg'], r: 'oral', u: '' },
  { g: 'Sertraline', f: 'tablet', s: ['50 mg'], r: 'oral', u: '' },
  { g: 'Escitalopram', f: 'tablet', s: ['10 mg'], r: 'oral', u: '' },
  { g: 'Salbutamol', f: 'inhaler', s: ['100 mcg/dose'], r: 'inhaled', u: 'inhaler' },
  { g: 'Salbutamol', f: 'nebule', s: ['2.5 mg/2.5 mL'], r: 'inhaled', u: '' },
  { g: 'Salbutamol', f: 'tablet', s: ['2 mg'], r: 'oral', u: '' },
  { g: 'Salbutamol', f: 'syrup', s: ['2 mg/5 mL'], r: 'oral', u: 'bottle' },
  { g: 'Montelukast', f: 'tablet', s: ['4 mg', '5 mg', '10 mg'], r: 'oral', u: '' },
  { g: 'Montelukast', f: 'granules', s: ['4 mg'], r: 'oral', u: 'sachet' },
  { g: 'Ambroxol', f: 'tablet', s: ['30 mg'], r: 'oral', u: '' },
  { g: 'Ambroxol', f: 'syrup', s: ['15 mg/5 mL', '30 mg/5 mL'], r: 'oral', u: 'bottle' },
  { g: 'Prednisone', f: 'tablet', s: ['5 mg', '10 mg', '20 mg'], r: 'oral', u: '' },
  // dangerous drugs, need an S2 license
  { g: 'Diazepam', f: 'tablet', s: ['5 mg', '10 mg'], r: 'oral', u: '' },
  { g: 'Alprazolam', f: 'tablet', s: ['250 mcg', '500 mcg'], r: 'oral', u: '' },
  { g: 'Clonazepam', f: 'tablet', s: ['500 mcg', '2 mg'], r: 'oral', u: '' },
  { g: 'Zolpidem', f: 'tablet', s: ['10 mg'], r: 'oral', u: '' },
  // supplements
  { g: 'Ascorbic acid', f: 'tablet', s: ['500 mg'], r: 'oral', u: '' },
  { g: 'Ascorbic acid', f: 'syrup', s: ['100 mg/5 mL'], r: 'oral', u: 'bottle' },
  { g: 'Ascorbic acid', f: 'drops', s: ['100 mg/mL'], r: 'oral', u: 'bottle' },
  { g: 'Ferrous sulfate', f: 'tablet', s: ['325 mg'], r: 'oral', u: '' },
  { g: 'Folic acid', f: 'tablet', s: ['1 mg', '5 mg'], r: 'oral', u: '' },
  { g: 'Vitamin D3 (Cholecalciferol)', f: 'capsule', s: ['1000 IU', '2000 IU'], r: 'oral', u: '' },
  { g: 'Calcium carbonate', f: 'tablet', s: ['500 mg', '1250 mg'], r: 'oral', u: '' },
];

export const FORMS = ['tablet', 'capsule', 'syrup', 'suspension', 'drops', 'cream', 'gel', 'ointment', 'lotion', 'topical solution', 'shampoo', 'inhaler', 'nasal spray', 'nebule', 'eye drops', 'eye ointment', 'ear drops', 'suppository', 'vaginal cream', 'sachet', 'granules', 'foam', 'vaginal tablet', 'injection'];

export const ROUTES = {
  oral: { label: 'By mouth', verb: 'Take', after: 'by mouth' },
  topical: { label: 'On the skin', verb: 'Apply', after: '' },
  inhaled: { label: 'Inhaled', verb: 'Inhale', after: '' },
  eye: { label: 'Eye', verb: 'Instill', after: 'into the affected eye' },
  ear: { label: 'Ear', verb: 'Instill', after: 'into the affected ear' },
  rectal: { label: 'Rectal', verb: 'Insert', after: 'into the rectum' },
  vaginal: { label: 'Vaginal', verb: 'Insert', after: 'into the vagina' },
  nasal: { label: 'Nose', verb: 'Spray', after: 'into each nostril' },
  sublingual: { label: 'Under the tongue', verb: 'Dissolve', after: 'under the tongue' },
  injection: { label: 'Injection', verb: 'Inject', after: '' },
  other: { label: 'Other', verb: 'Use', after: '' },
};

export const DOSES = {
  oral: ['1 tablet', '2 tablets', '1/2 tablet', '1 capsule', '2 capsules', '5 mL', '2.5 mL', '10 mL', '1 sachet'],
  topical: ['a thin layer', 'a pea-sized amount', 'a small amount', '1 mL'],
  inhaled: ['1 puff', '2 puffs', '1 nebule'],
  eye: ['1 drop', '2 drops', 'a 1 cm strip'],
  ear: ['2 drops', '3 drops', '4 drops'],
  rectal: ['1 suppository'],
  vaginal: ['1 applicatorful', '1 suppository'],
  nasal: ['1 spray', '2 sprays'],
  sublingual: ['1 tablet'],
  injection: [],
  other: [],
};

export const AREAS = ['to the face', 'to the affected area', 'to the scalp', 'to the treated area', 'to the whole face, avoiding the eyes and lips'];

export const FREQS = ['once a day', 'twice a day', 'three times a day', 'four times a day', 'every 4 hours', 'every 6 hours', 'every 8 hours', 'every 12 hours', 'at bedtime', 'every morning', 'every other night', 'once a week', 'as needed'];

export const TIMING = ['after meals', 'before meals', 'with food', 'on an empty stomach', 'for pain', 'for fever', 'for itching', 'for nausea', 'then wash off after 2 hours'];

export const DURATIONS = ['for 3 days', 'for 5 days', 'for 7 days', 'for 10 days', 'for 14 days', 'for 1 month', 'for 3 months', 'until finished'];

export const QTY_UNITS = ['', 'tube', 'tubes', 'bottle', 'bottles', 'box', 'inhaler', 'sachets', 'vial', 'pack'];

// The route a form settles, or null for a form that does not say (serum).
export function knownRoute(form) {
  const f = (form || '').toLowerCase().trim();
  if (!f) return null;
  const r = routeForForm(f);
  if (r !== 'oral') return r;
  return /tablet|capsule|caplet|syrup|suspension|drops|sachet|granules|elixir|solution|lozenge|powder/.test(f) ? 'oral' : null;
}

export function routeForForm(form) {
  const f = (form || '').toLowerCase();
  if (/eye|ophthalmic/.test(f)) return 'eye';
  if (/ear|otic/.test(f)) return 'ear';
  if (/vagin|pessary/.test(f)) return 'vaginal';
  if (/suppos|rectal|enema/.test(f)) return 'rectal';
  if (/cream|gel|ointment|lotion|topical|shampoo|wash|foam/.test(f)) return 'topical';
  if (/inhal|nebul/.test(f)) return 'inhaled';
  if (/nasal/.test(f)) return 'nasal';
  if (/inject|vial|ampule/.test(f)) return 'injection';
  return 'oral';
}

// "Take 1 tablet by mouth three times a day after meals for 7 days."
export function buildSig(m) {
  const r = ROUTES[m.route] || ROUTES.oral;
  const parts = [r.verb, m.dose];
  if (m.route === 'topical') parts.push(m.area);
  else parts.push(r.after);
  parts.push(m.freq, m.timing, m.duration);
  let s = parts.map(x => (x || '').trim()).filter(Boolean).join(' ');
  if (!m.dose && !m.freq && !m.duration && !m.timing && !m.area) return m.extra ? m.extra.trim() : '';
  s = s.replace(/\s+/g, ' ');
  if (!/[.!?]$/.test(s)) s += '.';
  if (m.extra && m.extra.trim()) s += ' ' + m.extra.trim().replace(/^./, c => c.toUpperCase()) + (/[.!?]$/.test(m.extra.trim()) ? '' : '.');
  return s;
}
