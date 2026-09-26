import React, { useState, useEffect } from 'react';
import { receiptApi } from '../../api/receiptApi';
import { warehouseApi } from '../../api/warehouseApi';
import { productApi } from '../../api/productApi';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { DynamicLineItems } from '../../components/common/DynamicLineItems';

export const ReceiptCreateModal = ({ isOpen, onClose, onSuccess }) => {
  const { success, error } = useToast();

  const [supplier, setSupplier] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([]);

  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      warehouseApi.listWarehouses().then((res) => {
        if (res?.data) {
          setWarehouses(res.data);
          if (res.data.length > 0) {
            setWarehouseId(res.data[0].id);
            if (res.data[0].StockLocations?.length > 0) {
              setLocationId(res.data[0].StockLocations[0].id);
            }
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

  const selectedWarehouse = warehouses.find((w) => String(w.id) === String(warehouseId));
  const availableLocations = selectedWarehouse?.StockLocations || [];

  const handleWarehouseChange = (e) => {
    const whId = e.target.value;
    setWarehouseId(whId);
    const wh = warehouses.find((w) => String(w.id) === String(whId));
    if (wh?.StockLocations?.length > 0) {
      setLocationId(wh.StockLocations[0].id);
    } else {
      setLocationId('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supplier.trim()) {
      error('Supplier name is required');
      return;
    }
    if (!warehouseId || !locationId) {
      error('Warehouse and receiving location are required');
      return;
    }
    if (items.length === 0) {
      error('At least one product line item is required');
      return;
    }

    setSubmitting(true);
    try {
      await receiptApi.createReceipt({
        supplier: supplier.trim(),
        warehouseId: Number(warehouseId),
        locationId: Number(locationId),
        notes: notes.trim() || undefined,
        items: items.map((i) => ({
          productId: Number(i.productId),
          quantity: Number(i.quantity),
        })),
      });

      success('Incoming Receipt draft created successfully!');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      error(err.message || 'Failed to create receipt');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="CREATE INCOMING RECEIPT (DRAFT)"
      subtitle="Register goods received from supplier before final quality validation"
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Supplier / Vendor"
            required
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            placeholder="e.g. Apex Robotics Ltd"
          />

          <Select
            label="Destination Warehouse"
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
            label="Receiving Stock Location"
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
          label="Internal Notes / PO Reference"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. PO #8920 - Urgent shipment inspected at gate 2"
        />

        {/* Dynamic Line Items Editor */}
        <div className="pt-2">
          <DynamicLineItems
            items={items}
            onChange={setItems}
            products={products}
            selectedLocationId={locationId}
            mode="quantity"
          />
        </div>

        <div className="pt-4 border-t border-charcoal-100 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={submitting}>
            Create Receipt Draft
          </Button>
        </div>
      </form>
    </Modal>
  );
};
