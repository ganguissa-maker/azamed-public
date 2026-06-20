// src/pages/MonComptePage.jsx — Espace compte (patient + médecin)
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  LogOut, ChevronRight, Stethoscope, Pill, TestTube2,
  Building2, BarChart2, Newspaper, AlertCircle, CheckCircle2, Mail, Phone
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../utils/api';

function ActionCard({ icon, title, subtitle, to, onClick, badge, color = 'primary' }) {
  const colors = {
    primary: 'bg-primary-50 text-primary-600',
    green:   'bg-green-50   text-green-700',
    purple:  'bg-purple-50  text-purple-700',
    orange:  'bg-orange-50  text-orange-600',
    red:     'bg-red-50     text-red-600',
    blue:    'bg-blue-50    text-blue-700',
    gray:    'bg-gray-100   text-gray-500',
  };
  const content = (
    <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-4 hover:border-primary-200 hover:shadow-sm transition-all group">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colors[color]}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-900">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {badge != null && badge > 0 && (
        <span className="min-w-[22px] h-[22px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1.5">
          {badge}
        </span>
      )}
      <ChevronRight size={15} className="text-gray-300 group-hover:text-primary-500 transition-colors shrink-0"/>
    </div>
  );
  if (to) return <Link to={to}>{content}</Link>;
  return <button onClick={onClick} className="w-full text-left">{content}</button>;
}

// ── Espace Patient ─────────────────────────────────────────────
function EspacePatient({ user, onLogout }) {
  const profil = user?.profil || {};

  const { data: notifData } = useQuery({
    queryKey: ['notifs-patient-web'],
    queryFn: async () => { const { data } = await api.get('/consultations/notifications'); return data; },
    refetchInterval: 30000,
  });
  const nonLues = notifData?.nonLues || 0;

  return (
    <div className="space-y-6">
      {/* Profil */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center shrink-0">
          <span className="text-2xl font-black text-primary-600">
            {(profil.prenom || user.email || 'U').charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900">
            {profil.prenom && profil.nom ? `${profil.prenom} ${profil.nom}` : 'Mon compte'}
          </p>
          <p className="text-sm text-gray-400">{user.email}</p>
          <div className="flex gap-2 mt-2 flex-wrap">
            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full">👤 Patient</span>
            <span className="text-xs font-semibold px-2.5 py-1 bg-green-100 text-green-700 rounded-full">✓ Vérifié</span>
          </div>
        </div>
      </div>

      {profil.ville && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-wrap gap-4">
          {profil.ville && (
            <span className="flex items-center gap-1.5 text-sm text-gray-600">
              📍 {profil.ville}
            </span>
          )}
          {profil.telephone && (
            <span className="flex items-center gap-1.5 text-sm text-gray-600">
              <Phone size={13}/> {profil.telephone}
            </span>
          )}
        </div>
      )}

      {/* Consultations */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Consultations médicales</p>
        <div className="bg-primary-600 rounded-2xl p-5 mb-3 flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-base mb-1">Consulter un médecin</p>
            <p className="text-primary-100 text-xs">Généraliste ou spécialiste, à domicile ou en cabinet</p>
          </div>
          <span className="text-3xl">🏥</span>
        </div>
        <ActionCard icon={<Stethoscope size={18}/>} title="Mes consultations"
          subtitle="Demander ou suivre une consultation"
          to="/mes-consultations" badge={nonLues} color="primary"/>
      </div>

      {/* Explorer */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Explorer AZAMED</p>
        <div className="space-y-2">
          <ActionCard icon={<Pill size={18}/>}       title="Pharmacies"        subtitle="Médicaments disponibles"        to="/pharmacies"    color="green"/>
          <ActionCard icon={<TestTube2 size={18}/>}  title="Laboratoires"      subtitle="Examens et tarifs"              to="/laboratoires"  color="purple"/>
          <ActionCard icon={<Building2 size={18}/>}  title="Hôpitaux"          subtitle="Cliniques et services"          to="/hopitaux"      color="blue"/>
          <ActionCard icon={<BarChart2 size={18}/>}  title="Comparer les prix" subtitle="Médicaments, examens, services" to="/comparaison"   color="orange"/>
          <ActionCard icon={<Newspaper size={18}/>}  title="Actualités"        subtitle="Nouvelles des établissements"   to="/actualites"    color="green"/>
          <ActionCard icon={<Mail size={18}/>}       title="Contacter AZAMED"  subtitle="contactazamed98@gmail.com"
            onClick={() => window.open('mailto:contactazamed98@gmail.com')} color="gray"/>
        </div>
      </div>

      <button onClick={onLogout}
        className="w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-700 py-3 text-sm font-semibold transition-colors">
        <LogOut size={16}/> Se déconnecter
      </button>
    </div>
  );
}

// ── Espace Médecin ─────────────────────────────────────────────
function EspaceMedecin({ user, onLogout }) {
  const profil = user?.profil || {};

  const { data: consultData } = useQuery({
    queryKey: ['consult-medecin-web'],
    queryFn: async () => { const { data } = await api.get('/consultations/mes'); return data; },
    refetchInterval: 20000,
  });
  const { data: notifData } = useQuery({
    queryKey: ['notifs-medecin-web'],
    queryFn: async () => { const { data } = await api.get('/consultations/notifications'); return data; },
    refetchInterval: 20000,
  });

  const enAttente = (consultData?.data || []).filter((c) => c.statut === 'EN_ATTENTE').length;
  const nonLues   = notifData?.nonLues || 0;

  return (
    <div className="space-y-6">
      {/* Profil médecin */}
      <div className="bg-white rounded-2xl border-l-4 border-purple-600 border border-gray-100 p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center shrink-0">
          <span className="text-xl font-black text-purple-700">Dr</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900">
            Dr. {profil.prenom && profil.nom ? `${profil.prenom} ${profil.nom}` : 'Médecin'}
          </p>
          <p className="text-sm text-gray-400">{user.email}</p>
          <div className="flex gap-2 mt-2 flex-wrap">
            <span className="text-xs font-semibold px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full">👨‍⚕️ Médecin</span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              user.isVerified ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-600'
            }`}>
              {user.isVerified ? '✓ Vérifié AZAMED' : '⏳ En attente de vérification'}
            </span>
          </div>
        </div>
      </div>

      {/* Infos pro */}
      {(profil.specialite || profil.ville) && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2">
          {profil.specialite    && <p className="text-sm text-gray-700">🩺 <strong>{profil.specialite}</strong></p>}
          {profil.ville         && <p className="text-sm text-gray-600">📍 {profil.ville}</p>}
          {profil.lieuExercice  && <p className="text-sm text-gray-600">🏥 {profil.lieuExercice}</p>}
          {profil.numeroOrdre   && <p className="text-sm text-gray-600">🪪 N° Ordre : {profil.numeroOrdre}</p>}
        </div>
      )}

      {/* Alerte vérification */}
      {!user.isVerified && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex gap-3">
          <AlertCircle size={18} className="text-orange-500 shrink-0 mt-0.5"/>
          <div>
            <p className="text-sm font-semibold text-orange-700 mb-1">Vérification en cours (24-48h)</p>
            <p className="text-xs text-orange-600 leading-relaxed">
              Votre profil médecin est en attente de validation. Contactez-nous pour accélérer :
            </p>
            <a href="mailto:contactazamed98@gmail.com"
              className="text-xs text-primary-600 font-semibold mt-1 inline-block hover:underline">
              contactazamed98@gmail.com →
            </a>
          </div>
        </div>
      )}

      {/* Alerte demandes en attente */}
      {enAttente > 0 && (
        <Link to="/tableau-de-bord-medecin"
          className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 hover:bg-red-100 transition-colors">
          <AlertCircle size={18} className="text-red-500 shrink-0"/>
          <p className="text-sm font-semibold text-red-700 flex-1">
            {enAttente} demande{enAttente>1?'s':''} de consultation en attente !
          </p>
          <ChevronRight size={15} className="text-red-400"/>
        </Link>
      )}

      {/* Consultations médecin */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Consultations patients</p>
        <div className="space-y-2">
          <ActionCard icon={<Stethoscope size={18}/>} title="Tableau de bord médecin"
            subtitle="Demandes, en cours, historique"
            to="/tableau-de-bord-medecin" badge={enAttente} color="purple"/>
          <ActionCard icon={<CheckCircle2 size={18}/>} title="Notifications"
            subtitle="Nouvelles demandes de consultation"
            to="/tableau-de-bord-medecin" badge={nonLues} color="orange"/>
        </div>
      </div>

      {/* Outils */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Outils</p>
        <div className="space-y-2">
          <ActionCard icon={<Pill size={18}/>}       title="Pharmacies"       subtitle="Disponibilité médicaments"       to="/pharmacies"   color="green"/>
          <ActionCard icon={<TestTube2 size={18}/>}  title="Laboratoires"     subtitle="Référez vos patients"            to="/laboratoires" color="purple"/>
          <ActionCard icon={<Mail size={18}/>}       title="Contacter AZAMED" subtitle="contactazamed98@gmail.com"
            onClick={() => window.open('mailto:contactazamed98@gmail.com')} color="gray"/>
        </div>
      </div>

      <button onClick={onLogout}
        className="w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-700 py-3 text-sm font-semibold transition-colors">
        <LogOut size={16}/> Se déconnecter
      </button>
    </div>
  );
}

export default function MonComptePage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const refreshUser = useAuthStore((s) => s.refreshUser);

   useEffect(() => {
     if (isAuthenticated) {
       refreshUser();                              // au montage de la page
       const interval = setInterval(refreshUser, 30000); // puis toutes les 30s
       return () => clearInterval(interval);
     }
   }, [isAuthenticated]);
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Voulez-vous vous déconnecter ?')) {
      logout();
      navigate('/');
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-4xl mb-4">👤</p>
        <p className="font-bold text-gray-900 text-lg mb-2">Non connecté</p>
        <p className="text-gray-500 text-sm mb-6">Connectez-vous pour accéder à votre espace</p>
        <div className="flex flex-col gap-3">
          <Link to="/connexion" className="bg-primary-600 text-white font-semibold py-3 rounded-xl text-center hover:bg-primary-700 transition-colors">
            Se connecter
          </Link>
          <Link to="/inscription" className="bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl text-center hover:bg-gray-200 transition-colors">
            Créer un compte
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Mon espace</h1>
      {user.role === 'MEDECIN'
        ? <EspaceMedecin user={user} onLogout={handleLogout}/>
        : <EspacePatient user={user} onLogout={handleLogout}/>}
    </div>
  );
}
