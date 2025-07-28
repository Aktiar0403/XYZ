export let diagnosisRules = [];

// Load enriched diagnosis rules
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


// Check if a rule is applicable (i.e., all its required fields are present)
export function isRuleApplicable(rule, visit) {
  if (!rule.missingFields || rule.missingFields.length === 0) return true;

  return rule.missingFields.every(field => {
    const [section, key] = field.includes('-') ? field.split('-') : ["", field];
    const value = visit?.[section]?.[key];
    return value !== undefined && value !== null && value !== '';
  });
}



// Generate diagnosis objects (not just text) for rendering in doctor & patient view
export function getMatchedDiagnoses(visit) {
  return diagnosisRules.filter(rule => isRuleApplicable(rule, visit));
}

// For doctor panel display
export function generateDiagnosisText(visit) {
  const matches = getMatchedDiagnoses(visit);
  return matches.length
    ? matches.map(r => `- ${r.diagnosis} (Reason: ${r.doctorReason})`).join('\n')
    : "No diagnosis suggestions matched.";
}

// Return missing fields across all rules
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
