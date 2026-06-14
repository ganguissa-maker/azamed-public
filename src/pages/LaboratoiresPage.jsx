// src/pages/LaboratoiresPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Phone, ChevronRight, X } from 'lucide-react';
import api from '../utils/api';

const TYPES_LABO = ['LABORATOIRE','CENTRE_IMAGERIE','LABO_ET_IMAGERIE'];
const TYPE_COLORS = {
  LABORATOIRE:'#7b2d42', CENTRE_IMAGERIE:'#1a237e', LABO_ET_IMAGERIE:'#4a148c',
};
const TYPE_LABELS = {
  LABORATOIRE:"Laboratoire d'analyses", CENTRE_IMAGERIE:"Centre d'imagerie", LABO_ET_IMAGERIE:'Labo & Imagerie',
};

function LaboCard({ s }) {
  const couleur = TYPE_COLORS[s.typeStructure] || '#7b2d42';
  return (
    <Link to={`/structures/${s.id}`}
      className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-sm transition-all group">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold shrink-0"
        style={{ backgroundColor: couleur }}>
        {s.nomCommercial?.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-900 truncate">{s.nomCommercial}</p>
        <p className="text-xs font-medium mt-0.5" style={{ color: couleur }}>{TYPE_LABELS[s.typeStructure]}</p>
        {s.ville && <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><MapPin size={10}/> {s.ville}</p>}
      </div>
      <ChevronRight size={15} className="text-gray-300 group-hover:text-purple-500 shrink-0 transition-colors"/>
    </Link>
  );
}

export default function LaboratoiresPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setType] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['labos', search, typeFilter],
    queryFn: async () => {
      const p = new URLSearchParams({ limit: 50 });
      if (search)     p.set('search', search);
      if (typeFilter) p.set('type', typeFilter);
      const { data } = await api.get(`/laboratoires?${p}`);
      return data;
    },
  });

  const list = data?.data || [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">🔬 Laboratoires & Imagerie</h1>

      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Nom, ville, examen..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400"/>
        </div>
        <select value={typeFilter} onChange={(e) => setType(e.target.value)}
          className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none">
          <option value="">Tous les types</option>
          {TYPES_LABO.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-purple-200 border-t-purple-700 rounded-full animate-spin"/>
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">🔬</p>
          <p className="font-bold text-gray-700">Aucun laboratoire trouvé</p>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-500 font-semibold mb-4">{list.length} établissement{list.length>1?'s':''}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {list.map((s) => <LaboCard key={s.id} s={s}/>)}
          </div>
        </div>
      )}
    </div>
  );
}
