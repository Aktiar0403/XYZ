export const referenceRanges = {
  // BLOOD TESTS
  creatinine:     { min: 0.6,  max: 1.3,   unit: 'mg/dL' },
  egfr:           { min: 60,   max: 120,   unit: 'mL/min/1.73m²' },
  urea:           { min: 10,   max: 50,    unit: 'mg/dL' },
  potassium:      { min: 3.5,  max: 5.2,   unit: 'mmol/L' },
  sodium:         { min: 135,  max: 145,   unit: 'mmol/L' },
  calcium:        { min: 8.5,  max: 10.5,  unit: 'mg/dL' },
  phosphate:      { min: 2.5,  max: 4.5,   unit: 'mg/dL' },
  bicarbonate:    { min: 22,   max: 29,    unit: 'mmol/L' },
  hemoglobin:     { min: 12,   max: 16,    unit: 'g/dL' },
  albumin:        { min: 3.5,  max: 5.5,   unit: 'g/dL' },
  pth:            { min: 10,   max: 65,    unit: 'pg/mL' },

  // VITALS
  sbp:            { min: 90,   max: 140,   unit: 'mmHg' },
  dbp:            { min: 60,   max: 90,    unit: 'mmHg' },
  weight:         { min: 30,   max: 200,   unit: 'kg' },

  // URINE TESTS
  acr:            { min: 0,    max: 30,    unit: 'mg/g' },
  "urine-protein-24h": { min: 0, max: 150, unit: 'mg/day' },

  // ADVANCED / REPORTS
  b12:            { min: 200,  max: 900,   unit: 'pg/mL' },
  tsh:            { min: 0.4,  max: 4.0,   unit: 'µIU/mL' },
  prolactin:      { min: 4.0,  max: 23.0,  unit: 'ng/mL' },
  uric_acid:      { min: 3.5,  max: 7.2,   unit: 'mg/dL' },
  magnesium:      { min: 1.7,  max: 2.4,   unit: 'mg/dL' },
  vitamin_d:      { min: 30,   max: 100,   unit: 'ng/mL' },
  aso:            { max: 200,             unit: 'IU/mL' },
  ana:            { values: ['Negative', 'Positive'] }
};


export function evaluateCondition(cond, visit) {
  const sectionData = visit[cond.section];
  if (!sectionData) return false;

  const val = sectionData[cond.field];
  if (val === undefined) return false;

  switch (cond.operator) {
    case "<": return parseFloat(val) < cond.value;
    case ">": return parseFloat(val) > cond.value;
    case "==": return val == cond.value;
    case "in": return cond.value.includes(val);
    default: return false;
  }
}

export function renderFields(data) {
  return Object.entries(data)
    .map(([key, value]) => {
      if (!value) value = 'Not provided';
      let style = '';
     if (referenceRanges[key]) {
  const { min, max, values } = referenceRanges[key];
  const num = parseFloat(value);

  if (!isNaN(num) && min !== undefined && max !== undefined) {
    if (num < min) style = 'color: orange;';
    else if (num > max) style = 'color: red;';
    else style = 'color: green;';
  } else if (values?.includes(value)) {
    if (value === 'Positive') style = 'color: red;';
    else if (value === 'Negative') style = 'color: green;';
    else style = 'color: gray;';
  }
}
 
      return `<li><strong>${key}:</strong> <span style="${style}">${value}</span></li>`;
    })
    .join('');
}