import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { warehouseApi } from '../../api/warehouseApi';
import { productApi } from '../../api/productApi';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Package,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  SlidersHorizontal,
  Plus,
  RefreshCw,
  ExternalLink,
  Layers,
  Building2,
  TrendingUp,
} from 'lucide-react';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, productsRes] = await Promise.all([
        warehouseApi.getDashboardStats(),
        productApi.listProducts({ lowStock: 'true' }),
      ]);
      if (statsRes?.data) setStats(statsRes.data);
      if (productsRes?.data) setLowStockProducts(productsRes.data.slice(0, 5));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Editorial Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono-code font-bold uppercase tracking-widest text-safety">
              OPERATIONS EXECUTIVE CONSOLE
            </span>
            <span className="text-charcoal-300">•</span>
            <span className="text-[11px] font-mono-code text-charcoal-400">LIVE FEED</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-charcoal-900 font-numeric">
            INVENTORY & SUPPLY CHAIN
          </h1>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={RefreshCw}
            onClick={fetchDashboardData}
            loading={loading}
          >
            Refresh
          </Button>
          <Button
            size="sm"
            variant="primary"
            icon={Plus}
            onClick={() => navigate('/receipts')}
          >
            New Receipt
          </Button>
        </div>
      </div>

      {/* Hero / Swiss Metric Grid (Inspired by Reference Visual Identity) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          number={stats ? String(stats.totalStockUnits).padStart(2, '0') : '00'}
          label="Total Units On Hand"
          sublabel={`${stats?.totalProducts || 0} Registered SKUs`}
          icon={Package}
        />

        <StatCard
          number={stats ? String(stats.lowStockCount).padStart(2, '0') : '00'}
          label="Critical Low Stock"
          sublabel="Below Reorder Threshold"
          badge={stats?.lowStockCount > 0 ? 'CRITICAL' : 'OPTIMAL'}
          accent={stats?.lowStockCount > 0}
          icon={AlertTriangle}
          className={stats?.lowStockCount > 0 ? 'bg-safety-light/20' : ''}
        />

        <StatCard
          number={stats ? String(stats.pendingReceipts).padStart(2, '0') : '00'}
          label="Pending Receipts"
          sublabel="Incoming PO Shipments"
          icon={ArrowDownToLine}
        />

        <StatCard
          number={stats ? String(stats.pendingDeliveries).padStart(2, '0') : '00'}
          label="Active Deliveries"
          sublabel="Pick & Pack Dispatch Queue"
          icon={ArrowUpFromLine}
        />
      </div>

      {/* Second Row: Graphic Action Banners + Flow Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Quick Flow Operations Grid */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Operations Launchpad */}
          <div className="bg-white border border-charcoal-100 rounded-sm p-5 shadow-subtle">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-charcoal-50">
              <span className="text-xs font-mono-code font-bold uppercase text-charcoal-900 tracking-wider">
                RAPID DISPATCH & INTAKE LAUNCHPAD
              </span>
              <span className="text-[10px] font-mono-code text-charcoal-400">
                1-CLICK WORKFLOWS
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => navigate('/receipts')}
                className="p-4 bg-charcoal-50/70 border border-charcoal-100 rounded-sm hover:border-emerald-600 hover:bg-emerald-50/40 text-left transition-all group"
              >
                <ArrowDownToLine className="w-5 h-5 text-emerald-700 mb-2 group-hover:translate-y-0.5 transition-transform" />
                <span className="block text-xs font-bold text-charcoal-900 group-hover:text-emerald-800">
                  Receive Stock
                </span>
                <span className="text-[10px] text-charcoal-500 font-mono-code">
                  {stats?.pendingReceipts || 0} Pending
                </span>
              </button>

              <button
                onClick={() => navigate('/deliveries')}
                className="p-4 bg-charcoal-50/70 border border-charcoal-100 rounded-sm hover:border-blue-600 hover:bg-blue-50/40 text-left transition-all group"
              >
                <ArrowUpFromLine className="w-5 h-5 text-blue-700 mb-2 group-hover:-translate-y-0.5 transition-transform" />
                <span className="block text-xs font-bold text-charcoal-900 group-hover:text-blue-800">
                  Deliver Order
                </span>
                <span className="text-[10px] text-charcoal-500 font-mono-code">
                  {stats?.pendingDeliveries || 0} Queue
                </span>
              </button>

              <button
                onClick={() => navigate('/transfers')}
                className="p-4 bg-charcoal-50/70 border border-charcoal-100 rounded-sm hover:border-purple-600 hover:bg-purple-50/40 text-left transition-all group"
              >
                <ArrowLeftRight className="w-5 h-5 text-purple-700 mb-2 group-hover:scale-105 transition-transform" />
                <span className="block text-xs font-bold text-charcoal-900 group-hover:text-purple-800">
                  Stock Transfer
                </span>
                <span className="text-[10px] text-charcoal-500 font-mono-code">
                  {stats?.pendingTransfers || 0} Drafts
                </span>
              </button>

              <button
                onClick={() => navigate('/adjustments')}
                className="p-4 bg-charcoal-50/70 border border-charcoal-100 rounded-sm hover:border-amber-600 hover:bg-amber-50/40 text-left transition-all group"
              >
                <SlidersHorizontal className="w-5 h-5 text-amber-700 mb-2 group-hover:rotate-45 transition-transform" />
                <span className="block text-xs font-bold text-charcoal-900 group-hover:text-amber-800">
                  Stock Audit
                </span>
                <span className="text-[10px] text-charcoal-500 font-mono-code">
                  {stats?.pendingAdjustments || 0} Open
                </span>
              </button>
            </div>
          </div>

          {/* Low Stock Priority Table */}
          <div className="bg-white border border-charcoal-100 rounded-sm p-5 shadow-subtle">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-charcoal-50">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-safety" />
                <span className="text-xs font-mono-code font-bold uppercase text-charcoal-900 tracking-wider">
                  STOCK REORDER ATTENTION LIST ({lowStockProducts.length})
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate('/products?filter=lowStock')}
                className="text-[11px]"
              >
                View All Products &rarr;
              </Button>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono-code text-charcoal-400">
                All catalog items are currently within safe replenishment limits.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-charcoal-100 text-[10px] font-mono-code font-bold text-charcoal-400 uppercase">
                      <th className="py-2 px-2">SKU / Item</th>
                      <th className="py-2 px-2 text-right">On Hand</th>
                      <th className="py-2 px-2 text-right">Reorder Point</th>
                      <th className="py-2 px-2 text-center">Status</th>
                      <th className="py-2 px-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal-50">
                    {lowStockProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-charcoal-50/50">
                        <td className="py-2.5 px-2">
                          <span className="font-bold text-charcoal-900 block">
                            {p.name}
                          </span>
                          <span className="font-mono-code text-[10px] text-charcoal-400">
                            {p.sku}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-right font-numeric font-bold text-charcoal-900">
                          {p.totalStock ?? 0} {p.uom}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono-code text-charcoal-500">
                          {p.reorderLevel} {p.uom}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <Badge status={p.stockStatus} />
                        </td>
                        <td className="py-2.5 px-2 text-right">
                          <button
                            onClick={() => navigate('/receipts')}
                            className="text-[11px] font-mono-code text-safety hover:text-safety-dark font-bold underline"
                          >
                            + Draft PO
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Movement Feed / Immutable Audit Trail */}
        <div className="bg-white border border-charcoal-100 rounded-sm p-5 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-charcoal-50">
              <span className="text-xs font-mono-code font-bold uppercase text-charcoal-900 tracking-wider">
                LIVE STOCK MOVEMENTS
              </span>
              <button
                onClick={() => navigate('/ledger')}
                className="text-[10px] font-mono-code text-safety hover:underline font-bold"
              >
                FULL LEDGER
              </button>
            </div>

            <div className="space-y-3">
              {stats?.recentLedgers?.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-charcoal-50/60 border border-charcoal-100 rounded-sm flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-code text-[10px] font-bold px-1.5 py-0.2 rounded-sm bg-white border border-charcoal-200 text-charcoal-800">
                        {item.transactionType}
                      </span>
                      <span className="font-semibold text-charcoal-900 truncate max-w-[130px]">
                        {item.Product?.name || 'Product Item'}
                      </span>
                    </div>
                    <p className="text-[10px] text-charcoal-400 font-mono-code">
                      {item.Warehouse?.code} • {item.StockLocation?.name || 'Location'}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`font-mono-code font-bold text-xs ${
                        Number(item.quantityChange) > 0
                          ? 'text-emerald-700'
                          : 'text-rose-700'
                      }`}
                    >
                      {Number(item.quantityChange) > 0 ? '+' : ''}
                      {item.quantityChange}
                    </span>
                    <span className="text-[9px] font-mono-code text-charcoal-400 block">
                      {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}

              {(!stats?.recentLedgers || stats.recentLedgers.length === 0) && (
                <p className="text-xs text-charcoal-400 font-mono-code py-8 text-center">
                  No stock movements recorded yet.
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-charcoal-50 text-[10px] font-mono-code text-charcoal-400 flex items-center justify-between">
            <span>SECURE AUDIT LOGS</span>
            <span className="text-emerald-600 font-bold">100% IMMUTABLE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
