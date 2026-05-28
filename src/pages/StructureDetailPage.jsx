// src/pages/StructureDetailPage.jsx — Horaires corrects + prix médicaments/examens/services
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  MapPin, Phone, MessageCircle, Clock, CheckCircle,
  Pill, TestTube2, Building2, ChevronLeft, Search,
} from 'lucide-react';
import api from '../utils/api';

const TYPE_LABELS = {
  PHARMACIE:'Pharmacie', LABORATOIRE:"Laboratoire d'analyses",
  CENTRE_IMAGERIE:"Centre d'imagerie", LABO_ET_IMAGERIE:'Labo & Imagerie',
  HOPITAL_PUBLIC:'Hôpital Public/Parapublic', POLYCLINIQUE:'Polyclinique',
  CLINIQUE:'Clinique', CABINET_MEDICAL:'Cabinet Médical',
  CABINET_SPECIALISE:'Cabinet Spécialisé', CENTRE_SANTE:'Centre de Santé',
};
const TYPE_COLORS = {
  PHARMACIE:'#2d6a4f', LABORATOIRE:'#7b2d42', CENTRE_IMAGERIE:'#1a237e',
  LABO_ET_IMAGERIE:'#4a148c', HOPITAL_PUBLIC:'#1565c0', POLYCLINIQUE:'#00695c',
  CLINIQUE:'#6a1b9a', CABINET_MEDICAL:'#e65100', CABINET_SPECIALISE:'#37474f', CENTRE_SANTE:'#558b2f',
};
const TYPE_BG = {
  PHARMACIE:'#d8f3dc', LABORATOIRE:'#fce4ec', CENTRE_IMAGERIE:'#e8eaf6',
  LABO_ET_IMAGERIE:'#f3e5f5', HOPITAL_PUBLIC:'#e3f2fd', POLYCLINIQUE:'#e0f2f1',
  CLINIQUE:'#f3e5f5', CABINET_MEDICAL:'#fff3e0', CABINET_SPECIALISE:'#eceff1', CENTRE_SANTE:'#f1f8e9',
};

// ─── Affichage horaires ────────────────────────────────────────
function HorairesDisplay({ horaires, heureOuverture, heureFermeture }) {
  const JOURS_LABELS = {
    lundi:'Lundi', mardi:'Mardi', mercredi:'Mercredi',
    jeudi:'Jeudi', vendredi:'Vendredi', samedi:'Samedi', dimanche:'Dimanche',
  };

  if (!horaires && !heureOuverture) return null;

  // Objet JSON
  if (horaires && typeof horaires === 'object') {
    // 24h/24
    if (horaires.mode) {
      return (
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded-full">
          🕐 {horaires.mode}
        </span>
      );
    }
    // Jours individuels {jours: {lundi:{debut,fin}}}
    if (horaires.jours && typeof horaires.jours === 'object') {
      const entries = Object.entries(horaires.jours);
      if (entries.length > 0) {
        return (
          <div className="space-y-1">
            {entries.map(([jour, h]) => (
              <div key={jour} className="flex items-center justify-between text-sm border-b border-gray-50 pb-1">
                <span className="text-gray-500 w-24">{JOURS_LABELS[jour] || jour}</span>
                <span className="font-semibold text-gray-900">{h.debut || h.ouverture} – {h.fin || h.fermeture}</span>
              </div>
            ))}
          </div>
        );
      }
    }
    // Format direct {lundi:{ouvert,debut,fin}}
    const joursData = Object.keys(JOURS_LABELS).filter((k) => horaires[k]);
    if (joursData.length > 0) {
      return (
        <div className="space-y-1">
          {joursData.map((jour) => {
            const info = horaires[jour];
            if (!info?.ouvert && !info?.debut) return null;
            return (
              <div key={jour} className="flex items-center justify-between text-sm border-b border-gray-50 pb-1">
                <span className="text-gray-500 w-24">{JOURS_LABELS[jour]}</span>
                <span className="font-semibold text-gray-900">
                  {info.debut || info.ouverture || '?'} – {info.fin || info.fermeture || '?'}
                </span>
              </div>
            );
          })}
        </div>
      );
    }
  }

  // Format string
  if (horaires && typeof horaires === 'string') {
    if (horaires.toLowerCase().includes('24h') || horaires.toLowerCase().includes('7j')) {
      return (
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded-full">
          🕐 {horaires}
        </span>
      );
    }
    // Format "lundi,mardi 08:00-18:00"
    return <p className="text-sm text-gray-700">{horaires}</p>;
  }

  // Fallback heureOuverture/heureFermeture
  if (heureOuverture) {
    return (
      <p className="text-sm text-gray-700 font-medium">
        {heureOuverture} – {heureFermeture || '?'}
      </p>
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
          <div className="h-44 bg-gray-100 rounded-2xl"/>
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
  const label   = TYPE_LABELS[structure.typeStructure] || structure.typeStructure;

  const meds     = structure.pharmacieMedicaments || [];
  const examens  = structure.laboExamens          || [];
  const services = structure.hopitalServices      || [];

  // Filtrage médicaments
  const medsFiltered = medSearch
    ? meds.filter((pm) =>
        pm.medicament?.nomCommercial?.toLowerCase().includes(medSearch.toLowerCase()) ||
        pm.medicament?.dci?.toLowerCase().includes(medSearch.toLowerCase())
      )
    : meds;

  const group = (arr, keyFn) => arr.reduce((acc, item) => {
    const k = keyFn(item) || 'Autres';
    if (!acc[k]) acc[k] = [];
    acc[k].push(item); return acc;
  }, {});

  const medsGrouped     = group(medsFiltered, (pm) => pm.medicament?.classeTherapeutique);
  const examensGrouped  = group(examens,       (le) => le.examen?.categorie);
  const servicesGrouped = group(services,       (hs) => hs.service?.categorie);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to={-1} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-6">
        <ChevronLeft size={16}/> Retour
      </Link>

      {/* Header */}
      <div className="rounded-2xl p-6 mb-6 relative overflow-hidden"
        style={{ background:`linear-gradient(135deg, ${couleur}, ${couleur}cc)` }}>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-8xl opacity-10 select-none">
          {structure.typeStructure === 'PHARMACIE' ? '💊'
           : ['LABORATOIRE','CENTRE_IMAGERIE','LABO_ET_IMAGERIE'].includes(structure.typeStructure) ? '🔬'
           : '🏥'}
        </div>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <span className="text-white font-extrabold text-2xl">{structure.nomCommercial?.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-xl font-bold text-white">{structure.nomCommercial}</h1>
              <CheckCircle size={16} className="text-green-300 shrink-0"/>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 text-white">{label}</span>
            {structure.ville && (
              <p className="text-white/70 text-sm mt-2 flex items-center gap-1.5">
                <MapPin size={13}/> {structure.quartier ? `${structure.quartier}, ` : ''}{structure.ville}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-3 mt-5 flex-wrap">
          {structure.telephone && (
            <a href={`tel:${structure.telephone}`}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm text-white font-semibold">
              <Phone size={15}/> {structure.telephone}
            </a>
          )}
          {structure.whatsapp && (
            <a href={`https://wa.me/${structure.whatsapp.replace(/\D/g,'')}`}
              target="_blank" rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-green-500/80 hover:bg-green-500 rounded-xl text-sm text-white font-semibold">
              <MessageCircle size={15}/> WhatsApp
            </a>
          )}
        </div>
      </div>

      {/* Infos + Horaires */}
      <div className="card mb-6">
        <h2 className="font-bold text-gray-900 mb-3">Informations</h2>
        {(structure.adresse || structure.ville) && (
          <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
            <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0"/>
            <span>{[structure.adresse, structure.quartier, structure.ville, structure.pays].filter(Boolean).join(', ')}</span>
          </div>
        )}
        {structure.description && (
          <p className="text-sm text-gray-600 leading-relaxed mb-3">
            {structure.description.split('—')[0].trim()}
          </p>
        )}

        {/* ✅ Horaires */}
        {(structure.horaires || structure.heureOuverture) && (
          <div className="border-t border-gray-100 pt-3 mt-3">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={14} className="text-gray-400"/>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Horaires d'ouverture</p>
            </div>
            <HorairesDisplay
              horaires={structure.horaires}
              heureOuverture={structure.heureOuverture}
              heureFermeture={structure.heureFermeture}
            />
          </div>
        )}
      </div>

      {/* Médicaments */}
      {meds.length > 0 && (
        <div className="card mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: bg }}>
              <Pill size={16} style={{ color: couleur }}/>
            </div>
            <h2 className="font-bold text-gray-900">Médicaments disponibles ({meds.length})</h2>
          </div>
          <div className="relative mb-4">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input type="text" placeholder="Rechercher un médicament..."
              value={medSearch} onChange={(e) => setMedSearch(e.target.value)}
              className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"/>
          </div>
          {Object.entries(medsGrouped).map(([cls, items]) => (
            <div key={cls} className="mb-4">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 bg-gray-50 px-2 py-1 rounded-lg">{cls}</p>
              {items.map((pm) => (
                <div key={pm.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{pm.medicament?.nomCommercial}</p>
                    <p className="text-xs text-gray-400">{pm.medicament?.dci} · {pm.medicament?.forme} · {pm.medicament?.dosage}</p>
                  </div>
                  {pm.prix && (
                    <span className="text-sm font-bold shrink-0" style={{ color: couleur }}>
                      {Number(pm.prix).toLocaleString()} F
                    </span>
                  )}
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${pm.enStock ? 'bg-green-500' : 'bg-gray-300'}`}
                    title={pm.enStock ? 'En stock' : 'Rupture'}/>
                </div>
              ))}
            </div>
          ))}
          <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-100 text-xs text-gray-400">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"/> En stock</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300 inline-block"/> Rupture</span>
          </div>
        </div>
      )}

      {/* Examens */}
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
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 bg-gray-50 px-2 py-1 rounded-lg">{cat}</p>
              {items.map((le) => (
                <div key={le.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900">{le.examen?.nom}</p>
                    <p className="text-xs text-gray-400">{le.examen?.codeAzamed}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {le.prix && (
                      <p className="text-sm font-bold" style={{ color: couleur }}>
                        {Number(le.prix).toLocaleString()} F
                      </p>
                    )}
                    {le.delaiMax && <p className="text-xs text-gray-400">~{le.delaiMax}h</p>}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Services */}
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
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 bg-gray-50 px-2 py-1 rounded-lg">{cat}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {items.map((hs) => (
                  <div key={hs.id} className="flex items-start gap-2 p-2.5 rounded-xl border border-gray-100 bg-gray-50/50">
                    <CheckCircle size={13} className="text-green-500 shrink-0 mt-0.5"/>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{hs.service?.nom}</p>
                      <div className="flex items-center gap-2 flex-wrap mt-0.5">
                        {hs.prixConsultation && (
                          <span className="text-xs font-semibold" style={{ color: couleur }}>
                            {Number(hs.prixConsultation).toLocaleString()} FCFA
                          </span>
                        )}
                        {hs.modeConsultation && (
                          <span className="text-xs text-gray-400">
                            {hs.modeConsultation === 'SUR_RDV'         ? '📅 Sur RDV'
                             : hs.modeConsultation === 'TOUS_LES_JOURS' ? '🗓️ Tous les jours'
                             : '📆 Jours ouvrables'}
                          </span>
                        )}
                      </div>
                      {hs.infoSupplementaire && (
                        <p className="text-xs text-gray-400 italic mt-0.5">{hs.infoSupplementaire}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {meds.length === 0 && examens.length === 0 && services.length === 0 && (
        <div className="card text-center py-10">
          <p className="text-gray-400 text-sm">Cet établissement n'a pas encore renseigné ses services.</p>
          <p className="text-gray-400 text-xs mt-1">Contactez-le directement pour plus d'informations.</p>
        </div>
      )}
    </div>
  );
}
