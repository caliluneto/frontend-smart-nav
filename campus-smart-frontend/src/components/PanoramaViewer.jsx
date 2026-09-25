import { useMemo } from 'react';
import { ReactPhotoSphereViewer } from 'react-photo-sphere-viewer';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { X, Navigation, Compass } from 'lucide-react';
import '@photo-sphere-viewer/core/index.css';
import '@photo-sphere-viewer/markers-plugin/index.css';

export default function PanoramaViewer({ panorama, onClose, onNavigate }) {
  if (!panorama) return null;

  // Converte hotspots para o formato do MarkersPlugin
  const markers = useMemo(() => {
    return (panorama.hotspots || []).map((h, index) => ({
      id: `hotspot-${index}`,
      position: { yaw: `${h.yaw}deg`, pitch: `${h.pitch || 0}deg` },
      html: `
        <div style="
          background: #fbc02d;
          color: #1a237e;
          padding: 8px 14px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(0,0,0,0.4);
          white-space: nowrap;
          border: 2px solid white;
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: Inter, sans-serif;
          transition: transform 0.2s ease;
        ">
          <span>${h.text}</span>
        </div>
      `,
      anchor: 'center center',
      tooltip: h.text,
    }));
  }, [panorama]);

  const plugins = useMemo(() => {
    return [[MarkersPlugin, { markers }]];
  }, [markers]);

  const handleMarkerClick = (e) => {
    const clickedIndex = markers.findIndex((m) => m.id === (e.marker?.id || e.markerId));
    if (clickedIndex >= 0) {
      const hotspot = panorama.hotspots[clickedIndex];
      if (hotspot && hotspot.targetId && onNavigate) {
        onNavigate(hotspot.targetId);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-black flex items-center justify-center animate-fade-in select-none">
      {/* Botão fechar */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 bg-black/60 hover:bg-black/90 backdrop-blur-md text-white p-3 rounded-full transition shadow-lg border border-white/20"
        aria-label="Fechar panorama"
      >
        <X size={22} />
      </button>

      {/* Título do local */}
      <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-md text-white px-4 py-2.5 rounded-full border border-white/20 shadow-lg flex items-center gap-2 max-w-[80vw]">
        <div className="w-2.5 h-2.5 rounded-full bg-unaerp-yellow animate-pulse" />
        <span className="font-bold text-xs sm:text-sm truncate">📍 {panorama.name}</span>
      </div>

      {/* Dica de navegação */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-black/60 backdrop-blur-md text-white/90 px-4 py-1.5 rounded-full text-xs pointer-events-none border border-white/10 hidden sm:flex items-center gap-1.5">
        <Compass size={14} className="text-unaerp-yellow" />
        <span>Arraste com o dedo ou mouse para girar em 360°</span>
      </div>

      {/* Visualizador 360° */}
      <ReactPhotoSphereViewer
        key={panorama.url}
        src={panorama.url}
        height="100vh"
        width="100%"
        littlePlanet={false}
        navbar={['zoom', 'move', 'fullscreen']}
        defaultZoomLvl={50}
        plugins={plugins}
        onReady={(instance) => {
          try {
            const markersPlugin = instance.getPlugin(MarkersPlugin);
            if (markersPlugin) {
              markersPlugin.addEventListener('select-marker', handleMarkerClick);
            }
          } catch (err) {
            console.warn('Erro ao registrar listener no markersPlugin:', err);
          }
        }}
      />
    </div>
  );
}
