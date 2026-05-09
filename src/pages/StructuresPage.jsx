// src/pages/StructuresPage.jsx — Tous les établissements de santé vérifiés
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, MapPin, Phone, MessageCircle, Clock, CheckCircle, ShieldCheck, Filter } from 'lucide-react';
import api from '../utils/api';

// ─── Couleurs et labels par type ─────────────────────────────
const TYPE_CONFIG = {
  PHARMACIE:         { label:'Pharmacie',              couleur:'#2d6a4f', bg:'#d8f3dc', icone:'💊' },
  LABORATOIRE:       { label:'Laboratoire d\'analyses', couleur:'#7b2d42', bg:'#fce4ec', icone:'🔬' },
  CENTRE_IMAGERIE:   { label:'Centre d\'imagerie',      couleur:'#1a237e', bg:'#e8eaf6', icone:'🩻' },
  LABO_ET_IMAGERIE:  { label:'Labo & Imagerie',         couleur:'#4a148c', bg:'#f3e5f5', icone:'🏥' },
  HOPITAL_PUBLIC:    { label:'Hôpital Public',          couleur:'#1565c0', bg:'#e3f2fd', icone:'🏨' },
  POLYCLINIQUE:      { label:'Polyclinique',            couleur:'#00695c', bg:'#e0f2f1', icone:'🏩' },
  CLINIQUE:          { label:'Clinique',                couleur:'#6a1b9a', bg:'#f3e5f5', icone:'🏥' },
  CABINET_MEDICAL:   { label:'Cabinet Médical',         couleur:'#e65100', bg:'#fff3e0', icone:'👨‍⚕️' },
  CABINET_SPECIALISE:{ label:'Cabinet Spécialisé',      couleur:'#37474f', bg:'#eceff1', icone:'🩺' },
  CENTRE_SANTE:      { label:'Centre de Santé',         couleur:'#558b2f', bg:'#f1f8e9', icone:'🏪' },
};

const FILTRES = [
  { value:'',                  label:'Tous' },
  { value:'PHARMACIE',         label:'💊 Pharmacies' },
  { value:'LABORATOIRE',       label:'🔬 Laboratoires' },
  { value:'CENTRE_IMAGERIE',   label:'🩻 Imagerie' },
  { value:'LABO_ET_IMAGERIE',  label:'🏥 Labo+Imagerie' },
  { value:'HOPITAL_PUBLIC',    label:'🏨 Hôpitaux' },
  { value:'POLYCLINIQUE',      label:'🏩 Polycliniques' },
  { value:'CLINIQUE',          label:'🏥 Cliniques' },
  { value:'CABINET_MEDICAL',   label:'👨‍⚕️ Cabinets méd.' },
  { value:'CABINET_SPECIALISE',label:'🩺 Cabinets spéc.' },
  { value:'CENTRE_SANTE',      label:'🏪 Centres santé' },
];

function StructureCard({ structure }) {
  const cfg = TYPE_CONFIG[structure.typeStructure] || { label: structure.typeStructure, couleur:'#0284c7', bg:'#e0f2fe', icone:'🏥' };

  return (
    <Link to={`/structures/${structure.id}`}
      className="card hover:shadow-md transition-all hover:-translate-y-0.5 block group">

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ backgroundColor: cfg.bg }}>
          {cfg.icone}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-sm text-gray-900 truncate group-hover:text-primary-600 transition-colors">
              {structure.nomCommercial}
            </h3>
            <CheckCircle size={12} className="text-primary-500 shrink-0"/>
            {structure.estDeGarde && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: '#d8f3dc', color: '#2d6a4f' }}>
                🟢 De garde
              </span>
            )}
            {structure.medecinDeGarde && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                👨‍⚕️ Médecin dispo
              </span>
            )}
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block"
            style={{ backgroundColor: cfg.bg, color: cfg.couleur }}>
            {cfg.label}
          </span>
        </div>
      </div>

      {/* Infos */}
      {(structure.ville || structure.quartier) && (
        <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
          <MapPin size={11}/> {structure.quartier ? `${structure.quartier}, ` : ''}{structure.ville}
        </p>
      )}
      {structure.heureOuverture && (
        <p className="text-xs text-gray-400 flex items-center gap-1 mb-2">
          <Clock size={11}/> {structure.heureOuverture} – {structure.heureFermeture}
        </p>
      )}
      {structure.description && (
        <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">
          {structure.description.split('—')[0].trim()}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-gray-50">
        {structure.telephone && (
          <a href={`tel:${structure.telephone}`} onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors"
            style={{ backgroundColor: cfg.bg, color: cfg.couleur }}>
            <Phone size={11}/> Appeler
          </a>
        )}
        {structure.whatsapp && (
          <a href={`https://wa.me/${structure.whatsapp.replace(/\D/g,'')}`}
            target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors">
            <MessageCircle size={11}/> WhatsApp
          </a>
        )}
        <span className="ml-auto text-xs font-medium self-center transition-colors"
          style={{ color: cfg.couleur }}>
          Voir la fiche →
        </span>
      </div>
    </Link>
  );
}

export default function StructuresPage() {
  const [search, setSearch]     = useState('');
  const [type, setType]         = useState('');
  const [ville, setVille]       = useState('');
  const [page, setPage]         = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['all-structures', search, type, ville, page],
    queryFn: async () => {
      const p = new URLSearchParams({ page, limit: 16 });
      if (search) p.set('search', search);
      if (type)   p.set('type', type);
      if (ville)  p.set('ville', ville);
      const { data } = await api.get(`/structures?${p}`);
      return data;
    },
    keepPreviousData: true,
  });

  const structures = data?.data || [];
  const total      = data?.pagination?.total || 0;
  const pages      = data?.pagination?.pages || 1;

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };
  const handleType   = (v) => { setType(v); setPage(1); setShowFilters(false); };
  const handleVille  = (e) => { setVille(e.target.value); setPage(1); };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Établissements de santé
        </h1>
        <p className="text-gray-500 text-sm">
          {total} établissement{total > 1 ? 's' : ''} vérifié{total > 1 ? 's' : ''} sur AZAMED
        </p>
      </div>

      {/* Barre de recherche + filtres */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input type="text" placeholder="Nom, service, quartier..."
            value={search} onChange={handleSearch}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"/>
        </div>
        <input type="text" placeholder="Ville..." value={ville} onChange={handleVille}
          className="sm:w-36 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"/>
        <button onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          <Filter size={15}/> Filtrer par type
          {type && <span className="w-2 h-2 rounded-full bg-primary-500"/>}
        </button>
      </div>

      {/* Filtres par type */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 mb-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
          {FILTRES.map((f) => (
            <button key={f.value} onClick={() => handleType(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                type === f.value
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Filtre actif */}
      {type && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-gray-500">Filtre actif :</span>
          <span className="flex items-center gap-1.5 bg-primary-50 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full">
            {FILTRES.find((f) => f.value === type)?.label}
            <button onClick={() => handleType('')} className="hover:text-primary-900">✕</button>
          </span>
        </div>
      )}

      {/* Grille */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card animate-pulse h-40 bg-gray-100"/>
          ))}
        </div>
      ) : structures.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">🏥</p>
          <p className="font-semibold text-gray-600 text-lg mb-1">Aucun établissement trouvé</p>
          <p className="text-gray-400 text-sm">Modifiez vos critères de recherche</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {structures.map((s) => <StructureCard key={s.id} structure={s}/>)}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-8">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors">
            ← Précédent
          </button>
          <span className="text-sm text-gray-500">Page {page} / {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors">
            Suivant →
          </button>
        </div>
      )}
    </div>
  );
}
