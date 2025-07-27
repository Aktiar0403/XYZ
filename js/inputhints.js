// js/inputhints.js
import { referenceRanges } from 'js/referenceRanges.js';

export function applyReferenceTooltips(formElement) {
  const inputs = formElement.querySelectorAll('input, select');

  inputs.forEach(input => {
    const fieldName = input.name;
    if (!fieldName || !referenceRanges[fieldName]) return;

    const ref = referenceRanges[fieldName];
    let tooltip = '';

    if (ref.min !== undefined && ref.max !== undefined && ref.unit) {
      tooltip = `Normal: ${ref.min}–${ref.max} ${ref.unit}`;
    } else if (ref.values) {
      tooltip = `Accepted: ${ref.values.join(', ')}`;
    }

    if (tooltip) {
      input.setAttribute('title', tooltip);
      input.classList.add('has-tooltip');
    }
  });
}
