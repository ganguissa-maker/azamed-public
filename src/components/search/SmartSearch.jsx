// src/components/search/SmartSearch.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Pill, TestTube2, Activity, Building2 } from 'lucide-react';
import api from '../../utils/api';

const typeIcon = {
  medicament: <Pill size={13} className="text-green-500" />,
  examen:     <TestTube2 size={13} className="text-blue-500" />,
  service:    <Activity size={13} className="text-purple-500" />,
  structure:  <Building2 size={13} className="text-orange-500" />,
};
const typeLabel = { medicament:'Médicament', examen:'Examen', service:'Service', structure:'Structure' };

export default function SmartSearch({ large = false, defaultValue = '' }) {
  const [query, setQuery]             = useState(defaultValue);
  const [suggestions, setSuggestions] = useState([]);
  const [show, setShow]               = useState(false);
  const debounce                      = useRef(null);
  const navigate                      = useNavigate();

  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); return; }
    clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      try {
        const { data } = await api.get(`/search/suggestions?q=${encodeURIComponent(query)}`);
        setSuggestions(data || []);
      } catch { setSuggestions([]); }
    }, 280);
    return () => clearTimeout(debounce.current);
  }, [query]);

  const go = (q) => {
    const term = q || query;
    if (!term.trim()) return;
    setShow(false);
    navigate(`/recherche?q=${encodeURIComponent(term.trim())}`);
  };

  return (
    <div className="relative w-full">
      <div className={`flex items-center bg-white border-2 ${large ? 'border-primary-200 rounded-2xl shadow-xl' : 'border-gray-200 rounded-xl'} overflow-hidden focus-within:border-primary-400 transition-colors`}>
        <Search size={large ? 20 : 16} className="ml-4 text-gray-400 shrink-0" />
        <input
          type="text" value={query}
          onChange={(e) => { setQuery(e.target.value); setShow(true); }}
          onKeyDown={(e) => { if (e.key === 'Enter') go(); if (e.key === 'Escape') setShow(false); }}
          onFocus={() => query.length >= 2 && setShow(true)}
          placeholder="Médicament, examen, spécialité, pharmacie..."
          className={`flex-1 px-3 outline-none text-gray-800 placeholder-gray-400 bg-transparent ${large ? 'py-4 text-base' : 'py-2.5 text-sm'}`}
        />
        {query && (
          <button onClick={() => { setQuery(''); setSuggestions([]); }}
            className="mr-2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <X size={15} />
          </button>
        )}
        <button onClick={() => go()}
          className={`bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors shrink-0 ${large ? 'px-6 py-4 text-base' : 'px-4 py-2.5 text-sm'}`}>
          Rechercher
        </button>
      </div>

      {show && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => { setQuery(s.label); go(s.label); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-50 transition-colors text-left">
              <span className="shrink-0">{typeIcon[s.type]}</span>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-800 truncate block">{s.label}</span>
                {s.detail && <span className="text-xs text-gray-400">{s.detail}</span>}
              </div>
              <span className="text-xs text-gray-400 shrink-0 bg-gray-50 px-2 py-0.5 rounded-full">
                {typeLabel[s.type]}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
