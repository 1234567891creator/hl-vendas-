import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Crown, 
  Play, 
  Pause,
  RotateCcw,
  Plus, 
  Trash2, 
  Check, 
  Paintbrush, 
  Eraser, 
  Zap, 
  Smile, 
  Layers,
  Power,
  Gauge,
  Repeat,
  Activity,
  Maximize2,
  Sliders,
  Compass,
  Flame,
  Grid,
  Film,
  Copy,
  FastForward,
  Eye,
  PlusCircle,
  Send
} from 'lucide-react';
import { 
  CustomSymbol, 
  SiteSymbolAnimationConfig, 
  SymbolAnimationEffect, 
  CustomAnimationSettings,
  UserProfile 
} from '../types';
import { sounds } from '../utils/audioEffects';
import { AnimatedPixelSprite } from './AnimatedPixelSprite';
import { launchSymbolReaction } from '../utils/symbolLauncher';

interface JoaoLucasSymbolStudioProps {
  currentUser: UserProfile | null;
  config: SiteSymbolAnimationConfig;
  symbols: CustomSymbol[];
  onUpdateConfig: (config: SiteSymbolAnimationConfig) => void;
  onUpdateSymbols: (symbols: CustomSymbol[]) => void;
}

const COLOR_PALETTE = [
  '#FF69B4', // Rosa Chiclete
  '#9333EA', // Roxo Real
  '#EAB308', // Amarelo Dourado
  '#06B6D4', // Ciano Elétrico
  '#EF4444', // Vermelho Rubi
  '#10B981', // Verde Esmeralda
  '#F97316', // Laranja Solar
  '#FFFFFF', // Branco Puro
  '#1E293B', // Preto / Grafite
  'transparent' // Apagar / Transparente
];

const PRESET_EMOJIS = [
  '⚡', '👑', '🐾', '🌸', '💖', '💎', '🚀', '🎮', 
  '🦄', '🍓', '🔮', '⭐', '🍬', '🧸', '🎀', '🍭'
];

export interface AnimatedPixelPreset {
  name: string;
  icon: string;
  color: string;
  fps: number;
  frames: string[][];
}

const createBlankGrid = () => Array(64).fill('transparent');

const buildFrame = (indices: number[], color: string, extra?: { [index: number]: string }) => {
  const g = createBlankGrid();
  indices.forEach((idx) => {
    g[idx] = color;
  });
  if (extra) {
    Object.entries(extra).forEach(([idx, col]) => {
      g[Number(idx)] = col;
    });
  }
  return g;
};

const ANIMATED_PIXEL_PRESETS: AnimatedPixelPreset[] = [
  {
    name: 'Coração Pulsante',
    icon: '💖',
    color: '#FF69B4',
    fps: 4,
    frames: [
      buildFrame([19, 20, 26, 27, 28, 29, 35, 36], '#FF69B4'),
      buildFrame([10, 11, 12, 13, 17, 18, 19, 20, 21, 22, 26, 27, 28, 29, 35, 36], '#FF69B4'),
      buildFrame(
        [9, 10, 13, 14, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 33, 34, 35, 36, 37, 38, 42, 43, 44, 45, 51, 52],
        '#FF69B4',
        { 17: '#FFFFFF', 18: '#FFFFFF' }
      ),
      buildFrame([10, 11, 12, 13, 17, 18, 19, 20, 21, 22, 26, 27, 28, 29, 35, 36], '#FF69B4'),
    ]
  },
  {
    name: 'Gatinho Piscando',
    icon: '🐱',
    color: '#F97316',
    fps: 3,
    frames: [
      buildFrame([9, 14, 17, 18, 21, 22, 25, 26, 27, 28, 29, 30, 33, 38, 42, 43, 44, 45, 50, 53], '#F97316', {
        26: '#06B6D4',
        29: '#06B6D4',
        35: '#FF69B4',
        36: '#FF69B4'
      }),
      buildFrame([9, 14, 17, 18, 21, 22, 25, 26, 27, 28, 29, 30, 33, 38, 42, 43, 44, 45, 50, 53], '#F97316', {
        26: '#06B6D4',
        28: '#1E293B',
        29: '#1E293B',
        35: '#FF69B4',
        36: '#FF69B4'
      }),
      buildFrame([9, 14, 17, 18, 21, 22, 25, 26, 27, 28, 29, 30, 33, 38, 42, 43, 44, 45, 50, 53], '#F97316', {
        25: '#1E293B',
        26: '#1E293B',
        29: '#1E293B',
        30: '#1E293B',
        35: '#FF69B4',
        36: '#FF69B4'
      })
    ]
  },
  {
    name: 'Moeda Girando',
    icon: '🪙',
    color: '#EAB308',
    fps: 4,
    frames: [
      buildFrame([10, 11, 12, 13, 17, 18, 19, 20, 21, 22, 25, 26, 27, 28, 29, 30, 33, 34, 35, 36, 37, 38, 41, 42, 43, 44, 45, 46, 50, 51, 52, 53], '#EAB308', { 27: '#FFFFFF', 28: '#FFFFFF', 35: '#FFFFFF', 36: '#FFFFFF' }),
      buildFrame([11, 12, 18, 19, 20, 26, 27, 28, 34, 35, 36, 42, 43, 44, 51, 52], '#EAB308', { 27: '#FFFFFF', 35: '#FFFFFF' }),
      buildFrame([11, 19, 27, 35, 43, 51, 12, 20, 28, 36, 44, 52], '#FFFFFF'),
      buildFrame([12, 13, 19, 20, 21, 27, 28, 29, 35, 36, 37, 43, 44, 45, 52, 53], '#EAB308', { 28: '#FFFFFF', 36: '#FFFFFF' })
    ]
  },
  {
    name: 'Raio Cósmico',
    icon: '⚡',
    color: '#EAB308',
    fps: 5,
    frames: [
      buildFrame([11, 12, 18, 19, 25, 26, 27, 28, 29, 34, 35, 42, 43, 50], '#EAB308'),
      buildFrame([11, 12, 18, 19, 25, 26, 27, 28, 29, 34, 35, 42, 43, 50, 2, 9, 21, 38, 52, 59], '#06B6D4', { 26: '#FFFFFF', 27: '#FFFFFF', 35: '#FFFFFF' }),
      buildFrame([11, 12, 18, 19, 25, 26, 27, 28, 29, 34, 35, 42, 43, 50], '#FFFFFF', { 18: '#EAB308', 29: '#EAB308', 42: '#EAB308' })
    ]
  },
  {
    name: 'Estrela Mágica',
    icon: '⭐',
    color: '#EAB308',
    fps: 4,
    frames: [
      buildFrame([27, 28, 35, 36], '#FFFFFF'),
      buildFrame([11, 12, 19, 20, 25, 26, 27, 28, 29, 30, 35, 36, 37, 38, 43, 44, 51, 52], '#EAB308', { 27: '#FFFFFF', 28: '#FFFFFF', 35: '#FFFFFF', 36: '#FFFFFF' }),
      buildFrame([3, 4, 11, 12, 16, 17, 18, 19, 20, 21, 22, 23, 27, 28, 34, 35, 36, 37, 41, 42, 45, 46, 49, 54], '#EAB308', { 19: '#FFFFFF', 20: '#FFFFFF', 27: '#FFFFFF', 28: '#FFFFFF', 35: '#FFFFFF', 36: '#FFFFFF' })
    ]
  }
];

export const JoaoLucasSymbolStudio: React.FC<JoaoLucasSymbolStudioProps> = ({
  currentUser,
  config,
  symbols,
  onUpdateConfig,
  onUpdateSymbols,
}) => {
  const isMaxAdmin = currentUser?.email?.toLowerCase() === 'joaolucasgp1234@gmail.com' || currentUser?.isMaxAdmin;

  // Main Studio Tabs: 'animator' (A parte de fazer animações), 'creator' (Criar símbolos), 'gallery' (Meus Símbolos)
  const [activeStudioTab, setActiveStudioTab] = useState<'animator' | 'creator' | 'gallery'>('animator');

  // Success Feedback Message
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // --- ANIMATOR STATE (Fazer Animações & Movimentos) ---
  const [selectedSymbolForAnimationId, setSelectedSymbolForAnimationId] = useState<string>(
    symbols[0]?.id || 'custom-pixel'
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [testFullscreen, setTestFullscreen] = useState<boolean>(false);

  // Custom Animation Parameters
  const [movementType, setMovementType] = useState<SymbolAnimationEffect>('bounce');
  const [deltaX, setDeltaX] = useState<number>(30);
  const [deltaY, setDeltaY] = useState<number>(35);
  const [rotationAngle, setRotationAngle] = useState<number>(15);
  const [scaleMin, setScaleMin] = useState<number>(0.9);
  const [scaleMax, setScaleMax] = useState<number>(1.2);
  const [durationSeconds, setDurationSeconds] = useState<number>(1.6);
  const [glowIntensity, setGlowIntensity] = useState<number>(18);
  const [glowColor, setGlowColor] = useState<string>('#EAB308');
  const [easing, setEasing] = useState<'easeInOut' | 'linear' | 'spring'>('easeInOut');
  const [trailEffect, setTrailEffect] = useState<'none' | 'sparkles' | 'stars' | 'hearts' | 'neon'>('sparkles');

  // --- CREATOR STATE (Pixel Art & Emojis) ---
  const [builderTab, setBuilderTab] = useState<'pixel' | 'emoji'>('pixel');
  const [newSymbolName, setNewSymbolName] = useState<string>('');
  const [selectedEmoji, setSelectedEmoji] = useState<string>('⚡');
  const [selectedColor, setSelectedColor] = useState<string>('#EAB308');
  const [activePaletteColor, setActivePaletteColor] = useState<string>('#EAB308');

  // Multi-frame Pixel Animation State
  const [pixelFrames, setPixelFrames] = useState<string[][]>(() => ANIMATED_PIXEL_PRESETS[0].frames);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [pixelFps, setPixelFps] = useState<number>(4);
  const [isOnionSkin, setIsOnionSkin] = useState<boolean>(true);

  // Currently target symbol being edited or animated
  const activeAnimatedSymbol = useMemo(() => {
    if (selectedSymbolForAnimationId === 'new-draft') {
      return {
        id: 'new-draft',
        name: newSymbolName || (builderTab === 'pixel' ? 'Símbolo em Criação (Pixel)' : `Símbolo ${selectedEmoji}`),
        charOrIcon: builderTab === 'pixel' ? '🎨' : selectedEmoji,
        category: builderTab,
        pixelMatrix: builderTab === 'pixel' ? (pixelFrames[currentFrameIndex] || createBlankGrid()) : undefined,
        pixelFrames: builderTab === 'pixel' ? pixelFrames : undefined,
        pixelFps: pixelFps,
        color: selectedColor,
        glowColor: glowColor,
        animationEffect: movementType,
        speed: 'fast' as const,
        scale: scaleMax,
        countOnScreen: 8,
        isActiveOnSite: true,
        createdAt: 'Hoje',
      } as CustomSymbol;
    }
    const found = symbols.find((s) => s.id === selectedSymbolForAnimationId);
    return found || symbols[0];
  }, [symbols, selectedSymbolForAnimationId, builderTab, newSymbolName, selectedEmoji, pixelFrames, currentFrameIndex, pixelFps, selectedColor, glowColor, movementType, scaleMax]);

  // Load a preset movement into animator controls
  const handleApplyMovementPreset = (presetType: SymbolAnimationEffect) => {
    sounds.playPop();
    setMovementType(presetType);

    switch (presetType) {
      case 'bounce':
        setDeltaX(0);
        setDeltaY(45);
        setRotationAngle(0);
        setScaleMin(0.88);
        setScaleMax(1.15);
        setDurationSeconds(1.2);
        setEasing('easeInOut');
        setTrailEffect('sparkles');
        break;
      case 'wave':
        setDeltaX(55);
        setDeltaY(30);
        setRotationAngle(18);
        setScaleMin(0.92);
        setScaleMax(1.12);
        setDurationSeconds(2.0);
        setEasing('easeInOut');
        setTrailEffect('neon');
        break;
      case 'sway':
        setDeltaX(35);
        setDeltaY(8);
        setRotationAngle(28);
        setScaleMin(0.95);
        setScaleMax(1.05);
        setDurationSeconds(1.8);
        setEasing('easeInOut');
        setTrailEffect('stars');
        break;
      case 'heartbeat':
        setDeltaX(0);
        setDeltaY(0);
        setRotationAngle(0);
        setScaleMin(0.85);
        setScaleMax(1.35);
        setDurationSeconds(0.9);
        setEasing('spring');
        setTrailEffect('hearts');
        break;
      case 'spin':
        setDeltaX(0);
        setDeltaY(0);
        setRotationAngle(360);
        setScaleMin(0.9);
        setScaleMax(1.1);
        setDurationSeconds(2.2);
        setEasing('linear');
        setTrailEffect('sparkles');
        break;
      case 'zigzag':
        setDeltaX(60);
        setDeltaY(40);
        setRotationAngle(25);
        setScaleMin(0.9);
        setScaleMax(1.15);
        setDurationSeconds(1.1);
        setEasing('easeInOut');
        setTrailEffect('neon');
        break;
      case 'shake':
        setDeltaX(15);
        setDeltaY(10);
        setRotationAngle(10);
        setScaleMin(0.95);
        setScaleMax(1.1);
        setDurationSeconds(0.35);
        setEasing('easeInOut');
        setTrailEffect('neon');
        break;
      case 'orbit':
        setDeltaX(45);
        setDeltaY(45);
        setRotationAngle(180);
        setScaleMin(0.9);
        setScaleMax(1.2);
        setDurationSeconds(2.5);
        setEasing('easeInOut');
        setTrailEffect('stars');
        break;
      case 'float':
        setDeltaX(10);
        setDeltaY(50);
        setRotationAngle(12);
        setScaleMin(0.95);
        setScaleMax(1.08);
        setDurationSeconds(2.8);
        setEasing('easeInOut');
        setTrailEffect('sparkles');
        break;
      case 'pulse':
        setDeltaX(0);
        setDeltaY(0);
        setRotationAngle(0);
        setScaleMin(0.8);
        setScaleMax(1.3);
        setDurationSeconds(1.4);
        setEasing('easeInOut');
        setTrailEffect('sparkles');
        break;
    }
  };

  // Paint pixel grid on the active frame
  const handleCellClick = (index: number) => {
    sounds.playPop();
    setPixelFrames((prev) => {
      const next = [...prev];
      const targetFrame = [...(next[currentFrameIndex] || createBlankGrid())];
      targetFrame[index] = activePaletteColor;
      next[currentFrameIndex] = targetFrame;
      return next;
    });
  };

  const handleAddFrame = () => {
    sounds.playSparkle();
    setPixelFrames((prev) => [...prev, createBlankGrid()]);
    setCurrentFrameIndex(pixelFrames.length);
  };

  const handleDuplicateCurrentFrame = () => {
    sounds.playSparkle();
    const current = pixelFrames[currentFrameIndex] || createBlankGrid();
    const next = [...pixelFrames];
    next.splice(currentFrameIndex + 1, 0, [...current]);
    setPixelFrames(next);
    setCurrentFrameIndex(currentFrameIndex + 1);
  };

  const handleDeleteCurrentFrame = (indexToDelete: number) => {
    if (pixelFrames.length <= 1) return;
    sounds.playPop();
    const next = pixelFrames.filter((_, idx) => idx !== indexToDelete);
    setPixelFrames(next);
    if (currentFrameIndex >= next.length) {
      setCurrentFrameIndex(Math.max(0, next.length - 1));
    }
  };

  const handleClearCurrentFrame = () => {
    sounds.playPop();
    setPixelFrames((prev) => {
      const next = [...prev];
      next[currentFrameIndex] = createBlankGrid();
      return next;
    });
  };

  // Load an animated preset model
  const handleLoadAnimatedPreset = (preset: AnimatedPixelPreset) => {
    sounds.playSparkle();
    setPixelFrames(preset.frames.map((f) => [...f]));
    setCurrentFrameIndex(0);
    setPixelFps(preset.fps);
    setActivePaletteColor(preset.color);
    setNewSymbolName(`Símbolo ${preset.name} do João`);
  };

  // Save or Update Animation Settings on Symbol
  const handleSaveAnimationToSymbol = () => {
    sounds.playSparkle();
    if (!activeAnimatedSymbol) return;

    const customAnim: CustomAnimationSettings = {
      movementType,
      deltaX,
      deltaY,
      rotationAngle,
      scaleMin,
      scaleMax,
      durationSeconds,
      glowIntensity,
      easing,
      trailEffect
    };

    const updatedSymbols = symbols.map((s) => {
      if (s.id === activeAnimatedSymbol.id) {
        return {
          ...s,
          animationEffect: movementType,
          glowColor,
          customAnimation: customAnim
        };
      }
      return s;
    });

    onUpdateSymbols(updatedSymbols);
    try {
      localStorage.setItem('hl_custom_symbols', JSON.stringify(updatedSymbols));
    } catch {}

    setSuccessBanner(`✨ Movimentos salvos com sucesso no símbolo "${activeAnimatedSymbol.name}"!`);
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  // KEY USER REQUEST: "realmente mude o símbolo da lumininha"
  // Set this symbol with this animation to replace Lumininha everywhere
  const handleSetAsLumininhaReplacement = (targetSymbol?: CustomSymbol) => {
    sounds.playFanfare();
    const sym = targetSymbol || activeAnimatedSymbol;
    if (!sym) return;

    const customAnim: CustomAnimationSettings = {
      movementType,
      deltaX,
      deltaY,
      rotationAngle,
      scaleMin,
      scaleMax,
      durationSeconds,
      glowIntensity,
      easing,
      trailEffect
    };

    // Update symbol in list
    const updatedSymbols = symbols.map((s) => {
      if (s.id === sym.id) {
        return {
          ...s,
          isActiveOnSite: true,
          animationEffect: movementType,
          glowColor,
          customAnimation: customAnim,
          isLumininhaReplacement: true
        };
      }
      return {
        ...s,
        isLumininhaReplacement: false
      };
    });

    onUpdateSymbols(updatedSymbols);
    try {
      localStorage.setItem('hl_custom_symbols', JSON.stringify(updatedSymbols));
    } catch {}

    // Update master config
    const updatedConfig: SiteSymbolAnimationConfig = {
      ...config,
      enabled: true,
      replaceLumininhaWithSymbol: true,
      selectedMascotSymbolId: sym.id,
      activeEffect: movementType,
      customAnimation: customAnim
    };

    onUpdateConfig(updatedConfig);
    try {
      localStorage.setItem('hl_symbol_config', JSON.stringify(updatedConfig));
    } catch {}

    setSuccessBanner(
      `🎉 SUCESSO! A Lumininha foi 100% substituída por "${sym.name}"! Veja o novo ícone na barra de navegação, na aba Lumininha e no botão flutuante no canto da tela!`
    );
    setTimeout(() => setSuccessBanner(null), 6000);
  };

  // Toggle replacement on/off
  const handleToggleReplacementMaster = () => {
    sounds.playPop();
    const nextVal = !config.replaceLumininhaWithSymbol;
    const targetId = config.selectedMascotSymbolId || symbols[0]?.id;
    const updated = {
      ...config,
      replaceLumininhaWithSymbol: nextVal,
      selectedMascotSymbolId: nextVal ? targetId : undefined
    };
    onUpdateConfig(updated);
    try {
      localStorage.setItem('hl_symbol_config', JSON.stringify(updated));
    } catch {}
  };

  // Save Newly Created Symbol from the Creator tab
  const handleCreateNewSymbol = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playFanfare();

    const id = `sym-custom-${Date.now()}`;
    const name = newSymbolName.trim() || (builderTab === 'pixel' ? 'Símbolo Pixel do João' : `Símbolo ${selectedEmoji} do João`);

    const customAnim: CustomAnimationSettings = {
      movementType,
      deltaX,
      deltaY,
      rotationAngle,
      scaleMin,
      scaleMax,
      durationSeconds,
      glowIntensity,
      easing,
      trailEffect
    };

    let newSymbol: CustomSymbol;
    if (builderTab === 'pixel') {
      newSymbol = {
        id,
        name,
        charOrIcon: '🎨',
        category: 'pixel',
        pixelMatrix: [...(pixelFrames[0] || createBlankGrid())],
        pixelFrames: [...pixelFrames],
        pixelFps: pixelFps,
        color: activePaletteColor !== 'transparent' ? activePaletteColor : '#EAB308',
        glowColor: glowColor,
        animationEffect: movementType,
        customAnimation: customAnim,
        speed: 'fast',
        scale: scaleMax,
        countOnScreen: 8,
        isActiveOnSite: true,
        createdAt: new Date().toLocaleDateString('pt-BR'),
      };
    } else {
      newSymbol = {
        id,
        name,
        charOrIcon: selectedEmoji,
        category: 'emoji',
        color: selectedColor,
        glowColor: glowColor,
        animationEffect: movementType,
        customAnimation: customAnim,
        speed: 'fast',
        scale: scaleMax,
        countOnScreen: 8,
        isActiveOnSite: true,
        createdAt: new Date().toLocaleDateString('pt-BR'),
      };
    }

    const updated = [newSymbol, ...symbols];
    onUpdateSymbols(updated);
    try {
      localStorage.setItem('hl_custom_symbols', JSON.stringify(updated));
    } catch {}

    setSelectedSymbolForAnimationId(id);
    setActiveStudioTab('animator');
    setSuccessBanner(`🎨 Símbolo "${name}" criado com sucesso! Agora você está no Animador de Movimentos.`);
    setTimeout(() => setSuccessBanner(null), 5000);
  };

  // Delete symbol
  const handleDeleteSymbol = (symbolId: string) => {
    sounds.playPop();
    const updated = symbols.filter((s) => s.id !== symbolId);
    onUpdateSymbols(updated);
    try {
      localStorage.setItem('hl_custom_symbols', JSON.stringify(updated));
    } catch {}
  };

  // Toggle symbol active in site
  const handleToggleSymbolActive = (symbolId: string) => {
    sounds.playPop();
    const updated = symbols.map((s) => (s.id === symbolId ? { ...s, isActiveOnSite: !s.isActiveOnSite } : s));
    onUpdateSymbols(updated);
    try {
      localStorage.setItem('hl_custom_symbols', JSON.stringify(updated));
    } catch {}
  };

  // Toggle global effects on/off across all symbols in the site
  const handleToggleGlobalEffects = () => {
    sounds.playPop();
    const currentEnabled = config.effectsEnabled !== false;
    const nextVal = !currentEnabled;
    const updated = {
      ...config,
      effectsEnabled: nextVal,
    };
    onUpdateConfig(updated);
    try {
      localStorage.setItem('hl_symbol_config', JSON.stringify(updated));
    } catch {}
    setSuccessBanner(
      nextVal
        ? '✨ Efeitos visuais e movimentos nos símbolos foram ATIVADOS no site com sucesso!'
        : '🛑 Efeitos visuais nos símbolos foram DESATIVADOS com sucesso!'
    );
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  // Toggle effects on/off for a single specific symbol
  const handleToggleSymbolEffects = (symbolId: string) => {
    sounds.playPop();
    const updated = symbols.map((s) => 
      s.id === symbolId ? { ...s, effectsDisabled: !s.effectsDisabled } : s
    );
    onUpdateSymbols(updated);
    try {
      localStorage.setItem('hl_custom_symbols', JSON.stringify(updated));
    } catch {}
    const sym = symbols.find((s) => s.id === symbolId);
    const willBeDisabled = !sym?.effectsDisabled;
    setSuccessBanner(
      willBeDisabled
        ? `🛑 Efeitos de "${sym?.name || 'símbolo'}" desativados.`
        : `✨ Efeitos de "${sym?.name || 'símbolo'}" reativados com sucesso!`
    );
    setTimeout(() => setSuccessBanner(null), 3500);
  };

  if (!isMaxAdmin) {
    return (
      <div className="bg-white rounded-3xl p-8 border-3 border-amber-200 shadow-sm text-center max-w-lg mx-auto space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center text-3xl mx-auto shadow-inner">
          🔒
        </div>
        <h3 className="font-display font-black text-2xl text-gray-900">
          Estúdio Exclusivo do Adm Máximo
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          Esta área de construção e animação de símbolos no site é restrita ao Administrador Máximo (<strong>joaolucasgp1234@gmail.com</strong>).
        </p>
      </div>
    );
  }

  const activeMascotSymbol = config.replaceLumininhaWithSymbol
    ? symbols.find((s) => s.id === config.selectedMascotSymbolId) || symbols[0]
    : null;

  return (
    <div className="space-y-6">
      {/* Banner de Identidade do Estúdio VIP */}
      <div className="bg-gradient-to-r from-amber-400 via-orange-500 to-purple-600 rounded-3xl p-5 sm:p-7 text-white shadow-lg border-3 border-yellow-300 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="bg-white/20 text-yellow-100 font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 text-yellow-300" />
              <span>Painel VIP do Adm Máximo João Lucas</span>
            </span>
            <span className="bg-yellow-300 text-yellow-950 font-black text-[10px] px-2.5 py-0.5 rounded-full">
              👑 Exclusivo
            </span>
          </div>

          <h2 className="font-display font-black text-2xl sm:text-3xl tracking-tight text-white drop-shadow-xs">
            Estúdio de Símbolos & Animador de Movimentos
          </h2>
          <p className="text-xs sm:text-sm text-yellow-100 font-medium max-w-xl leading-relaxed">
            Crie seus símbolos, <strong>faça animações e movimentos personalizados</strong> (ondas, pulos, giros e tremores) e <strong>substitua a Mascote Lumininha</strong> no site inteiro com 1 clique!
          </p>
        </div>

        {/* Status da Mascote Atual */}
        <div className="bg-black/25 backdrop-blur-md rounded-2xl p-3 border border-white/30 text-center sm:text-right flex items-center gap-3">
          <div>
            <div className="text-[10px] uppercase font-bold text-yellow-200">Mascote Ativa do Site:</div>
            <div className="text-sm font-black text-white">
              {activeMascotSymbol ? activeMascotSymbol.name : 'Lumininha Padrão ⚡'}
            </div>
            <div className="text-[10px] text-yellow-100">
              {config.replaceLumininhaWithSymbol ? '🟢 Substituição Ativa' : '⚪ Lumininha Normal'}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl border border-white/40 shadow-inner">
            {activeMascotSymbol ? (
              activeMascotSymbol.category === 'pixel' ? '🎨' : activeMascotSymbol.charOrIcon
            ) : (
              '⚡'
            )}
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      <AnimatePresence>
        {successBanner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl shadow-lg border-2 border-green-300 flex items-center gap-3 font-bold text-xs sm:text-sm"
          >
            <span className="text-xl">✅</span>
            <span className="flex-1">{successBanner}</span>
            <button
              onClick={() => setSuccessBanner(null)}
              className="text-white/80 hover:text-white text-xs bg-black/20 px-2 py-1 rounded-lg"
            >
              Fechar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* CONTROLE MESTRE: ATIVAR OU DESATIVAR EFEITOS NOS SÍMBOLOS NO SITE */}
      {/* ============================================================== */}
      <div className={`p-4 sm:p-5 rounded-3xl border-3 transition-all flex flex-col sm:flex-row items-center justify-between gap-4 ${
        config.effectsEnabled !== false
          ? 'bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-pink-500/10 border-amber-400 shadow-sm'
          : 'bg-red-50/70 border-red-300 text-gray-800'
      }`}>
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-inner ${
            config.effectsEnabled !== false ? 'bg-amber-400 text-amber-950 animate-bounce' : 'bg-red-100 text-red-600'
          }`}>
            {config.effectsEnabled !== false ? '✨' : '🛑'}
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h4 className="font-display font-black text-base sm:text-lg text-gray-900">
                Efeitos e Movimentos nos Símbolos
              </h4>
              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                config.effectsEnabled !== false 
                  ? 'bg-emerald-500 text-white shadow-xs' 
                  : 'bg-red-500 text-white'
              }`}>
                {config.effectsEnabled !== false ? 'ATIVADOS' : 'DESATIVADOS'}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
              {config.effectsEnabled !== false
                ? 'Os movimentos, giros, pulos e efeitos visuais nos símbolos estão rodando no site para você.'
                : 'Todos os efeitos estão desativados! Os símbolos ficam sem movimento no site.'}
            </p>
          </div>
        </div>

        {/* Botão de Alternar Efeitos */}
        <button
          onClick={handleToggleGlobalEffects}
          className={`px-5 py-3 rounded-2xl font-display font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all ${
            config.effectsEnabled !== false
              ? 'bg-red-500 hover:bg-red-600 text-white hover:scale-105 active:scale-95'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-105 active:scale-95'
          }`}
        >
          {config.effectsEnabled !== false ? (
            <>
              <span>🛑 Desativar Efeitos nos Símbolos</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>✨ Ativar Efeitos nos Símbolos</span>
            </>
          )}
        </button>
      </div>

      {/* Navegação Entre as Áreas do Estúdio */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-amber-50 rounded-2xl border-2 border-amber-200">
        <button
          onClick={() => {
            sounds.playPop();
            setActiveStudioTab('animator');
          }}
          className={`flex-1 min-w-[150px] py-2.5 px-4 rounded-xl font-display font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeStudioTab === 'animator'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
              : 'text-amber-900 hover:bg-amber-100/70'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>🎬 Fazer Animações & Movimentos</span>
        </button>

        <button
          onClick={() => {
            sounds.playPop();
            setActiveStudioTab('creator');
          }}
          className={`flex-1 min-w-[150px] py-2.5 px-4 rounded-xl font-display font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeStudioTab === 'creator'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
              : 'text-purple-900 hover:bg-purple-100/70'
          }`}
        >
          <Paintbrush className="w-4 h-4" />
          <span>🎨 Criar Símbolos (Pixel & Emojis)</span>
        </button>

        <button
          onClick={() => {
            sounds.playPop();
            setActiveStudioTab('gallery');
          }}
          className={`flex-1 min-w-[150px] py-2.5 px-4 rounded-xl font-display font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeStudioTab === 'gallery'
              ? 'bg-gradient-to-r from-gray-800 to-gray-950 text-yellow-300 shadow-md'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Crown className="w-4 h-4 text-yellow-400" />
          <span>⭐ Meus Símbolos ({symbols.length})</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* ABA 1: ANIMADOR DE MOVIMENTOS & ANIMAÇÕES (A PARTE QUE FALTAVA) */}
      {/* ============================================================== */}
      {activeStudioTab === 'animator' && (
        <div className="space-y-6">
          {/* Card Principal: Palco Interativo de Animação com Preview ao Vivo */}
          <div className="bg-gray-950 rounded-3xl p-5 sm:p-7 border-3 border-amber-400 text-white shadow-xl space-y-6 relative overflow-hidden">
            {/* Header do Palco */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 text-lg">⚡</span>
                  <h3 className="font-display font-black text-lg text-white">
                    Palco Interativo de Movimentos em Tempo Real
                  </h3>
                </div>
                <p className="text-xs text-gray-400">
                  O símbolo abaixo executa exatamente o movimento, velocidade e brilho ajustados nos controles!
                </p>
              </div>

              {/* Seletor do Símbolo que está no Palco */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-[11px] font-bold text-gray-400 whitespace-nowrap">Animando:</span>
                <select
                  value={selectedSymbolForAnimationId}
                  onChange={(e) => {
                    sounds.playPop();
                    setSelectedSymbolForAnimationId(e.target.value);
                  }}
                  className="bg-gray-800 border border-gray-700 text-yellow-300 font-bold text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400 flex-1 sm:flex-none cursor-pointer"
                >
                  {symbols.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category === 'pixel' ? 'Pixel Art' : s.charOrIcon})
                    </option>
                  ))}
                  <option value="new-draft">🎨 Novo Símbolo em Rascunho</option>
                </select>
              </div>
            </div>

            {/* O Palco Central (Stage com Grid Reticulado) */}
            <div className="relative w-full h-64 sm:h-72 bg-gradient-to-b from-gray-900 via-gray-950 to-black rounded-2xl border-2 border-gray-800 flex items-center justify-center overflow-hidden select-none">
              {/* Grade de Retícula */}
              <div 
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage: 'radial-gradient(circle, #EAB308 1px, transparent 1px)',
                  backgroundSize: '24px 24px'
                }}
              />

              {/* Linhas de Eixo (X e Y) */}
              <div className="absolute inset-x-0 h-px bg-amber-500/20 top-1/2" />
              <div className="absolute inset-y-0 w-px bg-amber-500/20 left-1/2" />

              {/* Telemetria do Palco */}
              <div className="absolute top-3 left-3 text-[10px] font-mono text-gray-400 space-y-0.5 bg-black/60 px-2.5 py-1.5 rounded-lg border border-gray-800">
                <div>EFEITO: <span className="text-yellow-400 font-bold uppercase">{movementType}</span></div>
                <div>DELTA X: <span className="text-white font-bold">{deltaX}px</span> | DELTA Y: <span className="text-white font-bold">{deltaY}px</span></div>
                <div>CICLO: <span className="text-emerald-400 font-bold">{durationSeconds}s</span> ({Math.round(10 / durationSeconds) / 10} ciclos/s)</div>
                <div>STATUS: <span className={isPlaying ? 'text-green-400' : 'text-amber-400'}>{isPlaying ? 'EXECUTANDO' : 'PAUSADO'}</span></div>
              </div>

              {/* Efeito de Rastro / Partículas */}
              {trailEffect !== 'none' && isPlaying && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  {[...Array(6)].map((_, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: [0, 0.8, 0],
                        scale: [0.5, 1.2, 0.5],
                        x: [0, (i % 2 === 0 ? 1 : -1) * (30 + i * 15), 0],
                        y: [0, (i < 3 ? -1 : 1) * (20 + i * 12), 0]
                      }}
                      transition={{
                        duration: durationSeconds * 0.9,
                        repeat: Infinity,
                        delay: i * 0.25,
                        ease: 'easeInOut'
                      }}
                      className="absolute text-xl select-none"
                    >
                      {trailEffect === 'sparkles' && '✨'}
                      {trailEffect === 'stars' && '⭐'}
                      {trailEffect === 'hearts' && '💖'}
                      {trailEffect === 'neon' && '⚡'}
                    </motion.span>
                  ))}
                </div>
              )}

              {/* Símbolo Animado no Palco */}
              <motion.div
                animate={
                  isPlaying
                    ? {
                        x: deltaX !== 0 ? [-deltaX, deltaX, -deltaX] : 0,
                        y: deltaY !== 0 ? [-deltaY, deltaY, -deltaY] : 0,
                        rotate: rotationAngle !== 0 ? [0, rotationAngle, -rotationAngle, 0] : 0,
                        scale: [scaleMin, scaleMax, scaleMin],
                      }
                    : { x: 0, y: 0, rotate: 0, scale: 1 }
                }
                transition={{
                  duration: durationSeconds,
                  repeat: Infinity,
                  ease: easing === 'linear' ? 'linear' : easing === 'spring' ? 'backInOut' : 'easeInOut',
                }}
                style={{
                  filter: glowIntensity > 0 ? `drop-shadow(0 0 ${glowIntensity}px ${glowColor})` : undefined,
                }}
                className="relative z-10 flex items-center justify-center cursor-pointer transition-shadow"
              >
                {activeAnimatedSymbol?.category === 'pixel' ? (
                  <AnimatedPixelSprite
                    frames={activeAnimatedSymbol.pixelFrames}
                    matrix={activeAnimatedSymbol.pixelMatrix}
                    fps={activeAnimatedSymbol.pixelFps || 4}
                    size="xl"
                    className="border-2 border-white/50 shadow-2xl"
                  />
                ) : (
                  <span
                    className="text-6xl sm:text-7xl select-none drop-shadow-lg"
                    style={{ color: activeAnimatedSymbol?.color || '#EAB308' }}
                  >
                    {activeAnimatedSymbol?.charOrIcon || '⚡'}
                  </span>
                )}
              </motion.div>

              {/* Controles de Reprodução no Palco */}
              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/70 p-1.5 rounded-xl border border-gray-800">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-gray-950 font-black text-xs rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlaying ? 'Pausar' : 'Play'}</span>
                </button>
                <button
                  onClick={() => {
                    sounds.playPop();
                    handleApplyMovementPreset('bounce');
                  }}
                  title="Resetar Movimentos"
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* SUPER AÇÃO DOURADA: SUBSTITUIR A LUMININHA POR ESTE SÍMBOLO COM ESTA ANIMAÇÃO */}
            <div className="p-4 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-orange-500/20 border-2 border-amber-400 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-0.5 text-center sm:text-left">
                <div className="text-xs font-black text-yellow-300 flex items-center justify-center sm:justify-start gap-1.5">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <span>Substituição Oficial da Mascote Lumininha:</span>
                </div>
                <p className="text-[11px] text-gray-300">
                  Substitui a Lumininha por <strong>"{activeAnimatedSymbol?.name}"</strong> com este movimento exato no site todo!
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSetAsLumininhaReplacement()}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-gray-950 font-display font-black text-xs sm:text-sm rounded-xl shadow-lg border-2 border-yellow-200 flex items-center gap-2 cursor-pointer hover:brightness-110 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-amber-900" />
                  <span>⭐ Substituir Lumininha por este Símbolo</span>
                </motion.button>

                <button
                  type="button"
                  onClick={() => activeAnimatedSymbol && handleToggleSymbolEffects(activeAnimatedSymbol.id)}
                  className={`px-3.5 py-2 font-bold text-xs rounded-xl border cursor-pointer transition-all flex items-center gap-1.5 ${
                    activeAnimatedSymbol?.effectsDisabled
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-400'
                      : 'bg-red-950/80 hover:bg-red-900 text-red-200 border-red-700'
                  }`}
                  title={activeAnimatedSymbol?.effectsDisabled ? 'Reativar os efeitos deste símbolo' : 'Desativar efeitos deste símbolo'}
                >
                  {activeAnimatedSymbol?.effectsDisabled ? '✨ Ativar Efeito' : '🛑 Desativar Efeito'}
                </button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (activeAnimatedSymbol) {
                      launchSymbolReaction(activeAnimatedSymbol, currentUser);
                    }
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-display font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                  title="Lança este símbolo na tela durando exatamente 2 segundos com sua foto de perfil"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>🚀 Lançar na Tela (2s c/ Foto)</span>
                </motion.button>

                <button
                  onClick={handleSaveAnimationToSymbol}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs rounded-xl border border-gray-600 cursor-pointer transition-all"
                >
                  💾 Salvar no Símbolo
                </button>
              </div>
            </div>

            {/* Presets de Movimentos Rápidos */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-gray-300">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Escolher Tipo de Movimento / Presets:</span>
                </span>
                <span className="text-[11px] text-amber-400">Clique para aplicar</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'bounce', label: '🏀 Pulo & Quique', desc: 'Salto vertical' },
                  { id: 'wave', label: '🌊 Onda Senoidal', desc: 'Curva fluida' },
                  { id: 'sway', label: '🎐 Pêndulo Suave', desc: 'Balanço em arco' },
                  { id: 'heartbeat', label: '💓 Tum-Tum', desc: 'Batimento fofo' },
                  { id: 'spin', label: '🌀 Giro 360°', desc: 'Rotação cósmica' },
                  { id: 'zigzag', label: '⚡ Zigue-Zague', desc: 'Corte rápido' },
                  { id: 'shake', label: '📳 Tremor Elétrico', desc: 'Vibração contínua' },
                  { id: 'orbit', label: '🪐 Órbita Espacial', desc: 'Círculo em volta' },
                  { id: 'float', label: '🎈 Flutuação', desc: 'Levitação suave' },
                  { id: 'pulse', label: '🌟 Pulso Neon', desc: 'Glow expansivo' }
                ].map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleApplyMovementPreset(preset.id as SymbolAnimationEffect)}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                      movementType === preset.id
                        ? 'bg-amber-400 text-gray-950 font-black border-yellow-200 shadow-md scale-[1.02]'
                        : 'bg-gray-900 hover:bg-gray-800 text-gray-300 border-gray-800'
                    }`}
                  >
                    <div className="text-xs font-bold leading-tight">{preset.label}</div>
                    <div className={`text-[10px] mt-0.5 ${movementType === preset.id ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                      {preset.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders de Ajuste Fino dos Movimentos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-3 border-t border-gray-800 text-xs">
              {/* Slider 1: Deslocamento Horizontal X */}
              <div className="bg-gray-900/80 p-3.5 rounded-2xl border border-gray-800 space-y-1.5">
                <div className="flex justify-between font-bold text-gray-300">
                  <span>↔️ Movimento Horizontal (X):</span>
                  <span className="text-amber-400 font-mono">{deltaX}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="120"
                  value={deltaX}
                  onChange={(e) => setDeltaX(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-500">
                  <span>0px (Parado)</span>
                  <span>120px (Largo)</span>
                </div>
              </div>

              {/* Slider 2: Deslocamento Vertical Y (Pulo / Altura) */}
              <div className="bg-gray-900/80 p-3.5 rounded-2xl border border-gray-800 space-y-1.5">
                <div className="flex justify-between font-bold text-gray-300">
                  <span>↕️ Altura do Salto / Deslocamento (Y):</span>
                  <span className="text-amber-400 font-mono">{deltaY}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="120"
                  value={deltaY}
                  onChange={(e) => setDeltaY(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-500">
                  <span>0px (No chão)</span>
                  <span>120px (Salto Alto)</span>
                </div>
              </div>

              {/* Slider 3: Rotação / Inclinação */}
              <div className="bg-gray-900/80 p-3.5 rounded-2xl border border-gray-800 space-y-1.5">
                <div className="flex justify-between font-bold text-gray-300">
                  <span>🔄 Ângulo de Rotação / Giro:</span>
                  <span className="text-amber-400 font-mono">{rotationAngle}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="5"
                  value={rotationAngle}
                  onChange={(e) => setRotationAngle(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-500">
                  <span>0° (Firme)</span>
                  <span>360° (Giro Completo)</span>
                </div>
              </div>

              {/* Slider 4: Velocidade / Tempo do Ciclo */}
              <div className="bg-gray-900/80 p-3.5 rounded-2xl border border-gray-800 space-y-1.5">
                <div className="flex justify-between font-bold text-gray-300">
                  <span>⏱️ Duração do Ciclo (Velocidade):</span>
                  <span className="text-amber-400 font-mono">{durationSeconds}s</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="4.5"
                  step="0.1"
                  value={durationSeconds}
                  onChange={(e) => setDurationSeconds(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-500">
                  <span>0.2s (Ultra Rápido)</span>
                  <span>4.5s (Super Suave)</span>
                </div>
              </div>

              {/* Slider 5: Escala Máxima (Tamanho do Zoom) */}
              <div className="bg-gray-900/80 p-3.5 rounded-2xl border border-gray-800 space-y-1.5">
                <div className="flex justify-between font-bold text-gray-300">
                  <span>🔍 Zoom / Pulsação (Escala Máx):</span>
                  <span className="text-amber-400 font-mono">{scaleMax}x</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="2.0"
                  step="0.05"
                  value={scaleMax}
                  onChange={(e) => setScaleMax(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-500">
                  <span>0.8x (Discreto)</span>
                  <span>2.0x (Gigante)</span>
                </div>
              </div>

              {/* Slider 6: Aura Neon / Brilho */}
              <div className="bg-gray-900/80 p-3.5 rounded-2xl border border-gray-800 space-y-1.5">
                <div className="flex justify-between font-bold text-gray-300">
                  <span>✨ Brilho Neon (Aura Glow):</span>
                  <span className="text-amber-400 font-mono">{glowIntensity}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={glowIntensity}
                  onChange={(e) => setGlowIntensity(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <div className="flex items-center gap-1.5 pt-1">
                  {['#EAB308', '#FF69B4', '#06B6D4', '#9333EA', '#EF4444', '#10B981'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setGlowColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-4 h-4 rounded-full border cursor-pointer transition-transform ${glowColor === c ? 'scale-125 border-white' : 'border-transparent'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Opção: Rastro de Partículas */}
              <div className="bg-gray-900/80 p-3.5 rounded-2xl border border-gray-800 space-y-1.5">
                <div className="font-bold text-gray-300">
                  <span>🪄 Rastro de Partículas:</span>
                </div>
                <div className="grid grid-cols-5 gap-1 pt-1">
                  {[
                    { id: 'none', label: 'Off' },
                    { id: 'sparkles', label: '✨ Brilho' },
                    { id: 'stars', label: '⭐ Estrela' },
                    { id: 'hearts', label: '💖 Amor' },
                    { id: 'neon', label: '⚡ Raio' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTrailEffect(t.id as any)}
                      className={`py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        trailEffect === t.id
                          ? 'bg-amber-400 text-gray-950 font-black'
                          : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Opção: Curva / Easing */}
              <div className="bg-gray-900/80 p-3.5 rounded-2xl border border-gray-800 space-y-1.5">
                <div className="font-bold text-gray-300">
                  <span>📐 Curva de Movimento:</span>
                </div>
                <div className="grid grid-cols-3 gap-1 pt-1">
                  {[
                    { id: 'easeInOut', label: 'Suave' },
                    { id: 'spring', label: 'Elástica' },
                    { id: 'linear', label: 'Contínua' }
                  ].map((es) => (
                    <button
                      key={es.id}
                      type="button"
                      onClick={() => setEasing(es.id as any)}
                      className={`py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        easing === es.id
                          ? 'bg-amber-400 text-gray-950 font-black'
                          : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                      }`}
                    >
                      {es.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ABA 2: CRIADOR DE NOVOS SÍMBOLOS (PIXEL ART 8x8 & EMOJIS)        */}
      {/* ============================================================== */}
      {activeStudioTab === 'creator' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border-3 border-purple-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-purple-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎨</span>
                <h3 className="font-display font-black text-xl text-gray-900">
                  Oficina de Desenho de Símbolos
                </h3>
              </div>
              <p className="text-xs text-gray-500">
                Desenhe seu símbolo pixel a pixel ou monte usando emojis e ícones fofos!
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-purple-50 p-1 rounded-2xl border border-purple-200">
              <button
                type="button"
                onClick={() => setBuilderTab('pixel')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  builderTab === 'pixel' ? 'bg-purple-600 text-white shadow-xs' : 'text-purple-900 hover:bg-purple-100'
                }`}
              >
                Pixel Art (8x8)
              </button>
              <button
                type="button"
                onClick={() => setBuilderTab('emoji')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  builderTab === 'emoji' ? 'bg-purple-600 text-white shadow-xs' : 'text-purple-900 hover:bg-purple-100'
                }`}
              >
                Emoji & Ícone
              </button>
            </div>
          </div>

          {/* Builder Type 1: Pixel Art 8x8 Animation Studio */}
          {builderTab === 'pixel' ? (
            <div className="space-y-6">
              {/* Presets Rápidos de Pixel Art Animado */}
              <div className="flex flex-wrap items-center gap-2 p-3 bg-purple-50/70 rounded-2xl border border-purple-200">
                <span className="text-xs font-bold text-purple-900 flex items-center gap-1">
                  <Film className="w-3.5 h-3.5 text-purple-600" />
                  <span>Modelos Animados Prontos:</span>
                </span>
                {ANIMATED_PIXEL_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleLoadAnimatedPreset(preset)}
                    className="px-3 py-1.5 bg-white hover:bg-purple-100 border border-purple-300 rounded-xl text-xs font-bold text-purple-900 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all hover:scale-105"
                  >
                    <span>{preset.icon}</span>
                    <span>{preset.name}</span>
                    <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-md font-black">
                      {preset.frames.length}q
                    </span>
                  </button>
                ))}
              </div>

              {/* TIMELINE DE QUADROS (FRAMES) */}
              <div className="p-4 bg-gray-900 rounded-3xl border-2 border-gray-800 space-y-3 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Film className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-black text-white">Linha do Tempo dos Quadros</span>
                    <span className="text-[11px] text-gray-400">
                      ({pixelFrames.length} {pixelFrames.length === 1 ? 'quadro' : 'quadros'})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={handleAddFrame}
                      className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                      title="Adicionar novo quadro em branco"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>+ Quadro</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDuplicateCurrentFrame}
                      className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-amber-300 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-all border border-gray-700"
                      title="Duplicar o quadro atual"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Duplicar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCurrentFrame(currentFrameIndex)}
                      disabled={pixelFrames.length <= 1}
                      className={`px-2.5 py-1 font-bold text-xs rounded-xl flex items-center gap-1 transition-all border ${
                        pixelFrames.length <= 1
                          ? 'opacity-40 text-gray-500 border-gray-800 cursor-not-allowed'
                          : 'text-red-400 hover:bg-red-950/40 border-red-900/50 cursor-pointer'
                      }`}
                      title="Excluir quadro selecionado"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleClearCurrentFrame}
                      className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-all border border-gray-700"
                      title="Limpar apenas este quadro"
                    >
                      <Eraser className="w-3.5 h-3.5 text-gray-400" />
                      <span>Limpar</span>
                    </button>
                  </div>
                </div>

                {/* Strip of Frame Thumbnails */}
                <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin">
                  {pixelFrames.map((frame, fIdx) => {
                    const isActive = fIdx === currentFrameIndex;
                    return (
                      <button
                        key={fIdx}
                        type="button"
                        onClick={() => {
                          sounds.playPop();
                          setCurrentFrameIndex(fIdx);
                        }}
                        className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all cursor-pointer flex-shrink-0 ${
                          isActive
                            ? 'bg-purple-900/60 border-2 border-purple-400 ring-2 ring-purple-400/40 shadow-md scale-105'
                            : 'bg-gray-950 border border-gray-800 hover:border-gray-700 hover:scale-102 opacity-75'
                        }`}
                      >
                        {/* 8x8 Mini Canvas Thumbnail */}
                        <div className="grid grid-cols-8 w-11 h-11 rounded-lg overflow-hidden bg-gray-900 p-0.5 border border-gray-800">
                          {frame.map((c, cIdx) => (
                            <div
                              key={cIdx}
                              style={{ backgroundColor: c !== 'transparent' ? c : '#111827' }}
                              className="w-full h-full"
                            />
                          ))}
                        </div>
                        <span className={`text-[10px] font-black ${isActive ? 'text-purple-300' : 'text-gray-400'}`}>
                          Quadro {fIdx + 1}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* EDITOR GRID & LIVE ANIMATED PREVIEW */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* 8x8 Drawing Canvas with Onion Skin */}
                <div className="flex flex-col items-center justify-center p-4 sm:p-5 bg-gray-900 rounded-3xl border-3 border-gray-800 shadow-xl space-y-4">
                  <div className="flex items-center justify-between w-full px-2 text-xs font-bold text-gray-300">
                    <span className="flex items-center gap-1.5">
                      <Grid className="w-4 h-4 text-amber-400" />
                      <span>Editando Quadro {currentFrameIndex + 1} de {pixelFrames.length}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsOnionSkin(!isOnionSkin)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        isOnionSkin
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                          : 'bg-gray-800 text-gray-400 hover:text-gray-300'
                      }`}
                      title="Casca de cebola: mostra a silhueta do quadro anterior em transparência para guiar seu traço"
                    >
                      <Eye className="w-3 h-3" />
                      <span>{isOnionSkin ? '🧅 Onion Skin: ON' : '🧅 Onion Skin: OFF'}</span>
                    </button>
                  </div>

                  {/* 8x8 Interactive Grid */}
                  <div className="grid grid-cols-8 gap-1.5 bg-gray-950 p-3 sm:p-4 rounded-2xl border border-gray-800 shadow-inner">
                    {(pixelFrames[currentFrameIndex] || createBlankGrid()).map((color, idx) => {
                      const isClear = color === 'transparent';
                      const prevFrameColor = (isOnionSkin && currentFrameIndex > 0)
                        ? pixelFrames[currentFrameIndex - 1]?.[idx]
                        : 'transparent';
                      const showGhost = isClear && prevFrameColor && prevFrameColor !== 'transparent';

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleCellClick(idx)}
                          style={{
                            backgroundColor: !isClear
                              ? color
                              : showGhost
                              ? prevFrameColor
                              : '#1f2937',
                            opacity: showGhost ? 0.35 : 1
                          }}
                          className={`w-7 h-7 sm:w-9 sm:h-9 rounded-md hover:scale-110 transition-transform cursor-pointer border shadow-2xs ${
                            showGhost
                              ? 'border-dashed border-amber-300 ring-1 ring-amber-300/40'
                              : 'border-gray-800/80'
                          }`}
                          title={showGhost ? 'Fantasma do quadro anterior (Onion Skin)' : undefined}
                        />
                      );
                    })}
                  </div>

                  <div className="text-[11px] text-gray-400 text-center">
                    Toque no quadradinho com a cor selecionada abaixo para pintar o quadro atual!
                  </div>
                </div>

                {/* Right Side: Live Animation Preview & Controls */}
                <div className="space-y-4">
                  {/* Live Realtime Preview Card */}
                  <div className="p-4 bg-gradient-to-br from-purple-900 to-indigo-950 text-white rounded-3xl border border-purple-500/40 shadow-xl flex items-center gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center p-2 bg-gray-950 rounded-2xl border-2 border-purple-400 shadow-lg">
                      <AnimatedPixelSprite
                        frames={pixelFrames}
                        fps={pixelFps}
                        size="lg"
                      />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-black text-amber-300">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Preview da Animação em Tempo Real</span>
                      </div>
                      <p className="text-[11px] text-purple-200">
                        Veja seu pixel art se movimentando com a velocidade configurada abaixo.
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <FastForward className="w-3.5 h-3.5 text-purple-300" />
                        <span className="text-xs font-bold text-white">{pixelFps} Quadros/segundo (FPS)</span>
                      </div>
                    </div>
                  </div>

                  {/* FPS Velocity Slider */}
                  <div className="bg-purple-50/60 p-3.5 rounded-2xl border border-purple-200 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                      <span>Velocidade da Animação de Pixels:</span>
                      <span className="text-purple-700 font-black">{pixelFps} FPS</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={pixelFps}
                      onChange={(e) => setPixelFps(Number(e.target.value))}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-gray-500">
                      <span>1 FPS (Lento)</span>
                      <span>5 FPS (Normal)</span>
                      <span>10 FPS (Super Rápido)</span>
                    </div>
                  </div>

                  {/* Color Palette */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-2">
                      Paleta de Cores para Pintar:
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {COLOR_PALETTE.map((color) => {
                        const isClear = color === 'transparent';
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => {
                              sounds.playPop();
                              setActivePaletteColor(color);
                            }}
                            style={{ backgroundColor: isClear ? '#f3f4f6' : color }}
                            className={`w-9 h-9 rounded-2xl border-2 cursor-pointer flex items-center justify-center transition-all ${
                              activePaletteColor === color
                                ? 'scale-125 border-gray-900 shadow-md ring-2 ring-purple-400'
                                : 'border-gray-200 hover:scale-110'
                            }`}
                            title={isClear ? 'Borracha (Apagar)' : color}
                          >
                            {isClear && <Eraser className="w-4 h-4 text-gray-600" />}
                            {activePaletteColor === color && !isClear && (
                              <Check className="w-4 h-4 text-white drop-shadow-md" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Symbol Name Input */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Nome da sua Animação / Símbolo:
                    </label>
                    <input
                      type="text"
                      value={newSymbolName}
                      onChange={(e) => setNewSymbolName(e.target.value)}
                      placeholder="Ex: Coração Dourado Animado do João..."
                      className="w-full bg-purple-50/50 border border-purple-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>

                  {/* Action Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreateNewSymbol}
                    type="button"
                    className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-display font-black text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Sparkles className="w-5 h-5 text-yellow-300" />
                    <span>Salvar Animação de Pixels e Abrir no Palco</span>
                  </motion.button>
                </div>
              </div>
            </div>
          ) : (
            /* Builder Type 2: Emoji & Icon Picker */
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2">
                  Escolha um Emoji ou Ícone Fofo:
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {PRESET_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        sounds.playPop();
                        setSelectedEmoji(emoji);
                      }}
                      className={`text-3xl p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-center ${
                        selectedEmoji === emoji
                          ? 'bg-purple-100 border-purple-500 scale-110 shadow-sm'
                          : 'bg-white border-purple-100 hover:bg-purple-50'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Nome do Símbolo:
                </label>
                <input
                  type="text"
                  value={newSymbolName}
                  onChange={(e) => setNewSymbolName(e.target.value)}
                  placeholder="Ex: Coração de Squishy..."
                  className="w-full bg-purple-50/50 border border-purple-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateNewSymbol}
                type="button"
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-display font-black text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <span>Salvar Símbolo e Levar para o Animador</span>
              </motion.button>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* ABA 3: MEUS SÍMBOLOS & GALERIA COM CONTROLE DE MASCOTE          */}
      {/* ============================================================== */}
      {activeStudioTab === 'gallery' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border-3 border-amber-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">👑</span>
                <h3 className="font-display font-black text-xl text-gray-900">
                  Gerenciar Símbolos & Mascotes do Site
                </h3>
              </div>
              <p className="text-xs text-gray-500">
                Todos os símbolos criados. Você pode definir qualquer um como a Mascote Oficial ou editá-lo no Animador!
              </p>
            </div>

            {/* Master Toggle de Substituição */}
            <button
              onClick={handleToggleReplacementMaster}
              className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 cursor-pointer shadow-sm transition-all ${
                config.replaceLumininhaWithSymbol
                  ? 'bg-amber-500 text-white font-black'
                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
              }`}
            >
              <Repeat className="w-4 h-4" />
              <span>
                {config.replaceLumininhaWithSymbol ? '🟢 Substituição da Lumininha: ATIVA' : '⚪ Usando Lumininha Normal'}
              </span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {symbols.map((sym) => {
              const isCurrentMascot = config.replaceLumininhaWithSymbol && config.selectedMascotSymbolId === sym.id;

              return (
                <div
                  key={sym.id}
                  className={`p-4 rounded-3xl border-2 transition-all flex flex-col justify-between gap-3.5 relative overflow-hidden ${
                    isCurrentMascot
                      ? 'bg-gradient-to-b from-amber-50 to-orange-50/50 border-amber-400 shadow-md ring-2 ring-amber-300'
                      : 'bg-white border-amber-200 shadow-2xs hover:border-amber-300'
                  }`}
                >
                  {isCurrentMascot && (
                    <div className="absolute top-2 right-2 bg-amber-400 text-amber-950 font-black text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                      <Crown className="w-3 h-3" />
                      <span>Mascote do Site</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3.5">
                    {/* Visual */}
                    <div className="w-14 h-14 rounded-2xl bg-gray-900 border border-amber-200 shadow-md flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {sym.category === 'pixel' ? (
                        <AnimatedPixelSprite
                          frames={sym.pixelFrames}
                          matrix={sym.pixelMatrix}
                          fps={sym.pixelFps || 4}
                          size="sm"
                        />
                      ) : (
                        <span style={{ fontSize: '28px', color: sym.color }}>
                          {sym.charOrIcon}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="font-display font-black text-sm text-gray-900 truncate">
                        {sym.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-gray-500 mt-1">
                        <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-md">
                          {sym.animationEffect}
                        </span>
                        <span>•</span>
                        <span>{sym.category}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-amber-100 flex items-center justify-between gap-2 flex-wrap">
                    <button
                      onClick={() => handleSetAsLumininhaReplacement(sym)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                        isCurrentMascot
                          ? 'bg-green-600 text-white'
                          : 'bg-amber-100 hover:bg-amber-200 text-amber-950'
                      }`}
                    >
                      <Crown className="w-3.5 h-3.5" />
                      <span>{isCurrentMascot ? '✓ Mascote Ativa' : 'Virar Mascote'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleSymbolEffects(sym.id)}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        sym.effectsDisabled
                          ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                      title={sym.effectsDisabled ? 'Clique para reativar os efeitos deste símbolo' : 'Clique para desativar os efeitos deste símbolo'}
                    >
                      {sym.effectsDisabled ? '🛑 Sem Efeito' : '✨ Efeito Ativo'}
                    </button>

                    <button
                      type="button"
                      onClick={() => launchSymbolReaction(sym, currentUser)}
                      className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 transition-all cursor-pointer flex items-center gap-1"
                      title="Lançar este símbolo na tela agora (2 segundos com sua foto)"
                    >
                      <Send className="w-3 h-3 text-pink-500" />
                      <span>Lançar (2s)</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          sounds.playPop();
                          setSelectedSymbolForAnimationId(sym.id);
                          if (sym.customAnimation) {
                            setMovementType(sym.customAnimation.movementType);
                            setDeltaX(sym.customAnimation.deltaX);
                            setDeltaY(sym.customAnimation.deltaY);
                            setRotationAngle(sym.customAnimation.rotationAngle);
                            setScaleMin(sym.customAnimation.scaleMin);
                            setScaleMax(sym.customAnimation.scaleMax);
                            setDurationSeconds(sym.customAnimation.durationSeconds);
                            setGlowIntensity(sym.customAnimation.glowIntensity);
                            setEasing(sym.customAnimation.easing);
                            if (sym.customAnimation.trailEffect) {
                              setTrailEffect(sym.customAnimation.trailEffect);
                            }
                          }
                          setActiveStudioTab('animator');
                        }}
                        className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl cursor-pointer"
                        title="Abrir no Animador"
                      >
                        🎬 Animar
                      </button>

                      <button
                        onClick={() => handleDeleteSymbol(sym.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
