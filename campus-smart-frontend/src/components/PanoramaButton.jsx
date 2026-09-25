import { Camera } from 'lucide-react';
import { hasPanorama } from '../services/panoramaService';

export default function PanoramaButton({ poi, onClick, className = '' }) {
  if (!poi || !hasPanorama(poi)) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        inline-flex items-center justify-center gap-1.5 px-3 py-2
        bg-unaerp-blue text-white rounded-xl text-xs font-bold
        hover:bg-unaerp-blue-light transition-all shadow-sm active:scale-95
        border border-unaerp-blue-light/30 cursor-pointer
        ${className}
      `}
      aria-label={`Ver foto panorâmica 360 graus de ${poi.name}`}
    >
      <Camera size={15} className="text-unaerp-yellow flex-shrink-0" />
      <span>Foto 360°</span>
    </button>
  );
}
