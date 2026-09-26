import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adjustmentApi } from '../../api/adjustmentApi';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { AdjustmentCreateModal } from './AdjustmentCreateModal';
import {
  SlidersHorizontal,
  Plus,
  Search,
  RefreshCw,
  ChevronRight,
  Filter,
} from 'lucide-react';

export const AdjustmentList = () => {
  const navigate = useNavigate();
  const { isAuthorized } = useAuth();

  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchAdjustments = async () => {
    setLoading(true);
    try {
      const res = await adjustmentApi.listAdjustments();
      if (res?.data) {
        setAdjustments(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdjustments();
  }, []);

  const filteredAdjustments = adjustments.filter((a) => {
    const matchesSearch =
      !search ||
      String(a.id).includes(search) ||
      a.Warehouse?.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.notes?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono-code font-bold uppercase tracking-widest text-safety">
              INVENTORY ACCURACY
            </span>
            <span className="text-charcoal-300">•</span>
            <span className="text-[11px] font-mono-code text-charcoal-500">
              AUDITS & VARIANCE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-charcoal-900 font-numeric">
            STOCK ADJUSTMENTS
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {isAuthorized(['ADMIN', 'MANAGER']) && (
            <Button
              size="sm"
              variant="primary"
              icon={Plus}
              onClick={() => setModalOpen(true)}
            >
              New Audit
            </Button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-charcoal-100 rounded-sm p-3 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by audit # or facility..."
              className="w-full bg-[#FBFBFA] border border-charcoal-100 text-xs pl-8 pr-3 py-2 rounded-sm outline-none focus:border-safety font-sans"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#FBFBFA] border border-charcoal-100 text-xs px-3 py-2 rounded-sm outline-none focus:border-safety font-sans cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">DRAFT</option>
            <option value="VALIDATED">VALIDATED</option>
          </select>
        </div>

        <Button
          size="sm"
          variant="ghost"
          icon={RefreshCw}
          onClick={fetchAdjustments}
          loading={loading}
        />
      </div>

      {/* Adjustments Table */}
      <div className="overflow-x-auto border border-charcoal-100 rounded-sm bg-white shadow-subtle">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8F8F6] border-b border-charcoal-100 text-[10px] font-mono-code font-bold text-charcoal-500 uppercase tracking-wider">
              <th className="py-3 px-4">Audit #</th>
              <th className="py-3 px-4">Facility / Warehouse</th>
              <th className="py-3 px-4">Stock Location</th>
              <th className="py-3 px-4 text-center">Lines Audited</th>
              <th className="py-3 px-4">Audit Date</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-50 text-xs font-sans">
            {filteredAdjustments.map((a) => (
              <tr
                key={a.id}
                onClick={() => navigate(`/adjustments/${a.id}`)}
                className="hover:bg-charcoal-50/60 transition-colors cursor-pointer group"
              >
                <td className="py-3 px-4 font-mono-code font-bold text-charcoal-900">
                  <span className="px-2 py-0.5 bg-charcoal-50 border border-charcoal-200 rounded-sm text-[11px] group-hover:border-safety transition-colors">
                    ADJ-{String(a.id).padStart(4, '0')}
                  </span>
                </td>
                <td className="py-3 px-4 font-bold text-charcoal-900 group-hover:text-safety transition-colors">
                  {a.Warehouse?.name || `Warehouse #${a.warehouseId}`}
                </td>
                <td className="py-3 px-4 font-mono-code text-[11px] text-charcoal-600">
                  {a.StockLocation?.name || `Location #${a.locationId}`}
                </td>
                <td className="py-3 px-4 text-center font-mono-code font-bold text-charcoal-800">
                  {a.items?.length || 0}
                </td>
                <td className="py-3 px-4 font-mono-code text-[11px] text-charcoal-400">
                  {new Date(a.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4 text-center">
                  <Badge status={a.status} />
                </td>
                <td className="py-3 px-4 text-right">
                  <ChevronRight className="w-4 h-4 text-charcoal-400 group-hover:text-charcoal-900 inline-block transition-transform group-hover:translate-x-0.5" />
                </td>
              </tr>
            ))}

            {filteredAdjustments.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center text-xs font-mono-code text-charcoal-400"
                >
                  No stock adjustments recorded. Click "+ New Audit" to run one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AdjustmentCreateModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchAdjustments}
      />
    </div>
  );
};
