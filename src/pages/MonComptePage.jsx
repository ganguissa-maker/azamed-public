// src/pages/MonComptePage.jsx
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, User, Mail, Phone, MapPin, LogOut, Stethoscope, Award } from 'lucide-react';
import useUserStore from '../store/userStore';

export default function MonComptePage() {
  const { user, isAuthenticated, logout } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) navigate('/connexion');
  }, [isAuthenticated, navigate]);

  if (!user) return null;

  const profil    = user.profil;
  const isMedecin = user.role === 'MEDECIN';

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mon compte</h1>

      {/* Statut vérification — très visible */}
      {user.isVerified ? (
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5 flex items-start gap-4 mb-6">
          <CheckCircle size={28} className="text-green-500 shrink-0 mt-0.5"/>
          <div>
            <p className="font-bold text-green-800 text-base">✓ Compte vérifié</p>
            <p className="text-green-700 text-sm mt-1 leading-relaxed">
              Votre compte a été vérifié par l'équipe AZAMED.
              {isMedecin
                ? ' Votre profil médecin est visible par les patients sur la plateforme.'
                : ' Vous avez accès à toutes les fonctionnalités.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-5 flex items-start gap-4 mb-6">
          <Clock size={28} className="text-orange-500 shrink-0 mt-0.5"/>
          <div>
            <p className="font-bold text-orange-800 text-base">⏳ Vérification en attente</p>
            <p className="text-orange-700 text-sm mt-1 leading-relaxed">
              Votre compte est en cours de vérification par l'équipe AZAMED.
              {isMedecin
                ? ' Une fois vérifié, votre profil sera visible par les patients.'
                : ' La vérification est généralement effectuée sous 24-48h.'}
            </p>
            <p className="text-orange-600 text-xs mt-2">
              Pour accélérer : <a href="mailto:contactazamed@gmail.com" className="font-bold underline">contactazamed@gmail.com</a>
            </p>
          </div>
        </div>
      )}

      {/* Informations profil */}
      <div className="card space-y-4 mb-4">
        <h2 className="font-bold text-gray-900">Mes informations</h2>

        <div className="flex items-center gap-3 py-2 border-b border-gray-50">
          <User size={16} className="text-gray-400 shrink-0"/>
          <div>
            <p className="text-xs text-gray-400">Nom complet</p>
            <p className="font-semibold text-gray-900">{profil?.prenom} {profil?.nom}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 py-2 border-b border-gray-50">
          <Mail size={16} className="text-gray-400 shrink-0"/>
          <div>
            <p className="text-xs text-gray-400">Email</p>
            <p className="font-semibold text-gray-900">{user.email}</p>
          </div>
        </div>

        {profil?.telephone && (
          <div className="flex items-center gap-3 py-2 border-b border-gray-50">
            <Phone size={16} className="text-gray-400 shrink-0"/>
            <div>
              <p className="text-xs text-gray-400">Téléphone</p>
              <p className="font-semibold text-gray-900">{profil.telephone}</p>
            </div>
          </div>
        )}

        {profil?.ville && (
          <div className="flex items-center gap-3 py-2 border-b border-gray-50">
            <MapPin size={16} className="text-gray-400 shrink-0"/>
            <div>
              <p className="text-xs text-gray-400">Ville</p>
              <p className="font-semibold text-gray-900">{profil.ville}, {profil.pays}</p>
            </div>
          </div>
        )}

        {isMedecin && profil?.specialite && (
          <div className="flex items-center gap-3 py-2">
            <Stethoscope size={16} className="text-gray-400 shrink-0"/>
            <div>
              <p className="text-xs text-gray-400">Spécialité médicale</p>
              <p className="font-semibold text-gray-900">{profil.specialite}</p>
              {profil.numeroOrdre  && <p className="text-xs text-gray-500 mt-0.5">N° Ordre : {profil.numeroOrdre}</p>}
              {profil.lieuExercice && <p className="text-xs text-gray-500">Lieu : {profil.lieuExercice}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Type de compte */}
      <div className="card mb-6">
        <p className="text-sm text-gray-500 mb-3">Type de compte</p>
        <div className="flex items-center gap-2 flex-wrap">
          {isMedecin
            ? <span className="flex items-center gap-1.5 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm font-semibold"><Stethoscope size={14}/>Médecin</span>
            : <span className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm font-semibold"><User size={14}/>Utilisateur</span>}
          {user.isVerified
            ? <span className="flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-semibold"><Award size={14}/>Vérifié</span>
            : <span className="bg-orange-100 text-orange-600 px-3 py-1.5 rounded-full text-xs font-medium">En attente de vérification</span>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Link to="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← Retour à l'accueil
        </Link>
        <button onClick={handleLogout}
          className="flex items-center gap-2 text-red-500 hover:text-red-700 text-sm font-medium transition-colors">
          <LogOut size={15}/> Se déconnecter
        </button>
      </div>
    </div>
  );
}
