import { useState, useCallback, useEffect } from 'react';
import Map from './components/Map';
import SearchBar from './components/SearchBar';
import RoutePanel from './components/RoutePanel';
import AccessibilityMenu from './components/AccessibilityMenu';
import POIDetailModal from './components/POIDetailModal';
import { calculateRoute, getRouteGeometry, UNAERP_CAMPUS_POIS } from './services/api';

// ============================================================================
// App — Campus Smart Navigation UNAERP
// ============================================================================
export default function App() {
  // State de navegação - origem e destino selecionados manualmente via busca
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [showRoutePanel, setShowRoutePanel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [routeGeometry, setRouteGeometry] = useState(null);
  const [shouldCollapseSearch, setShouldCollapseSearch] = useState(false);
  const [detailPoi, setDetailPoi] = useState(null);

  // Preferências de acessibilidade
  const [a11yPrefs, setA11yPrefs] = useState({
    wheelchairAccessible: false,
    avoidStairs: false,
  });

  // Log de depuração do estado de rotas
  useEffect(() => {
    console.log('🔍 Estado de rotas:', { routesCount: routes.length, hasSelectedRoute: !!selectedRoute });
  }, [routes, selectedRoute]);

  // ============================================================================
  // Calcular rota entre origem e destino selecionados
  // ============================================================================
  const handleSelectOrigin = useCallback(async (poi) => {
    if (!poi) {
      setOrigin(null);
      setRoutes([]);
      setSelectedRoute(null);
      setRouteGeometry(null);
      setShowRoutePanel(false);
      return;
    }

    setOrigin(poi);
    console.log('🟢 [Origem] Selecionada:', poi.name);

    // Se já tem destino, calcula rota automaticamente
    if (destination) {
      await calculateRouteFor(poi, destination);
    }
  }, [destination]);

  const handleSelectDestination = useCallback(async (poi) => {
    if (!poi) {
      setDestination(null);
      setRoutes([]);
      setSelectedRoute(null);
      setRouteGeometry(null);
      setShowRoutePanel(false);
      return;
    }

    setDestination(poi);
    console.log('🔴 [Destino] Selecionado:', poi.name);

    // Se já tem origem, calcula rota automaticamente
    if (origin) {
      await calculateRouteFor(origin, poi);
    }
  }, [origin]);

  // Função auxiliar para calcular rota entre dois pontos
  const calculateRouteFor = useCallback(async (fromPoi, toPoi) => {
    if (!fromPoi || !toPoi) {
      console.log('ℹ️ Aguardando origem e destino para calcular rota');
      return;
    }

    // Validação: origem e destino não podem ser iguais
    const sameLocation =
      (fromPoi.id && toPoi.id && fromPoi.id === toPoi.id) ||
      (fromPoi.name && toPoi.name && fromPoi.name.trim().toLowerCase() === toPoi.name.trim().toLowerCase()) ||
      (Math.abs(fromPoi.latitude - toPoi.latitude) < 0.00001 &&
       Math.abs(fromPoi.longitude - toPoi.longitude) < 0.00001);

    if (sameLocation) {
      setError('Origem e destino não podem ser o mesmo local');
      return;
    }

    setLoading(true);
    setError(null);
    setRoutes([]);

    try {
      console.log('🗺️ Calculando rota:', fromPoi.name, '→', toPoi.name);
      
      const result = await calculateRoute(
        {
          id: fromPoi.id || 'origin',
          name: fromPoi.name,
          latitude: fromPoi.latitude,
          longitude: fromPoi.longitude,
        },
        {
          id: toPoi.id,
          name: toPoi.name,
          latitude: toPoi.latitude,
          longitude: toPoi.longitude,
        },
        {
          routeType: 'balanced',
          ...a11yPrefs,
          language: 'pt-BR',
        }
      );

      const foundRoutes = result.routes || [];
      console.log('📍 Rotas obtidas:', foundRoutes.length);
      setRoutes(foundRoutes);

      if (foundRoutes.length > 0) {
        setSelectedRoute(foundRoutes[0]);
        setShowRoutePanel(true);

        // Auto-recolher o SearchBar após calcular rota
        setShouldCollapseSearch(true);
        setTimeout(() => setShouldCollapseSearch(false), 500);

        // Buscar geometria da rota local dentro do campus
        const geometry = await getRouteGeometry(
          { latitude: fromPoi.latitude, longitude: fromPoi.longitude },
          { latitude: toPoi.latitude, longitude: toPoi.longitude },
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
  }, [a11yPrefs]);

  // Recalcular rota manual (via botão do SearchBar)
  const handleCalculateRoute = useCallback(async () => {
    if (!origin || !destination) {
      setError('Selecione origem e destino para calcular a rota');
      return;
    }
    await calculateRouteFor(origin, destination);
  }, [origin, destination, calculateRouteFor]);

  // Atualizar geometria quando o usuário troca de rota selecionada no RoutePanel
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

  const handleCloseRoutePanel = () => {
    setShowRoutePanel(false);
  };

  const handleReopenRoutePanel = () => {
    setShowRoutePanel(true);
  };

  // ============================================================================
  // Listeners globais para eventos dos POIs (popups e modal)
  // ============================================================================
  useEffect(() => {
    const handlePoiPartir = (event) => {
      const poiId = event.detail;
      const poi = UNAERP_CAMPUS_POIS.find((p) => p.id === poiId);
      if (poi) {
        console.log('📍 [Partir daqui] Setando origem:', poi.name);
        handleSelectOrigin(poi);
        window.dispatchEvent(new CustomEvent('close-poi-popup'));
      }
    };

    const handlePoiIr = (event) => {
      const poiId = event.detail;
      const poi = UNAERP_CAMPUS_POIS.find((p) => p.id === poiId);
      if (poi) {
        handleSelectDestination(poi);
        window.dispatchEvent(new CustomEvent('close-poi-popup'));
      }
    };

    // Compat: manter poi-selected para compatibilidade
    const handlePoiSelected = (event) => {
      const poiId = event.detail;
      const poi = UNAERP_CAMPUS_POIS.find((p) => p.id === poiId);
      if (poi) {
        handleSelectDestination(poi);
        window.dispatchEvent(new CustomEvent('close-poi-popup'));
      }
    };

    const handlePoiDetail = (event) => {
      const poiId = event.detail;
      const poi = UNAERP_CAMPUS_POIS.find((p) => p.id === poiId);
      if (poi) {
        setDetailPoi(poi);
        window.dispatchEvent(new CustomEvent('close-poi-popup'));
      }
    };

    window.addEventListener('poi-partir', handlePoiPartir);
    window.addEventListener('poi-ir', handlePoiIr);
    window.addEventListener('poi-selected', handlePoiSelected);
    window.addEventListener('poi-detail', handlePoiDetail);
    return () => {
      window.removeEventListener('poi-partir', handlePoiPartir);
      window.removeEventListener('poi-ir', handlePoiIr);
      window.removeEventListener('poi-selected', handlePoiSelected);
      window.removeEventListener('poi-detail', handlePoiDetail);
    };
  }, [handleSelectDestination]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-100">
      {/* Header UNAERP (sem Street View) */}
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
          {locating && (
            <span className="text-[11px] text-white/90 bg-white/10 px-2.5 py-1 rounded-full animate-pulse">
              Buscando GPS...
            </span>
          )}
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
          onSelectOrigin={handleSelectOrigin}
          onSelectDestination={handleSelectDestination}
        />
      </div>

      {/* Camada 2: Barra de busca compacta no topo */}
      <div className="fixed top-16 left-2 right-2 sm:top-20 sm:left-4 sm:right-4 sm:max-w-md sm:mx-auto z-[998]">
        <SearchBar
          onSelectOrigin={handleSelectOrigin}
          onSelectDestination={handleSelectDestination}
          onCalculateRoute={handleCalculateRoute}
          selectedOrigin={origin}
          selectedDestination={destination}
          loading={loading}
          shouldCollapse={shouldCollapseSearch}
        />
      </div>

      {/* Camada 3: Painel de rotas calculadas (bottom sheet) */}
      {routes.length > 0 && showRoutePanel && (
        <RoutePanel
          routes={routes}
          origin={origin}
          destination={destination}
          onClose={handleCloseRoutePanel}
          onSelectRoute={setSelectedRoute}
        />
      )}

      {/* Botão flutuante para reabrir painel quando rotas estão calculadas mas painel está oculto */}
      {routes.length > 0 && !showRoutePanel && (
        <button
          onClick={handleReopenRoutePanel}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-unaerp-blue text-white px-6 py-3 rounded-full shadow-2xl font-semibold text-sm flex items-center gap-2 hover:bg-unaerp-blue-dark active:scale-95 transition"
          aria-label="Ver rotas"
        >
          🗺️ Ver rotas
        </button>
      )}

      {/* Camada 4: Menu flutuante de acessibilidade (FAB) */}
      <AccessibilityMenu onPreferencesChange={setA11yPrefs} />

      {/* Camada 5: Modal de detalhes do POI (foto, descrição, ações) */}
      {detailPoi && (
        <POIDetailModal
          poi={detailPoi}
          onClose={() => setDetailPoi(null)}
          onNavigate={(poi) => {
            setDetailPoi(null);
            handleSelectDestination(poi);
          }}
          onSetOrigin={(poi) => {
            setDetailPoi(null);
            console.log('📍 [Modal - Partir daqui] Setando origem:', poi.name);
            handleSelectOrigin(poi);
          }}
        />
      )}

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