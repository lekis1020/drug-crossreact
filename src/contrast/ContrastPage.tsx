import { useCallback, useEffect, useMemo, useState } from 'react';
import { contrastDatabase } from './data/contrastDatabase';
import { buildContrastGraphElements } from './data/contrastGraphData';
import { ContrastGraph } from './components/ContrastGraph';
import { ContrastSearchBar } from './components/ContrastSearchBar';
import { ContrastFilterPanel } from './components/ContrastFilterPanel';
import { ContrastSidePanel } from './components/ContrastSidePanel';
import { ContrastTooltip } from './components/ContrastTooltip';
import type { ContrastFilterState } from './types';

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

function formatDate(value: string | null): string {
  if (!value) return 'N/A';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(value.includes('T') ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(parsed);
}

export function ContrastPage({ onSwitchToAntibiotic }: ContrastPageProps) {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(() => {
    const firstAgent = buildContrastGraphElements().nodes[0];
    return firstAgent?.id ?? null;
  });
  const [tooltip, setTooltip] = useState<{ agentId: string; x: number; y: number } | null>(null);
  const [filters, setFilters] = useState<ContrastFilterState>(() => createInitialFilters());
  const [sidePanelOpen, setSidePanelOpen] = useState(true);

  const { nodes } = buildContrastGraphElements();
  const nodeMap = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);

  useEffect(() => {
    if (!selectedAgent && nodes.length > 0) {
      setSelectedAgent(nodes[0].id);
    }
  }, [nodes, selectedAgent]);

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
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#020617', color: '#e2e8f0' }}>
      <header
        className="flex items-center gap-4 px-5 py-3 flex-shrink-0 z-30"
        style={{
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(51, 65, 85, 0.5)',
        }}
      >
        <div className="flex items-center gap-3 mr-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)' }}>
            <span className="text-lg">🧪</span>
          </div>
          <div>
            <h1 className="font-bold text-white text-base leading-tight">CT Contrast Cross-Reactivity</h1>
            <p className="text-xs text-slate-500 leading-tight">Iodinated Contrast Explorer</p>
          </div>
        </div>

        <div className="flex-1 max-w-lg">
          <ContrastSearchBar onSearch={handleAgentSelect} selectedAgent={selectedAgent} />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <div className="hidden md:flex flex-col items-end mr-2 text-[11px] leading-tight">
            <span className="text-slate-400" title="검토 후 반영된 데이터베이스 최종 갱신 시점">
              DB 업데이트: {formatDate(lastDatabaseUpdateRaw)}
            </span>
            <span className="text-slate-500" title="자동 문헌 모니터링 마지막 실행 시점">
              모니터링: {formatDate(lastMonitoringRaw)}
            </span>
          </div>
          <button
            type="button"
            onClick={onSwitchToAntibiotic}
            className="px-3 py-2 rounded-lg text-sm text-slate-200 hover:text-white transition-colors"
            style={{
              background: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(71, 85, 105, 0.8)',
            }}
          >
            항생제 보기
          </button>
          <ContrastFilterPanel filters={filters} onFiltersChange={setFilters} />
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden relative">
        <div className="flex-1 relative min-w-0">
          <ContrastGraph selectedAgent={selectedAgent} onAgentSelect={handleAgentSelect} onAgentHover={handleAgentHover} filters={filters} />

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
            <div className="mt-2 pt-2 border-t border-slate-700/50">
              <p className="text-xs text-slate-500">Template preview: replace predicted links with reviewed evidence.</p>
            </div>
          </div>

          {selectedAgent && (
            <button
              onClick={() => setSelectedAgent(null)}
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

          <button
            onClick={() => setSidePanelOpen((prev) => !prev)}
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
            <ContrastSidePanel selectedAgentId={selectedAgent} />
          </div>
        </aside>
      </main>

      {tooltip && tooltipAgent && <ContrastTooltip agent={tooltipAgent} x={tooltip.x} y={tooltip.y} />}
    </div>
  );
}
