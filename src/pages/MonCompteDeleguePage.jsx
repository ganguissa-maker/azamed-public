// src/pages/MonCompteDeleguePage.jsx — Espace délégué : propose médicaments (web)
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X, Clock, CheckCircle, XCircle, LogOut, Building2, MapPin } from 'lucide-react';
import api from '../utils/api';
import useAuthStore from '../store/authStore';

const STATUT_CONFIG = {
  EN_ATTENTE: { label:'En attente', color:'text-orange-600', bg:'bg-orange-50 border-orange-200', icon:<Clock size={13}/> },
  VALIDE:     { label:'Valide',     color:'text-green-600',  bg:'bg-green-50  border-green-200',  icon:<CheckCircle size={13}/> },
  REFUSE:     { label:'Refuse',     color:'text-red-500',    bg:'bg-red-50    border-red-200',    icon:<XCircle size={13}/> },
};

function MedicamentCard({ m }) {
  const cfg = STATUT_CONFIG[m.statut] || STATUT_CONFIG.EN_ATTENTE;
  return (
    <div className={`bg-white rounded-2xl border-l-4 border-t border-r border-b ${cfg.bg} p-4`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
          {cfg.icon} {cfg.label}
        </span>
        <span className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleDateString('fr-FR')}</span>
      </div>
      <p className="font-bold text-gray-900 text-sm">💊 {m.nomCommercial}</p>
      {(m.dci || m.forme || m.dosage) && (
        <p className="text-xs text-gray-500 mt-0.5">{[m.dci, m.forme, m.dosage].filter(Boolean).join(' · ')}</p>
      )}
      {m.classeTherapeutique && <p className="text-xs text-primary-600 font-medium mt-1">{m.classeTherapeutique}</p>}
      {m.statut === 'REFUSE' && m.motifRefus && (
        <div className="bg-red-50 rounded-lg p-2 mt-2">
          <p className="text-xs text-red-600">Motif : {m.motifRefus}</p>
        </div>
      )}
    </div>
  );
}

function FormulaireMedicament({ onSuccess, onCancel }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ nomCommercial:'', dci:'', forme:'', dosage:'', classeTherapeutique:'' });
  const [error, setError] = useState('');

  const { mutate, isPending } = useMutation({
    mutationFn: () => api.post('/delegue/medicaments', form),
    onSuccess: () => {
      qc.invalidateQueries(['mes-medicaments-delegue-web']);
      onSuccess();
    },
    onError: (e) => setError(e.response?.data?.error || 'Erreur lors de la proposition'),
  });

  const set = (f) => (e) => { setForm((p) => ({...p, [f]: e.target.value})); setError(''); };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold text-gray-900 text-lg">Nouveau medicament</h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Nom commercial *</label>
          <input value={form.nomCommercial} onChange={set('nomCommercial')} placeholder="Ex: Doliprane"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"/>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">DCI (denomination commune)</label>
          <input value={form.dci} onChange={set('dci')} placeholder="Ex: Paracetamol"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"/>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Forme</label>
            <input value={form.forme} onChange={set('forme')} placeholder="Comprime, Sirop..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Dosage</label>
            <input value={form.dosage} onChange={set('dosage')} placeholder="Ex: 500mg"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"/>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Classe therapeutique</label>
          <input value={form.classeTherapeutique} onChange={set('classeTherapeutique')} placeholder="Ex: Antalgique"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"/>
        </div>

        <div className="bg-primary-50 border border-primary-200 rounded-xl p-3 text-xs text-primary-700">
          Ce medicament sera ajoute au catalogue apres validation par AZAMED.
        </div>

        <button onClick={() => mutate()} disabled={!form.nomCommercial.trim() || isPending}
          className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
          {isPending ? 'Envoi...' : 'Envoyer la proposition'}
        </button>
      </div>
    </div>
  );
}

export default function MonCompteDeleguePage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['mes-medicaments-delegue-web'],
    queryFn: async () => { const { data } = await api.get('/delegue/medicaments/mes'); return data; },
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-4xl mb-4">💼</p>
        <p className="font-bold text-gray-900 text-lg mb-2">Non connecte</p>
        <Link to="/delegue/connexion" className="bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-primary-700 transition-colors inline-block mt-4">
          Se connecter
        </Link>
      </div>
    );
  }

  const profil = user.profil || {};
  const medicaments = data?.data || [];
  const enAttente = medicaments.filter((m) => m.statut === 'EN_ATTENTE').length;
  const valides   = medicaments.filter((m) => m.statut === 'VALIDE').length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Profil */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center shrink-0 text-2xl">💼</div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900">{profil.prenom} {profil.nom}</p>
          <p className="text-sm text-gray-400">{user.email}</p>
          <div className="flex gap-2 mt-2 flex-wrap">
            <span className="text-xs font-semibold px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full">Delegue medical</span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${user.isVerified ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-600'}`}>
              {user.isVerified ? 'Verifie' : 'En attente'}
            </span>
          </div>
        </div>
      </div>

      {profil.nomLaboratoire && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4 flex flex-wrap gap-4">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-purple-700">
            <Building2 size={14}/> {profil.nomLaboratoire}
          </span>
          {profil.ville && (
            <span className="flex items-center gap-1.5 text-sm text-gray-600">
              <MapPin size={13}/> {profil.ville}
            </span>
          )}
        </div>
      )}

      {!user.isVerified && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4 text-sm text-orange-700">
          Votre compte delegue est en cours de verification par AZAMED.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{medicaments.length}</p>
          <p className="text-xs text-gray-400 mt-1">Propositions</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-orange-500">{enAttente}</p>
          <p className="text-xs text-gray-400 mt-1">En attente</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{valides}</p>
          <p className="text-xs text-gray-400 mt-1">Valides</p>
        </div>
      </div>

      {!showForm && (
        <button onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors mb-6">
          <Plus size={16}/> Proposer un medicament
        </button>
      )}

      {showForm && (
        <div className="mb-6">
          <FormulaireMedicament onSuccess={() => setShowForm(false)} onCancel={() => setShowForm(false)}/>
        </div>
      )}

      <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Mes propositions</h2>
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"/>
        </div>
      ) : medicaments.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-3xl mb-3">💊</p>
          <p className="text-sm">Aucune proposition pour le moment</p>
        </div>
      ) : (
        <div className="space-y-3">
          {medicaments.map((m) => <MedicamentCard key={m.id} m={m}/>)}
        </div>
      )}

      <button onClick={() => { logout(); navigate('/'); }}
        className="w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-700 py-3 text-sm font-semibold transition-colors mt-6">
        <LogOut size={16}/> Se deconnecter
      </button>
    </div>
  );
}
