import React, { useRef, useState, useEffect } from 'react';
import { ArrowUp, Zap, Sparkles } from 'lucide-react';
import { PlayerController } from '../game/PlayerController';

interface TouchControlsProps {
  player: PlayerController | null;
  onMeow: () => void;
  onSwipe: () => void;
  abilityName: string;
  abilityCooldown: number;
  isCharging: boolean;
  chargePct: number;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  player,
  onMeow,
  onSwipe,
  abilityName,
  abilityCooldown,
  isCharging,
  chargePct,
}) => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 });
  const [isDraggingStick, setIsDraggingStick] = useState(false);
  const stickTouchIdRef = useRef<number | null>(null);

  // Look touch tracking
  const lookTouchIdRef = useRef<number | null>(null);
  const lastLookPosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    // Detect touch capability
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(hasTouch);
  }, []);

  // Joystick touch handlers
  const handleJoystickTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (stickTouchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    stickTouchIdRef.current = touch.identifier;
    setIsDraggingStick(true);
    updateJoystickPos(touch.clientX, touch.clientY);
  };

  const handleJoystickTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === stickTouchIdRef.current) {
        updateJoystickPos(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleJoystickTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === stickTouchIdRef.current) {
        stickTouchIdRef.current = null;
        setIsDraggingStick(false);
        setStickPos({ x: 0, y: 0 });
        if (player) {
          player.joystickVector = { x: 0, y: 0 };
        }
        break;
      }
    }
  };

  const updateJoystickPos = (clientX: number, clientY: number) => {
    if (!joystickBaseRef.current || !player) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const maxRadius = rect.width / 2 - 15;

    let deltaX = clientX - centerX;
    let deltaY = clientY - centerY;
    const dist = Math.hypot(deltaX, deltaY);

    if (dist > maxRadius) {
      deltaX = (deltaX / dist) * maxRadius;
      deltaY = (deltaY / dist) * maxRadius;
    }

    setStickPos({ x: deltaX, y: deltaY });

    // Normalize -1 to 1 for player controller
    player.joystickVector = {
      x: deltaX / maxRadius,
      y: deltaY / maxRadius,
    };
  };

  // Right-side screen swipe for camera look
  const handleLookTouchStart = (e: React.TouchEvent) => {
    if (lookTouchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    // Only accept touches on the right half of the screen
    if (touch.clientX > window.innerWidth * 0.4) {
      lookTouchIdRef.current = touch.identifier;
      lastLookPosRef.current = { x: touch.clientX, y: touch.clientY };
    }
  };

  const handleLookTouchMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === lookTouchIdRef.current && lastLookPosRef.current && player) {
        const deltaX = touch.clientX - lastLookPosRef.current.x;
        const deltaY = touch.clientY - lastLookPosRef.current.y;
        player.addLookDelta(deltaX * 1.5, deltaY * 1.5);
        lastLookPosRef.current = { x: touch.clientX, y: touch.clientY };
        break;
      }
    }
  };

  const handleLookTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === lookTouchIdRef.current) {
        lookTouchIdRef.current = null;
        lastLookPosRef.current = null;
        break;
      }
    }
  };

  if (!isTouchDevice) return null;

  return (
    <>
      {/* Right screen touch look surface */}
      <div
        className="fixed inset-y-0 right-0 w-3/5 z-20 touch-none pointer-events-auto"
        onTouchStart={handleLookTouchStart}
        onTouchMove={handleLookTouchMove}
        onTouchEnd={handleLookTouchEnd}
        onTouchCancel={handleLookTouchEnd}
      />

      {/* Floating Joystick Base (Bottom Left) */}
      <div className="fixed bottom-24 left-6 z-30 select-none touch-none">
        <div
          ref={joystickBaseRef}
          onTouchStart={handleJoystickTouchStart}
          onTouchMove={handleJoystickTouchMove}
          onTouchEnd={handleJoystickTouchEnd}
          onTouchCancel={handleJoystickTouchEnd}
          className="relative w-28 h-28 rounded-full bg-zinc-900/60 border-2 border-zinc-700/80 shadow-lg flex items-center justify-center backdrop-blur-none"
        >
          {/* Inner stick nub */}
          <div
            className="w-12 h-12 rounded-full bg-amber-500/80 border border-amber-300 shadow-md flex items-center justify-center text-xs text-zinc-950 font-bold"
            style={{
              transform: `translate(${stickPos.x}px, ${stickPos.y}px)`,
              transition: isDraggingStick ? 'none' : 'transform 0.15s ease-out',
            }}
          >
            🐾
          </div>
        </div>
      </div>

      {/* Action Buttons (Bottom Right) */}
      <div className="fixed bottom-24 right-6 z-30 select-none flex flex-col items-end gap-3 pointer-events-auto">
        {/* Row with Meow & Swipe */}
        <div className="flex items-center gap-2">
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              onMeow();
            }}
            className="w-12 h-12 rounded-full bg-amber-500/80 border border-amber-300 text-zinc-950 font-bold flex items-center justify-center text-base shadow-lg active:scale-95 transition"
            aria-label="Maullar"
          >
            🐱
          </button>

          <button
            onTouchStart={(e) => {
              e.preventDefault();
              onSwipe();
            }}
            className="w-12 h-12 rounded-full bg-rose-600/80 border border-rose-400 text-white font-bold flex items-center justify-center text-base shadow-lg active:scale-95 transition"
            aria-label="Zarpazo"
          >
            🐾
          </button>
        </div>

        {/* Special Ability Button */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            if (player) {
              player.input.special = true;
            }
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            if (player) {
              player.input.special = false;
            }
          }}
          disabled={abilityCooldown > 0}
          className={`relative px-4 py-2.5 rounded-2xl border text-xs font-bold shadow-lg flex items-center gap-2 active:scale-95 transition ${
            abilityCooldown > 0
              ? 'bg-zinc-800/80 border-zinc-700 text-zinc-500'
              : 'bg-gradient-to-r from-sky-600 to-indigo-600 border-sky-400 text-white'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>{abilityName}</span>
          {abilityCooldown > 0 && <span className="text-[10px]">({abilityCooldown.toFixed(1)}s)</span>}
          {isCharging && (
            <div
              className="absolute inset-0 bg-amber-400/30 rounded-2xl transition-all"
              style={{ width: `${chargePct * 100}%` }}
            />
          )}
        </button>

        {/* Big Jump / Wall Climb Button */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            if (player) {
              player.input.jump = true;
            }
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            if (player) {
              player.input.jump = false;
            }
          }}
          className={`w-20 h-20 rounded-full border-4 shadow-2xl flex flex-col items-center justify-center active:scale-90 transition font-black text-xs ${
            player?.isNearWallFacade
              ? 'bg-emerald-400 border-emerald-200 text-zinc-950 ring-4 ring-emerald-500/40 animate-pulse'
              : 'bg-amber-500 border-amber-300 text-zinc-950'
          }`}
        >
          <ArrowUp className="w-7 h-7 stroke-[3]" />
          <span>{player?.isNearWallFacade ? 'ESCALAR' : 'SALTAR'}</span>
        </button>
      </div>
    </>
  );
};
