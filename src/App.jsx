// src/App.jsx — SITE PUBLIC avec fiches détail structures
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/Toaster';
import Layout from './components/layout/Layout';

import HomePage              from './pages/HomePage';
import PharmaciesPage        from './pages/PharmaciesPage';
import LaboratoiresPage      from './pages/LaboratoiresPage';
import HopitauxPage          from './pages/HopitauxPage';
import MedecinsPage          from './pages/MedecinsPage';
import ActualitesPage        from './pages/ActualitesPage';
import RecherchePage         from './pages/RecherchePage';
import CartePage             from './pages/CartePage';
import StructureDetailPage   from './pages/StructureDetailPage';
import InscriptionPage       from './pages/InscriptionPage';
import ConnexionPage         from './pages/ConnexionPage';
import MonComptePage         from './pages/MonComptePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/"                       element={<HomePage />} />
          {/* Listes */}
          <Route path="/pharmacies"             element={<PharmaciesPage />} />
          <Route path="/laboratoires"           element={<LaboratoiresPage />} />
          <Route path="/hopitaux"               element={<HopitauxPage />} />
          <Route path="/medecins"               element={<MedecinsPage />} />
          <Route path="/actualites"             element={<ActualitesPage />} />
          <Route path="/recherche"              element={<RecherchePage />} />
          <Route path="/carte"                  element={<CartePage />} />
          {/* ✅ Fiche détail pour TOUS les types de structures */}
          <Route path="/structures/:id"         element={<StructureDetailPage />} />
          <Route path="/pharmacies/:id"         element={<StructureDetailPage />} />
          <Route path="/laboratoires/:id"       element={<StructureDetailPage />} />
          <Route path="/hopitaux/:id"           element={<StructureDetailPage />} />
          {/* Compte utilisateur */}
          <Route path="/inscription"            element={<InscriptionPage />} />
          <Route path="/connexion"              element={<ConnexionPage />} />
          <Route path="/mon-compte"             element={<MonComptePage />} />
          <Route path="*"                       element={<Navigate to="/" />} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}
