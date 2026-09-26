import React, { useState, useEffect } from 'react';
import { warehouseApi } from '../../api/warehouseApi';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  History,
  Search,
  RefreshCw,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  SlidersHorizontal,
  FileSpreadsheet,
} from 'lucide-react';

export const StockLedger = () => {
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const res = await warehouseApi.getStockLedger();
      if (res?.data) {
        setLedgers(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const filteredLedgers = ledgers.filter((l) => {
    const matchesSearch =
      !search ||
      l.Product?.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.Product?.sku?.toLowerCase().includes(search.toLowerCase()) ||
      l.notes?.toLowerCase().includes(search.toLowerCase());
    const matchesType = !typeFilter || l.transactionType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono-code font-bold uppercase tracking-widest text-safety">
              AUDIT & TRACEABILITY
            </span>
            <span className="text-charcoal-300">•</span>
            <span className="text-[11px] font-mono-code text-charcoal-500">
              IMMUTABLE STOCK LEDGER
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-charcoal-900 font-numeric">
            STOCK MOVEMENT LEDGER
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            icon={RefreshCw}
            onClick={fetchLedger}
            loading={loading}
          />
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
              placeholder="Search product SKU, name, or memo..."
              className="w-full bg-[#FBFBFA] border border-charcoal-100 text-xs pl-8 pr-3 py-2 rounded-sm outline-none focus:border-safety font-sans"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#FBFBFA] border border-charcoal-100 text-xs px-3 py-2 rounded-sm outline-none focus:border-safety font-sans cursor-pointer"
          >
            <option value="">All Movement Types</option>
            <option value="RECEIPT">RECEIPT (+)</option>
            <option value="DELIVERY">DELIVERY (-)</option>
            <option value="TRANSFER_IN">TRANSFER_IN (+)</option>
            <option value="TRANSFER_OUT">TRANSFER_OUT (-)</option>
            <option value="ADJUSTMENT">ADJUSTMENT (+/-)</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto border border-charcoal-100 rounded-sm bg-white shadow-subtle">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8F8F6] border-b border-charcoal-100 text-[10px] font-mono-code font-bold text-charcoal-500 uppercase tracking-wider">
              <th className="py-3 px-4">Tx ID</th>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4 text-center">Type</th>
              <th className="py-3 px-4">Product / SKU</th>
              <th className="py-3 px-4">Facility & Location</th>
              <th className="py-3 px-4 text-right">Delta (Change)</th>
              <th className="py-3 px-4 text-right">Resulting Balance</th>
              <th className="py-3 px-4">Operator / Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-50 text-xs font-sans">
            {filteredLedgers.map((entry) => {
              const delta = Number(entry.quantityChange);
              return (
                <tr key={entry.id} className="hover:bg-charcoal-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono-code text-[11px] text-charcoal-400">
                    #{String(entry.id).padStart(4, '0')}
                  </td>
                  <td className="py-3 px-4 font-mono-code text-[11px] text-charcoal-500">
                    {new Date(entry.createdAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block font-mono-code font-bold text-[10px] px-2 py-0.5 rounded-sm border ${
                        entry.transactionType === 'RECEIPT' || entry.transactionType === 'TRANSFER_IN'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : entry.transactionType === 'DELIVERY' || entry.transactionType === 'TRANSFER_OUT'
                          ? 'bg-rose-50 text-rose-800 border-rose-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                    >
                      {entry.transactionType}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-charcoal-900 block">
                      {entry.Product?.name || `Product #${entry.productId}`}
                    </span>
                    <span className="font-mono-code text-[10px] text-charcoal-400">
                      {entry.Product?.sku || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-charcoal-800 font-medium block">
                      {entry.Warehouse?.name || `WH #${entry.warehouseId || ''}`}
                    </span>
                    <span className="text-[10px] font-mono-code text-charcoal-400">
                      {entry.StockLocation?.name || `Loc #${entry.locationId}`}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-numeric font-black text-sm">
                    <span className={delta > 0 ? 'text-emerald-700' : 'text-rose-700'}>
                      {delta > 0 ? `+${delta}` : delta}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-numeric font-bold text-charcoal-900">
                    {entry.resultingQuantity ?? '—'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-charcoal-700 block font-medium">
                      {entry.creator?.name || 'Automated Service'}
                    </span>
                    {entry.notes && (
                      <span className="text-[10px] text-charcoal-400 font-mono-code block truncate max-w-xs">
                        {entry.notes}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}

            {filteredLedgers.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="py-12 text-center text-xs font-mono-code text-charcoal-400"
                >
                  No ledger records found matching query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
