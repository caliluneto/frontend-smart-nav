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
    }).setView(UNAERP_CENTER, 16);

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

  // Atualizar marcadores, rotas e POIs
  useEffect(() => {
    if (!mapInstance.current || !layerGroup.current) return;

    layerGroup.current.clearLayers();
    const bounds = L.latLngBounds();

    // Renderizar todos os POIs do campus com popups interativos
    const activePois = pois && pois.length > 0 ? pois : UNAERP_CAMPUS_POIS;
    activePois.forEach((poi) => {
      const isStart = startPoint && startPoint.name === poi.name;
      const isEnd = endPoint && endPoint.name === poi.name;
      if (isStart || isEnd) return; // Não duplica ícone se já for partida/destino

      const icon = createIcon('#1a237e', getPoiEmoji(poi.type), 32);
      const marker = L.marker([poi.latitude, poi.longitude], { icon });

      // Cria container de popup interativo com botões
      const popupDiv = document.createElement('div');
      popupDiv.style.fontFamily = 'Inter, sans-serif';
      popupDiv.style.padding = '4px';
      popupDiv.innerHTML = `
        <div style="margin-bottom: 8px;">
          <strong style="color: #1a237e; font-size: 14px; display: block;">${poi.name}</strong>
          <span style="color: #666; font-size: 12px;">${poi.description || ''}</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <button id="btn-start-${poi.id}" style="background: #10b981; color: white; border: none; padding: 5px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; text-align: center;">
            🟢 Partir daqui
          </button>
          <button id="btn-end-${poi.id}" style="background: #fbc02d; color: #1a237e; border: none; padding: 5px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; text-align: center;">
            🎯 Ir para cá
          </button>
          <button id="btn-sv-${poi.id}" style="background: #374151; color: white; border: none; padding: 5px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; text-align: center; display: flex; align-items: center; justify-content: center; gap: 4px;">
            📷 Street View (Entrada)
          </button>
        </div>
      `;

      // Listeners nos botões do popup
      marker.bindPopup(popupDiv);
      marker.on('popupopen', () => {
        const startBtn = document.getElementById(`btn-start-${poi.id}`);
        const endBtn = document.getElementById(`btn-end-${poi.id}`);
        const svBtn = document.getElementById(`btn-sv-${poi.id}`);

        if (startBtn && onSelectOrigin) {
          startBtn.onclick = () => {
            onSelectOrigin(poi);
            marker.closePopup();
          };
        }
        if (endBtn && onSelectDestination) {
          endBtn.onclick = () => {
            onSelectDestination(poi);
            marker.closePopup();
          };
        }
        if (svBtn && onOpenStreetView) {
          svBtn.onclick = () => {
            onOpenStreetView(poi);
            marker.closePopup();
          };
        }
      });

      marker.addTo(layerGroup.current);
    });

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

      // 4. Ajusta zoom para origem + destino sem sair do campus
      const routeBounds = L.latLngBounds([
        [startPoint.latitude, startPoint.longitude],
        [endPoint.latitude, endPoint.longitude],
      ]);
      if (routeBounds.isValid()) {
        // Combina os limites da rota com os limites do campus
        const campusBounds = L.latLngBounds(UNAERP_POLYGON);
        const finalBounds = routeBounds.extend(campusBounds);
        mapInstance.current.fitBounds(finalBounds, { padding: [80, 80], maxZoom: 17 });
      }
    }
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
