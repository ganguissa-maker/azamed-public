// src/components/layout/Layout.jsx — avec lien "Établissements"
import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Search, Menu, X, Pill, TestTube2, Building2, Newspaper,
  MapPin, Mail, User, LogOut, Smartphone, ChevronDown, Stethoscope, Grid,
} from 'lucide-react';
import useUserStore from '../../store/userStore';

const STRUCTURES_URL = import.meta.env.VITE_STRUCTURES_URL || 'http://localhost:5174';
const CONTACT_EMAIL  = 'contactazamed@gmail.com';
const PLAYSTORE_URL  = 'https://play.google.com/store/apps/details?id=cm.azamed.app';
const APPSTORE_URL   = 'https://apps.apple.com/app/azamed/id000000000';

const navLinks = [
  { label:'Établissements', to:'/etablissements', icon:<Grid size={15}/>         },
  { label:'Pharmacies',     to:'/pharmacies',     icon:<Pill size={15}/>          },
  { label:'Laboratoires',   to:'/laboratoires',   icon:<TestTube2 size={15}/>     },
  { label:'Hôpitaux',       to:'/hopitaux',       icon:<Building2 size={15}/>     },
  { label:'Médecins',       to:'/medecins',       icon:<Stethoscope size={15}/>   },
  { label:'Actualités',     to:'/actualites',     icon:<Newspaper size={15}/>     },
  { label:'Carte',          to:'/carte',          icon:<MapPin size={15}/>        },
];

function Navbar() {
  const [open, setOpen]         = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const navigate                = useNavigate();
  const { pathname }            = useLocation();
  const { user, isAuthenticated, logout } = useUserStore();

  const handleLogout = () => { logout(); setUserMenu(false); navigate('/'); };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">AZ</span>
            </div>
            <div className="hidden sm:block">
              <p className="font-extrabold text-lg text-primary-700 leading-none">AZAMED</p>
              <p className="text-xs text-gray-400 leading-none">Annuaire Santé Cameroun</p>
            </div>
            <span className="font-extrabold text-lg text-primary-700 sm:hidden">AZAMED</span>
          </Link>

          {/* Nav desktop — scroll horizontal sur petits écrans */}
          <div className="hidden lg:flex items-center gap-0.5 overflow-x-auto">
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to}
                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  pathname.startsWith(l.to)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                }`}>
                {l.icon} {l.label}
              </Link>
            ))}
          </div>

          {/* Actions droite */}
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/recherche')}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-primary-50 hover:text-primary-600 rounded-xl text-sm text-gray-500 transition-colors">
              <Search size={16}/>
              <span className="hidden sm:block">Rechercher...</span>
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button onClick={() => setUserMenu(!userMenu)}
                  className="hidden sm:flex items-center gap-2 px-3 py-2 bg-primary-50 text-primary-700 rounded-xl text-sm font-medium hover:bg-primary-100 transition-colors">
                  <User size={15}/>
                  <span className="max-w-[100px] truncate">{user?.profil?.prenom || 'Mon compte'}</span>
                  {!user?.isVerified && <span className="w-2 h-2 bg-orange-400 rounded-full"/>}
                  <ChevronDown size={13}/>
                </button>
                {userMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 min-w-[200px] z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-semibold text-sm text-gray-900">{user?.profil?.prenom} {user?.profil?.nom}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                      {user?.isVerified
                        ? <p className="text-xs text-green-600 font-semibold mt-0.5">✓ Compte vérifié</p>
                        : <p className="text-xs text-orange-500 font-semibold mt-0.5">⏳ En attente</p>}
                    </div>
                    <Link to="/mon-compte" onClick={() => setUserMenu(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <User size={14}/> Mon profil
                    </Link>
                    <button onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full transition-colors">
                      <LogOut size={14}/> Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/connexion" className="text-sm font-medium text-primary-600 hover:text-primary-700 px-3 py-2 rounded-lg hover:bg-primary-50 transition-colors">
                  Connexion
                </Link>
                <Link to="/inscription" className="text-sm font-medium bg-primary-600 text-white px-3 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                  S'inscrire
                </Link>
              </div>
            )}
            <button onClick={() => setOpen(!open)} className="lg:hidden p-2 text-gray-500 hover:text-primary-600 rounded-lg">
              {open ? <X size={22}/> : <Menu size={22}/>}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {open && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1 max-h-[80vh] overflow-y-auto">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors">
              {l.icon} {l.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-gray-100 space-y-1">
            {isAuthenticated ? (
              <>
                <Link to="/mon-compte" onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-primary-600 hover:bg-primary-50">
                  <User size={14}/> Mon compte
                  {!user?.isVerified && <span className="text-xs text-orange-500 ml-auto">⏳</span>}
                </Link>
                <button onClick={() => { handleLogout(); setOpen(false); }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-500 w-full hover:bg-red-50">
                  <LogOut size={14}/> Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/connexion" onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-primary-600 hover:bg-primary-50">
                  <User size={14}/> Connexion
                </Link>
                <Link to="/inscription" onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold bg-primary-600 text-white">
                  S'inscrire gratuitement
                </Link>
              </>
            )}
            <a href={`mailto:${CONTACT_EMAIL}`}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-400 hover:bg-gray-50">
              <Mail size={12}/> {CONTACT_EMAIL}
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 mb-8">
          {/* Logo + contact */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AZ</span>
              </div>
              <span className="font-bold text-white text-lg">AZAMED</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Annuaire santé du Cameroun. Accès gratuit pour le grand public.
            </p>
            <a href={`mailto:${CONTACT_EMAIL}`}
              className="flex items-center gap-2 text-sm text-primary-300 hover:text-primary-200 transition-colors">
              <Mail size={14} className="shrink-0"/>{CONTACT_EMAIL}
            </a>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Établissements</h4>
            <ul className="space-y-2 text-sm">
              {navLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="hover:text-primary-400 transition-colors flex items-center gap-1.5">
                    {l.icon} {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Mon compte */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Mon compte</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/inscription"    className="hover:text-primary-400 transition-colors">Créer un compte</Link></li>
              <li><Link to="/connexion"      className="hover:text-primary-400 transition-colors">Se connecter</Link></li>
              <li><Link to="/mon-compte"     className="hover:text-primary-400 transition-colors">Mon profil</Link></li>
              <li><a href={STRUCTURES_URL} target="_blank" rel="noreferrer" className="hover:text-primary-400 transition-colors">Espace établissements →</a></li>
            </ul>
          </div>

          {/* App mobile */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
              <Smartphone size={14}/> Application mobile
            </h4>
            <p className="text-xs text-gray-400 mb-3">Disponible sur Android et iOS</p>
            <div className="space-y-2">
              <a href={PLAYSTORE_URL} target="_blank" rel="noreferrer"
                className="flex items-center gap-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl px-3 py-2.5 transition-colors">
                <div className="w-6 h-6 bg-white rounded flex items-center justify-center text-xs font-bold text-green-600">▶</div>
                <div>
                  <p className="text-xs text-gray-400 leading-none">Télécharger sur</p>
                  <p className="text-sm font-semibold text-white leading-tight">Google Play</p>
                </div>
              </a>
              <a href={APPSTORE_URL} target="_blank" rel="noreferrer"
                className="flex items-center gap-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl px-3 py-2.5 transition-colors">
                <div className="w-6 h-6 bg-white rounded flex items-center justify-center text-xs font-bold text-gray-800"></div>
                <div>
                  <p className="text-xs text-gray-400 leading-none">Télécharger sur</p>
                  <p className="text-sm font-semibold text-white leading-tight">App Store</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <span>© {new Date().getFullYear()} AZAMED — Annuaire Santé Cameroun — Accès gratuit</span>
          <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-gray-400 flex items-center gap-1 transition-colors">
            <Mail size={11}/> {CONTACT_EMAIL}
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar/>
      <main className="flex-1"><Outlet/></main>
      <Footer/>
    </div>
  );
}
