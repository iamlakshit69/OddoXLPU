import React from 'react';

export const Badge = ({ children, status, variant, className = '' }) => {
  // Map backend status strings to visual styles
  const getStyle = () => {
    const s = (status || variant || '').toUpperCase();
    switch (s) {
      case 'DRAFT':
        return 'bg-amber-50 text-amber-700 border-amber-300';
      case 'READY':
      case 'PICKED':
        return 'bg-blue-50 text-blue-700 border-blue-300';
      case 'PACKED':
        return 'bg-purple-50 text-purple-700 border-purple-300';
      case 'VALIDATED':
      case 'DONE':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold';
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'IN_STOCK':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'LOW_STOCK':
        return 'bg-amber-50 text-amber-800 border-amber-300 font-semibold';
      case 'OUT_OF_STOCK':
        return 'bg-rose-50 text-rose-700 border-rose-300 font-bold';
      case 'ADMIN':
        return 'bg-odoo-surface text-odoo-dark border-odoo/40';
      case 'MANAGER':
        return 'bg-charcoal-50 text-charcoal-900 border-charcoal-200';
      case 'ORANGE':
      case 'SAFETY':
        return 'bg-safety-light text-safety-dark border-safety/30';
      default:
        return 'bg-charcoal-50 text-charcoal-700 border-charcoal-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] uppercase font-mono-code tracking-wider border ${getStyle()} ${className}`}
    >
      {children || status}
    </span>
  );
};
