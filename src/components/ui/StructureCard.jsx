// src/components/ui/StructureCard.jsx
import { Link } from 'react-router-dom';
import { Phone, MessageCircle, MapPin, CheckCircle } from 'lucide-react';

const ROUTE_MAP = {
  PHARMACIE:'pharmacies', LABORATOIRE:'laboratoires',
  HOPITAL_PUBLIC:'hopitaux', HOPITAL_PRIVE:'hopitaux', CLINIQUE:'hopitaux',
  CABINET_MEDICAL:'hopitaux', CABINET_SPECIALISE:'hopitaux', CENTRE_SANTE:'hopitaux',
};
const TYPE_LABEL = {
  PHARMACIE:'Pharmacie', LABORATOIRE:'Laboratoire', HOPITAL_PUBLIC:'Hôpital Public',
  HOPITAL_PRIVE:'Hôpital Privé', CLINIQUE:'Clinique', CABINET_MEDICAL:'Cabinet Médical',
  CABINET_SPECIALISE:'Cabinet Spécialisé', CENTRE_SANTE:'Centre de Santé',
};

export default function StructureCard({ structure }) {
  const route  = ROUTE_MAP[structure.typeStructure] || 'hopitaux';
  const niveau = structure.niveauAbonnement || 'BASIC';

  return (
    <Link to={`/${route}/${structure.id}`} className="block group">
      <div className={`card hover:shadow-md transition-all hover:-translate-y-0.5 ${niveau === 'PREMIUM2' ? 'border-amber-200' : niveau === 'PREMIUM1' ? 'border-purple-100' : ''}`}>
        <div className="flex gap-3">
          {structure.logoUrl
            ? <img src={structure.logoUrl} alt={structure.nomCommercial} className="w-14 h-14 rounded-xl object-cover shrink-0" />
            : <div className="w-14 h-14 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
                <span className="text-primary-700 font-bold text-xl">{structure.nomCommercial.charAt(0)}</span>
              </div>
          }
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-semibold text-gray-900 text-sm truncate">{structure.nomCommercial}</h3>
              {structure.isVerified && <CheckCircle size={13} className="text-primary-500 shrink-0" />}
            </div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs text-gray-400">{TYPE_LABEL[structure.typeStructure]}</span>
              {niveau === 'PREMIUM2' && <span className="badge-premium2">⭐ Premium+</span>}
              {niveau === 'PREMIUM1' && <span className="badge-premium1">✦ Premium</span>}
            </div>
            <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-400">
              <MapPin size={11} />
              <span className="truncate">{structure.quartier ? `${structure.quartier}, ` : ''}{structure.ville}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
          {structure.telephone && (
            <a href={`tel:${structure.telephone}`} onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors">
              <Phone size={11} /> Appeler
            </a>
          )}
          {structure.whatsapp && (
            <a href={`https://wa.me/${structure.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors">
              <MessageCircle size={11} /> WhatsApp
            </a>
          )}
          <span className="ml-auto text-xs font-medium text-primary-600 self-center group-hover:underline">
            Voir la fiche →
          </span>
        </div>
      </div>
    </Link>
  );
}
