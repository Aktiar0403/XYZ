
import { getAutofillDetails } from './medicines.js';
import { renderFinalMeds, renderFinalTests, finalMeds, finalTests } from './app.js';

export function setupAutocomplete() {
  const medInput = document.getElementById('medicine-search');
  const medDropdown = document.getElementById('medicine-suggestions');
  const testInput = document.getElementById('test-search');
  const testDropdown = document.getElementById('test-suggestions');

  const knownTests = [
    'Renal Panel', 'Urine ACR', 'Ultrasound KUB', 'Serum Ferritin', 'Vitamin D',
    'PTH', 'Creatinine Clearance', 'ANA', 'HIV', 'HBsAg', 'TSH', 'B12', 'ASO', 'Lipid Profile'
  ];

  medInput?.addEventListener('input', () => {
    const term = medInput.value.trim().toLowerCase();
    if (!term) return (medDropdown.innerHTML = '', medDropdown.classList.add('hidden'));

    const matches = getAutofillDetails(term).slice(0, 5);
    medDropdown.innerHTML = '';
    matches.forEach(med => {
      const label = `${med.brand} (${med.composition})`;
      const div = document.createElement('div');
      div.textContent = label;
      div.className = 'p-2 cursor-pointer hover:bg-gray-100';
      div.addEventListener('click', () => {
        if (!finalMeds.has(label)) {
          finalMeds.add(label);
          renderFinalMeds();
        }
        medInput.value = '';
        medDropdown.innerHTML = '';
        medDropdown.classList.add('hidden');
      });
      medDropdown.appendChild(div);
    });
    medDropdown.classList.remove('hidden');
  });

  testInput?.addEventListener('input', () => {
    const term = testInput.value.trim().toLowerCase();
    if (!term) return (testDropdown.innerHTML = '', testDropdown.classList.add('hidden'));

    const matches = knownTests.filter(t => t.toLowerCase().includes(term)).slice(0, 5);
    testDropdown.innerHTML = '';
    matches.forEach(test => {
      const div = document.createElement('div');
      div.textContent = test;
      div.className = 'p-2 cursor-pointer hover:bg-gray-100';
      div.addEventListener('click', () => {
        if (!finalTests.has(test)) {
          finalTests.add(test);
          renderFinalTests();
        }
        testInput.value = '';
        testDropdown.innerHTML = '';
        testDropdown.classList.add('hidden');
      });
      testDropdown.appendChild(div);
    });
    testDropdown.classList.remove('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!medInput.contains(e.target)) medDropdown.classList.add('hidden');
    if (!testInput.contains(e.target)) testDropdown.classList.add('hidden');
  });
}
