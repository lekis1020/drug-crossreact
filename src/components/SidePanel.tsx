import { buildGraphElements, getCrossReactiveDrugs, getSafeAlternatives } from '../data/graphData';
import { CLASS_LABELS } from '../data/colors';
import type { DrugClass, DrugNodeData } from '../types';

interface SidePanelProps {
  selectedDrugId: string | null;
}

function EvidenceLink({ pmid }: { pmid: string }) {
  // Numeric → PubMed
  if (/^\d+$/.test(pmid)) {
    return (
      <a href={`https://pubmed.ncbi.nlm.nih.gov/${pmid}`} target="_blank" rel="noopener noreferrer"
        className="text-blue-400 hover:text-blue-300 hover:underline">
        PMID:{pmid}
      </a>
    );
  }
  // DOI pattern
  if (pmid.startsWith('10.')) {
    return (
      <a href={`https://doi.org/${pmid}`} target="_blank" rel="noopener noreferrer"
        className="text-blue-400 hover:text-blue-300 hover:underline">
        DOI
      </a>
    );
  }
  // Named reference (e.g., Stevenson2026_JACIG)
  const doiMap: Record<string, string> = {
    'Stevenson2026_JACIG': 'https://doi.org/10.1016/j.jacig.2025.100583',
    'Hutten2025_Allergy': 'https://doi.org/10.1111/all.16485',
  };
  if (doiMap[pmid]) {
    return (
      <a href={doiMap[pmid]} target="_blank" rel="noopener noreferrer"
        className="text-blue-400 hover:text-blue-300 hover:underline">
        {pmid.replace(/_/g, ' ')}
      </a>
    );
  }
  return <span className="text-slate-500">{pmid}</span>;
}

export function SidePanel({ selectedDrugId }: SidePanelProps) {
  if (!selectedDrugId) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <div className="text-6xl mb-4 opacity-30">💊</div>
        <p className="text-base text-slate-500">
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

  // Collect all unique PMIDs from this drug's edges
  const allPmids = [...new Set(crossReactive.flatMap(cr => cr.pmids))];

  const safeByClass: Record<string, DrugNodeData[]> = {};
  for (const alt of safeAlts) {
    if (!safeByClass[alt.drugClass]) safeByClass[alt.drugClass] = [];
    safeByClass[alt.drugClass].push(alt);
  }

  const riskBadgeStyle = (risk: string) => {
    switch (risk) {
      case 'high': return { background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' };
      case 'disputed': return { background: 'rgba(234,179,8,0.15)', color: '#fde047', border: '1px solid rgba(234,179,8,0.3)' };
      case 'moderate': return { background: 'rgba(249,115,22,0.15)', color: '#fdba74', border: '1px solid rgba(249,115,22,0.3)' };
      case 'low': return { background: 'rgba(107,114,128,0.15)', color: '#9ca3af', border: '1px solid rgba(107,114,128,0.3)' };
      default: return { background: '#333', color: '#999', border: '1px solid #555' };
    }
  };

  const riskLabel = (risk: string) => {
    switch (risk) {
      case 'high': return 'High';
      case 'disputed': return '⚠️ Disputed';
      case 'moderate': return 'Moderate';
      case 'low': return 'Low';
      default: return risk;
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Drug header */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: drug.color }} />
          <h2 className="text-xl font-bold text-white">{drug.label}</h2>
        </div>
        <div className="space-y-1 text-slate-400 text-sm">
          <div>Class: <span className="text-slate-300">{CLASS_LABELS[drug.drugClass]}</span></div>
          {drug.r1Group && (
            <div>R1: <span className="text-slate-300">{drug.r1Group} — {drug.r1Name}</span></div>
          )}
          {drug.formula && (
            <div>Formula: <span className="text-slate-300 font-mono">{drug.formula}</span></div>
          )}
        </div>

        {/* Key References */}
        {allPmids.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-700">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">📚 Key References</p>
            <div className="flex flex-wrap gap-2">
              {allPmids.map(pmid => (
                <span key={pmid} className="text-sm"><EvidenceLink pmid={pmid} /></span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cross-reactive drugs */}
      <div className="p-5 border-b border-slate-800">
        <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          🔴 Cross-reactive
          <span className="text-slate-500 font-normal normal-case tracking-normal">
            ({crossReactive.length})
          </span>
        </h3>
        {crossReactive.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No known cross-reactive drugs</p>
        ) : (
          <div className="space-y-4">
            {crossReactive.map(cr => (
              <div key={cr.drugId} className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base text-slate-200 font-medium">{cr.drugName}</span>
                    {cr.r1Group && (
                      <span className="text-sm text-slate-500">({cr.r1Group})</span>
                    )}
                  </div>
                  {cr.pmids.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {cr.pmids.slice(0, 3).map(pmid => (
                        <span key={pmid} className="text-sm"><EvidenceLink pmid={pmid} /></span>
                      ))}
                    </div>
                  )}
                  {cr.clinicalNote && (
                    <p className="text-sm text-yellow-600 mt-1.5 italic leading-relaxed">
                      📋 {cr.clinicalNote}
                    </p>
                  )}
                </div>
                <span
                  className="text-sm px-2.5 py-1 rounded-full flex-shrink-0 font-medium"
                  style={riskBadgeStyle(cr.crossReactivity)}
                >
                  {riskLabel(cr.crossReactivity)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Safe alternatives */}
      <div className="p-5">
        <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          🟢 Safe alternatives
          <span className="text-slate-500 font-normal normal-case tracking-normal">
            ({safeAlts.length})
          </span>
        </h3>
        {safeAlts.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No safe alternatives identified</p>
        ) : (
          <div className="space-y-5">
            {Object.entries(safeByClass).map(([cls, alts]) => (
              <div key={cls}>
                <p className="text-sm text-slate-500 uppercase tracking-wider mb-2 font-medium">
                  {CLASS_LABELS[cls as DrugClass] ?? cls}
                </p>
                <div className="space-y-1.5">
                  {alts.map(alt => (
                    <div key={alt.id} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: alt.color }} />
                      <span className="text-base text-slate-300">{alt.label}</span>
                      <span className="text-green-700 text-sm ml-auto">✓ safe</span>
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
