// src/pages/ConnexionDeleguePage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import api from '../utils/api';
import useAuthStore from '../store/authStore';

export default function ConnexionDeleguePage() {
  const navigate  = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim())    { setError('Entrez votre email.'); return; }
    if (!password.trim()) { setError('Entrez votre mot de passe.'); return; }
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/delegue/login', {
        email: email.trim().toLowerCase(), password,
      });
      login(data.user, data.token);
      navigate('/delegue/mon-compte');
    } catch (err) {
      setError(err.response?.data?.error || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
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
            Delegue medical
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-6">Se connecter</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="votre@email.com" autoComplete="email"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"/>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Mot de passe</label>
              <div className="relative">
                <input type={showPwd?'text':'password'} value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="********" autoComplete="current-password"
                  className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"/>
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200"/>
            <span className="text-xs text-gray-400">ou</span>
            <div className="flex-1 h-px bg-gray-200"/>
          </div>

          <Link to="/delegue/inscription"
            className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl text-sm transition-colors">
            Creer un compte delegue
          </Link>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">contactazamed98@gmail.com</p>
      </div>
    </div>
  );
}
