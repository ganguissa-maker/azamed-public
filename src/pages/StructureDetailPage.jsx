// src/pages/StructureDetailPage.jsx — Fiche détail établissement
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Phone, MessageCircle, Clock, CheckCircle, Pill, TestTube2, Building2, ChevronLeft, Search } from 'lucide-react';
import api from '../utils/api';

const TYPE_LABELS = {
  PHARMACIE:'Pharmacie', LABORATOIRE:"Laboratoire d'analyses", CENTRE_IMAGERIE:"Centre d'imagerie",
  LABO_ET_IMAGERIE:'Labo & Imagerie', HOPITAL_PUBLIC:'Hôpital Public', POLYCLINIQUE:'Polyclinique',
  CLINIQUE:'Clinique', CABINET_MEDICAL:'Cabinet Médical', CABINET_SPECIALISE:'Cabinet Spécialisé',
  CENTRE_SANTE:'Centre de Santé',
};
const TYPE_COLORS = {
  PHARMACIE:'#2d6a4f', LABORATOIRE:'#7b2d42', CENTRE_IMAGERIE:'#1a237e', LABO_ET_IMAGERIE:'#4a148c',
  HOPITAL_PUBLIC:'#1565c0', POLYCLINIQUE:'#00695c', CLINIQUE:'#6a1b9a',
  CABINET_MEDICAL:'#e65100', CABINET_SPECIALISE:'#37474f', CENTRE_SANTE:'#558b2f',
};

const JOURS_LABELS = { lundi:'Lundi', mardi:'Mardi', mercredi:'Mercredi', jeudi:'Jeudi', vendredi:'Vendredi', samedi:'Samedi', dimanche:'Dimanche' };
const JOURS_KEYS   = ['lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'];

function HorairesDisplay({ horaires, heureOuverture, heureFermeture }) {
  if (!horaires && !heureOuverture) return null;

  if (horaires && typeof horaires === 'object') {
    if (Array.isArray(horaires)) {
      if (!heureOuverture) return null;
      return <p className="text-sm text-gray-700">🕐 {heureOuverture} – {heureFermeture || '?'}</p>;
    }
    if (horaires.mode) return (
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded-full">
        🟢 {horaires.mode}
      </span>
    );
    if (horaires.jours && typeof horaires.jours === 'object' && !Array.isArray(horaires.jours)) {
      const entries = Object.entries(horaires.jours);
      if (entries.length > 0) return (
        <div className="space-y-1">
          {entries.map(([jour, h]) => (
            <div key={jour} className="flex items-center justify-between text-sm py-1 border-b border-gray-50 last:border-0">
              <span className="text-gray-500 w-24">{JOURS_LABELS[jour] || jour}</span>
              <span className="font-semibold text-gray-900">{h.debut||h.ouverture||'?'} – {h.fin||h.fermeture||'?'}</span>
            </div>
          ))}
        </div>
      );
    }
    const joursPresents = JOURS_KEYS.filter((k) => horaires[k]);
    if (joursPresents.length > 0) return (
      <div className="space-y-1">
        {joursPresents.map((jour) => {
          const info = horaires[jour];
          if (!info) return null;
          const ferme = info.ouvert === false;
          return (
            <div key={jour} className="flex items-center justify-between text-sm py-1 border-b border-gray-50 last:border-0">
              <span className="text-gray-500 w-24">{JOURS_LABELS[jour]}</span>
              {ferme
                ? <span className="text-gray-300">Fermé</span>
                : <span className="font-semibold text-gray-900">{info.debut||info.ouverture||'?'} – {info.fin||info.fermeture||'?'}</span>}
            </div>
          );
        })}
      </div>
    );
  }

  if (typeof horaires === 'string') {
    const is247 = horaires.toLowerCase().includes('24h') || horaires.toLowerCase().includes('7j');
    if (is247) return (
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded-full">
        🟢 {horaires}
      </span>
    );
    return <p className="text-sm text-gray-700">{horaires}</p>;
  }

  if (heureOuverture) return (
    <p className="text-sm font-medium text-gray-700">🕐 {heureOuverture} – {heureFermeture || '?'}</p>
  );
  return null;
}

export default function StructureDetailPage() {
  const { id } = useParams();
  const [medSearch, setMedSearch] = useState('');

  const { data: structure, isLoading } = useQuery({
    queryKey: ['structure', id],
    queryFn: async () => { const { data } = await api.get(`/structures/${id}`); return data; },
  });

  if (isLoading) return (
    <div className="max-w-3xl mx-auto px-4 py-10 animate-pulse space-y-4">
      <div className="h-44 bg-gray-100 rounded-2xl"/>
      <div className="h-32 bg-gray-100 rounded-2xl"/>
      <div className="h-48 bg-gray-100 rounded-2xl"/>
    </div>
  );

  if (!structure) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <p className="text-gray-500 text-lg mb-4">Établissement introuvable.</p>
      <Link to="/" className="text-primary-600 hover:underline">← Retour à l'accueil</Link>
    </div>
  );

  const couleur = TYPE_COLORS[structure.typeStructure] || '#0284c7';
  const label   = TYPE_LABELS[structure.typeStructure] || structure.typeStructure;

  const meds     = structure.pharmacieMedicaments || [];
  const examens  = structure.laboExamens          || [];
  const services = structure.hopitalServices      || [];

  const medsFiltered = medSearch
    ? meds.filter((pm) =>
        pm.medicament?.nomCommercial?.toLowerCase().includes(medSearch.toLowerCase()) ||
        pm.medicament?.dci?.toLowerCase().includes(medSearch.toLowerCase()))
    : meds;

  const group = (arr, fn) => arr.reduce((acc, item) => {
    const k = fn(item) || 'Autres';
    if (!acc[k]) acc[k] = [];
    acc[k].push(item); return acc;
  }, {});

  const medsG     = group(medsFiltered, (pm) => pm.medicament?.classeTherapeutique);
  const examensG  = group(examens,      (le) => le.examen?.categorie);
  const servicesG = group(services,     (hs) => hs.service?.categorie);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to={-1} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-6 transition-colors">
        <ChevronLeft size={16}/> Retour
      </Link>

      {/* Header */}
      <div className="rounded-2xl p-6 mb-6 relative overflow-hidden"
        style={{ background:`linear-gradient(135deg, ${couleur}, ${couleur}cc)` }}>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-9xl opacity-10 select-none pointer-events-none">
          {structure.typeStructure==='PHARMACIE'?'💊':['LABORATOIRE','CENTRE_IMAGERIE','LABO_ET_IMAGERIE'].includes(structure.typeStructure)?'🔬':'🏥'}
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
                <MapPin size={13}/>{structure.quartier ? `${structure.quartier}, ` : ''}{structure.ville}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-3 mt-5 flex-wrap">
          {structure.telephone && (
            <a href={`tel:${structure.telephone}`}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm text-white font-semibold transition-colors">
              <Phone size={14}/>{structure.telephone}
            </a>
          )}
          {structure.whatsapp && (
            <a href={`https://wa.me/${structure.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-green-500/80 hover:bg-green-500 rounded-xl text-sm text-white font-semibold transition-colors">
              <MessageCircle size={14}/>WhatsApp
            </a>
          )}
        </div>
      </div>

      {/* Infos + Horaires */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-5">
        <h2 className="font-bold text-gray-900 mb-3">Informations</h2>
        {(structure.adresse||structure.ville) && (
          <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
            <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0"/>
            <span>{[structure.adresse,structure.quartier,structure.ville,structure.pays].filter(Boolean).join(', ')}</span>
          </div>
        )}
        {structure.description && (
          <p className="text-sm text-gray-600 leading-relaxed mb-3">{structure.description.split('—')[0].trim()}</p>
        )}
        {(structure.horaires||structure.heureOuverture) && (
          <div className="border-t border-gray-100 pt-3 mt-3">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={13} className="text-gray-400"/>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Horaires d'ouverture</p>
            </div>
            <HorairesDisplay horaires={structure.horaires} heureOuverture={structure.heureOuverture} heureFermeture={structure.heureFermeture}/>
          </div>
        )}
      </div>

      {/* Médicaments */}
      {meds.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor:couleur+'20' }}>
              <Pill size={15} style={{ color:couleur }}/>
            </div>
            <h2 className="font-bold text-gray-900">Médicaments ({meds.length})</h2>
          </div>
          <div className="relative mb-4">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input type="text" placeholder="Rechercher un médicament..." value={medSearch} onChange={(e) => setMedSearch(e.target.value)}
              className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"/>
          </div>
          {Object.entries(medsG).map(([cls, items]) => (
            <div key={cls} className="mb-4">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 bg-gray-50 px-2 py-1 rounded-lg">{cls}</p>
              {items.map((pm) => (
                <div key={pm.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{pm.medicament?.nomCommercial}</p>
                    <p className="text-xs text-gray-400">{pm.medicament?.dci} · {pm.medicament?.forme} · {pm.medicament?.dosage}</p>
                  </div>
                  {pm.prix && <span className="text-sm font-bold shrink-0" style={{ color:couleur }}>{Number(pm.prix).toLocaleString()} F</span>}
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${pm.enStock?'bg-green-500':'bg-gray-300'}`} title={pm.enStock?'En stock':'Rupture'}/>
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
        <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor:couleur+'20' }}>
              <TestTube2 size={15} style={{ color:couleur }}/>
            </div>
            <h2 className="font-bold text-gray-900">Examens ({examens.length})</h2>
          </div>
          {Object.entries(examensG).map(([cat, items]) => (
            <div key={cat} className="mb-4">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 bg-gray-50 px-2 py-1 rounded-lg">{cat}</p>
              {items.map((le) => (
                <div key={le.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900">{le.examen?.nom}</p>
                    <p className="text-xs text-gray-400">{le.examen?.codeAzamed}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {le.prix && <p className="text-sm font-bold" style={{ color:couleur }}>{Number(le.prix).toLocaleString()} F</p>}
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
        <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor:couleur+'20' }}>
              <Building2 size={15} style={{ color:couleur }}/>
            </div>
            <h2 className="font-bold text-gray-900">Services médicaux ({services.length})</h2>
          </div>
          {Object.entries(servicesG).map(([cat, items]) => (
            <div key={cat} className="mb-4">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 bg-gray-50 px-2 py-1 rounded-lg">{cat}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {items.map((hs) => (
                  <div key={hs.id} className="flex items-start gap-2 p-2.5 rounded-xl border border-gray-100 bg-gray-50/50">
                    <CheckCircle size={13} className="text-green-500 shrink-0 mt-0.5"/>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{hs.service?.nom}</p>
                      <div className="flex items-center gap-2 flex-wrap mt-0.5">
                        {hs.prixConsultation && <span className="text-xs font-semibold" style={{ color:couleur }}>{Number(hs.prixConsultation).toLocaleString()} FCFA</span>}
                        {hs.modeConsultation && (
                          <span className="text-xs text-gray-400">
                            {hs.modeConsultation==='SUR_RDV'?'📅 Sur RDV':hs.modeConsultation==='TOUS_LES_JOURS'?'🗓️ Tous les jours':'📆 Jours ouvrables'}
                          </span>
                        )}
                      </div>
                      {hs.infoSupplementaire && <p className="text-xs text-gray-400 italic mt-0.5">{hs.infoSupplementaire}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {meds.length===0 && examens.length===0 && services.length===0 && (
        <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
          <p className="text-3xl mb-3">🏥</p>
          <p className="text-gray-400 text-sm">Cet établissement n'a pas encore renseigné ses services.</p>
          <p className="text-gray-400 text-xs mt-1">Contactez-le directement pour plus d'informations.</p>
        </div>
      )}
    </div>
  );
}
