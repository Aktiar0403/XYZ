// app.js – Updated with Datalist Medicine/Test Picker
import { loadMedicinesFromFile, medicines } from './medicines.js';
import { loadDiagnosisRulesFromFile, getMissingFields, getMatchedDiagnoses } from './diagnosis.js';
import { applyReferenceTooltips } from './inputhints.js';

let visitData = {};
let matched = [];
let finalMeds = new Set();
let finalTests = new Set();
let finalDiagnosis = "";

window.addEventListener('DOMContentLoaded', async () => {
  await loadDiagnosisRulesFromFile();
  console.log(diagnosisRules)
  await loadMedicinesFromFile();

  const form = document.querySelector('#visit-form');
  if (form) applyReferenceTooltips(form);

  populateDatalists();
document.getElementById('manual-medicine')?.addEventListener('change', (e) => {
  const val = e.target.value.trim();
  const found = medicines.find(m => m.name === val || m.composition === val || `${m.name} (${m.composition})` === val);
  if (found) {
    document.getElementById('dose-field').value = found.dose || '';
    document.getElementById('instruction-field').value = found.instructions || '';
  }
});

  // ✅ Add manual medicine
  document.getElementById('add-manual-medicine')?.addEventListener('click', () => {
  const val = document.getElementById('manual-medicine').value.trim();
  const dose = document.getElementById('dose-field').value.trim();
  const instruction = document.getElementById('instruction-field').value.trim();

  if (val) {
    // Combine into one string (optional customization)
    const medText = dose || instruction
      ? `${val} - ${dose || ''} ${instruction || ''}`.trim()
      : val;

    finalMeds.add(medText);
  }

  // Clear fields
  document.getElementById('manual-medicine').value = '';
  document.getElementById('dose-field').value = '';
  document.getElementById('instruction-field').value = '';
  renderFinalMeds();
});


  // ✅ Add manual test
  document.getElementById('add-manual-test')?.addEventListener('click', () => {
    const val = document.getElementById('manual-test').value.trim();
    if (val) finalTests.add(val);
    document.getElementById('manual-test').value = '';
    renderFinalTests();
  });

  document.getElementById('generate-diagnosis')?.addEventListener('click', () => {
    visitData = collectVisitData();
    matched = getMatchedDiagnoses(visitData);
    const missing = getMissingFields(visitData);
    console.log("Collected visitData:", visitData);
    console.log("Matched Diagnoses:", matched);
    console.log("Missing Fields:", missing);

    renderDiagnosisOptions(matched);
    populateSuggestions(matched);
    renderFinalMeds();
    renderFinalTests();

    document.getElementById('doctor-diagnosis').value = "";
    document.getElementById('patient-diagnosis').value = matched.map(d => `• ${d.patientExplanation}`).join('\n\n');
    document.getElementById('missing-fields').innerText = missing.length
      ? `Please complete: ${missing.join(', ')}` : '';
  });

  document.getElementById('print-button')?.addEventListener('click', () => {
    document.getElementById('print-date').innerText = new Date().toLocaleDateString();
    document.getElementById('print-patient-name').innerText = visitData?.info?.['patient-name'] || '';
    document.getElementById('print-patient-age').innerText = visitData?.info?.['patient-age'] || '';
    document.getElementById('print-patient-location').innerText = visitData?.info?.['patient-location'] || '';
    document.getElementById('print-doctor-diagnosis').innerText = finalDiagnosis;
    document.getElementById('print-patient-diagnosis').innerText = document.getElementById('patient-diagnosis').value;
    document.getElementById('print-medicine-output').innerText = Array.from(finalMeds).join('\n');
    document.getElementById('print-test-output').innerText = Array.from(finalTests).join('\n');
    exportToPDF('printable-prescription');
  });
});

function collectVisitData() {
  const data = {};
  document.querySelectorAll('[data-section]').forEach(input => {
    const section = input.dataset.section;
    const key = input.id;
    const value = input.value?.trim();
    if (!data[section]) data[section] = {};
    data[section][key] = value;
  });
  return data;
}

function renderDiagnosisOptions(matched) {
  const container = document.getElementById('diagnosis-choice');
  container.innerHTML = '';
  matched.forEach((m, i) => {
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'diagnosis';
    radio.value = m.diagnosis;
    radio.id = `diag-${i}`;
    radio.className = 'mr-2';
    if (i === 0) {
      radio.checked = true;
      finalDiagnosis = m.diagnosis;
    }
    radio.addEventListener('change', () => finalDiagnosis = m.diagnosis);

    const label = document.createElement('label');
    label.htmlFor = `diag-${i}`;
    label.className = 'block text-sm';
    label.innerText = m.diagnosis;

    container.appendChild(radio);
    container.appendChild(label);
  });
}

function populateSuggestions(matched) {
  finalMeds.clear();
  finalTests.clear();
  matched.forEach(m => {
    m.suggestedMedicines?.forEach(med => finalMeds.add(med));
    m.recommendedTests?.forEach(test => finalTests.add(test));
  });
}

function renderFinalMeds() {
  const container = document.getElementById('final-medicines');
  container.innerHTML = '';
  finalMeds.forEach(med => {
    const pill = document.createElement('span');
    pill.className = 'px-2 py-1 bg-blue-100 rounded-full text-sm flex items-center gap-1';
    pill.innerText = med;
    const close = document.createElement('button');
    close.innerText = '❌';
    close.className = 'ml-2 text-xs text-red-600';
    close.onclick = () => {
      finalMeds.delete(med);
      renderFinalMeds();
    };
    pill.appendChild(close);
    container.appendChild(pill);
  });
}

function renderFinalTests() {
  const container = document.getElementById('final-tests');
  container.innerHTML = '';
  finalTests.forEach(test => {
    const pill = document.createElement('span');
    pill.className = 'px-2 py-1 bg-green-100 rounded-full text-sm flex items-center gap-1';
    pill.innerText = test;
    const close = document.createElement('button');
    close.innerText = '❌';
    close.className = 'ml-2 text-xs text-red-600';
    close.onclick = () => {
      finalTests.delete(test);
      renderFinalTests();
    };
    pill.appendChild(close);
    container.appendChild(pill);
  });
}

function populateDatalists() {
  const medList = document.getElementById('medicine-list');
  const testList = document.getElementById('test-list');

  const seen = new Set();
  medicines.forEach(m => {
    [m.name, m.composition, `${m.name} (${m.composition})`].forEach(val => {
      if (val && !seen.has(val)) {
        const option = document.createElement('option');
        option.value = val;
        medList.appendChild(option);
        seen.add(val);
      }
    });
  });

  const tests = [
    'eGFR', 'Creatinine', 'Urea', 'Potassium', 'Sodium', 'Calcium', 'Phosphate',
    'Bicarbonate', 'Hemoglobin', 'Albumin', 'PTH',
    'Urine ACR', '24h Urine Protein',
    'Ultrasound KUB', 'Kidney Size', 'Echogenicity', 'Hydronephrosis', 'Stones', 'Cysts',
    'ANA', 'ASO', 'Vitamin D', 'B12', 'Uric Acid', 'Magnesium', 'TSH', 'Prolactin', 'HBsAg',
    'Lipid Profile', 'Urinalysis', 'Chest X-ray', 'CT KUB', 'Fundus Exam', 'Ferritin', 'Iron Studies',
    'Arterial Blood Gas (ABG)', 'ECG', 'CBC', 'Mantoux Test'
  ];

  tests.forEach(t => {
    const option = document.createElement('option');
    option.value = t;
    testList.appendChild(option);
  });
}
