import React, { useState, useEffect } from 'react';
import { adjustmentApi } from '../../api/adjustmentApi';
import { warehouseApi } from '../../api/warehouseApi';
import { productApi } from '../../api/productApi';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/ui/Modal';
import { Select, Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { DynamicLineItems } from '../../components/common/DynamicLineItems';

export const AdjustmentCreateModal = ({ isOpen, onClose, onSuccess }) => {
  const { success, error } = useToast();

  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);

  const [warehouseId, setWarehouseId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      warehouseApi.listWarehouses().then((res) => {
        if (res?.data && res.data.length > 0) {
          setWarehouses(res.data);
          const firstWh = res.data[0];
          setWarehouseId(firstWh.id);
          if (firstWh.StockLocations?.length > 0) {
            setLocationId(firstWh.StockLocations[0].id);
          }
        }
      });

      productApi.listProducts().then((res) => {
        if (res?.data) {
          setProducts(res.data);
          if (res.data.length > 0 && items.length === 0) {
            const firstP = res.data[0];
            setItems([
              {
                productId: firstP.id,
                recordedQuantity: 0,
                physicalQuantity: 0,
                quantityChange: 0,
                uom: firstP.uom || 'PCS',
              },
            ]);
          }
        }
      });
    }
  }, [isOpen]);

  const selectedWh = warehouses.find((w) => String(w.id) === String(warehouseId));
  const availableLocations = selectedWh?.StockLocations || [];

  const handleWarehouseChange = (e) => {
    const id = e.target.value;
    setWarehouseId(id);
    const wh = warehouses.find((w) => String(w.id) === String(id));
    if (wh?.StockLocations?.length > 0) {
      setLocationId(wh.StockLocations[0].id);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!warehouseId || !locationId) {
      error('Warehouse and physical audit location are required');
      return;
    }

    if (items.length === 0) {
      error('At least one line item is required for audit');
      return;
    }

    setSubmitting(true);
    try {
      await adjustmentApi.createAdjustment({
        warehouseId: Number(warehouseId),
        locationId: Number(locationId),
        notes: notes.trim() || undefined,
        items: items.map((i) => ({
          productId: Number(i.productId),
          physicalQuantity: Number(i.physicalQuantity),
        })),
      });

      success('Inventory adjustment draft created!');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      error(err.message || 'Failed to create adjustment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="CREATE PHYSICAL INVENTORY AUDIT (ADJUSTMENT)"
      subtitle="Reconcile system balances with actual physical shelf counts"
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Audit Warehouse Facility"
            required
            value={warehouseId}
            onChange={handleWarehouseChange}
          >
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.code})
              </option>
            ))}
          </Select>

          <Select
            label="Audit Stock Location (Rack / Aisle)"
            required
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
          >
            {availableLocations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name} ({loc.code})
              </option>
            ))}
          </Select>
        </div>

        <Input
          label="Audit Justification / Discrepancy Reason"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Annual physical count audit - discrepancy identified during cycle count"
        />

        {/* Dynamic Variance Table */}
        <div className="pt-2">
          <DynamicLineItems
            items={items}
            onChange={setItems}
            products={products}
            selectedLocationId={locationId}
            mode="adjustment"
          />
        </div>

        <div className="pt-4 border-t border-charcoal-100 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={submitting}>
            Create Audit Draft
          </Button>
        </div>
      </form>
    </Modal>
  );
};
