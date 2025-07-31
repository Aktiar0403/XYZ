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
    visitData = collectVisitData();
    const matches = getMatchedDiagnoses(visitData);
    const missing = getMissingFields(visitData);

    console.log("Collected visitData:", visitData);
    console.log("Matched Diagnoses:", matches);
    console.log("Missing Fields:", missing);

    if (matches.length) {
  doctorOutput.value = matches.map(d => `• ${d.diagnosis}: ${d.doctorReason}`).join('\n\n');
  patientOutput.value = matches.map(d => `• ${d.patientExplanation}`).join('\n\n');

  const allMeds = matches.flatMap(m => m.suggestedMedicines || []);
  medicineOutput.innerHTML = allMeds.length
    ? allMeds.map(m => `<div class='mb-2'>• <strong>${m.name}</strong>: ${m.purpose || ''}</div>`).join('')
    : '<div class="text-gray-500">No medicines suggested.</div>';
} else {
  const filledFields = Object.values(visitData).flatMap(section =>
    Object.values(section || {}).filter(v => v !== null && v !== '' && v !== false)
  );
  
  if (filledFields.length < 5) {
    doctorOutput.value = "No data received.";
    patientOutput.value = "Please fill in relevant patient details (symptoms, labs, vitals) so the app can analyze and assist you better.";
  } else {
    doctorOutput.value = "No diagnosis matched based on the current inputs.";
    patientOutput.value = "We couldn’t match a condition based on your provided data. Please review the inputs or consult a specialist.";
  }

  medicineOutput.innerHTML = '<div class="text-gray-500">No medicines suggested.</div>';
}


  document.getElementById('print-button')?.addEventListener('click', () => {
    exportToPDF('pdf-content', 'NephroCare_Prescription.pdf');
  });

  // ✅ SAVE button support
  document.getElementById('save-visit')?.addEventListener('click', () => {
    const visit = collectVisitData();
    saveVisitToLocalStorage(visit);
  });

  // ✅ Load existing visits on startup
  renderSavedVisits();
});

// ✅ Existing logic preserved
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

// ✅💾 Visit Save/Load Support
function saveVisitToLocalStorage(visit) {
  const visits = JSON.parse(localStorage.getItem("nephro_visits") || "[]");
  visits.push({ date: new Date().toLocaleString(), data: visit });
  localStorage.setItem("nephro_visits", JSON.stringify(visits));
  renderSavedVisits();
}

function renderSavedVisits() {
  const visits = JSON.parse(localStorage.getItem("nephro_visits") || "[]");
  const list = document.getElementById("saved-records-list");
  if (!list) return;
  list.innerHTML = "";

  visits.forEach((visit, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${visit.date}</strong>
      <button onclick="loadVisitFromStorage(${index})" class="ml-2 bg-blue-600 text-white px-2 py-1 rounded">Load</button>
      <button onclick="deleteVisit(${index})" class="ml-2 bg-red-600 text-white px-2 py-1 rounded">🗑️</button>
    `;
    list.appendChild(li);
  });
}

window.loadVisitFromStorage = function(index) {
  const visits = JSON.parse(localStorage.getItem("nephro_visits") || "[]");
  if (!visits[index]) return;

  const visit = visits[index].data;
  for (const section in visit) {
    for (const key in visit[section]) {
      const el = document.getElementById(key);
      if (!el) continue;
      const value = visit[section][key];

      if (el.type === "checkbox") {
        el.checked = !!value;
      } else {
        el.value = value;
      }
    }
  }
};

window.deleteVisit = function(index) {
  const visits = JSON.parse(localStorage.getItem("nephro_visits") || "[]");
  visits.splice(index, 1);
  localStorage.setItem("nephro_visits", JSON.stringify(visits));
  renderSavedVisits();
};
