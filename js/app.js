// app.js – Diagnosis Output Logic

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
    console.log("Collected visitData:", visitData);
console.log("Matched Diagnoses:", matches);
console.log("Missing Fields:", missing);

    visitData = collectVisitData();
    const matches = getMatchedDiagnoses(visitData);
    const missing = getMissingFields(visitData);

    if (matches.length) {
      doctorOutput.value = matches.map(d => `• ${d.diagnosis}: ${d.doctorReason}`).join('\n\n');
      patientOutput.value = matches.map(d => `• ${d.patientExplanation}`).join('\n\n');

      const allMeds = matches.flatMap(m => m.suggestedMedicines || []);
      medicineOutput.innerHTML = allMeds.length
        ? allMeds.map(m => `<div class='mb-2'>• <strong>${m.name}</strong>: ${m.purpose || ''}</div>`).join('')
        : '<div class="text-gray-500">No medicines suggested.</div>';
    } else {
      doctorOutput.value = "No diagnosis matched.";
      patientOutput.value = "We couldn’t identify a clear condition from the inputs.";
      medicineOutput.innerHTML = "";
    }

    missingPrompt.innerHTML = missing.length
      ? `Please complete: <span class='text-red-500 font-semibold'>${missing.join(', ')}</span>`
      : '';
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
