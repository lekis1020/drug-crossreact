import { useState, useCallback } from 'react';
import { Graph } from './components/Graph';
import type { GraphViewMode } from './components/Graph';
import { SearchBar } from './components/SearchBar';
import { SidePanel } from './components/SidePanel';
import { FilterPanel } from './components/FilterPanel';
import { DrugTooltip } from './components/DrugTooltip';
import { buildGraphElements } from './data/graphData';
import { drugDatabase } from './data/drugDatabase';
import type { FilterState, TooltipState } from './types';

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
  const [selectedDrug, setSelectedDrug] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<GraphViewMode>('3d');
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

  const formatDate = (value: string | null) => {
    if (!value) return 'N/A';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...(value.includes('T') ? { hour: '2-digit', minute: '2-digit' } : {}),
    }).format(parsed);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#020617', color: '#e2e8f0' }}>
      {/* Header — glass morphism */}
      <header
        className="flex items-center gap-4 px-5 py-3 flex-shrink-0 z-30"
        style={{
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(51, 65, 85, 0.5)',
        }}
      >
        <div className="flex items-center gap-3 mr-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
            <span className="text-lg">💊</span>
          </div>
          <div>
            <h1 className="font-bold text-white text-base leading-tight">Drug Cross-Reactivity</h1>
            <p className="text-xs text-slate-500 leading-tight">Interactive Graph Explorer</p>
          </div>
        </div>

        <div className="flex-1 max-w-lg">
          <SearchBar onSearch={handleDrugSelect} selectedDrug={selectedDrug} />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <div
            className="flex items-center rounded-xl p-1 mr-1"
            style={{
              background: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(51, 65, 85, 0.6)',
            }}
          >
            {(['2d', '3d'] as GraphViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all"
                style={{
                  color: viewMode === mode ? '#f8fafc' : '#94a3b8',
                  background: viewMode === mode ? 'rgba(59, 130, 246, 0.35)' : 'transparent',
                }}
              >
                {mode.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="hidden lg:flex flex-col items-end mr-2 text-[11px] text-slate-500 leading-tight">
            <span>DB 업데이트: {formatDate(lastDatabaseUpdateRaw)}</span>
            <span>모니터링: {formatDate(lastMonitoringRaw)}</span>
          </div>
          <FilterPanel filters={filters} onFiltersChange={setFilters} />
        </div>
      </header>

      {/* Main */}
      <main className="flex flex-1 overflow-hidden relative">
        {/* Graph area */}
        <div className="flex-1 relative min-w-0">
          <Graph
            selectedDrug={selectedDrug}
            onDrugSelect={handleDrugSelect}
            onDrugHover={handleDrugHover}
            filters={filters}
            viewMode={viewMode}
          />

          {/* Legend — floating glass card */}
          <div
            className="absolute bottom-5 left-5 rounded-2xl p-4 z-20"
            style={{
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(51, 65, 85, 0.4)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}
          >
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-3">Edge Legend</p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-[3px] rounded-full bg-red-500" />
                <span className="text-sm text-slate-300">High cross-reactivity</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8" style={{ borderTop: '2.5px dashed #eab308', height: 0 }} />
                <span className="text-sm text-slate-300">Disputed ⚠️</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8" style={{ borderTop: '2px dashed #f97316', height: 0 }} />
                <span className="text-sm text-slate-300">Moderate</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8" style={{ borderTop: '1.5px dashed #6b7280', height: 0 }} />
                <span className="text-sm text-slate-300">Low</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-700/50">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Node Border</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full" style={{ border: '3px double #f43f5e', background: 'transparent' }} />
                  <span className="text-sm text-slate-300">🛡️ MRSA coverage</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full" style={{ border: '2.5px solid #06b6d4', background: 'transparent' }} />
                  <span className="text-sm text-slate-300">🦠 Pseudomonas coverage</span>
                </div>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-700/50">
              <p className="text-xs text-slate-500">
                {viewMode === '3d' ? 'Drag to orbit · Scroll to zoom' : 'Drag to pan · Scroll to zoom'}
              </p>
            </div>
          </div>

          {/* Clear selection button */}
          {selectedDrug && (
            <button
              onClick={() => setSelectedDrug(null)}
              className="absolute top-4 left-4 text-sm text-slate-400 hover:text-white transition-all hover:scale-105 z-20 flex items-center gap-1.5"
              style={{
                background: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(51, 65, 85, 0.4)',
                borderRadius: 12,
                padding: '8px 14px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              }}
            >
              <span>✕</span> Clear selection
            </button>
          )}

          {/* Toggle side panel */}
          <button
            onClick={() => setSidePanelOpen(!sidePanelOpen)}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all hover:scale-105"
            style={{
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(51, 65, 85, 0.4)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            }}
          >
            {sidePanelOpen ? '→' : '←'}
          </button>
        </div>

        {/* Side panel — slide in/out */}
        <aside
          className="flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            width: sidePanelOpen ? 360 : 0,
            borderLeft: sidePanelOpen ? '1px solid rgba(51, 65, 85, 0.4)' : 'none',
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div className="w-[360px] h-full">
            <SidePanel selectedDrugId={selectedDrug} />
          </div>
        </aside>
      </main>

      {/* Tooltip */}
      {tooltip && tooltipDrug && (
        <DrugTooltip drug={tooltipDrug} x={tooltip.x} y={tooltip.y} />
      )}
    </div>
  );
}
