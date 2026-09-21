import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Send } from 'lucide-react';
import { CustomSymbol, UserProfile } from '../types';
import { launchSymbolReaction } from '../utils/symbolLauncher';

interface SymbolReactionLaunchBarProps {
  symbols: CustomSymbol[];
  currentUser: UserProfile | null;
}

export const SymbolReactionLaunchBar: React.FC<SymbolReactionLaunchBarProps> = ({
  symbols,
  currentUser,
}) => {
  // Use all available symbols (fallback to standard ones if empty)
  const displaySymbols = symbols.length > 0 ? symbols : [
    {
      id: 'sym-raio',
      name: 'Raio ⚡',
      charOrIcon: '⚡',
      category: 'emoji' as const,
      color: '#EAB308',
      animationEffect: 'pulse' as const,
      speed: 'fast' as const,
      scale: 1.3,
      countOnScreen: 8,
      isActiveOnSite: false,
      createdAt: 'Hoje',
    },
    {
      id: 'sym-coroa',
      name: 'Coroa 👑',
      charOrIcon: '👑',
      category: 'emoji' as const,
      color: '#F59E0B',
      animationEffect: 'float' as const,
      speed: 'normal' as const,
      scale: 1.2,
      countOnScreen: 6,
      isActiveOnSite: false,
      createdAt: 'Hoje',
    },
    {
      id: 'sym-flor',
      name: 'Flor 🌸',
      charOrIcon: '🌸',
      category: 'emoji' as const,
      color: '#EC4899',
      animationEffect: 'spin' as const,
      speed: 'slow' as const,
      scale: 1.2,
      countOnScreen: 8,
      isActiveOnSite: false,
      createdAt: 'Hoje',
    },
    {
      id: 'sym-pata',
      name: 'Pata 🐾',
      charOrIcon: '🐾',
      category: 'emoji' as const,
      color: '#8B5CF6',
      animationEffect: 'bounce' as const,
      speed: 'normal' as const,
      scale: 1.1,
      countOnScreen: 6,
      isActiveOnSite: false,
      createdAt: 'Hoje',
    }
  ];

  const handleLaunch = (symbol: CustomSymbol) => {
    launchSymbolReaction(symbol, currentUser);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-4 px-2 select-none">
      <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 border-2 border-pink-200/80 rounded-2xl p-3 sm:p-3.5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          {/* Header Info */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-xs shadow-xs">
              <Sparkles className="w-4 h-4 text-yellow-200 animate-spin" />
            </div>
            <div>
              <h4 className="font-display font-black text-xs sm:text-sm text-gray-900 leading-tight flex items-center gap-1.5">
                <span>Lançar Símbolo na Tela</span>
                <span className="text-[10px] font-bold bg-pink-200 text-pink-900 px-2 py-0.2 rounded-full">
                  ⏱️ 2 segundos
                </span>
              </h4>
              <p className="text-[10px] text-gray-500 font-medium">
                Clique para lançar com a sua foto de perfil ao vivo!
              </p>
            </div>
          </div>

          {/* User Profile Info Tag */}
          {currentUser && (
            <div className="flex items-center gap-1.5 bg-white/90 px-2.5 py-1 rounded-full border border-pink-200/60 shadow-2xs self-start sm:self-auto">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-5 h-5 rounded-full object-cover border border-pink-400"
              />
              <span className="text-[10px] font-bold text-gray-700 truncate max-w-[120px]">
                {currentUser.name}
              </span>
            </div>
          )}
        </div>

        {/* Buttons for Each Symbol */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {displaySymbols.map((sym) => (
            <motion.button
              key={sym.id}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleLaunch(sym)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-pink-100/60 text-gray-800 border border-pink-200 shadow-2xs transition-all cursor-pointer font-bold text-xs"
              title={`Lançar ${sym.name} na tela por 2 segundos`}
            >
              <span className="text-base">{sym.charOrIcon}</span>
              <span className="text-[11px] font-bold truncate max-w-[80px] sm:max-w-[110px]">
                {sym.name.replace(/^(Raio|Coroa|Flor|Patas|Diamante|Símbolo)/i, '').trim() || sym.name}
              </span>
              <Send className="w-2.5 h-2.5 text-pink-400" />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};
