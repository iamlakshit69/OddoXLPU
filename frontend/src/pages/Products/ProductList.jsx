import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productApi } from '../../api/productApi';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { KanbanTableToggle } from '../../components/common/KanbanTableToggle';
import { ProductCard } from '../../components/common/ProductCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import {
  Package,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Edit2,
  Boxes,
  AlertTriangle,
  Layers,
  FolderPlus,
} from 'lucide-react';

export const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthorized } = useAuth();
  const { success, error } = useToast();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('table'); // 'table' | 'kanban'

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(
    searchParams.get('filter') === 'lowStock'
  );

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    categoryId: '',
    uom: 'PCS',
    reorderLevel: 10,
    reorderQty: 50,
  });
  const [categoryName, setCategoryName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchProductsAndCategories = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        productApi.listProducts({
          search: search || undefined,
          category: selectedCategory || undefined,
          lowStock: lowStockOnly ? 'true' : undefined,
        }),
        productApi.listCategories(),
      ]);
      if (prodRes?.data) setProducts(prodRes.data);
      if (catRes?.data) setCategories(catRes.data);
    } catch (err) {
      error(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsAndCategories();
  }, [search, selectedCategory, lowStockOnly]);

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      categoryId: categories[0]?.id || '',
      uom: 'PCS',
      reorderLevel: 10,
      reorderQty: 50,
    });
    setCreateModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      categoryId: product.categoryId || '',
      uom: product.uom,
      reorderLevel: product.reorderLevel,
      reorderQty: product.reorderQty,
    });
    setEditModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await productApi.createProduct(formData);
      success(`Product "${formData.name}" created successfully`);
      setCreateModalOpen(false);
      fetchProductsAndCategories();
    } catch (err) {
      error(err.message || 'Error creating product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await productApi.updateProduct(selectedProduct.id, formData);
      success(`Product "${formData.name}" updated successfully`);
      setEditModalOpen(false);
      fetchProductsAndCategories();
    } catch (err) {
      error(err.message || 'Error updating product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    setSubmitting(true);
    try {
      await productApi.createCategory({ name: categoryName.trim() });
      success(`Category "${categoryName}" created`);
      setCategoryName('');
      setCategoryModalOpen(false);
      fetchProductsAndCategories();
    } catch (err) {
      error(err.message || 'Failed to create category');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono-code font-bold uppercase tracking-widest text-safety">
              MASTER DATA CATALOG
            </span>
            <span className="text-charcoal-300">•</span>
            <span className="text-[11px] font-mono-code text-charcoal-500">
              {products.length} REGISTERED ITEMS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-charcoal-900 font-numeric">
            PRODUCTS & INVENTORY
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <KanbanTableToggle view={view} onViewChange={setView} />
          
          <Button
            size="sm"
            variant="outline"
            icon={FolderPlus}
            onClick={() => setCategoryModalOpen(true)}
          >
            + Category
          </Button>

          {isAuthorized(['ADMIN', 'MANAGER']) && (
            <Button
              size="sm"
              variant="primary"
              icon={Plus}
              onClick={handleOpenCreate}
            >
              New Product
            </Button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-charcoal-100 rounded-sm p-3 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by product name, SKU..."
              className="w-full bg-[#FBFBFA] border border-charcoal-100 text-xs pl-8 pr-3 py-2 rounded-sm outline-none focus:border-safety font-sans"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#FBFBFA] border border-charcoal-100 text-xs px-3 py-2 rounded-sm outline-none focus:border-safety font-sans cursor-pointer"
          >
            <option value="">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Low Stock Filter Pill */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLowStockOnly(!lowStockOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-mono-code font-bold uppercase transition-all border ${
              lowStockOnly
                ? 'bg-safety-light text-safety-dark border-safety'
                : 'bg-white text-charcoal-600 border-charcoal-200 hover:border-charcoal-400'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-safety" />
            <span>Low Stock Only</span>
          </button>

          <Button
            size="sm"
            variant="ghost"
            icon={RefreshCw}
            onClick={fetchProductsAndCategories}
            loading={loading}
          />
        </div>
      </div>

      {/* Content Rendering: Table or Kanban */}
      {view === 'kanban' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onClick={() => handleOpenEdit(p)}
            />
          ))}
          {products.length === 0 && (
            <div className="col-span-full py-12 text-center text-xs font-mono-code text-charcoal-400 bg-white border border-dashed border-charcoal-200 rounded-sm">
              No products found matching active search criteria.
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto border border-charcoal-100 rounded-sm bg-white shadow-subtle">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8F8F6] border-b border-charcoal-100 text-[10px] font-mono-code font-bold text-charcoal-500 uppercase tracking-wider">
                <th className="py-3 px-4">SKU Code</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">UOM</th>
                <th className="py-3 px-4 text-right">On-Hand Stock</th>
                <th className="py-3 px-4 text-right">Reorder Pt</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-50 text-xs font-sans">
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-charcoal-50/60 transition-colors group cursor-pointer"
                  onClick={() => handleOpenEdit(p)}
                >
                  <td className="py-3 px-4 font-mono-code font-bold text-charcoal-900">
                    <span className="px-2 py-0.5 bg-charcoal-50 border border-charcoal-200 rounded-sm text-[11px]">
                      {p.sku}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-charcoal-900 group-hover:text-safety transition-colors">
                    {p.name}
                  </td>
                  <td className="py-3 px-4 text-charcoal-600 font-medium">
                    {p.Category?.name || '—'}
                  </td>
                  <td className="py-3 px-4 font-mono-code text-charcoal-500 font-bold">
                    {p.uom}
                  </td>
                  <td className="py-3 px-4 text-right font-numeric font-black text-sm text-charcoal-900">
                    {p.totalStock ?? 0}
                  </td>
                  <td className="py-3 px-4 text-right font-mono-code text-charcoal-500">
                    {p.reorderLevel}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge status={p.stockStatus} />
                  </td>
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="text-charcoal-400 hover:text-charcoal-900 transition-colors p-1"
                      title="Edit Product"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}

              {products.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="py-12 text-center text-xs font-mono-code text-charcoal-400"
                  >
                    No products found. Use "+ New Product" above to create an item.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE PRODUCT MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="CREATE PRODUCT CATALOG ITEM"
        subtitle="Define SKU and automated replenishment parameters"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Product Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Servo Motor 750W"
            />
            <Input
              label="SKU Identifier"
              required
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="e.g. SKU-SRV-750"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            >
              <option value="">-- Select Category --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>

            <Select
              label="Unit of Measure (UOM)"
              value={formData.uom}
              onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
            >
              <option value="PCS">PCS (Pieces)</option>
              <option value="BOX">BOX (Cartons)</option>
              <option value="MTR">MTR (Meters)</option>
              <option value="KG">KG (Kilograms)</option>
              <option value="LTR">LTR (Liters)</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Reorder Alert Level"
              type="number"
              min="0"
              value={formData.reorderLevel}
              onChange={(e) =>
                setFormData({ ...formData, reorderLevel: Number(e.target.value) })
              }
              helperText="Alert triggered when stock falls at or below this count"
            />
            <Input
              label="Reorder Standard Qty"
              type="number"
              min="1"
              value={formData.reorderQty}
              onChange={(e) =>
                setFormData({ ...formData, reorderQty: Number(e.target.value) })
              }
              helperText="Default replenishment order size"
            />
          </div>

          <div className="pt-4 border-t border-charcoal-100 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
            >
              Create Product
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT PRODUCT MODAL */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`EDIT PRODUCT • ${selectedProduct?.sku || ''}`}
        subtitle="Update catalog specifications and location inventory"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Product Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            >
              <option value="">-- None --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>

            <Select
              label="Unit of Measure (UOM)"
              value={formData.uom}
              onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
            >
              <option value="PCS">PCS (Pieces)</option>
              <option value="BOX">BOX (Cartons)</option>
              <option value="MTR">MTR (Meters)</option>
              <option value="KG">KG (Kilograms)</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Reorder Alert Level"
              type="number"
              min="0"
              value={formData.reorderLevel}
              onChange={(e) =>
                setFormData({ ...formData, reorderLevel: Number(e.target.value) })
              }
            />
            <Input
              label="Reorder Standard Qty"
              type="number"
              min="0"
              value={formData.reorderQty}
              onChange={(e) =>
                setFormData({ ...formData, reorderQty: Number(e.target.value) })
              }
            />
          </div>

          {/* Location Breakdown Snapshot */}
          {selectedProduct?.Stocks && selectedProduct.Stocks.length > 0 && (
            <div className="pt-2">
              <span className="text-[11px] font-mono-code font-bold uppercase text-charcoal-700 block mb-2">
                LOCATION INVENTORY BREAKDOWN
              </span>
              <div className="border border-charcoal-100 rounded-sm divide-y divide-charcoal-50 text-xs">
                {selectedProduct.Stocks.map((s) => (
                  <div
                    key={s.id}
                    className="p-2.5 flex items-center justify-between bg-[#FBFBFA]"
                  >
                    <div>
                      <span className="font-bold text-charcoal-900 block">
                        {s.StockLocation?.name || `Location #${s.locationId}`}
                      </span>
                      <span className="text-[10px] font-mono-code text-charcoal-400">
                        {s.StockLocation?.Warehouse?.name || 'Warehouse'}
                      </span>
                    </div>
                    <span className="font-numeric font-bold text-sm text-charcoal-900">
                      {s.quantity} {selectedProduct.uom}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-charcoal-100 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* CREATE CATEGORY MODAL */}
      <Modal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        title="CREATE PRODUCT CATEGORY"
        subtitle="Organize inventory groups"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <Input
            label="Category Name"
            required
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="e.g. Precision Hardware & Fasteners"
          />

          <div className="pt-4 border-t border-charcoal-100 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setCategoryModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
            >
              Save Category
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
