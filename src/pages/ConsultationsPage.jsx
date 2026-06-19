// src/pages/ConsultationsPage.jsx — Consultations patient (web)
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp, Stethoscope } from 'lucide-react';
import api from '../utils/api';
import useAuthStore from '../store/authStore';

const SPECIALITES = [
  'Cardiologie','Pédiatrie','Gynécologie','Neurologie','Dermatologie',
  'Ophtalmologie','ORL','Orthopédie','Gastro-entérologie','Endocrinologie',
  'Psychiatrie','Urologie','Autre',
];

const STATUT_CONFIG = {
  EN_ATTENTE: { label:'En attente de médecin', color:'text-orange-600', bg:'bg-orange-50 border-orange-200', icon:<Clock size={14}/> },
  PROPOSEE:   { label:'Proposition reçue ⚡',  color:'text-purple-600', bg:'bg-purple-50 border-purple-200', icon:<Stethoscope size={14}/> },
  ACCEPTEE:   { label:'Confirmée ✅',           color:'text-green-600',  bg:'bg-green-50  border-green-200',  icon:<CheckCircle size={14}/> },
  REFUSEE:    { label:'Refusée',                color:'text-red-500',    bg:'bg-red-50    border-red-200',    icon:<XCircle size={14}/> },
  TERMINEE:   { label:'Terminée',               color:'text-gray-500',   bg:'bg-gray-50   border-gray-200',  icon:<CheckCircle size={14}/> },
};

function ConsultCard({ c, onValider, onRefuser }) {
  const [expanded, setExpanded] = useState(c.statut === 'PROPOSEE');
  const cfg       = STATUT_CONFIG[c.statut] || STATUT_CONFIG.EN_ATTENTE;
  const isProposee = c.statut === 'PROPOSEE';
  const isAcceptee = c.statut === 'ACCEPTEE';

  return (
    <div className={`bg-white rounded-2xl border-l-4 border-t border-r border-b ${cfg.bg} overflow-hidden`}
      style={{ borderLeftColor: isProposee?'#7c3aed':isAcceptee?'#16a34a':c.statut==='EN_ATTENTE'?'#f97316':'#dc2626' }}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
            {cfg.icon} {cfg.label}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString('fr-FR')}</span>
            <button onClick={() => setExpanded(!expanded)} className="text-gray-400 hover:text-gray-600">
              {expanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
            </button>
          </div>
        </div>

        <p className="font-semibold text-gray-900 text-sm">
          {c.typeConsultation==='GENERALISTE' ? '👨‍⚕️ Médecine générale' : `🩺 Spécialiste${c.specialite ? ` — ${c.specialite}` : ''}`}
        </p>
        {c.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2 italic">"{c.description}"</p>}

        {expanded && (
          <div className="mt-3 space-y-3">
            {/* Proposition médecin à valider */}
            {isProposee && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <p className="text-xs font-bold text-purple-700 mb-2 uppercase tracking-wider">💬 Proposition du médecin</p>
                {c.medecinPrenom && <p className="font-semibold text-sm text-purple-800">Dr. {c.medecinPrenom} {c.medecinNom||''}</p>}
                {c.medecinSpecialite && <p className="text-xs text-purple-600 mt-0.5">🩺 {c.medecinSpecialite}</p>}
                {c.lieu && (
                 <p className="text-sm text-gray-700 mt-1 font-medium">
                  📍 {c.lieu==='DOMICILE' ? 'À votre domicile' : 'Au cabinet'}
                 </p>
                )}
                {c.lieu === 'CABINET' && c.nomCabinet && (
                 <p className="text-sm text-gray-700">🏥 {c.nomCabinet}</p>
                )}
                {c.lieu === 'CABINET' && c.quartierCabinet && (
                 <p className="text-sm text-gray-700">🏘️ Quartier : {c.quartierCabinet}</p>
                )}
                {c.dateProposee && (
                  <p className="text-sm text-gray-700 mt-0.5">
                    📅 {c.dateProposee}{c.heureProposee ? ` à ${c.heureProposee}` : ''}
                  </p>
                )}
                {c.prix && (
                  <p className="text-sm font-bold text-green-700 mt-0.5">
                    💰 Tarif : {Number(c.prix).toLocaleString()} FCFA
                  </p>
                )}
                <div className="flex gap-3 mt-3">
                  <button onClick={() => onValider(c.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                    <CheckCircle size={15}/> Accepter
                  </button>
                  <button onClick={() => onRefuser(c.id)}
                    className="flex-1 border-2 border-red-400 text-red-500 hover:bg-red-50 font-semibold py-2.5 rounded-xl text-sm transition-colors">
                    Refuser
                  </button>
                </div>
              </div>
            )}

            {/* Consultation confirmée */}
            {isAcceptee && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-1">
                {c.medecinPrenom && <p className="font-semibold text-green-800">Dr. {c.medecinPrenom} {c.medecinNom||''}</p>}
                {c.medecinSpecialite && <p className="text-xs text-green-600">🩺 {c.medecinSpecialite}</p>}
                {c.lieu && (
                 <p className="text-sm text-gray-700 mt-1 font-medium">
                 📍 {c.lieu==='DOMICILE' ? 'À votre domicile' : 'Au cabinet'}
                 </p>
                )}
                {c.lieu === 'CABINET' && c.nomCabinet && (
                 <p className="text-sm text-gray-700">🏥 {c.nomCabinet}</p>
                )}
                {c.lieu === 'CABINET' && c.quartierCabinet && (
                  <p className="text-sm text-gray-700">🏘️ Quartier : {c.quartierCabinet}</p>
                )}
                {c.dateProposee && <p className="text-sm text-gray-700">📅 {c.dateProposee}{c.heureProposee?` à ${c.heureProposee}`:''}</p>}
                {c.prix && <p className="text-sm font-bold text-green-700">💰 {Number(c.prix).toLocaleString()} FCFA</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Formulaire ─────────────────────────────────────────────────
function FormulaireConsultation({ onSuccess, onCancel }) {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const [type, setType]         = useState('');
  const [spec, setSpec]         = useState('');
  const [desc, setDesc]         = useState('');
  const [quartier, setQuartier] = useState(user?.profil?.ville || '');
  const [error, setError]       = useState('');

  const { mutate, isPending } = useMutation({
    mutationFn: () => api.post('/consultations', {
      typeConsultation: type,
      specialite:       type==='SPECIALISTE' ? spec : null,
      description:      desc || null,
      quartierPatient:  quartier || null,
    }),
    onSuccess: () => {
      qc.invalidateQueries(['mes-consultations-web']);
      onSuccess();
    },
    onError: (e) => setError(e.response?.data?.error || 'Erreur lors de la demande'),
  });

  const handleSubmit = () => {
    if (!type) { setError('Choisissez un type de consultation.'); return; }
    if (type==='SPECIALISTE' && !spec) { setError('Choisissez une spécialité.'); return; }
    if (!window.confirm(`Envoyer une demande de consultation${type==='GENERALISTE'?' en médecine générale':` — ${spec}`} ?`)) return;
    mutate();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-gray-900 text-lg">Nouvelle consultation</h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 text-sm">Annuler</button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
      )}

      {/* Type */}
      <p className="text-sm font-semibold text-gray-700 mb-3">Type de consultation *</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        {[
          { val:'GENERALISTE', emoji:'👨‍⚕️', label:'Médecin généraliste', sub:'Consultation de médecine générale' },
          { val:'SPECIALISTE', emoji:'🩺',  label:'Médecin spécialiste', sub:'Cardio, pédiatrie, gynéco...' },
        ].map((t) => (
          <button key={t.val} onClick={() => { setType(t.val); setSpec(''); setError(''); }}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-colors ${
              type===t.val ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-200'
            }`}>
            <span className="text-2xl">{t.emoji}</span>
            <div>
              <p className={`font-semibold text-sm ${type===t.val?'text-primary-700':'text-gray-900'}`}>{t.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t.sub}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Spécialité */}
      {type==='SPECIALISTE' && (
        <div className="mb-5">
          <p className="text-sm font-semibold text-gray-700 mb-2">Spécialité souhaitée *</p>
          <div className="flex flex-wrap gap-2">
            {SPECIALITES.map((sp) => (
              <button key={sp} onClick={() => { setSpec(sp); setError(''); }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  spec===sp ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-primary-300'
                }`}>
                {sp}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1">Décrivez votre problème (optionnel)</label>
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3}
          placeholder="Ex: Fièvre depuis 3 jours, maux de tête..."
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 resize-none"/>
      </div>

      {/* Quartier */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Quartier <span className="text-gray-400 font-normal">(pour consultation à domicile)</span>
        </label>
        <input value={quartier} onChange={(e) => setQuartier(e.target.value)}
          placeholder="Ex: Bastos, Omnisport, Akwa..."
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"/>
      </div>

      <div className="bg-primary-50 border border-primary-200 rounded-xl p-3 mb-5 text-xs text-primary-700 leading-relaxed">
        ℹ️ Un médecin vous proposera lieu, date, heure et tarif. Vous devrez valider ou refuser sa proposition.
      </div>

      <button onClick={handleSubmit} disabled={isPending || !type || (type==='SPECIALISTE'&&!spec)}
        className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
        {isPending ? 'Envoi en cours...' : '📤 Envoyer la demande'}
      </button>
    </div>
  );
}

export default function ConsultationsPage() {
  const { isAuthenticated } = useAuthStore();
  const qc   = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data: mesData, isLoading } = useQuery({
    queryKey: ['mes-consultations-web'],
    queryFn: async () => { const { data } = await api.get('/consultations/mes'); return data; },
    refetchInterval: 30000,
    enabled: isAuthenticated,
  });

  const { mutate: valider } = useMutation({
    mutationFn: (id) => api.put(`/consultations/${id}/valider`),
    onSuccess: () => {
      qc.invalidateQueries(['mes-consultations-web']);
      window.alert('✅ Consultation confirmée ! Le médecin a été notifié.');
    },
    onError: (e) => window.alert(e.response?.data?.error || 'Erreur'),
  });

  const { mutate: refuserPatient } = useMutation({
    mutationFn: (id) => api.put(`/consultations/${id}/refuser-patient`),
    onSuccess: () => {
      qc.invalidateQueries(['mes-consultations-web']);
      window.alert('Proposition refusée. La demande reste ouverte pour d\'autres médecins.');
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-4xl mb-4">🏥</p>
        <p className="font-bold text-gray-900 text-lg mb-2">Connexion requise</p>
        <p className="text-gray-500 text-sm mb-6">Connectez-vous pour accéder aux consultations médicales</p>
        <Link to="/connexion" className="bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-primary-700 transition-colors inline-block">
          Se connecter
        </Link>
      </div>
    );
  }

  const consultations = mesData?.data || [];
  const nbProposees   = consultations.filter((c) => c.statut==='PROPOSEE').length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Mes consultations</h1>
          <p className="text-sm text-gray-400 mt-0.5">Demandes et réponses des médecins</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
            <Plus size={16}/> Nouvelle
          </button>
        )}
      </div>

      {/* Alerte propositions */}
      {nbProposees > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-5 flex items-center gap-3">
          <span className="text-purple-600">⚡</span>
          <p className="text-sm font-semibold text-purple-700 flex-1">
            {nbProposees} proposition{nbProposees>1?'s':''} de médecin à valider !
          </p>
        </div>
      )}

      {/* Formulaire */}
      {showForm && (
        <div className="mb-6">
          <FormulaireConsultation
            onSuccess={() => { setShowForm(false); }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Liste */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"/>
        </div>
      ) : consultations.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">🏥</p>
          <p className="font-bold text-gray-700 text-lg mb-2">Aucune consultation</p>
          <p className="text-gray-400 text-sm mb-6">Demandez une consultation auprès d'un médecin</p>
          <button onClick={() => setShowForm(true)}
            className="bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-primary-700 transition-colors inline-flex items-center gap-2">
            <Plus size={16}/> Demander une consultation
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {consultations.map((c) => (
            <ConsultCard key={c.id} c={c}
              onValider={(id) => {
                if (window.confirm('Accepter la proposition de ce médecin ?')) valider(id);
              }}
              onRefuser={(id) => {
                if (window.confirm('Refuser cette proposition ? La demande restera ouverte pour d\'autres médecins.')) refuserPatient(id);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
