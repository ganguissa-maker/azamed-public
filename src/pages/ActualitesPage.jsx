// src/pages/ActualitesPage.jsx — avec images et vidéos
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building2, Clock, Pin, Play } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import api from '../utils/api';

const TYPE_LABELS = {
  PROMOTION:'🏷️ Promotion', NOUVEAU_SERVICE:'✨ Nouveau service',
  DISPONIBILITE_MEDICAMENT:'💊 Médicament', NOUVEL_EXAMEN:'🔬 Nouvel examen',
  CAMPAGNE_DEPISTAGE:'🏥 Dépistage', HORAIRES_MODIFIES:'🕐 Horaires',
  EVENEMENT_MEDICAL:'📅 Événement', RECRUTEMENT:'👨‍⚕️ Recrutement',
  MESSAGE_INSTITUTIONNEL:'📢 Annonce', AUTRE:'📌 Info',
};

function PostCard({ post }) {
  const { structure, contenu, typePost, imageUrl, videoUrl, createdAt, isPinned } = post;
  const [videoPlaying, setVideoPlaying] = useState(false);

  return (
    <div className="card">
      {/* Header structure */}
      <div className="flex items-start gap-3 mb-3">
        {structure?.logoUrl ? (
          <img src={structure.logoUrl} alt={structure.nomCommercial}
            className="w-10 h-10 rounded-xl object-cover shrink-0"/>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
            <Building2 size={17} className="text-primary-600"/>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-gray-900 truncate">{structure?.nomCommercial}</span>
            {structure?.isVerified && <span className="text-xs text-primary-600 font-bold">✓</span>}
            {isPinned && <Pin size={11} className="text-amber-500 shrink-0"/>}
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {TYPE_LABELS[typePost] || '📌 Info'}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock size={10}/>
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: fr })}
            </span>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mb-3">{contenu}</p>

      {/* Image */}
      {imageUrl && (
        <img src={imageUrl} alt="Publication" loading="lazy"
          className="w-full rounded-xl object-cover max-h-80 mb-3 cursor-pointer"
          onClick={() => window.open(imageUrl, '_blank')}/>
      )}

      {/* Vidéo */}
      {videoUrl && (
        <div className="relative rounded-xl overflow-hidden bg-black mb-3">
          {!videoPlaying ? (
            <div className="relative cursor-pointer group" onClick={() => setVideoPlaying(true)}>
              <video src={videoUrl} className="w-full max-h-72 object-cover opacity-70"/>
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
                <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  <Play size={26} className="text-primary-600 ml-1"/>
                </div>
              </div>
              <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                Cliquez pour lire
              </div>
            </div>
          ) : (
            <video src={videoUrl} controls autoPlay className="w-full max-h-72"/>
          )}
        </div>
      )}
    </div>
  );
}

export default function ActualitesPage() {
  const [ville, setVille]         = useState('');
  const [typeStructure, setTypeS] = useState('');
  const [page, setPage]           = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['posts', ville, typeStructure, page],
    queryFn: async () => {
      const p = new URLSearchParams({ page, limit: 20 });
      if (ville)         p.set('ville', ville);
      if (typeStructure) p.set('typeStructure', typeStructure);
      const { data } = await api.get(`/posts?${p}`);
      return data;
    },
  });

  const posts = (data?.data || []).map((post) => ({
    ...post,
    structure: {
      ...post.structure,
      niveauAbonnement: post.structure?.abonnements?.[0]?.niveau || 'BASIC',
    },
  }));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Actualités santé</h1>
        <p className="text-gray-500 text-sm">Publications des établissements de santé</p>
      </div>

      <div className="flex gap-2 mb-6">
        <input type="text" placeholder="Filtrer par ville..." value={ville}
          onChange={(e) => { setVille(e.target.value); setPage(1); }}
          className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"/>
        <select value={typeStructure} onChange={(e) => { setTypeS(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400">
          <option value="">Toutes</option>
          <option value="PHARMACIE">Pharmacies</option>
          <option value="LABORATOIRE">Laboratoires</option>
          <option value="HOPITAL_PUBLIC">Hôpitaux</option>
          <option value="HOPITAL_PRIVE">Hôpitaux privés</option>
          <option value="CLINIQUE">Cliniques</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_,i) => <div key={i} className="card animate-pulse h-40 bg-gray-100"/>)}
        </div>
      ) : (
        <div className="space-y-4">
          {posts.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg font-medium text-gray-500 mb-1">Aucune actualité</p>
              <p className="text-sm">Aucune publication disponible pour le moment.</p>
            </div>
          )}
          {posts.map((post) => <PostCard key={post.id} post={post}/>)}
        </div>
      )}

      {data?.pagination?.pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button disabled={page===1} onClick={() => setPage(p=>p-1)}
            className="btn-secondary text-sm disabled:opacity-40">← Préc.</button>
          <span className="px-4 py-2 text-sm text-gray-600">Page {page} / {data.pagination.pages}</span>
          <button disabled={page>=data.pagination.pages} onClick={() => setPage(p=>p+1)}
            className="btn-secondary text-sm disabled:opacity-40">Suiv. →</button>
        </div>
      )}
    </div>
  );
}
