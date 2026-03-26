import { useEffect, useRef, useState } from 'react';
import { buildContrastGraphElements } from '../data/contrastGraphData';
import { searchContrastNodes } from '../../data/searchAliases';

interface ContrastSearchBarProps {
  onSearch: (agentId: string) => void;
  selectedAgent: string | null;
}

export function ContrastSearchBar({ onSearch, selectedAgent }: ContrastSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { nodes } = buildContrastGraphElements();
  const matches = query.length > 0 ? searchContrastNodes(nodes, query) : [];

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleDocumentClick);
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, []);

  const handleSelect = (agentId: string, label: string) => {
    onSearch(agentId);
    setQuery(label);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
        <input
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search contrast ingredient or brand..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all focus:ring-2 focus:ring-blue-500/40"
          style={{
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(51, 65, 85, 0.5)',
          }}
        />
        {selectedAgent && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg">
            selected
          </span>
        )}
      </div>

      {isOpen && matches.length > 0 && (
        <div
          className="absolute top-full mt-2 w-full rounded-xl overflow-hidden z-50"
          style={{
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
          }}
        >
          {matches.map((match, index) => (
            <button
              key={`${match.id}-${match.matchType}-${match.matchedAlias ?? index}`}
              onClick={() => handleSelect(match.id, match.label)}
              className="w-full text-left px-4 py-3 text-sm hover:bg-slate-800/60 transition-colors flex items-center gap-3"
            >
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: match.color }} />
              <span className="text-slate-200">{match.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded ml-auto ${
                  match.matchType === 'brand'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30'
                    : 'bg-slate-700/50 text-slate-400 border border-slate-600/40'
                }`}
              >
                {match.matchType === 'brand' ? '상품명' : '성분명'}
              </span>
              <span className="text-xs text-slate-500">{match.secondaryLabel}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
