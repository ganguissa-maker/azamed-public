// src/components/layout/Layout.jsx — SITE PUBLIC
// Contact : contactazamed@gmail.com

import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, Pill, TestTube2, Building2, Newspaper, MapPin, Mail } from 'lucide-react';

const STRUCTURES_URL = import.meta.env.VITE_STRUCTURES_URL || 'http://localhost:5174';
const CONTACT_EMAIL  = 'contactazamed@gmail.com';

const navLinks = [
  { label:'Pharmacies',   to:'/pharmacies',   icon:<Pill size={15}/> },
  { label:'Laboratoires', to:'/laboratoires', icon:<TestTube2 size={15}/> },
  { label:'Hôpitaux',     to:'/hopitaux',     icon:<Building2 size={15}/> },
  { label:'Actualités',   to:'/actualites',   icon:<Newspaper size={15}/> },
  { label:'Carte',        to:'/carte',        icon:<MapPin size={15}/> },
];

function Navbar() {
  const [open, setOpen]  = useState(false);
  const navigate         = useNavigate();
  const { pathname }     = useLocation();

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

          {/* Liens desktop */}
          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith(l.to)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                }`}>
                {l.icon} {l.label}
              </Link>
            ))}
          </div>

          {/* Bouton recherche */}
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/recherche')}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-primary-50 hover:text-primary-600 rounded-xl text-sm text-gray-500 transition-colors">
              <Search size={16}/>
              <span className="hidden sm:block">Rechercher...</span>
            </button>
            <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-gray-500 hover:text-primary-600 rounded-lg">
              {open ? <X size={22}/> : <Menu size={22}/>}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors">
              {l.icon} {l.label}
            </Link>
          ))}
          {/* Contact dans le menu mobile */}
          <a href={`mailto:${CONTACT_EMAIL}`}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
            <Mail size={14}/> {CONTACT_EMAIL}
          </a>
        </div>
      )}
    </nav>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">

          {/* Logo + description */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AZ</span>
              </div>
              <span className="font-bold text-white text-lg">AZAMED</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Annuaire santé du Cameroun. Accès totalement gratuit pour le grand public.
            </p>
            {/* Contact email */}
            <a href={`mailto:${CONTACT_EMAIL}`}
              className="flex items-center gap-2 text-sm text-primary-300 hover:text-primary-200 transition-colors group">
              <Mail size={15} className="shrink-0"/>
              <span className="group-hover:underline">{CONTACT_EMAIL}</span>
            </a>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Navigation</h4>
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

          {/* Professionnels + Contact */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Professionnels de santé</h4>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              Pharmacie, laboratoire, hôpital ? Gérez vos disponibilités et soyez visibles par vos patients.
            </p>
            <a href={STRUCTURES_URL} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 bg-primary-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors mb-4 block w-fit">
              Espace établissements →
            </a>

            <div className="border-t border-gray-700 pt-4">
              <h5 className="font-semibold text-white text-sm mb-2">Contact</h5>
              <a href={`mailto:${CONTACT_EMAIL}`}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-primary-300 transition-colors group">
                <Mail size={14} className="shrink-0 text-primary-400"/>
                <span className="group-hover:underline">{CONTACT_EMAIL}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Barre du bas */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <span>© {new Date().getFullYear()} AZAMED — Annuaire Santé Cameroun — Accès gratuit pour le public</span>
          <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-gray-400 transition-colors flex items-center gap-1">
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
