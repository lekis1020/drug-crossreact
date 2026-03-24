import type { DrugNodeData } from '../types';
import { CLASS_LABELS } from '../data/colors';

interface DrugTooltipProps {
  drug: DrugNodeData;
  x: number;
  y: number;
}

export function DrugTooltip({ drug, x, y }: DrugTooltipProps) {
  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{ left: x + 14, top: y - 10 }}
    >
      <div
        className="rounded-lg p-3 shadow-xl text-xs max-w-xs"
        style={{ background: '#0f172a', border: '1px solid #334155' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ background: drug.color }}
          />
          <span className="font-semibold text-white text-sm">{drug.label}</span>
        </div>
        <div className="space-y-0.5 text-slate-400">
          <div>
            Class: <span className="text-slate-300">{CLASS_LABELS[drug.drugClass]}</span>
          </div>
          {drug.r1Group && (
            <div>
              R1 Group: <span className="text-slate-300">{drug.r1Group}</span>
            </div>
          )}
          {drug.r1Name && (
            <div>
              R1: <span className="text-slate-300">{drug.r1Name}</span>
            </div>
          )}
          {drug.formula && (
            <div>
              Formula: <span className="text-slate-300 font-mono">{drug.formula}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
