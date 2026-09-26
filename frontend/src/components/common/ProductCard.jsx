import React from 'react';
import { Badge } from '../ui/Badge';
import { Package, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';

export const ProductCard = ({ product, onClick }) => {
  const isLowStock = (product.totalStock ?? 0) <= (product.reorderLevel ?? 0) && (product.totalStock ?? 0) > 0;
  const isOutOfStock = (product.totalStock ?? 0) <= 0;

  return (
    <div
      onClick={onClick}
      className="bg-white border border-charcoal-100 rounded-sm p-4 hover:border-safety hover:shadow-card transition-all duration-200 cursor-pointer flex flex-col justify-between group"
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="font-mono-code text-[10px] font-bold px-2 py-0.5 rounded-sm bg-charcoal-50 text-charcoal-700 border border-charcoal-200">
            {product.sku}
          </span>
          <Badge
            status={
              isOutOfStock
                ? 'OUT_OF_STOCK'
                : isLowStock
                ? 'LOW_STOCK'
                : 'IN_STOCK'
            }
          />
        </div>

        {/* Off-White Visual Inner Container */}
        <div className="bg-[#F8F8F6] border border-charcoal-100 rounded-sm p-4 mb-3 flex items-center justify-center relative overflow-hidden group-hover:bg-[#F2F2EE] transition-colors">
          <Package className="w-10 h-10 text-charcoal-300 group-hover:text-safety transition-colors" />
          <div className="absolute top-2 right-2 text-[9px] font-mono-code text-charcoal-400">
            {product.Category?.name || 'Standard'}
          </div>
        </div>

        {/* Title */}
        <h4 className="text-xs font-bold text-charcoal-900 group-hover:text-safety transition-colors line-clamp-2 mb-2 leading-relaxed">
          {product.name}
        </h4>
      </div>

      {/* Stock Metrics Footer */}
      <div className="pt-3 border-t border-charcoal-50 flex items-end justify-between">
        <div>
          <span className="text-[10px] font-mono-code uppercase text-charcoal-400 block mb-0.5">
            On Hand / Reorder
          </span>
          <div className="flex items-baseline gap-1">
            <span
              className={`font-numeric text-lg font-black ${
                isOutOfStock
                  ? 'text-rose-600'
                  : isLowStock
                  ? 'text-amber-600'
                  : 'text-charcoal-900'
              }`}
            >
              {product.totalStock ?? 0}
            </span>
            <span className="text-[10px] font-mono-code text-charcoal-500 font-bold">
              {product.uom}
            </span>
            <span className="text-[10px] font-mono-code text-charcoal-400">
              / {product.reorderLevel ?? 0} min
            </span>
          </div>
        </div>

        <div className="w-7 h-7 rounded-sm bg-charcoal-50 group-hover:bg-charcoal-900 group-hover:text-white flex items-center justify-center transition-all">
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
