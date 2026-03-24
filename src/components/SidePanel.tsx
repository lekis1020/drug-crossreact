import { buildGraphElements, getCrossReactiveDrugs, getSafeAlternatives } from '../data/graphData';
import { CLASS_LABELS } from '../data/colors';
import type { DrugClass, DrugNodeData } from '../types';

interface SidePanelProps {
  selectedDrugId: string | null;
}

export function SidePanel({ selectedDrugId }: SidePanelProps) {
  if (!selectedDrugId) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <div className="text-5xl mb-4 opacity-30">💊</div>
        <p className="text-sm text-slate-500">
          Click a drug in the graph to see cross-reactivity details
        </p>
      </div>
    );
  }

  const { nodes } = buildGraphElements();
  const drug = nodes.find(n => n.id === selectedDrugId);
  if (!drug) return null;

  const crossReactive = getCrossReactiveDrugs(selectedDrugId);
  const safeAlts = getSafeAlternatives(selectedDrugId);

  const safeByClass: Record<string, DrugNodeData[]> = {};
  for (const alt of safeAlts) {
    if (!safeByClass[alt.drugClass]) safeByClass[alt.drugClass] = [];
    safeByClass[alt.drugClass].push(alt);
  }

  return (
    <div className="h-full overflow-y-auto text-sm">
      {/* Drug header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: drug.color }} />
          <h2 className="text-base font-bold text-white">{drug.label}</h2>
        </div>
        <div className="space-y-0.5 text-slate-400 text-xs">
          <div>
            Class:{' '}
            <span className="text-slate-300">{CLASS_LABELS[drug.drugClass]}</span>
          </div>
          {drug.r1Group && (
            <div>
              R1:{' '}
              <span className="text-slate-300">
                {drug.r1Group} — {drug.r1Name}
              </span>
            </div>
          )}
          {drug.formula && (
            <div>
              Formula:{' '}
              <span className="text-slate-300 font-mono">{drug.formula}</span>
            </div>
          )}
        </div>
      </div>

      {/* Cross-reactive drugs */}
      <div className="p-4 border-b border-slate-800">
        <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          🔴 Cross-reactive
          <span className="text-slate-500 font-normal normal-case tracking-normal">
            ({crossReactive.length})
          </span>
        </h3>
        {crossReactive.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No known cross-reactive drugs</p>
        ) : (
          <div className="space-y-3">
            {crossReactive.map(cr => (
              <div key={cr.drugId} className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-slate-200">{cr.drugName}</span>
                    {cr.r1Group && (
                      <span className="text-xs text-slate-500">({cr.r1Group})</span>
                    )}
                  </div>
                  {cr.pmids.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {cr.pmids.slice(0, 3).map(pmid => (
                        <a
                          key={pmid}
                          href={`https://pubmed.ncbi.nlm.nih.gov/${pmid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300 hover:underline"
                        >
                          PMID:{pmid}
                        </a>
                      ))}
                    </div>
                  )}
                  {cr.clinicalNote && (
                    <p className="text-xs text-yellow-600 mt-1 italic leading-relaxed">
                      📋 {cr.clinicalNote}
                    </p>
                  )}
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium"
                  style={
                    cr.crossReactivity === 'high'
                      ? { background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }
                      : cr.crossReactivity === 'disputed'
                      ? { background: 'rgba(234,179,8,0.15)', color: '#fde047', border: '1px solid rgba(234,179,8,0.3)' }
                      : cr.crossReactivity === 'low'
                      ? { background: 'rgba(107,114,128,0.15)', color: '#9ca3af', border: '1px solid rgba(107,114,128,0.3)' }
                      : { background: 'rgba(249,115,22,0.15)', color: '#fdba74', border: '1px solid rgba(249,115,22,0.3)' }
                  }
                >
                  {cr.crossReactivity === 'high' ? 'High' : cr.crossReactivity === 'disputed' ? '⚠️ Disputed' : cr.crossReactivity === 'low' ? 'Low' : 'Mod'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Safe alternatives */}
      <div className="p-4">
        <h3 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          🟢 Safe alternatives
          <span className="text-slate-500 font-normal normal-case tracking-normal">
            ({safeAlts.length})
          </span>
        </h3>
        {safeAlts.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No safe alternatives identified</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(safeByClass).map(([cls, alts]) => (
              <div key={cls}>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1.5">
                  {CLASS_LABELS[cls as DrugClass] ?? cls}
                </p>
                <div className="space-y-1">
                  {alts.map(alt => (
                    <div key={alt.id} className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: alt.color }}
                      />
                      <span className="text-slate-300 text-xs">{alt.label}</span>
                      <span className="text-green-700 text-xs ml-auto">✓</span>
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
