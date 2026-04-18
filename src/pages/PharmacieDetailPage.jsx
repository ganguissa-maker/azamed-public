// src/pages/PharmacieDetailPage.jsx
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Phone, MessageCircle, MapPin, Search, CheckCircle } from 'lucide-react';
import api from '../utils/api';

export default function PharmacieDetailPage() {
  const { id }   = useParams();
  const [search, setSearch] = useState('');

  const { data: structure, isLoading } = useQuery({
    queryKey: ['structure', id],
    queryFn: async () => { const { data } = await api.get(`/structures/${id}`); return data; },
  });

  const { data: meds } = useQuery({
    queryKey: ['pharmacie-meds-public', id, search],
    queryFn: async () => {
      const p = new URLSearchParams({ disponible:'true', limit:200 });
      if (search) p.set('search', search);
      const { data } = await api.get(`/pharmacies/${id}/medicaments?${p}`);
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) return <div className="max-w-4xl mx-auto px-4 py-8"><div className="card animate-pulse h-40 bg-gray-100" /></div>;
  if (!structure) return <div className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-400">Structure introuvable.</div>;

  const niveau = structure.niveauAbonnement || structure.abonnements?.[0]?.niveau || 'BASIC';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="card mb-6">
        <div className="flex items-start gap-4">
          {structure.logoUrl
            ? <img src={structure.logoUrl} className="w-20 h-20 rounded-2xl object-cover shrink-0" alt={structure.nomCommercial} />
            : <div className="w-20 h-20 rounded-2xl bg-green-100 flex items-center justify-center shrink-0 text-3xl font-bold text-green-600">{structure.nomCommercial.charAt(0)}</div>
          }
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">{structure.nomCommercial}</h1>
              {structure.isVerified && <CheckCircle size={16} className="text-primary-500" />}
              {niveau === 'PREMIUM2' && <span className="badge-premium2">Premium+</span>}
              {niveau === 'PREMIUM1' && <span className="badge-premium1">Premium</span>}
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1"><MapPin size={13} />{structure.quartier ? `${structure.quartier}, ` : ''}{structure.ville}</div>
            {structure.description && <p className="text-sm text-gray-600 mt-2">{structure.description}</p>}
            <div className="flex gap-2 mt-3 flex-wrap">
              {structure.telephone && <a href={`tel:${structure.telephone}`} className="flex items-center gap-1.5 btn-secondary text-sm"><Phone size={13}/>{structure.telephone}</a>}
              {structure.whatsapp && <a href={`https://wa.me/${structure.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-100"><MessageCircle size={13}/>WhatsApp</a>}
            </div>
          </div>
        </div>
      </div>

      {/* Médicaments disponibles */}
      <div className="card">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="font-bold text-gray-900">Médicaments disponibles</h2>
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-400 w-44" />
          </div>
        </div>
        {(!meds?.data || meds.data.length === 0) ? (
          <p className="text-sm text-gray-400 text-center py-10">Aucun médicament renseigné pour cette pharmacie.</p>
        ) : (
          <div className="space-y-0">
            {meds.data.map((m, idx) => (
              <div key={m.id} className={`flex items-center gap-3 py-2.5 ${idx < meds.data.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{m.medicament.nomCommercial}</p>
                  <p className="text-xs text-gray-500">{m.medicament.dci} · {m.medicament.forme} {m.medicament.dosage}</p>
                </div>
                {m.prix && <span className="font-bold text-primary-600 text-sm shrink-0">{m.prix.toLocaleString()} FCFA</span>}
                {m.deGarde && <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full shrink-0">Garde</span>}
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${m.enStock ? 'bg-green-500' : 'bg-orange-400'}`} title={m.enStock ? 'En stock' : 'Stock limité'} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
