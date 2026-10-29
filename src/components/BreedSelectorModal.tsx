import React from 'react';
import { CatBreed } from '../types/game';
import { CAT_BREEDS } from '../data/breeds';
import { X, Check, Lock, Zap, Shield, Sparkles } from 'lucide-react';

interface BreedSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBreedId: string;
  unlockedBreeds: string[];
  totalScore: number;
  onSelectBreed: (breedId: string) => void;
  onUnlockBreed: (breedId: string) => void;
}

export const BreedSelectorModal: React.FC<BreedSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedBreedId,
  unlockedBreeds,
  totalScore,
  onSelectBreed,
  onUnlockBreed,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl flex flex-col text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/70">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🐾</span>
            <div>
              <h2 className="text-xl font-bold text-amber-400">Razas de Gatos y Habilidades de Salto</h2>
              <p className="text-xs text-zinc-400">
                Selecciona tu felino. Cada raza cuenta con físicas y saltos únicos para dominar los tejados.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-semibold text-amber-300">
              Puntos Disponibles: {totalScore} pts
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Breeds Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CAT_BREEDS.map((breed) => {
            const isUnlocked = unlockedBreeds.includes(breed.id) || breed.unlockScore === 0;
            const isSelected = selectedBreedId === breed.id;
            const canAfford = totalScore >= breed.unlockScore;

            return (
              <div
                key={breed.id}
                className={`flex flex-col justify-between rounded-xl p-4 border transition-all ${
                  isSelected
                    ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/30'
                    : isUnlocked
                    ? 'bg-zinc-800/60 border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800'
                    : 'bg-zinc-900/60 border-zinc-800 opacity-80'
                }`}
              >
                <div>
                  {/* Top Bar of card */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner border"
                        style={{
                          backgroundColor: breed.pawStyle.furColor,
                          borderColor: breed.pawStyle.accentColor,
                        }}
                      >
                        {breed.avatarIcon}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-zinc-100 flex items-center gap-1.5">
                          {breed.name}
                        </h3>
                        <span className="text-xs font-medium text-amber-400/90">{breed.nickname}</span>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="bg-amber-500 text-zinc-950 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> ACTIVO
                      </span>
                    )}
                  </div>

                  {/* Special Ability Pill */}
                  <div className="bg-zinc-950/70 border border-zinc-800 rounded-lg p-2.5 mb-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400 mb-1">
                      <Zap className="w-3.5 h-3.5" />
                      {breed.specialAbility.name}
                    </div>
                    <p className="text-[11px] text-zinc-300 leading-relaxed">
                      {breed.specialAbility.description}
                    </p>
                  </div>

                  {/* Attribute Bars */}
                  <div className="space-y-1.5 text-xs text-zinc-300 mb-4">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-zinc-400">Potencia de Salto</span>
                      <span className="font-medium text-amber-300">{Math.round((breed.jumpForce / 15) * 100)}%</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-400 h-full rounded-full"
                        style={{ width: `${(breed.jumpForce / 15) * 100}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[11px] pt-1">
                      <span className="text-zinc-400">Velocidad y Agilidad</span>
                      <span className="font-medium text-sky-300">{Math.round((breed.speed / 12) * 100)}%</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-sky-400 h-full rounded-full"
                        style={{ width: `${(breed.speed / 12) * 100}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[11px] pt-1">
                      <span className="text-zinc-400">Estamina Máxima</span>
                      <span className="font-medium text-emerald-300">{breed.staminaMax} pts</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-400 h-full rounded-full"
                        style={{ width: `${(breed.staminaMax / 140) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div>
                  {isUnlocked ? (
                    <button
                      onClick={() => onSelectBreed(breed.id)}
                      disabled={isSelected}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-default'
                          : 'bg-zinc-700 hover:bg-amber-500 hover:text-zinc-950 text-white'
                      }`}
                    >
                      {isSelected ? 'Gato en Uso' : 'Seleccionar este Gato'}
                    </button>
                  ) : (
                    <button
                      onClick={() => onUnlockBreed(breed.id)}
                      disabled={!canAfford}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-md'
                          : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                      }`}
                    >
                      {canAfford ? (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          Desbloquear por {breed.unlockScore} pts
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          Bloqueado ({breed.unlockScore} pts)
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-950/70 text-xs text-zinc-400 flex items-center justify-between">
          <span>💡 Tip: Cambia de raza según el nivel para aprovechar sus saltos especializados.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium"
          >
            Volver al Juego
          </button>
        </div>
      </div>
    </div>
  );
};
