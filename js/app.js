// app.js – NephroCare Pro: Enhanced Output Integration

import { loadDiagnosisRulesFromFile, getMissingFields, getMatchedDiagnoses } from './diagnosis.js';
import { loadMedicinesFromFile, getMedicinesForDiagnosis, getAutofillDetails } from './medicines.js';
import { applyReferenceTooltips } from './inputhints.js';
import { exportToPDF } from './html2pdf.js';

let visitData = {};

window.addEventListener('DOMContentLoaded', async () => {
  await loadDiagnosisRulesFromFile();
  await loadMedicinesFromFile();

  const form = document.querySelector('#visit-form');
  if (form) applyReferenceTooltips(form);

  const doctorOutput = document.getElementById('doctor-diagnosis');
  const patientOutput = document.getElementById('patient-diagnosis');
  const missingPrompt = document.getElementById('missing-fields');
  const medicineOutput = document.getElementById('medicine-output');

  document.getElementById('generate-diagnosis')?.addEventListener('click', () => {
    visitData = collectVisitData();
    const matches = getMatchedDiagnoses(visitData);
    const missing = getMissingFields(visitData);

    if (matches.length) {
      doctorOutput.value = matches.map(d => `• ${d.diagnosis}: ${d.doctorReason}`).join('\n\n');
      patientOutput.value = matches.map(d => `• ${d.patientExplanation}`).join('\n\n');
      if (medicineOutput) {
        const allMeds = matches.flatMap(m => m.suggestedMedicines || []);
        medicineOutput.innerHTML = allMeds.map(m => `<div class='mb-2'>• <strong>${m.name}</strong>: ${m.purpose || ''}</div>`).join('');
      }
    } else {
      doctorOutput.value = "No diagnosis suggestions matched.";
      patientOutput.value = "We couldn't identify a condition based on current inputs.";
      if (medicineOutput) medicineOutput.innerHTML = "";
    }

    if (missingPrompt) {
      missingPrompt.innerHTML = missing.length
        ? `Please complete: <span class='text-red-500 font-semibold'>${missing.join(', ')}</span>`
        : '';
    }
  });

  document.getElementById('print-button')?.addEventListener('click', () => {
    exportToPDF('pdf-content', 'NephroCare_Prescription.pdf');
  });
});

function collectVisitData() {
  const data = {
    blood: {}, urine: {}, symptoms: {}, medical: {}, vitals: {}, ultrasound: {}, reports: {}, infection: {}
  };

  document.querySelectorAll('input, select, textarea').forEach(el => {
    const id = el.id;
    const val = el.type === 'checkbox' ? el.checked : el.value;
    const section = getSectionName(id);
    if (section && id) {
      if (el.type === 'number') {
        const num = parseFloat(val);
        if (!isNaN(num)) data[section][id] = num;
      } else if (val !== '') {
        data[section][id] = val;
      }
    }
  });

  return data;
}

function getSectionName(fieldName) {
  if (!fieldName) return null;
  if (document.getElementById(fieldName)?.closest('[x-show*=vitals]')) return 'vitals';
  if (document.getElementById(fieldName)?.closest('[x-show*=labs]')) return 'blood';
  if (document.getElementById(fieldName)?.closest('[x-show*=symptoms]')) return 'symptoms';
  if (document.getElementById(fieldName)?.closest('[x-show*=history]')) return 'medical';
  if (document.getElementById(fieldName)?.closest('[x-show*=imaging]')) return 'ultrasound';
  if (document.getElementById(fieldName)?.closest('[x-show*=advanced]')) return 'reports';
  return null;
}
