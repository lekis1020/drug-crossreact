import { buildContrastGraphElements, getCrossReactiveAgents, getNoKnownSignalAlternatives } from '../data/contrastGraphData';
import { RiskBadge } from '../../components/RiskBadge';
import type { ContrastNodeData } from '../types';

interface ContrastSidePanelProps {
  selectedAgentId: string | null;
}

function EvidenceLink({ id }: { id: string }) {
  if (/^\d+$/.test(id)) {
    return (
      <a
        href={`https://pubmed.ncbi.nlm.nih.gov/${id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 hover:text-blue-300 hover:underline"
      >
        PMID:{id}
      </a>
    );
  }

  if (id.startsWith('10.')) {
    return (
      <a href={`https://doi.org/${id}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline">
        DOI
      </a>
    );
  }

  return <span className="text-slate-500">{id}</span>;
}

export function ContrastSidePanel({ selectedAgentId }: ContrastSidePanelProps) {
  if (!selectedAgentId) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <div className="text-6xl mb-4 opacity-30">🧪</div>
        <p className="text-base text-slate-500">Select a contrast agent to review cross-reactivity evidence</p>
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
    <div className="h-full overflow-y-auto">
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: agent.color }} />
          <h2 className="text-xl font-bold text-white">{agent.label}</h2>
        </div>
        <div className="space-y-1 text-slate-400 text-sm">
          <div>
            Group: <span className="text-slate-300">{agent.groupName}</span>
          </div>
          <div>
            Ionicity: <span className="text-slate-300">{agent.ionicity}</span>
          </div>
          <div>
            Structure: <span className="text-slate-300">{agent.structure}</span>
          </div>
          <div>
            Osmolality: <span className="text-slate-300">{agent.osmolalityClass}</span>
          </div>
        </div>

        {allEvidenceIds.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-700">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">📚 Key References</p>
            <div className="flex flex-wrap gap-2">
              {allEvidenceIds.map((id) => (
                <span key={id} className="text-sm">
                  <EvidenceLink id={id} />
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-5 border-b border-slate-800">
        <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          🔴 Known cross-reactive
          <span className="text-slate-500 font-normal normal-case tracking-normal">({crossReactive.length})</span>
        </h3>
        {crossReactive.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No known cross-reactive agents</p>
        ) : (
          <div className="space-y-4">
            {crossReactive.map((item) => (
              <div key={item.agentId} className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base text-slate-200 font-medium">{item.agentName}</span>
                    <span className="text-sm text-slate-500">({item.groupName})</span>
                  </div>
                  {item.pmids.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {item.pmids.slice(0, 3).map((id) => (
                        <span key={id} className="text-sm">
                          <EvidenceLink id={id} />
                        </span>
                      ))}
                    </div>
                  )}
                  {item.clinicalNote && <p className="text-sm text-yellow-600 mt-1.5 italic leading-relaxed">📋 {item.clinicalNote}</p>}
                </div>
                <RiskBadge risk={item.crossReactivity} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          🟢 No known signal options
          <span className="text-slate-500 font-normal normal-case tracking-normal">({noKnownSignals.length})</span>
        </h3>
        <p className="text-xs text-slate-500 mb-3 leading-relaxed">
          No known signal ≠ guaranteed safety. Choose alternatives using reaction phenotype, premedication strategy,
          and specialist-guided protocol.
        </p>
        {noKnownSignals.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No low-signal alternatives identified</p>
        ) : (
          <div className="space-y-5">
            {Object.entries(alternativesByGroup).map(([groupName, options]) => (
              <div key={groupName}>
                <p className="text-sm text-slate-500 uppercase tracking-wider mb-2 font-medium">{groupName}</p>
                <div className="space-y-1.5">
                  {options.map((option) => (
                    <div key={option.id} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: option.color }} />
                      <span className="text-base text-slate-300">{option.label}</span>
                      <span className="text-emerald-400/90 text-xs ml-auto">No known signal</span>
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
