// src/pages/RecherchePage.jsx — Affiche médicament/examen/service AVEC PRIX
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, X, MapPin, ChevronRight, TrendingDown, Phone } from 'lucide-react';
import api from '../utils/api';

const TYPE_BADGE = {
  medicament: { emoji:'💊', label:'Médicament', color:'#2d6a4f' },
  examen:     { emoji:'🔬', label:'Examen',     color:'#7b2d42' },
  service:    { emoji:'🏥', label:'Service',     color:'#1565c0' },
};

const TYPE_COLORS = {
  PHARMACIE:'#2d6a4f', LABORATOIRE:'#7b2d42', CENTRE_IMAGERIE:'#1a237e',
  HOPITAL_PUBLIC:'#1565c0', POLYCLINIQUE:'#00695c', CLINIQUE:'#6a1b9a',
  CABINET_MEDICAL:'#e65100', CABINET_SPECIALISE:'#37474f', CENTRE_SANTE:'#558b2f',
};
const TYPE_LABELS = {
  PHARMACIE:'Pharmacie', LABORATOIRE:'Laboratoire', CENTRE_IMAGERIE:"Centre d'imagerie",
  HOPITAL_PUBLIC:'Hôpital public', POLYCLINIQUE:'Polyclinique', CLINIQUE:'Clinique',
  CABINET_MEDICAL:'Cabinet médical', CABINET_SPECIALISE:'Cabinet spécialisé', CENTRE_SANTE:'Centre de santé',
};

const SUGGESTIONS = [
  '💊 Paracétamol', '💊 Amoxicilline', '💊 Coartem', '💊 Metformine',
  '🔬 Numération Formule Sanguine', '🔬 Test VIH', '🔬 Glycémie',
  '🔬 Échographie abdominale', '🏥 Urgences', '🏥 Cardiologie',
  '🏥 Pédiatrie', '🏥 Gynécologie', '📍 Yaoundé', '📍 Douala',
];

// ── Carte "produit" : médicament/examen/service avec prix par établissement ──
function ItemResult({ item }) {
  const badge = TYPE_BADGE[item.type] || TYPE_BADGE.medicament;
  const [expanded, setExpanded] = useState(false);
  const withPrix = item.prix.filter((p) => p.prix > 0);
  const sansPrix = item.prix.filter((p) => !p.prix || p.prix === 0);
  const moinsCher = withPrix[0];
  const visiblePrix = expanded ? item.prix : item.prix.slice(0, 3);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{badge.emoji}</span>
            <p className="font-bold text-sm text-gray-900">{item.nom}</p>
          </div>
          {item.sousTitre && <p className="text-xs text-gray-400">{item.sousTitre}</p>}
          {item.categorie && (
            <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ backgroundColor: badge.color+'15', color: badge.color }}>
              {item.categorie}
            </span>
          )}
        </div>
        {moinsCher && (
          <div className="text-right shrink-0">
            <p className="text-xs text-gray-400 flex items-center gap-1 justify-end"><TrendingDown size={10}/>dès</p>
            <p className="font-extrabold text-base" style={{ color: badge.color }}>
              {Number(moinsCher.prix).toLocaleString()} F
            </p>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 mb-2">
        {item.prix.length} établissement{item.prix.length>1?'s':''} le propose{item.prix.length>1?'nt':''}
      </p>

      {/* Liste établissements avec prix */}
      <div className="space-y-1.5">
        {visiblePrix.map((p, i) => (
          <Link key={i} to={`/structures/${p.structureId}`}
            className="flex items-center justify-between gap-2 bg-gray-50 hover:bg-gray-100 rounded-xl px-3 py-2 transition-colors">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-800 truncate">{p.structureNom}</p>
              {p.ville && (
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <MapPin size={9}/>{p.quartier ? `${p.quartier}, ` : ''}{p.ville}
                </p>
              )}
            </div>
            <div className="text-right shrink-0">
              {p.prix > 0
                ? <p className="text-sm font-bold" style={{ color: badge.color }}>{Number(p.prix).toLocaleString()} F</p>
                : <p className="text-xs text-gray-400 italic">Prix non précisé</p>}
              {p.enStock === false && <p className="text-xs text-red-400">Rupture</p>}
              {p.delaiMax && <p className="text-xs text-gray-400">~{p.delaiMax}h</p>}
            </div>
          </Link>
        ))}
      </div>

      {item.prix.length > 3 && (
        <button onClick={() => setExpanded(!expanded)}
          className="w-full text-center text-xs font-semibold text-primary-600 hover:underline mt-2 py-1">
          {expanded ? 'Voir moins' : `Voir les ${item.prix.length - 3} autres établissements`}
        </button>
      )}
    </div>
  );
}

function StructureResult({ s }) {
  const couleur = TYPE_COLORS[s.typeStructure] || '#0284c7';
  return (
    <Link to={`/structures/${s.id}`}
      className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-gray-100 hover:border-primary-200 hover:shadow-sm transition-all group">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0"
        style={{ backgroundColor: couleur }}>
        {s.nomCommercial?.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-900 truncate">{s.nomCommercial}</p>
        <p className="text-xs font-medium" style={{ color: couleur }}>{TYPE_LABELS[s.typeStructure]}</p>
        {s.ville && <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><MapPin size={10}/> {s.ville}</p>}
      </div>
      <ChevronRight size={15} className="text-gray-300 group-hover:text-primary-500 transition-colors shrink-0"/>
    </Link>
  );
}

export default function RecherchePage() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const inputRef       = useRef(null);
  const [query, setQuery]     = useState(searchParams.get('q') || '');
  const [submitted, setSubmit] = useState(searchParams.get('q') || '');

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQuery(q); setSubmit(q);
  }, [searchParams]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['search-public', submitted],
    queryFn: async () => {
      if (!submitted || submitted.trim().length < 2) return { items: [], structures: [] };
      const { data } = await api.get(`/search?q=${encodeURIComponent(submitted)}`);
      return data;
    },
    enabled: submitted.length >= 2,
  });

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length >= 3) setSubmit(val);
    else if (val.length === 0) setSubmit('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmit(query);
    navigate(`/recherche?q=${encodeURIComponent(query)}`);
  };

  const pickSuggestion = (s) => {
    const clean = s.replace(/^[^\w\s]+\s*/u, '').trim();
    setQuery(clean); setSubmit(clean);
    navigate(`/recherche?q=${encodeURIComponent(clean)}`);
  };

  const items      = data?.items      || [];
  const structures = data?.structures || [];
  const isSearching = isLoading || isFetching;
  const showEmpty   = submitted.length >= 2 && !isSearching && items.length===0 && structures.length===0;
  const showSuggests= query.length === 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
        <div className="flex-1 flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200 focus-within:border-primary-400 transition-colors">
          <Search size={17} className="text-gray-400 shrink-0"/>
          <input ref={inputRef} type="text" value={query} onChange={handleChange}
            placeholder="Médicament, examen, service, hôpital..."
            className="flex-1 text-sm text-gray-900 outline-none bg-transparent"/>
          {query.length > 0 && (
            <button type="button" onClick={() => { setQuery(''); setSubmit(''); navigate('/recherche'); }}>
              <X size={16} className="text-gray-400 hover:text-gray-600"/>
            </button>
          )}
        </div>
        <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white px-5 rounded-2xl font-semibold text-sm transition-colors shrink-0">
          Rechercher
        </button>
      </form>

      {showSuggests && (
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Recherches fréquentes</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => pickSuggestion(s)}
                className="px-3 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-primary-400 hover:text-primary-600 transition-colors">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {isSearching && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"/>
          <p className="text-sm text-gray-500">Recherche en cours...</p>
        </div>
      )}

      {!isSearching && (items.length > 0 || structures.length > 0) && (
        <div className="space-y-6">
          {items.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 font-semibold mb-3">
                {items.length} résultat{items.length>1?'s':''} avec prix pour "{submitted}"
              </p>
              <div className="space-y-3">
                {items.map((item) => <ItemResult key={`${item.type}-${item.id}`} item={item}/>)}
              </div>
            </div>
          )}

          {structures.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 font-semibold mb-3">Établissements correspondants</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {structures.map((s) => <StructureResult key={s.id} s={s}/>)}
              </div>
            </div>
          )}
        </div>
      )}

      {showEmpty && (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">😕</p>
          <p className="font-bold text-gray-700 text-lg">Aucun résultat</p>
          <p className="text-gray-400 text-sm mt-2">pour "{submitted}"</p>
          <p className="text-gray-400 text-sm mt-1">Essayez un autre mot-clé ou une ville</p>
        </div>
      )}

      {query.length > 0 && query.length < 2 && !isSearching && (
        <p className="text-center text-gray-400 text-sm py-8">Tapez au moins 2 caractères...</p>
      )}
    </div>
  );
}
