import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adjustmentApi } from '../../api/adjustmentApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { NumericPipeline } from '../../components/ui/NumericPipeline';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  ArrowLeft,
  CheckCircle,
  Building2,
  Calendar,
  FileText,
  Printer,
  SlidersHorizontal,
} from 'lucide-react';

export const AdjustmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthorized } = useAuth();
  const { success, error } = useToast();

  const [adjustment, setAdjustment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);

  const fetchAdjustment = async () => {
    setLoading(true);
    try {
      const res = await adjustmentApi.getAdjustment(id);
      if (res?.data) {
        setAdjustment(res.data);
      }
    } catch (err) {
      error(err.message || 'Failed to load adjustment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdjustment();
  }, [id]);

  const handleValidate = async () => {
    setValidating(true);
    try {
      const res = await adjustmentApi.validateAdjustment(id);
      success(res?.data?.message || 'Adjustment validated! Inventory synchronized.');
      fetchAdjustment();
    } catch (err) {
      error(err.message || 'Validation failed');
    } finally {
      setValidating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs font-mono-code text-charcoal-400">
        Loading adjustment audit record...
      </div>
    );
  }

  if (!adjustment) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm font-bold text-charcoal-900 mb-2">Adjustment not found</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/adjustments')}>
          Back to Adjustments
        </Button>
      </div>
    );
  }

  const steps = [
    { key: 'DRAFT', label: 'Audit Count Draft' },
    { key: 'VALIDATED', label: 'Variance Reconciled' },
  ];

  const currentStepIndex = adjustment.status === 'VALIDATED' ? 1 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal-100 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/adjustments')}
            className="p-1.5 rounded-sm hover:bg-charcoal-100 text-charcoal-500 hover:text-charcoal-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono-code font-bold uppercase text-safety">
                STOCK AUDIT & RECONCILIATION
              </span>
              <span className="text-charcoal-300">•</span>
              <Badge status={adjustment.status} />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-charcoal-900 font-numeric">
              ADJUSTMENT #{String(adjustment.id).padStart(4, '0')}
            </h1>
          </div>
        </div>

        {/* Pipeline & Validation */}
        <div className="flex items-center gap-3">
          <NumericPipeline steps={steps} currentStepIndex={currentStepIndex} />

          {adjustment.status === 'DRAFT' && isAuthorized(['ADMIN', 'MANAGER']) && (
            <Button
              size="md"
              variant="primary"
              icon={CheckCircle}
              onClick={handleValidate}
              loading={validating}
              className="bg-safety"
            >
              Post Variance
            </Button>
          )}

          <Button
            size="md"
            variant="outline"
            icon={Printer}
            onClick={() => window.print()}
          >
            Print
          </Button>
        </div>
      </div>

      {/* Facility Information Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white border border-charcoal-100 rounded-sm p-6 shadow-subtle">
        <div className="space-y-1">
          <span className="text-[10px] font-mono-code font-bold uppercase text-charcoal-400">
            Audit Facility
          </span>
          <p className="text-sm font-bold text-charcoal-900">
            {adjustment.Warehouse?.name || `Warehouse #${adjustment.warehouseId}`}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono-code font-bold uppercase text-charcoal-400">
            Audited Stock Location
          </span>
          <p className="text-sm font-bold text-charcoal-900">
            {adjustment.StockLocation?.name || `Location #${adjustment.locationId}`}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono-code font-bold uppercase text-charcoal-400">
            Audit Date
          </span>
          <p className="text-sm font-semibold text-charcoal-900">
            {new Date(adjustment.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono-code font-bold uppercase text-charcoal-400">
            Audit Memo / Reason
          </span>
          <p className="text-xs text-charcoal-600 font-sans">
            {adjustment.notes || 'Routine physical inventory audit.'}
          </p>
        </div>
      </div>

      {/* Variance Line Items Table */}
      <div className="bg-white border border-charcoal-100 rounded-sm shadow-subtle overflow-hidden">
        <div className="px-6 py-4 border-b border-charcoal-100 bg-[#FBFBFA] flex items-center justify-between">
          <span className="text-xs font-mono-code font-bold uppercase text-charcoal-900 tracking-wider">
            AUDITED PRODUCT VARIANCE BREAKDOWN ({adjustment.items?.length || 0})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-charcoal-100 bg-[#F8F8F6] text-[10px] font-mono-code font-bold text-charcoal-400 uppercase tracking-wider">
                <th className="py-3 px-6 w-16 text-center">#</th>
                <th className="py-3 px-4">Product Name & SKU</th>
                <th className="py-3 px-4 w-24">UOM</th>
                <th className="py-3 px-4 w-32 text-right">System Recorded</th>
                <th className="py-3 px-4 w-32 text-right">Physical Count</th>
                <th className="py-3 px-6 w-32 text-right">Stock Variance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-50 text-xs font-sans">
              {adjustment.items?.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-charcoal-50/40">
                  <td className="py-3 px-6 text-center font-mono-code text-charcoal-400">
                    {String(idx + 1).padStart(2, '0')}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-charcoal-900 block">
                      {item.Product?.name || `Product #${item.productId}`}
                    </span>
                    <span className="font-mono-code text-[10px] text-charcoal-400">
                      SKU: {item.Product?.sku || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono-code font-bold text-charcoal-600">
                    {item.uom || item.Product?.uom || 'PCS'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono-code font-semibold text-charcoal-500">
                    {item.recordedQuantity}
                  </td>
                  <td className="py-3 px-4 text-right font-numeric font-bold text-charcoal-900">
                    {item.physicalQuantity}
                  </td>
                  <td className="py-3 px-6 text-right font-mono-code font-bold text-sm">
                    {Number(item.quantityChange) > 0 ? (
                      <span className="text-emerald-600">
                        +{item.quantityChange}
                      </span>
                    ) : Number(item.quantityChange) < 0 ? (
                      <span className="text-rose-600">
                        {item.quantityChange}
                      </span>
                    ) : (
                      <span className="text-charcoal-400">0 (Match)</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
