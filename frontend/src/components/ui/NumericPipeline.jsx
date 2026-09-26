import React from 'react';
import { Check } from 'lucide-react';

/**
 * Numeric Workflow Pipeline
 * Renders indexed numeric step indicators (e.g. 01 DRAFT -> 02 PICKED -> 03 PACKED -> 04 VALIDATED)
 * with editorial Swiss typography and high-contrast state transitions.
 */
export const NumericPipeline = ({ steps = [], currentStepIndex = 0 }) => {
  return (
    <div className="inline-flex items-center bg-white border border-charcoal-100 rounded-sm p-1 shadow-subtle">
      {steps.map((step, index) => {
        const isPast = index < currentStepIndex;
        const isCurrent = index === currentStepIndex;
        const isFuture = index > currentStepIndex;

        const formattedIndex = String(index + 1).padStart(2, '0');

        return (
          <React.Fragment key={step.key || index}>
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-sm transition-all duration-200 ${
                isCurrent
                  ? 'bg-charcoal-900 text-white shadow-sm'
                  : isPast
                  ? 'text-emerald-700 bg-emerald-50/60'
                  : 'text-charcoal-400 bg-transparent'
              }`}
            >
              <div
                className={`flex items-center justify-center font-mono-code text-[11px] font-bold ${
                  isCurrent
                    ? 'text-safety'
                    : isPast
                    ? 'text-emerald-600'
                    : 'text-charcoal-300'
                }`}
              >
                {isPast ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : formattedIndex}
              </div>
              <span
                className={`text-[11px] font-mono-code uppercase tracking-wider font-semibold ${
                  isCurrent ? 'text-white' : isPast ? 'text-charcoal-800' : 'text-charcoal-400'
                }`}
              >
                {step.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div className="text-charcoal-300 px-1 font-mono-code text-xs select-none">
                /
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
