import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  X, 
  ShoppingBag, 
  Bot, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  Flame
} from 'lucide-react';
import { StatusStory, UserProfile, Product } from '../types';
import { sounds } from '../utils/audioEffects';

interface StatusStoriesProps {
  stories: StatusStory[];
  currentUser: UserProfile | null;
  onLikeStory: (storyId: string) => void;
  onAddStory: (story: Omit<StatusStory, 'id' | 'timestamp' | 'likes'>) => void;
  onOpenProduct: (productId: string) => void;
  products: Product[];
}

export const StatusStories: React.FC<StatusStoriesProps> = ({
  stories,
  currentUser,
  onLikeStory,
  onAddStory,
  onOpenProduct,
  products,
}) => {
  // Only keep AI stories as explicitly requested: "quero que tire os status do joao lucas e da helena e so deixe da ia"
  const aiStories = stories.filter(
    (s) => s.isLumininhaAuto || s.authorId === 'lumininha-ai' || s.authorName?.toLowerCase().includes('lumininha')
  );
  const activeStoriesList = aiStories.length > 0 ? aiStories : stories;

  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [nextLumininhaMinutes, setNextLumininhaMinutes] = useState(18);
  const [nextLumininhaSeconds, setNextLumininhaSeconds] = useState(42);
  const [isGeneratingAuto, setIsGeneratingAuto] = useState(false);

  // 20-minute countdown simulation for Lumininha's automatic video status
  useEffect(() => {
    const interval = setInterval(() => {
      setNextLumininhaSeconds((prevSec) => {
        if (prevSec > 0) return prevSec - 1;
        setNextLumininhaMinutes((prevMin) => (prevMin > 0 ? prevMin - 1 : 19));
        return 59;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Story playback timer
  useEffect(() => {
    if (activeStoryIndex === null) {
      setProgress(0);
      return;
    }

    // Play sound when opening or advancing story
    if (soundEnabled) {
      sounds.playPop();
    }

    const duration = 5000; // 5 seconds per story
    const step = 50;
    const increment = (step / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (activeStoryIndex < activeStoriesList.length - 1) {
            setActiveStoryIndex(activeStoryIndex + 1);
            return 0;
          } else {
            setActiveStoryIndex(null);
            return 0;
          }
        }
        return prev + increment;
      });
    }, step);

    return () => clearInterval(timer);
  }, [activeStoryIndex, activeStoriesList.length, soundEnabled]);

  const triggerLumininhaAutoStatus = async () => {
    setIsGeneratingAuto(true);
    sounds.playSparkle();

    const randomProduct = products[Math.floor(Math.random() * products.length)];
    let captionText = `✨ Status Lumininha: ${randomProduct.name} acabou de chegar para as entregas no Gilvan Sampaio! Reserve antes que acabe às 15:30!`;

    try {
      const res = await fetch('/api/lumininha/marketing-gen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productTarget: randomProduct.name }),
      });
      const data = await res.json();
      if (data.caption) captionText = data.caption;
    } catch {}

    const newAutoStory: Omit<StatusStory, 'id' | 'timestamp' | 'likes'> = {
      authorId: 'lumininha-ai',
      authorName: 'Lumininha AI ⚡',
      authorAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=LumininhaSparkle&backgroundColor=ffdf70',
      authorRole: 'Inteligência Oficial HL',
      mediaType: 'video_card',
      mediaUrl: randomProduct.imageUrl,
      caption: captionText,
      productLinkedId: randomProduct.id,
      isLumininhaAuto: true,
      hasSound: true,
      audioTone: 'sparkle',
    };

    onAddStory(newAutoStory);
    setIsGeneratingAuto(false);
    setNextLumininhaMinutes(20);
    setNextLumininhaSeconds(0);
    sounds.playSuccess();
  };

  const currentStory = activeStoryIndex !== null ? activeStoriesList[activeStoryIndex] : null;

  return (
    <div className="bg-white rounded-3xl border-3 border-pink-200 p-4 sm:p-5 shadow-sm space-y-4">
      {/* Top Title & Lumininha 20-min Countdown */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-pink-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
            <Bot className="w-4 h-4 text-amber-600 animate-pulse" />
          </div>
          <div>
            <h2 className="font-display font-black text-base sm:text-lg text-gray-900 leading-tight">
              Status & Stories da Lumininha AI ⚡
            </h2>
            <p className="text-xs text-gray-500">
              Novidades e ofertas exclusivas geradas pela inteligência artificial oficial
            </p>
          </div>
        </div>

        {/* 20min Lumininha Auto Trigger & Counter */}
        <div className="flex items-center gap-2">
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-2.5 py-1 text-[11px] text-amber-900 font-semibold flex items-center gap-1.5 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>
              Próximo vídeo da Lumininha: <strong>{nextLumininhaMinutes}m {nextLumininhaSeconds < 10 ? `0${nextLumininhaSeconds}` : nextLumininhaSeconds}s</strong>
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={triggerLumininhaAutoStatus}
            disabled={isGeneratingAuto}
            className="bg-gradient-to-r from-amber-400 to-orange-400 text-amber-950 font-display font-bold text-xs px-3 py-1 rounded-xl shadow-xs hover:shadow-md flex items-center gap-1 cursor-pointer"
            title="A cada 20 min a Lumininha posta automaticamente; clique para gerar um agora!"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>{isGeneratingAuto ? 'Criando...' : 'Gerar Status com IA'}</span>
          </motion.button>
        </div>
      </div>

      {/* Stories Avatars Carousel - Only AI Stories */}
      <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-2">
        {/* Stories List (Exclusively AI) */}
        {activeStoriesList.map((story, idx) => (
          <motion.div
            key={story.id}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              sounds.playSparkle();
              setActiveStoryIndex(idx);
            }}
            className="flex flex-col items-center gap-1 cursor-pointer flex-shrink-0 relative group"
          >
            <div className="p-0.5 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-pink-500 animate-pulse">
              <div className="p-0.5 bg-white rounded-full">
                <img
                  src={story.authorAvatar}
                  alt={story.authorName}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover group-hover:opacity-90 transition-opacity"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Micro Badge for Lumininha */}
            <span className="absolute top-0 right-0 bg-yellow-400 text-yellow-950 text-[9px] font-black px-1.5 py-0.2 rounded-full border border-white shadow-2xs">
              ⚡ IA
            </span>

            <span className="text-[11px] font-bold text-gray-700 truncate max-w-[70px]">
              {story.authorName}
            </span>
            <span className="text-[9px] text-gray-400">{story.timestamp}</span>
          </motion.div>
        ))}
      </div>

      {/* Fullscreen 2D Story Viewer Modal */}
      <AnimatePresence>
        {activeStoryIndex !== null && currentStory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="relative w-full max-w-sm aspect-[9/16] max-h-[90vh] bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-pink-400 flex flex-col justify-between"
            >
              {/* Top Progress Bar */}
              <div className="absolute top-3 left-3 right-3 z-30 flex gap-1.5">
                {activeStoriesList.map((_, i) => (
                  <div key={i} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-75"
                      style={{
                        width:
                          i === activeStoryIndex
                            ? `${progress}%`
                            : i < activeStoryIndex
                            ? '100%'
                            : '0%',
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Story Author Header */}
              <div className="relative z-30 pt-6 px-3 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <img
                    src={currentStory.authorAvatar}
                    alt={currentStory.authorName}
                    className="w-9 h-9 rounded-full border-2 border-white object-cover"
                  />
                  <div>
                    <h4 className="font-display font-bold text-xs text-white leading-tight">
                      {currentStory.authorName}
                    </h4>
                    <p className="text-[10px] text-white/80">
                      {currentStory.authorRole} • {currentStory.timestamp}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60"
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setActiveStoryIndex(null)}
                    className="p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Background Media */}
              <div className="absolute inset-0 z-10">
                <img
                  src={currentStory.mediaUrl}
                  alt={currentStory.caption}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
              </div>

              {/* Nav Click Zones (Left / Right) */}
              <div
                onClick={() => {
                  if (activeStoryIndex > 0) setActiveStoryIndex(activeStoryIndex - 1);
                }}
                className="absolute inset-y-0 left-0 w-1/3 z-20 cursor-pointer"
              />
              <div
                onClick={() => {
                  if (activeStoryIndex < stories.length - 1) setActiveStoryIndex(activeStoryIndex + 1);
                  else setActiveStoryIndex(null);
                }}
                className="absolute inset-y-0 right-0 w-1/3 z-20 cursor-pointer"
              />

              {/* Bottom Caption, Linked Product & Like Action */}
              <div className="relative z-30 p-4 space-y-3">
                {currentStory.isLumininhaAuto && (
                  <div className="bg-yellow-400/90 text-yellow-950 text-[11px] font-black px-2.5 py-1 rounded-xl flex items-center gap-1.5 shadow-sm backdrop-blur-xs">
                    <Bot className="w-4 h-4 text-pink-600" />
                    <span>Vídeo Dinâmico & Som Gerado pela Lumininha AI</span>
                  </div>
                )}

                <p className="text-white text-xs sm:text-sm font-medium leading-relaxed drop-shadow-md">
                  {currentStory.caption}
                </p>

                <div className="flex items-center gap-2 pt-1">
                  {currentStory.productLinkedId && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        sounds.playPop();
                        const pId = currentStory.productLinkedId!;
                        setActiveStoryIndex(null);
                        onOpenProduct(pId);
                      }}
                      className="flex-1 py-2.5 px-3 bg-pink-500 hover:bg-pink-600 text-white rounded-2xl font-display font-bold text-xs shadow-lg flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Pedir Este Produto</span>
                    </motion.button>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                    onClick={() => {
                      sounds.playPop();
                      onLikeStory(currentStory.id);
                    }}
                    className="p-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white flex items-center gap-1 backdrop-blur-xs font-bold text-xs"
                  >
                    <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
                    <span>{currentStory.likes}</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
