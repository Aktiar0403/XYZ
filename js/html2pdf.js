function exportToPDF(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;

  // Show the section temporarily
  el.classList.remove('hidden');

  // Set basic PDF options (A4 portrait)
  const opt = {
    margin:       0.5,
    filename:     'Prescription.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(el).save().then(() => {
    // Hide again after print
    el.classList.add('hidden');
  });
}

// Make available globally
window.exportToPDF = exportToPDF;
