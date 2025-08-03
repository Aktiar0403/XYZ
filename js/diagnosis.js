// diagnosis.js – Match diagnosis rules based on visitData

// 📦 Declare and export diagnosis rule store
export let diagnosisRules = [];

// 🔄 Load rules from file and update in-memory list
export async function loadDiagnosisRulesFromFile(url = './data/diagnosisRules.json') {
  const response = await fetch(url);
  const rules = await response.json();
  diagnosisRules.length = 0;
  diagnosisRules.push(...rules);
}

// 🧠 Match diagnosis rules against input data
export function getMatchedDiagnoses(data) {
  // 🛡️ Ensure at least 3 key inputs are filled before matching
  const importantSections = ['blood', 'vitals', 'symptoms', 'medical', 'urine', 'ultrasound'];
  const totalFieldsFilled = importantSections
    .flatMap(sec => Object.values(data[sec] || {}))
    .filter(val => val && val !== '').length;

  // 🚨 Show toast warning if insufficient data
  const toast = document.getElementById('toast-warning');
  if (totalFieldsFilled < 3) {
    if (toast) {
      toast.classList.remove('hidden');
      toast.innerText = '⚠️ Please enter at least 3 key values before generating diagnosis.';
      setTimeout(() => toast.classList.add('hidden'), 4000);
    }
    if (totalFieldsFilled < 3) {
  if (toast) {
    toast.classList.remove('hidden');
    toast.innerText = '⚠️ Not enough input to analyze. Please enter some vitals, labs, or symptoms.';
    setTimeout(() => toast.classList.add('hidden'), 4000);
  }

  return [{
    diagnosis: 'Insufficient Data',
    doctorReason: 'Not enough information provided to assess the case.',
    patientExplanation: 'Please enter some symptoms, test values, or history so we can begin analysis.',
    suggestedMedicines: [],
    recommendedTests: [],
    followUpAdvice: 'Complete at least 3 sections like vitals, labs, or history.'
  }];
}

  }

  // ✅ Match rules that meet conditions
  const matched = [];
  for (const rule of diagnosisRules) {
    if (matchRule(rule, data)) matched.push(rule);
  }
  return matched;
}

// 🧩 Helper: Evaluate if a rule matches the input data
function matchRule(rule, data) {
  if (!rule.conditions || !Array.isArray(rule.conditions)) return false;
  return rule.conditions.every(cond => {
    const section = data[cond.section];
    if (!section) return false;
    const val = section[cond.field];
    if (cond.equals !== undefined) return val === cond.equals;
    if (cond.greaterThan !== undefined) return parseFloat(val) > cond.greaterThan;
    if (cond.lessThan !== undefined) return parseFloat(val) < cond.lessThan;
    return false;
  });
}

// 🧱 Return list of fields required by any rule but missing in current data
export function getMissingFields(data) {
  const requiredFields = [];
  for (const rule of diagnosisRules) {
    for (const cond of rule.conditions || []) {
      const section = data[cond.section];
      if (!section || section[cond.field] === undefined || section[cond.field] === '') {
        requiredFields.push(`${cond.section}.${cond.field}`);
      }
    }
  }
  return [...new Set(requiredFields)];
}
