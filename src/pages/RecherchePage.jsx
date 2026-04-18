// src/pages/RecherchePage.jsx
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Pill, TestTube2, Activity, Building2, MapPin, Search } from 'lucide-react';
import api from '../utils/api';
import SmartSearch from '../components/search/SmartSearch';

const ICON = { medicament:<Pill size={17} className="text-green-500" />, examen:<TestTube2 size={17} className="text-blue-500" />, service:<Activity size={17} className="text-purple-500" />, structure:<Building2 size={17} className="text-orange-500" /> };
const ROUTE = { medicament:'pharmacies', examen:'laboratoires', service:'hopitaux' };

function ResultCard({ item }) {
  const route = ROUTE[item.type];
  const href  = route ? `/${route}/${item.structure?.id || item.id}` : `/${item.id}`;
  return (
    <Link to={href} className="card hover:shadow-md transition-all hover:-translate-y-0.5 block">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">{ICON[item.type]}</div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 truncate">{item.titre}</p>
          <p className="text-xs text-gray-500 mt-0.5">{item.sous_titre}</p>
          {item.structure && (
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><MapPin size={10} />{item.structure.nomCommercial} · {item.structure.ville}</p>
          )}
          {item.prix && <p className="text-xs font-bold text-primary-600 mt-1">{item.prix.toLocaleString()} FCFA</p>}
        </div>
        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full shrink-0 capitalize">{item.type}</span>
      </div>
    </Link>
  );
}

export default function RecherchePage() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';

  const { data, isLoading } = useQuery({
    queryKey: ['search', q],
    queryFn: async () => { const { data } = await api.get(`/search?q=${encodeURIComponent(q)}`); return data; },
    enabled: q.length >= 2,
  });

  const all = data ? [...data.resultats.medicaments, ...data.resultats.examens, ...data.resultats.services, ...data.resultats.structures] : [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8"><SmartSearch defaultValue={q} /></div>
      {q && <p className="text-sm text-gray-500 mb-6">{isLoading ? 'Recherche...' : `${data?.total || 0} résultat(s) pour « ${q} »`}</p>}
      {!q && <div className="text-center py-16 text-gray-400"><Search size={40} className="mx-auto mb-3 opacity-30" /><p>Saisissez un médicament, examen ou spécialité</p></div>}
      {isLoading && <div className="space-y-3">{[...Array(4)].map((_,i) => <div key={i} className="card animate-pulse h-20 bg-gray-100"/>)}</div>}
      {!isLoading && all.length > 0 && <div className="space-y-3">{all.map((item, i) => <ResultCard key={i} item={item} />)}</div>}
      {!isLoading && q && all.length === 0 && <div className="text-center py-12 text-gray-400"><p className="font-medium text-gray-600">Aucun résultat pour « {q} »</p></div>}
    </div>
  );
}
