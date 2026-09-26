import React from 'react';
import { Plus, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';

export const DynamicLineItems = ({
  items = [],
  onChange,
  products = [],
  mode = 'quantity', // 'quantity' for receipts/deliveries/transfers, 'adjustment' for physical count
  selectedLocationId = null,
  disabled = false,
}) => {
  const handleAddItem = () => {
    // Pick the first product not already in the list if available
    const existingIds = items.map((i) => String(i.productId));
    const available = products.find((p) => !existingIds.includes(String(p.id)));
    const defaultProduct = available || products[0];

    const newItem = {
      productId: defaultProduct ? defaultProduct.id : '',
      quantity: 1,
      physicalQuantity: 0,
      recordedQuantity: 0,
      uom: defaultProduct ? defaultProduct.uom : 'PCS',
    };

    // If adjustment mode, compute recorded qty for selected location
    if (mode === 'adjustment' && defaultProduct) {
      const stockEntry = defaultProduct.Stocks?.find(
        (s) => String(s.locationId) === String(selectedLocationId)
      );
      newItem.recordedQuantity = stockEntry ? Number(stockEntry.quantity) : 0;
      newItem.physicalQuantity = newItem.recordedQuantity;
      newItem.quantityChange = 0;
    }

    onChange([...items, newItem]);
  };

  const handleRemoveItem = (index) => {
    const updated = items.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const handleFieldChange = (index, field, value) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };

    if (field === 'productId') {
      const prod = products.find((p) => String(p.id) === String(value));
      if (prod) {
        item.uom = prod.uom;
        if (mode === 'adjustment') {
          const stockEntry = prod.Stocks?.find(
            (s) => String(s.locationId) === String(selectedLocationId)
          );
          item.recordedQuantity = stockEntry ? Number(stockEntry.quantity) : 0;
          item.physicalQuantity = item.recordedQuantity;
          item.quantityChange = 0;
        }
      }
    }

    if (field === 'physicalQuantity') {
      const phys = Number(value) || 0;
      item.physicalQuantity = phys;
      item.quantityChange = phys - (item.recordedQuantity || 0);
    }

    if (field === 'quantity') {
      item.quantity = Number(value) || 0;
    }

    updated[index] = item;
    onChange(updated);
  };

  // Compute total units
  const totalQuantity = items.reduce(
    (sum, item) =>
      sum + (mode === 'adjustment' ? Number(item.physicalQuantity || 0) : Number(item.quantity || 0)),
    0
  );

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between border-b border-charcoal-100 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono-code font-bold uppercase text-charcoal-900 tracking-wider">
            PRODUCT LINE ITEMS ({items.length})
          </span>
        </div>
        {!disabled && (
          <Button
            size="sm"
            variant="outline"
            icon={Plus}
            onClick={handleAddItem}
            className="border-charcoal-200"
          >
            Add Line Item
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="border border-dashed border-charcoal-200 rounded-sm p-8 text-center bg-white">
          <p className="text-xs text-charcoal-500 font-mono-code mb-3">
            No products added to this document yet.
          </p>
          {!disabled && (
            <Button size="sm" variant="primary" icon={Plus} onClick={handleAddItem}>
              Add First Product
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto border border-charcoal-100 rounded-sm bg-white shadow-subtle">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8F8F6] border-b border-charcoal-100 text-[10px] font-mono-code font-bold text-charcoal-500 uppercase tracking-wider">
                <th className="py-2.5 px-3 w-12 text-center">#</th>
                <th className="py-2.5 px-3">Product Name & SKU</th>
                <th className="py-2.5 px-3 w-24">UOM</th>

                {mode === 'adjustment' ? (
                  <>
                    <th className="py-2.5 px-3 w-32 text-right">System Qty</th>
                    <th className="py-2.5 px-3 w-36 text-right">Physical Count</th>
                    <th className="py-2.5 px-3 w-28 text-right">Variance</th>
                  </>
                ) : (
                  <>
                    <th className="py-2.5 px-3 w-36 text-right">Quantity</th>
                    <th className="py-2.5 px-3 w-36 text-center">Availability</th>
                  </>
                )}

                {!disabled && <th className="py-2.5 px-3 w-12 text-center">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-50 text-xs font-sans">
              {items.map((item, idx) => {
                const selectedProd = products.find(
                  (p) => String(p.id) === String(item.productId)
                );
                const locStock = selectedProd?.Stocks?.find(
                  (s) => String(s.locationId) === String(selectedLocationId)
                );
                const availableQty = locStock ? Number(locStock.quantity) : 0;
                const isInsufficient =
                  mode === 'quantity' &&
                  selectedLocationId &&
                  availableQty < Number(item.quantity);

                return (
                  <tr key={idx} className="hover:bg-charcoal-50/50 transition-colors">
                    <td className="py-2.5 px-3 text-center font-mono-code text-[11px] text-charcoal-400">
                      {String(idx + 1).padStart(2, '0')}
                    </td>
                    <td className="py-2.5 px-3">
                      {disabled ? (
                        <div>
                          <div className="font-semibold text-charcoal-900">
                            {selectedProd?.name || `Product #${item.productId}`}
                          </div>
                          <div className="text-[10px] font-mono-code text-charcoal-400">
                            SKU: {selectedProd?.sku || 'N/A'}
                          </div>
                        </div>
                      ) : (
                        <select
                          value={item.productId}
                          onChange={(e) =>
                            handleFieldChange(idx, 'productId', e.target.value)
                          }
                          className="w-full bg-white border border-charcoal-200 text-xs px-2.5 py-1.5 rounded-sm outline-none focus:border-safety font-sans font-medium"
                        >
                          <option value="" disabled>
                            -- Select Product --
                          </option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.sku} • {p.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>

                    <td className="py-2.5 px-3 font-mono-code text-charcoal-600 font-bold">
                      {item.uom || selectedProd?.uom || 'PCS'}
                    </td>

                    {mode === 'adjustment' ? (
                      <>
                        <td className="py-2.5 px-3 text-right font-mono-code text-charcoal-500 font-semibold">
                          {item.recordedQuantity ?? 0}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {disabled ? (
                            <span className="font-mono-code font-bold text-charcoal-900">
                              {item.physicalQuantity}
                            </span>
                          ) : (
                            <input
                              type="number"
                              min="0"
                              value={item.physicalQuantity}
                              onChange={(e) =>
                                handleFieldChange(idx, 'physicalQuantity', e.target.value)
                              }
                              className="w-24 text-right bg-white border border-charcoal-200 text-xs px-2 py-1 rounded-sm outline-none focus:border-safety font-mono-code font-bold"
                            />
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono-code font-bold">
                          {item.quantityChange > 0 ? (
                            <span className="text-emerald-600">
                              +{item.quantityChange}
                            </span>
                          ) : item.quantityChange < 0 ? (
                            <span className="text-rose-600">
                              {item.quantityChange}
                            </span>
                          ) : (
                            <span className="text-charcoal-400">0</span>
                          )}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-2.5 px-3 text-right">
                          {disabled ? (
                            <span className="font-mono-code font-bold text-charcoal-900">
                              {item.quantity}
                            </span>
                          ) : (
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                handleFieldChange(idx, 'quantity', e.target.value)
                              }
                              className="w-24 text-right bg-white border border-charcoal-200 text-xs px-2 py-1 rounded-sm outline-none focus:border-safety font-mono-code font-bold"
                            />
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {selectedLocationId ? (
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-mono-code font-bold ${
                                isInsufficient
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {isInsufficient ? (
                                <>
                                  <AlertTriangle className="w-3 h-3" />
                                  Low ({availableQty})
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-3 h-3" />
                                  Avail ({availableQty})
                                </>
                              )}
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono-code text-charcoal-400">
                              Select Location
                            </span>
                          )}
                        </td>
                      </>
                    )}

                    {!disabled && (
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-charcoal-400 hover:text-red-600 transition-colors p-1 rounded-sm"
                          title="Remove Line"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
            {/* Table Footer Summary */}
            <tfoot>
              <tr className="bg-[#F8F8F6] border-t border-charcoal-100 font-mono-code text-xs font-bold text-charcoal-900">
                <td colSpan={3} className="py-2.5 px-3 uppercase tracking-wider text-right">
                  Total Units / Items:
                </td>
                <td className="py-2.5 px-3 text-right text-safety font-extrabold text-sm">
                  {totalQuantity}
                </td>
                <td colSpan={disabled ? 1 : 2} />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};
