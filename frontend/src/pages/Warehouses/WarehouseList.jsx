import React, { useState, useEffect } from 'react';
import { warehouseApi } from '../../api/warehouseApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import {
  Building2,
  MapPin,
  Plus,
  RefreshCw,
  FolderPlus,
  Layers,
  Warehouse as WarehouseIcon,
} from 'lucide-react';

export const WarehouseList = () => {
  const { isAuthorized } = useAuth();
  const { success, error } = useToast();

  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [warehouseModalOpen, setWarehouseModalOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');

  const [whForm, setWhForm] = useState({ name: '', code: '', address: '' });
  const [locForm, setLocForm] = useState({ name: '', code: '', warehouseId: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const res = await warehouseApi.listWarehouses();
      if (res?.data) {
        setWarehouses(res.data);
      }
    } catch (err) {
      error(err.message || 'Failed to load warehouses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleCreateWarehouse = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await warehouseApi.createWarehouse(whForm);
      success(`Warehouse "${whForm.name}" created!`);
      setWarehouseModalOpen(false);
      setWhForm({ name: '', code: '', address: '' });
      fetchWarehouses();
    } catch (err) {
      error(err.message || 'Failed to create warehouse');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateLocation = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await warehouseApi.createLocation(locForm);
      success(`Location "${locForm.name}" created!`);
      setLocationModalOpen(false);
      setLocForm({ name: '', code: '', warehouseId: '' });
      fetchWarehouses();
    } catch (err) {
      error(err.message || 'Failed to create location');
    } finally {
      setSubmitting(false);
    }
  };

  const openAddLocationForWh = (whId) => {
    const wh = warehouses.find((w) => String(w.id) === String(whId));
    setLocForm({
      name: '',
      code: wh ? `${wh.code}/` : '',
      warehouseId: String(whId),
    });
    setLocationModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono-code font-bold uppercase tracking-widest text-safety">
              FACILITY INFRASTRUCTURE
            </span>
            <span className="text-charcoal-300">•</span>
            <span className="text-[11px] font-mono-code text-charcoal-500">
              {warehouses.length} HUBS & AISLE MAPPINGS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-charcoal-900 font-numeric">
            WAREHOUSES & LOCATIONS
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {isAuthorized(['ADMIN', 'MANAGER']) && (
            <>
              <Button
                size="sm"
                variant="outline"
                icon={FolderPlus}
                onClick={() => {
                  setLocForm({
                    name: '',
                    code: '',
                    warehouseId: warehouses[0]?.id ? String(warehouses[0].id) : '',
                  });
                  setLocationModalOpen(true);
                }}
              >
                + Location
              </Button>
              <Button
                size="sm"
                variant="primary"
                icon={Plus}
                onClick={() => setWarehouseModalOpen(true)}
              >
                New Warehouse
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="ghost"
            icon={RefreshCw}
            onClick={fetchWarehouses}
            loading={loading}
          />
        </div>
      </div>

      {/* Facilities Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {warehouses.map((wh) => (
          <div
            key={wh.id}
            className="bg-white border border-charcoal-100 rounded-sm p-6 shadow-subtle flex flex-col justify-between"
          >
            <div>
              {/* Warehouse Header */}
              <div className="flex items-start justify-between gap-2 mb-4 pb-3 border-b border-charcoal-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-sm bg-[#5B3A52] text-white flex items-center justify-center font-bold">
                    <WarehouseIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-charcoal-900 uppercase">
                      {wh.name}
                    </h3>
                    <span className="text-[10px] font-mono-code font-bold px-1.5 py-0.5 rounded-sm bg-charcoal-50 text-charcoal-700 border border-charcoal-200">
                      CODE: {wh.code}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono-code font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-200">
                    OPERATIONAL
                  </span>
                </div>
              </div>

              {wh.address && (
                <div className="flex items-center gap-1.5 text-xs text-charcoal-500 mb-4 font-sans">
                  <MapPin className="w-3.5 h-3.5 text-charcoal-400 shrink-0" />
                  <span>{wh.address}</span>
                </div>
              )}

              {/* Sub-locations list */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono-code font-bold uppercase text-charcoal-500">
                  <span>Stock Locations & Aisles ({wh.StockLocations?.length || 0})</span>
                  {isAuthorized(['ADMIN', 'MANAGER']) && (
                    <button
                      type="button"
                      onClick={() => openAddLocationForWh(wh.id)}
                      className="text-safety hover:underline text-[10px] font-bold"
                    >
                      + Add Aisle
                    </button>
                  )}
                </div>

                <div className="border border-charcoal-100 rounded-sm divide-y divide-charcoal-50 bg-[#FBFBFA]">
                  {wh.StockLocations?.map((loc) => (
                    <div
                      key={loc.id}
                      className="p-3 flex items-center justify-between hover:bg-white transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-safety" />
                        <span className="text-xs font-semibold text-charcoal-900">
                          {loc.name}
                        </span>
                      </div>
                      <span className="font-mono-code text-[11px] font-bold text-charcoal-600 px-2 py-0.5 bg-white border border-charcoal-200 rounded-sm">
                        {loc.code}
                      </span>
                    </div>
                  ))}

                  {(!wh.StockLocations || wh.StockLocations.length === 0) && (
                    <div className="p-4 text-center text-xs font-mono-code text-charcoal-400">
                      No aisles or racks configured.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-charcoal-50 flex items-center justify-between text-[10px] font-mono-code text-charcoal-400">
              <span>FACILITY ID: #{wh.id}</span>
              <span className="text-charcoal-700 font-bold uppercase">
                {wh.StockLocations?.length || 0} ACTIVE LOCATIONS
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE WAREHOUSE MODAL */}
      <Modal
        isOpen={warehouseModalOpen}
        onClose={() => setWarehouseModalOpen(false)}
        title="REGISTER NEW WAREHOUSE HUB"
        subtitle="Define physical distribution center or facility"
      >
        <form onSubmit={handleCreateWarehouse} className="space-y-4">
          <Input
            label="Warehouse Facility Name"
            required
            value={whForm.name}
            onChange={(e) => setWhForm({ ...whForm, name: e.target.value })}
            placeholder="e.g. West Coast Fulfillment Hub"
          />

          <Input
            label="Warehouse Code (Unique Prefix)"
            required
            value={whForm.code}
            onChange={(e) => setWhForm({ ...whForm, code: e.target.value.toUpperCase() })}
            placeholder="e.g. WH-WEST"
          />

          <Input
            label="Physical Street Address"
            value={whForm.address}
            onChange={(e) => setWhForm({ ...whForm, address: e.target.value })}
            placeholder="e.g. 400 Logistics Blvd, Reno NV"
          />

          <div className="pt-4 border-t border-charcoal-100 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setWarehouseModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Register Warehouse
            </Button>
          </div>
        </form>
      </Modal>

      {/* CREATE LOCATION MODAL */}
      <Modal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        title="ADD STOCK LOCATION / AISLE"
        subtitle="Define a rack, bin, or zone inside a warehouse"
      >
        <form onSubmit={handleCreateLocation} className="space-y-4">
          <Select
            label="Target Warehouse"
            required
            value={locForm.warehouseId}
            onChange={(e) => setLocForm({ ...locForm, warehouseId: e.target.value })}
          >
            <option value="">-- Select Warehouse --</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.code})
              </option>
            ))}
          </Select>

          <Input
            label="Location Name"
            required
            value={locForm.name}
            onChange={(e) => setLocForm({ ...locForm, name: e.target.value })}
            placeholder="e.g. Aisle D4 - High Density Racks"
          />

          <Input
            label="Location Code"
            required
            value={locForm.code}
            onChange={(e) => setLocForm({ ...locForm, code: e.target.value })}
            placeholder="e.g. WH-N/D4-RACK"
          />

          <div className="pt-4 border-t border-charcoal-100 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setLocationModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Save Stock Location
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
