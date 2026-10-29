import React, { useState } from 'react';
import { Volume2, VolumeX, HelpCircle, Layers, PawPrint, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { CatBreed } from '../types/game';

interface CinemaBottomDockProps {
  currentBreed: CatBreed;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenBreeds: () => void;
  onOpenLevels: () => void;
  onOpenHelp: () => void;
  onRestartLevel: () => void;
  onMeow: () => void;
}

export const CinemaBottomDock: React.FC<CinemaBottomDockProps> = ({
  currentBreed,
  isMuted,
  onToggleMute,
  onOpenBreeds,
  onOpenLevels,
  onOpenHelp,
  onRestartLevel,
  onMeow,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className="fixed z-40 transition-transform duration-300 ease-out select-none"
      style={{
        bottom: '20px',
        left: '50%',
        transform: `translateX(-50%) translateY(${isCollapsed ? 'calc(100% + 20px)' : '0px'})`,
        maxWidth: 'min(940px, 94vw)',
        width: 'max-content',
      }}
    >
      {/* Attached Collapse / Expand Toggle Tab */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -top-7 left-1/2 -translate-x-1/2 px-3 py-1 rounded-t-lg bg-zinc-900 border-t border-x border-zinc-700 text-[11px] font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition flex items-center gap-1 shadow-md"
        title="Atajo: Tecla H"
      >
        {isCollapsed ? (
          <>
            <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
            <span>Mostrar Controles</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
            <span>Ocultar (Modo Cine)</span>
          </>
        )}
      </button>

      {/* Main Unified Dock Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-2 bg-zinc-900/95 border border-zinc-700/80 rounded-2xl shadow-2xl text-white">
        {/* Breed Selector Pill */}
        <button
          onClick={onOpenBreeds}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-600/60 transition group text-left"
          title="Cambiar Raza de Gato"
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shadow-sm"
            style={{ backgroundColor: currentBreed.pawStyle.furColor }}
          >
            {currentBreed.avatarIcon}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-400 font-medium">Raza Activa</span>
            <span className="text-xs font-bold text-amber-300 group-hover:text-amber-200">
              {currentBreed.name}
            </span>
          </div>
        </button>

        {/* Levels Button */}
        <button
          onClick={onOpenLevels}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-600/60 transition text-xs font-semibold text-zinc-200"
          title="Seleccionar Nivel de Techos"
        >
          <Layers className="w-4 h-4 text-sky-400" />
          <span>Niveles</span>
        </button>

        {/* Meow Sound Button */}
        <button
          onClick={onMeow}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 transition text-xs font-bold"
          title="¡Hacer un maullido! (Tecla M)"
        >
          <span>🐱</span>
          <span>¡Miau!</span>
        </button>

        {/* Restart Level */}
        <button
          onClick={onRestartLevel}
          className="p-2.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-600/60 transition text-zinc-300 hover:text-white"
          title="Reiniciar Nivel Actual"
          aria-label="Reiniciar"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Mute Toggle */}
        <button
          onClick={onToggleMute}
          className="p-2.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-600/60 transition text-zinc-300 hover:text-white"
          title={isMuted ? 'Activar Sonido' : 'Silenciar'}
          aria-label="Sonido"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        {/* Controls Help */}
        <button
          onClick={onOpenHelp}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-600/60 transition text-xs font-semibold text-zinc-300 hover:text-white"
          title="Ver Guía de Teclas"
        >
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span>Controles</span>
        </button>
      </div>
    </div>
  );
};
