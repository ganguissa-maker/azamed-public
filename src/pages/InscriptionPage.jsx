// src/pages/InscriptionPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import api from '../utils/api';
import useUserStore from '../store/userStore';

const SPECIALITES = [
  'Médecine Générale','Cardiologie','Pédiatrie','Gynécologie-Obstétrique',
  'Chirurgie Générale','Neurologie','Dermatologie','Ophtalmologie','ORL',
  'Orthopédie','Gastro-entérologie','Pneumologie','Endocrinologie',
  'Urologie','Psychiatrie','Radiologie','Infectiologie','Médecine Interne',
  'Hématologie','Oncologie','Rhumatologie','Néphrologie','Autre',
];

// EN DEHORS du composant pour éviter la perte de focus
function Field({ label, name, type, required, placeholder, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input type={type || 'text'} name={name} required={required}
        value={value} onChange={onChange} placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100"/>
    </div>
  );
}

export default function InscriptionPage() {
  const [mode, setMode]         = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [acceptCGU, setAcceptCGU] = useState(false);
  const [form, setForm]         = useState({
    prenom: '', nom: '', email: '', password: '',
    telephone: '', ville: '', pays: 'Cameroun',
    specialite: '', numeroOrdre: '', lieuExercice: '',
  });
  const { login } = useUserStore();
  const navigate  = useNavigate();

  const handleChange = (f) => (e) => {
    const v = e.target.value;
    setForm((p) => ({ ...p, [f]: v }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptCGU) { setError("Vous devez accepter les conditions d'utilisation."); return; }
    if (!mode)      { setError('Choisissez votre type de compte.'); return; }
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/users/register', {
        ...form,
        typeCompte: mode === 'medecin' ? 'MEDECIN' : 'UTILISATEUR',
      });
      login(data.user, data.token);
      navigate('/mon-compte');
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">AZ</span>
            </div>
            <span className="font-extrabold text-2xl text-primary-700">AZAMED</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Créer un compte</h1>
          <p className="text-gray-500 text-sm">Rejoignez la communauté santé AZAMED — Gratuit</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {/* Choix type */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">Je suis :</p>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setMode('utilisateur')}
                className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${mode === 'utilisateur' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <p className="font-semibold text-sm text-gray-900">👤 Simple utilisateur</p>
                <p className="text-xs text-gray-500 mt-0.5">Patient, grand public</p>
              </button>
              <button type="button" onClick={() => setMode('medecin')}
                className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${mode === 'medecin' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <p className="font-semibold text-sm text-gray-900">👨‍⚕️ Médecin</p>
                <p className="text-xs text-gray-500 mt-0.5">Professionnel de santé</p>
              </button>
            </div>
          </div>

          {mode && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Prénom" name="prenom" required placeholder="Jean" value={form.prenom} onChange={handleChange('prenom')}/>
                <Field label="Nom" name="nom" required placeholder="Dupont" value={form.nom} onChange={handleChange('nom')}/>
              </div>

              {mode === 'medecin' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Spécialité <span className="text-red-400">*</span>
                    </label>
                    <select required value={form.specialite} onChange={handleChange('specialite')}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400">
                      <option value="">Choisir une spécialité...</option>
                      {SPECIALITES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="N° Ordre médecins" name="numeroOrdre" placeholder="CM-2024-0001"
                      value={form.numeroOrdre} onChange={handleChange('numeroOrdre')}/>
                    <Field label="Lieu d'exercice" name="lieuExercice" placeholder="CHU Yaoundé"
                      value={form.lieuExercice} onChange={handleChange('lieuExercice')}/>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Field label="Téléphone" name="telephone" placeholder="+237 6XX XX XX XX"
                  value={form.telephone} onChange={handleChange('telephone')}/>
                <Field label="Ville" name="ville" required placeholder="Yaoundé"
                  value={form.ville} onChange={handleChange('ville')}/>
              </div>

              <Field label="Email" name="email" type="email" required placeholder="votre@email.com"
                value={form.email} onChange={handleChange('email')}/>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} required value={form.password}
                    onChange={handleChange('password')} placeholder="Minimum 6 caractères"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 pr-10"/>
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>

              {/* CGU */}
              <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <input type="checkbox" id="cgu" checked={acceptCGU}
                  onChange={(e) => setAcceptCGU(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-primary-600 shrink-0 cursor-pointer"/>
                <label htmlFor="cgu" className="text-xs text-gray-600 leading-relaxed cursor-pointer">
                  J'accepte les{' '}
                  <Link to="/conditions" className="text-primary-600 font-semibold hover:underline">
                    conditions générales d'utilisation
                  </Link>{' '}
                  d'AZAMED et je certifie que les informations fournies sont exactes.
                </label>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-xl">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading || !acceptCGU}
                className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white font-bold py-3.5 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-60">
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Création en cours...</>
                  : <><UserPlus size={18}/> Créer mon compte gratuitement</>}
              </button>
            </form>
          )}

          <div className="mt-5 pt-4 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Déjà inscrit ?{' '}
              <Link to="/connexion" className="text-primary-600 font-semibold hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
