// inputhints.js – Enhanced tooltip + real-time validation

import { referenceRanges } from './referenceRanges.js';

export function applyReferenceTooltips(formElement) {
  const inputs = formElement.querySelectorAll('input[type=number], select');

  inputs.forEach(input => {
    const fieldId = input.id;
    const ref = referenceRanges[fieldId];
    if (!fieldId || !ref) return;

    let tooltip = '';
    if (ref.min !== undefined && ref.max !== undefined) {
      tooltip = `Normal: ${ref.min}–${ref.max}${ref.unit ? ' ' + ref.unit : ''}`;
    } else if (ref.values) {
      tooltip = `Accepted: ${ref.values.join(', ')}`;
    }

    if (tooltip) {
      input.setAttribute('title', tooltip);
      input.classList.add('has-tooltip');

      const hint = document.createElement('small');
      hint.className = 'text-gray-500 text-xs block mt-1';
      hint.innerText = tooltip;
      input.insertAdjacentElement('afterend', hint);
    }

    const validate = () => {
      const val = parseFloat(input.value);
      if (isNaN(val)) {
        input.classList.remove('border-red-500', 'bg-red-50', 'border-green-500', 'bg-green-50');
        return;
      }

      if (ref.min !== undefined && ref.max !== undefined) {
        if (val < ref.min || val > ref.max) {
          input.classList.add('border-red-500', 'bg-red-50');
          input.classList.remove('border-green-500', 'bg-green-50');
        } else {
          input.classList.add('border-green-500', 'bg-green-50');
          input.classList.remove('border-red-500', 'bg-red-50');
        }
      }
    };

    input.addEventListener('input', validate);
    validate(); // trigger on load
  });
}
