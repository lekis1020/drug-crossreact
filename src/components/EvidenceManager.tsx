import { useState } from 'react';
import { buildGraphElements } from '../data/graphData';

interface EvidenceEntry {
  drugA: string;
  drugB: string;
  crossReactivity: string;
  pmid: string;
  clinicalNote: string;
}

interface EvidenceManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EvidenceManager({ isOpen, onClose }: EvidenceManagerProps) {
  const [entries, setEntries] = useState<EvidenceEntry[]>([]);
  const [form, setForm] = useState<EvidenceEntry>({
    drugA: '', drugB: '', crossReactivity: 'moderate', pmid: '', clinicalNote: '',
  });
  const [exported, setExported] = useState('');

  if (!isOpen) return null;

  const { nodes } = buildGraphElements();
  const drugNames = nodes.map(n => n.id).sort();

  const addEntry = () => {
    if (!form.drugA || !form.drugB) return;
    setEntries([...entries, { ...form }]);
    setForm({ drugA: '', drugB: '', crossReactivity: 'moderate', pmid: '', clinicalNote: '' });
  };

  const exportJSON = () => {
    const output = entries.map(e => ({
      drug_a: e.drugA,
      drug_b: e.drugB,
      ige_cross_reactivity: e.crossReactivity,
      rate_percent: null,
      structural_basis: null,
      evidence_pmids: e.pmid ? [e.pmid] : [],
      clinical_note: e.clinicalNote || null,
    }));
    setExported(JSON.stringify(output, null, 2));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-xl shadow-2xl"
        style={{ background: '#1e293b', border: '1px solid #334155' }}>
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <h2 className="text-lg font-bold text-white">📚 Evidence Manager</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">✕</button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-slate-400">
            Add new cross-reactivity evidence. Export as JSON to merge into the database.
          </p>

          {/* Form */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Drug A</label>
              <select value={form.drugA} onChange={e => setForm({...form, drugA: e.target.value})}
                className="w-full rounded-lg px-3 py-2 text-sm bg-slate-800 text-slate-200 border border-slate-600">
                <option value="">Select...</option>
                {drugNames.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Drug B</label>
              <select value={form.drugB} onChange={e => setForm({...form, drugB: e.target.value})}
                className="w-full rounded-lg px-3 py-2 text-sm bg-slate-800 text-slate-200 border border-slate-600">
                <option value="">Select...</option>
                {drugNames.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Cross-reactivity</label>
              <select value={form.crossReactivity} onChange={e => setForm({...form, crossReactivity: e.target.value})}
                className="w-full rounded-lg px-3 py-2 text-sm bg-slate-800 text-slate-200 border border-slate-600">
                <option value="high">High</option>
                <option value="moderate">Moderate</option>
                <option value="low">Low</option>
                <option value="disputed">Disputed</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">PMID / DOI</label>
              <input value={form.pmid} onChange={e => setForm({...form, pmid: e.target.value})}
                placeholder="e.g., 34757066 or 10.1111/all.16485"
                className="w-full rounded-lg px-3 py-2 text-sm bg-slate-800 text-slate-200 border border-slate-600" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-slate-500 block mb-1">Clinical Note</label>
              <textarea value={form.clinicalNote} onChange={e => setForm({...form, clinicalNote: e.target.value})}
                rows={2} placeholder="Optional clinical context..."
                className="w-full rounded-lg px-3 py-2 text-sm bg-slate-800 text-slate-200 border border-slate-600 resize-none" />
            </div>
          </div>

          <button onClick={addEntry}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors">
            + Add Evidence
          </button>

          {/* Pending entries */}
          {entries.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Pending ({entries.length})</p>
              {entries.map((e, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-300 bg-slate-800 rounded-lg px-3 py-2">
                  <span>{e.drugA}</span>
                  <span className="text-slate-600">↔</span>
                  <span>{e.drugB}</span>
                  <span className="px-1.5 py-0.5 rounded text-xs" style={{
                    background: e.crossReactivity === 'high' ? 'rgba(239,68,68,0.2)' : 'rgba(249,115,22,0.2)',
                    color: e.crossReactivity === 'high' ? '#fca5a5' : '#fdba74',
                  }}>{e.crossReactivity}</span>
                  {e.pmid && <span className="text-blue-400 text-xs">{e.pmid}</span>}
                  <button onClick={() => setEntries(entries.filter((_, j) => j !== i))}
                    className="ml-auto text-slate-500 hover:text-red-400">✕</button>
                </div>
              ))}
              <button onClick={exportJSON}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-green-700 hover:bg-green-600 text-white transition-colors">
                Export JSON
              </button>
            </div>
          )}

          {/* Export output */}
          {exported && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Exported JSON</p>
              <pre className="text-xs text-green-400 bg-slate-900 rounded-lg p-3 overflow-x-auto max-h-48">
                {exported}
              </pre>
              <p className="text-xs text-slate-500 mt-2">
                Copy this JSON and merge into <code className="text-slate-400">crossreact_prediction_db.json</code> → <code className="text-slate-400">literature_confirmed_pairs</code>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
