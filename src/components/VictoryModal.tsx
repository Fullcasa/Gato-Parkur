import React from 'react';
import { Star, Trophy, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import { LEVELS } from '../data/levels';

interface VictoryModalProps {
  isOpen: boolean;
  levelId: number;
  bonusScore: number;
  stars: number;
  totalFoodCollected: number;
  totalLevelFood: number;
  onNextLevel: () => void;
  onReplay: () => void;
  onOpenBreeds: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  levelId,
  bonusScore,
  stars,
  totalFoodCollected,
  totalLevelFood,
  onNextLevel,
  onReplay,
  onOpenBreeds,
}) => {
  if (!isOpen) return null;

  const currentLevelConfig = LEVELS.find((l) => l.id === levelId);
  const hasNextLevel = levelId < LEVELS.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-in fade-in zoom-in-95 duration-300">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-zinc-900 border-2 border-amber-500 shadow-2xl p-6 text-center text-white">
        {/* Glow backdrop */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Victory Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-3xl shadow-lg mb-3">
          🐭
        </div>

        <h2 className="text-2xl font-black text-amber-400 mb-1">¡RATÓN CAZADO!</h2>
        <p className="text-xs text-zinc-300 mb-4">
          ¡Entraste a la casa por la claraboya, sorteaste los muebles y atrapaste al ratón!
        </p>

        {/* Stars */}
        <div className="flex justify-center items-center gap-2 mb-6">
          {[1, 2, 3].map((starIndex) => (
            <div
              key={starIndex}
              className={`p-2 rounded-full border transition-all ${
                starIndex <= stars
                  ? 'bg-amber-500/20 border-amber-400 text-amber-400 scale-110'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-600'
              }`}
            >
              <Star className={`w-7 h-7 ${starIndex <= stars ? 'fill-amber-400' : ''}`} />
            </div>
          ))}
        </div>

        {/* Stats card */}
        <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 mb-6 space-y-2 text-sm text-left">
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Comida en Tejados:</span>
            <span className="font-bold text-amber-300">🐟 {totalFoodCollected} / {totalLevelFood}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Bonus de Caza:</span>
            <span className="font-bold text-emerald-400">+{bonusScore} pts</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-zinc-800/80">
            <span className="text-zinc-400">Misión Completada:</span>
            <span className="font-bold text-rose-400">¡Ratón Atrapatrapado! 🏆</span>
          </div>
        </div>

        {/* Unlock hint */}
        <button
          onClick={onOpenBreeds}
          className="w-full mb-4 py-2 px-3 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 flex items-center justify-center gap-2 transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          ¿Quieres desbloquear o cambiar de raza de gato?
        </button>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onReplay}
            className="flex-1 py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Repetir
          </button>

          {hasNextLevel ? (
            <button
              onClick={onNextLevel}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-sm transition shadow-lg flex items-center justify-center gap-2"
            >
              <span>Siguiente</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onReplay}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-sm transition shadow-lg flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              ¡Juego Completado!
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
