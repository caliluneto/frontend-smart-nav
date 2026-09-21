import { useState, useRef } from 'react';
import {
  Clock, Ruler, Shield, Accessibility, ChevronUp, ChevronDown,
  Zap, TreePine, Scale, X, Navigation,
} from 'lucide-react';

// ============================================================================
// RoutePanel — Bottom sheet arrastável com rotas calculadas
// ============================================================================

// Ícone e cor por tipo de rota
const routeStyle = {
  fastest: { icon: Zap, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', accent: 'bg-red-500', label: '⚡ Rápida' },
  safest: { icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', accent: 'bg-emerald-500', label: '🛡️ Segura' },
  accessible: { icon: Accessibility, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', accent: 'bg-blue-500', label: '♿ Acessível' },
  scenic: { icon: TreePine, color: 'text-teal-500', bg: 'bg-teal-50', border: 'border-teal-200', accent: 'bg-teal-500', label: '🌳 Cenográfica' },
  balanced: { icon: Scale, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', accent: 'bg-amber-500', label: '⚖️ Balanceada' },
};

const getRouteType = (route) => {
  const name = (route.name || route.type || '').toLowerCase();
  if (name.includes('rápid') || name.includes('fastest')) return 'fastest';
  if (name.includes('segur') || name.includes('safest')) return 'safest';
  if (name.includes('acessív') || name.includes('accessible')) return 'accessible';
  if (name.includes('cenográf') || name.includes('scenic')) return 'scenic';
  return 'balanced';
};

export default function RoutePanel({
  routes,
  origin,
  destination,
  onClose,
  onSelectRoute,
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showSteps, setShowSteps] = useState(false);
  const [sheetHeight, setSheetHeight] = useState(35); // % da tela (35% deixa mais mapa visível)
  const startYRef = useRef(null);
  const startHeightRef = useRef(null);

  if (!routes || routes.length === 0) return null;

  const selected = routes[selectedIndex];
  const style = routeStyle[getRouteType(selected)] || routeStyle.balanced;

  // ============================================================
  // Arrastar o painel para expandir/recolher
  // ============================================================
  const handleDragStart = (e) => {
    startYRef.current = e.touches ? e.touches[0].clientY : e.clientY;
    startHeightRef.current = sheetHeight;

    const onMove = (ev) => {
      if (startYRef.current === null) return;
      const clientY = ev.touches ? ev.touches[0].clientY : ev.clientY;
      const deltaY = startYRef.current - clientY;
      const screenHeight = window.innerHeight;
      const deltaPercent = (deltaY / screenHeight) * 100;
      const newHeight = Math.max(25, Math.min(85, startHeightRef.current + deltaPercent));
      setSheetHeight(newHeight);
    };

    const onEnd = () => {
      startYRef.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchmove', onMove, { passive: true });
    document.addEventListener('touchend', onEnd);
  };

  const selectRoute = (index) => {
    setSelectedIndex(index);
    setShowSteps(false);
    if (onSelectRoute) onSelectRoute(routes[index]);
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[1000] flex flex-col transition-[height] duration-200 ease-out bg-white rounded-t-3xl shadow-2xl"
      style={{ height: `${sheetHeight}vh` }}
    >
      {/* Handle de arrastar */}
      <div
        className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing touch-none select-none"
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        <div className="w-12 h-1 bg-gray-300 rounded-full" />
      </div>

      {/* Header */}
      <div className="px-4 pb-2 flex items-center justify-between">
        <h2 className="text-base font-bold text-unaerp-blue">
          {routes.length} rota{routes.length > 1 ? 's' : ''}
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSheetHeight(sheetHeight >= 75 ? 35 : 85)}
            className="p-1.5 hover:bg-gray-100 rounded-full transition"
            aria-label={sheetHeight >= 75 ? 'Recolher' : 'Expandir'}
          >
            {sheetHeight >= 75
              ? <ChevronDown size={18} className="text-gray-400" />
              : <ChevronUp size={18} className="text-gray-400" />
            }
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition"
            aria-label="Recolher rotas"
          >
            <ChevronDown size={20} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Seletor de rotas */}
      <div className="flex gap-1.5 px-4 pb-2 overflow-x-auto scrollbar-hide">
        {routes.map((route, i) => {
          const rType = getRouteType(route);
          const rStyle = routeStyle[rType] || routeStyle.balanced;
          const isSelected = i === selectedIndex;
          return (
            <button
              key={route.id || i}
              onClick={() => selectRoute(i)}
              className={`
                flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all
                ${isSelected
                  ? 'bg-unaerp-blue text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
              aria-pressed={isSelected}
            >
              {rStyle.label}
            </button>
          );
        })}
      </div>

      {/* Detalhes (área scrollável) */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Grid compacto de dados */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className={`rounded-xl p-2 text-center ${style.bg} border ${style.border}`}>
            <p className="text-base font-bold text-gray-800">
              {selected.distance != null
                ? selected.distance < 1000
                  ? `${selected.distance}m`
                  : `${(selected.distance / 1000).toFixed(1)}km`
                : '—'}
            </p>
            <p className="text-[10px] text-gray-500">Distância</p>
          </div>
          <div className={`rounded-xl p-2 text-center ${style.bg} border ${style.border}`}>
            <p className="text-base font-bold text-gray-800">
              {selected.estimatedTime != null
                ? `${selected.estimatedTime} min`
                : selected.duration != null
                ? `${selected.duration} min`
                : '—'}
            </p>
            <p className="text-[10px] text-gray-500">Tempo</p>
          </div>
          <div className={`rounded-xl p-2 text-center ${style.bg} border ${style.border}`}>
            <p className="text-base font-bold text-gray-800">
              {selected.accessibilityScore != null
                ? `${selected.accessibilityScore}/10`
                : selected.is_accessible
                ? '10/10'
                : '9/10'}
            </p>
            <p className="text-[10px] text-gray-500">Acesso</p>
          </div>
        </div>

        {/* Accessibility badges */}
        {selected.accessibility && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {selected.accessibility.hasRamps && (
              <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] rounded-full font-medium">
                ✅ Rampas
              </span>
            )}
            {selected.accessibility.hasElevators && (
              <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] rounded-full font-medium">
                🛗 Elevadores
              </span>
            )}
            {selected.accessibility.hasWheelchairAccess && (
              <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] rounded-full font-medium">
                ♿ Cadeira de rodas
              </span>
            )}
          </div>
        )}

        {/* Destino info */}
        {destination && (
          <div className="mb-3 p-2.5 bg-unaerp-blue/5 rounded-xl border border-unaerp-blue/15">
            <p className="text-xs font-bold text-unaerp-blue">Destino: {destination.name}</p>
            <p className="text-[10px] text-gray-500 truncate">{destination.description || ''}</p>
          </div>
        )}

        {/* Passo a passo */}
        {selected.steps && selected.steps.length > 0 && (
          <div>
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="w-full flex items-center justify-between py-2 px-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition mb-2"
            >
              <span className="font-semibold text-gray-800 flex items-center gap-2 text-sm">
                <Navigation size={16} className="text-unaerp-blue" />
                Passo a passo ({selected.steps.length})
              </span>
              {showSteps
                ? <ChevronUp size={16} className="text-gray-500" />
                : <ChevronDown size={16} className="text-gray-500" />
              }
            </button>

            {showSteps && (
              <div className="space-y-2 mt-1">
                {selected.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-2 px-2 py-1.5 bg-gray-50 rounded-lg">
                    <div className="w-5 h-5 rounded-full bg-unaerp-blue text-white text-[10px] flex items-center justify-center flex-shrink-0 font-bold mt-0.5">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700">{step.instruction}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {step.distance ? `${step.distance}m` : ''}{step.duration ? ` · ${step.duration} min` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
