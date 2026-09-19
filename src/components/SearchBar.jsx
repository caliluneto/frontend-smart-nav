import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Navigation, X, ArrowRightLeft, Loader, Eye, Sparkles } from 'lucide-react';
import { searchPOIs, UNAERP_CAMPUS_POIS } from '../services/api';

// ============================================================================
// SearchBar — Barra de busca floating com busca de partida, destino e sugestões
// ============================================================================
export default function SearchBar({
  onSelectOrigin,
  onSelectDestination,
  onCalculateRoute,
  selectedOrigin,
  selectedDestination,
  loading,
  onOpenStreetView,
}) {
  const [fromQuery, setFromQuery] = useState('');
  const [toQuery, setToQuery] = useState('');
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);

  const fromRef = useRef(null);
  const toRef = useRef(null);

  // Sincroniza query com pontos selecionados externamente (ex: clique no mapa)
  useEffect(() => {
    if (selectedOrigin) {
      setFromQuery(selectedOrigin.name);
    }
  }, [selectedOrigin]);

  useEffect(() => {
    if (selectedDestination) {
      setToQuery(selectedDestination.name);
    }
  }, [selectedDestination]);

  // Carrega sugestões de partida (busca instantânea local + backend)
  useEffect(() => {
    const timer = setTimeout(async () => {
      const results = await searchPOIs(fromQuery);
      setFromSuggestions(results || []);
    }, 150);
    return () => clearTimeout(timer);
  }, [fromQuery]);

  // Carrega sugestões de destino
  useEffect(() => {
    const timer = setTimeout(async () => {
      const results = await searchPOIs(toQuery);
      setToSuggestions(results || []);
    }, 150);
    return () => clearTimeout(timer);
  }, [toQuery]);

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    const handleClick = (e) => {
      if (fromRef.current && !fromRef.current.contains(e.target)) setShowFrom(false);
      if (toRef.current && !toRef.current.contains(e.target)) setShowTo(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, []);

  const selectFrom = (poi) => {
    setFromQuery(poi.name);
    setShowFrom(false);
    onSelectOrigin(poi);
  };

  const selectTo = (poi) => {
    setToQuery(poi.name);
    setShowTo(false);
    onSelectDestination(poi);
  };

  const handleSwap = () => {
    const tempQuery = fromQuery;
    const tempPoi = selectedOrigin;
    setFromQuery(toQuery);
    setToQuery(tempQuery);
    onSelectOrigin(selectedDestination);
    onSelectDestination(tempPoi);
  };

  const handleClear = () => {
    setFromQuery('');
    setToQuery('');
    onSelectOrigin(null);
    onSelectDestination(null);
  };

  const canCalculate = selectedOrigin && selectedDestination && !loading;

  const typeEmoji = (type) => {
    const map = {
      classroom: '🏫',
      laboratory: '🔬',
      library: '📚',
      cafeteria: '☕',
      auditorium: '🎭',
      restroom: '🚻',
      parking: '🅿️',
      entrance: '🚪',
      health: '🏥',
      sports: '⚽',
    };
    return map[type] || '📍';
  };

  // Pontos de atalho rápido (IDs devem corresponder aos de UNAERP_CAMPUS_POIS)
  const quickPois = [
    { label: 'Portaria', id: 'portaria-principal' },
    { label: 'Biblioteca', id: 'bloco-e' },
    { label: 'Bloco A', id: 'bloco-a' },
    { label: 'Bloco B', id: 'bloco-b' },
    { label: 'Cantina', id: 'cantina' },
    { label: 'Hospital', id: 'hospital' },
  ];

  const handleQuickSelect = (poiId, label) => {
    // Busca pelo ID exato primeiro, depois por nome
    const found = UNAERP_CAMPUS_POIS.find((p) => p.id === poiId)
      || UNAERP_CAMPUS_POIS.find((p) =>
        p.name.toLowerCase().includes(label.toLowerCase())
      );

    if (!found) return;

    // Sempre seleciona como destino
    selectTo(found);
  };

  return (
    <div className="absolute top-4 left-4 right-4 z-[1000] max-w-xl mx-auto animate-slide-down">
      <div className="glass rounded-2xl shadow-xl overflow-visible border border-white/40">
        {/* Header da barra de busca */}
        <div className="px-4 py-2.5 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-unaerp-blue flex items-center justify-center flex-shrink-0">
              <Navigation size={14} className="text-unaerp-yellow" />
            </div>
            <div>
              <h1 className="text-xs font-bold text-unaerp-blue tracking-tight">
                Campus UNAERP — Ribeirânia
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onOpenStreetView && (
              <button
                onClick={() => onOpenStreetView(selectedDestination || selectedOrigin)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium text-unaerp-blue bg-unaerp-blue/10 hover:bg-unaerp-blue/20 flex items-center gap-1 transition"
                title="Abrir Street View 360°"
              >
                <Eye size={13} className="text-unaerp-blue" />
                <span className="hidden sm:inline">Street View</span>
              </button>
            )}

            {(fromQuery || toQuery) && (
              <button
                onClick={handleClear}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                aria-label="Limpar campos"
                title="Limpar campos"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Inputs de Partida e Destino */}
        <div className="p-3 space-y-2">
          {/* Campo: Partida */}
          <div className="relative" ref={fromRef}>
            <div className="flex items-center gap-2 bg-white/90 rounded-xl px-3 py-2 border border-gray-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
              <input
                type="text"
                value={fromQuery}
                onChange={(e) => {
                  setFromQuery(e.target.value);
                  if (selectedOrigin && selectedOrigin.name !== e.target.value) {
                    onSelectOrigin(null);
                  }
                }}
                onFocus={() => {
                  setShowFrom(true);
                  setShowTo(false);
                }}
                placeholder="De onde? (ex: Portaria, Bloco A, Cantina)"
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none"
                aria-label="Local de partida"
              />
              {selectedOrigin && (
                <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                  OK
                </span>
              )}
            </div>

            {/* Sugestões de Partida */}
            {showFrom && fromSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 glass rounded-xl shadow-xl max-h-56 overflow-y-auto z-50 border border-gray-100">
                <div className="px-3 py-1.5 bg-gray-50 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Selecione o ponto de partida
                </div>
                {fromSuggestions.map((poi, i) => (
                  <button
                    key={poi.id || i}
                    onClick={() => selectFrom(poi)}
                    className="w-full text-left px-3 py-2 hover:bg-unaerp-blue/10 flex items-center gap-2.5 transition border-b border-gray-50 last:border-0"
                  >
                    <span className="text-base">{typeEmoji(poi.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{poi.name}</p>
                      <p className="text-xs text-gray-500 truncate">{poi.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Botão de Inverter */}
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] text-gray-400">Rota a pé pelo campus</span>
            <button
              onClick={handleSwap}
              disabled={!selectedOrigin && !selectedDestination}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-unaerp-blue transition disabled:opacity-40"
              title="Inverter partida e destino"
            >
              <ArrowRightLeft size={13} />
            </button>
          </div>

          {/* Campo: Destino */}
          <div className="relative" ref={toRef}>
            <div className="flex items-center gap-2 bg-white/90 rounded-xl px-3 py-2 border border-gray-200 focus-within:border-unaerp-yellow focus-within:ring-2 focus-within:ring-unaerp-yellow/30 transition shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-unaerp-yellow flex-shrink-0" />
              <input
                type="text"
                value={toQuery}
                onChange={(e) => {
                  setToQuery(e.target.value);
                  if (selectedDestination && selectedDestination.name !== e.target.value) {
                    onSelectDestination(null);
                  }
                }}
                onFocus={() => {
                  setShowTo(true);
                  setShowFrom(false);
                }}
                placeholder="Para onde? (ex: Biblioteca, Bloco C, Teatro)"
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none"
                aria-label="Local de destino"
              />
              {selectedDestination && (
                <span className="text-xs text-unaerp-yellow-dark font-bold bg-yellow-50 px-1.5 py-0.5 rounded">
                  OK
                </span>
              )}
            </div>

            {/* Sugestões de Destino */}
            {showTo && toSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 glass rounded-xl shadow-xl max-h-56 overflow-y-auto z-50 border border-gray-100">
                <div className="px-3 py-1.5 bg-gray-50 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Selecione o destino
                </div>
                {toSuggestions.map((poi, i) => (
                  <button
                    key={poi.id || i}
                    onClick={() => selectTo(poi)}
                    className="w-full text-left px-3 py-2 hover:bg-unaerp-yellow/15 flex items-center gap-2.5 transition border-b border-gray-50 last:border-0"
                  >
                    <span className="text-base">{typeEmoji(poi.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{poi.name}</p>
                      <p className="text-xs text-gray-500 truncate">{poi.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Atalhos rápidos de POIs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 text-xs">
            <span className="text-gray-400 text-[11px] flex-shrink-0 flex items-center gap-1">
              <Sparkles size={11} className="text-unaerp-yellow-dark" /> Atalhos:
            </span>
            {quickPois.map((qp) => (
              <button
                key={qp.id}
                onClick={() => handleQuickSelect(qp.id, qp.label)}
                className="px-2 py-0.5 rounded-md bg-gray-100/80 hover:bg-unaerp-blue hover:text-white text-gray-700 transition whitespace-nowrap text-[11px]"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Botão Calcular Rota */}
          <button
            onClick={onCalculateRoute}
            disabled={!canCalculate}
            className={`
              w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md
              ${canCalculate
                ? 'bg-unaerp-blue text-white hover:bg-unaerp-blue-light active:scale-[0.99] cursor-pointer shadow-unaerp-blue/20'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
            aria-label="Calcular rota pelo campus"
          >
            {loading ? (
              <>
                <Loader size={16} className="animate-spin text-unaerp-yellow" />
                <span>Calculando trajeto...</span>
              </>
            ) : (
              <>
                <Search size={16} />
                <span>{canCalculate ? 'Calcular Rota Agora' : 'Selecione Partida e Destino'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
