// app.js – NephroCare Pro: Main Application Script

import { loadDiagnosisRulesFromFile, getMissingFields, getMatchedDiagnoses } from './diagnosis.js';
import { loadMedicinesFromFile, getMedicinesForDiagnosis, getAutofillDetails } from './medicines.js';
import { applyReferenceTooltips } from './inputhints.js';
import { exportToPDF } from './html2pdf.js';

let visitData = {};
function collectVisitData() {
  let visitData = {
    blood: {},
    urine: {},
    symptoms: {},
    medical: {},
    vitals: {},
    ultrasound: {},
    reports: {},
    infection: {}
  };

  // Patient vitals
  visitData.vitals["sbp"] = parseFloat(document.getElementById("sbp")?.value) || null;
  visitData.vitals["dbp"] = parseFloat(document.getElementById("dbp")?.value) || null;
  visitData.vitals["weight"] = parseFloat(document.getElementById("weight")?.value) || null;
  visitData.vitals["volume-status"] = document.getElementById("volume-status")?.value || "";

  // Blood Tests
  const bloodFields = ["creatinine", "egfr", "urea", "potassium", "sodium", "calcium", "phosphate", "bicarbonate", "hemoglobin", "albumin", "pth", "b12", "magnesium", "uric-acid", "prolactin", "tsh", "vitamin-d", "aso"];
  bloodFields.forEach(field => {
    const id = field.replace("uric-acid", "uric acid").replace("vitamin-d", "vitamin d"); // keys match diagnosis.js
    visitData.blood[id] = parseFloat(document.getElementById(field)?.value) || null;
  });

  // Infection & Antibodies
  visitData.blood["ana"] = document.getElementById("ana")?.value || null;
  visitData.infection["hbsag"] = document.getElementById("hbsag")?.value || null;

  // Urine Tests
  visitData.urine["acr"] = parseFloat(document.getElementById("acr")?.value) || null;
  visitData.urine["urine-protein-24h"] = parseFloat(document.getElementById("urine-protein-24h")?.value) || null;

  // Symptoms
  const symptoms = ["edema", "fatigue", "nausea", "vomiting", "breathlessness", "decreased-urine-output", "flank-pain", "hematuria", "polyuria", "sleep-history", "fever", "recurrent-infections"];
  symptoms.forEach(sym => {
    const key = sym.replace(/-/g, " ");
    visitData.symptoms[key] = document.getElementById(sym)?.checked || false;
  });

  // Medical History
  const medical = ["diabetes", "hypertension", "nsaid-use", "past-stone-disease", "family-ckd", "tb", "hiv", "hepatitis", "contrast-history", "lithium-use", "pregnancy-status"];
  medical.forEach(key => {
    visitData.medical[key.replace(/-/g, " ")] = document.getElementById(key)?.checked || false;
  });

  // Ultrasound
  const usg = ["kidney-size", "echogenicity", "parenchymal-thickness", "hydronephrosis", "stones", "cysts"];
  usg.forEach(field => {
    visitData.ultrasound[field.replace(/-/g, "")] = document.getElementById(field)?.value || "";
  });

  // Reports
  visitData.reports["cbc"] = document.getElementById("cbc")?.value || "";
  visitData.reports["ecg"] = document.getElementById("ecg")?.value || "";
  visitData.reports["abg"] = document.getElementById("abg")?.value || "";
  visitData.reports["lft"] = document.getElementById("lft")?.value || "";

  return visitData;
}
document.getElementById("generate-diagnosis").addEventListener("click", () => {
  const visit = collectVisitData();
  const doctorDx = generateDiagnosisText(visit);
  document.getElementById("doctor-diagnosis").value = doctorDx;

  // Optional: add patient-friendly version
  document.getElementById("patient-diagnosis").value = "This will be added from patient explanation engine."; // placeholder
});

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
