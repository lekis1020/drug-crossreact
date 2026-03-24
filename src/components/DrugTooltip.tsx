import type { DrugNodeData } from '../types';
import { CLASS_LABELS } from '../data/colors';
import { DRUG_SUBGROUP_MAP } from '../data/graphData';

interface DrugTooltipProps {
  drug: DrugNodeData;
  x: number;
  y: number;
}

export function DrugTooltip({ drug, x, y }: DrugTooltipProps) {
  const subgroup = DRUG_SUBGROUP_MAP[drug.id] ?? '';

  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{
        left: x + 16,
        top: y - 10,
        maxWidth: 280,
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
          <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: drug.color }} />
          <span className="font-bold text-white text-sm">{drug.label}</span>
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Class</span>
            <span className="text-slate-300">{CLASS_LABELS[drug.drugClass]}</span>
          </div>
          {subgroup && (
            <div className="flex justify-between">
              <span className="text-slate-500">Subgroup</span>
              <span className="text-slate-300">{subgroup}</span>
            </div>
          )}
          {drug.r1Group && (
            <div className="flex justify-between">
              <span className="text-slate-500">R1 Group</span>
              <span className="text-slate-300">{drug.r1Group}</span>
            </div>
          )}
          {drug.formula && (
            <div className="flex justify-between">
              <span className="text-slate-500">Formula</span>
              <span className="text-slate-300 font-mono">{drug.formula}</span>
            </div>
          )}
        </div>
        <p className="text-xs text-slate-600 mt-2">Click to select</p>
      </div>
    </div>
  );
}
