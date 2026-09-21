import { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, Navigation, ArrowRightLeft, Loader, Sparkles, ChevronDown } from 'lucide-react';
import { searchPOIs, UNAERP_CAMPUS_POIS } from '../services/api';

// ============================================================================
// SearchBar — Barra de busca floating, compacta no mobile
// ============================================================================
export default function SearchBar({
  onSelectOrigin,
  onSelectDestination,
  onCalculateRoute,
  selectedOrigin,
  selectedDestination,
  loading,
  onOpenStreetView,
  shouldCollapse,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [fromQuery, setFromQuery] = useState('');
  const [toQuery, setToQuery] = useState('');
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const fromRef = useRef(null);
  const toRef = useRef(null);

  // Detecta mobile — roda no mount
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-recolher quando solicitado externamente (ex: cálculo de rota)
  useEffect(() => {
    if (shouldCollapse && isMobile) {
      setIsExpanded(false);
    }
  }, [shouldCollapse, isMobile]);

  // Sincroniza query com pontos selecionados externamente
  useEffect(() => {
    if (selectedOrigin) setFromQuery(selectedOrigin.name);
  }, [selectedOrigin]);

  useEffect(() => {
    if (selectedDestination) setToQuery(selectedDestination.name);
  }, [selectedDestination]);

  // Recolhe automaticamente em mobile ao selecionar destino
  useEffect(() => {
    if (isMobile && selectedOrigin && selectedDestination) {
      setTimeout(() => setIsExpanded(false), 500);
    }
  }, [selectedOrigin, selectedDestination, isMobile]);

  // Busca com debounce — partida
  useEffect(() => {
    if (fromQuery.length < 1) { setFromSuggestions([]); return; }
    const timer = setTimeout(async () => {
      const results = await searchPOIs(fromQuery);
      setFromSuggestions(results || []);
    }, 200);
    return () => clearTimeout(timer);
  }, [fromQuery]);

  // Busca com debounce — destino
  useEffect(() => {
    if (toQuery.length < 1) { setToSuggestions([]); return; }
    const timer = setTimeout(async () => {
      const results = await searchPOIs(toQuery);
      setToSuggestions(results || []);
    }, 200);
    return () => clearTimeout(timer);
  }, [toQuery]);

  // Fecha sugestões ao clicar fora
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
    setFromQuery(toQuery);
    setToQuery(tempQuery);
    onSelectOrigin(selectedDestination);
    onSelectDestination(selectedOrigin);
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
      classroom: '🏫', laboratory: '🔬', library: '📚', cafeteria: '☕',
      auditorium: '🎭', restroom: '🚻', parking: '🅿️', entrance: '🚪',
      health: '🏥', sports: '⚽',
    };
    return map[type] || '📍';
  };

  const handleShortcutClick = (name) => {
    const poi = UNAERP_CAMPUS_POIS?.find(
      (p) => p.name.toLowerCase().includes(name.toLowerCase())
    );
    if (poi) {
      selectTo(poi);
    } else {
      setToQuery(name);
    }
  };

  // ================================================================
  // MODO COMPACTO — mobile, recolhido (padrão)
  // ================================================================
  if (isMobile && !isExpanded) {
    return (
      <div className="bg-white rounded-full shadow-lg overflow-hidden">
        <button
          onClick={() => {
            setIsExpanded(true);
            setTimeout(() => inputRef.current?.focus(), 100);
          }}
          className="w-full flex items-center gap-2 px-3 py-2"
          aria-label="Abrir busca"
        >
          <Search className="text-unaerp-blue flex-shrink-0" size={18} />
          <span className="text-gray-500 text-xs truncate">
            {selectedDestination ? `🎯 ${selectedDestination.name}` : 'Buscar destino...'}
          </span>
          {selectedOrigin && selectedDestination && (
            <span className="ml-auto text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full flex-shrink-0">
              Rota OK
            </span>
          )}
        </button>
      </div>
    );
  }

  // ================================================================
  // MODO EXPANDIDO — desktop always, mobile quando clica
  // ================================================================
  return (
    <div ref={containerRef} className="relative w-full">
      <div className="bg-white rounded-2xl shadow-2xl overflow-visible">
        {/* Header com botão fechar */}
        <div className={`flex items-center justify-between ${isMobile ? 'px-3 py-1.5' : 'px-4 py-2'} border-b border-gray-100`}>
          <span className="text-xs font-semibold text-gray-500">
            {isMobile ? 'Buscar destino' : 'Campus UNAERP — Ribeirânia'}
          </span>
          <div className="flex items-center gap-1">
            {(fromQuery || toQuery) && (
              <button
                onClick={handleClear}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                aria-label="Limpar campos"
              >
                <X size={14} />
              </button>
            )}
            {isMobile && (
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition"
                aria-label="Recolher busca"
              >
                <ChevronDown size={18} className="text-gray-500" />
              </button>
            )}
          </div>
        </div>

        {/* Campos de Partida e Destino */}
        <div className={`${isMobile ? 'p-2 space-y-1.5' : 'p-3 space-y-2'}`}>
          {/* Campo: Partida */}
          <div className="relative" ref={fromRef}>
            <div className={`flex items-center gap-2 bg-gray-50 rounded-xl ${isMobile ? 'px-2.5 py-2' : 'px-3 py-2.5'} border border-gray-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition`}>
              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              <input
                type="text"
                value={fromQuery}
                onChange={(e) => {
                  setFromQuery(e.target.value);
                  if (selectedOrigin && selectedOrigin.name !== e.target.value) onSelectOrigin(null);
                }}
                onFocus={() => { setShowFrom(true); setShowTo(false); }}
                placeholder="De onde?"
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none"
                aria-label="Local de partida"
              />
              {selectedOrigin && (
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">OK</span>
              )}
            </div>

            {showFrom && fromSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl max-h-48 overflow-y-auto z-50 border border-gray-100">
                {fromSuggestions.map((poi, i) => (
                  <button
                    key={poi.id || i}
                    onClick={() => selectFrom(poi)}
                    className="w-full text-left px-3 py-2 hover:bg-unaerp-blue/10 flex items-center gap-2 transition border-b border-gray-50 last:border-0"
                  >
                    <span className="text-sm">{typeEmoji(poi.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{poi.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{poi.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Inverter + label */}
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] text-gray-400">Rota a pé pelo campus</span>
            <button
              onClick={handleSwap}
              disabled={!selectedOrigin && !selectedDestination}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-unaerp-blue transition disabled:opacity-40"
              title="Inverter"
            >
              <ArrowRightLeft size={12} />
            </button>
          </div>

          {/* Campo: Destino */}
          <div className="relative" ref={toRef}>
            <div className={`flex items-center gap-2 bg-gray-50 rounded-xl ${isMobile ? 'px-2.5 py-2' : 'px-3 py-2.5'} border border-gray-200 focus-within:border-unaerp-yellow focus-within:ring-2 focus-within:ring-unaerp-yellow/30 transition`}>
              <div className="w-5 h-5 rounded-full bg-unaerp-yellow flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-unaerp-blue" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={toQuery}
                onChange={(e) => {
                  setToQuery(e.target.value);
                  if (selectedDestination && selectedDestination.name !== e.target.value) onSelectDestination(null);
                }}
                onFocus={() => { setShowTo(true); setShowFrom(false); }}
                placeholder="Para onde?"
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none"
                aria-label="Local de destino"
              />
              {selectedDestination && (
                <span className="text-[10px] text-unaerp-yellow-dark font-bold bg-yellow-50 px-1.5 py-0.5 rounded">OK</span>
              )}
            </div>

            {showTo && toSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl max-h-48 overflow-y-auto z-50 border border-gray-100">
                {toSuggestions.map((poi, i) => (
                  <button
                    key={poi.id || i}
                    onClick={() => selectTo(poi)}
                    className="w-full text-left px-3 py-2 hover:bg-unaerp-yellow/15 flex items-center gap-2 transition border-b border-gray-50 last:border-0"
                  >
                    <span className="text-sm">{typeEmoji(poi.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{poi.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{poi.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Atalhos (mobile: só 4) */}
          <div className={`flex items-center gap-1.5 overflow-x-auto ${isMobile ? 'pt-0.5 pb-0' : 'pt-1 pb-0.5'}`}>
            <span className={`text-gray-400 flex-shrink-0 ${isMobile ? 'text-[9px]' : 'text-[10px]'} flex items-center gap-1`}>
              <Sparkles size={10} className="text-unaerp-yellow-dark" /> Atalhos:
            </span>
            {(isMobile ? ['Portaria', 'Biblioteca', 'Bloco A', 'Cantina'] : ['Portaria', 'Biblioteca', 'Bloco A', 'Bloco B', 'Cantina', 'Hospital']).map((name) => (
              <button
                key={name}
                onClick={() => handleShortcutClick(name)}
                className={`flex-shrink-0 font-semibold text-gray-600 bg-gray-100 hover:bg-unaerp-blue hover:text-white rounded-full transition whitespace-nowrap ${isMobile ? 'px-2 py-0.5 text-[9px]' : 'px-2 py-1 text-[10px]'}`}
              >
                {name}
              </button>
            ))}
          </div>

          {/* Botão Calcular Rota */}
          <button
            onClick={onCalculateRoute}
            disabled={!canCalculate}
            className={`
              w-full ${isMobile ? 'py-2' : 'py-2.5'} rounded-xl font-bold ${isMobile ? 'text-xs' : 'text-sm'} flex items-center justify-center gap-2 transition-all shadow-md
              ${canCalculate
                ? 'bg-unaerp-blue text-white hover:bg-unaerp-blue-light active:scale-[0.99] cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
            aria-label="Calcular rota pelo campus"
          >
            {loading ? (
              <>
                <Loader size={16} className="animate-spin text-unaerp-yellow" />
                <span>Calculando...</span>
              </>
            ) : (
              <>
                <Search size={16} />
                <span>{canCalculate ? 'Calcular Rota' : 'Selecione Partida e Destino'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
