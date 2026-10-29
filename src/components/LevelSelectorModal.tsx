import React from 'react';
import { LevelConfig } from '../types/game';
import { LEVELS } from '../data/levels';
import { X, Lock, CheckCircle2, Star, Trophy, ArrowRight } from 'lucide-react';

interface LevelSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevelId: number;
  unlockedLevels: number[];
  completedLevels: number[];
  totalScore: number;
  onSelectLevel: (levelIndex: number) => void;
}

export const LevelSelectorModal: React.FC<LevelSelectorModalProps> = ({
  isOpen,
  onClose,
  currentLevelId,
  unlockedLevels,
  completedLevels,
  totalScore,
  onSelectLevel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl flex flex-col text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/70">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏙️</span>
            <div>
              <h2 className="text-xl font-bold text-amber-400">Selector de Niveles de Techos</h2>
              <p className="text-xs text-zinc-400">
                Supera los tejados, recolecta comida para sumar puntos y desbloquea distritos más altos.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Levels List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3.5">
          {LEVELS.map((level, idx) => {
            const isUnlocked = unlockedLevels.includes(level.id);
            const isCompleted = completedLevels.includes(level.id);
            const isCurrent = currentLevelId === level.id;

            return (
              <div
                key={level.id}
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-amber-950/30 border-amber-500 ring-2 ring-amber-500/20'
                    : isUnlocked
                    ? 'bg-zinc-800/70 border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800'
                    : 'bg-zinc-900/50 border-zinc-800 opacity-60'
                }`}
              >
                <div className="flex items-start gap-4 mb-3 sm:mb-0">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border ${
                      isCurrent
                        ? 'bg-amber-500 text-zinc-950 border-amber-400'
                        : isCompleted
                        ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
                        : isUnlocked
                        ? 'bg-zinc-700 text-white border-zinc-600'
                        : 'bg-zinc-800 text-zinc-600 border-zinc-800'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : level.id}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-zinc-100">{level.title}</h3>
                      {isCompleted && (
                        <span className="flex items-center gap-0.5 text-xs text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                          <Star className="w-3 h-3 fill-amber-400" /> Completado
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mb-1.5">{level.subtitle}</p>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-300">
                      <span className="bg-zinc-950/80 px-2 py-0.5 rounded border border-zinc-800">
                        🐟 Meta: Recolectar {level.requiredFood} / {level.totalFood} comidas
                      </span>
                      <span className="bg-zinc-950/80 px-2 py-0.5 rounded border border-zinc-800">
                        {level.skyTheme === 'sunny' && '☀️ Clima: Soleado'}
                        {level.skyTheme === 'sunset' && '🌅 Clima: Atardecer Ámbar'}
                        {level.skyTheme === 'twilight' && '🌆 Clima: Crepúsculo'}
                        {level.skyTheme === 'night_neon' && '🌃 Clima: Noche Neón'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right button */}
                <div className="w-full sm:w-auto">
                  {isUnlocked ? (
                    <button
                      onClick={() => {
                        onSelectLevel(idx);
                        onClose();
                      }}
                      className={`w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                        isCurrent
                          ? 'bg-amber-500 text-zinc-950 hover:bg-amber-400'
                          : 'bg-zinc-700 hover:bg-amber-500 hover:text-zinc-950 text-white'
                      }`}
                    >
                      {isCurrent ? 'En Curso' : 'Jugar Nivel'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 px-3 py-2 bg-zinc-950/50 rounded-lg border border-zinc-800">
                      <Lock className="w-3.5 h-3.5" />
                      Requiere completar el Nivel {level.id - 1}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-950/70 text-xs text-zinc-400 flex items-center justify-between">
          <span>🏆 Puntos Acumulados Totales: <strong className="text-amber-400">{totalScore} pts</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
