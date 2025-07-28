// app.js – NephroCare Pro: Main Application Script

import { loadDiagnosisRulesFromFile, getMissingFields, getMatchedDiagnoses } from './diagnosis.js';
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

 

form.addEventListener('submit', (e) => {
  e.preventDefault();
  visitData = serializeFormData(form);

  const diagnoses = getMatchedDiagnoses(visitData);
  const missing = getMissingFields(visitData);

  // Doctor + Patient Friendly Diagnosis Output
  diagnosisOutput.innerHTML = diagnoses.map(d =>
    `<div class="output-block">
      <strong>${d.diagnosis}</strong><br/>
      <em>Doctor:</em> ${d.doctorReason}<br/>
      <em>Patient:</em> ${d.patientExplanation}<br/>
      <em>Follow-Up:</em> ${d.followUpAdvice}
    </div><hr/>`
  ).join('');

  // Missing inputs
  missingPrompt.innerHTML = missing.length
    ? `Suggested Inputs: <ul>${missing.map(f => `<li>${f}</li>`).join('')}</ul>`
    : '';

  // Medicines (auto-linked from suggestedMedicines in rule itself)
  const suggestedMeds = [];
  diagnoses.forEach(d => {
    if (d.suggestedMedicines) suggestedMeds.push(...d.suggestedMedicines);
  });

  medicineOutput.innerHTML = suggestedMeds.map(med =>
    `<div class="med-block">
      <strong>${med.name}</strong> – ${med.purpose || ''}
    </div>`
  ).join('');
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
