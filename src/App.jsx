// src/App.jsx — Routing complet site public
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Menu, X, Search, Pill, TestTube2, Building2, BarChart2, Newspaper, Home } from 'lucide-react';

import HomePage          from './pages/HomePage';
import RecherchePage     from './pages/RecherchePage';
import PharmaciesPage    from './pages/PharmaciesPage';
import LaboratoiresPage  from './pages/LaboratoiresPage';
import HopitauxPage      from './pages/HopitauxPage';
import ActualitesPage    from './pages/ActualitesPage';
import ComparaisonPage   from './pages/ComparaisonPage';
import StructureDetailPage from './pages/StructureDetailPage';

const qc = new QueryClient({ defaultOptions:{ queries:{ staleTime:5*60*1000, retry:1 } } });

const NAV = [
  { to:'/',            label:'Accueil',        icon:<Home size={16}/>       },
  { to:'/pharmacies',  label:'Pharmacies',     icon:<Pill size={16}/>       },
  { to:'/laboratoires',label:'Laboratoires',   icon:<TestTube2 size={16}/>  },
  { to:'/hopitaux',    label:'Hôpitaux',       icon:<Building2 size={16}/>  },
  { to:'/comparaison', label:'Comparer prix',  icon:<BarChart2 size={16}/>  },
  { to:'/actualites',  label:'Actualités',     icon:<Newspaper size={16}/>  },
];

function Header() {
  const [open, setOpen]   = useState(false);
  const [search, setSearch] = useState('');
  const location          = useLocation();
  const navigate          = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/recherche?q=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4">
        {/* Ligne principale */}
        <div className="flex items-center gap-4 h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center">
              <span className="text-white font-black text-sm">AZ</span>
            </div>
            <span className="font-black text-primary-600 text-lg">AZAMED</span>
          </Link>

          {/* Barre de recherche desktop */}
          <form onSubmit={handleSearch} className="hidden sm:flex flex-1 items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
            <Search size={14} className="text-gray-400 shrink-0"/>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Médicament, hôpital, ville..."
              className="flex-1 text-sm bg-transparent outline-none text-gray-900 placeholder-gray-400"/>
          </form>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV.slice(0,4).map((n) => (
              <Link key={n.to} to={n.to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === n.to
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}>
                {n.label}
              </Link>
            ))}
            <Link to="/comparaison"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                location.pathname === '/comparaison'
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-orange-600 hover:bg-orange-50'
              }`}>
              💰 Prix
            </Link>
          </nav>

          {/* Burger mobile */}
          <button className="md:hidden p-2 rounded-xl hover:bg-gray-100" onClick={() => setOpen(!open)}>
            {open ? <X size={20} className="text-gray-700"/> : <Menu size={20} className="text-gray-700"/>}
          </button>
        </div>

        {/* Menu mobile */}
        {open && (
          <div className="md:hidden pb-4 border-t border-gray-100 pt-3">
            {/* Recherche mobile */}
            <form onSubmit={handleSearch} className="flex gap-2 mb-3">
              <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
                <Search size={14} className="text-gray-400"/>
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher..." className="flex-1 text-sm bg-transparent outline-none text-gray-900"/>
              </div>
              <button type="submit" className="bg-primary-600 text-white px-4 rounded-xl text-sm font-semibold">
                OK
              </button>
            </form>
            <div className="grid grid-cols-2 gap-2">
              {NAV.map((n) => (
                <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    location.pathname === n.to
                      ? 'bg-primary-50 text-primary-600'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}>
                  {n.icon} {n.label}
                </Link>
              ))}
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
            <p className="text-sm leading-relaxed">
              Annuaire Santé Cameroun 🇨🇲<br/>
              Trouvez, comparez et contactez les établissements de santé.
            </p>
          </div>
          <div>
            <p className="text-white font-semibold mb-3">Navigation</p>
            <div className="space-y-2">
              {NAV.map((n) => (
                <Link key={n.to} to={n.to} className="block text-sm hover:text-white transition-colors">{n.label}</Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-white font-semibold mb-3">Contact</p>
            <p className="text-sm">contactazamed98@gmail.com</p>
            <p className="text-sm mt-2">Cameroun 🇨🇲</p>
            <div className="mt-4 flex gap-3">
              <a href="https://play.google.com/store" target="_blank" rel="noreferrer"
                className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors">
                📱 App Android
              </a>
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

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header/>
      <main className="flex-1">{children}</main>
      <Footer/>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useState(() => { window.scrollTo(0,0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <ScrollToTop/>
        <Layout>
          <Routes>
            <Route path="/"              element={<HomePage/>}/>
            <Route path="/recherche"     element={<RecherchePage/>}/>
            <Route path="/pharmacies"    element={<PharmaciesPage/>}/>
            <Route path="/laboratoires"  element={<LaboratoiresPage/>}/>
            <Route path="/hopitaux"      element={<HopitauxPage/>}/>
            <Route path="/actualites"    element={<ActualitesPage/>}/>
            <Route path="/comparaison"   element={<ComparaisonPage/>}/>
            <Route path="/structures/:id" element={<StructureDetailPage/>}/>
            <Route path="*" element={
              <div className="text-center py-24">
                <p className="text-4xl mb-4">🏥</p>
                <p className="text-xl font-bold text-gray-700">Page introuvable</p>
                <Link to="/" className="mt-4 inline-block text-primary-600 hover:underline">← Retour à l'accueil</Link>
              </div>
            }/>
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
