// src/pages/ComparaisonPage.jsx — Comparaison prix (miroir mobile)
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, X, TrendingDown, TrendingUp, MapPin } from 'lucide-react';
import api from '../utils/api';

const TABS = [
  { key:'medicaments', label:'💊 Médicaments', color:'#2d6a4f', endpoint:'/compare/medicaments' },
  { key:'examens',     label:'🔬 Examens',     color:'#7b2d42', endpoint:'/compare/examens' },
  { key:'services',    label:'🏥 Services',    color:'#1565c0', endpoint:'/compare/services' },
];

function PriceCard({ item, couleur }) {
  const withPrix = (item.prix || []).filter((p) => p.prix > 0).sort((a,b) => a.prix - b.prix);
  if (withPrix.length === 0) return null;
  const min = withPrix[0];
  const max = withPrix[withPrix.length-1];
  const diff = max.prix - min.prix;

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
      <p className="font-bold text-sm text-gray-900 mb-3 line-clamp-2">{item.nom}</p>
      {item.dci   && <p className="text-xs text-gray-400 mb-1">{item.dci}</p>}
      {item.classe && <p className="text-xs font-medium mb-3" style={{ color:couleur }}>{item.classe}</p>}

      <div className="grid grid-cols-2 gap-2 mb-3">
        {/* Moins cher */}
        <div className="rounded-xl p-3 text-center" style={{ backgroundColor: couleur + '10' }}>
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingDown size={12} style={{ color:couleur }}/>
            <span className="text-xs font-bold text-gray-500">Moins cher</span>
          </div>
          <p className="font-extrabold text-base" style={{ color:couleur }}>
            {Number(min.prix).toLocaleString()} F
          </p>
          <p className="text-xs text-gray-500 truncate mt-1">{min.structureNom}</p>
          {min.ville && <p className="text-xs text-gray-400 flex items-center justify-center gap-0.5"><MapPin size={9}/>{min.ville}</p>}
        </div>

        {/* Plus cher */}
        {withPrix.length > 1 ? (
          <div className="rounded-xl p-3 text-center bg-orange-50">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp size={12} className="text-orange-400"/>
              <span className="text-xs font-bold text-gray-500">Plus cher</span>
            </div>
            <p className="font-extrabold text-base text-orange-500">
              {Number(max.prix).toLocaleString()} F
            </p>
            <p className="text-xs text-gray-500 truncate mt-1">{max.structureNom}</p>
            {max.ville && <p className="text-xs text-gray-400 flex items-center justify-center gap-0.5"><MapPin size={9}/>{max.ville}</p>}
          </div>
        ) : (
          <div className="rounded-xl p-3 text-center bg-gray-50 flex items-center justify-center">
            <p className="text-xs text-gray-400">1 seul tarif disponible</p>
          </div>
        )}
      </div>

      {withPrix.length > 1 && (
        <p className="text-xs text-gray-400 text-center">
          Économisez jusqu'à <span className="font-bold text-green-600">{Number(diff).toLocaleString()} FCFA</span>
        </p>
      )}
      <p className="text-xs text-gray-400 text-center mt-1">
        {withPrix.length} établissement{withPrix.length>1?'s':''} avec tarif renseigné
      </p>
    </div>
  );
}

export default function ComparaisonPage() {
  const [tab, setTab]       = useState('medicaments');
  const [search, setSearch] = useState('');

  const currentTab = TABS.find((t) => t.key === tab);

  const { data: medsData,  isLoading:lm } = useQuery({ queryKey:['cmp-meds'],  queryFn: async()=>{ const{data}=await api.get('/compare/medicaments'); return data; } });
  const { data: examData,  isLoading:le } = useQuery({ queryKey:['cmp-exam'],  queryFn: async()=>{ const{data}=await api.get('/compare/examens');      return data; } });
  const { data: srvData,   isLoading:ls } = useQuery({ queryKey:['cmp-srv'],   queryFn: async()=>{ const{data}=await api.get('/compare/services');      return data; } });

  const isLoading = tab==='medicaments'?lm : tab==='examens'?le : ls;
  const rawData   = tab==='medicaments'?medsData?.data : tab==='examens'?examData?.data : srvData?.data;

  const filtered = (rawData||[]).filter((item) =>
    !search || item.nom?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">💰 Comparaison des prix</h1>
        <p className="text-gray-500 text-sm">Trouvez les meilleurs tarifs médicaux près de chez vous</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => { setTab(t.key); setSearch(''); }}
            className={`px-4 py-2.5 rounded-xl font-semibold text-sm border-2 transition-colors ${
              tab === t.key
                ? 'text-white border-transparent'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
            style={tab===t.key ? { backgroundColor:t.color, borderColor:t.color } : {}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Recherche */}
      <div className="relative mb-6">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder={`Rechercher ${tab==='medicaments'?'un médicament':tab==='examens'?'un examen':'un service'}...`}
          className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"/>
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2">
            <X size={14} className="text-gray-400"/>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-gray-200 rounded-full animate-spin"
            style={{ borderTopColor: currentTab?.color }}/>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">🔍</p>
          <p className="font-bold text-gray-700">
            {search ? `Aucun résultat pour "${search}"` : 'Aucune donnée de prix disponible'}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Les établissements doivent renseigner leurs prix dans leur tableau de bord
          </p>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-500 font-semibold mb-4">
            {filtered.length} {tab} avec prix renseigné{filtered.length>1?'s':''}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((item) => (
              <PriceCard key={item.id||item.nom} item={item} couleur={currentTab?.color||'#0284c7'}/>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
