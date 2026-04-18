// src/pages/CartePage.jsx
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const ROUTE = { PHARMACIE:'pharmacies', LABORATOIRE:'laboratoires', HOPITAL_PUBLIC:'hopitaux', HOPITAL_PRIVE:'hopitaux', CLINIQUE:'hopitaux', CABINET_MEDICAL:'hopitaux', CABINET_SPECIALISE:'hopitaux', CENTRE_SANTE:'hopitaux' };

export default function CartePage() {
  const { data } = useQuery({
    queryKey: ['structures-carte'],
    queryFn: async () => { const { data } = await api.get('/structures?limit=300'); return data; },
  });

  const structures = (data?.data || []).filter((s) => s.latitude && s.longitude);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Carte des structures</h1>
          <p className="text-xs text-gray-500">{structures.length} structure(s) géolocalisée(s)</p>
        </div>
      </div>
      <div className="flex-1">
        <MapContainer center={[3.848, 11.502]} zoom={12} className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>' />
          {structures.map((s) => (
            <Marker key={s.id} position={[s.latitude, s.longitude]}>
              <Popup>
                <div className="min-w-[160px]">
                  <p className="font-semibold text-sm">{s.nomCommercial}</p>
                  <p className="text-xs text-gray-500 mb-2">{s.ville}</p>
                  <Link to={`/${ROUTE[s.typeStructure] || 'hopitaux'}/${s.id}`} className="text-xs text-primary-600 font-medium hover:underline">
                    Voir la fiche →
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
