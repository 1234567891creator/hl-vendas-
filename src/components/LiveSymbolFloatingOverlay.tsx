import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CustomSymbol, SiteSymbolAnimationConfig, SymbolLaunchEvent } from '../types';
import { AnimatedPixelSprite } from './AnimatedPixelSprite';
import { sounds } from '../utils/audioEffects';

interface LiveSymbolFloatingOverlayProps {
  config: SiteSymbolAnimationConfig;
  symbols: CustomSymbol[];
  activeLaunch?: SymbolLaunchEvent | null;
  onClearLaunch?: () => void;
}

interface LaunchParticle {
  id: string;
  startX: number; // in vw (e.g. 10 to 90)
  startY: number; // in vh
  targetX: number;
  targetY: number;
  rotation: number;
  scale: number;
  delay: number;
}

export const LiveSymbolFloatingOverlay: React.FC<LiveSymbolFloatingOverlayProps> = ({
  config,
  symbols,
  activeLaunch: externalLaunch,
  onClearLaunch,
}) => {
  const [internalLaunch, setInternalLaunch] = useState<SymbolLaunchEvent | null>(null);

  // Sync external launch or internal event
  const currentLaunch = externalLaunch || internalLaunch;

  // Listen to global window event 'hl_launch_symbol' so any button can launch a 2-second reaction
  useEffect(() => {
    const handleGlobalLaunch = (e: Event) => {
      const customEvt = e as CustomEvent<SymbolLaunchEvent>;
      if (customEvt.detail) {
        setInternalLaunch(customEvt.detail);
      }
    };

    window.addEventListener('hl_launch_symbol', handleGlobalLaunch);
    return () => {
      window.removeEventListener('hl_launch_symbol', handleGlobalLaunch);
    };
  }, []);

  // Ensure launch lasts EXACTLY 2 seconds as requested: "dure apenas 2 segundos quando lançar"
  useEffect(() => {
    if (!currentLaunch) return;

    try {
      sounds.playSparkle();
    } catch {}

    const timer = setTimeout(() => {
      setInternalLaunch(null);
      if (onClearLaunch) {
        onClearLaunch();
      }
    }, 2000); // 2 segundos exatos!

    return () => clearTimeout(timer);
  }, [currentLaunch?.id, onClearLaunch]);

  // Generate 12 lively particles for the 2-second burst
  const burstParticles = useMemo(() => {
    if (!currentLaunch) return [];

    const list: LaunchParticle[] = [];
    const count = 12;

    for (let i = 0; i < count; i++) {
      // Spread across the screen originating from bottom or center
      const startX = 20 + Math.random() * 60; // 20vw to 80vw
      const startY = 70 + Math.random() * 25; // 70vh to 95vh
      const targetX = startX + (Math.random() * 40 - 20); // drift sideways
      const targetY = startY - (40 + Math.random() * 50); // float up 40-90vh
      const rotation = Math.random() * 360 - 180;
      const scale = 0.9 + Math.random() * 0.6;
      const delay = Math.random() * 0.25;

      list.push({
        id: `burst-${currentLaunch.id}-${i}`,
        startX,
        startY,
        targetX,
        targetY,
        rotation,
        scale,
        delay,
      });
    }

    return list;
  }, [currentLaunch?.id]);

  // If no launch is active, do NOT roll symbols passively on screen (resolves: "os simbulos estão rolando mesmo sem ninguem ativar")
  if (!currentLaunch) {
    return null;
  }

  const symbol = currentLaunch.symbol;

  const renderSymbolGraphic = (sizeScale: number = 1) => {
    if (symbol.category === 'pixel') {
      return (
        <AnimatedPixelSprite
          frames={symbol.pixelFrames}
          matrix={symbol.pixelMatrix}
          fps={symbol.pixelFps || 4}
          size="md"
          className="border border-white/70 shadow-sm rounded-lg"
        />
      );
    }

    return (
      <span
        style={{
          color: symbol.color,
          textShadow: symbol.glowColor ? `0 0 16px ${symbol.glowColor}` : '0 2px 8px rgba(0,0,0,0.2)',
          fontSize: `${Math.round(36 * sizeScale)}px`,
        }}
        className="inline-block filter drop-shadow-md select-none"
      >
        {symbol.charOrIcon}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden select-none">
      <AnimatePresence>
        {currentLaunch && (
          <>
            {/* Top Banner with Sender Profile Picture: lasts exactly 2 seconds */}
            <motion.div
              key={`banner-${currentLaunch.id}`}
              initial={{ opacity: 0, y: -40, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 pointer-events-auto"
            >
              <div className="bg-white/95 backdrop-blur-md border-2 border-pink-400/80 rounded-full px-4 sm:px-5 py-2 sm:py-2.5 shadow-2xl flex items-center gap-3">
                {/* Profile Picture of who sent it - Foto de perfil com borda e destaque */}
                <div className="relative flex-shrink-0">
                  <img
                    src={currentLaunch.senderAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                    alt={currentLaunch.senderName}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-pink-500 shadow-md ring-2 ring-yellow-300"
                    onError={(e) => {
                      // Fallback avatar if URL fails
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <span className="absolute -bottom-1 -right-1 text-sm sm:text-base">
                    {symbol.charOrIcon}
                  </span>
                </div>

                {/* Sender Info & Launch Title */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] sm:text-xs font-black uppercase text-pink-600 tracking-wider">
                      ✨ Símbolo Lançado!
                    </span>
                    <span className="text-[9px] font-bold bg-pink-100 text-pink-800 px-1.5 py-0.2 rounded-full">
                      2 seg
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm font-black text-gray-900 leading-tight">
                    {currentLaunch.senderName}
                  </span>
                  <span className="text-[10px] text-purple-700 font-semibold truncate max-w-[200px] sm:max-w-[280px]">
                    Lançou "{symbol.name}"
                  </span>
                </div>

                {/* Symbol Highlight Box */}
                <div className="pl-1 sm:pl-2 flex items-center justify-center">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-xl text-white shadow-sm animate-bounce">
                    {symbol.charOrIcon}
                  </div>
                </div>
              </div>

              {/* 2-Second Shrinking Progress Bar */}
              <div className="w-full max-w-[240px] mx-auto mt-1 h-1 bg-pink-200/60 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 2.0, ease: 'linear' }}
                  className="h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full"
                />
              </div>
            </motion.div>

            {/* 12 Flying Burst Particles with Symbol and Mini Sender Profile Picture - Lasts 2 Seconds */}
            {burstParticles.map((p) => (
              <motion.div
                key={p.id}
                initial={{
                  x: `${p.startX}vw`,
                  y: `${p.startY}vh`,
                  opacity: 0,
                  scale: 0.2,
                  rotate: 0,
                }}
                animate={{
                  x: `${p.targetX}vw`,
                  y: `${p.targetY}vh`,
                  opacity: [0, 1, 1, 0],
                  scale: [0.2, p.scale, p.scale * 1.1, 0.4],
                  rotate: [0, p.rotation],
                }}
                transition={{
                  duration: 2.0, // Exatamente 2 segundos
                  delay: p.delay,
                  ease: 'easeOut',
                }}
                className="absolute flex items-center gap-1.5 pointer-events-none drop-shadow-lg"
              >
                {/* The Launched Symbol */}
                <div>{renderSymbolGraphic(p.scale)}</div>

                {/* Mini Profile Photo of Who Sent It */}
                <div className="flex-shrink-0 relative">
                  <img
                    src={currentLaunch.senderAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                    alt={currentLaunch.senderName}
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border-2 border-white shadow-md ring-1 ring-purple-400 bg-white"
                  />
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-yellow-400 border border-white" />
                </div>
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
