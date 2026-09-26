import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  SlidersHorizontal,
  Warehouse,
  History,
  Shield,
  Layers,
} from 'lucide-react';

export const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    {
      label: 'DASHBOARD',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'PRODUCTS & STOCK',
      path: '/products',
      icon: Package,
    },
    {
      label: 'RECEIPTS',
      path: '/receipts',
      icon: ArrowDownToLine,
    },
    {
      label: 'DELIVERIES',
      path: '/deliveries',
      icon: ArrowUpFromLine,
    },
    {
      label: 'TRANSFERS',
      path: '/transfers',
      icon: ArrowLeftRight,
    },
    {
      label: 'ADJUSTMENTS',
      path: '/adjustments',
      icon: SlidersHorizontal,
    },
    {
      label: 'WAREHOUSES',
      path: '/warehouses',
      icon: Warehouse,
    },
    {
      label: 'STOCK LEDGER',
      path: '/ledger',
      icon: History,
    },
  ];

  return (
    <aside className="w-56 bg-white border-r border-charcoal-100 flex flex-col justify-between shrink-0 select-none min-h-[calc(100vh-3rem)]">
      {/* Navigation Links */}
      <div className="py-4">
        <div className="px-4 mb-3">
          <span className="text-[10px] font-mono-code font-bold uppercase tracking-wider text-charcoal-400">
            OPERATIONS APPS
          </span>
        </div>

        <nav className="space-y-0.5 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-mono-code tracking-wide transition-all group relative ${
                  isActive
                    ? 'bg-charcoal-900 text-white font-bold shadow-sm'
                    : 'text-charcoal-700 hover:bg-charcoal-50 hover:text-charcoal-900'
                }`}
              >
                {/* Active Indicator Strip */}
                {isActive && (
                  <div className="absolute left-0 top-1 bottom-1 w-1 bg-safety rounded-r-sm" />
                )}
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive
                      ? 'text-safety'
                      : 'text-charcoal-400 group-hover:text-charcoal-700'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Info / System Health */}
      <div className="p-4 border-t border-charcoal-100 bg-[#FBFBFA]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-mono-code font-bold text-charcoal-700">
            SYSTEM ONLINE
          </span>
        </div>
        <p className="text-[10px] text-charcoal-400 font-mono-code">
          BACKEND: Node/Express
        </p>
        <p className="text-[10px] text-charcoal-400 font-mono-code">
          DATABASE: PostgreSQL/MySQL
        </p>
      </div>
    </aside>
  );
};
