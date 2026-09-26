import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-2xl',
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Dark overlay backdrop */}
      <div
        className="fixed inset-0 bg-[#111111]/70 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      <div className="min-h-full flex items-center justify-center p-4">
        <div
          className={`relative w-full ${maxWidth} bg-white border border-charcoal-100 rounded-sm shadow-2xl z-10 overflow-hidden transform transition-all`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-charcoal-100 bg-white">
            <div>
              <h3 className="text-sm font-bold uppercase font-mono-code text-charcoal-900 tracking-wider">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-charcoal-500 mt-0.5">{subtitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-charcoal-400 hover:text-charcoal-900 transition-colors p-1 rounded-sm hover:bg-charcoal-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
};
