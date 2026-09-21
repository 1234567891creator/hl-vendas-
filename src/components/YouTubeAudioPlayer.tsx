import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Sparkles, 
  ChevronUp, 
  ChevronDown, 
  Radio, 
  Disc, 
  Headphones, 
  Check, 
  Link as LinkIcon,
  Crown,
  Trash2,
  Users,
  Music,
  X
} from 'lucide-react';
import { sounds } from '../utils/audioEffects';
import { LiveRadioBroadcast } from '../types';

interface YouTubeAudioPlayerProps {
  isMaxAdmin: boolean;
}

interface SavedAudioLink {
  id: string;
  name: string;
  urlOrId: string;
  youtubeId: string;
  addedAt: string;
}

const DEFAULT_BROADCAST: LiveRadioBroadcast = {
  isPlaying: false,
  youtubeId: 'jfKfPfyJRdk',
  title: 'Lofi Estudante Gilvan Sampaio',
  startedAt: Date.now(),
  updatedAt: Date.now(),
  playedBy: 'João Lucas (Adm Máximo)',
  listenersCount: 1,
};

export const YouTubeAudioPlayer: React.FC<YouTubeAudioPlayerProps> = ({ isMaxAdmin }) => {
  const [broadcast, setBroadcast] = useState<LiveRadioBroadcast>(DEFAULT_BROADCAST);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeYoutubeId, setActiveYoutubeId] = useState<string>('jfKfPfyJRdk');
  const [activeTitle, setActiveTitle] = useState<string>('Lofi Estudante Gilvan Sampaio');
  
  // Interaction & Volume state
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVisitorMinimized, setIsVisitorMinimized] = useState<boolean>(false);

  // Admin Drawer & Inputs
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isMinimizedMaster, setIsMinimizedMaster] = useState<boolean>(false);
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [linkTitleInput, setLinkTitleInput] = useState<string>('');
  const [urlSuccessFeedback, setUrlSuccessFeedback] = useState<boolean>(false);

  // Saved links collection stored in localStorage (para o Adm)
  const [savedLinks, setSavedLinks] = useState<SavedAudioLink[]>(() => {
    try {
      const saved = localStorage.getItem('hl_saved_music_links');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      {
        id: 'link-lofi-default',
        name: 'Lofi Estudante Gilvan',
        urlOrId: 'jfKfPfyJRdk',
        youtubeId: 'jfKfPfyJRdk',
        addedAt: 'Padrão'
      },
      {
        id: 'link-cute-default',
        name: 'Kawaii Chill Beat',
        urlOrId: '7NOSDKb0HlU',
        youtubeId: '7NOSDKb0HlU',
        addedAt: 'Padrão'
      },
      {
        id: 'link-brasil-lofi',
        name: 'MPB Lofi Suave',
        urlOrId: 'kJQP7kiw5Fk',
        youtubeId: 'kJQP7kiw5Fk',
        addedAt: 'Padrão'
      }
    ];
  });

  // Track browser user interaction (libera autoplay de áudio no navegador)
  useEffect(() => {
    const unlockAudio = () => {
      setHasInteracted(true);
    };

    window.addEventListener('click', unlockAudio, { passive: true });
    window.addEventListener('touchstart', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio, { passive: true });

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  // Sync with Server Broadcast via SSE and polling
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let isMounted = true;

    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/radio/status');
        if (res.ok) {
          const data: LiveRadioBroadcast = await res.json();
          if (isMounted) {
            setBroadcast(data);
            setActiveYoutubeId(data.youtubeId);
            setActiveTitle(data.title);
            setIsPlaying(data.isPlaying);
          }
        }
      } catch {}
    };

    fetchStatus();

    try {
      eventSource = new EventSource('/api/radio/stream');

      eventSource.addEventListener('init', (e: MessageEvent) => {
        try {
          const data: LiveRadioBroadcast = JSON.parse(e.data);
          if (isMounted) {
            setBroadcast(data);
            setActiveYoutubeId(data.youtubeId);
            setActiveTitle(data.title);
            setIsPlaying(data.isPlaying);
          }
        } catch {}
      });

      eventSource.addEventListener('broadcast', (e: MessageEvent) => {
        try {
          const data: LiveRadioBroadcast = JSON.parse(e.data);
          if (isMounted) {
            setBroadcast(data);
            setActiveYoutubeId(data.youtubeId);
            setActiveTitle(data.title);
            setIsPlaying(data.isPlaying);
            if (data.isPlaying) {
              sounds.playPop();
            }
          }
        } catch {}
      });

      eventSource.addEventListener('presence', (e: MessageEvent) => {
        try {
          const data: LiveRadioBroadcast = JSON.parse(e.data);
          if (isMounted) {
            setBroadcast((prev) => ({
              ...prev,
              listenersCount: data.listenersCount,
            }));
          }
        } catch {}
      });

      eventSource.addEventListener('update', (e: MessageEvent) => {
        try {
          const data: LiveRadioBroadcast = JSON.parse(e.data);
          if (isMounted) {
            setBroadcast(data);
            setActiveYoutubeId(data.youtubeId);
            setActiveTitle(data.title);
            setIsPlaying(data.isPlaying);
          }
        } catch {}
      });
    } catch {
      // Fallback
    }

    // Polling de backup a cada 6s caso a conexão SSE oscile
    const pollInterval = setInterval(fetchStatus, 6000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  const saveLinksToStorage = (links: SavedAudioLink[]) => {
    setSavedLinks(links);
    try {
      localStorage.setItem('hl_saved_music_links', JSON.stringify(links));
    } catch {}
  };

  // Broadcast to server (Adm Master Action)
  const broadcastToServer = async (playState: boolean, ytId: string, title: string) => {
    try {
      await fetch('/api/radio/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isPlaying: playState,
          youtubeId: ytId,
          title: title,
          playedBy: 'João Lucas (Adm Máximo)',
        }),
      });
    } catch (err) {
      console.error('Erro ao enviar transmissão:', err);
    }
  };

  // Extract YouTube ID from link
  const extractYouTubeId = (urlOrId: string): string | null => {
    const trimmed = urlOrId.trim();
    if (!trimmed) return null;

    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return trimmed;
    }

    const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/;
    const match = trimmed.match(regExp);
    return match ? match[1] : null;
  };

  const handlePlayFromLink = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const ytId = extractYouTubeId(customUrlInput);
    if (!ytId) {
      sounds.playPop();
      alert('Link do YouTube não reconhecido. Cole um link como: https://www.youtube.com/watch?v=... ou https://youtu.be/...');
      return;
    }

    sounds.playFanfare();
    const title = linkTitleInput.trim() || `Música (${ytId})`;
    setActiveYoutubeId(ytId);
    setActiveTitle(title);
    setIsPlaying(true);
    setUrlSuccessFeedback(true);

    // Salvar link se não existir
    const existing = savedLinks.find((l) => l.youtubeId === ytId);
    if (!existing) {
      const newEntry: SavedAudioLink = {
        id: `link-${Date.now()}`,
        name: title,
        urlOrId: customUrlInput.trim(),
        youtubeId: ytId,
        addedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      saveLinksToStorage([newEntry, ...savedLinks]);
    }

    // Transmitir para todos imediatamente via backend!
    broadcastToServer(true, ytId, title);

    setTimeout(() => setUrlSuccessFeedback(false), 3500);
    setCustomUrlInput('');
    setLinkTitleInput('');
  };

  const handleSelectSaved = (saved: SavedAudioLink) => {
    sounds.playPop();
    setActiveYoutubeId(saved.youtubeId);
    setActiveTitle(saved.name);
    setIsPlaying(true);
    broadcastToServer(true, saved.youtubeId, saved.name);
  };

  const handleDeleteSaved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playPop();
    const updated = savedLinks.filter((l) => l.id !== id);
    saveLinksToStorage(updated);
  };

  const toggleAdminPlay = () => {
    sounds.playPop();
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    broadcastToServer(nextState, activeYoutubeId, activeTitle);
  };

  // Se o visitante quiser mutar o som apenas no dispositivo dele
  const toggleUserMute = () => {
    sounds.playPop();
    setHasInteracted(true);
    setIsMuted(!isMuted);
  };

  // Áudio deve tocar se a transmissão estiver ativa, o usuário não tiver mutado e já interagiu (ou for o próprio adm)
  const shouldPlayAudio = isPlaying && !isMuted && activeYoutubeId && (hasInteracted || isMaxAdmin);

  return (
    <>
      {/* 
        STREAMING DE ÁUDIO OCULTO (YouTube Iframe Pure Audio)
        Sem imagem de vídeo, rodando em background sincronizado com a rádio da escola
      */}
      {shouldPlayAudio && (
        <div 
          className="fixed -left-[9999px] -top-[9999px] w-1 h-1 opacity-0 pointer-events-none overflow-hidden" 
          aria-hidden="true"
        >
          <iframe
            key={`${activeYoutubeId}-${isPlaying ? 'live' : 'paused'}`}
            width="200"
            height="200"
            src={`https://www.youtube-nocookie.com/embed/${activeYoutubeId}?autoplay=1&playsinline=1&controls=0&loop=1&playlist=${activeYoutubeId}&enablejsapi=1`}
            title="Rádio Gilvan Sampaio ao Vivo"
            allow="autoplay; encrypted-media"
            className="w-1 h-1"
          />
        </div>
      )}

      {/* =========================================================================
          PAINEL MASTER DO ADM MÁXIMO (TRANSMISSÃO GLOBAL PARA TODOS)
          Aparece ESTRITAMENTE E APENAS para o Administrador Máximo (João Lucas)
         ========================================================================= */}
      {isMaxAdmin && (
        <>
          {isMinimizedMaster ? (
            /* Versão minimizada compacta (bolha discreta no canto para o Adm reabrir quando quiser) */
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                sounds.playPop();
                setIsMinimizedMaster(false);
              }}
              className="fixed bottom-4 left-4 z-40 px-3.5 py-2 bg-gradient-to-r from-amber-500 via-purple-600 to-pink-500 text-white rounded-full shadow-2xl border-2 border-white flex items-center gap-2 text-xs font-bold cursor-pointer hover:shadow-amber-500/20"
              title="Abrir Painel de Transmissão da Rádio"
            >
              <Radio className={`w-3.5 h-3.5 ${isPlaying ? 'animate-pulse text-yellow-300' : ''}`} />
              <span>📻 Rádio do Adm ({isPlaying ? 'Ao Vivo' : 'Pausada'})</span>
            </motion.button>
          ) : (
            <div className="fixed bottom-4 left-4 z-40 max-w-sm w-[calc(100vw-2rem)] sm:w-88">
              <motion.div
                layout
                className="bg-white/95 backdrop-blur-md border-2 border-amber-300 rounded-3xl shadow-2xl overflow-hidden"
              >
                {/* Header com indicador de Transmissão ao Vivo Global */}
                <div className="px-3.5 py-2.5 flex items-center justify-between gap-2 bg-gradient-to-r from-amber-50 via-white to-purple-50">
                  <div 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-2 cursor-pointer select-none flex-1 min-w-0"
                  >
                    {/* Ícone de Disco Giratório com Brilho */}
                    <div className="relative flex-shrink-0">
                      <div 
                        className={`w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 via-purple-600 to-pink-500 text-white flex items-center justify-center shadow-md ${isPlaying ? 'animate-spin' : ''}`}
                        style={{ animationDuration: '4s' }}
                      >
                        <Disc className="w-5 h-5 text-white" />
                      </div>
                      {isPlaying && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-ping"></span>
                      )}
                    </div>

                    {/* Informações da Transmissão */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] bg-red-600 text-white font-black px-1.5 py-0.2 rounded-full flex items-center gap-1 animate-pulse">
                          <Radio className="w-2.5 h-2.5" />
                          <span>AO VIVO NO SITE</span>
                        </span>
                        <span className="text-[9px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                          <Users className="w-2.5 h-2.5 text-amber-700" />
                          <span>{broadcast.listenersCount} {broadcast.listenersCount === 1 ? 'ouvinte' : 'ouvintes'}</span>
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-gray-900 truncate leading-tight mt-0.5" title={activeTitle}>
                        🎵 {activeTitle}
                      </h4>
                      <p className="text-[10px] text-purple-700 font-medium truncate">
                        {isPlaying ? 'Transmitindo para todos os visitantes' : 'Transmissão pausada'}
                      </p>
                    </div>
                  </div>

                  {/* Controles de Play / Pause, Expansão e Minimizar */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Barras do Equalizador animado */}
                    {isPlaying && (
                      <div className="flex items-end gap-0.5 h-4 px-0.5">
                        <span className="w-1 bg-amber-500 rounded-full animate-pulse" style={{ height: '70%', animationDuration: '0.6s' }}></span>
                        <span className="w-1 bg-purple-500 rounded-full animate-pulse" style={{ height: '100%', animationDuration: '0.4s' }}></span>
                        <span className="w-1 bg-pink-500 rounded-full animate-pulse" style={{ height: '40%', animationDuration: '0.8s' }}></span>
                      </div>
                    )}

                    {/* Botão Master Play / Pause */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={toggleAdminPlay}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md cursor-pointer transition-colors ${
                        isPlaying 
                          ? 'bg-amber-500 hover:bg-amber-600 ring-2 ring-amber-300' 
                          : 'bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700'
                      }`}
                      title={isPlaying ? 'Pausar música para todos' : 'Tocar música para todos os visitantes'}
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                    </motion.button>

                    {/* Botão Expandir / Recolher */}
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playPop();
                        setIsExpanded(!isExpanded);
                      }}
                      className="w-7 h-7 rounded-full text-gray-500 hover:text-purple-700 hover:bg-purple-50 flex items-center justify-center cursor-pointer transition-colors"
                      title={isExpanded ? 'Recolher Painel' : 'Expandir Rádio'}
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </button>

                    {/* Botão Minimizar para bolha flutuante */}
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playPop();
                        setIsMinimizedMaster(true);
                      }}
                      className="w-7 h-7 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center cursor-pointer transition-colors"
                      title="Minimizar Rádio"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Gaveta Expandida: Controle de Links e Músicas do Adm */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-amber-200 bg-amber-50/40 p-3.5 space-y-3"
                    >
                      {/* Banner Explicativo */}
                      <div className="bg-gradient-to-r from-red-50 to-amber-100 border border-amber-200 text-amber-950 text-[11px] p-2.5 rounded-2xl flex items-start gap-2">
                        <Radio className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="leading-tight">
                          <span className="font-extrabold text-red-700">Rádio Global do Adm:</span> Quando você der Play aqui, **todos os alunos e visitantes** ouvindo no site escutarão a mesma música em tempo real!
                        </div>
                      </div>

                      {/* Formulário para colar qualquer Link do YouTube */}
                      <form onSubmit={handlePlayFromLink} className="space-y-2">
                        <div>
                          <label className="text-[11px] font-bold text-gray-700 block mb-1">
                            🔗 Cole qualquer link do YouTube:
                          </label>
                          <input
                            type="text"
                            value={customUrlInput}
                            onChange={(e) => setCustomUrlInput(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=... ou https://youtu.be/..."
                            className="w-full bg-white border border-amber-300 rounded-xl px-2.5 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-gray-700 block mb-1">
                            🏷️ Nome da Música para Todos Verem:
                          </label>
                          <input
                            type="text"
                            value={linkTitleInput}
                            onChange={(e) => setLinkTitleInput(e.target.value)}
                            placeholder="Ex: Trilha Oficial do Gilvan Sampaio..."
                            className="w-full bg-white border border-amber-300 rounded-xl px-2.5 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2 bg-gradient-to-r from-red-500 via-amber-500 to-purple-600 hover:from-red-600 hover:to-purple-700 text-white rounded-xl text-xs font-black shadow-md cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Radio className="w-3.5 h-3.5" />
                          <span>Transmitir esta Música para Todos</span>
                        </button>

                        {urlSuccessFeedback && (
                          <div className="text-[10px] text-green-700 font-bold flex items-center gap-1 bg-green-50 p-1.5 rounded-lg border border-green-200">
                            <Check className="w-3.5 h-3.5" />
                            <span>Música transmitida com sucesso para toda a escola!</span>
                          </div>
                        )}
                      </form>

                      {/* Biblioteca de Músicas Rápidas do Adm */}
                      {savedLinks.length > 0 && (
                        <div className="space-y-1.5 pt-2 border-t border-amber-200/70">
                          <div className="flex items-center justify-between text-[11px] font-bold text-gray-700">
                            <span>Suas Músicas Salvas ({savedLinks.length}):</span>
                          </div>

                          <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                            {savedLinks.map((item) => {
                              const isCurrent = activeYoutubeId === item.youtubeId;
                              return (
                                <div
                                  key={item.id}
                                  onClick={() => handleSelectSaved(item)}
                                  className={`w-full px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between gap-2 cursor-pointer transition-all ${
                                    isCurrent && isPlaying
                                      ? 'bg-gradient-to-r from-red-500 to-amber-500 text-white font-bold shadow-xs'
                                      : 'bg-white hover:bg-amber-100 text-gray-800 border border-amber-200'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <Disc className={`w-3.5 h-3.5 flex-shrink-0 ${isCurrent && isPlaying ? 'animate-spin' : 'text-gray-400'}`} />
                                    <span className="truncate">{item.name}</span>
                                  </div>

                                  <div className="flex items-center gap-1.5 flex-shrink-0">
                                    {isCurrent && isPlaying ? (
                                      <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded-full">AO VIVO</span>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={(e) => handleDeleteSaved(item.id, e)}
                                        className="p-1 rounded-md text-gray-400 hover:text-red-600 transition-colors"
                                        title="Remover da lista"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          )}
        </>
      )}

      {/* =========================================================================
          VISITANTE / ALUNO: NENHUMA GAVETA OU PAINEL ADMINISTRATIVO É MOSTRADO!
          Apenas um discreto botãozinho de mudo no canto caso deseje silenciar.
         ========================================================================= */}
      {!isMaxAdmin && isPlaying && (
        <div className="fixed bottom-4 right-4 z-30">
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            type="button"
            onClick={toggleUserMute}
            className={`px-3 py-1.5 rounded-full shadow-lg border text-xs font-bold flex items-center gap-1.5 cursor-pointer backdrop-blur-md transition-all ${
              isMuted 
                ? 'bg-red-50/90 border-red-300 text-red-700 hover:bg-red-100' 
                : 'bg-white/90 border-purple-300 text-purple-800 hover:bg-purple-50'
            }`}
            title={isMuted ? 'Desmutar rádio ao vivo da escola' : 'Silenciar rádio no meu aparelho'}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-red-600" />
                <span>Rádio Mutada</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-purple-600" />
                <span className="truncate max-w-[120px] font-medium">{activeTitle}</span>
              </>
            )}
          </motion.button>
        </div>
      )}
    </>
  );
};
