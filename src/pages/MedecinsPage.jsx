// src/pages/MedecinsPage.jsx — Médecins vérifiés visibles au public
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, MapPin, CheckCircle, Phone, MessageCircle, Stethoscope } from 'lucide-react';
import api from '../utils/api';

const SPECIALITES = [
  'Médecine Générale','Cardiologie','Pédiatrie','Gynécologie-Obstétrique',
  'Chirurgie Générale','Neurologie','Dermatologie','Ophtalmologie','ORL',
  'Orthopédie','Gastro-entérologie','Pneumologie','Endocrinologie',
  'Urologie','Psychiatrie','Radiologie','Infectiologie','Médecine Interne',
  'Hématologie','Oncologie','Rhumatologie','Autre',
];

function MedecinCard({ medecin }) {
  const profil = medecin.profil;
  return (
    <div className="card hover:shadow-md transition-all hover:-translate-y-0.5">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        {profil?.avatarUrl ? (
          <img src={profil.avatarUrl} alt={`Dr. ${profil.prenom} ${profil.nom}`}
            className="w-14 h-14 rounded-2xl object-cover shrink-0"/>
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
            <span className="text-blue-700 font-bold text-xl">
              {profil?.prenom?.charAt(0)}{profil?.nom?.charAt(0)}
            </span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-gray-900 text-base">
              Dr. {profil?.prenom} {profil?.nom}
            </h3>
            <CheckCircle size={14} className="text-primary-500 shrink-0"/>
          </div>

          {profil?.specialite && (
            <div className="flex items-center gap-1.5 mt-1">
              <Stethoscope size={12} className="text-blue-500 shrink-0"/>
              <span className="text-sm text-blue-600 font-medium">{profil.specialite}</span>
            </div>
          )}

          {profil?.lieuExercice && (
            <p className="text-xs text-gray-500 mt-1">{profil.lieuExercice}</p>
          )}

          {profil?.ville && (
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
              <MapPin size={11}/>
              <span>{profil.ville}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions contact */}
      <div className="flex gap-2 mt-4 pt-3 border-t border-gray-50">
        {medecin.telephone && (
          <a href={`tel:${medecin.telephone}`}
            className="flex items-center gap-1.5 text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors">
            <Phone size={11}/> Appeler
          </a>
        )}
        {medecin.whatsapp && (
          <a href={`https://wa.me/${medecin.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors">
            <MessageCircle size={11}/> WhatsApp
          </a>
        )}
        <Link to={`/medecins/${medecin.id}`} className="ml-auto text-xs font-medium text-primary-600 hover:underline self-center">
          Voir le profil →
        </Link>
      </div>
    </div>
  );
}

export default function MedecinsPage() {
  const [search, setSearch]         = useState('');
  const [specialite, setSpecialite] = useState('');
  const [ville, setVille]           = useState('');
  const [page, setPage]             = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['medecins', search, specialite, ville, page],
    queryFn: async () => {
      const p = new URLSearchParams({ page, limit: 12, role: 'MEDECIN', verified: 'true' });
      if (search)     p.set('search', search);
      if (specialite) p.set('specialite', specialite);
      if (ville)      p.set('ville', ville);
      const { data } = await api.get(`/users/medecins?${p}`);
      return data;
    },
  });

  const medecins = data?.data || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Médecins</h1>
        <p className="text-gray-500 text-sm">
          {data?.pagination?.total || 0} médecin(s) vérifié(s) sur AZAMED
        </p>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input type="text" placeholder="Nom du médecin..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"/>
        </div>
        <select value={specialite} onChange={(e) => { setSpecialite(e.target.value); setPage(1); }}
          className="sm:w-52 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400">
          <option value="">Toutes spécialités</option>
          {SPECIALITES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input type="text" placeholder="Ville..." value={ville}
          onChange={(e) => { setVille(e.target.value); setPage(1); }}
          className="sm:w-36 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"/>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse h-36 bg-gray-100"/>
          ))}
        </div>
      ) : medecins.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Stethoscope size={48} className="mx-auto mb-3 opacity-30"/>
          <p className="font-medium text-gray-500">Aucun médecin trouvé</p>
          <p className="text-sm mt-1">Modifiez vos critères de recherche</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {medecins.map((m) => <MedecinCard key={m.id} medecin={m}/>)}
        </div>
      )}

      {data?.pagination?.pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="btn-secondary text-sm disabled:opacity-40">← Préc.</button>
          <span className="px-4 py-2 text-sm text-gray-600">Page {page} / {data.pagination.pages}</span>
          <button disabled={page >= data.pagination.pages} onClick={() => setPage(p => p + 1)}
            className="btn-secondary text-sm disabled:opacity-40">Suiv. →</button>
        </div>
      )}
    </div>
  );
}
