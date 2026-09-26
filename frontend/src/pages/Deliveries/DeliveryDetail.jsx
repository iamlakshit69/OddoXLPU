import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { deliveryApi } from '../../api/deliveryApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { NumericPipeline } from '../../components/ui/NumericPipeline';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  ArrowLeft,
  CheckCircle,
  PackageCheck,
  Truck,
  Building2,
  Calendar,
  FileText,
  Printer,
  Check,
} from 'lucide-react';

export const DeliveryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthorized } = useAuth();
  const { success, error } = useToast();

  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDelivery = async () => {
    setLoading(true);
    try {
      const res = await deliveryApi.getDelivery(id);
      if (res?.data) {
        setDelivery(res.data);
      }
    } catch (err) {
      error(err.message || 'Failed to load delivery');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDelivery();
  }, [id]);

  const handlePick = async () => {
    setActionLoading(true);
    try {
      await deliveryApi.pickDelivery(id);
      success('Delivery status progressed to PICKED');
      fetchDelivery();
    } catch (err) {
      error(err.message || 'Pick failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePack = async () => {
    setActionLoading(true);
    try {
      await deliveryApi.packDelivery(id);
      success('Delivery status progressed to PACKED');
      fetchDelivery();
    } catch (err) {
      error(err.message || 'Pack failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleValidate = async () => {
    setActionLoading(true);
    try {
      const res = await deliveryApi.validateDelivery(id);
      success(res?.data?.message || 'Delivery validated & dispatched! Stock decreased.');
      fetchDelivery();
    } catch (err) {
      error(err.message || 'Validation failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs font-mono-code text-charcoal-400">
        Loading delivery record...
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm font-bold text-charcoal-900 mb-2">Delivery not found</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/deliveries')}>
          Back to Deliveries
        </Button>
      </div>
    );
  }

  const steps = [
    { key: 'DRAFT', label: 'Draft' },
    { key: 'PICKED', label: 'Picked' },
    { key: 'PACKED', label: 'Packed' },
    { key: 'VALIDATED', label: 'Dispatched' },
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'DRAFT': return 0;
      case 'PICKED': return 1;
      case 'PACKED': return 2;
      case 'VALIDATED': return 3;
      default: return 0;
    }
  };

  const currentStepIndex = getStepIndex(delivery.status);

  return (
    <div className="space-y-6">
      {/* Header with Pipeline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal-100 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/deliveries')}
            className="p-1.5 rounded-sm hover:bg-charcoal-100 text-charcoal-500 hover:text-charcoal-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono-code font-bold uppercase text-safety">
                OUTGOING DISPATCH
              </span>
              <span className="text-charcoal-300">•</span>
              <Badge status={delivery.status} />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-charcoal-900 font-numeric">
              DELIVERY #{String(delivery.id).padStart(4, '0')}
            </h1>
          </div>
        </div>

        {/* Numeric Workflow Pipeline + Multi-stage Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <NumericPipeline steps={steps} currentStepIndex={currentStepIndex} />

          {/* Workflow Transitions */}
          {delivery.status === 'DRAFT' && isAuthorized(['ADMIN', 'MANAGER']) && (
            <Button
              size="md"
              variant="secondary"
              icon={PackageCheck}
              onClick={handlePick}
              loading={actionLoading}
            >
              Mark Picked
            </Button>
          )}

          {delivery.status === 'PICKED' && isAuthorized(['ADMIN', 'MANAGER']) && (
            <Button
              size="md"
              variant="secondary"
              icon={PackageCheck}
              onClick={handlePack}
              loading={actionLoading}
            >
              Mark Packed
            </Button>
          )}

          {delivery.status === 'PACKED' && isAuthorized(['ADMIN', 'MANAGER']) && (
            <Button
              size="md"
              variant="primary"
              icon={Truck}
              onClick={handleValidate}
              loading={actionLoading}
              className="bg-safety"
            >
              Validate & Dispatch
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

      {/* Information Header Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white border border-charcoal-100 rounded-sm p-6 shadow-subtle">
        <div className="space-y-1">
          <span className="text-[10px] font-mono-code font-bold uppercase text-charcoal-400">
            Customer / Recipient
          </span>
          <p className="text-sm font-bold text-charcoal-900">{delivery.customer}</p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono-code font-bold uppercase text-charcoal-400">
            Dispatch Facility & Aisle
          </span>
          <p className="text-sm font-bold text-charcoal-900">
            {delivery.Warehouse?.name || `Warehouse #${delivery.warehouseId}`}
          </p>
          <span className="text-[10px] font-mono-code text-charcoal-400 block">
            Location: {delivery.StockLocation?.name || `Loc #${delivery.locationId}`}
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono-code font-bold uppercase text-charcoal-400">
            Order Timestamp
          </span>
          <p className="text-sm font-semibold text-charcoal-900">
            {new Date(delivery.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono-code font-bold uppercase text-charcoal-400">
            Shipping Instructions
          </span>
          <p className="text-xs text-charcoal-600 font-sans">
            {delivery.notes || 'Standard dispatch priority.'}
          </p>
        </div>
      </div>

      {/* Product Items Table */}
      <div className="bg-white border border-charcoal-100 rounded-sm shadow-subtle overflow-hidden">
        <div className="px-6 py-4 border-b border-charcoal-100 bg-[#FBFBFA] flex items-center justify-between">
          <span className="text-xs font-mono-code font-bold uppercase text-charcoal-900 tracking-wider">
            OUTGOING DISPATCH PRODUCT LINES ({delivery.items?.length || 0})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-charcoal-100 bg-[#F8F8F6] text-[10px] font-mono-code font-bold text-charcoal-400 uppercase tracking-wider">
                <th className="py-3 px-6 w-16 text-center">#</th>
                <th className="py-3 px-4">Product Name & SKU</th>
                <th className="py-3 px-4 w-32">Unit of Measure</th>
                <th className="py-3 px-6 w-36 text-right">Dispatch Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-50 text-xs font-sans">
              {delivery.items?.map((item, idx) => (
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
                  Total Delivery Units:
                </td>
                <td className="py-3 px-6 text-right text-safety font-black text-base">
                  {delivery.items?.reduce((sum, i) => sum + Number(i.quantity || 0), 0)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
