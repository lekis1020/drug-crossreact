import { useState, useRef, useEffect } from 'react';
import { buildGraphElements } from '../data/graphData';
import type { DrugNodeData } from '../types';

interface SearchBarProps {
  onSearch: (drugId: string) => void;
  selectedDrug: string | null;
}

export function SearchBar({ onSearch, selectedDrug }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<DrugNodeData[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { nodes } = buildGraphElements();

  useEffect(() => {
    if (selectedDrug) {
      const node = nodes.find(n => n.id === selectedDrug);
      if (node) setQuery(node.label);
    } else {
      setQuery('');
    }
  }, [selectedDrug]);

  const handleInput = (value: string) => {
    setQuery(value);
    if (!value.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }
    const q = value.toLowerCase();
    const matches = nodes.filter(n => n.label.toLowerCase().includes(q)).slice(0, 8);
    setSuggestions(matches);
    setIsOpen(matches.length > 0);
  };

  const handleSelect = (node: DrugNodeData) => {
    setQuery(node.label);
    setIsOpen(false);
    onSearch(node.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => handleInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (query && suggestions.length) setIsOpen(true); }}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          placeholder="Search drug..."
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg focus:outline-none"
          style={{
            background: '#1e293b',
            border: '1px solid #334155',
            color: '#e2e8f0',
          }}
        />
      </div>
      {isOpen && (
        <div
          className="absolute top-full mt-1 w-full rounded-lg shadow-xl z-50 overflow-hidden"
          style={{ background: '#1e293b', border: '1px solid #334155' }}
        >
          {suggestions.map(node => (
            <button
              key={node.id}
              onMouseDown={() => handleSelect(node)}
              className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-slate-700"
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: node.color }}
              />
              <span className="text-slate-200">{node.label}</span>
              <span className="text-slate-500 text-xs ml-auto capitalize">{node.drugClass}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
