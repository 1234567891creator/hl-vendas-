import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Sun, 
  Snowflake, 
  CloudRain, 
  Smile, 
  ShoppingBag, 
  MapPin, 
  Clock, 
  Flame, 
  MessageSquare,
  Volume2,
  Trash2,
  RotateCcw,
  Video,
  Play,
  Pause,
  ExternalLink,
  Link2,
  X,
  Smartphone,
  VolumeX
} from 'lucide-react';
import { ChatMessage, LumininhaState, WeatherType, Product, UserProfile, SiteSymbolAnimationConfig, CustomSymbol } from '../types';
import { sounds } from '../utils/audioEffects';
import { AnimatedPixelSprite } from './AnimatedPixelSprite';

interface LumininhaWidgetProps {
  products: Product[];
  currentUser: UserProfile | null;
  onOpenProduct: (productId: string) => void;
  symbolConfig?: SiteSymbolAnimationConfig;
  customSymbols?: CustomSymbol[];
  temperature?: number;
  weatherType?: WeatherType;
  youtubeUrl?: string;
  onNavigateToAdminMascot?: () => void;
}

export const LumininhaWidget: React.FC<LumininhaWidgetProps> = ({
  products,
  currentUser,
  onOpenProduct,
  symbolConfig,
  customSymbols = [],
  temperature: propTemperature,
  weatherType: propWeatherType,
  youtubeUrl: propYoutubeUrl,
  onNavigateToAdminMascot,
}) => {
  const isMaxAdmin = currentUser?.email?.toLowerCase() === 'joaolucasgp1234@gmail.com';

  const activeReplacementSymbol = symbolConfig?.replaceLumininhaWithSymbol
    ? customSymbols.find((s) => s.id === symbolConfig.selectedMascotSymbolId) || customSymbols[0]
    : null;

  // Climate / Emotional State (Synced with Admin Panel)
  const [localTemperature, setLocalTemperature] = useState<number>(24);
  const [localWeatherType, setLocalWeatherType] = useState<WeatherType>('bom');

  const temperature = propTemperature !== undefined ? propTemperature : localTemperature;
  const weatherType = propWeatherType !== undefined ? propWeatherType : localWeatherType;

  // YouTube Video System on Lumininha (Link personalizável + Mouse Hover + Toque com Dedo / Mobile)
  const [localYoutubeUrl, setLocalYoutubeUrl] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('hl_lumininha_youtube_link');
      if (saved) return saved;
    } catch {}
    return 'https://www.youtube.com/watch?v=jfKfPfyJRdk'; // Lofi / squishy Gilvan Sampaio
  });

  const youtubeUrl = propYoutubeUrl || localYoutubeUrl;
  const [isVideoHovered, setIsVideoHovered] = useState<boolean>(false);
  const [isTouchActive, setIsTouchActive] = useState<boolean>(false);
  const [showVideoInIcon, setShowVideoInIcon] = useState<boolean>(true);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [inputUrl, setInputUrl] = useState<string>('');

  const extractYouTubeId = (url: string): string => {
    if (!url) return 'jfKfPfyJRdk';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|shorts\/|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : 'jfKfPfyJRdk';
  };

  const activeVideoId = extractYouTubeId(youtubeUrl);

  const handleSaveVideoUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    sounds.playSuccess();
    setLocalYoutubeUrl(inputUrl.trim());
    try {
      localStorage.setItem('hl_lumininha_youtube_link', inputUrl.trim());
    } catch {}
    setIsConfigModalOpen(false);
  };

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-init-1',
      sender: 'lumininha',
      senderName: activeReplacementSymbol ? `${activeReplacementSymbol.name} AI ✨` : 'Lumininha AI ⚡',
      text: activeReplacementSymbol
        ? `Oii! Eu sou ${activeReplacementSymbol.name}, mascote oficial do HL Vendas! 🐾✨ Estou aqui para te ajudar a escolher os squishies mais macios e lápis fofos para retirar na porta do C.E.P.M.G Gilvan Sampaio toda segunda e terça às 15:30! O que você procura hoje?`
        : `Oii! Eu sou a Lumininha, mascote do HL Vendas! 🐾✨ Estou aqui para te ajudar a escolher os squishies mais macios e lápis fofos para retirar na porta do C.E.P.M.G Gilvan Sampaio toda segunda e terça às 15:30! O que você procura hoje?`,
      timestamp: 'Agora',
      emotion: 'feliz',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Derive Lumininha's emotional expressions from current climate
  const getEmotionDetails = () => {
    if (weatherType === 'calor' || temperature >= 30) {
      return {
        mood: 'calor',
        face: '🥵',
        accessory: '🪭',
        title: 'Com Calorão!',
        reactionNote: 'Abanando um leque fofo!',
        bgColor: 'from-amber-400 via-orange-400 to-rose-400',
        borderColor: 'border-orange-400',
        textColor: 'text-orange-900',
        animation: 'animate-pulse',
      };
    }
    if (weatherType === 'frio' || temperature <= 16) {
      return {
        mood: 'frio',
        face: '🥶',
        accessory: '🧣',
        title: 'Com Friozinho!',
        reactionNote: 'Tremendo fofinha com cachecol!',
        bgColor: 'from-blue-400 via-cyan-400 to-indigo-400',
        borderColor: 'border-blue-400',
        textColor: 'text-blue-950',
        animation: 'animate-bounce',
      };
    }
    if (weatherType === 'chuva') {
      return {
        mood: 'chuva',
        face: '🌧️',
        accessory: '☔',
        title: 'Zangadinha Fofa!',
        reactionNote: 'Segurando meu guarda-chuvinha!',
        bgColor: 'from-indigo-400 via-purple-400 to-pink-400',
        borderColor: 'border-purple-400',
        textColor: 'text-purple-950',
        animation: 'animate-pulse',
      };
    }
    // Default: Bom / Feliz
    return {
      mood: 'bom',
      face: '🥰',
      accessory: '✨',
      title: 'Radiante & Feliz!',
      reactionNote: 'Pulando de alegria com os novos squishies!',
      bgColor: 'from-pink-400 via-rose-400 to-yellow-300',
      borderColor: 'border-pink-400',
      textColor: 'text-pink-950',
      animation: 'animate-bounce',
    };
  };

  const emotion = getEmotionDetails();

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || loading) return;

    sounds.playPop();
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      senderName: currentUser?.name || 'Você',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const catalogSummary = products.map((p) => `${p.name} (R$ ${p.price.toFixed(2)})`).join(', ');

      const res = await fetch('/api/lumininha/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          emotion: emotion.mood,
          temperature,
          isMaxAdmin,
          catalogContext: catalogSummary,
        }),
      });

      const data = await res.json();
      sounds.playSparkle();

      const aiMsg: ChatMessage = {
        id: `lum-${Date.now()}`,
        sender: 'lumininha',
        senderName: activeReplacementSymbol ? `${activeReplacementSymbol.name} AI ✨` : 'Lumininha AI ⚡',
        text: data.reply || 'Adorei conversar com você! Vamos conferir as fofuras?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        emotion: emotion.mood,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const fallbackMsg: ChatMessage = {
        id: `lum-fb-${Date.now()}`,
        sender: 'lumininha',
        senderName: activeReplacementSymbol ? `${activeReplacementSymbol.name} AI ✨` : 'Lumininha AI ⚡',
        text: activeReplacementSymbol
          ? `Oii! Aqui é ${activeReplacementSymbol.name}! Nossas entregas são toda segunda e terça às 15:30 na porta do C.E.P.M.G Gilvan Sampaio! 🐾✨`
          : 'Oii! Estou atenta aos pedidos do Gilvan Sampaio! Nossas entregas são segunda e terça às 15:30 na porta da escola! 🐾✨',
        timestamp: 'Agora',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearMessages = () => {
    sounds.playPop();
    setMessages([
      {
        id: `msg-reset-${Date.now()}`,
        sender: 'lumininha',
        senderName: 'Lumininha AI ⚡',
        text: `Conversa reiniciada! 🐾✨ O que você gostaria de saber sobre as fofuras do HL Vendas e as entregas no Gilvan Sampaio?`,
        timestamp: 'Agora',
        emotion: 'feliz',
      },
    ]);
  };

  const quickPrompts = [
    'Quais squishies têm para segunda-feira?',
    'Como pego meu pedido no Gilvan Sampaio?',
    'Tem algum cupom de desconto hoje?',
    'Qual caneta ou lápis você mais recomenda?',
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner with Expressive Face or Custom Symbol Replacement and Climate Controller */}
      <div className={`bg-gradient-to-r ${emotion.bgColor} rounded-3xl p-5 sm:p-6 text-white shadow-lg border-4 ${emotion.borderColor} transition-all duration-500`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          {/* Avatar & Mood display or Replaced Symbol Avatar */}
          <div className="flex items-center gap-4 text-center sm:text-left">
            <motion.div
              key={activeReplacementSymbol ? activeReplacementSymbol.id : emotion.mood}
              initial={{ scale: 0.8, rotate: -10 }}
              animate={
                activeReplacementSymbol
                  ? activeReplacementSymbol.customAnimation
                    ? {
                        x: [-activeReplacementSymbol.customAnimation.deltaX, activeReplacementSymbol.customAnimation.deltaX, -activeReplacementSymbol.customAnimation.deltaX],
                        y: [-activeReplacementSymbol.customAnimation.deltaY, activeReplacementSymbol.customAnimation.deltaY, -activeReplacementSymbol.customAnimation.deltaY],
                        rotate: [0, activeReplacementSymbol.customAnimation.rotationAngle, -activeReplacementSymbol.customAnimation.rotationAngle, 0],
                        scale: [activeReplacementSymbol.customAnimation.scaleMin, activeReplacementSymbol.customAnimation.scaleMax, activeReplacementSymbol.customAnimation.scaleMin],
                      }
                    : activeReplacementSymbol.animationEffect === 'spin'
                    ? { rotate: 360 }
                    : activeReplacementSymbol.animationEffect === 'bounce'
                    ? { y: [-8, 8, -8], scale: [0.95, 1.05, 0.95] }
                    : activeReplacementSymbol.animationEffect === 'pulse'
                    ? { scale: [0.9, 1.2, 0.9] }
                    : activeReplacementSymbol.animationEffect === 'heartbeat'
                    ? { scale: [1, 1.2, 1, 1.25, 1] }
                    : activeReplacementSymbol.animationEffect === 'sway'
                    ? { rotate: [-18, 18, -18] }
                    : { scale: 1, rotate: [0, 5, -5, 0] }
                  : { scale: 1, rotate: 0 }
              }
              transition={{
                duration: activeReplacementSymbol?.customAnimation
                  ? activeReplacementSymbol.customAnimation.durationSeconds
                  : activeReplacementSymbol ? 2 : 0.4,
                repeat: activeReplacementSymbol ? Infinity : 0,
                ease: 'easeInOut'
              }}
              style={
                activeReplacementSymbol?.customAnimation?.glowIntensity
                  ? { filter: `drop-shadow(0 0 ${activeReplacementSymbol.customAnimation.glowIntensity}px ${activeReplacementSymbol.glowColor || activeReplacementSymbol.color})` }
                  : undefined
              }
              onMouseEnter={() => setIsVideoHovered(true)}
              onMouseLeave={() => setIsVideoHovered(false)}
              onTouchStart={() => {
                sounds.playPop();
                setIsTouchActive((prev) => !prev);
              }}
              onClick={() => {
                sounds.playPop();
                setIsTouchActive((prev) => !prev);
              }}
              className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-black shadow-xl flex items-center justify-center text-4xl sm:text-5xl border-4 border-white flex-shrink-0 overflow-hidden cursor-pointer group select-none"
              title="Vídeo no Ícone da IA (Sem som) - Toque para expandir ou pausar"
            >
              {/* VIDEO DIRECTLY INSIDE THE AI ICON - TOTALLY MUTED (SEM SOM) */}
              {showVideoInIcon && activeVideoId ? (
                <div className="absolute inset-0 w-full h-full overflow-hidden bg-black flex items-center justify-center">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${activeVideoId}&playsinline=1&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&fs=0`}
                    title="Vídeo no Ícone da IA (Sem som)"
                    className="w-[220%] h-[220%] -ml-[60%] -mt-[60%] object-cover pointer-events-none"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    tabIndex={-1}
                  />
                  {/* Floating badge: Sem Som 🔇 */}
                  <div className="absolute bottom-1 right-1 bg-black/80 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 pointer-events-none z-10 border border-white/20">
                    <VolumeX className="w-2.5 h-2.5 text-rose-300" />
                    <span>Sem som</span>
                  </div>
                  {/* Top Live Video Badge */}
                  <div className="absolute top-1 left-1 bg-red-600/90 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider flex items-center gap-1 pointer-events-none z-10">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    <span>AO VIVO</span>
                  </div>
                </div>
              ) : (
                /* Fallback / Toggle: Emoji or Custom Pixel Sprite */
                <div className="w-full h-full bg-white/95 flex items-center justify-center">
                  {activeReplacementSymbol ? (
                    activeReplacementSymbol.category === 'pixel' ? (
                      <AnimatedPixelSprite
                        frames={activeReplacementSymbol.pixelFrames}
                        matrix={activeReplacementSymbol.pixelMatrix}
                        fps={activeReplacementSymbol.pixelFps || 4}
                        size="lg"
                        className="rounded-xl"
                      />
                    ) : (
                      <span style={{ color: activeReplacementSymbol.color }}>
                        {activeReplacementSymbol.charOrIcon}
                      </span>
                    )
                  ) : (
                    <span>{emotion.face}</span>
                  )}
                  <span className="absolute -bottom-1 -right-1 text-2xl animate-spin">
                    {activeReplacementSymbol ? '✨' : emotion.accessory}
                  </span>
                </div>
              )}

              {/* YouTube Video Mini Badge */}
              <div className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow-md group-hover:scale-125 transition-transform z-10" title="Vídeo no Ícone conectado sem som!">
                <Video className="w-2.5 h-2.5 fill-white" />
              </div>
            </motion.div>

            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="bg-white/30 backdrop-blur-xs text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                  {activeReplacementSymbol ? `Mascote do João: ${activeReplacementSymbol.name}` : 'Mascote Oficial HL Vendas'}
                </span>
                <span className="bg-white/90 text-gray-900 font-bold text-xs px-2.5 py-0.5 rounded-full shadow-xs">
                  {temperature}°C
                </span>

                {/* Toggle Video inside Icon */}
                <button
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    setShowVideoInIcon((prev) => !prev);
                  }}
                  className={`text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs transition-all cursor-pointer ${
                    showVideoInIcon 
                      ? 'bg-amber-300 hover:bg-amber-200 text-amber-950' 
                      : 'bg-white/90 hover:bg-white text-gray-800'
                  }`}
                  title="Alternar entre o vídeo e o emoji no ícone da IA"
                >
                  <Video className="w-3 h-3 text-red-600" />
                  <span>{showVideoInIcon ? '🎬 Vídeo no Ícone Ativo' : '🐾 Exibir Mascote'}</span>
                </button>

                {/* Interactive YouTube Trigger Badge */}
                <button
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    setIsTouchActive((prev) => !prev);
                  }}
                  className={`text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs transition-all cursor-pointer ${
                    isTouchActive || isVideoHovered 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'bg-white/90 hover:bg-white text-red-600'
                  }`}
                  title="Expandir reprodutor de vídeo"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{isTouchActive || isVideoHovered ? 'Player Aberto 🎬' : 'Expandir Vídeo ▶'}</span>
                </button>

                {/* Silent badge */}
                <span className="bg-black/40 text-yellow-200 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                  <VolumeX className="w-3 h-3" />
                  <span>Sem som</span>
                </span>

                {isMaxAdmin && onNavigateToAdminMascot && (
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playSparkle();
                      onNavigateToAdminMascot();
                    }}
                    className="text-[11px] font-bold bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 rounded-full flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                    title="Abrir aba de controle de emoções, clima e vídeo no Painel Admin"
                  >
                    <span>⚙️ Painel Mascote</span>
                  </button>
                )}
              </div>

              <h2 className="font-display font-black text-2xl sm:text-3xl mt-1 tracking-tight text-white drop-shadow-sm">
                {activeReplacementSymbol ? `${activeReplacementSymbol.name} AI` : `Lumininha AI: ${emotion.title}`}
              </h2>

              <p className="text-xs sm:text-sm text-white/90 font-medium max-w-lg mt-0.5">
                {activeReplacementSymbol
                  ? `Símbolo animado exclusivo substituindo a Lumininha como mascote oficial do site com movimento de ${activeReplacementSymbol.animationEffect}!`
                  : `${emotion.reactionNote} • Especialista em vendas e encomendas para a porta do Gilvan Sampaio!`}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-yellow-200 mt-1 font-semibold">
                <span>👆 Passe o mouse ou toque com o dedo na Lumininha para rodar o vídeo!</span>
              </div>
            </div>
          </div>

          {/* Quick Info & School Delivery Badge */}
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 border border-white/30 space-y-1.5 text-center md:text-right w-full md:w-auto">
            <span className="text-[10px] uppercase font-black tracking-wider text-yellow-200 block">
              📍 Ponto de Encontro
            </span>
            <p className="text-xs font-bold text-white leading-tight">
              Portão do C.E.P.M.G Gilvan Sampaio
            </p>
            <p className="text-[11px] text-white/80 font-medium">
              Segunda & Terça às 15:30
            </p>
          </div>
        </div>

        {/* ============================================================== */}
        {/* YOUTUBE VIDEO ON LUMININHA (ATIVADO POR HOVER OU TOQUE / CELULAR) */}
        {/* ============================================================== */}
        <AnimatePresence>
          {(isVideoHovered || isTouchActive) && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="mt-4 pt-4 border-t border-white/20 overflow-hidden"
            >
              <div className="bg-gray-950/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 border-2 border-amber-300 shadow-2xl text-white space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-red-600 text-white flex items-center justify-center animate-pulse">
                      <Video className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="font-display font-black text-sm text-yellow-300 flex items-center gap-1.5">
                        <span>Vídeo do YouTube Conectado à Lumininha</span>
                        <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.2 rounded-sm font-bold uppercase tracking-wider">
                          Ao Vivo
                        </span>
                      </h4>
                      <p className="text-[11px] text-gray-300">
                        Totalmente compatível com celular e computador! Toque ou passe o mouse para curtir.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {isMaxAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playPop();
                          if (onNavigateToAdminMascot) {
                            onNavigateToAdminMascot();
                          } else {
                            setInputUrl(youtubeUrl);
                            setIsConfigModalOpen(true);
                          }
                        }}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs rounded-xl flex items-center gap-1 transition-all cursor-pointer"
                        title="Configurar vídeo no Painel Admin"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>Configurar Vídeo no Painel</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playPop();
                        setIsTouchActive(false);
                        setIsVideoHovered(false);
                      }}
                      className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl transition-colors cursor-pointer"
                      title="Fechar vídeo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 16:9 Responsive Video Frame optimized for all mobile screens (Mudo / Sem Som) */}
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-inner border border-gray-800">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?autoplay=1&mute=1&rel=0&playsinline=1`}
                    title="Vídeo YouTube Lumininha (Sem som)"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full border-0"
                  />
                  {/* Floating Mute Indicator */}
                  <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/20 pointer-events-none">
                    <VolumeX className="w-3 h-3 text-rose-300" />
                    <span>Sem som</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-gray-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5 text-pink-400" />
                    <span>No celular: Toque no mascote para abrir/fechar</span>
                  </span>
                  <a
                    href={`https://www.youtube.com/watch?v=${activeVideoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <span>Abrir no YouTube oficial</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chat Box */}
      <div className="bg-white rounded-3xl border-3 border-pink-200 p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-pink-100">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-pink-500" />
            <h3 className="font-display font-black text-base text-gray-900">
              Conversar com {activeReplacementSymbol ? activeReplacementSymbol.name : 'a Lumininha'} (Ajuda de Vendas & Dúvidas)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearMessages}
              title="Limpar mensagens da conversa"
              className="flex items-center gap-1 text-[11px] font-bold text-gray-500 hover:text-red-500 bg-pink-50 hover:bg-red-50 border border-pink-200 px-2.5 py-1 rounded-xl transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar Mensagens</span>
            </button>

            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Online
            </span>
          </div>
        </div>

        {/* Message Thread */}
        <div className="space-y-3 min-h-[260px] max-h-[420px] overflow-y-auto pr-1">
          {messages.map((m) => {
            const isMe = m.sender === 'user';
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-pink-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs overflow-hidden">
                    {activeReplacementSymbol ? (
                      activeReplacementSymbol.category === 'pixel' ? (
                        <AnimatedPixelSprite
                          frames={activeReplacementSymbol.pixelFrames}
                          matrix={activeReplacementSymbol.pixelMatrix}
                          fps={activeReplacementSymbol.pixelFps || 4}
                          size="xs"
                        />
                      ) : (
                        <span>{activeReplacementSymbol.charOrIcon}</span>
                      )
                    ) : (
                      <span>⚡</span>
                    )}
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl p-3 sm:p-3.5 text-xs sm:text-sm font-medium shadow-xs ${
                    isMe
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-tr-xs'
                      : 'bg-pink-50/70 border border-pink-200 text-gray-800 rounded-tl-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 text-[10px] opacity-75 mb-1">
                    <span className="font-bold">
                      {m.sender === 'lumininha' && activeReplacementSymbol ? `${activeReplacementSymbol.name} AI ✨` : m.senderName}
                    </span>
                    <span>{m.timestamp}</span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                </div>
              </motion.div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <div className="w-8 h-8 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-bold animate-spin overflow-hidden">
                {activeReplacementSymbol ? (
                  activeReplacementSymbol.category === 'pixel' ? '🎨' : activeReplacementSymbol.charOrIcon
                ) : (
                  '⚡'
                )}
              </div>
              <span>{activeReplacementSymbol ? activeReplacementSymbol.name : 'Lumininha'} está pensando na melhor dica de squishy...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-pink-100">
          <span className="text-[11px] font-bold text-gray-400 whitespace-nowrap">Dúvidas rápidas:</span>
          {quickPrompts.map((q, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleSendMessage(q)}
              className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs px-3 py-1 rounded-xl whitespace-nowrap border border-purple-200 transition-colors"
            >
              {q}
            </motion.button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 pt-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Pergunte sobre produtos, retirada no Gilvan Sampaio, descontos..."
            className="flex-1 bg-pink-50/50 border-2 border-pink-200 rounded-2xl px-4 py-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!inputText.trim() || loading}
            className="p-3 sm:px-5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-2xl font-bold shadow-md disabled:opacity-50 transition-all flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Enviar</span>
          </motion.button>
        </form>
      </div>

      {/* Modal de Configuração do Link do YouTube na Lumininha */}
      <AnimatePresence>
        {isConfigModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-4 border-amber-300 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-red-600 text-white">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-lg text-gray-900">
                      Vídeo do YouTube na Lumininha
                    </h3>
                    <p className="text-xs text-gray-500">
                      Cole qualquer link do YouTube (Vídeos normais ou Shorts)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveVideoUrl} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    URL ou Link de Compartilhamento do YouTube:
                  </label>
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... ou youtu.be/..."
                    required
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono"
                  />
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    Exemplo: https://www.youtube.com/watch?v=jfKfPfyJRdk
                  </span>
                </div>

                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <span>✨ Como funciona na tela:</span>
                  </div>
                  <p>
                    • No computador: Ao <strong>passar o mouse</strong> sobre o mascote, o vídeo abre automaticamente!
                  </p>
                  <p>
                    • No celular: Ao <strong>tocar com o dedo</strong> no mascote ou no botão &ldquo;Vídeo YouTube ▶&rdquo;, o reprodutor responsivo é ativado sem quebrar a tela.
                  </p>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsConfigModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-black bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-700 hover:to-amber-600 text-white rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Video className="w-4 h-4" />
                    <span>Salvar Vídeo</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
