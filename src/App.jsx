// src/App.jsx — Navigation claire avec auth visible (style app mobile)
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Home, Pill, TestTube2, Building2, BarChart2,
  Newspaper, User, Search, Menu, X, LogOut,
  Stethoscope, ChevronDown, Bell, Plus,
} from 'lucide-react';
import useAuthStore from './store/authStore';

import HomePage                 from './pages/HomePage';
import RecherchePage            from './pages/RecherchePage';
import PharmaciesPage           from './pages/PharmaciesPage';
import LaboratoiresPage         from './pages/LaboratoiresPage';
import HopitauxPage             from './pages/HopitauxPage';
import ActualitesPage           from './pages/ActualitesPage';
import ComparaisonPage          from './pages/ComparaisonPage';
import StructureDetailPage      from './pages/StructureDetailPage';
import ConnexionPage            from './pages/ConnexionPage';
import InscriptionPage          from './pages/InscriptionPage';
import ResetPasswordPage        from './pages/ResetPasswordPage';
import MonComptePage            from './pages/MonComptePage';
import ConsultationsPage        from './pages/ConsultationsPage';
import TableauDeBordMedecinPage from './pages/TableauDeBordMedecinPage';
import InscriptionDeleguePage   from './pages/InscriptionDeleguePage';
import ConnexionDeleguePage     from './pages/ConnexionDeleguePage';
import MonCompteDeleguePage     from './pages/MonCompteDeleguePage';


const qc = new QueryClient({ defaultOptions:{ queries:{ staleTime:5*60*1000, retry:1 } } });

// ── Navigation tabs (miroir app mobile) ───────────────────────
const NAV_TABS = [
  { to:'/',            label:'Accueil',      icon: Home      },
  { to:'/pharmacies',  label:'Pharmacies',   icon: Pill      },
  { to:'/laboratoires',label:'Labos',        icon: TestTube2 },
  { to:'/hopitaux',    label:'Hôpitaux',     icon: Building2 },
  { to:'/actualites',  label:'Actualités',   icon: Newspaper },
  { to:'/mon-compte',  label:'Compte',       icon: User      },
];

// ── Dropdown utilisateur ───────────────────────────────────────
function UserDropdown({ user, logout }) {
  const [open, setOpen] = useState(false);
  const navigate        = useNavigate();
  const profil          = user?.profil || {};
  const isMedecin       = user?.role === 'MEDECIN';
  const initial         = (profil.prenom || user.email || 'U').charAt(0).toUpperCase();

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-xl px-3 py-2 transition-colors">
        <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-xs">{initial}</span>
        </div>
        <span className="text-sm font-semibold hidden sm:block max-w-[100px] truncate">
          {isMedecin ? `Dr. ${profil.prenom||''}` : profil.prenom || 'Moi'}
        </span>
        <ChevronDown size={14} className={`transition-transform ${open?'rotate-180':''}`}/>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)}/>
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 z-40 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <p className="font-semibold text-sm text-gray-900 truncate">
                {isMedecin ? `Dr. ${profil.prenom||''} ${profil.nom||''}` : `${profil.prenom||''} ${profil.nom||''}`}
              </p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
              <span className={`inline-block mt-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                isMedecin ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {isMedecin ? '👨‍⚕️ Médecin' : '👤 Patient'}
              </span>
            </div>
            <div className="py-1.5">
              <Link to="/mon-compte" onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                <User size={15} className="text-gray-400"/> Mon espace
              </Link>
              {!isMedecin && (
                <Link to="/mes-consultations" onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                  <Stethoscope size={15} className="text-gray-400"/> Mes consultations
                </Link>
              )}
              {isMedecin && (
                <Link to="/tableau-de-bord-medecin" onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                  <Stethoscope size={15} className="text-gray-400"/> Tableau de bord
                </Link>
              )}
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  onClick={() => {
                    setOpen(false);
                    if (window.confirm('Se déconnecter ?')) { logout(); navigate('/'); }
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50">
                  <LogOut size={15}/> Se déconnecter
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Header ─────────────────────────────────────────────────────
function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [search, setSearch]  = useState('');
  const [mobileMenu, setMenu] = useState(false);
  const location             = useLocation();
  const navigate             = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) { navigate(`/recherche?q=${encodeURIComponent(search.trim())}`); setSearch(''); setMenu(false); }
  };

  // Pages sans header (auth pages)
  const authPages = ['/connexion','/inscription','/reset-password'];
  if (authPages.includes(location.pathname)) return null;
  const authPages = ['/connexion','/inscription','/reset-password','/delegue/inscription','/delegue/connexion'];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-3 h-14">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center">
              <span className="text-white font-black text-sm">AZ</span>
            </div>
            <span className="font-black text-primary-600 text-lg hidden sm:block">AZAMED</span>
          </Link>

          {/* Recherche */}
          <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 max-w-sm">
            <Search size={14} className="text-gray-400 shrink-0"/>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Médicament, hôpital, ville..."
              className="flex-1 text-sm bg-transparent outline-none text-gray-900 placeholder-gray-400 min-w-0"/>
          </form>

          {/* Navigation desktop */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV_TABS.slice(0, 5).map((n) => {
              const Icon = n.icon;
              const active = location.pathname === n.to;
              return (
                <Link key={n.to} to={n.to}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                    active ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-100'
                  }`}>
                  <Icon size={13}/> {n.label}
                </Link>
              );
            })}
            <Link to="/comparaison"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                location.pathname==='/comparaison' ? 'bg-orange-50 text-orange-600' : 'text-orange-600 hover:bg-orange-50'
              }`}>
              💰 Prix
            </Link>
          </nav>

          {/* Auth desktop */}
          <div className="hidden sm:flex items-center gap-2 shrink-0 ml-auto">
            {isAuthenticated ? (
              <UserDropdown user={user} logout={logout}/>
            ) : (
              <>
                <Link to="/connexion"
                  className="text-sm font-semibold text-gray-600 hover:text-primary-600 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-primary-300 transition-colors">
                  Connexion
                </Link>
                <Link to="/inscription"
                  className="text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 px-4 py-1.5 rounded-xl transition-colors flex items-center gap-1.5">
                  <Plus size={14}/> Créer un compte
                </Link>
                <Link to="/delegue/connexion"
                 className="block text-center text-xs text-gray-500 hover:text-gray-300 mt-3">
                 Vous etes delegue medical ? Acceder a mon espace
                </Link>
              </>
            )}
          </div>

          {/* Burger mobile */}
          <button className="lg:hidden ml-auto p-2 rounded-xl hover:bg-gray-100 transition-colors"
            onClick={() => setMenu(!mobileMenu)}>
            {mobileMenu ? <X size={20} className="text-gray-700"/> : <Menu size={20} className="text-gray-700"/>}
          </button>
        </div>

        {/* Menu mobile déroulant */}
        {mobileMenu && (
          <div className="lg:hidden pb-4 pt-3 border-t border-gray-100 space-y-3">
            {/* Auth mobile */}
            {!isAuthenticated ? (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/connexion" onClick={() => setMenu(false)}
                  className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  <User size={15}/> Connexion
                </Link>
                <Link to="/inscription" onClick={() => setMenu(false)}
                  className="flex items-center justify-center gap-2 py-2.5 bg-primary-600 rounded-xl text-sm font-bold text-white hover:bg-primary-700">
                  <Plus size={15}/> Créer un compte
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-primary-50 rounded-xl p-3">
                <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center">
                  <span className="text-white font-bold">{(user?.profil?.prenom||user?.email||'U').charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-primary-800 truncate">
                    {user?.role==='MEDECIN' ? `Dr. ${user?.profil?.prenom||''}` : user?.profil?.prenom || user?.email}
                  </p>
                  <p className="text-xs text-primary-500">{user?.role==='MEDECIN'?'👨‍⚕️ Médecin':'👤 Patient'}</p>
                </div>
                <button onClick={() => { setMenu(false); if(window.confirm('Se déconnecter ?')) { logout(); navigate('/'); } }}
                  className="p-2 text-red-400 hover:text-red-600">
                  <LogOut size={16}/>
                </button>
              </div>
            )}

            {/* Liens navigation mobile */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { to:'/', label:'Accueil', icon:'🏠' },
                { to:'/pharmacies', label:'Pharmacies', icon:'💊' },
                { to:'/laboratoires', label:'Labos', icon:'🔬' },
                { to:'/hopitaux', label:'Hôpitaux', icon:'🏥' },
                { to:'/comparaison', label:'Comparer', icon:'💰' },
                { to:'/actualites', label:'Actualités', icon:'📰' },
              ].map((n) => (
                <Link key={n.to} to={n.to} onClick={() => setMenu(false)}
                  className={`flex flex-col items-center gap-1 py-3 rounded-xl text-xs font-semibold transition-colors ${
                    location.pathname===n.to ? 'bg-primary-50 text-primary-600' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}>
                  <span className="text-xl">{n.icon}</span>
                  {n.label}
                </Link>
              ))}
            </div>

            {/* Liens compte mobile */}
            {isAuthenticated && (
              <div className="space-y-1.5 border-t border-gray-100 pt-3">
                <Link to="/mon-compte" onClick={() => setMenu(false)}
                  className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-xl text-sm font-semibold text-gray-700">
                  <User size={15}/> Mon espace
                </Link>
                {user?.role !== 'MEDECIN' && (
                  <Link to="/mes-consultations" onClick={() => setMenu(false)}
                    className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-xl text-sm font-semibold text-gray-700">
                    <Stethoscope size={15}/> Mes consultations
                  </Link>
                )}
                {user?.role === 'MEDECIN' && (
                  <Link to="/tableau-de-bord-medecin" onClick={() => setMenu(false)}
                    className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-xl text-sm font-semibold text-gray-700">
                    <Stethoscope size={15}/> Tableau de bord médecin
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

// ── Bottom navigation (style app mobile) ──────────────────────
function BottomNav() {
  const { isAuthenticated } = useAuthStore();
  const location            = useLocation();

  // Cacher sur les pages auth
  const authPages = ['/connexion','/inscription','/reset-password'];
  if (authPages.includes(location.pathname)) return null;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_TABS.map((n) => {
          const Icon   = n.icon;
          const active = location.pathname === n.to
            || (n.to === '/mon-compte' && ['/mon-compte','/mes-consultations','/tableau-de-bord-medecin'].includes(location.pathname));
          return (
            <Link key={n.to} to={n.to}
              className={`flex flex-col items-center gap-0.5 flex-1 py-1 px-1 rounded-xl transition-colors ${
                active ? 'text-primary-600' : 'text-gray-400'
              }`}>
              <Icon size={21} strokeWidth={active ? 2.5 : 1.8}/>
              <span className={`text-[10px] font-semibold ${active?'text-primary-600':'text-gray-400'}`}>
                {n.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// ── Footer ─────────────────────────────────────────────────────
function Footer() {
  const location  = useLocation();
  const authPages = ['/connexion','/inscription','/reset-password'];
  if (authPages.includes(location.pathname)) return null;

  return (
    <footer className="bg-gray-900 text-gray-400 mt-16 py-10 px-4 pb-20 lg:pb-10">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center">
                <span className="text-white font-black text-sm">AZ</span>
              </div>
              <span className="text-white font-black text-lg">AZAMED</span>
            </div>
            <p className="text-sm leading-relaxed">Annuaire Santé Cameroun 🇨🇲<br/>Trouvez, comparez et consultez.</p>
          </div>
          <div>
            <p className="text-white font-semibold mb-3">Navigation</p>
            <div className="space-y-2">
              {NAV_TABS.map((n) => (
                <Link key={n.to} to={n.to} className="block text-sm hover:text-white transition-colors">{n.label}</Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-white font-semibold mb-3">Contact & Compte</p>
            <p className="text-sm">contactazamed98@gmail.com</p>
            <p className="text-sm mt-1">Cameroun 🇨🇲</p>
            <div className="mt-4 space-y-2">
              <Link to="/inscription"
                className="block bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl text-center transition-colors">
                ✨ Créer un compte gratuit
              </Link>
              <Link to="/connexion"
                className="block bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-semibold px-4 py-2.5 rounded-xl text-center transition-colors">
                Se connecter
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 text-center text-xs">
          © 2024 AZAMED — Tous droits réservés
        </div>
      </div>
    </footer>
  );
}

function AppInit({ children }) {
    const { hydrate, refreshUser, isAuthenticated } = useAuthStore();
    useEffect(() => { hydrate(); }, []);
    useEffect(() => {
      if (isAuthenticated) refreshUser();
    }, [isAuthenticated]);
    return children;
  }

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <AppInit>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header/>
            <main className="flex-1 pb-16 lg:pb-0">
              <Routes>
                <Route path="/"                         element={<HomePage/>}/>
                <Route path="/recherche"                element={<RecherchePage/>}/>
                <Route path="/pharmacies"               element={<PharmaciesPage/>}/>
                <Route path="/laboratoires"             element={<LaboratoiresPage/>}/>
                <Route path="/hopitaux"                 element={<HopitauxPage/>}/>
                <Route path="/actualites"               element={<ActualitesPage/>}/>
                <Route path="/comparaison"              element={<ComparaisonPage/>}/>
                <Route path="/structures/:id"           element={<StructureDetailPage/>}/>
                <Route path="/connexion"                element={<ConnexionPage/>}/>
                <Route path="/inscription"              element={<InscriptionPage/>}/>
                <Route path="/reset-password"           element={<ResetPasswordPage/>}/>
                <Route path="/mon-compte"               element={<MonComptePage/>}/>
                <Route path="/mes-consultations"        element={<ConsultationsPage/>}/>
                <Route path="/tableau-de-bord-medecin"  element={<TableauDeBordMedecinPage/>}/>
                <Route path="/delegue/inscription"  element={<InscriptionDeleguePage/>}/>
                <Route path="/delegue/connexion"    element={<ConnexionDeleguePage/>}/>
                <Route path="/delegue/mon-compte"   element={<MonCompteDeleguePage/>}/>
                <Route path="*" element={
                  <div className="text-center py-24">
                    <p className="text-4xl mb-4">🏥</p>
                    <p className="text-xl font-bold text-gray-700 mb-4">Page introuvable</p>
                    <Link to="/" className="text-primary-600 hover:underline">← Retour à l'accueil</Link>
                  </div>
                }/>
              </Routes>
            </main>
            <BottomNav/>
            <Footer/>
          </div>
        </AppInit>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
