import React from 'react';
import { Compass, Trophy, Zap, Navigation } from 'lucide-react';
import { CatBreed, LevelConfig } from '../types/game';

interface TopHUDProps {
  score: number;
  highScore: number;
  level: LevelConfig;
  foodCount: number;
  totalFood: number;
  stamina: number;
  maxStamina: number;
  currentBreed: CatBreed;
  abilityCooldown: number;
  isCharging: boolean;
  chargePct: number;
  compassAngle: number;
  compassDistance: number;
  targetType?: 'food' | 'house' | 'mouse';
  isInsideHouse?: boolean;
  isNearWall?: boolean;
  pickupNotification: { name: string; points: number; color: string } | null;
}

export const TopHUD: React.FC<TopHUDProps> = ({
  score,
  highScore,
  level,
  foodCount,
  totalFood,
  stamina,
  maxStamina,
  currentBreed,
  abilityCooldown,
  isCharging,
  chargePct,
  compassAngle,
  compassDistance,
  targetType = 'food',
  isInsideHouse = false,
  isNearWall = false,
  pickupNotification,
}) => {
  const isGoalReached = foodCount >= level.requiredFood;
  const staminaPct = Math.round((stamina / maxStamina) * 100);

  const getTargetLabel = () => {
    if (isInsideHouse || targetType === 'mouse') return '¡Caza al Ratón!';
    if (targetType === 'house' || isGoalReached) return 'Casa del Ratón';
    return 'Comida Próxima';
  };

  const getTargetIcon = () => {
    if (isInsideHouse || targetType === 'mouse') return '🐭 Ratón';
    if (targetType === 'house' || isGoalReached) return '🧀 Claraboya';
    return '🐟 Comida';
  };

  const getTargetColor = () => {
    if (isInsideHouse || targetType === 'mouse') return 'text-rose-400';
    if (targetType === 'house' || isGoalReached) return 'text-amber-300';
    return 'text-sky-400';
  };

  return (
    <div className="fixed top-3 inset-x-0 z-30 pointer-events-none select-none px-4 max-w-6xl mx-auto flex flex-col gap-2">
      {/* Upper Row: Level info, Radar, Score */}
      <div className="flex items-start justify-between gap-3">
        {/* Left: Level badge & Food goal */}
        <div className="bg-zinc-900/90 border border-zinc-700/80 rounded-2xl p-3 shadow-lg pointer-events-auto min-w-[220px]">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              {level.title}
            </span>
            {isInsideHouse && (
              <span className="text-[9px] font-black bg-rose-600/90 text-white px-2 py-0.5 rounded-full uppercase tracking-wider animate-bounce">
                ¡En el Interior!
              </span>
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-zinc-200 mb-1.5">
            <span>{isInsideHouse ? 'Objetivo Principal:' : 'Comida Acumulada:'}</span>
            <span className={`font-bold ${isGoalReached ? 'text-emerald-400' : 'text-amber-300'}`}>
              {isInsideHouse ? '🐭 ¡Atrapa al Ratón!' : `🐟 ${foodCount} / ${level.requiredFood}`}
            </span>
          </div>

          {/* Food Progress bar */}
          <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mb-1">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isInsideHouse ? 'bg-rose-500' : isGoalReached ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
              style={{ width: `${isInsideHouse ? 100 : Math.min(100, (foodCount / level.requiredFood) * 100)}%` }}
            />
          </div>

          <div className="text-[10px] text-zinc-400 flex items-center justify-between">
            <span>
              {isInsideHouse
                ? 'Dale con [F] o salta sobre él'
                : isGoalReached
                ? '¡Salta por la claraboya dorada!'
                : `Faltan ${Math.max(0, level.requiredFood - foodCount)} para abrir la casa`}
            </span>
            <span>Total: {totalFood}</span>
          </div>
        </div>

        {/* Center: Compass Radar pointing to nearest food, target house, or mouse */}
        <div className="bg-zinc-900/90 border border-zinc-700/80 rounded-2xl px-4 py-2 shadow-lg flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-full bg-zinc-800 border border-zinc-600 flex items-center justify-center">
            <Navigation
              className={`w-5 h-5 transition-transform duration-75 ${
                isInsideHouse || targetType === 'mouse'
                  ? 'text-rose-400'
                  : isGoalReached
                  ? 'text-amber-400'
                  : 'text-sky-400'
              }`}
              style={{ transform: `rotate(${compassAngle}deg)` }}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-400 uppercase font-semibold">
              {getTargetLabel()}
            </span>
            <span className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
              <span>{compassDistance}m</span>
              <span className={`text-[11px] font-semibold ${getTargetColor()}`}>
                {getTargetIcon()}
              </span>
            </span>
          </div>
        </div>

        {/* Right: Score & Highscore */}
        <div className="bg-zinc-900/90 border border-zinc-700/80 rounded-2xl p-3 shadow-lg pointer-events-auto text-right min-w-[170px]">
          <div className="text-[10px] font-semibold text-zinc-400 uppercase">Puntos Totales</div>
          <div className="text-xl font-black text-amber-400 leading-tight">
            {score.toLocaleString()} <span className="text-xs text-amber-300 font-bold">pts</span>
          </div>
          <div className="text-[10px] text-zinc-400 flex items-center justify-end gap-1 mt-0.5">
            <Trophy className="w-3 h-3 text-amber-500" />
            <span>Récord: {highScore} pts</span>
          </div>
        </div>
      </div>

      {/* Wall Climb Notification */}
      {isNearWall && (
        <div className="self-center bg-emerald-500/90 text-zinc-950 font-black text-xs px-3.5 py-1 rounded-full border border-emerald-300 shadow-xl flex items-center gap-1.5 animate-bounce pointer-events-none">
          <span>🐾</span>
          <span>¡MURO DETECTADO! Pulsa ESPACIO para Escalar</span>
        </div>
      )}

      {/* Lower Row: Stamina & Special Ability indicator */}
      <div className="flex items-center justify-between gap-3 text-xs">
        {/* Stamina bar */}
        <div className="bg-zinc-900/90 border border-zinc-700/80 rounded-xl px-3 py-1.5 shadow flex items-center gap-2 max-w-xs w-full">
          <span className="text-[11px] font-bold text-emerald-400">⚡ Estamina</span>
          <div className="flex-1 bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-100"
              style={{ width: `${staminaPct}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-zinc-400">{staminaPct}%</span>
        </div>

        {/* Ability Status */}
        <div className="bg-zinc-900/90 border border-zinc-700/80 rounded-xl px-3 py-1.5 shadow flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-[11px] font-semibold text-zinc-300">
            {currentBreed.specialAbility.name}:
          </span>
          {abilityCooldown > 0 ? (
            <span className="text-[11px] font-mono font-bold text-rose-400">
              {abilityCooldown.toFixed(1)}s
            </span>
          ) : isCharging ? (
            <span className="text-[11px] font-bold text-amber-300">
              Cargando: {Math.round(chargePct * 100)}%
            </span>
          ) : (
            <span className="text-[11px] font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800/80">
              {currentBreed.specialAbility.keyHint}
            </span>
          )}
        </div>
      </div>

      {/* Floating Pickup Notification Banner */}
      {pickupNotification && (
        <div className="self-center mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-zinc-900/95 border-2 border-amber-400 text-amber-300 font-bold text-sm px-4 py-1.5 rounded-full shadow-2xl flex items-center gap-2">
            <span>🐟</span>
            <span>+{pickupNotification.points} pts: {pickupNotification.name}</span>
          </div>
        </div>
      )}
    </div>
  );
};
