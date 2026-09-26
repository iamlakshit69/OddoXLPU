import React, { forwardRef } from 'react';

export const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      icon: Icon,
      type = 'text',
      className = '',
      required = false,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-[11px] font-mono-code font-semibold uppercase text-charcoal-700 tracking-wider flex items-center justify-between">
            <span>
              {label} {required && <span className="text-safety">*</span>}
            </span>
          </label>
        )}
        <div className="relative flex items-center">
          {Icon && (
            <div className="absolute left-3 pointer-events-none text-charcoal-400">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <input
            ref={ref}
            type={type}
            required={required}
            className={`w-full bg-white text-charcoal-900 border text-xs px-3.5 py-2.5 rounded-sm outline-none transition-all placeholder:text-charcoal-300 font-sans ${
              Icon ? 'pl-9' : ''
            } ${
              error
                ? 'border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500'
                : 'border-charcoal-100 hover:border-charcoal-300 focus:border-safety focus:ring-1 focus:ring-safety'
            } ${className}`}
            {...props}
          />
        </div>
        {error && <span className="text-[11px] text-red-600 font-medium">{error}</span>}
        {helperText && !error && (
          <span className="text-[11px] text-charcoal-400">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export const Select = forwardRef(
  (
    {
      label,
      error,
      helperText,
      options = [],
      children,
      className = '',
      required = false,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-[11px] font-mono-code font-semibold uppercase text-charcoal-700 tracking-wider flex items-center justify-between">
            <span>
              {label} {required && <span className="text-safety">*</span>}
            </span>
          </label>
        )}
        <select
          ref={ref}
          required={required}
          className={`w-full bg-white text-charcoal-900 border text-xs px-3 py-2.5 rounded-sm outline-none transition-all font-sans cursor-pointer ${
            error
              ? 'border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500'
              : 'border-charcoal-100 hover:border-charcoal-300 focus:border-safety focus:ring-1 focus:ring-safety'
          } ${className}`}
          {...props}
        >
          {children ||
            options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
        </select>
        {error && <span className="text-[11px] text-red-600 font-medium">{error}</span>}
        {helperText && !error && (
          <span className="text-[11px] text-charcoal-400">{helperText}</span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
