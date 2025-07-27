// diagnosis.js – final refactored version for NephroCare Pro

export let diagnosisRules = [];

// Load diagnosis rules from external enriched JSON file
export async function loadDiagnosisRulesFromFile(url = '/data/diagnosisRules.json') {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to load diagnosis rules');
    diagnosisRules = await response.json();
    return diagnosisRules;
  } catch (error) {
    console.error('Error loading diagnosis rules:', error);
    return [];
  }
}

// Evaluate a single condition
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

// Evaluate whether a rule is triggered
export function evaluateRule(rule, visit) {
  if (rule.type === "simple") {
    return evaluateCondition({
      section: "blood",
      field: rule.test,
      operator: rule.operator,
      value: rule.threshold
    }, visit);
  }

  if (rule.type === "multi" || rule.type === "compound") {
    return rule.conditions.every(cond => evaluateCondition(cond, visit));
  }

  return false;
}

// Generate diagnosis output for UI display or PDF
export function generateDiagnosisText(visit) {
  const matches = [];
  for (const rule of diagnosisRules) {
    if (evaluateRule(rule, visit)) {
      matches.push(`- ${rule.diagnosis || rule.suggestion} (Reason: ${rule.doctorReason || rule.reason})`);
    }
  }
  return matches.length ? matches.join('\n') : "No diagnosis suggestions matched.";
}

// Return all missing fields across rules for prompting the user
export function getMissingFields(visit) {
  const needed = new Set();
  for (const rule of diagnosisRules) {
    if (rule.missingFields) {
      for (const field of rule.missingFields) {
        const [section, key] = field.includes('-') ? field.split('-') : ["", field];
        if (!visit[section] || visit[section][key] === undefined) {
          needed.add(field);
        }
      }
    }
  }
  return Array.from(needed);
}
