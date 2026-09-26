import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { transferApi } from '../../api/transferApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { NumericPipeline } from '../../components/ui/NumericPipeline';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Building2,
  Calendar,
  FileText,
  Printer,
} from 'lucide-react';

export const TransferDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthorized } = useAuth();
  const { success, error } = useToast();

  const [transfer, setTransfer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);

  const fetchTransfer = async () => {
    setLoading(true);
    try {
      const res = await transferApi.getTransfer(id);
      if (res?.data) {
        setTransfer(res.data);
      }
    } catch (err) {
      error(err.message || 'Failed to load transfer');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfer();
  }, [id]);

  const handleValidate = async () => {
    setValidating(true);
    try {
      const res = await transferApi.validateTransfer(id);
      success(res?.data?.message || 'Transfer validated! Stock relocated.');
      fetchTransfer();
    } catch (err) {
      error(err.message || 'Transfer validation failed');
    } finally {
      setValidating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs font-mono-code text-charcoal-400">
        Loading transfer record...
      </div>
    );
  }

  if (!transfer) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm font-bold text-charcoal-900 mb-2">Transfer not found</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/transfers')}>
          Back to Transfers
        </Button>
      </div>
    );
  }

  const steps = [
    { key: 'DRAFT', label: 'Draft Relocation' },
    { key: 'VALIDATED', label: 'Completed & Transferred' },
  ];

  const currentStepIndex = transfer.status === 'VALIDATED' ? 1 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal-100 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/transfers')}
            className="p-1.5 rounded-sm hover:bg-charcoal-100 text-charcoal-500 hover:text-charcoal-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono-code font-bold uppercase text-safety">
                INTERNAL TRANSFER
              </span>
              <span className="text-charcoal-300">•</span>
              <Badge status={transfer.status} />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-charcoal-900 font-numeric">
              TRANSFER #{String(transfer.id).padStart(4, '0')}
            </h1>
          </div>
        </div>

        {/* Pipeline & Validation */}
        <div className="flex items-center gap-3">
          <NumericPipeline steps={steps} currentStepIndex={currentStepIndex} />

          {transfer.status === 'DRAFT' && isAuthorized(['ADMIN', 'MANAGER']) && (
            <Button
              size="md"
              variant="primary"
              icon={CheckCircle}
              onClick={handleValidate}
              loading={validating}
              className="bg-safety"
            >
              Validate Transfer
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

      {/* Source vs Destination Route Card */}
      <div className="bg-white border border-charcoal-100 rounded-sm p-6 shadow-subtle">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative">
          {/* Source Location */}
          <div className="p-4 bg-charcoal-50/70 border border-charcoal-100 rounded-sm space-y-1">
            <span className="text-[10px] font-mono-code font-bold uppercase text-safety">
              FROM (SOURCE)
            </span>
            <p className="text-base font-bold text-charcoal-900">
              {transfer.sourceWarehouse?.name || `Warehouse #${transfer.sourceWarehouseId}`}
            </p>
            <span className="text-xs font-mono-code text-charcoal-600 block">
              Location: {transfer.sourceLocation?.name || `Loc #${transfer.sourceLocationId}`}
            </span>
          </div>

          {/* Destination Location */}
          <div className="p-4 bg-charcoal-50/70 border border-charcoal-100 rounded-sm space-y-1">
            <span className="text-[10px] font-mono-code font-bold uppercase text-blue-700">
              TO (DESTINATION)
            </span>
            <p className="text-base font-bold text-charcoal-900">
              {transfer.destinationWarehouse?.name || `Warehouse #${transfer.destinationWarehouseId}`}
            </p>
            <span className="text-xs font-mono-code text-charcoal-600 block">
              Location: {transfer.destinationLocation?.name || `Loc #${transfer.destinationLocationId}`}
            </span>
          </div>
        </div>

        {transfer.notes && (
          <div className="mt-4 pt-3 border-t border-charcoal-100 text-xs text-charcoal-600 font-sans">
            <span className="font-mono-code font-bold text-charcoal-900 uppercase mr-2">
              Note:
            </span>
            {transfer.notes}
          </div>
        )}
      </div>

      {/* Product Lines Table */}
      <div className="bg-white border border-charcoal-100 rounded-sm shadow-subtle overflow-hidden">
        <div className="px-6 py-4 border-b border-charcoal-100 bg-[#FBFBFA] flex items-center justify-between">
          <span className="text-xs font-mono-code font-bold uppercase text-charcoal-900 tracking-wider">
            TRANSFERRED PRODUCT LINES ({transfer.items?.length || 0})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-charcoal-100 bg-[#F8F8F6] text-[10px] font-mono-code font-bold text-charcoal-400 uppercase tracking-wider">
                <th className="py-3 px-6 w-16 text-center">#</th>
                <th className="py-3 px-4">Product Name & SKU</th>
                <th className="py-3 px-4 w-32">Unit of Measure</th>
                <th className="py-3 px-6 w-36 text-right">Transfer Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-50 text-xs font-sans">
              {transfer.items?.map((item, idx) => (
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
                  <td className="py-3 px-6 text-right font-numeric font-black text-sm text-charcoal-900">
                    {item.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[#FBFBFA] border-t border-charcoal-100 font-mono-code text-xs font-bold text-charcoal-900">
                <td colSpan={3} className="py-3 px-6 text-right uppercase tracking-wider">
                  Total Transferred Units:
                </td>
                <td className="py-3 px-6 text-right text-safety font-black text-base">
                  {transfer.items?.reduce((sum, i) => sum + Number(i.quantity || 0), 0)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
