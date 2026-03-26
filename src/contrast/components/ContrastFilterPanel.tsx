import { useEffect, useMemo, useRef, useState } from 'react';
import type { ContrastFilterState } from '../types';
import { contrastDatabase } from '../data/contrastDatabase';
import { COLORS, EFFECTS } from '../../styles/design-tokens';

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
      className="w-full flex items-center justify-between text-left px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group"
    >
      <div>
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest group-hover:text-slate-400 transition-colors">{title}</p>
        <p className="text-[11px] text-slate-400 font-medium">{subtitle}</p>
      </div>
      <span className={`text-[10px] text-slate-500 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>▼</span>
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
    document.addEventListener('mousedown', onDocumentMouseDown);
    return () => document.removeEventListener('mousedown', onDocumentMouseDown);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border shadow-lg"
        style={{
          background: isFiltered ? 'rgba(14, 165, 233, 0.15)' : COLORS.bg.header,
          border: isFiltered ? '1px solid rgba(14, 165, 233, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
          color: isFiltered ? '#38bdf8' : '#e2e8f0',
          backdropFilter: EFFECTS.glass.backdrop,
        }}
      >
        <span className="text-sm">⚙</span>
        <span>Filters</span>
        {isFiltered && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500 text-white font-black">
            {totalCount - activeCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-3 w-80 rounded-2xl shadow-2xl z-50 p-4 border border-white/10"
          style={{ 
            background: COLORS.bg.panel,
            backdropFilter: EFFECTS.glass.backdrop,
          }}
        >
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">Filter Config</p>
            <button
              type="button"
              onClick={resetAll}
              className="text-[10px] font-bold text-sky-400 hover:text-sky-300 transition-colors uppercase"
            >
              Reset All
            </button>
          </div>

          <div className="space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar pr-1">
            {/* Contrast Groups Section */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2">
              <SectionHeader
                title="Contrast Groups"
                subtitle={`${groupActiveCount} of ${groupEntries.length} visible`}
                open={groupSectionOpen}
                onToggle={() => setGroupSectionOpen((prev) => !prev)}
              />
              {groupSectionOpen && (
                <div className="mt-2 space-y-1 px-1 pb-2">
                  <div className="flex gap-2 mb-3 px-2">
                    <button onClick={() => setAllGroups(true)} className="flex-1 text-[10px] py-1 rounded bg-white/5 text-slate-400 hover:text-white transition-colors border border-white/5">ALL</button>
                    <button onClick={() => setAllGroups(false)} className="flex-1 text-[10px] py-1 rounded bg-white/5 text-slate-400 hover:text-white transition-colors border border-white/5">NONE</button>
                  </div>
                  {groupEntries.map((group) => (
                    <label key={group.id} className="flex items-center gap-3 cursor-pointer group py-1 px-2 rounded-lg hover:bg-white/5 transition-colors">
                      <div className="relative flex items-center justify-center w-4 h-4 rounded border border-slate-600 bg-slate-800 transition-all group-hover:border-sky-500">
                        <input
                          type="checkbox"
                          checked={filters.groups[group.id] ?? false}
                          onChange={() => toggleGroup(group.id)}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        {filters.groups[group.id] && <div className="w-2.5 h-2.5 rounded-sm bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.6)]" />}
                      </div>
                      <span className="text-xs text-slate-300 group-hover:text-white transition-colors font-medium">
                        {group.label}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Risk Levels Section */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2">
              <SectionHeader
                title="Risk Levels"
                subtitle={`${riskActiveCount} types active`}
                open={riskSectionOpen}
                onToggle={() => setRiskSectionOpen((prev) => !prev)}
              />
              {riskSectionOpen && (
                <div className="mt-2 space-y-1 px-1 pb-2">
                  <div className="flex gap-2 mb-3 px-2">
                    <button onClick={() => setAllRisks(true)} className="flex-1 text-[10px] py-1 rounded bg-white/5 text-slate-400 hover:text-white transition-colors border border-white/5">ALL</button>
                    <button onClick={() => setAllRisks(false)} className="flex-1 text-[10px] py-1 rounded bg-white/5 text-slate-400 hover:text-white transition-colors border border-white/5">NONE</button>
                  </div>
                  {(['high', 'disputed', 'moderate', 'low'] as const).map((risk) => (
                    <label key={risk} className="flex items-center gap-3 cursor-pointer group py-1.5 px-2 rounded-lg hover:bg-white/5 transition-colors">
                      <div className="relative flex items-center justify-center w-4 h-4 rounded border border-slate-600 bg-slate-800 transition-all group-hover:border-sky-500">
                        <input
                          type="checkbox"
                          checked={filters.risks[risk]}
                          onChange={() => toggleRisk(risk)}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        {filters.risks[risk] && <div className="w-2.5 h-2.5 rounded-sm bg-sky-500" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: COLORS.risk[risk].main }} />
                        <span className="text-xs text-slate-300 group-hover:text-white transition-colors capitalize font-medium">{risk}</span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
