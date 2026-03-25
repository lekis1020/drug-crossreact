import type { CrossReactivity } from '../types';

interface RiskBadgeProps {
  risk: CrossReactivity;
}

const RISK_STYLES: Record<CrossReactivity, { label: string; className: string }> = {
  high: {
    label: '🔴 High',
    className: 'bg-red-500/15 text-red-200 border border-red-400/40',
  },
  disputed: {
    label: '⚠️ Disputed',
    className: 'bg-yellow-500/15 text-yellow-200 border border-yellow-400/40',
  },
  moderate: {
    label: '🟠 Moderate',
    className: 'bg-orange-500/15 text-orange-200 border border-orange-400/40',
  },
  low: {
    label: '⚪ Low',
    className: 'bg-slate-500/20 text-slate-200 border border-slate-400/35',
  },
};

export function RiskBadge({ risk }: RiskBadgeProps) {
  const style = RISK_STYLES[risk];
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold whitespace-nowrap ${style.className}`}>
      {style.label}
    </span>
  );
}
