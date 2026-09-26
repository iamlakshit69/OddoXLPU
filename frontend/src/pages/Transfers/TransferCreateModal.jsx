import React, { useState, useEffect } from 'react';
import { transferApi } from '../../api/transferApi';
import { warehouseApi } from '../../api/warehouseApi';
import { productApi } from '../../api/productApi';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/ui/Modal';
import { Select, Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { DynamicLineItems } from '../../components/common/DynamicLineItems';
import { ArrowRight } from 'lucide-react';

export const TransferCreateModal = ({ isOpen, onClose, onSuccess }) => {
  const { success, error } = useToast();

  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);

  const [sourceWarehouseId, setSourceWarehouseId] = useState('');
  const [sourceLocationId, setSourceLocationId] = useState('');
  const [destinationWarehouseId, setDestinationWarehouseId] = useState('');
  const [destinationLocationId, setDestinationLocationId] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      warehouseApi.listWarehouses().then((res) => {
        if (res?.data && res.data.length > 0) {
          setWarehouses(res.data);
          const srcWh = res.data[0];
          setSourceWarehouseId(srcWh.id);
          if (srcWh.StockLocations?.length > 0) {
            setSourceLocationId(srcWh.StockLocations[0].id);
          }

          const destWh = res.data.length > 1 ? res.data[1] : res.data[0];
          setDestinationWarehouseId(destWh.id);
          if (destWh.StockLocations?.length > 0) {
            setDestinationLocationId(
              destWh.StockLocations.length > 1 && destWh.id === srcWh.id
                ? destWh.StockLocations[1].id
                : destWh.StockLocations[0].id
            );
          }
        }
      });

      productApi.listProducts().then((res) => {
        if (res?.data) {
          setProducts(res.data);
          if (res.data.length > 0 && items.length === 0) {
            setItems([
              {
                productId: res.data[0].id,
                quantity: 10,
                uom: res.data[0].uom || 'PCS',
              },
            ]);
          }
        }
      });
    }
  }, [isOpen]);

  const srcWh = warehouses.find((w) => String(w.id) === String(sourceWarehouseId));
  const destWh = warehouses.find((w) => String(w.id) === String(destinationWarehouseId));

  const srcLocations = srcWh?.StockLocations || [];
  const destLocations = destWh?.StockLocations || [];

  const handleSourceWhChange = (e) => {
    const id = e.target.value;
    setSourceWarehouseId(id);
    const wh = warehouses.find((w) => String(w.id) === String(id));
    if (wh?.StockLocations?.length > 0) {
      setSourceLocationId(wh.StockLocations[0].id);
    }
  };

  const handleDestWhChange = (e) => {
    const id = e.target.value;
    setDestinationWarehouseId(id);
    const wh = warehouses.find((w) => String(w.id) === String(id));
    if (wh?.StockLocations?.length > 0) {
      setDestinationLocationId(wh.StockLocations[0].id);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      String(sourceWarehouseId) === String(destinationWarehouseId) &&
      String(sourceLocationId) === String(destinationLocationId)
    ) {
      error('Source and Destination cannot be the identical location');
      return;
    }

    if (items.length === 0) {
      error('At least one product line item is required');
      return;
    }

    setSubmitting(true);
    try {
      await transferApi.createTransfer({
        sourceWarehouseId: Number(sourceWarehouseId),
        sourceLocationId: Number(sourceLocationId),
        destinationWarehouseId: Number(destinationWarehouseId),
        destinationLocationId: Number(destinationLocationId),
        notes: notes.trim() || undefined,
        items: items.map((i) => ({
          productId: Number(i.productId),
          quantity: Number(i.quantity),
        })),
      });

      success('Internal Transfer order draft created!');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      error(err.message || 'Transfer creation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="CREATE INTERNAL STOCK TRANSFER"
      subtitle="Relocate inventory between facilities or specific racks"
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Source & Destination Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-[#F8F8F6] border border-charcoal-100 rounded-sm">
          {/* Source Column */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono-code font-bold uppercase text-safety block">
              01 • SOURCE LOCATION (OUTBOUND)
            </span>
            <Select
              label="Source Warehouse"
              required
              value={sourceWarehouseId}
              onChange={handleSourceWhChange}
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.code})
                </option>
              ))}
            </Select>

            <Select
              label="Source Specific Location"
              required
              value={sourceLocationId}
              onChange={(e) => setSourceLocationId(e.target.value)}
            >
              {srcLocations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.code})
                </option>
              ))}
            </Select>
          </div>

          {/* Destination Column */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono-code font-bold uppercase text-blue-700 block">
              02 • DESTINATION LOCATION (INBOUND)
            </span>
            <Select
              label="Destination Warehouse"
              required
              value={destinationWarehouseId}
              onChange={handleDestWhChange}
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.code})
                </option>
              ))}
            </Select>

            <Select
              label="Destination Specific Location"
              required
              value={destinationLocationId}
              onChange={(e) => setDestinationLocationId(e.target.value)}
            >
              {destLocations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.code})
                </option>
              ))}
            </Select>
          </div>
        </div>

        <Input
          label="Transfer Purpose / Authorization Memo"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Inter-warehouse inventory rebalance for Q3 surge"
        />

        {/* Dynamic Line Items */}
        <div className="pt-2">
          <DynamicLineItems
            items={items}
            onChange={setItems}
            products={products}
            selectedLocationId={sourceLocationId}
            mode="quantity"
          />
        </div>

        <div className="pt-4 border-t border-charcoal-100 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={submitting}>
            Create Transfer Order
          </Button>
        </div>
      </form>
    </Modal>
  );
};
