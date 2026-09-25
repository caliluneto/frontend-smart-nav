import { useState, useEffect, useMemo } from 'react';
import { Eye, X, ExternalLink, Compass, MapPin, Satellite, Info } from 'lucide-react';

// ============================================================================
// Pontos oficiais com Street View 360° garantido pelo Google no entorno da UNAERP
// (O carro do Google Street View percorre as vias públicas de acesso ao campus)
// ============================================================================
const VERIFIED_STREETVIEW_ENTRANCES = [
  {
    id: 'portaria-principal',
    name: 'Portaria Principal UNAERP',
    latitude: -21.2018,
    longitude: -47.7808,
    description: 'Entrada principal — Av. Costábile Romano',
  },
  {
    id: 'campus-central',
    name: 'UNAERP Ribeirão Preto',
    latitude: -21.2010,
    longitude: -47.7792,
    description: 'Vista geral do campus',
  },
  {
    id: 'hospital-bonini',
    name: 'Acesso Sul UNAERP',
    latitude: -21.2006,
    longitude: -47.7803,
    description: 'Entrada pelo Hospital Electro Bonini',
  },
];

// Helper para calcular distância aproximada
const getDist = (lat1, lon1, lat2, lon2) => {
  return Math.hypot(lat2 - lat1, lon2 - lon1);
};

export default function StreetViewModal({ isOpen, onClose, location }) {
  const [activeTab, setActiveTab] = useState('streetview'); // 'streetview' | 'satellite'
  const [selectedEntrance, setSelectedEntrance] = useState(VERIFIED_STREETVIEW_ENTRANCES[0]);

  // Encontra a entrada com Street View mais próxima do POI selecionado
  const nearestEntrance = useMemo(() => {
    if (!location || !location.latitude || !location.longitude) {
      return VERIFIED_STREETVIEW_ENTRANCES[0];
    }
    let closest = VERIFIED_STREETVIEW_ENTRANCES[0];
    let minD = Infinity;

    VERIFIED_STREETVIEW_ENTRANCES.forEach((ent) => {
      const d = getDist(location.latitude, location.longitude, ent.latitude, ent.longitude);
      if (d < minD) {
        minD = d;
        closest = ent;
      }
    });
    return closest;
  }, [location]);

  useEffect(() => {
    if (nearestEntrance) {
      setSelectedEntrance(nearestEntrance);
    }
  }, [nearestEntrance]);

  if (!isOpen) return null;

  // URLs para Street View (nas vias públicas com cobertura 360°)
  const svLat = selectedEntrance.latitude;
  const svLng = selectedEntrance.longitude;
  const streetViewEmbedUrl = `https://maps.google.com/maps?q=&layer=c&cbll=${svLat},${svLng}&cbp=11,0,0,0,0&output=svembed`;

  // URL para Satélite HD centrado exatamente no POI ou no campus (com zoom detalhado)
  const poiLat = location?.latitude || -21.2010;
  const poiLng = location?.longitude || -47.7792;
  const satelliteEmbedUrl = `https://maps.google.com/maps?q=${poiLat},${poiLng}&t=k&z=19&ie=UTF8&iwloc=&output=embed`;

  // Link para abrir diretamente no Google Maps — por coordenadas para sempre acertar
  const externalMapsUrl = (svLat && svLng)
    ? `https://www.google.com/maps/@${svLat},${svLng},17z`
    : 'https://www.google.com/maps/search/?api=1&query=UNAERP+Ribeir%C3%A3o+Preto';

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-2 sm:p-5 animate-fade-in bg-black/75 backdrop-blur-sm">
      {/* Botão fechar — z-index alto para ficar acima do iframe */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-[9999] bg-white text-unaerp-blue p-3 rounded-full shadow-2xl hover:bg-gray-100 transition"
        aria-label="Fechar Street View"
        title="Fechar"
      >
        <X size={24} strokeWidth={3} />
      </button>
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-white/20">
        {/* Cabeçalho */}
        <div className="bg-unaerp-blue px-4 py-3 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-unaerp-yellow/20 flex items-center justify-center text-unaerp-yellow flex-shrink-0">
              {activeTab === 'streetview' ? <Eye size={18} /> : <Satellite size={18} />}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold tracking-tight truncate">
                Visualização 360° & Satélite — UNAERP
              </h2>
              <p className="text-xs text-white/80 truncate">
                {location?.name || 'Campus UNAERP (Ribeirânia)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={externalMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 rounded-lg bg-unaerp-yellow hover:bg-unaerp-yellow-light text-unaerp-blue font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
              title="Abrir no Google Maps oficial"
            >
              <ExternalLink size={13} />
              <span className="hidden sm:inline">Abrir no Maps</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
              aria-label="Fechar modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Abas de Modo: Street View vs Satélite HD */}
        <div className="bg-gray-100 px-4 py-2 flex items-center justify-between border-b border-gray-200 flex-wrap gap-2">
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-gray-200 shadow-xs">
            <button
              onClick={() => setActiveTab('streetview')}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition
                ${activeTab === 'streetview'
                  ? 'bg-unaerp-blue text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              <Eye size={14} />
              <span>Street View 360° (Entradas)</span>
            </button>

            <button
              onClick={() => setActiveTab('satellite')}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition
                ${activeTab === 'satellite'
                  ? 'bg-unaerp-blue text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              <Satellite size={14} />
              <span>Satélite HD (Visão Aérea)</span>
            </button>
          </div>

          {activeTab === 'streetview' && (
            <div className="flex items-center gap-1 overflow-x-auto text-xs py-0.5">
              <span className="text-[11px] text-gray-500 font-medium hidden md:inline">
                <Compass size={12} className="inline mr-1" />
                Pontos de acesso 360°:
              </span>
              {VERIFIED_STREETVIEW_ENTRANCES.map((ent) => (
                <button
                  key={ent.id}
                  onClick={() => setSelectedEntrance(ent)}
                  className={`
                    px-2.5 py-1 rounded-full text-[11px] font-medium transition whitespace-nowrap
                    ${selectedEntrance.id === ent.id
                      ? 'bg-unaerp-blue text-white shadow-xs'
                      : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-200'
                    }
                  `}
                >
                  {ent.name.split('(')[0].trim()}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Aviso informativo de localização */}
        <div className="bg-amber-50 px-4 py-1.5 border-b border-amber-100 text-[11px] text-amber-900 flex items-center gap-1.5">
          <Info size={13} className="text-amber-600 flex-shrink-0" />
          {activeTab === 'streetview' ? (
            <span>
              <strong>Street View 360° nas vias públicas:</strong> O carro do Google Street View percorre as avenidas ao redor. Exibindo visão 360° em <strong>{selectedEntrance.name}</strong> para acesso ao local.
            </span>
          ) : (
            <span>
              <strong>Visão Aérea de Alta Resolução:</strong> Imagens de satélite focadas em <strong>{location?.name || 'Campus UNAERP'}</strong> permitindo ver passarelas e prédios internos.
            </span>
          )}
        </div>

        {/* Container do Iframe */}
        <div className="relative flex-1 min-h-[360px] sm:min-h-[460px] bg-gray-900">
          <iframe
            key={`${activeTab}-${selectedEntrance.id}-${poiLat}-${poiLng}`}
            title="Google Maps Campus UNAERP"
            src={activeTab === 'streetview' ? streetViewEmbedUrl : satelliteEmbedUrl}
            className="w-full h-full border-0 absolute inset-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Rodapé informativo */}
        <div className="px-4 py-2 bg-gray-100 text-xs text-gray-500 flex items-center justify-between border-t border-gray-200 flex-wrap gap-2">
          <span className="flex items-center gap-1 text-[11px]">
            <MapPin size={12} className="text-unaerp-blue" />
            {activeTab === 'streetview' ? (
              <span>Ponto 360°: {selectedEntrance.description}</span>
            ) : (
              <span>Foco: {location?.name || 'Campus UNAERP'} ({poiLat.toFixed(5)}, {poiLng.toFixed(5)})</span>
            )}
          </span>
          <span className="text-[10px] text-gray-400">
            Google Maps Platform & Street View
          </span>
        </div>
      </div>
    </div>
  );
}
