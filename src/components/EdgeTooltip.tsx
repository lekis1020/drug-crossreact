import type { CrossReactivity, EdgeTooltipState } from '../types';

interface EdgeTooltipProps {
  edge: EdgeTooltipState;
}

const RISK_META: Record<CrossReactivity, { label: string; color: string; border: string; text: string }> = {
  high: {
    label: 'High risk',
    color: 'rgba(239, 68, 68, 0.2)',
    border: 'rgba(239, 68, 68, 0.4)',
    text: '#fca5a5',
  },
  disputed: {
    label: 'Disputed',
    color: 'rgba(234, 179, 8, 0.2)',
    border: 'rgba(234, 179, 8, 0.4)',
    text: '#fde047',
  },
  moderate: {
    label: 'Moderate',
    color: 'rgba(249, 115, 22, 0.2)',
    border: 'rgba(249, 115, 22, 0.4)',
    text: '#fdba74',
  },
  low: {
    label: 'Low signal',
    color: 'rgba(100, 116, 139, 0.2)',
    border: 'rgba(100, 116, 139, 0.4)',
    text: '#cbd5e1',
  },
};

function formatEvidenceId(pmid: string): string {
  if (/^\d+$/.test(pmid)) return `PMID:${pmid}`;
  if (pmid.startsWith('10.')) return `DOI:${pmid}`;
  return pmid.replace(/_/g, ' ');
}

function getTooltipPosition(x: number, y: number): { left: number; top: number } {
  if (typeof window === 'undefined') return { left: x + 16, top: y + 16 };

  const offset = 16;
  const width = 360;
  const height = 250;
  const margin = 12;

  const left = Math.max(margin, Math.min(x + offset, window.innerWidth - width - margin));
  const top = Math.max(margin, Math.min(y + offset, window.innerHeight - height - margin));
  return { left, top };
}

export function EdgeTooltip({ edge }: EdgeTooltipProps) {
  const risk = RISK_META[edge.crossReactivity];
  const { left, top } = getTooltipPosition(edge.x, edge.y);

  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{
        left,
        top,
        width: 360,
      }}
    >
      <div
        className="rounded-xl p-3.5"
        style={{
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(51, 65, 85, 0.5)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-semibold text-white leading-snug">
            {edge.sourceLabel}
            <span className="text-slate-500 px-1">↔</span>
            {edge.targetLabel}
          </p>
          <span
            className="text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wide whitespace-nowrap"
            style={{ background: risk.color, border: `1px solid ${risk.border}`, color: risk.text }}
          >
            {risk.label}
          </span>
        </div>

        {edge.clinicalNote && (
          <p className="mt-2 text-xs text-slate-200 leading-relaxed bg-orange-500/10 border border-orange-500/20 rounded-lg px-2.5 py-2">
            {edge.clinicalNote}
          </p>
        )}

        <div className="mt-3">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1.5">
            Evidence {edge.pmids.length > 0 ? `(${edge.pmids.length})` : ''}
          </p>
          {edge.pmids.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {edge.pmids.slice(0, 4).map((pmid) => (
                <span
                  key={pmid}
                  className="text-[10px] px-2 py-0.5 rounded border border-slate-700 bg-slate-900/70 text-slate-300 font-mono"
                >
                  {formatEvidenceId(pmid)}
                </span>
              ))}
              {edge.pmids.length > 4 && (
                <span className="text-[10px] px-2 py-0.5 rounded border border-slate-700 bg-slate-900/70 text-slate-400">
                  +{edge.pmids.length - 4} more
                </span>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No linked PMID/DOI metadata.</p>
          )}
        </div>
      </div>
    </div>
  );
}
