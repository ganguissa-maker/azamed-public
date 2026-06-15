// src/pages/ResetPasswordPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import api from '../utils/api';

export default function ResetPasswordPage() {
  const navigate      = useNavigate();
  const [step, setStep]     = useState(1);
  const [email, setEmail]   = useState('');
  const [code, setCode]     = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) { setError('Email invalide.'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/users/forgot-password', { email: email.trim().toLowerCase() });
      setSuccess(`Un code a été envoyé à ${email} (vérifiez aussi vos spams).`);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!code.trim())     { setError('Entrez le code reçu.'); return; }
    if (newPwd.length<8)  { setError('Mot de passe : minimum 8 caractères.'); return; }
    if (newPwd !== confirm){ setError('Les mots de passe ne correspondent pas.'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/users/reset-password', {
        email:       email.trim().toLowerCase(),
        code:        code.trim(),
        newPassword: newPwd,
      });
      navigate('/connexion', { state: { message: '✅ Mot de passe modifié. Vous pouvez vous connecter.' } });
    } catch (err) {
      setError(err.response?.data?.error || 'Code invalide ou expiré');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center mx-auto mb-4">
            <Lock size={28} className="text-primary-600"/>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Mot de passe oublié</h1>
          <p className="text-sm text-gray-500 mt-1">
            {step===1 ? 'Entrez votre email pour recevoir un code' : `Code envoyé à ${email}`}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-4">{success}</div>
          )}

          {step===1 ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Adresse email</label>
                <input type="email" value={email} onChange={(e)=>{setEmail(e.target.value);setError('');}}
                  placeholder="votre@email.com"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"/>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
                {loading ? 'Envoi...' : '📧 Recevoir le code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Code reçu par email</label>
                <input type="text" value={code} onChange={(e)=>{setCode(e.target.value);setError('');}}
                  placeholder="123456" maxLength={6}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-center text-xl tracking-widest font-bold focus:outline-none focus:border-primary-400"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Nouveau mot de passe <span className="text-gray-400 font-normal">(min. 8 car.)</span>
                </label>
                <input type="password" value={newPwd} onChange={(e)=>{setNewPwd(e.target.value);setError('');}}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Confirmer</label>
                <input type="password" value={confirm} onChange={(e)=>{setConfirm(e.target.value);setError('');}}
                  placeholder="••••••••"
                  className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none ${
                    confirm && newPwd!==confirm ? 'border-red-400' : 'border-gray-200 focus:border-primary-400'
                  }`}/>
                {confirm && newPwd===confirm && newPwd.length>=8 && (
                  <p className="text-xs text-green-600 mt-1 font-medium">✓ Mots de passe identiques</p>
                )}
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
                {loading ? 'Réinitialisation...' : '✅ Réinitialiser le mot de passe'}
              </button>
              <button type="button" onClick={() => { setStep(1); setCode(''); setError(''); setSuccess(''); }}
                className="w-full text-center text-sm text-primary-600 hover:underline py-1">
                Renvoyer un nouveau code
              </button>
            </form>
          )}
        </div>

        <div className="text-center mt-6 space-y-2">
          <Link to="/connexion" className="block text-sm text-primary-600 hover:underline">← Retour à la connexion</Link>
          <p className="text-xs text-gray-400">contactazamed98@gmail.com</p>
        </div>
      </div>
    </div>
  );
}
