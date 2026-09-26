import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Boxes,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  SlidersHorizontal,
  Package,
  Warehouse,
  History,
  LayoutDashboard,
  X,
} from 'lucide-react';

export const AppLauncherModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const modules = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      desc: 'Operations Overview & Metrics',
      icon: LayoutDashboard,
      path: '/dashboard',
      color: 'bg-charcoal-900 text-white',
    },
    {
      id: 'products',
      name: 'Products & Stock',
      desc: 'Catalog, SKUs & Categories',
      icon: Package,
      path: '/products',
      color: 'bg-[#5B3A52] text-white',
    },
    {
      id: 'receipts',
      name: 'Receipts',
      desc: 'Incoming Supplier Shipments',
      icon: ArrowDownToLine,
      path: '/receipts',
      color: 'bg-emerald-700 text-white',
    },
    {
      id: 'deliveries',
      name: 'Deliveries',
      desc: 'Outgoing Customer Orders',
      icon: ArrowUpFromLine,
      path: '/deliveries',
      color: 'bg-blue-700 text-white',
    },
    {
      id: 'transfers',
      name: 'Internal Transfers',
      desc: 'Inter-Warehouse Movements',
      icon: ArrowLeftRight,
      path: '/transfers',
      color: 'bg-purple-700 text-white',
    },
    {
      id: 'adjustments',
      name: 'Inventory Adjustments',
      desc: 'Physical Audits & Variance',
      icon: SlidersHorizontal,
      path: '/adjustments',
      color: 'bg-amber-600 text-white',
    },
    {
      id: 'warehouses',
      name: 'Warehouses & Locations',
      desc: 'Facilities, Aisles & Racks',
      icon: Warehouse,
      path: '/warehouses',
      color: 'bg-teal-700 text-white',
    },
    {
      id: 'ledger',
      name: 'Stock Ledger',
      desc: 'Immutable Audit Trail',
      icon: History,
      path: '/ledger',
      color: 'bg-slate-800 text-white',
    },
  ];

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-[#111111]/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="min-h-full flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-3xl bg-white border border-charcoal-100 rounded-sm shadow-2xl z-10 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-charcoal-100 bg-[#5B3A52] text-white">
            <div className="flex items-center gap-3">
              <div className="grid grid-cols-3 gap-1 p-1 bg-white/10 rounded-sm">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 bg-white rounded-[0.5px]" />
                ))}
              </div>
              <h2 className="text-xs font-mono-code font-bold uppercase tracking-wider">
                StockSense ERP • Module Launcher
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Grid */}
          <div className="p-8 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#F5F5F3]">
            {modules.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => handleSelect(m.path)}
                  className="flex flex-col items-center text-center p-5 bg-white border border-charcoal-100 rounded-sm hover:border-safety hover:shadow-card hover:-translate-y-1 transition-all group"
                >
                  <div
                    className={`w-12 h-12 rounded-sm ${m.color} flex items-center justify-center mb-3 shadow-subtle group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-charcoal-900 group-hover:text-safety transition-colors mb-1">
                    {m.name}
                  </span>
                  <span className="text-[10px] text-charcoal-500 line-clamp-2">
                    {m.desc}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-charcoal-100 bg-white flex items-center justify-between text-[11px] text-charcoal-500 font-mono-code">
            <span>PRESS ESC TO CLOSE</span>
            <span className="text-safety font-semibold">STOCKSENSE v1.0 ENTERPRISE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
