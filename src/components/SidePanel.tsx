import { buildGraphElements, getCrossReactiveDrugs, getSafeAlternatives, DRUG_SPECTRUM_TAGS } from '../data/graphData';
import { CLASS_LABELS } from '../data/colors';
import type { DrugClass, DrugNodeData } from '../types';
import { RiskBadge } from './RiskBadge';
import { COLORS, EFFECTS } from '../styles/design-tokens';

interface SidePanelProps {
  selectedDrugId: string | null;
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
  } else {
    const doiMap: Record<string, string> = {
      'Stevenson2026_JACIG': 'https://doi.org/10.1016/j.jacig.2025.100583',
      'Hutten2025_Allergy': 'https://doi.org/10.1111/all.16485',
    };
    if (doiMap[pmid]) {
      href = doiMap[pmid];
      label = pmid.replace(/_/g, ' ');
    }
  }

  if (!href) return <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-500 font-mono">{label}</span>;

  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-[11px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors font-mono"
    >
      {label}
    </a>
  );
}

export function SidePanel({ selectedDrugId }: SidePanelProps) {
  if (!selectedDrugId) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-950/20">
        <div className="text-6xl mb-6 opacity-20 grayscale">💊</div>
        <h3 className="text-lg font-semibold text-slate-300 mb-2">Drug Details</h3>
        <p className="text-sm text-slate-500 max-w-[200px]">
          Select a drug from the graph to analyze cross-reactivity and evidence.
        </p>
      </div>
    );
  }

  const { nodes } = buildGraphElements();
  const drug = nodes.find(n => n.id === selectedDrugId);
  if (!drug) return null;

  const crossReactive = getCrossReactiveDrugs(selectedDrugId);
  const safeAlts = getSafeAlternatives(selectedDrugId);
  const allPmids = [...new Set(crossReactive.flatMap(cr => cr.pmids))];

  const safeByClass: Record<string, DrugNodeData[]> = {};
  for (const alt of safeAlts) {
    if (!safeByClass[alt.drugClass]) safeByClass[alt.drugClass] = [];
    safeByClass[alt.drugClass].push(alt);
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar" style={{ background: COLORS.bg.panel }}>
      {/* 1. Header & Summary Card */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-5 h-5 rounded-full shadow-lg" style={{ background: drug.color, boxShadow: `0 0 12px ${drug.color}44` }} />
          <h2 className="text-2xl font-bold text-white tracking-tight">{drug.label}</h2>
        </div>
        
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 shadow-inner">
          <div className="grid grid-cols-2 gap-y-3 gap-x-4">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Drug Class</p>
              <p className="text-sm text-slate-200">{CLASS_LABELS[drug.drugClass]}</p>
            </div>
            {drug.r1Group && (
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">R1 Group</p>
                <p className="text-sm text-slate-200">{drug.r1Group}</p>
              </div>
            )}
            {drug.formula && (
              <div className="col-span-2">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Chemical Formula</p>
                <p className="text-sm text-slate-300 font-mono bg-black/20 px-2 py-1 rounded inline-block">{drug.formula}</p>
              </div>
            )}
          </div>
          
          {/* Spectrum tags */}
          {DRUG_SPECTRUM_TAGS[selectedDrugId] && (
            <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-white/5">
              {DRUG_SPECTRUM_TAGS[selectedDrugId].map(tag => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-tighter"
                  style={
                    tag === 'mrsa' ? { background: 'rgba(244,63,94,0.1)', color: '#fb7185', border: '1px solid rgba(244,63,94,0.2)' }
                    : tag === 'pseudomonas' ? { background: 'rgba(6,182,212,0.1)', color: '#22d3ee', border: '1px solid rgba(6,182,212,0.2)' }
                    : tag === 'anaerobe' ? { background: 'rgba(168,85,247,0.1)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.2)' }
                    : { background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }
                  }
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Key References Pinned */}
        {allPmids.length > 0 && (
          <div className="mt-4">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">📚 Key Evidence</p>
            <div className="flex flex-wrap gap-1.5">
              {allPmids.map(pmid => <EvidenceChip key={pmid} pmid={pmid} />)}
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
          <p className="text-sm text-slate-500 italic px-2">No significant cross-reactivity signals identified in database.</p>
        ) : (
          <div className="space-y-5">
            {crossReactive.map(cr => (
              <div key={cr.drugId} className="group relative">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-base text-white font-semibold tracking-tight group-hover:text-red-300 transition-colors">
                        {cr.drugName}
                      </span>
                      {cr.r1Group && <span className="text-[10px] text-slate-500 font-mono">({cr.r1Group})</span>}
                    </div>
                    {cr.clinicalNote && (
                      <div className="mt-1.5 text-xs text-orange-200/70 leading-relaxed bg-orange-500/5 p-2 rounded-lg border-l-2 border-orange-500/30">
                        {cr.clinicalNote}
                      </div>
                    )}
                    {cr.pmids.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {cr.pmids.slice(0, 2).map(pmid => <EvidenceChip key={pmid} pmid={pmid} />)}
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
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">{safeAlts.length}</span>
        </div>
        <p className="text-[10px] text-slate-500 mb-5 leading-normal bg-emerald-500/5 p-2 rounded border border-emerald-500/10">
          ⚠️ <span className="text-emerald-300/80 font-semibold text-[11px]">No known signal ≠ guaranteed safety.</span> Decisions must follow clinical judgment and guideline-based protocols.
        </p>

        {safeAlts.length === 0 ? (
          <p className="text-sm text-slate-500 italic px-2">No low-signal alternatives identified.</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(safeByClass).map(([cls, alts]) => (
              <div key={cls}>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-3 border-l-2 border-slate-700 pl-2">
                  {CLASS_LABELS[cls as DrugClass] ?? cls}
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  {alts.map(alt => (
                    <div key={alt.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 group">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full shadow-sm" style={{ background: alt.color }} />
                        <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{alt.label}</span>
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
