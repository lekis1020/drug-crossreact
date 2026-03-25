import { useEffect, useMemo, useRef, useState } from 'react';
import type { ContrastFilterState } from '../types';
import { contrastDatabase } from '../data/contrastDatabase';

interface ContrastFilterPanelProps {
  filters: ContrastFilterState;
  onFiltersChange: (filters: ContrastFilterState) => void;
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

export function ContrastFilterPanel({ filters, onFiltersChange }: ContrastFilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [groupSectionOpen, setGroupSectionOpen] = useState(true);
  const [riskSectionOpen, setRiskSectionOpen] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);

  const groupEntries = useMemo(
    () => contrastDatabase.agent_groups.map((group) => ({ id: group.group_id, label: group.name })),
    [],
  );

  const groupActiveCount = groupEntries.filter((group) => filters.groups[group.id]).length;
  const riskActiveCount = Object.values(filters.risks).filter(Boolean).length;

  const activeCount = groupActiveCount + riskActiveCount;
  const totalCount = groupEntries.length + Object.values(filters.risks).length;
  const isFiltered = activeCount < totalCount;

  const toggleGroup = (groupId: string) => {
    onFiltersChange({
      ...filters,
      groups: { ...filters.groups, [groupId]: !filters.groups[groupId] },
    });
  };

  const toggleRisk = (risk: keyof ContrastFilterState['risks']) => {
    onFiltersChange({
      ...filters,
      risks: { ...filters.risks, [risk]: !filters.risks[risk] },
    });
  };

  const setAllGroups = (nextValue: boolean) => {
    onFiltersChange({
      ...filters,
      groups: Object.fromEntries(groupEntries.map((entry) => [entry.id, nextValue])),
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
      groups: Object.fromEntries(groupEntries.map((entry) => [entry.id, true])),
      risks: { high: true, disputed: true, moderate: true, low: true },
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
        aria-controls="contrast-filter-panel-menu"
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
          id="contrast-filter-panel-menu"
          className="absolute right-0 top-full mt-2 w-80 rounded-xl shadow-2xl z-50 p-3"
          style={{ background: '#0f172a', border: '1px solid #334155' }}
        >
          <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-800/80">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Filter options</p>
            <button type="button" onClick={resetAll} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              Reset all
            </button>
          </div>

          <div className="mt-2 space-y-2">
            <div className="rounded-lg border border-slate-800/80 bg-slate-900/30 p-1.5">
              <SectionHeader
                title="Contrast Groups"
                subtitle={`${groupActiveCount}/${groupEntries.length} active`}
                open={groupSectionOpen}
                onToggle={() => setGroupSectionOpen((prev) => !prev)}
              />
              {groupSectionOpen && (
                <>
                  <div className="flex items-center gap-2 px-2 py-1.5">
                    <button
                      type="button"
                      onClick={() => setAllGroups(true)}
                      className="text-[11px] px-2 py-1 rounded-md text-slate-300 hover:bg-slate-700/70"
                    >
                      Select all
                    </button>
                    <button
                      type="button"
                      onClick={() => setAllGroups(false)}
                      className="text-[11px] px-2 py-1 rounded-md text-slate-300 hover:bg-slate-700/70"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="space-y-1 px-2 pb-2">
                    {groupEntries.map((group) => (
                      <label key={group.id} className="flex items-center gap-2.5 cursor-pointer group py-1">
                        <input
                          type="checkbox"
                          checked={filters.groups[group.id] ?? false}
                          onChange={() => toggleGroup(group.id)}
                          className="rounded border-slate-500 bg-slate-800"
                        />
                        <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{group.label}</span>
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
                      <input
                        type="checkbox"
                        checked={filters.risks.high}
                        onChange={() => toggleRisk('high')}
                        className="rounded border-slate-500 bg-slate-800"
                      />
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
                      <span className="text-sm text-slate-300 group-hover:text-white transition-colors">High</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group py-1">
                      <input
                        type="checkbox"
                        checked={filters.risks.disputed}
                        onChange={() => toggleRisk('disputed')}
                        className="rounded border-slate-500 bg-slate-800"
                      />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 flex-shrink-0" />
                      <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Disputed ⚠️</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group py-1">
                      <input
                        type="checkbox"
                        checked={filters.risks.moderate}
                        onChange={() => toggleRisk('moderate')}
                        className="rounded border-slate-500 bg-slate-800"
                      />
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-500 flex-shrink-0" />
                      <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Moderate</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group py-1">
                      <input
                        type="checkbox"
                        checked={filters.risks.low}
                        onChange={() => toggleRisk('low')}
                        className="rounded border-slate-500 bg-slate-800"
                      />
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
