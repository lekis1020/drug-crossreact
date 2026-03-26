import { useState, useCallback } from 'react';
import { Graph } from './components/Graph';
import { SearchBar } from './components/SearchBar';
import { SidePanel } from './components/SidePanel';
import { FilterPanel } from './components/FilterPanel';
import { DrugTooltip } from './components/DrugTooltip';
import { buildGraphElements } from './data/graphData';
import { drugDatabase } from './data/drugDatabase';
import type { FilterState, TooltipState } from './types';
import { ContrastPage } from './contrast/ContrastPage';
import { SharedLayout } from './components/layout/SharedLayout';
import { COLORS, EFFECTS } from './styles/design-tokens';

const INITIAL_FILTERS: FilterState = {
  classes: {
    penicillin: true,
    cephalosporin: true,
    carbapenem: true,
    monobactam: true,
    quinolone: true,
    glycopeptide: true,
    sulfonamide: true,
    macrolide: true,
    aminoglycoside: true,
    tetracycline: true,
    lincosamide: true,
    oxazolidinone: true,
    nitroimidazole: true,
    lipopeptide: true,
  },
  risks: { high: true, moderate: true, low: true, disputed: true },
};

export default function App() {
  const [projectMode, setProjectMode] = useState<'antibiotic' | 'contrast'>('antibiotic');
  const [selectedDrug, setSelectedDrug] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [sidePanelOpen, setSidePanelOpen] = useState(true);

  const { nodes } = buildGraphElements();
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  const handleDrugSelect = useCallback((drugId: string) => {
    setSelectedDrug(prev => (prev === drugId ? null : drugId));
    setSidePanelOpen(true);
  }, []);

  const handleDrugHover = useCallback(
    (drugId: string | null, x?: number, y?: number) => {
      if (!drugId) { setTooltip(null); return; }
      setTooltip({ drugId, x: x ?? 0, y: y ?? 0 });
    },
    [],
  );

  const tooltipDrug = tooltip ? nodeMap.get(tooltip.drugId) : null;
  const lastDatabaseUpdateRaw =
    drugDatabase.metadata?.last_database_update_at ??
    drugDatabase.metadata?.last_literature_monitoring_at ??
    drugDatabase.metadata?.created ??
    null;
  const lastMonitoringRaw = drugDatabase.metadata?.last_literature_monitoring_at ?? null;

  if (projectMode === 'contrast') {
    return <ContrastPage onSwitchToAntibiotic={() => setProjectMode('antibiotic')} />;
  }

  return (
    <SharedLayout
      mode="antibiotic"
      title="Antibiotic Cross-Reactivity"
      subtitle="Interactive β-Lactam Explorer"
      icon="💊"
      searchBar={<SearchBar onSearch={handleDrugSelect} selectedDrug={selectedDrug} />}
      filterPanel={<FilterPanel filters={filters} onFiltersChange={setFilters} />}
      onSwitchMode={() => setProjectMode('contrast')}
      lastDatabaseUpdate={lastDatabaseUpdateRaw}
      lastMonitoring={lastMonitoringRaw}
      sidePanel={<SidePanel selectedDrugId={selectedDrug} />}
      sidePanelOpen={sidePanelOpen}
      onToggleSidePanel={() => setSidePanelOpen(!sidePanelOpen)}
    >
      {/* Graph Area Container */}
      <div className="w-full h-full relative">
        <Graph
          selectedDrug={selectedDrug}
          onDrugSelect={handleDrugSelect}
          onDrugHover={handleDrugHover}
          filters={filters}
        />

        {/* Floating Selection Badge */}
        {selectedDrug && (
          <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
            <button
              onClick={() => setSelectedDrug(null)}
              className="text-xs text-white/70 hover:text-white transition-all flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 shadow-lg"
              style={{ background: COLORS.bg.header, backdropFilter: EFFECTS.glass.backdrop }}
            >
              <span className="text-[10px]">✕</span> Deselect
            </button>
            <div 
              className="px-4 py-2 rounded-xl border border-blue-500/30 shadow-lg text-sm font-bold text-white flex items-center gap-2"
              style={{ background: 'rgba(59, 130, 246, 0.2)', backdropFilter: EFFECTS.glass.backdrop }}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              {nodeMap.get(selectedDrug)?.label}
            </div>
          </div>
        )}

        {/* Legend Area — Floating card */}
        <div
          className="absolute bottom-5 left-5 rounded-2xl p-5 z-20 border border-white/10 shadow-2xl"
          style={{
            background: COLORS.bg.header,
            backdropFilter: EFFECTS.glass.backdrop,
          }}
        >
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-4">Reactivity Legend</p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 group">
              <div className="w-6 h-[3px] rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
              <span className="text-xs text-slate-300 group-hover:text-white transition-colors">High Risk Signal</span>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="w-6" style={{ borderTop: '2.5px dashed #f59e0b', height: 0 }} />
              <span className="text-xs text-slate-300 group-hover:text-white transition-colors">Disputed Evidence ⚠️</span>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="w-6" style={{ borderTop: '2px dashed #f97316', height: 0 }} />
              <span className="text-xs text-slate-300 group-hover:text-white transition-colors">Moderate / Potential</span>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="w-6" style={{ borderTop: '1.5px dashed #64748b', height: 0 }} />
              <span className="text-xs text-slate-300 group-hover:text-white transition-colors">Low / Sparse signal</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-3">Coverage Spectrum</p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 group">
                <div className="w-4 h-4 rounded-full border-[3px] border-double border-rose-500" />
                <span className="text-xs text-slate-300 group-hover:text-white transition-colors">MRSA Activity 🛡️</span>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="w-4 h-4 rounded-full border-2 border-cyan-500" />
                <span className="text-xs text-slate-300 group-hover:text-white transition-colors">Pseudomonas 🦠</span>
              </div>
            </div>
          </div>
          <div className="mt-3 text-[10px] text-slate-500 font-medium italic">
            Scroll to zoom · Drag to pan
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && tooltipDrug && (
        <DrugTooltip drug={tooltipDrug} x={tooltip.x} y={tooltip.y} />
      )}
    </SharedLayout>
  );
}
