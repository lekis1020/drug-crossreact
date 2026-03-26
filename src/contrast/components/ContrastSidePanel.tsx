import { buildContrastGraphElements, getCrossReactiveAgents, getNoKnownSignalAlternatives } from '../data/contrastGraphData';
import { RiskBadge } from '../../components/RiskBadge';
import type { ContrastNodeData } from '../types';
import { COLORS, EFFECTS } from '../../styles/design-tokens';

interface ContrastSidePanelProps {
  selectedAgentId: string | null;
}

function EvidenceChip({ pmid }: { pmid: string }) {
  let href = '';
  let label = pmid;

  if (/^\d+$/.test(pmid)) {
    href = `https://pubmed.ncbi.nlm.nih.gov/${pmid}`;
    label = `PMID:${pmid}`;
  } else if (pmid.startsWith('10.')) {
    href = `https://doi.org/${pmid}`;
    label = 'DOI';
  }

  if (!href) return <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-500 font-mono">{label}</span>;

  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-[11px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 transition-colors font-mono"
    >
      {label}
    </a>
  );
}

export function ContrastSidePanel({ selectedAgentId }: ContrastSidePanelProps) {
  if (!selectedAgentId) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-950/20">
        <div className="text-6xl mb-6 opacity-20 grayscale">🧪</div>
        <h3 className="text-lg font-semibold text-slate-300 mb-2">Agent Details</h3>
        <p className="text-sm text-slate-500 max-w-[200px]">
          Select a contrast agent from the graph to analyze cross-reactivity evidence.
        </p>
      </div>
    );
  }

  const { nodes } = buildContrastGraphElements();
  const agent = nodes.find((node) => node.id === selectedAgentId);
  if (!agent) return null;

  const crossReactive = getCrossReactiveAgents(selectedAgentId);
  const noKnownSignals = getNoKnownSignalAlternatives(selectedAgentId);
  const allEvidenceIds = [...new Set(crossReactive.flatMap((item) => item.pmids))];

  const alternativesByGroup: Record<string, ContrastNodeData[]> = {};
  for (const alternative of noKnownSignals) {
    if (!alternativesByGroup[alternative.groupName]) alternativesByGroup[alternative.groupName] = [];
    alternativesByGroup[alternative.groupName].push(alternative);
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar" style={{ background: COLORS.bg.panel }}>
      {/* 1. Header & Summary Card */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-5 h-5 rounded-full shadow-lg" style={{ background: agent.color, boxShadow: `0 0 12px ${agent.color}44` }} />
          <h2 className="text-2xl font-bold text-white tracking-tight">{agent.label}</h2>
        </div>
        
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 shadow-inner">
          <div className="grid grid-cols-2 gap-y-3 gap-x-4">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Group</p>
              <p className="text-sm text-slate-200">{agent.groupName}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Ionicity</p>
              <p className="text-sm text-slate-200">{agent.ionicity}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Structure</p>
              <p className="text-sm text-slate-200">{agent.structure}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Osmolality</p>
              <p className="text-sm text-slate-200">{agent.osmolalityClass}</p>
            </div>
          </div>
        </div>

        {/* Key References Pinned */}
        {allEvidenceIds.length > 0 && (
          <div className="mt-4">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">📚 Key Evidence</p>
            <div className="flex flex-wrap gap-1.5">
              {allEvidenceIds.map(id => <EvidenceChip key={id} pmid={id} />)}
            </div>
          </div>
        )}
      </div>

      {/* 2. Cross-reactive section */}
      <div className="p-6 border-b border-white/5 bg-red-500/[0.02]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Cross-Reactive Risks
          </h3>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-bold">{crossReactive.length}</span>
        </div>
        
        {crossReactive.length === 0 ? (
          <p className="text-sm text-slate-500 italic px-2">No significant cross-reactivity signals identified in reviewed evidence.</p>
        ) : (
          <div className="space-y-5">
            {crossReactive.map(cr => (
              <div key={cr.agentId} className="group relative">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-base text-white font-semibold tracking-tight group-hover:text-red-300 transition-colors">
                        {cr.agentName}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">({cr.groupName})</span>
                    </div>
                    {cr.clinicalNote && (
                      <div className="mt-1.5 text-xs text-orange-200/70 leading-relaxed bg-orange-500/5 p-2 rounded-lg border-l-2 border-orange-500/30">
                        {cr.clinicalNote}
                      </div>
                    )}
                    {cr.pmids.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {cr.pmids.slice(0, 2).map(id => <EvidenceChip key={id} pmid={id} />)}
                      </div>
                    )}
                  </div>
                  <RiskBadge risk={cr.crossReactivity} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Safe Alternatives section */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Potential Alternatives
          </h3>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">{noKnownSignals.length}</span>
        </div>
        <p className="text-[10px] text-slate-500 mb-5 leading-normal bg-emerald-500/5 p-2 rounded border border-emerald-500/10">
          ⚠️ <span className="text-emerald-300/80 font-semibold text-[11px]">No known signal ≠ guaranteed safety.</span> Decision should involve reaction phenotype, premedication strategy, and specialist judgment.
        </p>

        {noKnownSignals.length === 0 ? (
          <p className="text-sm text-slate-500 italic px-2">No low-signal alternatives identified.</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(alternativesByGroup).map(([groupName, options]) => (
              <div key={groupName}>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-3 border-l-2 border-slate-700 pl-2">
                  {groupName}
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  {options.map(option => (
                    <div key={option.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 group">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full shadow-sm" style={{ background: option.color }} />
                        <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{option.label}</span>
                      </div>
                      <span className="text-[10px] text-emerald-500/60 font-bold uppercase tracking-tighter">No signal</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
