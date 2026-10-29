import React from 'react';
import { Play, MousePointer, ShieldAlert } from 'lucide-react';
import { CatBreed, LevelConfig } from '../types/game';

interface ClickToPlayOverlayProps {
  isLocked: boolean;
  onStartPlay: () => void;
  level: LevelConfig;
  currentBreed: CatBreed;
}

export const ClickToPlayOverlay: React.FC<ClickToPlayOverlayProps> = ({
  isLocked,
  onStartPlay,
  level,
  currentBreed,
}) => {
  if (isLocked) return null;

  return (
    <div
      onClick={onStartPlay}
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 cursor-pointer select-none transition-all p-4"
    >
      <div className="relative max-w-lg w-full bg-zinc-900/95 border-2 border-amber-500/80 rounded-3xl p-6 text-center text-white shadow-2xl space-y-4">
        {/* Cat Avatar badge */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500 text-zinc-950 flex items-center justify-center text-3xl font-black shadow-lg">
          🐾
        </div>

        <div>
          <h1 className="text-2xl font-black text-amber-400">GatoParkour 3D</h1>
          <p className="text-xs text-zinc-300 mt-1">Salto de Techos en Primera Persona</p>
        </div>

        {/* Current Mission Info */}
        <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-3 text-left space-y-1.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Nivel Activo:</span>
            <span className="font-bold text-amber-300">{level.title}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Raza de Gato:</span>
            <span className="font-bold text-sky-400">{currentBreed.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Misión:</span>
            <span className="font-semibold text-zinc-200">
              Recolecta {level.requiredFood} comidas y llega a la Cesta 🧺
            </span>
          </div>
        </div>

        {/* Quick controls preview */}
        <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-300 bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/80">
          <div><strong className="text-amber-400">Flechas ↑ / ↓:</strong> Caminar</div>
          <div><strong className="text-amber-400">Flechas ← / →:</strong> Girar cabeza</div>
          <div><strong className="text-amber-400">⌘ + ↑ / ↓:</strong> Mirar arriba/abajo</div>
          <div><strong className="text-amber-400">ESPACIO:</strong> Saltar techos</div>
        </div>

        {/* Big play button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStartPlay();
          }}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-base shadow-xl flex items-center justify-center gap-2 transition active:scale-95"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>¡Haz Click para Comenzar a Jugar!</span>
        </button>

        <p className="text-[10px] text-zinc-400 flex items-center justify-center gap-1">
          <MousePointer className="w-3 h-3" />
          <span>Al hacer click se activa la vista libre del ratón en 1ª persona. Presiona ESC para pausar.</span>
        </p>
      </div>
    </div>
  );
};
