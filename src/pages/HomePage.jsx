// src/pages/HomePage.jsx
import { Link } from 'react-router-dom';
import { Pill, TestTube2, Building2, Newspaper, MapPin, Zap, Shield, Globe } from 'lucide-react';
import SmartSearch from '../components/search/SmartSearch';

const modules = [
  { icon:<Pill size={26} className="text-green-600" />,    label:'Pharmacies',   desc:'Médicaments disponibles',       to:'/pharmacies',   color:'bg-green-50 border-green-100 hover:border-green-300' },
  { icon:<TestTube2 size={26} className="text-blue-600" />, label:'Laboratoires', desc:'Examens médicaux et prix',       to:'/laboratoires', color:'bg-blue-50 border-blue-100 hover:border-blue-300' },
  { icon:<Building2 size={26} className="text-primary-600" />, label:'Hôpitaux',  desc:'Structures hospitalières',       to:'/hopitaux',     color:'bg-primary-50 border-primary-100 hover:border-primary-300' },
  { icon:<Newspaper size={26} className="text-purple-600" />, label:'Actualités', desc:'Infos des établissements',       to:'/actualites',   color:'bg-purple-50 border-purple-100 hover:border-purple-300' },
  { icon:<MapPin size={26} className="text-orange-600" />,  label:'Carte',        desc:'Structures autour de vous',      to:'/carte',        color:'bg-orange-50 border-orange-100 hover:border-orange-300' },
];

const features = [
  { icon:<Zap size={20} className="text-amber-500" />,    title:'Recherche instantanée',  desc:'Trouvez un médicament ou un examen disponible en quelques secondes.' },
  { icon:<Shield size={20} className="text-green-500" />, title:'Informations en temps réel', desc:'Chaque établissement met à jour ses disponibilités et prix.' },
  { icon:<Globe size={20} className="text-primary-500" />,title:'Tout le Cameroun',       desc:'Pharmacies, laboratoires et hôpitaux de tout le pays.' },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Trouvez le bon service de santé,<br className="hidden sm:block" /> au bon endroit
          </h1>
          <p className="text-primary-100 text-base sm:text-lg mb-10 max-w-2xl mx-auto">
            AZAMED connecte les patients aux pharmacies, laboratoires et hôpitaux du Cameroun. Médicaments disponibles, prix des examens, services médicaux — tout en un clic.
          </p>
          <div className="max-w-2xl mx-auto">
            <SmartSearch large />
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-5 text-sm text-primary-100">
            {['💊 Paracétamol', '🔬 NFS', '❤️ Cardiologie', '🏥 Urgences', '💉 Vaccination'].map((t) => (
              <span key={t} className="bg-white/10 px-3 py-1 rounded-full text-xs">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Explorer par catégorie</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {modules.map((m) => (
            <Link key={m.to} to={m.to}
              className={`card border-2 ${m.color} transition-all hover:-translate-y-1 hover:shadow-md flex flex-col items-center text-center gap-2 py-6 cursor-pointer`}>
              {m.icon}
              <span className="font-semibold text-gray-900 text-sm">{m.label}</span>
              <span className="text-xs text-gray-500 leading-tight hidden sm:block">{m.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-t border-gray-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-8">Pourquoi utiliser AZAMED ?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="text-center p-6 rounded-2xl bg-gray-50">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA pro */}
      <section className="bg-primary-600 text-white py-10 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl font-bold mb-2">Vous gérez un établissement de santé ?</h2>
          <p className="text-primary-100 mb-5 text-sm">Inscrivez votre pharmacie, laboratoire ou hôpital gratuitement et soyez visible par des milliers de patients.</p>
          <a href={`${import.meta.env.VITE_STRUCTURES_URL || 'http://localhost:5174'}`}
            target="_blank" rel="noreferrer"
            className="inline-block bg-white text-primary-700 font-bold px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors text-sm">
            Inscrire mon établissement gratuitement →
          </a>
        </div>
      </section>
    </div>
  );
}
