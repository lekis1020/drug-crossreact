import { useState, useRef, useEffect } from 'react';
import { buildGraphElements } from '../data/graphData';
import { CLASS_LABELS } from '../data/colors';
import { searchAntibioticNodes } from '../data/searchAliases';
import { COLORS, EFFECTS } from '../styles/design-tokens';

interface SearchBarProps {
  onSearch: (drugId: string) => void;
  selectedDrug: string | null;
}

export function SearchBar({ onSearch, selectedDrug }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { nodes } = buildGraphElements();
  const matches =
    query.length > 0
      ? searchAntibioticNodes(
          nodes,
          query,
          Object.fromEntries(nodes.map((node) => [node.id, CLASS_LABELS[node.drugClass]])),
        )
      : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (id: string, label: string) => {
    onSearch(id);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative group w-full">
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm group-focus-within:text-blue-400 transition-colors">🔍</span>
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search drug or brand name..."
          className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all shadow-inner border border-white/5 focus:border-blue-500/50"
          style={{
            background: 'rgba(30, 41, 59, 0.4)',
            backdropFilter: EFFECTS.glass.backdrop,
          }}
        />
        {selectedDrug && query === '' && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase font-black tracking-tighter text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
            Selected
          </span>
        )}
      </div>

      {isOpen && matches.length > 0 && (
        <div
          className="absolute top-full mt-2 w-full rounded-xl overflow-hidden z-50 border border-white/10 shadow-2xl"
          style={{
            background: COLORS.bg.panel,
            backdropFilter: EFFECTS.glass.backdrop,
          }}
        >
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {matches.map((match, index) => (
              <button
                key={`${match.id}-${match.matchType}-${match.matchedAlias ?? index}`}
                onClick={() => handleSelect(match.id, match.label)}
                className="w-full text-left px-4 py-3 text-sm hover:bg-white/10 transition-colors flex items-center gap-3 group/item border-b border-white/[0.03] last:border-b-0"
              >
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm" style={{ background: match.color }} />
                <div className="flex flex-col min-w-0">
                  <span className="text-slate-100 font-semibold truncate group-hover/item:text-white transition-colors">{match.label}</span>
                  <span className="text-[10px] text-slate-500 font-medium truncate">{match.secondaryLabel}</span>
                </div>
                
                <div className="ml-auto flex items-center gap-2">
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-tighter ${
                      match.matchType === 'brand'
                        ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                        : 'bg-slate-700/30 text-slate-400 border border-slate-700/40'
                    }`}
                  >
                    {match.matchType === 'brand' ? 'Brand' : 'Ingredient'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
