import { useCallback, useEffect, useMemo, useState } from 'react';
import { contrastDatabase } from './data/contrastDatabase';
import { buildContrastGraphElements } from './data/contrastGraphData';
import { ContrastGraph } from './components/ContrastGraph';
import { ContrastSearchBar } from './components/ContrastSearchBar';
import { ContrastFilterPanel } from './components/ContrastFilterPanel';
import { ContrastSidePanel } from './components/ContrastSidePanel';
import { ContrastTooltip } from './components/ContrastTooltip';
import type { ContrastFilterState } from './types';
import { SharedLayout } from '../components/layout/SharedLayout';
import { COLORS, EFFECTS } from '../styles/design-tokens';

interface ContrastPageProps {
  onSwitchToAntibiotic: () => void;
}

function createInitialFilters(): ContrastFilterState {
  return {
    groups: Object.fromEntries(contrastDatabase.agent_groups.map((group) => [group.group_id, true])),
    risks: {
      high: true,
      disputed: true,
      moderate: true,
      low: true,
    },
  };
}

export function ContrastPage({ onSwitchToAntibiotic }: ContrastPageProps) {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ agentId: string; x: number; y: number } | null>(null);
  const [filters, setFilters] = useState<ContrastFilterState>(() => createInitialFilters());
  const [sidePanelOpen, setSidePanelOpen] = useState(true);

  const { nodes } = buildContrastGraphElements();
  const nodeMap = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);

  const handleAgentSelect = useCallback((agentId: string) => {
    setSelectedAgent((prev) => (prev === agentId ? null : agentId));
    setSidePanelOpen(true);
  }, []);

  const handleAgentHover = useCallback((agentId: string | null, x?: number, y?: number) => {
    if (!agentId) {
      setTooltip(null);
      return;
    }
    setTooltip({ agentId, x: x ?? 0, y: y ?? 0 });
  }, []);

  const tooltipAgent = tooltip ? nodeMap.get(tooltip.agentId) : null;
  const lastDatabaseUpdateRaw =
    contrastDatabase.metadata?.last_database_update_at ??
    contrastDatabase.metadata?.last_literature_monitoring_at ??
    contrastDatabase.metadata?.created ??
    null;
  const lastMonitoringRaw = contrastDatabase.metadata?.last_literature_monitoring_at ?? null;

  return (
    <SharedLayout
      mode="contrast"
      title="CT Contrast Cross-Reactivity"
      subtitle="Iodinated Agent Explorer"
      icon="🧪"
      searchBar={<ContrastSearchBar onSearch={handleAgentSelect} selectedAgent={selectedAgent} />}
      filterPanel={<ContrastFilterPanel filters={filters} onFiltersChange={setFilters} />}
      onSwitchMode={onSwitchToAntibiotic}
      lastDatabaseUpdate={lastDatabaseUpdateRaw}
      lastMonitoring={lastMonitoringRaw}
      sidePanel={<ContrastSidePanel selectedAgentId={selectedAgent} />}
      sidePanelOpen={sidePanelOpen}
      onToggleSidePanel={() => setSidePanelOpen(!sidePanelOpen)}
    >
      <div className="w-full h-full relative">
        <ContrastGraph 
          selectedAgent={selectedAgent} 
          onAgentSelect={handleAgentSelect} 
          onAgentHover={handleAgentHover} 
          filters={filters} 
        />

        {/* Floating Selection Badge */}
        {selectedAgent && (
          <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
            <button
              onClick={() => setSelectedAgent(null)}
              className="text-xs text-white/70 hover:text-white transition-all flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 shadow-lg"
              style={{ background: COLORS.bg.header, backdropFilter: EFFECTS.glass.backdrop }}
            >
              <span className="text-[10px]">✕</span> Deselect
            </button>
            <div 
              className="px-4 py-2 rounded-xl border border-sky-500/30 shadow-lg text-sm font-bold text-white flex items-center gap-2"
              style={{ background: 'rgba(14, 165, 233, 0.2)', backdropFilter: EFFECTS.glass.backdrop }}
            >
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
              {nodeMap.get(selectedAgent)?.label}
            </div>
          </div>
        )}

        <div
          className="absolute bottom-5 left-5 rounded-2xl p-5 z-20 border border-white/10 shadow-2xl"
          style={{
            background: COLORS.bg.header,
            backdropFilter: EFFECTS.glass.backdrop,
          }}
        >
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-4">Edge Legend</p>
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
            <p className="text-[10px] text-slate-500 font-medium italic">
              Evidence-based links mapping iodinated contrast cross-reactivity.
            </p>
          </div>
        </div>
      </div>

      {tooltip && tooltipAgent && <ContrastTooltip agent={tooltipAgent} x={tooltip.x} y={tooltip.y} />}
    </SharedLayout>
  );
}
