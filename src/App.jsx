// src/App.jsx — SITE PUBLIC avec médecins
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/Toaster';
import Layout from './components/layout/Layout';

import HomePage              from './pages/HomePage';
import PharmaciesPage        from './pages/PharmaciesPage';
import PharmacieDetailPage   from './pages/PharmacieDetailPage';
import LaboratoiresPage      from './pages/LaboratoiresPage';
import LaboratoireDetailPage from './pages/LaboratoireDetailPage';
import HopitauxPage          from './pages/HopitauxPage';
import HopitalDetailPage     from './pages/HopitalDetailPage';
import MedecinsPage          from './pages/MedecinsPage';
import ActualitesPage        from './pages/ActualitesPage';
import RecherchePage         from './pages/RecherchePage';
import CartePage             from './pages/CartePage';
import InscriptionPage       from './pages/InscriptionPage';
import ConnexionPage         from './pages/ConnexionPage';
import MonComptePage         from './pages/MonComptePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/"                 element={<HomePage />} />
          <Route path="/pharmacies"       element={<PharmaciesPage />} />
          <Route path="/pharmacies/:id"   element={<PharmacieDetailPage />} />
          <Route path="/laboratoires"     element={<LaboratoiresPage />} />
          <Route path="/laboratoires/:id" element={<LaboratoireDetailPage />} />
          <Route path="/hopitaux"         element={<HopitauxPage />} />
          <Route path="/hopitaux/:id"     element={<HopitalDetailPage />} />
          <Route path="/medecins"         element={<MedecinsPage />} />
          <Route path="/actualites"       element={<ActualitesPage />} />
          <Route path="/recherche"        element={<RecherchePage />} />
          <Route path="/carte"            element={<CartePage />} />
          <Route path="/inscription"      element={<InscriptionPage />} />
          <Route path="/connexion"        element={<ConnexionPage />} />
          <Route path="/mon-compte"       element={<MonComptePage />} />
          <Route path="*"                 element={<Navigate to="/" />} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}
