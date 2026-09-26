import React from 'react';
import { LayoutGrid, TableProperties } from 'lucide-react';

export const KanbanTableToggle = ({ view = 'table', onViewChange }) => {
  return (
    <div className="inline-flex items-center bg-white border border-charcoal-100 rounded-sm p-0.5 shadow-subtle">
      <button
        type="button"
        onClick={() => onViewChange('table')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-mono-code font-bold uppercase transition-all ${
          view === 'table'
            ? 'bg-charcoal-900 text-white'
            : 'text-charcoal-500 hover:text-charcoal-900 hover:bg-charcoal-50'
        }`}
        title="Table View"
      >
        <TableProperties className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Table</span>
      </button>

      <button
        type="button"
        onClick={() => onViewChange('kanban')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-mono-code font-bold uppercase transition-all ${
          view === 'kanban'
            ? 'bg-charcoal-900 text-white'
            : 'text-charcoal-500 hover:text-charcoal-900 hover:bg-charcoal-50'
        }`}
        title="Kanban Cards"
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Kanban</span>
      </button>
    </div>
  );
};
