// src/pages/StructureDetailPage.jsx — Fiche publique complète d'un établissement
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  MapPin, Phone, MessageCircle, Clock, CheckCircle,
  Pill, TestTube2, Building2, ChevronLeft, Search,
  Shield, Mail, Globe,
} from 'lucide-react';
import api from '../utils/api';

const TYPE_LABELS = {
  PHARMACIE:'Pharmacie', LABORATOIRE:'Laboratoire d\'analyses',
  CENTRE_IMAGERIE:'Centre d\'imagerie', LABO_ET_IMAGERIE:'Labo & Imagerie',
  HOPITAL_PUBLIC:'Hôpital Public/Parapublic', POLYCLINIQUE:'Polyclinique',
  CLINIQUE:'Clinique', CABINET_MEDICAL:'Cabinet Médical',
  CABINET_SPECIALISE:'Cabinet Spécialisé', CENTRE_SANTE:'Centre de Santé',
};

const TYPE_COLORS = {
  PHARMACIE:'#2d6a4f', LABORATOIRE:'#7b2d42', CENTRE_IMAGERIE:'#1a237e',
  LABO_ET_IMAGERIE:'#4a148c', HOPITAL_PUBLIC:'#1565c0', POLYCLINIQUE:'#00695c',
  CLINIQUE:'#6a1b9a', CABINET_MEDICAL:'#e65100', CABINET_SPECIALISE:'#37474f',
  CENTRE_SANTE:'#558b2f',
};

const TYPE_BG = {
  PHARMACIE:'#d8f3dc', LABORATOIRE:'#fce4ec', CENTRE_IMAGERIE:'#e8eaf6',
  LABO_ET_IMAGERIE:'#f3e5f5', HOPITAL_PUBLIC:'#e3f2fd', POLYCLINIQUE:'#e0f2f1',
  CLINIQUE:'#f3e5f5', CABINET_MEDICAL:'#fff3e0', CABINET_SPECIALISE:'#eceff1',
  CENTRE_SANTE:'#f1f8e9',
};

function InfoRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div className="mt-0.5 text-gray-400 shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function HorairesDisplay({ horaires }) {
  if (!horaires) return null;
  if (typeof horaires === 'string') return <p className="text-sm text-gray-700">{horaires}</p>;
  if (horaires.mode) return <p className="text-sm font-semibold text-gray-700">{horaires.mode}</p>;
  if (horaires.jours) {
    const JOURS = { lundi:'Lundi', mardi:'Mardi', mercredi:'Mercredi', jeudi:'Jeudi', vendredi:'Vendredi', samedi:'Samedi', dimanche:'Dimanche' };
    return (
      <div className="space-y-1">
        {Object.entries(horaires.jours).map(([jour, h]) => (
          <div key={jour} className="flex items-center justify-between text-sm">
            <span className="text-gray-600 w-24">{JOURS[jour] || jour}</span>
            <span className="font-medium text-gray-900">{h.debut} – {h.fin}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function StructureDetailPage() {
  const { id } = useParams();
  const [medSearch, setMedSearch] = useState('');

  const { data: structure, isLoading } = useQuery({
    queryKey: ['structure-detail', id],
    queryFn: async () => {
      const { data } = await api.get(`/structures/${id}`);
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-40 bg-gray-100 rounded-2xl"/>
          <div className="h-32 bg-gray-100 rounded-2xl"/>
          <div className="h-48 bg-gray-100 rounded-2xl"/>
        </div>
      </div>
    );
  }

  if (!structure) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 text-lg mb-4">Établissement introuvable ou non vérifié.</p>
        <Link to="/" className="text-primary-600 hover:underline">← Retour à l'accueil</Link>
      </div>
    );
  }

  const couleur = TYPE_COLORS[structure.typeStructure] || '#0284c7';
  const bg      = TYPE_BG[structure.typeStructure]     || '#e0f2fe';
  const label   = TYPE_LABELS[structure.typeStructure]  || structure.typeStructure;

  // Médicaments filtrés
  const meds = (structure.pharmacieMedicaments || []).filter((pm) =>
    !medSearch || pm.medicament?.nomCommercial?.toLowerCase().includes(medSearch.toLowerCase()) ||
    pm.medicament?.dci?.toLowerCase().includes(medSearch.toLowerCase())
  );
  const medsGrouped = meds.reduce((acc, pm) => {
    const k = pm.medicament?.classeTherapeutique || 'Autres';
    if (!acc[k]) acc[k] = [];
    acc[k].push(pm);
    return acc;
  }, {});

  // Examens groupés
  const examens = structure.laboExamens || [];
  const examensGrouped = examens.reduce((acc, le) => {
    const k = le.examen?.categorie || 'Autres';
    if (!acc[k]) acc[k] = [];
    acc[k].push(le);
    return acc;
  }, {});

  // Services groupés
  const services = structure.hopitalServices || [];
  const servicesGrouped = services.reduce((acc, hs) => {
    const k = hs.service?.categorie || 'Autres';
    if (!acc[k]) acc[k] = [];
    acc[k].push(hs);
    return acc;
  }, {});

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Retour */}
      <Link to={-1} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-6 transition-colors">
        <ChevronLeft size={16}/> Retour
      </Link>

      {/* Header structure */}
      <div className="rounded-2xl p-6 mb-6 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${couleur}, ${couleur}cc)` }}>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-8xl opacity-10 select-none">
          {structure.typeStructure === 'PHARMACIE' ? '💊'
           : structure.typeStructure === 'LABORATOIRE' ? '🔬'
           : structure.typeStructure === 'CENTRE_IMAGERIE' ? '🩻'
           : '🏥'}
        </div>
        <div className="flex items-start gap-4">
          {structure.logoUrl ? (
            <img src={structure.logoUrl} alt={structure.nomCommercial}
              className="w-16 h-16 rounded-2xl object-cover shrink-0 border-2 border-white/30"/>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <span className="text-white font-extrabold text-2xl">
                {structure.nomCommercial?.charAt(0)}
              </span>
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-xl font-bold text-white">{structure.nomCommercial}</h1>
              <CheckCircle size={16} className="text-green-300 shrink-0"/>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 text-white">
              {label}
            </span>
            {(structure.ville || structure.quartier) && (
              <p className="text-white/70 text-sm mt-2 flex items-center gap-1.5">
                <MapPin size={13}/>
                {structure.quartier ? `${structure.quartier}, ` : ''}{structure.ville}
              </p>
            )}
            {/* Horaires rapides */}
            {structure.heureOuverture && (
              <p className="text-white/70 text-sm flex items-center gap-1.5 mt-1">
                <Clock size={13}/>
                {structure.heureOuverture} – {structure.heureFermeture}
              </p>
            )}
          </div>
        </div>

        {/* Boutons contact */}
        <div className="flex gap-3 mt-5 flex-wrap">
          {structure.telephone && (
            <a href={`tel:${structure.telephone}`}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm text-white font-semibold transition-colors">
              <Phone size={15}/> {structure.telephone}
            </a>
          )}
          {structure.whatsapp && (
            <a href={`https://wa.me/${structure.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-green-500/80 hover:bg-green-500 rounded-xl text-sm text-white font-semibold transition-colors">
              <MessageCircle size={15}/> WhatsApp
            </a>
          )}
        </div>
      </div>

      {/* Informations générales */}
      <div className="card mb-6">
        <h2 className="font-bold text-gray-900 mb-3">Informations</h2>
        <InfoRow icon={<MapPin size={15}/>} label="Adresse"
          value={[structure.adresse, structure.quartier, structure.ville, structure.pays].filter(Boolean).join(', ')}/>
        {structure.description && (
          <div className="py-2.5 border-b border-gray-50">
            <p className="text-xs text-gray-400 mb-1">Description</p>
            <p className="text-sm text-gray-700 leading-relaxed">{structure.description}</p>
          </div>
        )}
        {/* Horaires */}
        {structure.horaires && (
          <div className="py-2.5">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={15} className="text-gray-400"/>
              <p className="text-xs text-gray-400">Horaires d'ouverture</p>
            </div>
            <HorairesDisplay horaires={structure.horaires}/>
          </div>
        )}
      </div>

      {/* MÉDICAMENTS */}
      {meds.length > 0 && (
        <div className="card mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: bg }}>
              <Pill size={16} style={{ color: couleur }}/>
            </div>
            <h2 className="font-bold text-gray-900">Médicaments disponibles ({meds.length})</h2>
          </div>
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input type="text" placeholder="Rechercher un médicament..." value={medSearch}
              onChange={(e) => setMedSearch(e.target.value)}
              className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"/>
          </div>
          {Object.entries(medsGrouped).map(([classe, items]) => (
            <div key={classe} className="mb-4">
              <p className="text-xs font-bold uppercase text-gray-400 mb-2 px-2 py-1 rounded-lg bg-gray-50">{classe}</p>
              {items.map((pm) => (
                <div key={pm.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{pm.medicament?.nomCommercial}</p>
                    <p className="text-xs text-gray-400">{pm.medicament?.dci} · {pm.medicament?.forme}</p>
                  </div>
                  {pm.prix && <span className="text-sm font-bold shrink-0" style={{ color: couleur }}>{pm.prix.toLocaleString()} F</span>}
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${pm.enStock ? 'bg-green-500' : 'bg-gray-300'}`}
                    title={pm.enStock ? 'En stock' : 'Rupture'}/>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* EXAMENS */}
      {examens.length > 0 && (
        <div className="card mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: bg }}>
              <TestTube2 size={16} style={{ color: couleur }}/>
            </div>
            <h2 className="font-bold text-gray-900">Examens disponibles ({examens.length})</h2>
          </div>
          {Object.entries(examensGrouped).map(([cat, items]) => (
            <div key={cat} className="mb-4">
              <p className="text-xs font-bold uppercase text-gray-400 mb-2 px-2 py-1 rounded-lg bg-gray-50">{cat}</p>
              {items.map((le) => (
                <div key={le.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{le.examen?.nom}</p>
                    <p className="text-xs text-gray-400">{le.examen?.codeAzamed}</p>
                  </div>
                  {le.prix && <span className="text-sm font-bold shrink-0" style={{ color: couleur }}>{le.prix.toLocaleString()} F</span>}
                  {le.delaiMax && <span className="text-xs text-gray-400 shrink-0">~{le.delaiMax}h</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* SERVICES */}
      {services.length > 0 && (
        <div className="card mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: bg }}>
              <Building2 size={16} style={{ color: couleur }}/>
            </div>
            <h2 className="font-bold text-gray-900">Services médicaux ({services.length})</h2>
          </div>
          {Object.entries(servicesGrouped).map(([cat, items]) => (
            <div key={cat} className="mb-4">
              <p className="text-xs font-bold uppercase text-gray-400 mb-2 px-2 py-1 rounded-lg bg-gray-50">{cat}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {items.map((hs) => (
                  <div key={hs.id} className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-100 bg-gray-50">
                    <CheckCircle size={13} className="text-green-500 shrink-0"/>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{hs.service?.nom}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {hs.prixConsultation && (
                          <span className="text-xs font-semibold" style={{ color: couleur }}>
                            {hs.prixConsultation.toLocaleString()} F
                          </span>
                        )}
                        {hs.modeConsultation && (
                          <span className="text-xs text-gray-400">
                            {hs.modeConsultation === 'SUR_RDV' ? '📅 Sur RDV'
                             : hs.modeConsultation === 'TOUS_LES_JOURS' ? '🗓️ Tous les jours'
                             : '📆 Jours ouvrables'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Aucune info renseignée */}
      {meds.length === 0 && examens.length === 0 && services.length === 0 && (
        <div className="card text-center py-10">
          <p className="text-gray-400 text-sm">Cet établissement n'a pas encore renseigné ses services.</p>
          <p className="text-gray-400 text-xs mt-1">Contactez-le directement pour plus d'informations.</p>
        </div>
      )}
    </div>
  );
}
