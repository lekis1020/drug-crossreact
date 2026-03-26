import type { OncologyNodeData } from '../types';

interface OncologyTooltipProps {
  agent: OncologyNodeData;
  x: number;
  y: number;
}

export function OncologyTooltip({ agent, x, y }: OncologyTooltipProps) {
  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{
        left: x + 16,
        top: y - 10,
        maxWidth: 320,
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
        <div className="flex items-center gap-2 mb-2">
          <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: agent.color }} />
          <span className="font-bold text-white text-sm">{agent.label}</span>
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between gap-2">
            <span className="text-slate-500">Group</span>
            <span className="text-slate-300 text-right">{agent.groupName}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-slate-500">Class</span>
            <span className="text-slate-300">{agent.drugClass}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-slate-500">Formulation</span>
            <span className="text-slate-300">{agent.formulation}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-slate-500">Mechanism</span>
            <span className="text-slate-300">{agent.mechanism}</span>
          </div>
        </div>
        <p className="text-xs text-slate-600 mt-2">Click to select</p>
      </div>
    </div>
  );
}
