import { useState, useEffect } from 'react';
import { Accessibility, Eye, Type, X } from 'lucide-react';

// ============================================================================
// AccessibilityMenu — FAB (Floating Action Button) de acessibilidade
// ============================================================================

const STORAGE_KEY = 'unaerp-accessibility';

const defaultPrefs = {
  highContrast: false,
  largeText: false,
  wheelchairMode: false,
  avoidStairs: false,
};

export default function AccessibilityMenu({ onPreferencesChange }) {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...defaultPrefs, ...JSON.parse(stored) } : defaultPrefs;
    } catch {
      return defaultPrefs;
    }
  });

  // Persistir no localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));

    // Aplicar classes no root
    const root = document.documentElement;
    root.classList.toggle('high-contrast', prefs.highContrast);
    root.classList.toggle('large-text', prefs.largeText);

    // Notificar parent
    if (onPreferencesChange) {
      onPreferencesChange({
        wheelchairAccessible: prefs.wheelchairMode,
        avoidStairs: prefs.avoidStairs,
      });
    }
  }, [prefs]);

  const toggle = (key) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const activeCount = Object.values(prefs).filter(Boolean).length;

  return (
    <div className="absolute bottom-6 left-4 z-[1000]">
      {/* Menu expandido */}
      {open && (
        <div className="glass rounded-2xl shadow-xl mb-3 p-4 w-64 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-unaerp-blue flex items-center gap-2">
              <Accessibility size={18} />
              Acessibilidade
            </h3>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-full hover:bg-gray-100 transition"
              aria-label="Fechar menu de acessibilidade"
            >
              <X size={16} className="text-gray-400" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Alto Contraste */}
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-2.5">
                <Eye size={16} className="text-gray-500 group-hover:text-unaerp-blue transition" />
                <span className="text-sm text-gray-700">Alto Contraste</span>
              </div>
              <div
                onClick={() => toggle('highContrast')}
                className={`
                  w-10 h-5 rounded-full transition-all cursor-pointer relative
                  ${prefs.highContrast ? 'bg-unaerp-blue' : 'bg-gray-300'}
                `}
                role="switch"
                aria-checked={prefs.highContrast}
                aria-label="Alto contraste"
              >
                <div className={`
                  absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all
                  ${prefs.highContrast ? 'left-5' : 'left-0.5'}
                `} />
              </div>
            </label>

            {/* Texto Grande */}
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-2.5">
                <Type size={16} className="text-gray-500 group-hover:text-unaerp-blue transition" />
                <span className="text-sm text-gray-700">Texto Grande</span>
              </div>
              <div
                onClick={() => toggle('largeText')}
                className={`
                  w-10 h-5 rounded-full transition-all cursor-pointer relative
                  ${prefs.largeText ? 'bg-unaerp-blue' : 'bg-gray-300'}
                `}
                role="switch"
                aria-checked={prefs.largeText}
                aria-label="Texto grande"
              >
                <div className={`
                  absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all
                  ${prefs.largeText ? 'left-5' : 'left-0.5'}
                `} />
              </div>
            </label>

            {/* Cadeira de Rodas */}
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-2.5">
                <span className="text-base">♿</span>
                <span className="text-sm text-gray-700">Cadeira de Rodas</span>
              </div>
              <div
                onClick={() => toggle('wheelchairMode')}
                className={`
                  w-10 h-5 rounded-full transition-all cursor-pointer relative
                  ${prefs.wheelchairMode ? 'bg-unaerp-blue' : 'bg-gray-300'}
                `}
                role="switch"
                aria-checked={prefs.wheelchairMode}
                aria-label="Modo cadeira de rodas"
              >
                <div className={`
                  absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all
                  ${prefs.wheelchairMode ? 'left-5' : 'left-0.5'}
                `} />
              </div>
            </label>

            {/* Evitar Escadas */}
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-2.5">
                <span className="text-base">🚫</span>
                <span className="text-sm text-gray-700">Evitar Escadas</span>
              </div>
              <div
                onClick={() => toggle('avoidStairs')}
                className={`
                  w-10 h-5 rounded-full transition-all cursor-pointer relative
                  ${prefs.avoidStairs ? 'bg-unaerp-blue' : 'bg-gray-300'}
                `}
                role="switch"
                aria-checked={prefs.avoidStairs}
                aria-label="Evitar escadas"
              >
                <div className={`
                  absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all
                  ${prefs.avoidStairs ? 'left-5' : 'left-0.5'}
                `} />
              </div>
            </label>
          </div>

          <p className="text-xs text-gray-400 mt-4 text-center">
            Suas preferências são salvas automaticamente.
          </p>
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`
          w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all
          ${open
            ? 'bg-unaerp-blue text-unaerp-yellow rotate-0'
            : 'bg-white text-unaerp-blue hover:bg-unaerp-blue hover:text-white'
          }
          ${activeCount > 0 ? 'ring-2 ring-unaerp-yellow ring-offset-2' : ''}
          active:scale-90
        `}
        aria-label="Menu de acessibilidade"
        aria-expanded={open}
      >
        <Accessibility size={22} />
        {activeCount > 0 && !open && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-unaerp-yellow text-unaerp-blue text-xs font-bold rounded-full flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </button>
    </div>
  );
}
