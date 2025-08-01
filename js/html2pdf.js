

export function exportToPDF(containerId) {
  const element = document.getElementById(containerId);
  if (!element) return;
  element.classList.remove('hidden'); // temporarily show it
  html2pdf().from(element).save('Prescription.pdf');
  element.classList.add('hidden'); // hide again after printing
}
