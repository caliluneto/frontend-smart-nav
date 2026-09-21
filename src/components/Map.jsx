import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Eye, Camera } from 'lucide-react';
import { UNAERP_CAMPUS_POIS } from '../services/api';

// Fix para ícones padrão do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Coordenadas centrais do Campus UNAERP (Ribeirânia - Ribeirão Preto)
export const UNAERP_CENTER = [-21.2018, -47.7790];

// Polígono do Campus UNAERP
const UNAERP_POLYGON = [
  [-21.1988, -47.7820],  // Noroeste
  [-21.1988, -47.7770],  // Nordeste
  [-21.2045, -47.7770],  // Sudeste
  [-21.2045, -47.7820],  // Sudoeste
];

// Ícones customizados
const createIcon = (color, emoji = '📍', size = 36) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50% 50% 50% 0;
        background: ${color};
        transform: rotate(-45deg);
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border: 2px solid #fff;
        cursor: pointer;
      ">
        <span style="transform: rotate(45deg); font-size: 16px;">${emoji}</span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

const startIcon = createIcon('#10b981', '🟢', 40);
const endIcon = createIcon('#fbc02d', '🎯', 40);

// Ícone azul (origem - padrão Google Maps)
const createOriginIcon = () => L.divIcon({
  className: 'origin-marker',
  html: `
    <div style="
      position: relative;
      width: 24px;
      height: 24px;
    ">
      <div style="
        position: absolute;
        top: 0;
        left: 0;
        width: 24px;
        height: 24px;
        background: #4285f4;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
      "></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Ícone vermelho (destino - padrão Google Maps)
const createDestinationIcon = () => L.divIcon({
  className: 'destination-marker',
  html: `
    <div style="
      position: relative;
      width: 32px;
      height: 42px;
    ">
      <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26c0-8.837-7.163-16-16-16z" fill="#EA4335"/>
        <circle cx="16" cy="16" r="6" fill="white"/>
      </svg>
    </div>
  `,
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -42],
});

const getPoiEmoji = (type) => {
  const map = {
    classroom: '🏫',
    library: '📚',
    laboratory: '🔬',
    cafeteria: '☕',
    auditorium: '🎭',
    health: '🏥',
    sports: '⚽',
    entrance: '🚪',
    parking: '🅿️',
    admin: '🏦',
  };
  return map[type] || '📍';
};

export default function Map({
  startPoint,
  endPoint,
  routes = [],
  selectedRoute,
  routeGeometry,
  pois = UNAERP_CAMPUS_POIS,
  onSelectOrigin,
  onSelectDestination,
  onOpenStreetView,
  onOpenPanorama,
}) {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const layerGroup = useRef(null);

  // Inicializar mapa centrado na UNAERP
  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    mapInstance.current = L.map(mapContainer.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView(UNAERP_CENTER, 17);

    // Ajusta o mapa para enquadrar o campus
    const campusBounds = L.latLngBounds(UNAERP_POLYGON);
    mapInstance.current.fitBounds(campusBounds, {
      padding: [30, 30],
      maxZoom: 17,
    });

    // Camada de mapas OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 20,
    }).addTo(mapInstance.current);

    // Polígono demarcador do Campus UNAERP
    const campusPolygon = L.polygon(UNAERP_POLYGON, {
      color: '#1a237e',
      weight: 2,
      opacity: 0.5,
      fillColor: '#1a237e',
      fillOpacity: 0.04,      // ← leve preenchimento azul
      dashArray: '6, 6',
    }).addTo(mapInstance.current);

    // Zoom control
    L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);

    // Atribuição
    L.control
      .attribution({ position: 'bottomleft', prefix: false })
      .addAttribution('© <a href="https://openstreetmap.org">OpenStreetMap</a> | UNAERP Campus')
      .addTo(mapInstance.current);

    // Grupo de camadas
    layerGroup.current = L.layerGroup().addTo(mapInstance.current);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Força recálculo de tamanho do mapa (fix mobile grey areas)
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // Aguarda 300ms e força o recálculo do tamanho
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 300);

    // Também escuta rotação/resize de tela
    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Atualizar marcadores, rotas e POIs
  useEffect(() => {
    if (!mapInstance.current || !layerGroup.current) return;

    layerGroup.current.clearLayers();
    const bounds = L.latLngBounds();

    // ============================================================
    // POIs — popup compacto e clicável em mobile
    // ============================================================
    let openPopup = null;
    const map = mapInstance.current;

    const activePois = pois && pois.length > 0 ? pois : UNAERP_CAMPUS_POIS;
    activePois.forEach((poi) => {
      const isStart = startPoint && startPoint.name === poi.name;
      const isEnd = endPoint && endPoint.name === poi.name;
      if (isStart || isEnd) return;

      const emoji = getPoiEmoji(poi.type);
      const poiIcon = createIcon('#283593', emoji, 28);

      const marker = L.marker([poi.latitude, poi.longitude], {
        icon: poiIcon,
        zIndexOffset: 500,
      });

      marker.bindPopup(
        `<div style="min-width: 140px; max-width: 180px; padding: 4px; text-align: center; font-family: Inter, sans-serif;">
          <strong style="color: #1a237e; font-size: 13px; line-height: 1.2; display: block; margin-bottom: 8px;">
            ${emoji} ${poi.name}
          </strong>
          <button 
            onclick="window.dispatchEvent(new CustomEvent('poi-detail', {detail: '${poi.id}'}))"
            style="width: 100%; background: #1a237e; color: white; border: none; padding: 8px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 12px; display: block;">
            Ver detalhes
          </button>
        </div>`,
        {
          autoPan: true,
          closeButton: true,
          maxWidth: 200,
          minWidth: 160,
          className: 'compact-poi-popup',
        }
      );

      // Fechar popup anterior ao abrir novo
      marker.on('click', () => {
        if (openPopup && openPopup !== marker) {
          openPopup.closePopup();
        }
        openPopup = marker;
        marker.openPopup();
      });

      marker.addTo(layerGroup.current);
    });

    // Fechar popup ao clicar no mapa (fora dos markers)
    map.off('click.poi');
    map.on('click', () => {
      map.closePopup();
      openPopup = null;
    });

    // Escutar evento customizado de fechar (botão X no popup)
    const closePopupHandler = () => {
      map.closePopup();
      openPopup = null;
    };
    window.addEventListener('close-poi-popup', closePopupHandler);

    // Marcador de início (bolinha azul - padrão Google Maps)
    if (startPoint) {
      L.marker([startPoint.latitude, startPoint.longitude], {
        icon: createOriginIcon(),
        zIndexOffset: 1000,
      })
        .bindPopup(`
          <div style="font-family: Inter, sans-serif; padding: 4px;">
            <strong style="color: #4285f4; font-size: 14px;">📍 Você está aqui</strong><br/>
            <span style="color: #333; font-weight: 500;">${startPoint.name || 'Origem'}</span>
          </div>
        `)
        .addTo(layerGroup.current);
      bounds.extend([startPoint.latitude, startPoint.longitude]);
    }

    // Marcador de destino (pin vermelho - padrão Google Maps)
    if (endPoint) {
      L.marker([endPoint.latitude, endPoint.longitude], {
        icon: createDestinationIcon(),
        zIndexOffset: 999,
      })
        .bindPopup(`
          <div style="font-family: Inter, sans-serif; padding: 4px;">
            <strong style="color: #EA4335; font-size: 14px;">🎯 Destino</strong><br/>
            <span style="color: #333; font-weight: 500;">${endPoint.name || 'Destino'}</span>
          </div>
        `)
        .addTo(layerGroup.current);
      bounds.extend([endPoint.latitude, endPoint.longitude]);
    }

    // ========================================================================
    // Desenhar rota — SEMPRE (quando há origem e destino)
    // ========================================================================
    if (startPoint && endPoint) {
      let geometryToDraw = routeGeometry;

      // Valida a geometria: precisa ter pontos
      const isValidGeometry = geometryToDraw && geometryToDraw.length > 1;

      if (!isValidGeometry) {
        console.log('⚠️ Sem geometria OSRM, gerando linha reta local');
        geometryToDraw = [
          [startPoint.latitude, startPoint.longitude],
          [endPoint.latitude, endPoint.longitude],
        ];
      }

      console.log('🎨 Desenhando rota com', geometryToDraw.length, 'pontos');

      // 1. Contorno branco (fundo)
      L.polyline(geometryToDraw, {
        color: '#ffffff',
        weight: 10,
        opacity: 1,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(layerGroup.current);

      // 2. Linha azul principal (padrão Google Maps)
      L.polyline(geometryToDraw, {
        color: '#4285f4',
        weight: 6,
        opacity: 1,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(layerGroup.current);

      // 3. Bolinhas azuis intermediárias
      const totalPoints = geometryToDraw.length;
      if (totalPoints > 4) {
        const step = Math.max(2, Math.floor(totalPoints / 6));
        for (let i = step; i < totalPoints - 1; i += step) {
          L.circleMarker(geometryToDraw[i], {
            radius: 5,
            fillColor: '#4285f4',
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 1,
          }).addTo(layerGroup.current);
        }
      }

      // 4. Zoom automático na rota (compensando o painel de rotas embaixo)
      const routeBounds = L.latLngBounds([
        [startPoint.latitude, startPoint.longitude],
        [endPoint.latitude, endPoint.longitude],
      ]);
      if (routeBounds.isValid()) {
        const bottomReserved = typeof window !== 'undefined' ? Math.round(window.innerHeight * 0.4) : 120;
        map.fitBounds(routeBounds, {
          paddingTopLeft: [60, 60],
          paddingBottomRight: [60, bottomReserved],
          maxZoom: 18,
          animate: true,
          duration: 1.0,
        });
      }
    }

    // Cleanup do close-poi-popup listener
    return () => {
      window.removeEventListener('close-poi-popup', closePopupHandler);
    };
  }, [startPoint, endPoint, routes, selectedRoute, routeGeometry, pois, onSelectOrigin, onSelectDestination, onOpenStreetView, onOpenPanorama]);

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapContainer}
        className="absolute inset-0 w-full h-full"
        role="region"
        aria-label="Mapa interativo do Campus UNAERP"
      />

      {/* Botão flutuante para Street View */}
      <div className="absolute bottom-6 left-4 z-[999] flex items-center gap-2">
        <button
          onClick={() => onOpenStreetView && onOpenStreetView(endPoint || startPoint || { name: 'UNAERP Campus', latitude: -21.2014, longitude: -47.7790 })}
          className="glass px-3.5 py-2.5 rounded-xl shadow-lg border border-unaerp-blue/20 hover:bg-unaerp-blue hover:text-white text-unaerp-blue font-semibold text-xs flex items-center gap-1.5 transition active:scale-95 bg-white/95"
          title="Ver Entradas no Google Street View"
        >
          <Eye size={16} className="text-unaerp-yellow" />
          <span>Street View</span>
        </button>
      </div>
    </div>
  );
}
