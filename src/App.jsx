import { useState, useCallback, useEffect } from 'react';
import Map from './components/Map';
import SearchBar from './components/SearchBar';
import RoutePanel from './components/RoutePanel';
import AccessibilityMenu from './components/AccessibilityMenu';
import StreetViewModal from './components/StreetViewModal';
// import PanoramaViewer from './components/PanoramaViewer'; // Temporariamente desabilitado (Three.js)
import { calculateRoute, getRouteGeometry, UNAERP_CAMPUS_POIS } from './services/api';
// import { getPanoramaForPOI } from './services/panoramaService'; // Temporariamente desabilitado

// ============================================================================
// App — Campus Smart Navigation UNAERP
// ============================================================================
export default function App() {
  // State de navegação
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [routeGeometry, setRouteGeometry] = useState(null);

  // State do Street View 360° (Google)
  const [streetViewOpen, setStreetViewOpen] = useState(false);
  const [streetViewLocation, setStreetViewLocation] = useState(null);

  // State do Tour Virtual 360° (desabilitado temporariamente)
  // const [openPanorama, setOpenPanorama] = useState(null);

  // Preferências de acessibilidade
  const [a11yPrefs, setA11yPrefs] = useState({
    wheelchairAccessible: false,
    avoidStairs: false,
  });

  // Abertura do Street View
  const handleOpenStreetView = useCallback((loc) => {
    setStreetViewLocation(loc || destination || origin || UNAERP_CAMPUS_POIS[0]);
    setStreetViewOpen(true);
  }, [destination, origin]);

  const handleCloseStreetView = useCallback(() => {
    setStreetViewOpen(false);
  }, []);

  // Panorama 360° desabilitado temporariamente (sem fotos no Supabase Storage)
  // const handleOpenPanorama = useCallback((poi) => { ... }, [destination, origin]);
  // const handleNavigatePanorama = useCallback((poiId) => { ... }, []);

  // Calcular rota
  const handleCalculateRoute = useCallback(async () => {
    if (!origin || !destination) return;

    // Validação: origem e destino não podem ser iguais
    const sameAsOrigin =
      (origin.id && destination.id && origin.id === destination.id) ||
      (origin.name && destination.name && origin.name.trim().toLowerCase() === destination.name.trim().toLowerCase()) ||
      (Math.abs(origin.latitude - destination.latitude) < 0.00001 &&
       Math.abs(origin.longitude - destination.longitude) < 0.00001);

    if (sameAsOrigin) {
      setError('Origem e destino não podem ser o mesmo local');
      return;
    }

    setLoading(true);
    setError(null);
    setRoutes([]);

    try {
      const result = await calculateRoute(
        {
          id: origin.id,
          name: origin.name,
          latitude: origin.latitude,
          longitude: origin.longitude,
        },
        {
          id: destination.id,
          name: destination.name,
          latitude: destination.latitude,
          longitude: destination.longitude,
        },
        {
          routeType: 'balanced',
          ...a11yPrefs,
          language: 'pt-BR',
        }
      );

      const foundRoutes = result.routes || [];
      setRoutes(foundRoutes);

      if (foundRoutes.length > 0) {
        setSelectedRoute(foundRoutes[0]);

        // Buscar geometria da rota local dentro do campus
        const geometry = await getRouteGeometry(
          { latitude: origin.latitude, longitude: origin.longitude },
          { latitude: destination.latitude, longitude: destination.longitude },
          { routeType: foundRoutes[0]?.type || 'balanced' }
        );
        if (geometry) {
          setRouteGeometry(geometry);
        }
      } else {
        setError('Nenhuma rota encontrada para os pontos selecionados.');
      }
    } catch (err) {
      console.error('Erro ao calcular rota:', err);
      setError('Erro ao calcular rota. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  }, [origin, destination, a11yPrefs]);

  // Atualizar geometria quando o usuário troca de rota selecionada
  useEffect(() => {
    const updateGeometry = async () => {
      if (selectedRoute && origin && destination) {
        const geometry = await getRouteGeometry(
          { latitude: origin.latitude, longitude: origin.longitude },
          { latitude: destination.latitude, longitude: destination.longitude },
          { routeType: selectedRoute.type || 'balanced' }
        );
        if (geometry) setRouteGeometry(geometry);
      }
    };
    updateGeometry();
  }, [selectedRoute, origin, destination]);

  const handleCloseRoutes = () => {
    setRoutes([]);
    setSelectedRoute(null);
    setRouteGeometry(null);
  };

  // Listeners globais para eventos dos popups de POI
  useEffect(() => {
    const handlePoiPartir = (event) => {
      const poiId = event.detail;
      const poi = UNAERP_CAMPUS_POIS.find((p) => p.id === poiId);
      if (poi) {
        setOrigin(poi);
        window.dispatchEvent(new CustomEvent('close-poi-popup'));
      }
    };

    const handlePoiIr = (event) => {
      const poiId = event.detail;
      const poi = UNAERP_CAMPUS_POIS.find((p) => p.id === poiId);
      if (poi) {
        setDestination(poi);
        window.dispatchEvent(new CustomEvent('close-poi-popup'));
      }
    };

    // Compat: manter poi-selected para popups antigos
    const handlePoiSelected = (event) => {
      const poiId = event.detail;
      const poi = UNAERP_CAMPUS_POIS.find((p) => p.id === poiId);
      if (poi) {
        setDestination(poi);
        window.dispatchEvent(new CustomEvent('close-poi-popup'));
      }
    };

    window.addEventListener('poi-partir', handlePoiPartir);
    window.addEventListener('poi-ir', handlePoiIr);
    window.addEventListener('poi-selected', handlePoiSelected);
    return () => {
      window.removeEventListener('poi-partir', handlePoiPartir);
      window.removeEventListener('poi-ir', handlePoiIr);
      window.removeEventListener('poi-selected', handlePoiSelected);
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-100">
      {/* Header UNAERP */}
      <div className="fixed top-0 left-0 right-0 z-[999] bg-gradient-to-r from-unaerp-blue to-unaerp-blue-light shadow-lg">
        <div className="flex items-center justify-between py-2.5 px-4">
          <div className="flex items-center gap-2">
            <div className="bg-unaerp-yellow text-unaerp-blue font-black text-xl w-9 h-9 rounded-xl flex items-center justify-center shadow-md">
              U
            </div>
            <div className="text-white">
              <p className="font-bold text-base leading-tight">UNAERP</p>
              <p className="text-[10px] text-unaerp-yellow leading-tight">Navegação do Campus</p>
            </div>
          </div>
          <button
            onClick={() => handleOpenStreetView()}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-white/15 hover:bg-white/25 flex items-center gap-1.5 transition"
            title="Abrir Street View 360°"
          >
            📷 <span className="hidden sm:inline">Street View</span>
          </button>
        </div>
      </div>

      {/* Camada 1: Mapa fullscreen */}
      <div className="fixed inset-0 w-full h-full">
        <Map
          startPoint={origin}
          endPoint={destination}
          routes={routes}
          selectedRoute={selectedRoute}
          routeGeometry={routeGeometry}
          pois={UNAERP_CAMPUS_POIS}
          onSelectOrigin={setOrigin}
          onSelectDestination={setDestination}
          onOpenStreetView={handleOpenStreetView}
        />
      </div>

      {/* Camada 2: Barra de busca compacta no topo */}
      <div className="fixed top-16 left-2 right-2 sm:top-20 sm:left-4 sm:right-4 sm:max-w-md sm:mx-auto z-[998]">
        <SearchBar
          onSelectOrigin={setOrigin}
          onSelectDestination={setDestination}
          onCalculateRoute={handleCalculateRoute}
          selectedOrigin={origin}
          selectedDestination={destination}
          loading={loading}
          onOpenStreetView={handleOpenStreetView}
        />
      </div>

      {/* Camada 3: Painel de rotas calculadas (bottom sheet) */}
      {routes.length > 0 && (
        <RoutePanel
          routes={routes}
          origin={origin}
          destination={destination}
          onClose={handleCloseRoutes}
          onSelectRoute={setSelectedRoute}
        />
      )}

      {/* Camada 4: Menu flutuante de acessibilidade (FAB) */}
      <AccessibilityMenu onPreferencesChange={setA11yPrefs} />

      {/* Camada 5: Modal de Street View 360° (Google) */}
      <StreetViewModal
        isOpen={streetViewOpen}
        onClose={handleCloseStreetView}
        location={streetViewLocation}
      />

      {/* Toast de erro / notificação */}
      {error && (
        <div className="absolute top-36 left-4 right-4 z-[1001] max-w-md mx-auto animate-slide-down">
          <div className="bg-red-600 text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-2 text-white/80 hover:text-white font-bold p-1"
              aria-label="Fechar alerta"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}