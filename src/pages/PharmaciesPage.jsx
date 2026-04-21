// src/pages/PharmaciesPage.jsx — avec pharmacies de garde visibles
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, MapPin, Phone, MessageCircle, ShieldCheck, Clock } from 'lucide-react';
import api from '../utils/api';

function PharmacieCard({ structure, onPress }) {
  return (
    <Link to={`/pharmacies/${structure.id}`}
      className="card hover:shadow-md transition-all hover:-translate-y-0.5 block">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
          <span className="text-green-800 font-bold text-lg">{structure.nomCommercial?.charAt(0)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-gray-900 text-sm truncate">{structure.nomCommercial}</h3>
            {structure.isVerified && <span className="text-primary-500 text-xs">✓</span>}
            {structure.estDeGarde && (
              <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                <ShieldCheck size={11}/> De garde
              </span>
            )}
          </div>
          {(structure.ville || structure.quartier) && (
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
              <MapPin size={10}/>
              {structure.quartier ? `${structure.quartier}, ` : ''}{structure.ville}
            </p>
          )}
          {(structure.heureOuverture || structure.heureFermeture) && (
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <Clock size={10}/>
              {structure.heureOuverture} – {structure.heureFermeture}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2 pt-2 border-t border-gray-50">
        {structure.telephone && (
          <a href={`tel:${structure.telephone}`} onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-xs text-primary-600 bg-primary-50 px-2.5 py-1.5 rounded-lg hover:bg-primary-100 transition-colors font-medium">
            <Phone size={11}/> Appeler
          </a>
        )}
        {structure.whatsapp && (
          <a href={`https://wa.me/${structure.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2.5 py-1.5 rounded-lg hover:bg-green-100 transition-colors font-medium">
            <MessageCircle size={11}/> WhatsApp
          </a>
        )}
        <span className="ml-auto text-xs text-primary-500 font-medium self-center">Voir →</span>
      </div>
    </Link>
  );
}

export default function PharmaciesPage() {
  const [search, setSearch] = useState('');
  const [ville, setVille]   = useState('');
  const [page, setPage]     = useState(1);

  // Pharmacies de garde
  const { data: gardeData } = useQuery({
    queryKey: ['pharmacies-garde', ville],
    queryFn: async () => {
      const p = new URLSearchParams();
      if (ville) p.set('ville', ville);
      const { data } = await api.get(`/pharmacies/garde?${p}`);
      return data;
    },
  });

  // Toutes les pharmacies
  const { data, isLoading } = useQuery({
    queryKey: ['pharmacies', search, ville, page],
    queryFn: async () => {
      const p = new URLSearchParams({ type: 'PHARMACIE', page, limit: 15 });
      if (search) p.set('search', search);
      if (ville)  p.set('ville', ville);
      const { data } = await api.get(`/structures?${p}`);
      return data;
    },
    keepPreviousData: true,
  });

  const pharmacies = data?.data || [];
  const gardes     = gardeData?.data || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Pharmacies</h1>
        <p className="text-gray-500 text-sm">{data?.pagination?.total || 0} pharmacie(s) sur AZAMED</p>
      </div>

      {/* Filtres */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input type="text" placeholder="Nom de pharmacie ou médicament..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"/>
        </div>
        <input type="text" placeholder="Filtrer par ville..." value={ville}
          onChange={(e) => { setVille(e.target.value); setPage(1); }}
          className="w-40 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"/>
      </div>

      {/* Pharmacies de garde */}
      {gardes.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={18} className="text-green-600"/>
            <h2 className="font-bold text-gray-900">Pharmacies de garde ({gardes.length})</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gardes.map((s) => <PharmacieCard key={s.id} structure={s}/>)}
          </div>
          <div className="mt-4 border-t border-gray-200"/>
        </div>
      )}

      {/* Toutes les pharmacies */}
      <h2 className="font-bold text-gray-900 mb-4">
        {gardes.length > 0 ? 'Toutes les pharmacies' : 'Pharmacies'}
      </h2>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_,i) => <div key={i} className="card animate-pulse h-32 bg-gray-100"/>)}
        </div>
      ) : pharmacies.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="font-medium text-gray-500">Aucune pharmacie trouvée</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pharmacies.map((s) => <PharmacieCard key={s.id} structure={s}/>)}
        </div>
      )}

      {data?.pagination?.pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button disabled={page===1} onClick={() => setPage(p=>p-1)} className="btn-secondary text-sm disabled:opacity-40">← Préc.</button>
          <span className="px-4 py-2 text-sm text-gray-600">Page {page} / {data.pagination.pages}</span>
          <button disabled={page>=data.pagination.pages} onClick={() => setPage(p=>p+1)} className="btn-secondary text-sm disabled:opacity-40">Suiv. →</button>
        </div>
      )}
    </div>
  );
}
