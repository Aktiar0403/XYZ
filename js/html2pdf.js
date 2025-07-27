// html2pdf.js – Export visit summary and prescription to PDF

import html2pdf from 'html2pdf.js';

export function exportToPDF(containerId = 'pdf-content', filename = 'NephroCare_Report.pdf') {
  const element = document.getElementById(containerId);
  if (!element) {
    console.error(`Element with ID '${containerId}' not found.`);
    return;
  }

  const opt = {
    margin: 0.5,
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
}
