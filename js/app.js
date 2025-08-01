
// app.js – Updated with Diagnosis Picker + Prescription Builder

import { loadDiagnosisRulesFromFile, getMissingFields, getMatchedDiagnoses } from './diagnosis.js';
import { loadMedicinesFromFile, getAutofillDetails } from './medicines.js';
import { applyReferenceTooltips } from './inputhints.js';
import { setupAutocomplete } from './autocomplete.js';

let visitData = {};
let matched = [];
let finalMeds = new Set();
let finalTests = new Set();
let finalDiagnosis = "";

window.addEventListener('DOMContentLoaded', async () => {
  await loadDiagnosisRulesFromFile();
  await loadMedicinesFromFile();

  const form = document.querySelector('#visit-form');
  if (form) applyReferenceTooltips(form);

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

  document.getElementById('add-manual-medicine')?.addEventListener('click', () => {
    const val = document.getElementById('medicine-search').value.trim();
    if (val) finalMeds.add(val);
    document.getElementById('medicine-search').value = '';
    renderFinalMeds();
  });

  document.getElementById('add-manual-test')?.addEventListener('click', () => {
    const val = document.getElementById('test-search').value.trim();
    if (val) finalTests.add(val);
    document.getElementById('test-search').value = '';
    renderFinalTests();
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
