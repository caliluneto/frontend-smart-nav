import { useState, useRef, useEffect } from 'react';
import {
  Clock, Ruler, Shield, Accessibility, ChevronUp, ChevronDown,
  Zap, TreePine, Scale, X, Navigation,
} from 'lucide-react';
// import PanoramaButton from './PanoramaButton'; // Temporariamente desabilitado (Photo Sphere)

// ============================================================================
// RoutePanel — Bottom sheet com rotas calculadas
// ============================================================================

// Ícone e cor por tipo de rota
const routeStyle = {
  fastest: { icon: Zap, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', label: '⚡ Mais Rápida' },
  safest: { icon: Shield, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', label: '🛡️ Mais Segura' },
  accessible: { icon: Accessibility, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200', label: '♿ Acessível' },
  scenic: { icon: TreePine, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', label: '🌳 Cenográfica' },
  balanced: { icon: Scale, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200', label: '⚖️ Balanceada' },
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
  onOpenPanorama,
}) {
  const [expanded, setExpanded] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showSteps, setShowSteps] = useState(false);
  const panelRef = useRef(null);

  // Touch drag para fechar
  const startY = useRef(0);
  const handleTouchStart = (e) => {
    startY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e) => {
    const diff = e.changedTouches[0].clientY - startY.current;
    if (diff > 100) {
      setExpanded(false);
    } else if (diff < -50) {
      setExpanded(true);
    }
  };

  const selectRoute = (index) => {
    setSelectedIndex(index);
    if (onSelectRoute) onSelectRoute(routes[index]);
  };

  if (!routes || routes.length === 0) return null;

  const selected = routes[selectedIndex];
  const style = routeStyle[getRouteType(selected)] || routeStyle.balanced;
  const RouteIcon = style.icon;

  return (
    <div
      ref={panelRef}
      className={`
        absolute bottom-0 left-0 right-0 z-[1000] transition-all duration-300 ease-out
        ${expanded ? 'max-h-[70vh]' : 'max-h-[140px]'}
      `}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="glass rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="px-4 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation size={18} className="text-unaerp-blue" />
            <h2 className="text-base font-bold text-unaerp-blue">
              {routes.length} rota{routes.length > 1 ? 's' : ''} encontrada{routes.length > 1 ? 's' : ''}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-full hover:bg-gray-100 transition"
              aria-label={expanded ? 'Minimizar' : 'Expandir'}
            >
              {expanded ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronUp size={18} className="text-gray-400" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 transition"
              aria-label="Fechar painel de rotas"
            >
              <X size={18} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Route Tabs */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {routes.map((route, i) => {
            const rType = getRouteType(route);
            const rStyle = routeStyle[rType] || routeStyle.balanced;
            const isSelected = i === selectedIndex;
            return (
              <button
                key={route.id || i}
                onClick={() => selectRoute(i)}
                className={`
                  flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all border
                  ${isSelected
                    ? `${rStyle.bg} ${rStyle.border} ${rStyle.color} ring-2 ring-offset-1 ring-current/20`
                    : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                  }
                `}
                aria-label={rStyle.label}
                aria-pressed={isSelected}
              >
                {rStyle.label}
              </button>
            );
          })}
        </div>

        {/* Selected Route Details */}
        {expanded && (
          <div className="px-4 pb-4 overflow-y-auto flex-1 animate-fade-in">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className={`rounded-xl p-3 text-center ${style.bg}`}>
                <Ruler size={18} className={`mx-auto mb-1 ${style.color}`} />
                <p className="text-base font-bold text-gray-800">
                  {selected.distance != null
                    ? selected.distance === 0
                      ? '0m'
                      : selected.distance < 1000
                      ? `${selected.distance}m`
                      : `${(selected.distance / 1000).toFixed(1)}km`
                    : '—'}
                </p>
                <p className="text-xs text-gray-500">Distância</p>
              </div>
              <div className={`rounded-xl p-3 text-center ${style.bg}`}>
                <Clock size={18} className={`mx-auto mb-1 ${style.color}`} />
                <p className="text-base font-bold text-gray-800">
                  {selected.estimatedTime != null
                    ? selected.estimatedTime === 0
                      ? '< 1 min'
                      : `${selected.estimatedTime} min`
                    : selected.duration != null
                    ? selected.duration === 0
                      ? '< 1 min'
                      : `${selected.duration} min`
                    : '—'}
                </p>
                <p className="text-xs text-gray-500">Tempo</p>
              </div>
              <div className={`rounded-xl p-3 text-center ${style.bg}`}>
                <Accessibility size={18} className={`mx-auto mb-1 ${style.color}`} />
                <p className="text-base font-bold text-gray-800">
                  {selected.accessibilityScore != null
                    ? `${selected.accessibilityScore}/10`
                    : selected.is_accessible
                    ? '10/10'
                    : '9/10'}
                </p>
                <p className="text-xs text-gray-500">Acessibilidade</p>
              </div>
            </div>

            {/* Accessibility info */}
            {selected.accessibility && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selected.accessibility.hasRamps && (
                  <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs rounded-full font-medium">
                    ✅ Rampas
                  </span>
                )}
                {selected.accessibility.hasElevators && (
                  <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs rounded-full font-medium">
                    🛗 Elevadores
                  </span>
                )}
                {selected.accessibility.hasWheelchairAccess && (
                  <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs rounded-full font-medium">
                    ♿ Cadeira de rodas
                  </span>
                )}
                {!selected.accessibility.hasRamps && !selected.accessibility.hasElevators && (
                  <span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 text-xs rounded-full font-medium">
                    ⚠️ Sem rampas/elevadores
                  </span>
                )}
              </div>
            )}

            {/* Difficulty badge */}
            {selected.difficulty && (
              <div className="mb-4">
                <span className={`
                  px-3 py-1 text-xs rounded-full font-medium
                  ${selected.difficulty === 'low' ? 'bg-green-50 text-green-700' :
                    selected.difficulty === 'medium' ? 'bg-yellow-50 text-yellow-700' :
                    'bg-red-50 text-red-700'}
                `}>
                  Dificuldade: {selected.difficulty === 'low' ? '🟢 Fácil' :
                    selected.difficulty === 'medium' ? '🟡 Média' : '🔴 Difícil'}
                </span>
              </div>
            )}

            {/* Destino info */}
            {destination && (
              <div className="mb-4 p-3 bg-unaerp-blue/5 rounded-2xl border border-unaerp-blue/15">
                <p className="text-xs font-bold text-unaerp-blue">Destino: {destination.name}</p>
                <p className="text-[11px] text-gray-500 truncate">{destination.description || 'Visualize o local antes de caminhar'}</p>
              </div>
            )}

            {/* Steps / Instruções */}
            {selected.steps && selected.steps.length > 0 && (
              <div>
                <button
                  onClick={() => setShowSteps(!showSteps)}
                  className="w-full flex items-center justify-between py-2 text-sm font-semibold text-unaerp-blue"
                >
                  <span>📋 Instruções passo-a-passo ({selected.steps.length})</span>
                  {showSteps ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {showSteps && (
                  <div className="space-y-2 mt-2 animate-fade-in">
                    {selected.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-3 px-2 py-2 bg-gray-50 rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-unaerp-blue text-white text-xs flex items-center justify-center flex-shrink-0 font-bold mt-0.5">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">{step.instruction}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
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
        )}
      </div>
    </div>
  );
}
