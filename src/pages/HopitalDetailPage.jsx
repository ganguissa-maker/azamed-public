// src/pages/HopitalDetailPage.jsx
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Phone, MessageCircle, MapPin, CheckCircle, Clock } from 'lucide-react';
import api from '../utils/api';

export default function HopitalDetailPage() {
  const { id } = useParams();

  const { data: structure } = useQuery({
    queryKey: ['structure', id],
    queryFn: async () => { const { data } = await api.get(`/structures/${id}`); return data; },
  });

  const { data: services } = useQuery({
    queryKey: ['hopital-services-public', id],
    queryFn: async () => { const { data } = await api.get(`/hopitaux/${id}/services?disponible=true`); return data; },
    enabled: !!id,
  });

  if (!structure) return <div className="max-w-4xl mx-auto px-4 py-8"><div className="card animate-pulse h-40 bg-gray-100" /></div>;

  const grouped = services?.grouped || {};
  const niveau  = structure.niveauAbonnement || structure.abonnements?.[0]?.niveau || 'BASIC';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="card mb-6">
        <div className="flex items-start gap-4">
          {structure.logoUrl
            ? <img src={structure.logoUrl} className="w-20 h-20 rounded-2xl object-cover shrink-0" alt={structure.nomCommercial} />
            : <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center shrink-0 text-3xl font-bold text-primary-600">{structure.nomCommercial.charAt(0)}</div>
          }
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">{structure.nomCommercial}</h1>
              {structure.isVerified && <CheckCircle size={16} className="text-primary-500" />}
              {niveau === 'PREMIUM2' && <span className="badge-premium2">Premium+</span>}
              {niveau === 'PREMIUM1' && <span className="badge-premium1">Premium</span>}
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1"><MapPin size={13} />{structure.adresse ? `${structure.adresse}, ` : ''}{structure.ville}</div>
            {structure.description && <p className="text-sm text-gray-600 mt-2">{structure.description}</p>}
            <div className="flex gap-2 mt-3 flex-wrap">
              {structure.telephone && <a href={`tel:${structure.telephone}`} className="flex items-center gap-1.5 btn-secondary text-sm"><Phone size={13}/>{structure.telephone}</a>}
              {structure.whatsapp && <a href={`https://wa.me/${structure.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-100"><MessageCircle size={13}/>WhatsApp</a>}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-bold text-gray-900 mb-4">Services disponibles</h2>
        {Object.keys(grouped).length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">Aucun service renseigné.</p>
        ) : Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} className="mb-5">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">{cat}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {items.map((s) => (
                <div key={s.id} className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl">
                  <CheckCircle size={13} className="text-green-500 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900">{s.service.nom}</p>
                    <div className="flex gap-2 mt-0.5 flex-wrap">
                      {s.prixConsultation && <span className="text-xs text-primary-600 font-semibold">{s.prixConsultation.toLocaleString()} FCFA</span>}
                      {s.surRdv && <span className="text-xs text-orange-500 flex items-center gap-0.5"><Clock size={10}/>Sur RDV</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
