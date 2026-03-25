import { useEffect, useRef, useState } from 'react';
import type { FilterState, DrugClass } from '../types';
import { CLASS_LABELS } from '../data/colors';

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

function SectionHeader({
  title,
  subtitle,
  open,
  onToggle,
}: {
  title: string;
  subtitle: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between text-left px-2 py-1.5 rounded-lg hover:bg-slate-800/80 transition-colors"
    >
      <div>
        <p className="text-xs text-slate-300 font-semibold uppercase tracking-wider">{title}</p>
        <p className="text-[11px] text-slate-500">{subtitle}</p>
      </div>
      <span className="text-xs text-slate-400">{open ? '▲' : '▼'}</span>
    </button>
  );
}

export function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [classSectionOpen, setClassSectionOpen] = useState(true);
  const [riskSectionOpen, setRiskSectionOpen] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);

  const classKeys = Object.keys(CLASS_LABELS) as DrugClass[];
  const classActiveCount = classKeys.filter((cls) => filters.classes[cls]).length;
  const riskActiveCount = Object.values(filters.risks).filter(Boolean).length;

  const activeCount = classActiveCount + riskActiveCount;
  const totalCount = classKeys.length + Object.values(filters.risks).length;
  const isFiltered = activeCount < totalCount;

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

  const setAllClasses = (nextValue: boolean) => {
    onFiltersChange({
      ...filters,
      classes: Object.fromEntries(classKeys.map((cls) => [cls, nextValue])) as FilterState['classes'],
    });
  };

  const setAllRisks = (nextValue: boolean) => {
    onFiltersChange({
      ...filters,
      risks: { high: nextValue, disputed: nextValue, moderate: nextValue, low: nextValue },
    });
  };

  const resetAll = () => {
    onFiltersChange({
      classes: Object.fromEntries(classKeys.map((cls) => [cls, true])) as FilterState['classes'],
      risks: { high: true, moderate: true, low: true, disputed: true },
    });
  };

  useEffect(() => {
    const onDocumentMouseDown = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', onDocumentMouseDown);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onDocumentMouseDown);
      document.removeEventListener('keydown', onEscape);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
        aria-expanded={isOpen}
        aria-controls="filter-panel-menu"
        style={{
          background: isFiltered ? '#1e3a5f' : '#1e293b',
          border: `1px solid ${isFiltered ? '#3b82f6' : '#334155'}`,
          color: '#e2e8f0',
        }}
      >
        <span>⚙</span>
        <span>Filters</span>
        {isFiltered && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/85 text-white font-semibold"
            title={`${totalCount - activeCount} filters hidden`}
          >
            {totalCount - activeCount}
          </span>
        )}
        <span className="text-xs">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div
          id="filter-panel-menu"
          className="absolute right-0 top-full mt-2 w-72 rounded-xl shadow-2xl z-50 p-3"
          style={{ background: '#0f172a', border: '1px solid #334155' }}
        >
          <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-800/80">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Filter options</p>
            <button
              type="button"
              onClick={resetAll}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Reset all
            </button>
          </div>

          <div className="mt-2 space-y-2">
            <div className="rounded-lg border border-slate-800/80 bg-slate-900/30 p-1.5">
              <SectionHeader
                title="Drug Classes"
                subtitle={`${classActiveCount}/${classKeys.length} active`}
                open={classSectionOpen}
                onToggle={() => setClassSectionOpen((prev) => !prev)}
              />
              {classSectionOpen && (
                <>
                  <div className="flex items-center gap-2 px-2 py-1.5">
                    <button
                      type="button"
                      onClick={() => setAllClasses(true)}
                      className="text-[11px] px-2 py-1 rounded-md text-slate-300 hover:bg-slate-700/70"
                    >
                      Select all
                    </button>
                    <button
                      type="button"
                      onClick={() => setAllClasses(false)}
                      className="text-[11px] px-2 py-1 rounded-md text-slate-300 hover:bg-slate-700/70"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="space-y-1 px-2 pb-2">
                    {classKeys.map((cls) => (
                      <label key={cls} className="flex items-center gap-2.5 cursor-pointer group py-1">
                        <input
                          type="checkbox"
                          checked={filters.classes[cls]}
                          onChange={() => toggleClass(cls)}
                          className="rounded border-slate-500 bg-slate-800"
                        />
                        <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                          {CLASS_LABELS[cls]}
                        </span>
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="rounded-lg border border-slate-800/80 bg-slate-900/30 p-1.5">
              <SectionHeader
                title="Risk Levels"
                subtitle={`${riskActiveCount}/4 active`}
                open={riskSectionOpen}
                onToggle={() => setRiskSectionOpen((prev) => !prev)}
              />
              {riskSectionOpen && (
                <>
                  <div className="flex items-center gap-2 px-2 py-1.5">
                    <button
                      type="button"
                      onClick={() => setAllRisks(true)}
                      className="text-[11px] px-2 py-1 rounded-md text-slate-300 hover:bg-slate-700/70"
                    >
                      Select all
                    </button>
                    <button
                      type="button"
                      onClick={() => setAllRisks(false)}
                      className="text-[11px] px-2 py-1 rounded-md text-slate-300 hover:bg-slate-700/70"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="space-y-1 px-2 pb-2">
                    <label className="flex items-center gap-2 cursor-pointer group py-1">
                      <input type="checkbox" checked={filters.risks.high} onChange={() => toggleRisk('high')} className="rounded border-slate-500 bg-slate-800" />
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
                      <span className="text-sm text-slate-300 group-hover:text-white transition-colors">High</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group py-1">
                      <input type="checkbox" checked={filters.risks.disputed} onChange={() => toggleRisk('disputed')} className="rounded border-slate-500 bg-slate-800" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 flex-shrink-0" />
                      <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Disputed ⚠️</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group py-1">
                      <input type="checkbox" checked={filters.risks.moderate} onChange={() => toggleRisk('moderate')} className="rounded border-slate-500 bg-slate-800" />
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-500 flex-shrink-0" />
                      <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Moderate</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group py-1">
                      <input type="checkbox" checked={filters.risks.low} onChange={() => toggleRisk('low')} className="rounded border-slate-500 bg-slate-800" />
                      <span className="w-2.5 h-2.5 rounded-full bg-gray-500 flex-shrink-0" />
                      <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Low</span>
                    </label>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
