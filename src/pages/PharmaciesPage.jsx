// src/pages/PharmaciesPage.jsx — Garde / Toutes (miroir mobile)
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Shield, MapPin, Phone, ChevronRight, X } from 'lucide-react';
import api from '../utils/api';

const TYPE_COLORS = { PHARMACIE:'#2d6a4f' };

function PharmacieCard({ s }) {
  return (
    <Link to={`/structures/${s.id}`}
      className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-gray-100 hover:border-green-200 hover:shadow-sm transition-all group">
      <div className="w-11 h-11 rounded-xl bg-green-700 flex items-center justify-center text-white font-bold text-lg shrink-0">
        {s.nomCommercial?.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-900 truncate">{s.nomCommercial}</p>
        {s.ville && (
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
            <MapPin size={10}/> {s.quartier ? `${s.quartier}, ` : ''}{s.ville}
          </p>
        )}
        {s.telephone && (
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
            <Phone size={10}/> {s.telephone}
          </p>
        )}
      </div>
      {s.estDeGarde && (
        <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full shrink-0">De garde</span>
      )}
      <ChevronRight size={15} className="text-gray-300 group-hover:text-green-600 transition-colors shrink-0"/>
    </Link>
  );
}

export default function PharmaciesPage() {
  const [searchParams] = useSearchParams();
  const initTab        = searchParams.get('garde') === 'true' ? 'garde' : 'garde';
  const [tab, setTab]  = useState(initTab);
  const [search, setSearch] = useState('');

  const { data: gardeData, isLoading: loadGarde } = useQuery({
    queryKey: ['pharmacies-garde'],
    queryFn: async () => { const { data } = await api.get('/pharmacies/garde'); return data; },
  });

  const { data: toutesData, isLoading: loadToutes } = useQuery({
    queryKey: ['pharmacies-toutes', search],
    queryFn: async () => {
      const p = new URLSearchParams({ limit: 50 });
      if (search) p.set('search', search);
      const { data } = await api.get(`/pharmacies?${p}`);
      return data;
    },
    enabled: tab === 'toutes',
  });

  const gardes = gardeData?.data || [];
  const toutes = toutesData?.data || [];
  const isLoading = tab === 'garde' ? loadGarde : loadToutes;
  const list      = tab === 'garde' ? gardes : toutes;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">💊 Pharmacies</h1>

      {/* Onglets */}
      <div className="flex gap-3 mb-6">
        <button onClick={() => setTab('garde')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm border-2 transition-colors ${
            tab === 'garde'
              ? 'bg-green-700 border-green-700 text-white'
              : 'bg-white border-gray-200 text-gray-600 hover:border-green-300'
          }`}>
          <Shield size={14}/>
          De garde ({gardes.length})
        </button>
        <button onClick={() => setTab('toutes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm border-2 transition-colors ${
            tab === 'toutes'
              ? 'bg-primary-600 border-primary-600 text-white'
              : 'bg-white border-gray-200 text-gray-600 hover:border-primary-300'
          }`}>
          Toutes les pharmacies
        </button>
      </div>

      {/* Recherche (onglet Toutes) */}
      {tab === 'toutes' && (
        <div className="relative mb-5">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Nom, quartier, ville..."
            className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"/>
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2">
              <X size={14} className="text-gray-400"/>
            </button>
          )}
        </div>
      )}

      {/* Indicateur garde */}
      {tab === 'garde' && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 mb-5 text-sm text-green-700 font-semibold">
          <Shield size={14}/>
          Pharmacies ouvertes en ce moment
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-green-200 border-t-green-700 rounded-full animate-spin"/>
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">{tab === 'garde' ? '🌙' : '💊'}</p>
          <p className="font-bold text-gray-700">
            {tab === 'garde' ? 'Aucune pharmacie de garde en ce moment' : `Aucune pharmacie${search ? ` pour "${search}"` : ''}`}
          </p>
          {tab === 'garde' && (
            <button onClick={() => setTab('toutes')}
              className="mt-4 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700">
              Voir toutes les pharmacies →
            </button>
          )}
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-500 font-semibold mb-4">
            {list.length} pharmacie{list.length > 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {list.map((s) => <PharmacieCard key={s.id} s={s}/>)}
          </div>
        </div>
      )}
    </div>
  );
}
