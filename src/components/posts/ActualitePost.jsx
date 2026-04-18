// src/components/posts/ActualitePost.jsx
import { Building2, Clock, Pin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const TYPE_COLORS = {
  PROMOTION:'bg-orange-50 text-orange-700 border-orange-100',
  NOUVEAU_SERVICE:'bg-green-50 text-green-700 border-green-100',
  CAMPAGNE_DEPISTAGE:'bg-blue-50 text-blue-700 border-blue-100',
  EVENEMENT_MEDICAL:'bg-purple-50 text-purple-700 border-purple-100',
  RECRUTEMENT:'bg-indigo-50 text-indigo-700 border-indigo-100',
  AUTRE:'bg-gray-50 text-gray-600 border-gray-100',
};
const TYPE_LABEL = {
  PROMOTION:'🏷️ Promotion', NOUVEAU_SERVICE:'✨ Nouveau service',
  DISPONIBILITE_MEDICAMENT:'💊 Médicament', NOUVEL_EXAMEN:'🔬 Nouvel examen',
  CAMPAGNE_DEPISTAGE:'🏥 Dépistage', HORAIRES_MODIFIES:'🕐 Horaires',
  EVENEMENT_MEDICAL:'📅 Événement', RECRUTEMENT:'👨‍⚕️ Recrutement',
  MESSAGE_INSTITUTIONNEL:'📢 Annonce', AUTRE:'📌 Info',
};

export default function ActualitePost({ post }) {
  const { structure, contenu, typePost, mediaUrl, createdAt, isPinned } = post;
  const niveau   = structure?.niveauAbonnement || 'BASIC';
  const tagColor = TYPE_COLORS[typePost] || TYPE_COLORS.AUTRE;

  return (
    <div className={`card ${niveau === 'PREMIUM2' ? 'border-amber-200' : niveau === 'PREMIUM1' ? 'border-purple-100' : ''}`}>
      <div className="flex items-start gap-3">
        {structure?.logoUrl
          ? <img src={structure.logoUrl} alt={structure.nomCommercial} className="w-10 h-10 rounded-xl object-cover shrink-0" />
          : <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
              <Building2 size={17} className="text-primary-600" />
            </div>
        }
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-gray-900 truncate">{structure?.nomCommercial}</span>
            {niveau === 'PREMIUM2' && <span className="badge-premium2">Premium+</span>}
            {niveau === 'PREMIUM1' && <span className="badge-premium1">Premium</span>}
            {isPinned && <Pin size={11} className="text-amber-500" />}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-xs px-2 py-0.5 rounded-full border ${tagColor}`}>
              {TYPE_LABEL[typePost] || TYPE_LABEL.AUTRE}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock size={10} />
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: fr })}
            </span>
          </div>
        </div>
      </div>
      <p className="mt-3 text-sm text-gray-700 leading-relaxed whitespace-pre-line">{contenu}</p>
      {mediaUrl && <img src={mediaUrl} alt="Media" className="mt-3 rounded-xl w-full object-cover max-h-64" />}
    </div>
  );
}
