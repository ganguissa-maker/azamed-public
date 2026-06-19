// src/pages/TableauDeBordMedecinPage.jsx — Prix fixes, date/heure uniquement
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Send, X, Phone, MapPin } from 'lucide-react';
import api from '../utils/api';
import useAuthStore from '../store/authStore';

// ✅ Grille tarifaire fixe
const TARIFS = {
  GENERALISTE: { CABINET: 5000,  DOMICILE: 10000 },
  SPECIALISTE: { CABINET: 15000, DOMICILE: 20000 },
};

const STATUT_CONFIG = {
  EN_ATTENTE: { label:'En attente',    color:'text-orange-600', bg:'bg-orange-50  border-orange-200' },
  PROPOSEE:   { label:'Proposée',      color:'text-purple-600', bg:'bg-purple-50  border-purple-200' },
  ACCEPTEE:   { label:'Confirmée ✅',  color:'text-green-600',  bg:'bg-green-50   border-green-200'  },
  REFUSEE:    { label:'Refusée',       color:'text-red-500',    bg:'bg-red-50     border-red-200'    },
  TERMINEE:   { label:'Terminée',      color:'text-gray-500',   bg:'bg-gray-50    border-gray-200'   },
};

// ── Modal proposition ─────────────────────────────────────────
function ModalProposer({ consultation, onClose, onConfirm, loading }) {
  const [lieu, setLieu]                       = useState('');
  const [date, setDate]                       = useState('');
  const [heure, setHeure]                     = useState('');
  const [nomCabinet, setNomCabinet]           = useState('');
  const [quartierCabinet, setQuartierCabinet] = useState('');

  // ✅ Tarif calculé automatiquement
  const tarif = lieu ? (TARIFS[consultation.typeConsultation]?.[lieu] ?? null) : null;
  const cabinetValide = lieu !== 'CABINET' || (nomCabinet.trim().length > 0 && quartierCabinet.trim().length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg">Proposer une consultation</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Infos patient */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">👤 Patient</p>
            {(consultation.patientPrenom||consultation.patientNom) && (
              <p className="font-semibold text-blue-800">{consultation.patientPrenom||''} {consultation.patientNom||''}</p>
            )}
            {consultation.patientVille && (
              <p className="text-sm text-blue-700 flex items-center gap-1 mt-0.5"><MapPin size={12}/>{consultation.patientVille}</p>
            )}
            {consultation.quartierPatient && (
              <p className="text-sm text-blue-700 mt-0.5">🏘️ Quartier : {consultation.quartierPatient}</p>
            )}
            {/* ✅ Téléphone NON affiché avant validation */}
          </div>

          <p className="font-semibold text-sm text-gray-700">
            {consultation.typeConsultation==='GENERALISTE' ? '👨‍⚕️ Médecine générale' : `🩺 ${consultation.specialite||'Spécialiste'}`}
          </p>
          {consultation.description && (
            <p className="text-sm text-gray-500 italic">"{consultation.description}"</p>
          )}

          {/* Lieu */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Lieu de la consultation *</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { val:'CABINET',  emoji:'🏥', label:'Mon cabinet' },
                { val:'DOMICILE', emoji:'🏠', label:'Domicile patient' },
              ].map((l) => (
                <button key={l.val} onClick={() => setLieu(l.val)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                    lieu===l.val ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-200'
                  }`}>
                  <span className="text-2xl">{l.emoji}</span>
                  <span className={`text-sm font-semibold ${lieu===l.val?'text-primary-700':'text-gray-700'}`}>{l.label}</span>
                </button>
              ))}
            </div>

            {/* ✅ Tarif fixe affiché en lecture seule */}
            {lieu && tarif !== null && (
              <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-green-600 mb-0.5">💰 Tarif AZAMED appliqué</p>
                  <p className="text-2xl font-black text-green-700">{tarif.toLocaleString()} FCFA</p>
                </div>
                <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">Tarif fixe</span>
              </div>
            )}

            {lieu==='DOMICILE' && consultation.quartierPatient && (
              <div className="mt-2 bg-primary-50 border border-primary-200 rounded-lg px-3 py-2 flex items-center gap-2 text-sm text-primary-700">
                <MapPin size={13}/> Quartier patient : {consultation.quartierPatient}
              </div>
            )}

            {/* ✅ Si CABINET : nom de la structure + quartier obligatoires */}
            {lieu === 'CABINET' && (
              <div className="mt-3 bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                <p className="text-sm font-semibold text-gray-700">📍 Lieu du cabinet</p>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Nom de la structure sanitaire *</label>
                  <input type="text" value={nomCabinet} onChange={(e) => setNomCabinet(e.target.value)}
                    placeholder="Ex: Cabinet médical Saint-Joseph"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Quartier *</label>
                  <input type="text" value={quartierCabinet} onChange={(e) => setQuartierCabinet(e.target.value)}
                    placeholder="Ex: Bastos, Yaoundé"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"/>
                </div>
              </div>
            )}
          </div>

          {/* Date + Heure */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Date proposée</label>
              <input type="text" value={date} onChange={(e)=>setDate(e.target.value)}
                placeholder="Ex: 20/06/2026"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"/>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Heure</label>
              <input type="text" value={heure} onChange={(e)=>setHeure(e.target.value)}
                placeholder="Ex: 10:00"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"/>
            </div>
          </div>

          <p className="text-xs text-gray-400 italic">
            ℹ️ Le tarif est fixé par AZAMED selon le type et le lieu. Le patient verra ce tarif avant de valider.
          </p>
        </div>

        <div className="p-5 border-t border-gray-100 flex gap-3">
          <button onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50">
            Annuler
          </button>
          <button
            onClick={() => onConfirm({
              lieu, dateProposee:date||null, heureProposee:heure||null,
              nomCabinet: lieu==='CABINET' ? nomCabinet.trim() : null,
              quartierCabinet: lieu==='CABINET' ? quartierCabinet.trim() : null,
            })}
            disabled={!lieu || !cabinetValide || loading}
            className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
            {loading ? 'Envoi...' : <><Send size={15}/> Envoyer la proposition</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Carte consultation ─────────────────────────────────────────
function ConsultCard({ c, medecinId, onProposer, onRefuser, onTerminer }) {
  const cfg       = STATUT_CONFIG[c.statut] || STATUT_CONFIG.EN_ATTENTE;
  const enAttente = c.statut === 'EN_ATTENTE';
  const proposee  = c.statut === 'PROPOSEE' && c.medecinId === medecinId;
  // ✅ Téléphone visible UNIQUEMENT si ACCEPTEE
  const acceptee  = c.statut === 'ACCEPTEE' && c.medecinId === medecinId;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
            {cfg.label}
          </span>
          <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString('fr-FR')}</span>
        </div>

        <p className="font-semibold text-gray-900 text-sm mb-1">
          {c.typeConsultation==='GENERALISTE' ? '👨‍⚕️ Médecine générale' : `🩺 ${c.specialite||'Spécialiste'}`}
        </p>

        {(c.patientPrenom||c.patientNom) && (
          <p className="text-sm text-primary-600 font-medium">👤 {c.patientPrenom||''} {c.patientNom||''}</p>
        )}
        {c.patientVille    && <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><MapPin size={10}/>{c.patientVille}</p>}
        {c.quartierPatient && <p className="text-xs text-gray-400 mt-0.5">🏘️ Quartier : {c.quartierPatient}</p>}
        {c.description     && <p className="text-sm text-gray-500 italic mt-1 line-clamp-2">"{c.description}"</p>}

        {/* ✅ Téléphone VISIBLE uniquement après validation patient (ACCEPTEE) */}
        {acceptee && c.patientTel && (
          <a href={`tel:${c.patientTel}`}
            className="inline-flex items-center gap-1.5 mt-2 text-sm text-green-700 font-semibold bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors">
            <Phone size={13}/> Appeler le patient : {c.patientTel}
          </a>
        )}

        {/* Proposition en attente */}
        {proposee && (
          <div className="mt-3 bg-purple-50 border border-purple-200 rounded-xl p-3 space-y-1">
            <p className="text-xs font-bold text-purple-600">⏳ En attente de validation du patient</p>
            {c.lieu && <p className="text-sm text-gray-700">📍 {c.lieu==='DOMICILE'?'À domicile':'Cabinet'}</p>}
            {c.lieu==='CABINET' && c.nomCabinet && <p className="text-sm text-gray-700">🏥 {c.nomCabinet}</p>}
            {c.lieu==='CABINET' && c.quartierCabinet && <p className="text-sm text-gray-700">🏘️ {c.quartierCabinet}</p>}
            {c.dateProposee && <p className="text-sm text-gray-700">📅 {c.dateProposee}{c.heureProposee?` à ${c.heureProposee}`:''}</p>}
            {c.prix && <p className="text-sm font-bold text-green-700">💰 {Number(c.prix).toLocaleString()} FCFA (tarif AZAMED)</p>}
          </div>
        )}

        {/* Consultation confirmée */}
        {acceptee && (
          <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-3 space-y-1">
            {c.lieu && <p className="text-sm text-gray-700 font-medium">📍 {c.lieu==='DOMICILE'?'À domicile':'Cabinet'}</p>}
            {c.lieu==='CABINET' && c.nomCabinet && <p className="text-sm text-gray-700">🏥 {c.nomCabinet}</p>}
            {c.lieu==='CABINET' && c.quartierCabinet && <p className="text-sm text-gray-700">🏘️ {c.quartierCabinet}</p>}
            {c.dateProposee && <p className="text-sm text-gray-700">📅 {c.dateProposee}{c.heureProposee?` à ${c.heureProposee}`:''}</p>}
            {c.prix && <p className="text-sm font-bold text-green-700">💰 {Number(c.prix).toLocaleString()} FCFA</p>}
          </div>
        )}

        {enAttente && (
          <div className="flex gap-3 mt-3">
            <button onClick={() => onProposer(c)}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
              <Send size={14}/> Proposer
            </button>
            <button onClick={() => { if(window.confirm('Refuser cette consultation ?')) onRefuser(c.id); }}
              className="flex-1 border-2 border-red-300 text-red-500 hover:bg-red-50 font-semibold py-2.5 rounded-xl text-sm transition-colors">
              Refuser
            </button>
          </div>
        )}

        {acceptee && (
          <button onClick={() => { if(window.confirm('Marquer comme terminée ?')) onTerminer(c.id); }}
            className="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-2 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
            <CheckCircle size={14}/> Marquer comme terminée
          </button>
        )}
      </div>
    </div>
  );
}

export default function TableauDeBordMedecinPage() {
  const { user, isAuthenticated } = useAuthStore();
  const qc   = useQueryClient();
  const [tab, setTab]   = useState('attente');
  const [modal, setModal] = useState(null);

  const { data: consultData, isLoading } = useQuery({
    queryKey: ['consult-medecin-dash'],
    queryFn: async () => { const { data } = await api.get('/consultations/mes'); return data; },
    refetchInterval: 20000,
    enabled: isAuthenticated && user?.role === 'MEDECIN',
  });

  const { mutate: proposer, isPending: proposing } = useMutation({
    // ✅ On n'envoie PAS de prix — le backend calcule automatiquement
    mutationFn: ({ id, lieu, dateProposee, heureProposee }) =>
      api.put(`/consultations/${id}/accepter`, { lieu, dateProposee, heureProposee }),
    onSuccess: () => {
      qc.invalidateQueries(['consult-medecin-dash']);
      setModal(null);
      window.alert('✅ Proposition envoyée ! Le patient doit valider.');
    },
    onError: (e) => window.alert(e.response?.data?.error || 'Erreur'),
  });

  const { mutate: refuser  } = useMutation({ mutationFn:(id)=>api.put(`/consultations/${id}/refuser`),  onSuccess:()=>qc.invalidateQueries(['consult-medecin-dash']) });
  const { mutate: terminer } = useMutation({ mutationFn:(id)=>api.put(`/consultations/${id}/terminer`), onSuccess:()=>qc.invalidateQueries(['consult-medecin-dash']) });

  if (!isAuthenticated || user?.role !== 'MEDECIN') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-4xl mb-4">👨‍⚕️</p>
        <p className="font-bold text-gray-900 text-lg mb-2">Accès réservé aux médecins</p>
        <Link to="/connexion" className="bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-primary-700 inline-block mt-4">Se connecter</Link>
      </div>
    );
  }

  const all        = consultData?.data || [];
  const enAttente  = all.filter((c) => c.statut === 'EN_ATTENTE');
  const mesCours   = all.filter((c) => ['PROPOSEE','ACCEPTEE'].includes(c.statut) && c.medecinId === user?.id);
  const historique = all.filter((c) => ['TERMINEE','REFUSEE'].includes(c.statut) && c.medecinId === user?.id);
  const tabs = [
    { key:'attente',    label:`En attente (${enAttente.length})`,    color:'#f97316' },
    { key:'cours',      label:`Mes consults (${mesCours.length})`,    color:'#16a34a' },
    { key:'historique', label:`Historique (${historique.length})`,    color:'#6b7280' },
  ];
  const currentList = tab==='attente' ? enAttente : tab==='cours' ? mesCours : historique;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {modal && (
        <ModalProposer consultation={modal} loading={proposing}
          onClose={() => setModal(null)}
          onConfirm={({ lieu, dateProposee, heureProposee }) =>
            proposer({ id:modal.id, lieu, dateProposee, heureProposee })}
        />
      )}

      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Tableau de bord médecin</h1>
          {user?.profil?.specialite && <p className="text-sm text-primary-600 font-semibold">🩺 {user.profil.specialite}</p>}
        </div>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${user?.isVerified?'bg-green-100 text-green-700':'bg-orange-100 text-orange-600'}`}>
          {user?.isVerified ? '✓ Vérifié' : '⏳ En attente'}
        </span>
      </div>

      {/* Info tarifs */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 text-xs text-amber-700 leading-relaxed">
        💡 <strong>Tarifs AZAMED :</strong> Généraliste Cabinet <strong>5 000 FCFA</strong> · Domicile <strong>10 000 FCFA</strong> | Spécialiste Cabinet <strong>15 000 FCFA</strong> · Domicile <strong>20 000 FCFA</strong>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-colors ${tab===t.key?'text-white border-transparent':'bg-white border-gray-200 text-gray-600'}`}
            style={tab===t.key ? { backgroundColor:t.color, borderColor:t.color } : {}}>
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"/>
        </div>
      ) : currentList.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">{tab==='attente'?'⏳':tab==='cours'?'🏥':'📋'}</p>
          <p className="font-bold text-gray-700">{tab==='attente'?'Aucune demande en attente':tab==='cours'?'Aucune consultation active':'Aucun historique'}</p>
          {tab==='attente' && <p className="text-sm text-gray-400 mt-2">Les nouvelles demandes de patients apparaîtront ici</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {currentList.map((c) => (
            <ConsultCard key={c.id} c={c} medecinId={user?.id}
              onProposer={(consult) => setModal(consult)}
              onRefuser={refuser} onTerminer={terminer}/>
          ))}
        </div>
      )}
    </div>
  );
}
