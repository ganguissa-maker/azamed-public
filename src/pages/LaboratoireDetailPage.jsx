// src/pages/LaboratoireDetailPage.jsx
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Phone, MessageCircle, MapPin, CheckCircle } from 'lucide-react';
import api from '../utils/api';

export default function LaboratoireDetailPage() {
  const { id } = useParams();

  const { data: structure } = useQuery({
    queryKey: ['structure', id],
    queryFn: async () => { const { data } = await api.get(`/structures/${id}`); return data; },
  });

  const { data: examens } = useQuery({
    queryKey: ['labo-examens-public', id],
    queryFn: async () => { const { data } = await api.get(`/laboratoires/${id}/examens?disponible=true&limit=300`); return data; },
    enabled: !!id,
  });

  if (!structure) return <div className="max-w-4xl mx-auto px-4 py-8"><div className="card animate-pulse h-40 bg-gray-100" /></div>;

  const grouped = examens?.grouped || {};
  const niveau  = structure.niveauAbonnement || structure.abonnements?.[0]?.niveau || 'BASIC';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="card mb-6">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0 text-3xl font-bold text-blue-600">{structure.nomCommercial.charAt(0)}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">{structure.nomCommercial}</h1>
              {structure.isVerified && <CheckCircle size={16} className="text-primary-500" />}
              {niveau === 'PREMIUM2' && <span className="badge-premium2">Premium+</span>}
              {niveau === 'PREMIUM1' && <span className="badge-premium1">Premium</span>}
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1"><MapPin size={13} />{structure.ville}</div>
            {structure.description && <p className="text-sm text-gray-600 mt-2">{structure.description}</p>}
            <div className="flex gap-2 mt-3 flex-wrap">
              {structure.telephone && <a href={`tel:${structure.telephone}`} className="flex items-center gap-1.5 btn-secondary text-sm"><Phone size={13}/>{structure.telephone}</a>}
              {structure.whatsapp && <a href={`https://wa.me/${structure.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-100"><MessageCircle size={13}/>WhatsApp</a>}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-bold text-gray-900 mb-4">Examens disponibles</h2>
        {Object.keys(grouped).length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">Aucun examen renseigné.</p>
        ) : Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} className="mb-5">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">{cat}</h3>
            {items.map((e, idx) => (
              <div key={e.id} className={`flex items-center gap-3 py-2.5 ${idx < items.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900">{e.examen.nom}</p>
                  <p className="text-xs text-gray-400">{e.examen.codeAzamed}</p>
                </div>
                <div className="text-right shrink-0">
                  {e.prix && <p className="font-bold text-primary-600 text-sm">{e.prix.toLocaleString()} FCFA</p>}
                  {e.delaiMax && <p className="text-xs text-gray-400">Résultat en {e.delaiMax}h max</p>}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
