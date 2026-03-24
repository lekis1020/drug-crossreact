import { useState } from 'react';
import type { FilterState, DrugClass } from '../types';
import { CLASS_LABELS } from '../data/colors';

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleClass = (cls: DrugClass) => {
    onFiltersChange({
      ...filters,
      classes: { ...filters.classes, [cls]: !filters.classes[cls] },
    });
  };

  const toggleRisk = (risk: 'high' | 'moderate' | 'low' | 'disputed') => {
    onFiltersChange({
      ...filters,
      risks: { ...filters.risks, [risk]: !filters.risks[risk] },
    });
  };

  const activeCount =
    Object.values(filters.classes).filter(Boolean).length +
    Object.values(filters.risks).filter(Boolean).length;
  const totalCount =
    Object.values(filters.classes).length + Object.values(filters.risks).length;
  const isFiltered = activeCount < totalCount;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
        style={{
          background: isFiltered ? '#1e3a5f' : '#1e293b',
          border: `1px solid ${isFiltered ? '#3b82f6' : '#334155'}`,
          color: '#e2e8f0',
        }}
      >
        <span>⚙</span>
        <span>Filters</span>
        {isFiltered && (
          <span className="text-xs bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
            !
          </span>
        )}
        <span className="text-xs">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-1 w-60 rounded-lg shadow-xl z-50 p-4"
          style={{ background: '#1e293b', border: '1px solid #334155' }}
        >
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-medium">
            Drug Classes
          </p>
          <div className="space-y-1.5 mb-4">
            {(Object.keys(CLASS_LABELS) as DrugClass[]).map(cls => (
              <label key={cls} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.classes[cls]}
                  onChange={() => toggleClass(cls)}
                  className="rounded"
                />
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                  {CLASS_LABELS[cls]}
                </span>
              </label>
            ))}
          </div>

          <p className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-medium">
            Risk Levels
          </p>
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" checked={filters.risks.high} onChange={() => toggleRisk('high')} className="rounded" />
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
              <span className="text-sm text-slate-300 group-hover:text-white transition-colors">High</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" checked={filters.risks.disputed} onChange={() => toggleRisk('disputed')} className="rounded" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 flex-shrink-0" />
              <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Disputed ⚠️</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" checked={filters.risks.moderate} onChange={() => toggleRisk('moderate')} className="rounded" />
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 flex-shrink-0" />
              <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Moderate</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" checked={filters.risks.low} onChange={() => toggleRisk('low')} className="rounded" />
              <span className="w-2.5 h-2.5 rounded-full bg-gray-500 flex-shrink-0" />
              <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Low</span>
            </label>
          </div>

          <button
            onClick={() =>
              onFiltersChange({
                classes: Object.fromEntries(
                  (Object.keys(CLASS_LABELS) as DrugClass[]).map(c => [c, true])
                ) as FilterState['classes'],
                risks: { high: true, moderate: true, low: true, disputed: true },
              })
            }
            className="mt-3 w-full text-xs text-slate-500 hover:text-slate-300 transition-colors text-center"
          >
            Reset all
          </button>
        </div>
      )}
    </div>
  );
}
