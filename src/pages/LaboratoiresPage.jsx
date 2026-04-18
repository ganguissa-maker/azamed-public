// src/pages/LaboratoiresPage.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import api from '../utils/api';
import StructureCard from '../components/ui/StructureCard';

export default function LaboratoiresPage() {
  const [search, setSearch] = useState('');
  const [ville, setVille]   = useState('');
  const [page, setPage]     = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['labos', search, ville, page],
    queryFn: async () => {
      const p = new URLSearchParams({ type:'LABORATOIRE', page, limit:16 });
      if (search) p.set('search', search);
      if (ville) p.set('ville', ville);
      const { data } = await api.get(`/structures?${p}`);
      return data;
    },
  });

  const { data: exResults } = useQuery({
    queryKey: ['examen-search', search],
    queryFn: async () => { const { data } = await api.get(`/laboratoires/search?examen=${encodeURIComponent(search)}&limit=5`); return data; },
    enabled: search.length >= 2,
  });

  const enriched = (data?.data || []).map((s) => ({ ...s, niveauAbonnement: s.abonnements?.[0]?.niveau || 'BASIC' }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Laboratoires d'analyses</h1>
        <p className="text-gray-500 text-sm">Comparez les prix et délais des examens médicaux</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Nom d'examen, catégorie..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400" />
        </div>
        <input type="text" placeholder="Ville..." value={ville} onChange={(e) => setVille(e.target.value)}
          className="sm:w-40 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400" />
      </div>

      {search.length >= 2 && exResults?.data?.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">🔬 Examens disponibles pour « {search} »</h2>
          <div className="space-y-2">
            {exResults.data.map((r) => (
              <div key={r.id} className="card flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{r.examen.nom}</p>
                  <p className="text-xs text-gray-500">{r.examen.categorie} · {r.labo?.nomCommercial}</p>
                </div>
                <div className="text-right shrink-0">
                  {r.prix ? <p className="font-bold text-primary-600 text-sm">{r.prix.toLocaleString()} FCFA</p> : <p className="text-xs text-gray-400">Prix NC</p>}
                  {r.delaiMax && <p className="text-xs text-gray-400">Résultat en {r.delaiMax}h max</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
