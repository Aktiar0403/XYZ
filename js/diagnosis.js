// diagnosis.js – Improved diagnosis logic with better rule handling

export let diagnosisRules = [];

// Load enriched diagnosis rules from file
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

// Check if a rule is applicable based on missingFields and value presence
export function isRuleApplicable(rule, visit) {
  if (!rule || !rule.conditions || rule.conditions.length === 0) return false;

  return rule.conditions.every(cond => {
    const { section, field, operator, value } = cond;
    const inputVal = visit?.[section]?.[field];

    if (inputVal === undefined || inputVal === null || inputVal === '') return false;

    switch (operator) {
      case '==': return inputVal == value;
      case '!=': return inputVal != value;
      case '>': return parseFloat(inputVal) > value;
      case '<': return parseFloat(inputVal) < value;
      case 'in': return Array.isArray(value) && value.includes(inputVal);
      case 'not in': return Array.isArray(value) && !value.includes(inputVal);
      default: return false;
    }
  });
}


// Optional scoring function to prioritize rules
function scoreRule(rule) {
  if (!rule) return 0;
  let score = 0;
  if (rule.priority) score += rule.priority;
  if (rule.suggestedMedicines?.length) score += rule.suggestedMedicines.length;
  if (rule.recommendedTests?.length) score += rule.recommendedTests.length;
  return score;
}

// Return all matched rules from visitData
export function getMatchedDiagnoses(visit) {
  const matches = [];
  const grouped = {};
  const ungrouped = [];

  for (const rule of diagnosisRules) {
    if (!isRuleApplicable(rule, visit)) continue;

    if (rule.exclusiveGroup) {
      if (!grouped[rule.exclusiveGroup]) grouped[rule.exclusiveGroup] = [];
      grouped[rule.exclusiveGroup].push(rule);
    } else {
      ungrouped.push(rule);
    }
  }

  for (const groupRules of Object.values(grouped)) {
    const best = groupRules.sort((a, b) => scoreRule(b) - scoreRule(a))[0];
    if (best) matches.push(best);
  }

  matches.push(...ungrouped);
  return matches;
}

export function generateDiagnosisText(visit) {
  const matches = getMatchedDiagnoses(visit);
  return matches.length
    ? matches.map(r => `- ${r.diagnosis} (Reason: ${r.doctorReason})`).join('\n')
    : "No diagnosis suggestions matched.";
}

export function getMissingFields(visit) {
  const filledFields = new Set();

  // Collect all filled fields in section-field format
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
    return rule.missingFields.filter(f => !filledFields.has(f));
  };
}
