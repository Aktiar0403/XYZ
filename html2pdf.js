function exportToPDF(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;

  el.classList.remove('hidden');

  const opt = {
    margin:       0.5,
    filename:     'Prescription.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(el).save().then(() => {
    el.classList.add('hidden');
  });
}

window.exportToPDF = exportToPDF;
