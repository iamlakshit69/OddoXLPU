import React from 'react';

/**
 * Editorial Swiss-style Stat Card
 * Oversized typography numbers, safety-orange accent callouts, and clean technical border
 */
export const StatCard = ({
  number,
  label,
  sublabel,
  accent = false,
  badge,
  icon: Icon,
  trend,
  className = '',
}) => {
  return (
    <div
      className={`relative bg-white border border-charcoal-100 rounded-sm p-5 shadow-subtle overflow-hidden transition-all duration-200 hover:border-charcoal-900 group ${
        accent ? 'border-safety/40 ring-1 ring-safety/20' : ''
      } ${className}`}
    >
      {/* Top row: Label + Badge/Icon */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="text-[11px] font-mono-code font-bold uppercase tracking-wider text-charcoal-500 group-hover:text-charcoal-900 transition-colors">
          {label}
        </span>
        {badge && (
          <span className="text-[10px] font-mono-code font-bold px-1.5 py-0.5 rounded-sm bg-safety-light text-safety-dark border border-safety/20">
            {badge}
          </span>
        )}
        {Icon && !badge && (
          <Icon className="w-4 h-4 text-charcoal-400 group-hover:text-safety transition-colors" />
        )}
      </div>

      {/* Main Metric: Swiss oversized bold numeral */}
      <div className="flex items-baseline gap-2">
        <span className="font-numeric text-3xl sm:text-4xl font-black text-charcoal-900 tracking-tight">
          {number}
        </span>
        {trend && (
          <span className="text-xs font-mono-code font-semibold text-emerald-600">
            {trend}
          </span>
        )}
      </div>

      {/* Sublabel / Technical info */}
      {sublabel && (
        <div className="mt-2 pt-2 border-t border-charcoal-50 flex items-center justify-between text-[11px] text-charcoal-400 font-mono-code">
          <span>{sublabel}</span>
          <div className="w-1.5 h-1.5 rounded-full bg-charcoal-200 group-hover:bg-safety transition-colors" />
        </div>
      )}

      {/* Industrial accent bottom bar */}
      {accent && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-safety" />
      )}
    </div>
  );
};
