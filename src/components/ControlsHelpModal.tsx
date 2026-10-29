import React from 'react';
import { X, Mouse, Smartphone, Keyboard, Eye, Sparkles } from 'lucide-react';

interface ControlsHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ControlsHelpModal: React.FC<ControlsHelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl flex flex-col text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/70">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎮</span>
            <div>
              <h2 className="text-xl font-bold text-amber-400">Guía de Controles Felinos en 1ª Persona</h2>
              <p className="text-xs text-zinc-400">
                Domina los tejados con el teclado, ratón o controles táctiles en pantalla.
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm">
          {/* Mouse & Keyboard */}
          <div>
            <div className="flex items-center gap-2 text-amber-300 font-bold mb-3">
              <Keyboard className="w-4 h-4" />
              <span>Teclado y Ratón (PC / Laptop)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="flex items-center justify-between bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800">
                <span className="text-zinc-300">Caminar (Avanzar / Retroceder)</span>
                <kbd className="px-2 py-1 bg-zinc-800 rounded text-amber-300 font-mono text-xs border border-zinc-700">
                  Flechas ↑ / ↓  o  W / S
                </kbd>
              </div>
              <div className="flex items-center justify-between bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800">
                <span className="text-zinc-300">Girar y Mirar a los Lados</span>
                <kbd className="px-2 py-1 bg-zinc-800 rounded text-amber-300 font-mono text-xs border border-zinc-700">
                  Flechas ← / →  o  A / D
                </kbd>
              </div>
              <div className="flex items-center justify-between bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800">
                <span className="text-zinc-300">Mirar Arriba / Abajo (Mac / PC)</span>
                <kbd className="px-2 py-1 bg-zinc-800 rounded text-amber-300 font-mono text-xs border border-zinc-700">
                  ⌘ Command + ↑ / ↓  o  R / C
                </kbd>
              </div>
              <div className="flex items-center justify-between bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800">
                <span className="text-zinc-300">Saltar / Doble Salto / Planeo</span>
                <kbd className="px-2 py-1 bg-zinc-800 rounded text-amber-300 font-mono text-xs border border-zinc-700">
                  ESPACIO
                </kbd>
              </div>
              <div className="flex items-center justify-between bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-800/60 col-span-1 sm:col-span-2">
                <span className="text-emerald-200 font-medium">🧗 Escalada Felina (Subir muros saltando)</span>
                <kbd className="px-2 py-1 bg-emerald-900/80 rounded text-emerald-300 font-mono text-xs border border-emerald-700">
                  ESPACIO contra la pared de un edificio
                </kbd>
              </div>
              <div className="flex items-center justify-between bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800">
                <span className="text-zinc-300">Correr / Sprint Felino</span>
                <kbd className="px-2 py-1 bg-zinc-800 rounded text-amber-300 font-mono text-xs border border-zinc-700">
                  SHIFT (Mayús)
                </kbd>
              </div>
              <div className="flex items-center justify-between bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800">
                <span className="text-zinc-300">Habilidad Especial de Raza</span>
                <kbd className="px-2 py-1 bg-zinc-800 rounded text-amber-300 font-mono text-xs border border-zinc-700">
                  E, Q o Click Derecho
                </kbd>
              </div>
              <div className="flex items-center justify-between bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800">
                <span className="text-zinc-300">Zarpazo con Patas Felinas</span>
                <kbd className="px-2 py-1 bg-zinc-800 rounded text-amber-300 font-mono text-xs border border-zinc-700">
                  F o Click Izquierdo
                </kbd>
              </div>
              <div className="flex items-center justify-between bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800">
                <span className="text-zinc-300">¡Maullar! (Miau acústico)</span>
                <kbd className="px-2 py-1 bg-zinc-800 rounded text-amber-300 font-mono text-xs border border-zinc-700">
                  Tecla M
                </kbd>
              </div>
            </div>
          </div>

          {/* New Hazards & Obstacles info */}
          <div>
            <div className="flex items-center gap-2 text-rose-400 font-bold mb-3">
              <span>⚠️</span>
              <span>Obstáculos y Problemas en los Techos</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300">
              <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800">
                <strong className="text-amber-400">🐕 Perros Guardianes:</strong> Ladran ferozmente si te acercas demasiado y te empujan.
              </div>
              <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800">
                <strong className="text-emerald-400">🐭 Ratón Travieso:</strong> ¡Persíguelo y atrápalo para ganar +120 pts y un turbo de velocidad!
              </div>
              <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800">
                <strong className="text-rose-400">😾 Gato Rival:</strong> Cuida su territorio, si te acercas te bufa y lanza un zarpazo.
              </div>
              <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800">
                <strong className="text-sky-400">💧 Charcos de Agua:</strong> ¡El agua moja tus patas, reduce tu velocidad y sacude las patas!
              </div>
              <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800">
                <strong className="text-indigo-400">🐦 Palomas:</strong> Aletean en bandada al pasar corriendo.
              </div>
              <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800">
                <strong className="text-zinc-200">🧺 Ropa Tendida:</strong> Sábanas que pueden enredarte si vas a toda velocidad.
              </div>
              <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800">
                <strong className="text-cyan-400">💨 Turbinas de Viento:</strong> Ráfagas de aire que te desvían en el aire.
              </div>
              <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800">
                <strong className="text-yellow-400">🚧 Barandas de Techos:</strong> Los bordes tienen barandas para evitar caídas; busca las aberturas con franjas amarillas para saltar entre edificios.
              </div>
            </div>
          </div>

          {/* Touch / Mobile */}
          <div>
            <div className="flex items-center gap-2 text-sky-300 font-bold mb-3">
              <Smartphone className="w-4 h-4" />
              <span>Controles Táctiles (Móvil y Tablet)</span>
            </div>
            <div className="bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800 space-y-2 text-xs text-zinc-300">
              <p>• <strong>Joystick Virtual Izquierdo:</strong> Desliza tu dedo en la esquina inferior izquierda para moverte y acelerar.</p>
              <p>• <strong>Giro de Vista:</strong> Desliza tu dedo en la mitad derecha de la pantalla para rotar la mirada del gato en 360°.</p>
              <p>• <strong>Botones en Pantalla:</strong> Botones dedicados para SALTO, HABILIDAD ESPECIAL, ZARPAZO y MIAU.</p>
            </div>
          </div>

          {/* Gameplay Tips */}
          <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl text-xs text-amber-200">
            <span className="font-bold flex items-center gap-1 mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Consejos de Parkour Gatuno:
            </span>
            <ul className="list-disc list-inside space-y-1 text-zinc-300">
              <li>Toma carrerilla con <strong>SHIFT</strong> antes de brincar brechas grandes entre casas.</li>
              <li>Sigue la <strong>Brújula Radar</strong> superior para no perderte ningún pescado o lata de atún.</li>
              <li>Si caes de un tejado, no te preocupes: el gato tiene 7 vidas y reaparecerá con seguridad en el último tejado.</li>
              <li>Al recolectar la comida requerida, corre a la <strong>Cesta Cómoda de Descanso</strong> iluminada por el haz de luz vertical para completar el nivel.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-950/70 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs"
          >
            ¡Entendido, a Saltar!
          </button>
        </div>
      </div>
    </div>
  );
};
