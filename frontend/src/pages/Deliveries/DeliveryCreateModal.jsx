import React, { useState, useEffect } from 'react';
import { deliveryApi } from '../../api/deliveryApi';
import { warehouseApi } from '../../api/warehouseApi';
import { productApi } from '../../api/productApi';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { DynamicLineItems } from '../../components/common/DynamicLineItems';

export const DeliveryCreateModal = ({ isOpen, onClose, onSuccess }) => {
  const { success, error } = useToast();

  const [customer, setCustomer] = useState('');
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
                quantity: 5,
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
    if (!customer.trim()) {
      error('Customer name is required');
      return;
    }
    if (!warehouseId || !locationId) {
      error('Warehouse and source location are required');
      return;
    }
    if (items.length === 0) {
      error('At least one product line item is required');
      return;
    }

    setSubmitting(true);
    try {
      await deliveryApi.createDelivery({
        customer: customer.trim(),
        warehouseId: Number(warehouseId),
        locationId: Number(locationId),
        notes: notes.trim() || undefined,
        items: items.map((i) => ({
          productId: Number(i.productId),
          quantity: Number(i.quantity),
        })),
      });

      success('Delivery order created in DRAFT status!');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      error(err.message || 'Failed to create delivery order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="CREATE OUTGOING DELIVERY ORDER"
      subtitle="Define customer order and pick-from warehouse location"
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Customer / Client"
            required
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            placeholder="e.g. Tesla Gigafactory Assembly Line"
          />

          <Select
            label="Source Warehouse"
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
            label="Source Stock Location"
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
          label="Shipping Notes / Freight Tracking"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Express Freight - Gate 4 delivery before 5 PM"
        />

        {/* Line Items Editor with Live Stock Check */}
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
            Create Delivery Order
          </Button>
        </div>
      </form>
    </Modal>
  );
};
