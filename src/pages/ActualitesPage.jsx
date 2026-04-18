// src/pages/ActualitesPage.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import ActualitePost from '../components/posts/ActualitePost';

export default function ActualitesPage() {
  const [ville, setVille]             = useState('');
  const [typeStructure, setTypeS]     = useState('');
  const [page, setPage]               = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['posts', ville, typeStructure, page],
    queryFn: async () => {
      const p = new URLSearchParams({ page, limit:20 });
      if (ville) p.set('ville', ville);
      if (typeStructure) p.set('typeStructure', typeStructure);
      const { data } = await api.get(`/posts?${p}`);
      return data;
    },
  });

  const posts = (data?.data || []).map((post) => ({
    ...post,
    structure: { ...post.structure, niveauAbonnement: post.structure?.abonnements?.[0]?.niveau || 'BASIC' },
  }));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Actualités santé</h1>
        <p className="text-gray-500 text-sm">Publications des établissements de santé</p>
      </div>

      <div className="flex gap-2 mb-6">
        <input type="text" placeholder="Filtrer par ville..." value={ville} onChange={(e) => setVille(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400" />
        <select value={typeStructure} onChange={(e) => setTypeS(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400">
          <option value="">Toutes</option>
          <option value="PHARMACIE">Pharmacies</option>
          <option value="LABORATOIRE">Laboratoires</option>
          <option value="HOPITAL_PUBLIC">Hôpitaux</option>
          <option value="CLINIQUE">Cliniques</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <div key={i} className="card animate-pulse h-28 bg-gray-100" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {posts.length === 0 && <p className="text-center text-gray-400 py-12">Aucune actualité disponible.</p>}
          {posts.map((post) => <ActualitePost key={post.id} post={post} />)}
        </div>
      )}

      {data?.pagination?.pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button disabled={page === 1} onClick={() => setPage(p => p-1)} className="btn-secondary text-sm disabled:opacity-40">← Préc.</button>
          <span className="px-4 py-2 text-sm text-gray-600">Page {page}</span>
          <button disabled={page >= data.pagination.pages} onClick={() => setPage(p => p+1)} className="btn-secondary text-sm disabled:opacity-40">Suiv. →</button>
        </div>
      )}
    </div>
  );
}
