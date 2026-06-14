// src/pages/HomePage.jsx — Accueil site public (miroir app mobile)
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search, Shield, ArrowRight, Pill, TestTube2,
  Building2, BarChart2, Newspaper, ChevronRight, MapPin, Phone,
} from 'lucide-react';
import api from '../utils/api';

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

function StructureCard({ s }) {
  const couleur = TYPE_COLORS[s.typeStructure] || '#0284c7';
  return (
    <Link to={`/structures/${s.id}`}
      className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all group">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-lg"
        style={{ backgroundColor: couleur }}>
        {s.nomCommercial?.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-900 truncate">{s.nomCommercial}</p>
        <p className="text-xs text-gray-400 mt-0.5">{TYPE_LABELS[s.typeStructure]}</p>
        {s.ville && (
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
            <MapPin size={10}/> {s.quartier ? `${s.quartier}, ` : ''}{s.ville}
          </p>
        )}
      </div>
      <ChevronRight size={16} className="text-gray-300 group-hover:text-primary-500 shrink-0 transition-colors"/>
    </Link>
  );
}

export default function HomePage() {
  const navigate    = useNavigate();
  const [search, setSearch] = useState('');

  const { data: gardeData } = useQuery({
    queryKey: ['garde-home'],
    queryFn: async () => { const { data } = await api.get('/pharmacies/garde'); return data; },
  });

  const { data: structData } = useQuery({
    queryKey: ['structures-home'],
    queryFn: async () => { const { data } = await api.get('/structures?limit=6'); return data; },
  });

  const { data: postsData } = useQuery({
    queryKey: ['posts-home'],
    queryFn: async () => { const { data } = await api.get('/posts?limit=3'); return data; },
  });

  const gardes     = gardeData?.data    || [];
  const structures = structData?.data   || [];
  const posts      = postsData?.data    || [];

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/recherche?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3 leading-tight">
          Annuaire Santé<br/>
          <span className="text-primary-600">Cameroun 🇨🇲</span>
        </h1>
        <p className="text-gray-500 text-base max-w-xl mx-auto">
          Trouvez pharmacies, laboratoires, hôpitaux et médecins. Comparez les prix en temps réel.
        </p>
      </div>

      {/* Barre de recherche */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-10 max-w-2xl mx-auto">
        <div className="flex-1 flex items-center gap-3 bg-white rounded-2xl px-4 py-3
          shadow-sm border border-gray-200 focus-within:border-primary-400 transition-colors">
          <Search size={18} className="text-gray-400 shrink-0"/>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Médicament, examen, hôpital, ville..."
            className="flex-1 text-sm text-gray-900 outline-none bg-transparent"/>
        </div>
        <button type="submit"
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 rounded-2xl font-semibold text-sm transition-colors shrink-0">
          Rechercher
        </button>
      </form>

      {/* Bannière comparaison prix */}
      <Link to="/comparaison"
        className="block bg-primary-600 rounded-2xl p-5 mb-10 hover:bg-primary-700 transition-colors group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-lg mb-1">💰 Comparer les prix</p>
            <p className="text-primary-100 text-sm">Médicaments · Examens · Consultations</p>
            <p className="text-primary-200 text-xs mt-1">Trouvez le meilleur tarif près de vous</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex gap-2 text-2xl">💊 🔬 🏥</div>
            <span className="text-primary-200 text-sm group-hover:text-white transition-colors flex items-center gap-1">
              Voir maintenant <ArrowRight size={14}/>
            </span>
          </div>
        </div>
      </Link>

      {/* Navigation rapide */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-10">
        {[
          { label:'Pharmacies',   icon:<Pill size={20}/>,       color:'#2d6a4f', to:'/pharmacies' },
          { label:'Laboratoires', icon:<TestTube2 size={20}/>,  color:'#7b2d42', to:'/laboratoires' },
          { label:'Hôpitaux',     icon:<Building2 size={20}/>,  color:'#1565c0', to:'/hopitaux' },
          { label:'De garde 🟢',  icon:<Shield size={20}/>,     color:'#16a34a', to:'/pharmacies?garde=true' },
          { label:'Actualités',   icon:<Newspaper size={20}/>,  color:'#558b2f', to:'/actualites' },
          { label:'Comparer',     icon:<BarChart2 size={20}/>,  color:'#e65100', to:'/comparaison' },
        ].map((item) => (
          <Link key={item.label} to={item.to}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:opacity-80 transition-opacity"
            style={{ backgroundColor: item.color + '15' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: item.color }}>
              {item.icon}
            </div>
            <span className="text-xs font-bold text-center leading-tight"
              style={{ color: item.color }}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Pharmacies de garde */}
      {gardes.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">🟢 Pharmacies de garde ({gardes.length})</h2>
            <Link to="/pharmacies?garde=true" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              Voir tout <ChevronRight size={14}/>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {gardes.slice(0, 4).map((s) => <StructureCard key={s.id} s={s}/>)}
          </div>
        </div>
      )}

      {/* Établissements vérifiés */}
      {structures.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Établissements vérifiés</h2>
            <Link to="/hopitaux" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              Voir tout <ChevronRight size={14}/>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {structures.slice(0, 4).map((s) => <StructureCard key={s.id} s={s}/>)}
          </div>
        </div>
      )}

      {/* Actualités */}
      {posts.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Actualités santé</h2>
            <Link to="/actualites" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              Voir tout <ChevronRight size={14}/>
            </Link>
          </div>
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl p-4 border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
                    <span className="text-primary-600 font-bold text-sm">
                      {(post.structure?.nomCommercial || 'A').charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{post.structure?.nomCommercial}</p>
                    <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 line-clamp-3">{post.contenu}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
