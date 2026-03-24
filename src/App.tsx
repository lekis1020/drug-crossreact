import { useState, useCallback } from 'react';
import { Graph } from './components/Graph';
import { SearchBar } from './components/SearchBar';
import { SidePanel } from './components/SidePanel';
import { FilterPanel } from './components/FilterPanel';
import { EvidenceManager } from './components/EvidenceManager';
import { DrugTooltip } from './components/DrugTooltip';
import { buildGraphElements } from './data/graphData';
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
  },
  risks: { high: true, moderate: true, low: true, disputed: true },
};

export default function App() {
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  const { nodes } = buildGraphElements();
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  const handleDrugSelect = useCallback((drugId: string) => {
    setSelectedDrug(prev => (prev === drugId ? null : drugId));
  }, []);

  const handleDrugHover = useCallback(
    (drugId: string | null, x?: number, y?: number) => {
      if (!drugId) {
        setTooltip(null);
        return;
      }
      setTooltip({ drugId, x: x ?? 0, y: y ?? 0 });
    },
    [],
  );

  const tooltipDrug = tooltip ? nodeMap.get(tooltip.drugId) : null;

  return (
    <div className="flex flex-col h-screen" style={{ background: '#020617', color: '#e2e8f0' }}>
      {/* Header */}
      <header
        className="flex items-center gap-3 px-4 py-2.5 flex-shrink-0"
        style={{ background: '#0f172a', borderBottom: '1px solid #1e293b' }}
      >
        <div className="flex items-center gap-2 mr-1">
          <span className="text-base">💊</span>
          <h1 className="font-semibold text-white text-sm whitespace-nowrap">
            Cross-Reactivity
          </h1>
        </div>
        <div className="flex-1 min-w-0">
          <SearchBar onSearch={handleDrugSelect} selectedDrug={selectedDrug} />
        </div>
        <button
            onClick={() => setEvidenceOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
            style={{ background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0' }}
          >
            📚 Evidence
          </button>
          <FilterPanel filters={filters} onFiltersChange={setFilters} />
      </header>

      {/* Main */}
      <main className="flex flex-1 overflow-hidden">
        {/* Graph area — ~75% */}
        <div className="flex-1 relative min-w-0">
          <Graph
            selectedDrug={selectedDrug}
            onDrugSelect={handleDrugSelect}
            onDrugHover={handleDrugHover}
            filters={filters}
          />

          {/* Legend */}
          <div
            className="absolute bottom-4 left-4 rounded-lg p-3 text-xs"
            style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid #1e293b' }}
          >
            <p className="text-slate-400 font-medium mb-2">Edge legend</p>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-0.5 bg-red-500 rounded" />
              <span className="text-slate-300">High cross-reactivity</span>
            </div>
            <div className="flex items-center gap-2 mb-1.5">
              <div
                className="w-6"
                style={{
                  borderTop: '2px dashed #f97316',
                  height: 0,
                }}
              />
              <span className="text-slate-300">Moderate</span>
            </div>
            <p className="text-slate-500 mt-2 text-xs">Click node to select</p>
          </div>

          {/* Deselect hint */}
          {selectedDrug && (
            <button
              onClick={() => setSelectedDrug(null)}
              className="absolute top-3 left-3 text-xs text-slate-400 hover:text-slate-200 transition-colors"
              style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid #1e293b', borderRadius: 6, padding: '4px 10px' }}
            >
              ✕ Clear selection
            </button>
          )}
        </div>

        {/* Side panel — ~25% / 288px */}
        <aside
          className="w-72 flex-shrink-0 overflow-hidden"
          style={{ borderLeft: '1px solid #1e293b', background: '#0f172a' }}
        >
          <SidePanel selectedDrugId={selectedDrug} />
        </aside>
      </main>

      {/* Tooltip */}
      {tooltip && tooltipDrug && (
        <DrugTooltip drug={tooltipDrug} x={tooltip.x} y={tooltip.y} />
      )}
      <EvidenceManager isOpen={evidenceOpen} onClose={() => setEvidenceOpen(false)} />
    </div>
  );
}
