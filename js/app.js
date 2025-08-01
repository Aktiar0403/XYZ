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

    const filledFields = Object.values(visitData).flatMap(section =>
      Object.values(section || {}).filter(v => v !== null && v !== '' && v !== false)
    );

    if (filledFields.length === 0) {
      doctorOutput.value = "⚠️ No data entered.";
      patientOutput.value = "Please fill in the patient's vitals, symptoms, or lab reports so the app can help analyze the condition.";
      medicineOutput.innerHTML = '<div class="text-gray-500">No medicines suggested.</div>';
      missingPrompt.innerHTML = '';
      return;
    }

    console.log("Collected visitData:", visitData);
    console.log("Matched Diagnoses:", matches);
    console.log("Missing Fields:", missing);

    if (matches.length) {
      doctorOutput.value = matches.map(d => `• ${d.diagnosis}: ${d.doctorReason}`).join('\n\n');
      const testAdvice = matches
  .filter(m => m.recommendedTests?.length)
  .map(m => `🧪 For ${m.diagnosis}: ${m.recommendedTests.join(', ')}`)
  .join('\n');
  const finalMeds = new Set();
const finalTests = new Set();

const suggestedMedsBlock = document.getElementById('suggested-meds');
suggestedMedsBlock.innerHTML = '<h3 class="text-sm font-medium text-gray-700">AI Suggested Medicines:</h3>';

// Loop over matched diagnoses to get suggestions
matched.forEach(m => {
  m.suggestedMedicines?.forEach(med => {
    if (finalMeds.has(med)) return;

    const id = `med-${med.replace(/\s+/g, '-')}`;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = id;
    checkbox.value = med;
    checkbox.classList.add('mr-2');
    checkbox.addEventListener('change', e => {
      if (e.target.checked) finalMeds.add(med);
      else finalMeds.delete(med);
      renderFinalMeds();
    });

    const label = document.createElement('label');
    label.htmlFor = id;
    label.innerText = med;
    label.classList.add('block', 'text-sm');
    label.prepend(checkbox);

    suggestedMedsBlock.appendChild(label);
  });

  m.recommendedTests?.forEach(test => {
    finalTests.add(test); // add tests directly
  });
});

document.getElementById('add-manual-medicine')?.addEventListener('click', () => {
  const val = document.getElementById('manual-medicine').value.trim();
  if (val) {
    finalMeds.add(val);
    document.getElementById('manual-medicine').value = '';
    renderFinalMeds();
  }
});

document.getElementById('add-manual-test')?.addEventListener('click', () => {
  const val = document.getElementById('manual-test').value.trim();
  if (val) {
    finalTests.add(val);
    document.getElementById('manual-test').value = '';
    renderFinalTests();
  }
});

function renderFinalMeds() {
  document.getElementById('final-medicines').innerText = Array.from(finalMeds).join('\n');
}

function renderFinalTests() {
  document.getElementById('final-tests').innerText = Array.from(finalTests).join('\n');
}


if (testAdvice) {
  const testBlock = document.createElement('div');
  testBlock.className = 'mt-4';
  testBlock.innerHTML = `
    <h2 class="text-lg font-semibold text-indigo-700">🧪 Recommended Tests</h2>
    <div class="bg-white p-3 rounded border text-sm whitespace-pre-wrap">${testAdvice}</div>
  `;
  doctorOutput.parentNode.insertBefore(testBlock, doctorOutput.nextSibling);
}

      patientOutput.value = matches.map(d => `• ${d.patientExplanation}`).join('\n\n');

      const allMeds = matches.flatMap(m => m.suggestedMedicines || []);
      medicineOutput.innerHTML = allMeds.length
        ? allMeds.map(m => `
          <div class="mb-2 p-3 border-l-4 border-purple-400 bg-purple-50 text-purple-800 rounded shadow-sm transition hover:scale-[1.02]">
            <div class="font-semibold">${m.name}</div>
            <div class="text-sm text-gray-700">${m.purpose || ''}</div>
          </div>
        `).join('')
        : '<div class="text-gray-500">No medicines suggested.</div>';

    } else {
      const filledFieldsCount = Object.values(visitData).reduce((total, section) => {
        return total + Object.values(section || {}).filter(
          v => v !== null && v !== '' && v !== false
        ).length;
      }, 0);

      if (filledFieldsCount < 5) {
        doctorOutput.value = "No data received.";
        patientOutput.value = "Please fill in relevant patient details (symptoms, labs, vitals) so the app can analyze and assist you better.";
      } else {
        doctorOutput.value = "No diagnosis matched based on the current inputs.";
        patientOutput.value = "We couldn’t match a condition based on your provided data. Please review the inputs or consult a specialist.";
      }

      medicineOutput.innerHTML = '<div class="text-gray-500">No medicines suggested.</div>';
    }

    missingPrompt.innerHTML = missing.length
      ? `Please complete: <span class='text-red-500 font-semibold'>${missing.join(', ')}</span>`
      : '';
  });

  document.getElementById('print-button')?.addEventListener('click', () => {
   document.getElementById('print-date').innerText = new Date().toLocaleDateString();
document.getElementById('print-patient-name').innerText = visitData?.info?.['patient-name'] || '';
document.getElementById('print-patient-age').innerText = visitData?.info?.['patient-age'] || '';
document.getElementById('print-patient-location').innerText = visitData?.info?.['patient-location'] || '';

document.getElementById('print-doctor-diagnosis').innerText = doctorOutput.value;
document.getElementById('print-patient-diagnosis').innerText = patientOutput.value;
document.getElementById('print-medicine-output').innerText = Array.from(finalMeds).join('\n');
document.getElementById('print-test-output').innerText = Array.from(finalTests).join('\n');

exportToPDF('printable-prescription');
 
    exportToPDF('pdf-content', 'NephroCare_Prescription.pdf');
  });
});

function collectVisitData() {
  const data = {
    info: {},
    blood: {},
    urine: {},
    symptoms: {},
    medical: {},
    vitals: {},
    ultrasound: {},
    reports: {},
    infection: {}
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
  const el = document.getElementById(fieldName);
  return el?.dataset?.section || null;
}


// ✅🗂️ Visit Save/Load Support
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
