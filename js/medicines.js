// medicine.js – Smart medicine engine for NephroCare Pro

export let medicines = [];

// Load medicines from external JSON
export async function loadMedicinesFromFile(url = '.data/medicines.json') {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to load medicines');
    medicines = await response.json();
    return medicines;
  } catch (error) {
    console.error('Error loading medicines:', error);
    return [];
  }
}

// Get medicines linked to a diagnosis
export function getMedicinesForDiagnosis(diagnosisText) {
  if (!diagnosisText || !diagnosisText.length) return [];
  const matches = [];

  for (const med of medicines) {
    if (!med.linkedDiagnosis) continue;
    for (const linked of med.linkedDiagnosis) {
      if (diagnosisText.includes(linked)) {
        matches.push({
          name: med.name,
          dose: med.dose || "As directed",
          instructions: med.instructions || "Take as prescribed",
          type: med.type || "",
          reason: med.indication || "Kidney care"
        });
        break;
      }
    }
  }

  return matches;
}

// Get autofill for a selected medicine
export function getAutofillDetails(medName) {
  const med = medicines.find(m => m.name === medName);
  if (!med) return null;
  return {
    dose: med.dose || "As directed",
    instructions: med.instructions || "Take as prescribed",
    reason: med.indication || "Kidney care"
  };
}

// Add medicine to global list (if allowing user-entry)
export function addMedicine(med) {
  medicines.push(med);
}
