import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  User,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Building2,
  Bell,
  RefreshCw,
} from 'lucide-react';
import { AppLauncherModal } from './AppLauncherModal';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Map path to active module title
  const getModuleTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'OPERATIONS DASHBOARD';
    if (path.startsWith('/products')) return 'PRODUCT & STOCK CATALOG';
    if (path.startsWith('/receipts')) return 'RECEIPTS (INCOMING)';
    if (path.startsWith('/deliveries')) return 'DELIVERY ORDERS (OUTGOING)';
    if (path.startsWith('/transfers')) return 'INTERNAL TRANSFERS';
    if (path.startsWith('/adjustments')) return 'PHYSICAL ADJUSTMENTS';
    if (path.startsWith('/warehouses')) return 'WAREHOUSE INFRASTRUCTURE';
    if (path.startsWith('/ledger')) return 'STOCK MOVEMENT LEDGER';
    return 'INVENTORY MANAGEMENT';
  };



  return (
    <>
      <header className="sticky top-0 z-40 h-12 bg-[#5B3A52] text-white flex items-center justify-between px-4 select-none border-b border-[#472E40] shadow-sm">
        {/* Left Section: 3x3 App Launcher + Module Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setLauncherOpen(true)}
            className="p-1.5 hover:bg-white/10 rounded-sm transition-colors flex items-center justify-center group"
            title="App Launcher"
          >
            <div className="grid grid-cols-3 gap-1 p-0.5">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 bg-white/90 group-hover:bg-safety rounded-[0.5px] transition-colors"
                />
              ))}
            </div>
          </button>

          <div className="flex items-center gap-2">
            <span className="font-mono-code text-xs font-bold tracking-widest text-white/90">
              STOCKSENSE
            </span>
            <span className="text-white/40 font-mono-code text-xs">/</span>
            <span className="font-mono-code text-xs font-semibold tracking-wider text-safety-light">
              {getModuleTitle()}
            </span>
          </div>
        </div>

        {/* Center Section: Quick Search bar */}
        <div className="hidden md:flex items-center w-80 max-w-md">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              type="text"
              placeholder="Search products, orders, SKUs... (Ctrl+K)"
              className="w-full bg-white/10 hover:bg-white/15 focus:bg-white focus:text-charcoal-900 focus:placeholder:text-charcoal-400 text-white placeholder:text-white/50 text-xs pl-8 pr-3 py-1.5 rounded-sm outline-none transition-all border border-transparent focus:border-safety"
            />
          </div>
        </div>

        {/* Right Section: Role Switcher & User Avatar */}
        <div className="flex items-center gap-3">
          {/* Quick Module Switch Buttons */}
          <div className="hidden lg:flex items-center gap-1 font-mono-code text-[11px] mr-2">
            <button
              onClick={() => navigate('/products')}
              className={`px-2 py-1 rounded-sm hover:bg-white/10 transition-colors ${
                location.pathname.startsWith('/products') ? 'bg-white/20 text-white font-bold' : 'text-white/80'
              }`}
            >
              PRODUCTS
            </button>
            <button
              onClick={() => navigate('/receipts')}
              className={`px-2 py-1 rounded-sm hover:bg-white/10 transition-colors ${
                location.pathname.startsWith('/receipts') ? 'bg-white/20 text-white font-bold' : 'text-white/80'
              }`}
            >
              RECEIPTS
            </button>
            <button
              onClick={() => navigate('/deliveries')}
              className={`px-2 py-1 rounded-sm hover:bg-white/10 transition-colors ${
                location.pathname.startsWith('/deliveries') ? 'bg-white/20 text-white font-bold' : 'text-white/80'
              }`}
            >
              DELIVERIES
            </button>
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 px-2 py-1 hover:bg-white/10 rounded-sm transition-colors text-xs"
            >
              <div className="w-6 h-6 rounded-sm bg-safety text-white flex items-center justify-center font-bold text-[11px] font-mono-code">
                {user?.name ? user.name[0].toUpperCase() : 'A'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="font-semibold text-[11px] leading-tight text-white">
                  {user?.name || 'Admin'}
                </span>
                <span className="text-[9px] font-mono-code text-white/70">
                  {user?.role || 'ADMIN'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-white/60" />
            </button>

            {userDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-white text-charcoal-900 border border-charcoal-100 rounded-sm shadow-xl z-50 py-2">
                  <div className="px-4 py-2 border-b border-charcoal-50">
                    <p className="text-xs font-bold text-charcoal-900">{user?.name}</p>
                    <p className="text-[11px] text-charcoal-500 font-mono-code">{user?.email}</p>
                    <div className="mt-1.5 inline-block px-2 py-0.5 bg-safety-light text-safety-dark text-[10px] font-mono-code font-bold uppercase rounded-sm border border-safety/30">
                      {user?.role} ROLE
                    </div>
                  </div>



                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      navigate('/warehouses');
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-charcoal-700 hover:bg-charcoal-50 flex items-center gap-2"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    Warehouse Settings
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                      navigate('/auth/login');
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-charcoal-50 mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <AppLauncherModal
        isOpen={launcherOpen}
        onClose={() => setLauncherOpen(false)}
      />
    </>
  );
};
