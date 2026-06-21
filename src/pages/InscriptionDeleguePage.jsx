// src/pages/InscriptionDeleguePage.jsx — Inscription délégué médical (web)
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import api from '../utils/api';
import useAuthStore from '../store/authStore';

export default function InscriptionDeleguePage() {
  const navigate  = useNavigate();
  const { login } = useAuthStore();
  const [step, setStep]     = useState(1); // 1=infos, 2=code
  const [loading, setLoad]  = useState(false);
  const [error, setError]   = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [code, setCode]       = useState('');
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown]   = useState(0);
  const [form, setForm] = useState({
    prenom:'', nom:'', email:'', password:'',
    ville:'', telephone:'', nomLaboratoire:'',
  });

  const set = (f) => (e) => { setForm((p) => ({...p, [f]: e.target.value})); setError(''); };

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleRegister = async () => {
    if (!form.prenom.trim() || !form.nom.trim()) { setError('Prénom et nom requis.'); return; }
    if (!form.nomLaboratoire.trim())             { setError('Le nom du laboratoire est requis.'); return; }
    if (!form.email.includes('@'))               { setError('Email invalide.'); return; }
    if (form.password.length < 8)                { setError('Mot de passe : minimum 8 caractères.'); return; }

    setLoad(true); setError('');
    try {
      await api.post('/delegue/register', {
        email:          form.email.trim().toLowerCase(),
        password:       form.password,
        prenom:         form.prenom.trim(),
        nom:            form.nom.trim(),
        ville:          form.ville.trim(),
        telephone:      form.telephone.trim(),
        nomLaboratoire: form.nomLaboratoire.trim(),
      });
      setStep(2);
      setCooldown(30);
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'inscription");
    } finally {
      setLoad(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code.trim() || code.trim().length < 6) { setError('Entrez le code à 6 chiffres reçu par email.'); return; }
    setLoad(true); setError('');
    try {
      const { data } = await api.post('/delegue/verify-email', {
        email: form.email.trim().toLowerCase(),
        code:  code.trim(),
      });
      login(data.user, data.token);
      navigate('/delegue/mon-compte');
    } catch (err) {
      setError(err.response?.data?.error || 'Code invalide ou expiré');
    } finally {
      setLoad(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true); setError('');
    try {
      await api.post('/delegue/resend-code', { email: form.email.trim().toLowerCase() });
      setCooldown(30);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du renvoi');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-primary-600 flex items-center justify-center">
              <span className="text-white font-black">AZ</span>
            </div>
            <span className="text-2xl font-black text-primary-600">AZAMED</span>
          </Link>
          <span className="inline-block mt-3 text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
            💼 Délégué médical
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-6">
            {step === 2 ? 'Vérifiez votre email' : 'Créer un compte délégué'}
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-3 text-xs text-primary-700 leading-relaxed">
                En tant que délégué médical, vous pourrez proposer de nouveaux médicaments
                pour le catalogue AZAMED. Chaque proposition sera validée par notre équipe.
              </div>

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
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nom du laboratoire *</label>
                <input value={form.nomLaboratoire} onChange={set('nomLaboratoire')} placeholder="Ex: Laboratoire Pharma Cameroun"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"/>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Ville</label>
                <input value={form.ville} onChange={set('ville')} placeholder="Yaoundé, Douala..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"/>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Téléphone</label>
                <input value={form.telephone} onChange={set('telephone')} placeholder="+237 6XX XX XX XX" type="tel"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"/>
              </div>

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
              </div>

              <button onClick={handleRegister} disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
                {loading ? 'Envoi du code...' : '📧 Recevoir le code'}
              </button>

              <p className="text-center text-sm text-gray-500">
                Déjà inscrit ?{' '}
                <Link to="/delegue/connexion" className="text-primary-600 font-semibold hover:underline">Se connecter</Link>
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center mx-auto">
                <span className="text-3xl">📧</span>
              </div>
              <p className="text-sm text-gray-500">
                Un code à 6 chiffres a été envoyé à<br/>
                <span className="font-bold text-gray-900">{form.email}</span>
              </p>

              <div className="text-left">
                <label className="block text-xs font-semibold text-gray-600 mb-1 text-center">Code de vérification</label>
                <input value={code} onChange={(e) => { setCode(e.target.value); setError(''); }}
                  placeholder="000000" maxLength={6} inputMode="numeric"
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl text-center text-2xl font-black tracking-[0.3em] focus:outline-none focus:border-primary-400"/>
              </div>

              <button onClick={handleVerifyCode} disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
                {loading ? 'Vérification...' : '✓ Valider et créer mon compte'}
              </button>

              <button onClick={handleResendCode} disabled={resending || cooldown > 0}
                className="text-sm font-semibold text-primary-600 hover:underline disabled:text-gray-400 disabled:no-underline">
                {cooldown > 0 ? `Renvoyer le code (${cooldown}s)` : resending ? 'Envoi...' : 'Renvoyer le code'}
              </button>

              <button onClick={() => setStep(1)} className="block w-full text-sm text-gray-400 hover:text-gray-600">
                ← Modifier mes informations
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
