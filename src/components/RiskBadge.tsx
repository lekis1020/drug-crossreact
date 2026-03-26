import type { CrossReactivity } from '../types';
import { COLORS, EFFECTS } from '../styles/design-tokens';

interface RiskBadgeProps {
  risk: CrossReactivity;
  showIcon?: boolean;
}

const RISK_CONFIG: Record<CrossReactivity, { label: string; color: typeof COLORS.risk.high }> = {
  high: {
    label: 'High Risk',
    color: COLORS.risk.high,
  },
  disputed: {
    label: 'Disputed',
    color: COLORS.risk.disputed,
  },
  moderate: {
    label: 'Moderate',
    color: COLORS.risk.moderate,
  },
  low: {
    label: 'Low Signal',
    color: COLORS.risk.low,
  },
};

export function RiskBadge({ risk, showIcon = true }: RiskBadgeProps) {
  const config = RISK_CONFIG[risk];
  
  return (
    <span 
      className="text-[11px] px-2.5 py-1 rounded-full font-bold whitespace-nowrap flex items-center gap-1.5 transition-all"
      style={{
        background: config.color.bg,
        color: config.color.text,
        border: `1px solid ${config.color.border}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      {showIcon && <span className="text-[10px]">{config.color.icon}</span>}
      <span className="uppercase tracking-tight">{config.label}</span>
    </span>
  );
}
