// diagnosis.js – includes patched getMissingFields

export let diagnosisRules = [];

export async function loadDiagnosisRulesFromFile() {
  const response = await fetch('./data/diagnosisRules.json');
  diagnosisRules = await response.json();
}

export function getMatchedDiagnoses(visitData) {
  return diagnosisRules.filter(rule => isRuleApplicable(rule, visitData));
}

export function isRuleApplicable(rule, visitData) {
  if (!rule.conditions || !Array.isArray(rule.conditions)) return false;
  return rule.conditions.every(cond => {
    const val = visitData?.[cond.section]?.[cond.field];
    switch (cond.operator) {
      case '==': return val === cond.value;
      case '!=': return val !== cond.value;
      case '<': return typeof val === 'number' && val < cond.value;
      case '<=': return typeof val === 'number' && val <= cond.value;
      case '>': return typeof val === 'number' && val > cond.value;
      case '>=': return typeof val === 'number' && val >= cond.value;
      case 'in': return Array.isArray(cond.value) && cond.value.includes(val);
      case 'not in': return Array.isArray(cond.value) && !cond.value.includes(val);
      default: return false;
    }
  });
}

// ✅ PATCHED VERSION that supports both "flank-pain" and "symptoms-flank-pain"
export function getMissingFields(visit) {
  const filledFields = new Set();

  for (const section in visit) {
    for (const field in visit[section]) {
      const value = visit[section][field];
      if (value !== null && value !== '' && value !== undefined) {
        filledFields.add(`${section}-${field}`);
      }
    }
  }

  return (rule) => {
    if (!rule?.missingFields?.length) return [];
    return rule.missingFields.filter(f => {
      // If it's already section-field, check directly
      if (f.includes('-')) return !filledFields.has(f);

      // If it's just field name, check if any section-field ends with that
      return ![...filledFields].some(ff => ff.endsWith(`-${f}`));
    });
  };
}
