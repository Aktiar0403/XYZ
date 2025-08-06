// app.js

import {
  loadDiagnosisRulesFromFile,
  getMatchedDiagnoses,
  getMissingFields
} from './diagnosis.js';

let visitData = {};

window.addEventListener('DOMContentLoaded', async () => {
  await loadDiagnosisRulesFromFile();

  document.getElementById('generate-diagnosis')?.addEventListener('click', handleGenerateDiagnosis);
  document.getElementById('print-button')?.addEventListener('click', () => exportToPDF('printable-prescription'));
  document.getElementById('reset-button')?.addEventListener('click', () => location.reload());
});

function handleGenerateDiagnosis() {
  visitData = collectVisitData();
  const matches = getMatchedDiagnoses(visitData);
  const missing = getMissingFields(visitData);

  console.log("📦 Collected visitData:", visitData);
  console.log("🧠 Matched Diagnoses:", matches);
  console.log("📋 Missing Fields:", missing);

  // Show missing field warning
  const missingFieldBox = document.getElementById('missing-fields');
  if (!Array.isArray(missing)) {
    missingFieldBox.textContent = "⚠️ Missing fields could not be determined.";
  } else if (missing.length > 0) {
    missingFieldBox.textContent = "⚠️ Please enter: " + missing.join(", ");
  } else {
    missingFieldBox.textContent = "";
  }

  const doctorBox = document.getElementById("doctor-diagnosis");
  const patientBox = document.getElementById("patient-diagnosis");
  const medBox = document.getElementById("final-medicines");
  const testBox = document.getElementById("final-tests");

  if (matches.length === 0) {
    doctorBox.value = "❌ No diagnosis found. Please review the inputs.";
    patientBox.value = "We couldn't find any matching condition with the provided data. Please consult your doctor for further evaluation.";
    medBox.textContent = "";
    testBox.textContent = "";
    return;
  }

  // Use first match as primary (you can allow selection)
  const diagnosis = matches[0];
  doctorBox.value = diagnosis.suggestion || "Diagnosis not named";
  patientBox.value = diagnosis.patientExplanation || "Ask your doctor for a clear explanation.";

  medBox.textContent = diagnosis.suggestedMedicines?.join("\n") || "No medicines listed.";
  testBox.textContent = diagnosis.recommendedTests?.join("\n") || "No tests listed.";

  // Fill printable fields
  document.getElementById("print-date").textContent = new Date().toLocaleDateString();
  document.getElementById("print-patient-name").textContent = document.getElementById("patient-name")?.value || "";
  document.getElementById("print-patient-age").textContent = document.getElementById("patient-age")?.value || "";
  document.getElementById("print-patient-location").textContent = document.getElementById("patient-location")?.value || "";
  document.getElementById("print-doctor-diagnosis").textContent = doctorBox.value;
  document.getElementById("print-patient-diagnosis").textContent = patientBox.value;
  document.getElementById("print-medicine-output").textContent = medBox.textContent;
  document.getElementById("print-test-output").textContent = testBox.textContent;
}

function collectVisitData() {
  const sections = ['vitals', 'blood', 'urine', 'medical', 'symptoms', 'ultrasound', 'reports', 'infection'];
  const data = {};
  sections.forEach(section => data[section] = {});

  document.querySelectorAll('.input').forEach(input => {
    const id = input.id;
    const section = input.getAttribute('data-section');
    if (!section) return;

    const val = input.type === 'number' ? parseFloat(input.value) : input.value;
    if (val || val === 0) data[section][id] = val;
  });

  document.querySelectorAll('input[type="checkbox"]').forEach(chk => {
    const id = chk.id;
    const section = chk.getAttribute('data-section');
    if (!section) return;

    data[section][id] = chk.checked;
  });

  return data;
}
