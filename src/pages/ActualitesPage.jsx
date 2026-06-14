// src/pages/ActualitesPage.jsx
import { useQuery } from '@tanstack/react-query';
import { MapPin } from 'lucide-react';
import api from '../utils/api';

export default function ActualitesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['actualites'],
    queryFn: async () => { const { data } = await api.get('/posts?limit=30'); return data; },
  });

  const posts = data?.data || [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">📰 Actualités santé</h1>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"/>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">📰</p>
          <p className="font-bold text-gray-700">Aucune actualité</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
                  <span className="text-primary-600 font-bold">
                    {(post.structure?.nomCommercial || 'A').charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{post.structure?.nomCommercial}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {post.structure?.ville && (
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <MapPin size={10}/>{post.structure.ville}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{post.contenu}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
