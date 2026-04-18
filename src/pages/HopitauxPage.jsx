// src/pages/HopitauxPage.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import api from '../utils/api';
import StructureCard from '../components/ui/StructureCard';

const TYPES_HOPITAUX = ['HOPITAL_PUBLIC','HOPITAL_PRIVE','CLINIQUE','CABINET_MEDICAL','CABINET_SPECIALISE','CENTRE_SANTE'];
const LABELS = { '':'Tous', HOPITAL_PUBLIC:'Hôpital Public', HOPITAL_PRIVE:'Hôpital Privé', CLINIQUE:'Clinique', CABINET_MEDICAL:'Cabinet Médical', CABINET_SPECIALISE:'Cabinet Spécialisé', CENTRE_SANTE:'Centre de Santé' };

export default function HopitauxPage() {
  const [search, setSearch] = useState('');
  const [ville, setVille]   = useState('');
  const [type, setType]     = useState('');
  const [page, setPage]     = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['hopitaux', search, ville, type, page],
    queryFn: async () => {
      const p = new URLSearchParams({ page, limit:16 });
      if (type) p.set('type', type);
      if (search) p.set('search', search);
      if (ville) p.set('ville', ville);
      const { data } = await api.get(`/structures?${p}`);
      // Filtrer côté client si pas de type sélectionné
      if (!type) {
        data.data = (data.data || []).filter((s) => TYPES_HOPITAUX.includes(s.typeStructure));
      }
      return data;
    },
  });

  const enriched = (data?.data || []).map((s) => ({ ...s, niveauAbonnement: s.abonnements?.[0]?.niveau || 'BASIC' }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Hôpitaux & Structures</h1>
        <p className="text-gray-500 text-sm">Hôpitaux, cliniques, cabinets médicaux et centres de santé</p>
      </div>

      {/* Filtres type */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(LABELS).map(([val, label]) => (
          <button key={val} onClick={() => setType(val)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${type === val ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Spécialité, nom..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400" />
        </div>
        <input type="text" placeholder="Ville..." value={ville} onChange={(e) => setVille(e.target.value)}
          className="sm:w-40 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="card animate-pulse h-36 bg-gray-100" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {enriched.map((s) => <StructureCard key={s.id} structure={s} />)}
        </div>
      )}
    </div>
  );
}
