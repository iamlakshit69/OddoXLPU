import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-150 select-none uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-0.5';

  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-1.5 gap-1.5 rounded-sm',
    md: 'text-xs px-4 py-2.5 gap-2 rounded-sm',
    lg: 'text-sm px-6 py-3.5 gap-2.5 rounded-sm font-semibold',
  };

  const variants = {
    primary:
      'bg-safety text-white hover:bg-safety-hover shadow-subtle border border-safety-dark active:bg-safety-dark',
    secondary:
      'bg-charcoal-900 text-white hover:bg-charcoal-800 border border-charcoal-900',
    outline:
      'bg-white text-charcoal-900 border border-charcoal-100 hover:border-charcoal-900 hover:bg-charcoal-50',
    odoo:
      'bg-odoo-dark text-white hover:bg-odoo border border-odoo-dark',
    ghost:
      'bg-transparent text-charcoal-700 hover:bg-charcoal-100 hover:text-charcoal-900',
    danger:
      'bg-red-600 text-white hover:bg-red-700 border border-red-700',
    success:
      'bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-700',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : Icon ? (
        <Icon className="w-3.5 h-3.5" />
      ) : null}
      {children}
    </button>
  );
};
