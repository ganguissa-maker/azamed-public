// src/pages/InscriptionPage.jsx — Création de compte (web)
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import api from '../utils/api';
import useAuthStore from '../store/authStore';

const SPECIALITES = [
  'Médecine Générale','Cardiologie','Pédiatrie','Gynécologie','Chirurgie',
  'Neurologie','Dermatologie','Ophtalmologie','ORL','Orthopédie',
  'Gastro-entérologie','Endocrinologie','Psychiatrie','Urologie','Autre',
];

function PwdStrength({ pwd }) {
  if (!pwd) return null;
  const score = pwd.length >= 8
    ? pwd.length >= 10 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd) ? 3
      : pwd.length >= 10 ? 2 : 1
    : 0;
  const levels = [
    { label:'Trop court', color:'bg-red-400',    w:'w-1/4' },
    { label:'Faible',     color:'bg-orange-400',  w:'w-2/4' },
    { label:'Moyen',      color:'bg-yellow-400',  w:'w-3/4' },
    { label:'Fort ✓',     color:'bg-green-500',   w:'w-full' },
  ];
  const lvl = levels[score];
  return (
    <div className="mt-1.5">
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${lvl.color} ${lvl.w}`}/>
      </div>
      <p className={`text-xs mt-1 font-medium ${score===3?'text-green-600':score===2?'text-yellow-600':score===1?'text-orange-500':'text-red-500'}`}>
        {lvl.label}
      </p>
    </div>
  );
}

export default function InscriptionPage() {
  const navigate  = useNavigate();
  const { login } = useAuthStore();
  const [step, setStep]     = useState(1); // 1=type, 2=infos
  const [mode, setMode]     = useState('');
  const [loading, setLoad]  = useState(false);
  const [error, setError]   = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({
    prenom:'', nom:'', email:'', password:'',
    ville:'', telephone:'', specialite:'', numeroOrdre:'', lieuExercice:'',
  });

  const set = (f) => (e) => { setForm((p) => ({...p, [f]: e.target.value})); setError(''); };
  const setVal = (f, v) => { setForm((p) => ({...p, [f]: v})); setError(''); };

  // Étape 2 → crée le compte directement et connecte l'utilisateur
  const handleRegister = async () => {
    if (!form.prenom.trim() || !form.nom.trim()) { setError('Prénom et nom requis.'); return; }
    if (!form.email.includes('@'))               { setError('Email invalide.'); return; }
    if (form.password.length < 8)               { setError('Mot de passe : minimum 8 caractères.'); return; }
    if (mode==='medecin' && !form.specialite)   { setError('Choisissez une spécialité.'); return; }

    setLoad(true); setError('');
    try {
      const { data } = await api.post('/users/register', {
        email:        form.email.trim().toLowerCase(),
        password:     form.password,
        prenom:       form.prenom.trim(),
        nom:          form.nom.trim(),
        ville:        form.ville.trim(),
        telephone:    form.telephone.trim(),
        specialite:   form.specialite,
        numeroOrdre:  form.numeroOrdre.trim(),
        lieuExercice: form.lieuExercice.trim(),
        typeCompte:   mode === 'medecin' ? 'MEDECIN' : 'PATIENT',
      });
      login(data.user, data.token);
      navigate('/mon-compte');
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'inscription");
    } finally {
      setLoad(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-primary-600 flex items-center justify-center">
              <span className="text-white font-black">AZ</span>
            </div>
            <span className="text-2xl font-black text-primary-600">AZAMED</span>
          </Link>
          <p className="text-gray-500 text-sm mt-2">Annuaire Santé Cameroun 🇨🇲</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-6">Créer un compte</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          {/* Étape 1 : Type de compte */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700 mb-3">Je suis :</p>
              {[
                { val:'utilisateur', emoji:'👤', label:'Simple utilisateur', sub:'Patient, grand public — accès gratuit' },
                { val:'medecin',     emoji:'👨‍⚕️', label:'Médecin',           sub:'Professionnel de santé vérifié' },
              ].map((t) => (
                <button key={t.val} onClick={() => setMode(t.val)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-colors ${
                    mode===t.val
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-200'
                  }`}>
                  <span className="text-2xl">{t.emoji}</span>
                  <div className="flex-1">
                    <p className={`font-semibold text-sm ${mode===t.val?'text-primary-700':'text-gray-900'}`}>{t.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{t.sub}</p>
                  </div>
                  {mode===t.val && <CheckCircle size={18} className="text-primary-600 shrink-0"/>}
                </button>
              ))}

              <button
                onClick={() => { if(!mode){setError('Choisissez un type de compte.'); return;} setError(''); setStep(2); }}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl mt-4 transition-colors">
                Continuer →
              </button>

              <p className="text-center text-sm text-gray-500 mt-4">
                Déjà inscrit ?{' '}
                <Link to="/connexion" className="text-primary-600 font-semibold hover:underline">Se connecter</Link>
              </p>
            </div>
          )}

          {/* Étape 2 : Informations */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Prénom *</label>
                  <input value={form.prenom} onChange={set('prenom')} placeholder="Jean"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Nom *</label>
                  <input value={form.nom} onChange={set('nom')} placeholder="Dupont"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"/>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Ville *</label>
                <input value={form.ville} onChange={set('ville')} placeholder="Yaoundé, Douala..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"/>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Téléphone</label>
                <input value={form.telephone} onChange={set('telephone')} placeholder="+237 6XX XX XX XX" type="tel"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"/>
              </div>

              {mode === 'medecin' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Spécialité *</label>
                    <div className="flex flex-wrap gap-2">
                      {SPECIALITES.map((sp) => (
                        <button key={sp} onClick={() => setVal('specialite', sp)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                            form.specialite===sp
                              ? 'bg-primary-600 border-primary-600 text-white'
                              : 'bg-white border-gray-200 text-gray-600 hover:border-primary-300'
                          }`}>
                          {sp}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Lieu d'exercice</label>
                    <input value={form.lieuExercice} onChange={set('lieuExercice')} placeholder="Ex: Clinique La Grâce, Yaoundé"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"/>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">N° Ordre des médecins</label>
                    <input value={form.numeroOrdre} onChange={set('numeroOrdre')} placeholder="Ex: ONC-CM-2024-xxx"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"/>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email *</label>
                <input value={form.email} onChange={set('email')} type="email" placeholder="votre@email.com"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"/>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Mot de passe * <span className="text-gray-400 font-normal">(min. 8 caractères)</span>
                </label>
                <div className="relative">
                  <input value={form.password} onChange={set('password')} type={showPwd?'text':'password'} placeholder="••••••••"
                    className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"/>
                  <button onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
                <PwdStrength pwd={form.password}/>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(1)}
                  className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">
                  ← Retour
                </button>
                <button onClick={handleRegister} disabled={loading}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
                  {loading ? 'Création...' : '✓ Créer mon compte'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
