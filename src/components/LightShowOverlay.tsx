import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Sparkles, Volume2, X } from 'lucide-react';
import { sounds } from '../utils/audioEffects';

interface LightShowOverlayProps {
  mode?: 'none' | 'confetti' | 'rainbow' | 'flash_sale' | 'neon_disco' | null;
  activeMode?: 'none' | 'confetti' | 'rainbow' | 'flash_sale' | 'neon_disco' | null;
  onClose?: () => void;
}

export const LightShowOverlay: React.FC<LightShowOverlayProps> = ({ mode, activeMode, onClose }) => {
  const currentMode = mode || activeMode || 'none';
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string; size: number }[]>([]);

  useEffect(() => {
    if (!currentMode || currentMode === 'none') {
      setParticles([]);
      return;
    }

    // Play sound effect only when explicitly triggered
    try {
      if (currentMode === 'flash_sale') {
        sounds.playSiren();
      } else if (currentMode === 'confetti' || currentMode === 'rainbow') {
        sounds.playFanfare();
      } else if (currentMode === 'neon_disco') {
        sounds.playSparkle();
      }
    } catch {}

    // Generate brief celebration particles
    const colors = ['#ec4899', '#8b5cf6', '#3b82f6', '#eab308', '#10b981', '#f43f5e'];
    const newParticles = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 12 + 6,
    }));
    setParticles(newParticles);

    // Auto-dismiss in 4 seconds
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [currentMode, onClose]);

  if (!currentMode || currentMode === 'none') {
    return null;
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {/* Close button always accessible */}
        <div className="absolute top-4 right-4 z-50 pointer-events-auto">
          <button
            onClick={() => onClose && onClose()}
            className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-xs text-xs font-bold flex items-center gap-1 shadow-lg transition-all"
            title="Fechar efeito da tela"
          >
            <X className="w-4 h-4" />
            <span>Fechar Efeito</span>
          </button>
        </div>

        {currentMode === 'flash_sale' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ repeat: 3, duration: 0.8 }}
            className="absolute inset-0 bg-red-600/15 border-6 border-red-500"
          >
            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-red-600 text-white font-display px-5 py-2 rounded-full shadow-2xl flex items-center gap-2 text-sm sm:text-base font-bold animate-bounce pointer-events-auto">
              <Zap className="w-5 h-5 animate-pulse text-yellow-300" />
              <span>🚨 Oferta Relâmpago Ativada no Gilvan Sampaio!</span>
            </div>
          </motion.div>
        )}

        {currentMode === 'rainbow' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            className="absolute inset-0 bg-gradient-to-r from-pink-500/15 via-purple-500/15 to-yellow-500/15"
          >
            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-display px-5 py-2 rounded-full shadow-2xl flex items-center gap-2 text-sm sm:text-base font-bold pointer-events-auto">
              <Sparkles className="w-5 h-5 text-yellow-300 animate-spin" />
              <span>🌈 Brilhos Mágicos HL Vendas! ✨</span>
            </div>
          </motion.div>
        )}

        {currentMode === 'neon_disco' && (
          <motion.div
            animate={{
              backgroundColor: ['rgba(236,72,153,0.1)', 'rgba(59,130,246,0.1)', 'rgba(234,179,8,0.1)'],
            }}
            transition={{ repeat: 3, duration: 1 }}
            className="absolute inset-0"
          >
            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-purple-900 text-pink-300 border border-pink-400 font-display px-5 py-2 rounded-full shadow-2xl flex items-center gap-2 text-sm sm:text-base font-bold pointer-events-auto">
              <span>🪩 Modo Festivo da Equipe! 💃</span>
            </div>
          </motion.div>
        )}

        {/* Particles */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ y: -20, x: `${p.x}vw`, rotate: 0, opacity: 1 }}
            animate={{
              y: '105vh',
              x: `${p.x + (Math.random() * 8 - 4)}vw`,
              rotate: 360 * 2,
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 3.5, ease: 'linear' }}
            style={{
              position: 'absolute',
              backgroundColor: p.color,
              width: p.size,
              height: p.size,
              borderRadius: p.id % 2 === 0 ? '50%' : '3px',
            }}
          />
        ))}
      </div>
    </AnimatePresence>
  );
};
