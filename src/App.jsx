// src/App.jsx — App complète avec auth + consultations
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Menu, X, Search, Pill, TestTube2, Building2,
  BarChart2, Newspaper, Home, User, LogOut, Stethoscope, ChevronDown
} from 'lucide-react';
import useAuthStore from './store/authStore';

import HomePage               from './pages/HomePage';
import RecherchePage          from './pages/RecherchePage';
import PharmaciesPage         from './pages/PharmaciesPage';
import LaboratoiresPage       from './pages/LaboratoiresPage';
import HopitauxPage           from './pages/HopitauxPage';
import ActualitesPage         from './pages/ActualitesPage';
import ComparaisonPage        from './pages/ComparaisonPage';
import StructureDetailPage    from './pages/StructureDetailPage';
import ConnexionPage          from './pages/ConnexionPage';
import InscriptionPage        from './pages/InscriptionPage';
import ResetPasswordPage      from './pages/ResetPasswordPage';
import MonComptePage          from './pages/MonComptePage';
import ConsultationsPage      from './pages/ConsultationsPage';
import TableauDeBordMedecinPage from './pages/TableauDeBordMedecinPage';

const qc = new QueryClient({ defaultOptions:{ queries:{ staleTime:5*60*1000, retry:1 } } });

const NAV = [
  { to:'/',            label:'Accueil',      icon:<Home size={15}/>      },
  { to:'/pharmacies',  label:'Pharmacies',   icon:<Pill size={15}/>      },
  { to:'/laboratoires',label:'Laboratoires', icon:<TestTube2 size={15}/> },
  { to:'/hopitaux',    label:'Hôpitaux',     icon:<Building2 size={15}/> },
  { to:'/comparaison', label:'Comparer prix',icon:<BarChart2 size={15}/> },
  { to:'/actualites',  label:'Actualités',   icon:<Newspaper size={15}/> },
];

function UserMenu() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Link to="/connexion"
          className="text-sm font-semibold text-gray-600 hover:text-primary-600 px-3 py-1.5 rounded-lg transition-colors">
          Connexion
        </Link>
        <Link to="/inscription"
          className="text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 px-4 py-1.5 rounded-xl transition-colors">
          Créer un compte
        </Link>
      </div>
    );
  }

  const profil   = user?.profil || {};
  const isMedecin = user?.role === 'MEDECIN';
  const initial   = (profil.prenom || user.email || 'U').charAt(0).toUpperCase();

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-xl px-3 py-1.5 transition-colors">
        <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center">
          <span className="text-white font-bold text-xs">{initial}</span>
        </div>
        <span className="text-sm font-semibold text-gray-700 hidden sm:block max-w-24 truncate">
          {isMedecin ? `Dr. ${profil.prenom||''}` : profil.prenom || 'Mon compte'}
        </span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${open?'rotate-180':''}`}/>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)}/>
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 z-40 overflow-hidden">
            {/* Profil */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <p className="font-semibold text-sm text-gray-900 truncate">
                {isMedecin ? `Dr. ${profil.prenom||''} ${profil.nom||''}` : `${profil.prenom||''} ${profil.nom||''}`}
              </p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
              <span className={`inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                isMedecin ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {isMedecin ? '👨‍⚕️ Médecin' : '👤 Patient'}
              </span>
            </div>

            {/* Liens */}
            <div className="py-2">
              <Link to="/mon-compte" onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <User size={15} className="text-gray-400"/> Mon espace
              </Link>

              {!isMedecin && (
                <Link to="/mes-consultations" onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <Stethoscope size={15} className="text-gray-400"/> Mes consultations
                </Link>
              )}

              {isMedecin && (
                <Link to="/tableau-de-bord-medecin" onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <Stethoscope size={15} className="text-gray-400"/> Tableau de bord
                </Link>
              )}

              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  onClick={() => {
                    setOpen(false);
                    if (window.confirm('Se déconnecter ?')) { logout(); navigate('/'); }
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
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

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch]     = useState('');
  const location                = useLocation();
  const navigate                = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) { navigate(`/recherche?q=${encodeURIComponent(search.trim())}`); setSearch(''); setMenuOpen(false); }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center gap-3 h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center">
              <span className="text-white font-black text-sm">AZ</span>
            </div>
            <span className="font-black text-primary-600 text-lg">AZAMED</span>
          </Link>

          {/* Recherche desktop */}
          <form onSubmit={handleSearch} className="hidden sm:flex flex-1 items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 max-w-sm">
            <Search size={14} className="text-gray-400 shrink-0"/>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Médicament, hôpital, ville..."
              className="flex-1 text-sm bg-transparent outline-none text-gray-900 placeholder-gray-400"/>
          </form>

          {/* Nav desktop */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1">
            {NAV.slice(1, 5).map((n) => (
              <Link key={n.to} to={n.to}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  location.pathname === n.to ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-100'
                }`}>
                {n.label}
              </Link>
            ))}
            <Link to="/comparaison"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                location.pathname==='/comparaison' ? 'bg-orange-50 text-orange-600' : 'text-orange-600 hover:bg-orange-50'
              }`}>
              💰 Prix
            </Link>
          </nav>

          {/* User menu */}
          <div className="hidden sm:block shrink-0">
            <UserMenu/>
          </div>

          {/* Burger */}
          <button className="sm:hidden ml-auto p-2 rounded-xl hover:bg-gray-100" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} className="text-gray-700"/> : <Menu size={20} className="text-gray-700"/>}
          </button>
        </div>

        {/* Menu mobile */}
        {menuOpen && (
          <div className="sm:hidden pb-4 border-t border-gray-100 pt-3 space-y-3">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
                <Search size={14} className="text-gray-400"/>
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher..." className="flex-1 text-sm bg-transparent outline-none"/>
              </div>
              <button type="submit" className="bg-primary-600 text-white px-3 rounded-xl text-sm font-semibold">OK</button>
            </form>
            <div className="grid grid-cols-2 gap-2">
              {NAV.map((n) => (
                <Link key={n.to} to={n.to} onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                    location.pathname===n.to ? 'bg-primary-50 text-primary-600' : 'bg-gray-50 text-gray-700'
                  }`}>
                  {n.icon} {n.label}
                </Link>
              ))}
              <Link to="/mon-compte" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold bg-gray-50 text-gray-700">
                <User size={15}/> Mon compte
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-16 py-10 px-4">
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
              {NAV.map((n) => (
                <Link key={n.to} to={n.to} className="block text-sm hover:text-white transition-colors">{n.label}</Link>
              ))}
              <Link to="/mon-compte" className="block text-sm hover:text-white transition-colors">Mon compte</Link>
            </div>
          </div>
          <div>
            <p className="text-white font-semibold mb-3">Contact</p>
            <p className="text-sm">contactazamed98@gmail.com</p>
            <p className="text-sm mt-2">Cameroun 🇨🇲</p>
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
  const { hydrate } = useAuthStore();
  useEffect(() => { hydrate(); }, []);
  return children;
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <AppInit>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header/>
            <main className="flex-1">
              <Routes>
                <Route path="/"                        element={<HomePage/>}/>
                <Route path="/recherche"               element={<RecherchePage/>}/>
                <Route path="/pharmacies"              element={<PharmaciesPage/>}/>
                <Route path="/laboratoires"            element={<LaboratoiresPage/>}/>
                <Route path="/hopitaux"                element={<HopitauxPage/>}/>
                <Route path="/actualites"              element={<ActualitesPage/>}/>
                <Route path="/comparaison"             element={<ComparaisonPage/>}/>
                <Route path="/structures/:id"          element={<StructureDetailPage/>}/>
                <Route path="/connexion"               element={<ConnexionPage/>}/>
                <Route path="/inscription"             element={<InscriptionPage/>}/>
                <Route path="/reset-password"          element={<ResetPasswordPage/>}/>
                <Route path="/mon-compte"              element={<MonComptePage/>}/>
                <Route path="/mes-consultations"       element={<ConsultationsPage/>}/>
                <Route path="/tableau-de-bord-medecin" element={<TableauDeBordMedecinPage/>}/>
                <Route path="*" element={
                  <div className="text-center py-24">
                    <p className="text-4xl mb-4">🏥</p>
                    <p className="text-xl font-bold text-gray-700 mb-4">Page introuvable</p>
                    <Link to="/" className="text-primary-600 hover:underline">← Retour à l'accueil</Link>
                  </div>
                }/>
              </Routes>
            </main>
            <Footer/>
          </div>
        </AppInit>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
