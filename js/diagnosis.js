// diagnosis.js
export let diagnosisRules = [];

export async function loadDiagnosisRulesFromFile() {
  try {
    const response = await fetch('/data/diagnosisRules.json');
    diagnosisRules = await response.json();
    console.log("✅ Loaded rules:", diagnosisRules.length);
  } catch (err) {
    console.error("❌ Error loading diagnosisRules.json:", err);
  }
}

export function getMatchedDiagnoses(visitData) {
  return diagnosisRules.filter(rule => {
    if (rule.type === "simple") {
      const val = visitData?.[rule.section]?.[rule.field];
      return evalCondition(val, rule.operator, rule.value);
    }

    if (rule.type === "compound") {
      return rule.conditions.every(cond => {
        const val = visitData?.[cond.section]?.[cond.field];
        return evalCondition(val, cond.operator, cond.value);
      });
    }

    return false;
  });
}

function evalCondition(actual, operator, expected) {
  if (actual === undefined || actual === null) return false;
  switch (operator) {
    case "==": return actual == expected;
    case "!=": return actual != expected;
    case "<": return actual < expected;
    case "<=": return actual <= expected;
    case ">": return actual > expected;
    case ">=": return actual >= expected;
    case "in": return Array.isArray(expected) && expected.includes(actual);
    default: return false;
  }
}

export function getMissingFields(visitData) {
  const required = ["blood.egfr", "blood.creatinine", "urine.acr", "medical.diabetes"];
  const missing = [];

  required.forEach(f => {
    const [section, field] = f.split(".");
    if (!visitData?.[section]?.[field] && visitData?.[section]?.[field] !== 0) {
      missing.push(`${section}-${field}`);
    }
  });

  return missing;
}
