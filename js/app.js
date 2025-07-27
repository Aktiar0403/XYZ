// app.js – NephroCare Pro: Main Application Script

import { loadDiagnosisRulesFromFile, generateDiagnosisText, getMissingFields } from './diagnosis.js';
import { loadMedicinesFromFile, getMedicinesForDiagnosis, getAutofillDetails } from './medicines.js';
import { applyReferenceTooltips } from './inputhints.js';
import { exportToPDF } from './html2pdf.js';

let visitData = {};

window.addEventListener('DOMContentLoaded', async () => {
  const form = document.querySelector('#visit-form');
  const diagnosisOutput = document.querySelector('#diagnosis-output');
  const medicineOutput = document.querySelector('#medicine-output');
  const missingPrompt = document.querySelector('#missing-fields');
  const printButton = document.querySelector('#print-button');
if (printButton) {
  printButton.addEventListener('click', () => {
    exportToPDF('pdf-content', 'NephroCare_Prescription.pdf');
  });
}


  // Load rules and medicine database
  await loadDiagnosisRulesFromFile();
  await loadMedicinesFromFile();

  // Apply UI reference hints
  if (form) applyReferenceTooltips(form);

  // Form submission handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    visitData = serializeFormData(form);

    const diagnosisText = generateDiagnosisText(visitData);
    const missing = getMissingFields(visitData);
    const suggestedMeds = getMedicinesForDiagnosis(diagnosisText);

    diagnosisOutput.innerText = diagnosisText;
    missingPrompt.innerHTML = missing.length ? `Suggested Inputs: <ul>${missing.map(f => `<li>${f}</li>`).join('')}</ul>` : '';

    medicineOutput.innerHTML = suggestedMeds.map(med => `
      <div class="med-block">
        <strong>${med.name}</strong> – ${med.dose}<br/>
        ${med.instructions} <em>(${med.reason})</em>
      </div>`).join('\n');
  });
});

function serializeFormData(form) {
  const formData = new FormData(form);
  const obj = {};

  for (const [name, value] of formData.entries()) {
    if (!value.trim()) continue;
    const [section, field] = name.includes('-') ? name.split('-') : ['general', name];
    if (!obj[section]) obj[section] = {};
    obj[section][field] = isNaN(value) ? value : parseFloat(value);
  }

  return obj;
}
