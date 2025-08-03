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
  const matches = [];

  // Step 1: Group rules by exclusiveGroup (if any)
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

  // Step 2: From each exclusiveGroup, pick only the first match (or customize logic)
  for (const group of Object.values(grouped)) {
    matches.push(group[0]); // use first matched rule (you can sort or rank if needed)
  }

  // Step 3: Add all ungrouped matches
  matches.push(...ungrouped);

  return matches;
}


// For doctor panel display
export function generateDiagnosisText(visit) {
  const matches = getMatchedDiagnoses(visit);
  return matches.length
    ? matches.map(r => `- ${r.diagnosis} (Reason: ${r.doctorReason})`).join('\n')
    : "No diagnosis suggestions matched.";
}

// Safe getMissingFields logic
export function getMissingFields(visit) {
  const needed = new Set();
  const validKeys = new Set(Object.keys(visit).flatMap(section =>
    Object.keys(visit[section] || {})
  ));

  for (const rule of diagnosisRules) {
    if (rule.missingFields) {
      for (const field of rule.missingFields) {
        const [section, key] = field.includes('-') ? field.split('-') : ["", field];
        if (!visit[section] || !(key in visit[section])) {
          if (!validKeys.has(key)) continue; // skip invalid field
          needed.add(field);
        }
      }
    }
  }

  return Array.from(needed);
}
