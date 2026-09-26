import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { receiptApi } from '../../api/receiptApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { NumericPipeline } from '../../components/ui/NumericPipeline';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  ArrowLeft,
  CheckCircle,
  Building2,
  MapPin,
  Calendar,
  FileText,
  Boxes,
  Printer,
  ShieldAlert,
} from 'lucide-react';

export const ReceiptDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthorized } = useAuth();
  const { success, error } = useToast();

  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);

  const fetchReceipt = async () => {
    setLoading(true);
    try {
      const res = await receiptApi.getReceipt(id);
      if (res?.data) {
        setReceipt(res.data);
      }
    } catch (err) {
      error(err.message || 'Failed to load receipt details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipt();
  }, [id]);

  const handleValidate = async () => {
    setValidating(true);
    try {
      const res = await receiptApi.validateReceipt(id);
      success(res?.data?.message || 'Receipt validated! Stock updated.');
      fetchReceipt();
    } catch (err) {
      error(err.message || 'Validation failed');
    } finally {
      setValidating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs font-mono-code text-charcoal-400">
        Loading receipt record...
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm font-bold text-charcoal-900 mb-2">Receipt not found</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/receipts')}>
          Back to Receipts
        </Button>
      </div>
    );
  }

  const steps = [
    { key: 'DRAFT', label: 'Draft Order' },
    { key: 'VALIDATED', label: 'Validated & In Stock' },
  ];

  const currentStepIndex = receipt.status === 'VALIDATED' ? 1 : 0;
  const isDraft = receipt.status === 'DRAFT';

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal-100 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/receipts')}
            className="p-1.5 rounded-sm hover:bg-charcoal-100 text-charcoal-500 hover:text-charcoal-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono-code font-bold uppercase text-safety">
                INCOMING SHIPMENT
              </span>
              <span className="text-charcoal-300">•</span>
              <Badge status={receipt.status} />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-charcoal-900 font-numeric">
              RECEIPT #{String(receipt.id).padStart(4, '0')}
            </h1>
          </div>
        </div>

        {/* Numeric Workflow Pipeline */}
        <div className="flex items-center gap-3">
          <NumericPipeline steps={steps} currentStepIndex={currentStepIndex} />

          {/* Validation Action Button */}
          {isDraft && isAuthorized(['ADMIN', 'MANAGER']) && (
            <Button
              size="md"
              variant="primary"
              icon={CheckCircle}
              onClick={handleValidate}
              loading={validating}
              className="bg-safety"
            >
              Validate & Post Stock
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

      {/* Information Header Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white border border-charcoal-100 rounded-sm p-6 shadow-subtle">
        <div className="space-y-1">
          <span className="text-[10px] font-mono-code font-bold uppercase text-charcoal-400">
            Supplier / Vendor
          </span>
          <p className="text-sm font-bold text-charcoal-900">{receipt.supplier}</p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono-code font-bold uppercase text-charcoal-400">
            Receiving Facility
          </span>
          <p className="text-sm font-bold text-charcoal-900">
            {receipt.Warehouse?.name || `Warehouse #${receipt.warehouseId}`}
          </p>
          <span className="text-[10px] font-mono-code text-charcoal-400 block">
            Location: {receipt.StockLocation?.name || `Loc #${receipt.locationId}`}
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono-code font-bold uppercase text-charcoal-400">
            Document Date
          </span>
          <p className="text-sm font-semibold text-charcoal-900">
            {new Date(receipt.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono-code font-bold uppercase text-charcoal-400">
            Reference Notes
          </span>
          <p className="text-xs text-charcoal-600 font-sans">
            {receipt.notes || 'No special instructions recorded.'}
          </p>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="bg-white border border-charcoal-100 rounded-sm shadow-subtle overflow-hidden">
        <div className="px-6 py-4 border-b border-charcoal-100 bg-[#FBFBFA] flex items-center justify-between">
          <span className="text-xs font-mono-code font-bold uppercase text-charcoal-900 tracking-wider">
            RECEIVED PRODUCT INVENTORY LINES ({receipt.items?.length || 0})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-charcoal-100 bg-[#F8F8F6] text-[10px] font-mono-code font-bold text-charcoal-400 uppercase tracking-wider">
                <th className="py-3 px-6 w-16 text-center">#</th>
                <th className="py-3 px-4">Product Name & SKU</th>
                <th className="py-3 px-4 w-32">Unit of Measure</th>
                <th className="py-3 px-6 w-36 text-right">Received Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-50 text-xs font-sans">
              {receipt.items?.map((item, idx) => (
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
                  Total Incoming Units:
                </td>
                <td className="py-3 px-6 text-right text-safety font-black text-base">
                  {receipt.items?.reduce((sum, i) => sum + Number(i.quantity || 0), 0)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
