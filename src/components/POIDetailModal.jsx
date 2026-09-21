import { X, MapPin, Navigation, Info } from 'lucide-react';
import { POI_IMAGES, DEFAULT_POI_IMAGE } from '../data/poiImages';

export default function POIDetailModal({ poi, onClose, onNavigate, onSetOrigin }) {
  if (!poi) return null;

  const poiData = POI_IMAGES[poi.id] || {};
  const imageUrl = poiData.imageUrl || DEFAULT_POI_IMAGE;
  const description = poiData.description || poi.description || poi.type;
  const extraInfo = poiData.extraInfo || null;

  return (
    <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in">
      <div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl overflow-hidden max-h-[85vh] flex flex-col">

        {/* Imagem */}
        <div className="relative w-full h-48 sm:h-56 bg-gradient-to-br from-unaerp-blue to-unaerp-blue-light">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={poi.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                e.target.parentElement.innerHTML = '<span style="font-size: 64px;">📍</span>';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl">📍</span>
            </div>
          )}

          {/* Botão fechar */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition"
            aria-label="Recolher"
          >
            <X size={20} className="text-unaerp-blue" />
          </button>

          {/* Nome sobreposto */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <h2 className="text-white font-bold text-xl">{poi.name}</h2>
            {extraInfo && (
              <p className="text-white/80 text-xs mt-0.5 flex items-center gap-1">
                <MapPin size={12} /> {extraInfo}
              </p>
            )}
          </div>
        </div>

        {/* Conteúdo scrollável */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Descrição */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Info size={16} className="text-unaerp-blue" />
              <h3 className="font-semibold text-unaerp-blue text-sm">Sobre este local</h3>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">{description}</p>
          </div>

          {/* Info adicional */}
          <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600">
            <p className="font-semibold text-gray-700 mb-1">📍 Localização no campus</p>
            <p>{poi.latitude.toFixed(6)}, {poi.longitude.toFixed(6)}</p>
          </div>
        </div>

        {/* Ações fixas embaixo */}
        <div className="p-4 border-t border-gray-100 flex gap-2">
          <button
            onClick={() => onSetOrigin?.(poi)}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition"
          >
            🟢 Partir daqui
          </button>
          <button
            onClick={() => onNavigate?.(poi)}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-unaerp-blue hover:bg-unaerp-blue-dark text-white font-semibold rounded-xl transition"
          >
            🔵 Ir para cá
          </button>
        </div>
      </div>
    </div>
  );
}
