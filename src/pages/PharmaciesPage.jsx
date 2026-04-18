// src/pages/PharmaciesPage.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import api from '../utils/api';
import StructureCard from '../components/ui/StructureCard';

export default function PharmaciesPage() {
  const [search, setSearch] = useState('');
  const [ville, setVille]   = useState('');
  const [page, setPage]     = useState(1);

  const { data: pharmacies, isLoading } = useQuery({
    queryKey: ['pharmacies', search, ville, page],
    queryFn: async () => {
      const p = new URLSearchParams({ type:'PHARMACIE', page, limit:16 });
      if (search) p.set('search', search);
      if (ville) p.set('ville', ville);
      const { data } = await api.get(`/structures?${p}`);
      return data;
    },
  });

  const { data: medResults } = useQuery({
    queryKey: ['med-search', search],
    queryFn: async () => {
      const { data } = await api.get(`/pharmacies/search?medicament=${encodeURIComponent(search)}&disponible=true&limit=5`);
      return data;
    },
    enabled: search.length >= 2,
  });

  const enriched = (pharmacies?.data || []).map((s) => ({
    ...s, niveauAbonnement: s.abonnements?.[0]?.niveau || 'BASIC',
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Pharmacies</h1>
        <p className="text-gray-500 text-sm">Trouvez un médicament disponible près de vous</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Médicament, DCI, nom de pharmacie..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400" />
        </div>
        <input type="text" placeholder="Ville..." value={ville} onChange={(e) => { setVille(e.target.value); setPage(1); }}
          className="sm:w-40 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400" />
      </div>

      {/* Résultats médicaments */}
      {search.length >= 2 && medResults?.data?.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">💊 Médicaments disponibles pour « {search} »</h2>
          <div className="space-y-2">
            {medResults.data.map((r) => (
              <div key={r.id} className="card flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900">{r.medicament.nomCommercial}</p>
                  <p className="text-xs text-gray-500">{r.medicament.dci} · {r.medicament.forme}</p>
                </div>
                <div className="text-right shrink-0">
                  {r.prix ? <p className="font-bold text-primary-600 text-sm">{r.prix.toLocaleString()} FCFA</p> : <p className="text-xs text-gray-400">Prix NC</p>}
                  <p className="text-xs text-green-600 font-medium">{r.pharmacie?.nomCommercial}</p>
                </div>
                <span className={`w-2 h-2 rounded-full shrink-0 ${r.enStock ? 'bg-green-500' : 'bg-orange-400'}`} />
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-sm text-gray-500 mb-4">{pharmacies?.pagination?.total || 0} pharmacie(s)</p>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="card animate-pulse h-36 bg-gray-100" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {enriched.map((s) => <StructureCard key={s.id} structure={s} />)}
        </div>
      )}

      {pharmacies?.pagination?.pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary text-sm disabled:opacity-40">← Préc.</button>
          <span className="px-4 py-2 text-sm text-gray-600">Page {page} / {pharmacies.pagination.pages}</span>
          <button disabled={page >= pharmacies.pagination.pages} onClick={() => setPage(p => p + 1)} className="btn-secondary text-sm disabled:opacity-40">Suiv. →</button>
        </div>
      )}
    </div>
  );
}
