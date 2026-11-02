// The laboratory, imaging and diagnostics catalog.
//
// Names follow what Philippine laboratories print on their menus and request
// forms (CBC with platelet count, FBS, SGPT (ALT), BUA). Each test carries
// aliases so the search finds it by the short name a doctor writes.
// X-ray views are the routine projections for that part; ultrasound, CT and
// MRI carry the options a request needs (side, approach, contrast).
//
// p: preparation key, printed under Patient preparation (see PREP below)
// sex: 'F' marks a test a ready-made set skips for a male patient

export const LAB = [
  { id: 'hema', name: 'Hematology', tests: [
    { n: 'CBC with platelet count', a: 'complete blood count cbcp cbc platelet' },
    { n: 'Hemoglobin and hematocrit', a: 'hgb hct h&h' },
    { n: 'Platelet count', a: 'plt' },
    { n: 'Peripheral blood smear', a: 'pbs' },
    { n: 'Reticulocyte count', a: 'retic' },
    { n: 'ESR', a: 'erythrocyte sedimentation rate sed rate' },
    { n: 'Blood typing (ABO and Rh)', a: 'blood type abo rh' },
    { n: 'Prothrombin time (PT) with INR', a: 'pt inr protime coagulation' },
    { n: 'APTT', a: 'ptt partial thromboplastin time coagulation' },
    { n: 'Bleeding time and clotting time', a: 'ct bt' },
    { n: 'D-dimer', a: 'ddimer' },
    { n: 'Fibrinogen', a: '' },
    { n: 'G6PD screening', a: 'g6pd' },
    { n: 'Hemoglobin electrophoresis', a: 'thalassemia hb' },
  ] },
  { id: 'sugar', name: 'Blood sugar and diabetes', tests: [
    { n: 'Fasting blood sugar (FBS)', a: 'fbs glucose fasting', p: 'fast8' },
    { n: 'Random blood sugar (RBS)', a: 'rbs glucose random' },
    { n: 'HbA1c', a: 'glycosylated hemoglobin a1c glycated' },
    { n: '75 g oral glucose tolerance test (OGTT)', a: 'ogtt 75g gtt', p: 'fast8' },
    { n: '2-hour post-prandial blood sugar', a: '2hppbs ppbs postprandial' },
    { n: 'Fasting insulin', a: 'insulin homa', p: 'fast8' },
    { n: 'C-peptide', a: 'cpeptide' },
  ] },
  { id: 'lipid', name: 'Cholesterol and heart', tests: [
    { n: 'Lipid profile', a: 'cholesterol triglycerides hdl ldl lipid panel', p: 'fast10' },
    { n: 'Total cholesterol', a: 'cholesterol', p: 'fast10' },
    { n: 'Triglycerides', a: 'tg trig', p: 'fast10' },
    { n: 'Troponin I', a: 'trop i troponin' },
    { n: 'CK-MB', a: 'ckmb creatine kinase' },
    { n: 'CK total', a: 'cpk creatine kinase' },
    { n: 'hs-CRP', a: 'high sensitivity crp' },
    { n: 'NT-proBNP', a: 'bnp' },
  ] },
  { id: 'kidney', name: 'Kidney and electrolytes', tests: [
    { n: 'Creatinine', a: 'crea serum creatinine egfr' },
    { n: 'BUN', a: 'blood urea nitrogen urea' },
    { n: 'Uric acid (BUA)', a: 'bua blood uric acid gout' },
    { n: 'Sodium', a: 'na electrolytes' },
    { n: 'Potassium', a: 'k electrolytes' },
    { n: 'Chloride', a: 'cl electrolytes' },
    { n: 'Calcium, total', a: 'ca' },
    { n: 'Ionized calcium', a: 'ica' },
    { n: 'Magnesium', a: 'mg' },
    { n: 'Inorganic phosphorus', a: 'phosphate phos' },
    { n: 'Urine albumin-creatinine ratio', a: 'microalbumin uacr acr' },
    { n: '24-hour urine creatinine clearance', a: 'crcl 24h', p: 'urine24' },
    { n: '24-hour urine protein', a: '24h proteinuria', p: 'urine24' },
  ] },
  { id: 'liver', name: 'Liver and pancreas', tests: [
    { n: 'SGPT (ALT)', a: 'sgpt alt alanine aminotransferase liver' },
    { n: 'SGOT (AST)', a: 'sgot ast aspartate aminotransferase liver' },
    { n: 'Alkaline phosphatase', a: 'alp' },
    { n: 'Bilirubin, total, direct and indirect', a: 'b1b2 tb bilirubin jaundice' },
    { n: 'Total protein, albumin and globulin (TPAG)', a: 'tpag albumin protein' },
    { n: 'Albumin', a: 'alb' },
    { n: 'GGT', a: 'gamma gt ggtp' },
    { n: 'Amylase', a: '' },
    { n: 'Lipase', a: '' },
  ] },
  { id: 'hormone', name: 'Thyroid and hormones', tests: [
    { n: 'TSH', a: 'thyroid stimulating hormone thyroid' },
    { n: 'FT4', a: 'free t4 thyroid' },
    { n: 'FT3', a: 'free t3 thyroid' },
    { n: 'T3', a: 'thyroid total t3' },
    { n: 'T4', a: 'thyroid total t4' },
    { n: 'Anti-TPO antibodies', a: 'antitpo thyroid peroxidase' },
    { n: 'Prolactin', a: 'prl' },
    { n: 'FSH', a: 'follicle stimulating hormone' },
    { n: 'LH', a: 'luteinizing hormone' },
    { n: 'Estradiol', a: 'e2 estrogen' },
    { n: 'Progesterone', a: '' },
    { n: 'Testosterone, total', a: 'testosterone' },
    { n: 'Testosterone, free', a: 'free testosterone' },
    { n: 'DHEA-S', a: 'dheas dehydroepiandrosterone' },
    { n: 'SHBG', a: 'sex hormone binding globulin' },
    { n: 'Cortisol, morning', a: 'am cortisol' },
    { n: 'AMH', a: 'anti mullerian hormone ovarian reserve', sex: 'F' },
  ] },
  { id: 'vit', name: 'Vitamins, iron and minerals', tests: [
    { n: 'Vitamin D (25-hydroxy)', a: 'vit d 25oh' },
    { n: 'Vitamin B12', a: 'b12 cobalamin' },
    { n: 'Folate', a: 'folic acid' },
    { n: 'Ferritin', a: 'iron stores' },
    { n: 'Serum iron and TIBC', a: 'iron tibc transferrin saturation' },
    { n: 'Serum zinc', a: 'zinc zn' },
  ] },
  { id: 'immuno', name: 'Infection and immunology', tests: [
    { n: 'HBsAg', a: 'hepatitis b surface antigen hep b' },
    { n: 'Anti-HBs', a: 'hepatitis b antibody immunity hep b' },
    { n: 'Anti-HBc (total)', a: 'hepatitis b core hep b' },
    { n: 'Anti-HCV', a: 'hepatitis c hep c' },
    { n: 'Anti-HAV IgM', a: 'hepatitis a hep a' },
    { n: 'HIV 1 and 2 screening', a: 'hiv' },
    { n: 'Syphilis (RPR)', a: 'rpr vdrl syphilis' },
    { n: 'TPHA', a: 'syphilis treponema' },
    { n: 'Dengue NS1 antigen', a: 'dengue ns1' },
    { n: 'Dengue IgG and IgM', a: 'dengue antibody duo' },
    { n: 'Typhidot', a: 'typhoid salmonella' },
    { n: 'Leptospira IgM', a: 'lepto leptospirosis' },
    { n: 'CRP', a: 'c reactive protein' },
    { n: 'Procalcitonin', a: 'pct' },
    { n: 'ASO titer', a: 'aso antistreptolysin' },
    { n: 'Rheumatoid factor (RF)', a: 'ra factor rf' },
    { n: 'ANA', a: 'antinuclear antibody lupus' },
    { n: 'Anti-dsDNA', a: 'lupus dsdna' },
    { n: 'Total IgE', a: 'ige allergy' },
    { n: 'H. pylori antibody', a: 'pylori' },
    { n: 'H. pylori stool antigen', a: 'pylori', p: 'stool' },
    { n: 'SARS-CoV-2 antigen test', a: 'covid antigen' },
    { n: 'SARS-CoV-2 RT-PCR', a: 'covid pcr swab' },
  ] },
  { id: 'urine', name: 'Urine, stool and pregnancy', tests: [
    { n: 'Urinalysis', a: 'ua routine urine', p: 'urine' },
    { n: 'Pregnancy test, urine', a: 'pt hcg pregnancy', sex: 'F', p: 'urine' },
    { n: 'Serum beta-hCG', a: 'pregnancy hcg quantitative', sex: 'F' },
    { n: 'Fecalysis', a: 'fa routine stool', p: 'stool' },
    { n: 'Fecal occult blood test (FOBT)', a: 'fobt fit occult', p: 'stool' },
    { n: 'Urine drug test', a: 'drug test shabu marijuana' },
  ] },
  { id: 'micro', name: 'Cultures and microbiology', tests: [
    { n: 'Blood culture and sensitivity, 2 sites', a: 'cs c/s culture' },
    { n: 'Urine culture and sensitivity', a: 'cs c/s culture uti', p: 'urine' },
    { n: 'Wound or pus culture and sensitivity', a: 'cs c/s culture' },
    { n: 'Gram stain', a: 'gs' },
    { n: 'Sputum AFB smear, 2 samples', a: 'afb tb tuberculosis dssm' },
    { n: 'GeneXpert MTB/RIF', a: 'tb tuberculosis xpert' },
    { n: 'KOH mount', a: 'fungal koh skin scraping' },
    { n: 'Fungal culture', a: 'fungus' },
    { n: 'Throat swab culture', a: 'cs strep' },
    { n: 'Stool culture', a: 'cs', p: 'stool' },
  ] },
  { id: 'path', name: 'Pathology', tests: [
    { n: 'Histopathology (tissue biopsy)', a: 'biopsy histopath skin punch' },
    { n: 'Pap smear', a: 'pap cervical', sex: 'F' },
    { n: 'Liquid-based Pap smear', a: 'lbc pap thinprep', sex: 'F' },
    { n: 'FNAB with cytology', a: 'fine needle aspiration' },
  ] },
  { id: 'tumor', name: 'Tumor markers', tests: [
    { n: 'PSA, total', a: 'prostate specific antigen' },
    { n: 'CEA', a: 'carcinoembryonic antigen' },
    { n: 'AFP', a: 'alpha fetoprotein' },
    { n: 'CA-125', a: 'ca125 ovarian', sex: 'F' },
    { n: 'CA 15-3', a: 'ca153 breast' },
    { n: 'CA 19-9', a: 'ca199 pancreas' },
  ] },
];

// Imaging, by modality. Each part may carry:
//   v: views to choose from, d: views ticked by default
//   side: true when left, right or both has to be named
//   c: true when CT or MRI asks plain or with contrast
const XR = 'X-ray', US = 'Ultrasound', CT = 'CT scan', MR = 'MRI', MG = 'Mammography';
export const IMAGING = [
  { id: 'xray', name: XR, a: 'x ray xray radiograph plain film', groups: [
    { name: 'Chest and ribs', parts: [
      { n: 'Chest', a: 'cxr lungs', v: ['PA', 'lateral', 'AP', 'apicolordotic', 'lateral decubitus'], d: ['PA'] },
      { n: 'Ribs', v: ['AP', 'PA', 'oblique'], d: ['AP', 'oblique'], side: true },
      { n: 'Sternum', v: ['RAO', 'lateral'], d: ['RAO', 'lateral'] },
      { n: 'Clavicle', v: ['AP', 'AP axial'], d: ['AP'], side: true },
    ] },
    { name: 'Head and neck', parts: [
      { n: 'Skull', v: ['AP', 'PA', 'lateral', 'Towne'], d: ['AP', 'lateral'] },
      { n: 'Paranasal sinuses', a: 'pns sinus series', v: ['Waters', 'Caldwell', 'lateral'], d: ['Waters', 'Caldwell', 'lateral'] },
      { n: 'Facial bones', v: ['Waters', 'Caldwell', 'lateral'], d: ['Waters', 'Caldwell', 'lateral'] },
      { n: 'Nasal bone', v: ['lateral', 'Waters'], d: ['lateral'] },
      { n: 'Mandible', v: ['PA', 'oblique', 'Towne'], d: ['PA', 'oblique'] },
      { n: 'Temporomandibular joints', a: 'tmj', v: ['open mouth', 'closed mouth'], d: ['open mouth', 'closed mouth'] },
      { n: 'Soft tissue neck', a: 'airway', v: ['AP', 'lateral'], d: ['AP', 'lateral'] },
    ] },
    { name: 'Spine', parts: [
      { n: 'Cervical spine', a: 'c spine neck', v: ['AP', 'lateral', 'oblique', 'odontoid (open mouth)', 'flexion and extension'], d: ['AP', 'lateral'] },
      { n: 'Thoracic spine', a: 't spine', v: ['AP', 'lateral', 'swimmer'], d: ['AP', 'lateral'] },
      { n: 'Lumbosacral spine', a: 'ls spine lumbar back', v: ['AP', 'lateral', 'oblique', 'flexion and extension'], d: ['AP', 'lateral'] },
      { n: 'Thoracolumbar spine', a: 'tl spine', v: ['AP', 'lateral'], d: ['AP', 'lateral'] },
      { n: 'Sacrum and coccyx', a: 'tailbone', v: ['AP', 'lateral'], d: ['AP', 'lateral'] },
      { n: 'Scoliosis series', a: 'whole spine', v: ['standing PA', 'standing lateral', 'bending views'], d: ['standing PA', 'standing lateral'] },
    ] },
    { name: 'Abdomen and pelvis', parts: [
      { n: 'Abdomen', a: 'kub plain abdomen flat plate', v: ['supine', 'upright', 'left lateral decubitus'], d: ['supine', 'upright'] },
      { n: 'KUB', a: 'kidneys ureters bladder', v: ['supine'], d: ['supine'] },
      { n: 'Pelvis', v: ['AP', 'inlet and outlet'], d: ['AP'] },
      { n: 'Sacroiliac joints', a: 'si joints', v: ['AP axial', 'oblique'], d: ['AP axial'] },
    ] },
    { name: 'Arm and hand', parts: [
      { n: 'Shoulder', v: ['AP internal rotation', 'AP external rotation', 'axillary', 'scapular Y'], d: ['AP internal rotation', 'AP external rotation'], side: true },
      { n: 'Scapula', v: ['AP', 'lateral'], d: ['AP', 'lateral'], side: true },
      { n: 'Humerus', a: 'arm', v: ['AP', 'lateral'], d: ['AP', 'lateral'], side: true },
      { n: 'Elbow', v: ['AP', 'lateral', 'oblique'], d: ['AP', 'lateral'], side: true },
      { n: 'Forearm', a: 'radius ulna', v: ['AP', 'lateral'], d: ['AP', 'lateral'], side: true },
      { n: 'Wrist', v: ['PA', 'lateral', 'oblique', 'scaphoid'], d: ['PA', 'lateral'], side: true },
      { n: 'Hand', v: ['PA', 'oblique', 'lateral'], d: ['PA', 'oblique'], side: true },
      { n: 'Finger', a: 'digit thumb', v: ['PA', 'oblique', 'lateral'], d: ['PA', 'oblique', 'lateral'], side: true },
      { n: 'Bone age (left hand)', a: 'bone age', v: ['PA'], d: ['PA'] },
    ] },
    { name: 'Leg and foot', parts: [
      { n: 'Hip', v: ['AP', 'frog-leg lateral'], d: ['AP', 'frog-leg lateral'], side: true },
      { n: 'Femur', a: 'thigh', v: ['AP', 'lateral'], d: ['AP', 'lateral'], side: true },
      { n: 'Knee', v: ['AP', 'lateral', 'standing AP', 'skyline', 'oblique'], d: ['AP', 'lateral'], side: true },
      { n: 'Leg (tibia and fibula)', a: 'tibia fibula leg', v: ['AP', 'lateral'], d: ['AP', 'lateral'], side: true },
      { n: 'Ankle', v: ['AP', 'lateral', 'mortise'], d: ['AP', 'lateral', 'mortise'], side: true },
      { n: 'Foot', v: ['AP', 'oblique', 'lateral', 'standing lateral'], d: ['AP', 'oblique', 'lateral'], side: true },
      { n: 'Heel (calcaneus)', a: 'calcaneus heel', v: ['axial', 'lateral'], d: ['axial', 'lateral'], side: true },
    ] },
  ] },

  { id: 'us', name: US, a: 'ultrasound utz ultz ultrasonography sonography sono', groups: [
    { name: 'Abdomen', parts: [
      { n: 'Whole abdomen', a: 'wab', p: 'usfast' },
      { n: 'Upper abdomen', a: 'liver gallbladder pancreas spleen', p: 'usfast' },
      { n: 'Hepatobiliary tree (HBT)', a: 'hbt liver gallbladder', p: 'usfast' },
      { n: 'Kidneys, ureters and bladder (KUB)', a: 'kub renal', p: 'bladder' },
      { n: 'KUB with prostate', a: 'kub prostate', p: 'bladder' },
      { n: 'Inguinal', a: 'hernia groin', side: true },
    ] },
    { name: 'Pelvis and pregnancy', parts: [
      { n: 'Pelvic', a: 'uterus ovaries', v: ['transabdominal', 'transvaginal'], d: ['transabdominal'], sex: 'F' },
      { n: 'Transrectal (prostate)', a: 'trus prostate' },
      { n: 'Scrotal', a: 'testes testicular' },
      { n: 'Obstetric', a: 'ob pregnancy fetal', v: ['first trimester', 'biometry', 'biophysical profile', 'congenital anomaly scan'], d: [], sex: 'F' },
    ] },
    { name: 'Neck and breast', parts: [
      { n: 'Thyroid', a: 'neck', p: '' },
      { n: 'Neck soft tissue', a: 'lymph nodes' },
      { n: 'Breast', v: [], side: true },
      { n: 'Axilla', a: 'armpit', side: true },
    ] },
    { name: 'Skin, face and soft tissue', parts: [
      { n: 'Face soft tissue (filler mapping)', a: 'filler face facial aesthetic', v: [] },
      { n: 'Soft tissue mass', a: 'lump lipoma cyst' },
      { n: 'Superficial vessels of the face', a: 'facial artery doppler filler', v: [] },
    ] },
    { name: 'Joints and muscles', parts: [
      { n: 'Shoulder', side: true },
      { n: 'Elbow', side: true },
      { n: 'Wrist', side: true },
      { n: 'Knee', side: true },
      { n: 'Ankle', side: true },
    ] },
    { name: 'Doppler', parts: [
      { n: 'Carotid Doppler', a: 'carotid neck vessels' },
      { n: 'Lower extremity venous Doppler', a: 'dvt veins varicose', side: true },
      { n: 'Lower extremity arterial Doppler', a: 'pad arteries', side: true },
      { n: 'Upper extremity venous Doppler', a: 'veins', side: true },
      { n: 'Renal artery Doppler', a: 'kidney', p: 'usfast' },
    ] },
  ] },

  { id: 'ct', name: CT, a: 'ct scan cat scan computed tomography', groups: [
    { name: 'Head and neck', parts: [
      { n: 'Brain', a: 'head cranial', c: true },
      { n: 'Paranasal sinuses', a: 'pns sinus', c: true },
      { n: 'Orbits', a: 'eye', c: true },
      { n: 'Temporal bones', a: 'ear', c: true },
      { n: 'Facial bones (maxillofacial)', a: 'face', c: true },
      { n: 'Neck', a: 'soft tissue neck', c: true },
    ] },
    { name: 'Chest, abdomen and pelvis', parts: [
      { n: 'Chest', a: 'lungs thorax', c: true },
      { n: 'Chest, high resolution (HRCT)', a: 'hrct lungs interstitial' },
      { n: 'Whole abdomen', a: 'abdomen', c: true },
      { n: 'Upper abdomen', a: 'liver pancreas', c: true },
      { n: 'Whole abdomen and pelvis', a: 'abdomen pelvis', c: true },
      { n: 'KUB stonogram', a: 'kidney stone kub plain' },
      { n: 'Pelvis', c: true },
    ] },
    { name: 'Spine and limbs', parts: [
      { n: 'Cervical spine', a: 'c spine', c: true },
      { n: 'Thoracic spine', a: 't spine', c: true },
      { n: 'Lumbosacral spine', a: 'ls spine lumbar', c: true },
      { n: 'Upper extremity', a: 'arm shoulder elbow wrist', side: true, c: true },
      { n: 'Lower extremity', a: 'leg hip knee ankle', side: true, c: true },
    ] },
    { name: 'CT angiography', parts: [
      { n: 'CT angiography, brain', a: 'cta head' },
      { n: 'CT angiography, neck', a: 'cta carotid' },
      { n: 'CT angiography, chest (pulmonary)', a: 'cta pulmonary embolism' },
      { n: 'CT coronary angiography', a: 'ccta heart calcium score' },
      { n: 'CT angiography, aorta', a: 'cta aorta' },
      { n: 'CT angiography, lower extremities', a: 'cta legs runoff' },
    ] },
  ] },

  { id: 'mri', name: MR, a: 'mri magnetic resonance', groups: [
    { name: 'Head and neck', parts: [
      { n: 'Brain', a: 'head', c: true },
      { n: 'Brain with MR angiography', a: 'mra', c: true },
      { n: 'Pituitary (sella)', a: 'sella pituitary', c: true },
      { n: 'Orbits', a: 'eye', c: true },
      { n: 'Internal auditory canals', a: 'iac ear', c: true },
      { n: 'Neck soft tissue', a: 'neck', c: true },
      { n: 'Face soft tissue', a: 'face facial filler', c: true },
    ] },
    { name: 'Spine', parts: [
      { n: 'Cervical spine', a: 'c spine', c: true },
      { n: 'Thoracic spine', a: 't spine', c: true },
      { n: 'Lumbosacral spine', a: 'ls spine lumbar back', c: true },
      { n: 'Whole spine', c: true },
    ] },
    { name: 'Body', parts: [
      { n: 'Upper abdomen', a: 'liver', c: true },
      { n: 'MRCP', a: 'bile ducts', p: 'usfast' },
      { n: 'Pelvis', c: true },
      { n: 'Prostate', c: true },
      { n: 'Breasts', a: 'breast', c: true, sex: 'F' },
    ] },
    { name: 'Joints', parts: [
      { n: 'Shoulder', c: true, side: true },
      { n: 'Elbow', c: true, side: true },
      { n: 'Wrist', c: true, side: true },
      { n: 'Hip', c: true, side: true },
      { n: 'Knee', c: true, side: true },
      { n: 'Ankle', c: true, side: true },
    ] },
  ] },

  { id: 'mammo', name: MG, a: 'mammogram mammography breast', groups: [
    { name: 'Breast', parts: [
      { n: 'Screening, both breasts', a: 'screening', v: ['CC', 'MLO'], d: ['CC', 'MLO'], p: 'mammo', sex: 'F' },
      { n: 'Diagnostic', a: 'diagnostic lump', v: ['CC', 'MLO', 'spot compression', 'magnification'], d: ['CC', 'MLO'], side: true, p: 'mammo' },
    ] },
  ] },
];

// Heart, lungs, nerves and scopes, listed by name like the laboratory.
export const DX = [
  { id: 'heart', name: 'Heart', tests: [
    { n: '12-lead ECG', a: 'ecg ekg electrocardiogram' },
    { n: '2D echocardiogram with Doppler', a: '2d echo echo heart ultrasound' },
    { n: 'Treadmill stress test', a: 'tmst stress test exercise', p: 'treadmill' },
    { n: '24-hour Holter monitoring', a: 'holter' },
    { n: '24-hour ambulatory blood pressure monitoring', a: 'abpm bp monitoring' },
  ] },
  { id: 'lungs', name: 'Lungs and sleep', tests: [
    { n: 'Spirometry with bronchodilator', a: 'pft pulmonary function test spirometry' },
    { n: 'Polysomnography (sleep study)', a: 'psg sleep apnea' },
  ] },
  { id: 'nerve', name: 'Brain and nerves', tests: [
    { n: 'EEG', a: 'electroencephalogram seizure' },
    { n: 'EMG and nerve conduction study', a: 'emg ncv ncs' },
  ] },
  { id: 'bone', name: 'Bone', tests: [
    { n: 'Bone mineral density (DEXA), hip and lumbar spine', a: 'dexa dxa bmd osteoporosis' },
  ] },
  { id: 'scope', name: 'Scopes', tests: [
    { n: 'Upper GI endoscopy', a: 'egd endoscopy scope stomach', p: 'egd' },
    { n: 'Colonoscopy', a: 'colon scope', p: 'colon' },
    { n: 'Nasopharyngolaryngoscopy', a: 'npl scope nose throat' },
  ] },
  { id: 'senses', name: 'Ears and eyes', tests: [
    { n: 'Pure tone audiometry', a: 'hearing test audiometry pta' },
    { n: 'Tympanometry', a: 'ear' },
  ] },
];

// Printed under Patient preparation, once each, in this order. A key later in
// a pair replaces the earlier one (fast10 covers fast8).
export const PREP = {
  fast8: 'Blood test: fast for 8 to 10 hours before the blood is taken. Water is allowed.',
  fast10: 'Blood test: fast for 10 to 12 hours before the blood is taken. Water is allowed.',
  urine: 'Urine: give a midstream sample in a sterile container at the laboratory.',
  urine24: '24-hour urine: discard the first morning urine, then collect all urine for 24 hours up to and including the next first morning urine. Keep it cool.',
  stool: 'Stool: collect a fresh sample in a clean container and bring it within 2 hours.',
  usfast: 'Ultrasound: no food for 6 to 8 hours before the scan. Water is allowed.',
  bladder: 'Ultrasound: come with a full bladder. Drink 4 to 6 glasses of water 1 hour before and do not urinate until after the scan.',
  transvaginal: 'Transvaginal ultrasound: empty your bladder before the scan.',
  contrast: 'Contrast study: bring a recent creatinine result.',
  mri: 'MRI: tell the imaging center about any pacemaker, metal implant or surgical clip before the scan.',
  mammo: 'Mammography: put no deodorant, powder or lotion on the chest and underarms on the day of the test.',
  treadmill: 'Treadmill test: wear rubber shoes and eat only a light meal 2 hours before.',
  egd: 'Endoscopy: no food or drink for 8 hours before.',
  colon: 'Colonoscopy: ask the endoscopy unit for the bowel preparation before the day.',
};
const PREP_ORDER = Object.keys(PREP);

// What each line is for, shown beside it under Doctor and clinic.
export const PREP_LABELS = {
  fast8: 'Blood test, 8 to 10 hours fasting (FBS, OGTT, fasting insulin)',
  fast10: 'Blood test, 10 to 12 hours fasting (lipid profile, cholesterol, triglycerides)',
  urine: 'Urine (urinalysis, urine culture, urine pregnancy test)',
  urine24: '24-hour urine (creatinine clearance, urine protein)',
  stool: 'Stool (fecalysis, FOBT, stool culture, H. pylori antigen)',
  usfast: 'Ultrasound, fasting (whole and upper abdomen, HBT, renal Doppler, MRCP)',
  bladder: 'Ultrasound, full bladder (KUB, pelvic transabdominal, first trimester)',
  transvaginal: 'Transvaginal ultrasound',
  contrast: 'CT or MRI with contrast',
  mri: 'MRI',
  mammo: 'Mammography',
  treadmill: 'Treadmill stress test',
  egd: 'Upper GI endoscopy',
  colon: 'Colonoscopy',
};
const SUPERSEDES = { fast10: 'fast8' };

// Ready-made sets. Names must match the catalog; tests marked sex 'F' are
// left out for a male patient.
export const SETS = [
  { label: 'Annual check-up', items: ['lab:CBC with platelet count', 'lab:Fasting blood sugar (FBS)', 'lab:Lipid profile', 'lab:Creatinine', 'lab:BUN', 'lab:Uric acid (BUA)', 'lab:SGPT (ALT)', 'lab:Urinalysis', 'lab:Fecalysis', 'img:xray:Chest:PA'] },
  { label: 'Before surgery, adult', items: ['lab:CBC with platelet count', 'lab:Blood typing (ABO and Rh)', 'lab:Prothrombin time (PT) with INR', 'lab:APTT', 'lab:Fasting blood sugar (FBS)', 'lab:Creatinine', 'lab:Sodium', 'lab:Potassium', 'lab:Urinalysis', 'img:xray:Chest:PA', 'dx:12-lead ECG'] },
  { label: 'Isotretinoin, before starting', items: ['lab:CBC with platelet count', 'lab:Lipid profile', 'lab:SGPT (ALT)', 'lab:SGOT (AST)', 'lab:Serum beta-hCG'] },
  { label: 'Isotretinoin, monthly', items: ['lab:Lipid profile', 'lab:SGPT (ALT)', 'lab:Pregnancy test, urine'] },
  { label: 'Hair loss', items: ['lab:CBC with platelet count', 'lab:Ferritin', 'lab:TSH', 'lab:FT4', 'lab:Vitamin D (25-hydroxy)', 'lab:Serum zinc'] },
  { label: 'Hormonal acne or PCOS', items: ['lab:Testosterone, total', 'lab:Testosterone, free', 'lab:DHEA-S', 'lab:LH', 'lab:FSH', 'lab:Prolactin', 'lab:Fasting blood sugar (FBS)', 'lab:Fasting insulin'] },
  { label: 'Fever for 3 days or more', items: ['lab:CBC with platelet count', 'lab:Dengue NS1 antigen', 'lab:Dengue IgG and IgM', 'lab:Urinalysis'] },
  { label: 'Diabetes follow-up', items: ['lab:Fasting blood sugar (FBS)', 'lab:HbA1c', 'lab:Creatinine', 'lab:Lipid profile', 'lab:SGPT (ALT)', 'lab:Urinalysis', 'lab:Urine albumin-creatinine ratio'] },
  { label: 'High blood pressure, first visit', items: ['lab:CBC with platelet count', 'lab:Fasting blood sugar (FBS)', 'lab:Lipid profile', 'lab:Creatinine', 'lab:Sodium', 'lab:Potassium', 'lab:Urinalysis', 'dx:12-lead ECG'] },
  { label: 'Thyroid', items: ['lab:TSH', 'lab:FT4', 'img:us:Thyroid'] },
  { label: 'Pregnancy, first visit', items: ['lab:CBC with platelet count', 'lab:Blood typing (ABO and Rh)', 'lab:Urinalysis', 'lab:HBsAg', 'lab:HIV 1 and 2 screening', 'lab:Syphilis (RPR)', 'lab:Fasting blood sugar (FBS)', 'img:us:Obstetric:first trimester'] },
];

// ── lookups ──────────────────────────────────────────────────────
export function norm(s) {
  return String(s || '').toLowerCase().replace(/x-ray/g, 'xray x ray').replace(/[^a-z0-9/]+/g, ' ').trim();
}

export function findLab(name) {
  for (const c of LAB) for (const t of c.tests) if (t.n === name) return { ...t, cat: c.id, catName: c.name };
  return null;
}
export function findDx(name) {
  for (const c of DX) for (const t of c.tests) if (t.n === name) return { ...t, cat: c.id, catName: c.name };
  return null;
}
export function findPart(mod, name) {
  const m = IMAGING.find(x => x.id === mod);
  if (!m) return null;
  for (const g of m.groups) for (const p of g.parts) if (p.n === name) return { ...p, group: g.name, mod: m.id, modName: m.name };
  return null;
}
export const modName = id => IMAGING.find(m => m.id === id)?.name || id;

// "AP and lateral", "AP, lateral and mortise"
export function joinViews(v) {
  if (!v || !v.length) return '';
  return v.length === 1 ? v[0] : v.slice(0, -1).join(', ') + ' and ' + v.at(-1);
}

// The line printed for one request, without its group heading.
export function requestLine(t) {
  if (t.kind !== 'img') return t.name;
  // the detail names the exact spot, so it sits with the part: "Finger (middle), right"
  let note = (t.note || '').trim();
  if (/^[A-Z][a-z]/.test(note)) note = note[0].toLowerCase() + note.slice(1);
  const bits = [note ? `${t.name} (${note})` : t.name];
  if (t.side) bits.push(t.side.toLowerCase() === 'both' ? 'both sides' : t.side.toLowerCase());
  if (t.views?.length) bits.push(joinViews(t.views));
  if (t.contrast) bits.push(t.contrast.toLowerCase());
  return bits.join(', ');
}

// Heading the request sits under on paper and in the editor.
export function groupOf(t) {
  if (t.kind === 'img') return modName(t.mod);
  if (t.kind === 'dx') return DX.find(c => c.id === t.cat)?.name || 'Other tests';
  return LAB.find(c => c.id === t.cat)?.name || 'Other laboratory tests';
}

export function groupOrder(t) {
  if (t.kind === 'lab') { const i = LAB.findIndex(c => c.id === t.cat); return i < 0 ? 99 : i; }
  if (t.kind === 'img') return 100 + IMAGING.findIndex(m => m.id === t.mod);
  const i = DX.findIndex(c => c.id === t.cat);
  return 200 + (i < 0 ? 99 : i);
}

export function prepKeys(tests) {
  const keys = new Set();
  for (const t of tests) {
    if (t.p) keys.add(t.p);
    if (t.kind === 'img') {
      if (t.mod === 'us' && t.name === 'Pelvic') {
        if (t.views?.includes('transabdominal')) keys.add('bladder');
        if (t.views?.includes('transvaginal')) keys.add('transvaginal');
      }
      if (t.mod === 'us' && t.name === 'Obstetric' && t.views?.includes('first trimester')) keys.add('bladder');
      if (/contrast/i.test(t.contrast || '')) keys.add('contrast');
      if (t.mod === 'mri') keys.add('mri');
    }
  }
  for (const [later, earlier] of Object.entries(SUPERSEDES)) if (keys.has(later)) keys.delete(earlier);
  return PREP_ORDER.filter(k => keys.has(k));
}

// The preparation lines one request prints, as { key, text }.
//   wording: the doctor's own default for a line ('' stops it printing)
//   edits:   changes made on this request only ('' removes the line)
//   extra:   lines typed in for this request
export function prepLines(tests, wording = {}, edits = {}, extra = []) {
  const out = [];
  for (const k of prepKeys(tests)) {
    const text = (k in edits ? edits[k] : (k in wording ? wording[k] : PREP[k])) || '';
    if (text.trim()) out.push({ key: k, text: text.trim() });
  }
  extra.forEach((t, i) => { if (t && t.trim()) out.push({ key: 'extra:' + i, text: t.trim() }); });
  return out;
}

export function prepFor(tests, wording = {}) {
  return prepLines(tests, wording).map(l => l.text);
}

export const CONTRAST = ['Plain', 'With contrast', 'Plain and with contrast'];
export const SIDES = ['Left', 'Right', 'Both'];
