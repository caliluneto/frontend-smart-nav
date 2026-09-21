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
  // State de localização do usuário via GPS
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [originOverride, setOriginOverride] = useState(null);

  // Origem efetiva para navegação: ponto fixado manualmente ou GPS real
  const effectiveOrigin = originOverride || (userLocation ? {
    ...userLocation,
    name: 'Sua Localização',
    id: 'user-gps',
  } : null);

  // State de navegação
  const [destination, setDestination] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
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

  // ============================================================================
  // GPS Real — Obter localização do celular via Geolocation API
  // ============================================================================
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      console.warn('Geolocalização não suportada neste navegador');
      setError('Seu navegador não suporta geolocalização');
      return;
    }

    setLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('📍 Localização GPS obtida:', latitude, longitude);
        setUserLocation({ latitude, longitude });
        setLocating(false);
      },
      (err) => {
        console.warn('Erro GPS:', err.message);
        setLocating(false);
        // Fallback: localização padrão (mas avisa o usuário)
        if (err.code === err.PERMISSION_DENIED) {
          setError('Permissão de localização negada. Usando localização aproximada do campus.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setError('Não foi possível obter sua localização. Usando localização aproximada.');
        } else if (err.code === err.TIMEOUT) {
          setError('Tempo esgotado ao buscar localização.');
        }
        // Fallback para o centro do campus
        setUserLocation({
          latitude: -21.2014,
          longitude: -47.7790,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  // Inicialização: solicitar permissão de localização GPS automaticamente
  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  // Log de depuração do estado de rotas
  useEffect(() => {
    console.log('🔍 Estado de rotas:', { routesCount: routes.length, hasSelectedRoute: !!selectedRoute });
  }, [routes, selectedRoute]);

  // ============================================================================
  // Calcular rota diretamente ao selecionar destino
  // ============================================================================
  const handleSelectDestination = useCallback(async (poi) => {
    if (!poi) {
      setDestination(null);
      setRoutes([]);
      setSelectedRoute(null);
      setRouteGeometry(null);
      return;
    }

    setDestination(poi);

    const fromPoint = effectiveOrigin;
    if (!fromPoint) {
      console.log('ℹ️ Aguardando origem para calcular rota');
      return;
    }

    // Validação: origem e destino não podem ser iguais
    const sameAsOrigin =
      (fromPoint.id && poi.id && fromPoint.id === poi.id) ||
      (fromPoint.name && poi.name && fromPoint.name.trim().toLowerCase() === poi.name.trim().toLowerCase()) ||
      (Math.abs(fromPoint.latitude - poi.latitude) < 0.00001 &&
       Math.abs(fromPoint.longitude - poi.longitude) < 0.00001);

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
          id: fromPoint.id || 'origin',
          name: fromPoint.name || 'Minha Localização',
          latitude: fromPoint.latitude,
          longitude: fromPoint.longitude,
        },
        {
          id: poi.id,
          name: poi.name,
          latitude: poi.latitude,
          longitude: poi.longitude,
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

        // Auto-recolher o SearchBar após calcular rota
        setShouldCollapseSearch(true);
        setTimeout(() => setShouldCollapseSearch(false), 500);

        // Buscar geometria da rota local dentro do campus
        const geometry = await getRouteGeometry(
          { latitude: fromPoint.latitude, longitude: fromPoint.longitude },
          { latitude: poi.latitude, longitude: poi.longitude },
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
  }, [effectiveOrigin, a11yPrefs]);

  // Recalcular rota manual (via botão do SearchBar)
  const handleCalculateRoute = useCallback(async () => {
    if (!destination) return;
    await handleSelectDestination(destination);
  }, [destination, handleSelectDestination]);

  // Atualizar geometria quando o usuário troca de rota selecionada no RoutePanel
  useEffect(() => {
    const updateGeometry = async () => {
      if (selectedRoute && effectiveOrigin && destination) {
        const geometry = await getRouteGeometry(
          { latitude: effectiveOrigin.latitude, longitude: effectiveOrigin.longitude },
          { latitude: destination.latitude, longitude: destination.longitude },
          { routeType: selectedRoute.type || 'balanced' }
        );
        if (geometry) setRouteGeometry(geometry);
      }
    };
    updateGeometry();
  }, [selectedRoute, effectiveOrigin, destination]);

  const handleCloseRoutes = () => {
    setRoutes([]);
    setSelectedRoute(null);
    setRouteGeometry(null);
  };

  // ============================================================================
  // Listeners globais para eventos dos POIs (popups e modal)
  // ============================================================================
  useEffect(() => {
    const handlePoiPartir = (event) => {
      const poiId = event.detail;
      const poi = UNAERP_CAMPUS_POIS.find((p) => p.id === poiId);
      if (poi) {
        setOriginOverride(poi);
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

      {/* Botão flutuante para ativar localização quando GPS ainda não foi obtido */}
      {!userLocation && !locating && (
        <button
          onClick={getUserLocation}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[997] bg-unaerp-blue text-white px-4 py-2.5 rounded-full shadow-2xl font-semibold text-xs flex items-center gap-2 transition hover:bg-unaerp-blue-dark active:scale-95 whitespace-nowrap border-2 border-white/20"
          aria-label="Ativar minha localização"
        >
          📍 Ativar minha localização
        </button>
      )}

      {/* Camada 1: Mapa fullscreen */}
      <div className="fixed inset-0 w-full h-full">
        <Map
          startPoint={effectiveOrigin}
          endPoint={destination}
          userLocation={userLocation}
          routes={routes}
          selectedRoute={selectedRoute}
          routeGeometry={routeGeometry}
          pois={UNAERP_CAMPUS_POIS}
          onSelectOrigin={setOriginOverride}
          onSelectDestination={handleSelectDestination}
        />
      </div>

      {/* Camada 2: Barra de busca compacta no topo */}
      <div className="fixed top-16 left-2 right-2 sm:top-20 sm:left-4 sm:right-4 sm:max-w-md sm:mx-auto z-[998]">
        <SearchBar
          onSelectOrigin={setOriginOverride}
          onSelectDestination={handleSelectDestination}
          onCalculateRoute={handleCalculateRoute}
          selectedOrigin={effectiveOrigin}
          selectedDestination={destination}
          loading={loading}
          shouldCollapse={shouldCollapseSearch}
        />
      </div>

      {/* Camada 3: Painel de rotas calculadas (bottom sheet) */}
      {routes.length > 0 && (
        <RoutePanel
          routes={routes}
          origin={effectiveOrigin}
          destination={destination}
          onClose={handleCloseRoutes}
          onSelectRoute={setSelectedRoute}
        />
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
            setOriginOverride(poi);
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