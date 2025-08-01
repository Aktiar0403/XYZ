import { referenceRanges } from './referenceRanges.js';

export function applyReferenceTooltips(formElement) {
  const inputs = formElement.querySelectorAll('input[type=number], select');

  inputs.forEach(input => {
    const fieldId = input.id;
    const ref = referenceRanges[fieldId];
    if (!fieldId || !ref) return;

    // Tooltip text
    let tooltip = '';
    if (ref.min !== undefined && ref.max !== undefined) {
      tooltip = `Normal: ${ref.min}–${ref.max}${ref.unit ? ' ' + ref.unit : ''}`;
    } else if (ref.values) {
      tooltip = `Accepted: ${ref.values.join(', ')}`;
    }

    // Add tooltip attribute
    if (tooltip) {
      input.setAttribute('title', tooltip);
      input.classList.add('has-tooltip');

      // Add inline small hint
      const hint = document.createElement('small');
      hint.className = 'text-gray-500 text-xs block mt-1';
      hint.innerText = tooltip;
      input.insertAdjacentElement('afterend', hint);
    }

    // Add red highlight if out of range
    input.addEventListener('input', () => {
      const val = parseFloat(input.value);
      if (isNaN(val)) return;

      if (ref.min !== undefined && ref.max !== undefined) {
        if (val < ref.min || val > ref.max) {
          input.classList.add('border-red-500', 'bg-red-50');
        } else {
          input.classList.remove('border-red-500', 'bg-red-50');
        }
      }
    });
  });
}
