import React, { useEffect, useState } from 'react';
import { sound } from '../services/sound';

export interface MemeData {
  isOpen: boolean;
  title: string;
  subtitle: string;
  reason: 'fall' | 'dog' | 'rival_cat' | 'puddle' | 'clothesline' | 'wind' | 'collision';
}

interface MemeCatOverlayProps {
  meme: MemeData;
  onDismiss: () => void;
}

export const MemeCatOverlay: React.FC<MemeCatOverlayProps> = ({ meme, onDismiss }) => {
  const [mouthOpen, setMouthOpen] = useState(false);

  useEffect(() => {
    if (!meme.isOpen) return;

    // Trigger the viral "miau miau miau miau" procedural audio!
    sound.memeMiauMiau();

    // Rhythmic mouth animation mimicking the meme meowing syllables
    const interval = setInterval(() => {
      setMouthOpen((prev) => !prev);
    }, 160);

    const timer = setTimeout(() => {
      onDismiss();
    }, 4200);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [meme.isOpen, onDismiss]);

  if (!meme.isOpen) return null;

  return (
    <div
      onClick={onDismiss}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-in fade-in zoom-in-90 duration-200 cursor-pointer select-none"
    >
      <div className="relative max-w-sm w-full bg-zinc-950 border-4 border-amber-400 rounded-3xl p-6 text-center text-white shadow-2xl overflow-hidden">
        {/* Glow halo */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/30 rounded-full blur-2xl pointer-events-none" />

        {/* Viral Meme Title */}
        <div className="text-2xl font-black text-amber-400 uppercase tracking-widest drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
          ¡MIAU MIAU MIAU MIAU!
        </div>
        <div className="text-[11px] font-semibold text-amber-300/80 mb-2">
          🎶 Ay, Mi Gatito Miau Miau 🐾
        </div>

        {/* The Animated Viral Meme Cat Face */}
        <div className="relative mx-auto w-44 h-44 my-3 flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl">
            {/* Cat Ears */}
            <polygon points="35,70 15,10 75,45" fill="#f59e0b" stroke="#78350f" strokeWidth="4" />
            <polygon points="40,65 25,25 70,48" fill="#fca5a5" />

            <polygon points="165,70 185,10 125,45" fill="#f59e0b" stroke="#78350f" strokeWidth="4" />
            <polygon points="160,65 175,25 130,48" fill="#fca5a5" />

            {/* Cat Head / Face */}
            <circle cx="100" cy="115" r="75" fill="#fbbf24" stroke="#78350f" strokeWidth="5" />

            {/* Cat Cheeks / Fur tufts */}
            <ellipse cx="65" cy="130" rx="20" ry="15" fill="#fef08a" opacity="0.6" />
            <ellipse cx="135" cy="130" rx="20" ry="15" fill="#fef08a" opacity="0.6" />

            {/* Whiskers */}
            <line x1="20" y1="120" x2="60" y2="125" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
            <line x1="15" y1="135" x2="60" y2="135" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
            <line x1="20" y1="150" x2="60" y2="145" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />

            <line x1="180" y1="120" x2="140" y2="125" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
            <line x1="185" y1="135" x2="140" y2="135" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
            <line x1="180" y1="150" x2="140" y2="145" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />

            {/* Big Shocked / Meme Eyes */}
            <ellipse cx="65" cy="95" rx="18" ry="22" fill="#ffffff" stroke="#78350f" strokeWidth="3" />
            <ellipse cx="135" cy="95" rx="18" ry="22" fill="#ffffff" stroke="#78350f" strokeWidth="3" />

            {/* Dilated pupils */}
            <circle cx="65" cy="95" r="12" fill="#18181b" />
            <circle cx="135" cy="95" r="12" fill="#18181b" />
            {/* Eye light gleam */}
            <circle cx="60" cy="90" r="4" fill="#ffffff" />
            <circle cx="130" cy="90" r="4" fill="#ffffff" />

            {/* Tiny cute nose */}
            <polygon points="95,120 105,120 100,126" fill="#f43f5e" />

            {/* Animated Meme Talking Mouth (Opens and Closes: "Miau!") */}
            {mouthOpen ? (
              <g>
                <ellipse cx="100" cy="145" rx="22" ry="18" fill="#881337" stroke="#78350f" strokeWidth="3" />
                {/* Cute pink tongue */}
                <ellipse cx="100" cy="154" rx="14" ry="8" fill="#fb7185" />
              </g>
            ) : (
              <path
                d="M 85 132 Q 92 142 100 132 Q 108 142 115 132"
                fill="none"
                stroke="#78350f"
                strokeWidth="4"
                strokeLinecap="round"
              />
            )}

            {/* Comedy Sweat drops / tear */}
            <circle cx="170" cy="95" r="6" fill="#38bdf8" />
            <path d="M 170 85 Q 175 92 170 95 Q 165 92 170 85 Z" fill="#38bdf8" />
          </svg>
        </div>

        {/* Reason caption */}
        <div className="bg-amber-500/20 border border-amber-500/40 rounded-xl p-3 my-2">
          <div className="text-base font-bold text-amber-300">
            {meme.title}
          </div>
          <p className="text-xs text-zinc-300 mt-1">
            {meme.subtitle}
          </p>
        </div>

        <div className="text-[11px] text-zinc-400 mt-3">
          (Toca o haz click para continuar saltando)
        </div>
      </div>
    </div>
  );
};
