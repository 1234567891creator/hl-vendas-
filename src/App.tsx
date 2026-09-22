/**
 * HL Vendas (Vendas da Helena)
 * Delivery Point: Porta do C.E.P.M.G Gilvan Sampaio - Toda Segunda e Terça às 15:30
 * Super Admin: joaolucasgp1234@gmail.com
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Clock, 
  Sparkles, 
  ShoppingBag, 
  Heart, 
  Share2, 
  Smartphone,
  CheckCircle2,
  Package,
  Calendar,
  ArrowRight,
  Flame,
  Edit3
} from 'lucide-react';

import { 
  Product, 
  Order, 
  OrderItem, 
  UserProfile, 
  Coupon, 
  StoreConfig, 
  DeviceInfo, 
  StatusStory,
  SchoolReview,
  SchoolEvent,
  CustomSymbol,
  SiteSymbolAnimationConfig,
  WeatherType,
  ServerNode,
  InterServerPacket
} from './types';

import { 
  INITIAL_PRODUCTS, 
  INITIAL_USERS, 
  INITIAL_COUPONS, 
  INITIAL_STORE_CONFIG, 
  INITIAL_STORIES,
  INITIAL_DEVICES,
  INITIAL_REVIEWS,
  INITIAL_SCHOOL_EVENTS,
  INITIAL_CUSTOM_SYMBOLS
} from './data/initialData';

import { Navbar } from './components/Navbar';
import { CatalogSection } from './components/CatalogSection';
import { ProductPreviewModal } from './components/ProductPreviewModal';
import { OrderModal } from './components/OrderModal';
import { StatusStories } from './components/StatusStories';
import { TopSellersLeaderboard } from './components/TopSellersLeaderboard';
import { LumininhaWidget } from './components/LumininhaWidget';
import { AdminPanel } from './components/AdminPanel';
import { ProfileLoginModal } from './components/ProfileLoginModal';
import { LightShowOverlay } from './components/LightShowOverlay';
import { EventsSection } from './components/EventsSection';
import { LoginScreen } from './components/LoginScreen';
import { AvatarEditModal } from './components/AvatarEditModal';
import { StoreEngagementMetrics } from './components/StoreEngagementMetrics';
import { EditHeroPillModal } from './components/EditHeroPillModal';
import { CommunityProfilesChat } from './components/CommunityProfilesChat';
import { JoaoLucasSymbolStudio } from './components/JoaoLucasSymbolStudio';
import { LiveSymbolFloatingOverlay } from './components/LiveSymbolFloatingOverlay';
import { YouTubeAudioPlayer } from './components/YouTubeAudioPlayer';
import { SymbolReactionLaunchBar } from './components/SymbolReactionLaunchBar';
import { SiteBackgroundVideo, extractYouTubeId } from './components/SiteBackgroundVideo';
import { GlobalAnnouncementOverlay } from './components/GlobalAnnouncementOverlay';

import { detectCurrentDevice } from './utils/deviceDetector';
import { sounds } from './utils/audioEffects';
import { getApiUrl, fetchWithFallback } from './utils/apiConfig';

/**
 * Sintetizador Web Audio API para notificações sonoras personalizadas
 * Diferencia claramente alertas solenes de anúncios globais e eventos especiais de mensagens comuns
 */
export const playSoundEffect = (
  type: 'global_announcement' | 'special_event' | 'urgent_alert' | 'subtle_notify' = 'global_announcement'
) => {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = (window as any).__hl_audio_ctx || new AudioCtx();
    (window as any).__hl_audio_ctx = ctx;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    if (type === 'global_announcement') {
      // Fanfarra dourada e nobre para anúncios globais solenes (Dó5 -> Mi5 -> Sol5 -> Dó6 + Harmônico reluzente)
      const notes = [
        { freq: 523.25, start: 0.00, dur: 0.18, vol: 0.22, osc: 'triangle' as OscillatorType },
        { freq: 659.25, start: 0.12, dur: 0.20, vol: 0.24, osc: 'triangle' as OscillatorType },
        { freq: 783.99, start: 0.24, dur: 0.22, vol: 0.26, osc: 'sine' as OscillatorType },
        { freq: 1046.50, start: 0.38, dur: 0.55, vol: 0.28, osc: 'sine' as OscillatorType },
        { freq: 2093.00, start: 0.40, dur: 0.45, vol: 0.10, osc: 'sine' as OscillatorType },
      ];

      notes.forEach(({ freq, start, dur, vol, osc }) => {
        const oscNode = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscNode.type = osc;
        oscNode.frequency.setValueAtTime(freq, now + start);

        gainNode.gain.setValueAtTime(0.0001, now + start);
        gainNode.gain.linearRampToValueAtTime(vol, now + start + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);

        oscNode.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscNode.start(now + start);
        oscNode.stop(now + start + dur + 0.05);
      });
    } else if (type === 'special_event') {
      // Cascata cintilante rápida e festiva para eventos especiais e escolares
      const chord = [659.25, 880.00, 1174.66, 1760.00];
      chord.forEach((freq, idx) => {
        const oscNode = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscNode.type = 'sine';
        oscNode.frequency.setValueAtTime(freq, now + idx * 0.05);

        gainNode.gain.setValueAtTime(0.0001, now + idx * 0.05);
        gainNode.gain.linearRampToValueAtTime(0.18, now + idx * 0.05 + 0.015);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.22);

        oscNode.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscNode.start(now + idx * 0.05);
        oscNode.stop(now + idx * 0.05 + 0.25);
      });
    } else if (type === 'urgent_alert') {
      // Pulso duplo de alerta urgente
      [0.00, 0.15].forEach((startTime) => {
        const oscNode = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscNode.type = 'sawtooth';
        oscNode.frequency.setValueAtTime(880, now + startTime);
        oscNode.frequency.exponentialRampToValueAtTime(440, now + startTime + 0.12);

        gainNode.gain.setValueAtTime(0.12, now + startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + startTime + 0.12);

        oscNode.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscNode.start(now + startTime);
        oscNode.stop(now + startTime + 0.13);
      });
    } else {
      // subtle_notify: Som suave e discreto para mensagens comuns
      const oscNode = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscNode.type = 'sine';
      oscNode.frequency.setValueAtTime(440, now);
      oscNode.frequency.exponentialRampToValueAtTime(660, now + 0.07);

      gainNode.gain.setValueAtTime(0.10, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

      oscNode.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscNode.start(now);
      oscNode.stop(now + 0.08);
    }
  } catch {
    // Protegido contra bloqueios de autoplay do navegador
  }
};

if (typeof window !== 'undefined') {
  (window as any).playSoundEffect = playSoundEffect;
}

export default function App() {
  // Navigation & View State (Tabs)
  const [currentTab, setCurrentTab] = useState<'catalog' | 'stories' | 'events' | 'leaderboard' | 'lumininha' | 'admin' | 'profiles' | 'symbols-studio'>('catalog');

  // Core Data State with safe parsing and fallbacks
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('hl_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('hl_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  const [users, setUsers] = useState<UserProfile[]>(() => {
    try {
      const deletedIds: string[] = JSON.parse(localStorage.getItem('hl_deleted_user_ids') || '[]');
      const saved = localStorage.getItem('hl_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
            .filter((u: UserProfile) => !deletedIds.includes(u.id))
            .map((u: UserProfile) =>
              u.email.toLowerCase() === 'joaolucasgp1234@gmail.com'
                ? { ...u, password: 'hlvendas2026', isMaxAdmin: true }
                : u
            );
        }
      }
      return INITIAL_USERS.filter((u) => !deletedIds.includes(u.id));
    } catch {}
    return INITIAL_USERS;
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem('hl_coupons');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return INITIAL_COUPONS;
  });

  const [storeConfig, setStoreConfig] = useState<StoreConfig>(() => {
    try {
      const saved = localStorage.getItem('hl_config') || localStorage.getItem('hl_store_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            ...INITIAL_STORE_CONFIG,
            ...parsed,
            siteYoutubeBgActive: parsed.siteYoutubeBgActive === true,
            siteYoutubeBgUrl: typeof parsed.siteYoutubeBgUrl === 'string' ? parsed.siteYoutubeBgUrl.trim() : '',
            siteYoutubeBgOpacity: typeof parsed.siteYoutubeBgOpacity === 'number' ? parsed.siteYoutubeBgOpacity : 45,
            globalAnnouncement: parsed.globalAnnouncement !== undefined ? parsed.globalAnnouncement : INITIAL_STORE_CONFIG.globalAnnouncement,
            globalAnnouncementActive: parsed.globalAnnouncementActive !== undefined ? parsed.globalAnnouncementActive : INITIAL_STORE_CONFIG.globalAnnouncementActive,
            globalAnnouncementSenderName: parsed.globalAnnouncementSenderName || INITIAL_STORE_CONFIG.globalAnnouncementSenderName,
            globalAnnouncementSenderAvatar: parsed.globalAnnouncementSenderAvatar || INITIAL_STORE_CONFIG.globalAnnouncementSenderAvatar,
          };
        }
      }
    } catch {}
    return {
      ...INITIAL_STORE_CONFIG,
      siteYoutubeBgActive: false,
      siteYoutubeBgUrl: '',
      siteYoutubeBgOpacity: 45,
    };
  });

  const handleUpdateStoreConfig = async (newConfig: StoreConfig) => {
    setStoreConfig(newConfig);
    try {
      localStorage.setItem('hl_config', JSON.stringify(newConfig));
      localStorage.setItem('hl_store_config', JSON.stringify(newConfig));
    } catch {}
    try {
      await fetchWithFallback('/api/global/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: newConfig }),
      });
    } catch {}
  };

  const [stories, setStories] = useState<StatusStory[]>(() => {
    try {
      const saved = localStorage.getItem('hl_stories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_STORIES;
  });

  const [loggedDevices, setLoggedDevices] = useState<DeviceInfo[]>(() => {
    try {
      const saved = localStorage.getItem('hl_devices');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_DEVICES;
  });

  // User & Authentication State - Only restore if this browser previously logged in
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('hl_current_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.id) {
          return parsed;
        }
      }
    } catch {}
    // Do NOT automatically log in strangers or new visitors as Joao Lucas!
    return null;
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Avatar Modal State
  const [avatarModalUser, setAvatarModalUser] = useState<UserProfile | null>(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  // Edit Hero Pill Modal State (Exclusivo Adm Máximo João Lucas)
  const [isEditPillModalOpen, setIsEditPillModalOpen] = useState(false);
  const isMaxAdmin = currentUser?.email?.toLowerCase() === 'joaolucasgp1234@gmail.com' || currentUser?.isMaxAdmin;

  // Multi-server topology & inter-server communication state
  const [servers, setServers] = useState<ServerNode[]>([]);
  const [recentPackets, setRecentPackets] = useState<InterServerPacket[]>([]);

  const handleOpenAvatarModal = (user: UserProfile) => {
    sounds.playPop();
    setAvatarModalUser(user);
    setIsAvatarModalOpen(true);
  };

  // Comprehensive Global Avatar Update: propaga instantaneamente para users, currentUser, stories, reviews, chat comunitário e avisos
  const handleSaveAvatar = (userId: string, newAvatarUrl: string) => {
    // 1. Atualiza lista de usuários
    const targetUser = users.find((u) => u.id === userId);
    const updatedUsers = users.map((u) => (u.id === userId ? { ...u, avatar: newAvatarUrl } : u));
    setUsers(updatedUsers);
    localStorage.setItem('hl_users', JSON.stringify(updatedUsers));

    // 2. Atualiza currentUser se for ele
    if (currentUser?.id === userId || (targetUser && currentUser?.email?.toLowerCase() === targetUser.email?.toLowerCase())) {
      const updatedCurrent = { ...currentUser, avatar: newAvatarUrl };
      setCurrentUser(updatedCurrent);
      localStorage.setItem('hl_current_user', JSON.stringify(updatedCurrent));
    }

    // 3. Atualiza Stories do autor
    setStories((prev) => {
      const next = prev.map((s) => (s.authorId === userId ? { ...s, authorAvatar: newAvatarUrl } : s));
      localStorage.setItem('hl_stories', JSON.stringify(next));
      return next;
    });

    // 4. Atualiza Avaliações de Produtos / Escola
    setReviews((prev) => {
      const next = prev.map((r) => (r.authorId === userId ? { ...r, authorAvatar: newAvatarUrl } : r));
      localStorage.setItem('hl_reviews', JSON.stringify(next));
      return next;
    });

    // 5. Atualiza mensagens no chat comunitário
    try {
      const savedMsgs = localStorage.getItem('hl_community_chat_messages');
      if (savedMsgs) {
        const msgs = JSON.parse(savedMsgs);
        if (Array.isArray(msgs)) {
          const nextMsgs = msgs.map((m: any) =>
            m.senderId === userId ? { ...m, senderAvatar: newAvatarUrl } : m
          );
          localStorage.setItem('hl_community_chat_messages', JSON.stringify(nextMsgs));
        }
      }
    } catch {}

    // 6. Atualiza foto do anúncio global se o autor for este usuário
    setStoreConfig((prev) => {
      if (
        (targetUser && prev.globalAnnouncementSenderName === targetUser.name) ||
        (targetUser?.isMaxAdmin && prev.globalAnnouncementSenderRole?.includes('Adm'))
      ) {
        const next = { ...prev, globalAnnouncementSenderAvatar: newAvatarUrl };
        localStorage.setItem('hl_config', JSON.stringify(next));
        return next;
      }
      return prev;
    });

    // 7. Notifica backend para sincronizar foto do perfil permanentemente para todos os servidores
    try {
      fetchWithFallback('/api/global/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: { id: userId, avatar: newAvatarUrl } }),
      }).catch(() => {});
    } catch {}
  };

  // Comprehensive User Deletion: remove de todos os locais e sincroniza no servidor permanentemente
  const handleDeleteUser = async (userId: string) => {
    // Proteger apenas a conta raiz original do João Lucas
    const target = users.find((u) => u.id === userId);
    if (target && target.email?.toLowerCase() === 'joaolucasgp1234@gmail.com' && target.id === 'user-joao-lucas') {
      return;
    }

    sounds.playPop();

    // Registra na lista negra local de excluídos para nunca mais ressurgir
    try {
      const existingDeleted: string[] = JSON.parse(localStorage.getItem('hl_deleted_user_ids') || '[]');
      if (!existingDeleted.includes(userId)) {
        existingDeleted.push(userId);
        localStorage.setItem('hl_deleted_user_ids', JSON.stringify(existingDeleted));
      }
    } catch {}

    // 1. Remove da lista de usuários
    const updatedUsers = users.filter((u) => u.id !== userId);
    setUsers(updatedUsers);
    try {
      localStorage.setItem('hl_users', JSON.stringify(updatedUsers));
    } catch {}

    // 2. Se o usuário excluído for o logado atualmente, desloga com segurança
    if (currentUser?.id === userId) {
      setCurrentUser(null);
      try {
        localStorage.removeItem('hl_current_user');
      } catch {}
    }

    // 3. Remove stories criados pelo usuário excluído
    setStories((prev) => {
      const next = prev.filter((s) => s.authorId !== userId);
      try {
        localStorage.setItem('hl_stories', JSON.stringify(next));
      } catch {}
      return next;
    });

    // 4. Remove avaliações do usuário excluído
    setReviews((prev) => {
      const next = prev.filter((r) => r.authorId !== userId);
      try {
        localStorage.setItem('hl_reviews', JSON.stringify(next));
      } catch {}
      return next;
    });

    // 5. Limpa mensagens do chat comunitário
    try {
      const savedMsgs = localStorage.getItem('hl_community_chat_messages');
      if (savedMsgs) {
        const msgs = JSON.parse(savedMsgs);
        if (Array.isArray(msgs)) {
          const nextMsgs = msgs.filter((m: any) => m.senderId !== userId);
          localStorage.setItem('hl_community_chat_messages', JSON.stringify(nextMsgs));
        }
      }
    } catch {}

    // 6. Remove de seguidos
    setFollowedUserIds((prev) => prev.filter((id) => id !== userId));

    // 7. Notifica o backend para remover permanentemente e transmitir para todos os clientes
    try {
      await fetchWithFallback('/api/global/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
    } catch {}
  };

  // Comprehensive Profile Info Update: propaga dados e nomes atualizados e sincroniza no servidor
  const handleUpdateUserProfile = async (updatedUser: UserProfile) => {
    sounds.playSparkle();
    const updatedUsers = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    setUsers(updatedUsers);
    localStorage.setItem('hl_users', JSON.stringify(updatedUsers));

    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
      localStorage.setItem('hl_current_user', JSON.stringify(updatedUser));
    }

    // Atualiza stories
    setStories((prev) => {
      const next = prev.map((s) =>
        s.authorId === updatedUser.id
          ? { ...s, authorAvatar: updatedUser.avatar, authorName: updatedUser.name }
          : s
      );
      localStorage.setItem('hl_stories', JSON.stringify(next));
      return next;
    });

    // Atualiza avaliações
    setReviews((prev) => {
      const next = prev.map((r) =>
        r.authorId === updatedUser.id
          ? { ...r, authorAvatar: updatedUser.avatar, authorName: updatedUser.name }
          : r
      );
      localStorage.setItem('hl_reviews', JSON.stringify(next));
      return next;
    });

    // Atualiza mensagens no chat comunitário
    try {
      const savedMsgs = localStorage.getItem('hl_community_chat_messages');
      if (savedMsgs) {
        const msgs = JSON.parse(savedMsgs);
        if (Array.isArray(msgs)) {
          const nextMsgs = msgs.map((m: any) =>
            m.senderId === updatedUser.id
              ? { ...m, senderAvatar: updatedUser.avatar, senderName: updatedUser.name }
              : m
          );
          localStorage.setItem('hl_community_chat_messages', JSON.stringify(nextMsgs));
        }
      }
    } catch {}

    // Notifica backend para sincronizar usuário globalmente
    try {
      await fetchWithFallback('/api/global/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: updatedUser }),
      });
    } catch {}
  };

  // Cart & Order State
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);

  // Followed Sellers State
  const [followedUserIds, setFollowedUserIds] = useState<string[]>(['user-helena-1']);

  // Light Show Trigger
  const [lightShowMode, setLightShowMode] = useState<'confetti' | 'rainbow' | 'flash_sale' | 'neon_disco' | null>(null);

  // School Events State (Duram ininterruptamente até o administrador que colocou parar)
  const [schoolEvents, setSchoolEvents] = useState<SchoolEvent[]>(() => {
    try {
      const saved = localStorage.getItem('hl_school_events');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_SCHOOL_EVENTS;
  });

  // School Reviews State
  const [reviews, setReviews] = useState<SchoolReview[]>(() => {
    try {
      const saved = localStorage.getItem('hl_reviews');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_REVIEWS;
  });

  // Custom Symbols State (Construídos pelo João Lucas / Presets)
  const [customSymbols, setCustomSymbols] = useState<CustomSymbol[]>(() => {
    try {
      const saved = localStorage.getItem('hl_custom_symbols');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Desativar rolagem passiva automática para respeitar o pedido do usuário
          return parsed.map((s: CustomSymbol) => ({ ...s, isActiveOnSite: false }));
        }
      }
    } catch {}
    return INITIAL_CUSTOM_SYMBOLS.map((s) => ({ ...s, isActiveOnSite: false }));
  });

  // Site Symbol Animation Config (Controlado pelo João Lucas)
  const [symbolConfig, setSymbolConfig] = useState<SiteSymbolAnimationConfig>(() => {
    try {
      const saved = localStorage.getItem('hl_symbol_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            ...parsed,
            enabled: false // Desativar por padrão para não rolar sem ninguém ativar
          };
        }
      }
    } catch {}
    return {
      enabled: false,
      activeEffect: 'float',
      speed: 'normal',
      density: 14,
      customSymbols: []
    };
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('hl_school_events', JSON.stringify(schoolEvents));
  }, [schoolEvents]);

  useEffect(() => {
    localStorage.setItem('hl_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('hl_custom_symbols', JSON.stringify(customSymbols));
  }, [customSymbols]);

  useEffect(() => {
    localStorage.setItem('hl_symbol_config', JSON.stringify(symbolConfig));
  }, [symbolConfig]);

  // Dark Mode State with LocalStorage persistence
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('hl_theme_dark');
      if (saved !== null) return saved === 'true';
    } catch {}
    return false;
  });

  useEffect(() => {
    try {
      localStorage.setItem('hl_theme_dark', isDarkMode ? 'true' : 'false');
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {}
  }, [isDarkMode]);

  // Mascot Climate, Emotion & YouTube State (Managed via Admin Panel)
  const [weatherType, setWeatherType] = useState<WeatherType>(() => {
    try {
      const saved = localStorage.getItem('hl_lumininha_weather');
      if (saved) return saved as WeatherType;
    } catch {}
    return 'bom';
  });

  const [temperature, setTemperature] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('hl_lumininha_temp');
      if (saved) return Number(saved);
    } catch {}
    return 24;
  });

  const [youtubeUrl, setYoutubeUrl] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('hl_lumininha_youtube_link');
      if (saved) return saved;
    } catch {}
    return 'https://www.youtube.com/watch?v=jfKfPfyJRdk';
  });

  useEffect(() => {
    try {
      localStorage.setItem('hl_lumininha_weather', weatherType);
    } catch {}
  }, [weatherType]);

  useEffect(() => {
    try {
      localStorage.setItem('hl_lumininha_temp', String(temperature));
    } catch {}
  }, [temperature]);

  useEffect(() => {
    try {
      localStorage.setItem('hl_lumininha_youtube_link', youtubeUrl);
    } catch {}
  }, [youtubeUrl]);

  const activeReplacementSymbol = symbolConfig?.replaceLumininhaWithSymbol
    ? customSymbols.find((s) => s.id === symbolConfig.selectedMascotSymbolId) || customSymbols[0]
    : null;

  // Real-time Global Store Likes & Product Likes State
  const [storeLikes, setStoreLikes] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('hl_store_likes_zeroed');
      if (saved !== null) return Math.max(0, Number(saved));
    } catch {}
    return 0;
  });

  const [productLikes, setProductLikes] = useState<Record<string, number>>({});

  const handleToggleStoreLike = async (isLiked: boolean) => {
    sounds.playPop();
    const change = isLiked ? 1 : -1;
    setStoreLikes((prev) => {
      const updated = Math.max(0, prev + change);
      localStorage.setItem('hl_store_likes_zeroed', updated.toString());
      return updated;
    });
    try {
      await fetchWithFallback('/api/global/likes/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ change }),
      });
    } catch {}
  };

  // Motor Global de Sincronização em Tempo Real (SSE + Polling de segurança e Fallback Cloud Run)
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let pollInterval: any = null;
    let broadcastChannel: BroadcastChannel | null = null;

    try {
      broadcastChannel = new BroadcastChannel('hl_vendas_sync_channel');
      broadcastChannel.onmessage = (event) => {
        if (event.data?.type === 'USER_DELETED' && event.data?.userId) {
          const uid = event.data.userId;
          setUsers((prev) => prev.filter((u) => u.id !== uid));
        } else if (event.data?.type === 'ANNOUNCEMENT' && event.data?.announcement) {
          const ann = event.data.announcement;
          setStoreConfig((prev) => ({
            ...prev,
            globalAnnouncement: ann.message,
            globalAnnouncementActive: true,
            globalAnnouncementSenderName: ann.senderName || prev.globalAnnouncementSenderName,
            globalAnnouncementSenderAvatar: ann.senderPhoto || prev.globalAnnouncementSenderAvatar,
            globalAnnouncementCreatedAt: ann.createdAt || Date.now(),
          }));
          playSoundEffect('global_announcement');
        }
      };
    } catch {}

    const syncWithServer = async () => {
      try {
        const res = await fetchWithFallback('/api/global/state');
        if (!res.ok) return;
        const data = await res.json();
        if (data && typeof data === 'object') {
          // 1. Tratamento rigoroso de contas excluídas
          const deletedIds: string[] = Array.isArray(data.deletedUserIds) ? data.deletedUserIds : [];
          if (deletedIds.length > 0) {
            const localDeleted: string[] = JSON.parse(localStorage.getItem('hl_deleted_user_ids') || '[]');
            const mergedDeleted = Array.from(new Set([...localDeleted, ...deletedIds]));
            localStorage.setItem('hl_deleted_user_ids', JSON.stringify(mergedDeleted));

            setUsers((prev) => {
              const clean = prev.filter((u) => !mergedDeleted.includes(u.id));
              localStorage.setItem('hl_users', JSON.stringify(clean));
              return clean;
            });

            setCurrentUser((curr) => {
              if (curr && mergedDeleted.includes(curr.id)) {
                localStorage.removeItem('hl_current_user');
                return null;
              }
              return curr;
            });
          }

          // 2. Tratamento do Anúncio Global Oficial ativo
          if (data.activeAnnouncement && data.activeAnnouncement.message) {
            setStoreConfig((prev) => {
              const next = {
                ...prev,
                globalAnnouncement: data.activeAnnouncement.message,
                globalAnnouncementActive: true,
                globalAnnouncementSenderName: data.activeAnnouncement.senderName || prev.globalAnnouncementSenderName || 'João Lucas (Adm Máximo)',
                globalAnnouncementSenderAvatar: data.activeAnnouncement.senderPhoto || prev.globalAnnouncementSenderAvatar,
                globalAnnouncementCreatedAt: data.activeAnnouncement.createdAt || Date.now(),
              };
              try {
                localStorage.setItem('hl_config', JSON.stringify(next));
                localStorage.setItem('hl_store_config', JSON.stringify(next));
              } catch {}
              return next;
            });
          }

          if (Array.isArray(data.schoolEvents)) setSchoolEvents(data.schoolEvents);
          if (Array.isArray(data.stories)) setStories(data.stories);
          if (typeof data.storeLikes === 'number') setStoreLikes(data.storeLikes);
          if (data.productLikes && typeof data.productLikes === 'object') setProductLikes(data.productLikes);
          if (data.storeConfig && typeof data.storeConfig === 'object') {
            setStoreConfig((prev) => ({ ...prev, ...data.storeConfig }));
          }
          if (Array.isArray(data.users)) {
            const localDeleted: string[] = JSON.parse(localStorage.getItem('hl_deleted_user_ids') || '[]');
            const validUsers = data.users.filter((u: any) => !localDeleted.includes(u.id));
            setUsers(validUsers);
            localStorage.setItem('hl_users', JSON.stringify(validUsers));
          }
          if (Array.isArray(data.servers)) setServers(data.servers);
          if (Array.isArray(data.interServerPackets)) setRecentPackets(data.interServerPackets);
        }
      } catch {}
    };

    syncWithServer();
    pollInterval = setInterval(syncWithServer, 3500);

    // Mecanismo de Reconexão Exponencial para EventSource
    let isComponentMounted = true;
    let reconnectTimeout: any = null;
    let retryDelay = 1000;
    const maxRetryDelay = 30000;

    const connectEventSource = () => {
      if (!isComponentMounted) return;

      try {
        if (eventSource) {
          try {
            eventSource.close();
          } catch {}
          eventSource = null;
        }

        const sseUrl = getApiUrl('/api/radio/stream');
        eventSource = new EventSource(sseUrl);

        eventSource.onopen = () => {
          // Conexão reestabelecida com sucesso: reinicia a janela de recuo exponencial
          retryDelay = 1000;
          // Sincroniza dados imediatamente para recuperar qualquer evento emitido durante a desconexão
          syncWithServer();
        };

        eventSource.onerror = () => {
          if (!isComponentMounted) return;

          // Fecha com segurança a conexão que caiu
          if (eventSource) {
            try {
              eventSource.close();
            } catch {}
            eventSource = null;
          }

          // Contingência de resiliência: faz sync via HTTP fallback enquanto tenta reconectar o stream
          syncWithServer();

          // Calcula próximo tempo de reconexão exponencial com jitter
          const jitter = Math.floor(Math.random() * 400);
          const delayToUse = Math.min(retryDelay * 1.8, maxRetryDelay) + jitter;
          retryDelay = Math.min(retryDelay * 1.8, maxRetryDelay);

          if (reconnectTimeout) clearTimeout(reconnectTimeout);
          reconnectTimeout = setTimeout(() => {
            if (isComponentMounted) {
              connectEventSource();
            }
          }, delayToUse);
        };

        eventSource.addEventListener('global_init', (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            if (data) {
              const deletedIds: string[] = Array.isArray(data.deletedUserIds) ? data.deletedUserIds : [];
              if (deletedIds.length > 0) {
                const localDeleted: string[] = JSON.parse(localStorage.getItem('hl_deleted_user_ids') || '[]');
                const mergedDeleted = Array.from(new Set([...localDeleted, ...deletedIds]));
                localStorage.setItem('hl_deleted_user_ids', JSON.stringify(mergedDeleted));

                setUsers((prev) => {
                  const clean = prev.filter((u) => !mergedDeleted.includes(u.id));
                  localStorage.setItem('hl_users', JSON.stringify(clean));
                  return clean;
                });

                setCurrentUser((curr) => {
                  if (curr && mergedDeleted.includes(curr.id)) {
                    localStorage.removeItem('hl_current_user');
                    return null;
                  }
                  return curr;
                });
              }

              if (data.activeAnnouncement && data.activeAnnouncement.message) {
                setStoreConfig((prev) => {
                  const next = {
                    ...prev,
                    globalAnnouncement: data.activeAnnouncement.message,
                    globalAnnouncementActive: true,
                    globalAnnouncementSenderName: data.activeAnnouncement.senderName || prev.globalAnnouncementSenderName || 'João Lucas (Adm Máximo)',
                    globalAnnouncementSenderAvatar: data.activeAnnouncement.senderPhoto || prev.globalAnnouncementSenderAvatar,
                    globalAnnouncementCreatedAt: data.activeAnnouncement.createdAt || Date.now(),
                  };
                  try {
                    localStorage.setItem('hl_config', JSON.stringify(next));
                    localStorage.setItem('hl_store_config', JSON.stringify(next));
                  } catch {}
                  return next;
                });
              }

              if (Array.isArray(data.schoolEvents)) setSchoolEvents(data.schoolEvents);
              if (Array.isArray(data.stories)) setStories(data.stories);
              if (typeof data.storeLikes === 'number') setStoreLikes(data.storeLikes);
              if (data.productLikes) setProductLikes(data.productLikes);
              if (data.storeConfig) setStoreConfig((prev) => ({ ...prev, ...data.storeConfig }));
              if (Array.isArray(data.users)) {
                const localDeleted: string[] = JSON.parse(localStorage.getItem('hl_deleted_user_ids') || '[]');
                const clean = data.users.filter((u: any) => !localDeleted.includes(u.id));
                setUsers(clean);
                localStorage.setItem('hl_users', JSON.stringify(clean));
              }
              if (Array.isArray(data.servers)) setServers(data.servers);
              if (Array.isArray(data.interServerPackets)) setRecentPackets(data.interServerPackets);
            }
          } catch {}
        });

        // Ouvinte de Anúncios Globais em Tempo Real disparados pelo Adm Máximo
        eventSource.addEventListener('announcement', (e: MessageEvent) => {
          try {
            const ann = JSON.parse(e.data);
            if (ann && ann.message) {
              setStoreConfig((prev) => {
                const next = {
                  ...prev,
                  globalAnnouncement: ann.message,
                  globalAnnouncementActive: true,
                  globalAnnouncementSenderName: ann.senderName || prev.globalAnnouncementSenderName || 'João Lucas (Adm Máximo)',
                  globalAnnouncementSenderAvatar: ann.senderPhoto || prev.globalAnnouncementSenderAvatar,
                  globalAnnouncementCreatedAt: ann.createdAt || Date.now(),
                };
                try {
                  localStorage.setItem('hl_config', JSON.stringify(next));
                  localStorage.setItem('hl_store_config', JSON.stringify(next));
                } catch {}
                return next;
              });
              playSoundEffect('global_announcement');
            }
          } catch {}
        });

        eventSource.addEventListener('events_updated', (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            if (Array.isArray(data)) {
              setSchoolEvents(data);
              playSoundEffect('special_event');
            }
          } catch {}
        });

        eventSource.addEventListener('stories_updated', (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            if (Array.isArray(data)) setStories(data);
          } catch {}
        });

        eventSource.addEventListener('story_added', (e: MessageEvent) => {
          try {
            const story = JSON.parse(e.data);
            if (story && story.id) {
              setStories((prev) => [story, ...prev.filter((s) => s.id !== story.id)]);
            }
          } catch {}
        });

        eventSource.addEventListener('story_liked', (e: MessageEvent) => {
          try {
            const { storyId, likes } = JSON.parse(e.data);
            if (storyId) {
              setStories((prev) =>
                prev.map((s) => (s.id === storyId ? { ...s, likes: typeof likes === 'number' ? likes : s.likes + 1 } : s))
              );
            }
          } catch {}
        });

        eventSource.addEventListener('store_likes_updated', (e: MessageEvent) => {
          try {
            const count = JSON.parse(e.data);
            if (typeof count === 'number') setStoreLikes(count);
          } catch {}
        });

        eventSource.addEventListener('product_likes_updated', (e: MessageEvent) => {
          try {
            const pLikes = JSON.parse(e.data);
            if (pLikes) setProductLikes(pLikes);
          } catch {}
        });

        eventSource.addEventListener('config_updated', (e: MessageEvent) => {
          try {
            const cfg = JSON.parse(e.data);
            if (cfg) setStoreConfig((prev) => ({ ...prev, ...cfg }));
          } catch {}
        });

        eventSource.addEventListener('users_updated', (e: MessageEvent) => {
          try {
            const updatedUsers = JSON.parse(e.data);
            if (Array.isArray(updatedUsers)) {
              const deletedIds: string[] = JSON.parse(localStorage.getItem('hl_deleted_user_ids') || '[]');
              const validUsers = updatedUsers.filter((u: any) => !deletedIds.includes(u.id));
              setUsers(validUsers);
              localStorage.setItem('hl_users', JSON.stringify(validUsers));

              // Sincronização permanente: se currentUser foi alterado, reflete na sessão imediatamente
              setCurrentUser((prevCurrent) => {
                if (!prevCurrent) return null;
                if (deletedIds.includes(prevCurrent.id)) {
                  localStorage.removeItem('hl_current_user');
                  return null;
                }
                const freshSelf = validUsers.find((u: any) => u.id === prevCurrent.id);
                if (freshSelf) {
                  localStorage.setItem('hl_current_user', JSON.stringify(freshSelf));
                  return freshSelf;
                }
                return prevCurrent;
              });
            }
          } catch {}
        });

        eventSource.addEventListener('user_deleted', (e: MessageEvent) => {
          try {
            const { userId } = JSON.parse(e.data);
            if (userId) {
              const existingDeleted: string[] = JSON.parse(localStorage.getItem('hl_deleted_user_ids') || '[]');
              if (!existingDeleted.includes(userId)) {
                existingDeleted.push(userId);
                localStorage.setItem('hl_deleted_user_ids', JSON.stringify(existingDeleted));
              }
              setUsers((prev) => {
                const clean = prev.filter((u) => u.id !== userId);
                localStorage.setItem('hl_users', JSON.stringify(clean));
                return clean;
              });
              setStories((prev) => {
                const clean = prev.filter((s) => s.authorId !== userId);
                localStorage.setItem('hl_stories', JSON.stringify(clean));
                return clean;
              });
              setCustomSymbols((prev) => {
                const clean = prev.filter((sym: any) => sym.creatorId !== userId && sym.authorId !== userId);
                localStorage.setItem('hl_custom_symbols', JSON.stringify(clean));
                return clean;
              });
              setReviews((prev) => {
                const clean = prev.filter((r) => r.authorId !== userId);
                localStorage.setItem('hl_reviews', JSON.stringify(clean));
                return clean;
              });
              setCurrentUser((curr) => {
                if (curr && curr.id === userId) {
                  localStorage.removeItem('hl_current_user');
                  return null;
                }
                return curr;
              });
            }
          } catch {}
        });

        eventSource.addEventListener('servers_updated', (e: MessageEvent) => {
          try {
            const payload = JSON.parse(e.data);
            if (payload && Array.isArray(payload.servers)) {
              setServers(payload.servers);
            }
            if (payload && Array.isArray(payload.recentPackets)) {
              setRecentPackets(payload.recentPackets);
            }
          } catch {}
        });

        eventSource.addEventListener('inter_server_packet', (e: MessageEvent) => {
          try {
            const pkt = JSON.parse(e.data);
            if (pkt && pkt.id) {
              setRecentPackets((prev) => [pkt, ...prev.filter((p) => p.id !== pkt.id)].slice(0, 50));
              if (pkt.action === 'global_announcement') {
                playSoundEffect('global_announcement');
              } else if (pkt.action === 'admin_directive') {
                playSoundEffect('urgent_alert');
              }
            }
          } catch {}
        });
      } catch (err) {
        console.warn('Falha ao instanciar EventSource:', err);
      }
    };

    connectEventSource();

    return () => {
      isComponentMounted = false;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (eventSource) {
        try {
          eventSource.close();
        } catch {}
      }
      if (pollInterval) clearInterval(pollInterval);
      if (broadcastChannel) {
        try {
          broadcastChannel.close();
        } catch {}
      }
    };
  }, []);

  const handleDispatchServerPacket = async (
    action: 'profile_mutation' | 'global_announcement' | 'catalog_sync' | 'admin_directive' | 'system_heartbeat',
    summary: string
  ): Promise<boolean> => {
    try {
      sounds.playSparkle();
      const res = await fetchWithFallback('/api/servers/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          summary,
          payloadData: {
            senderId: currentUser?.id || 'user-joao-lucas',
            senderName: currentUser?.name || 'João Lucas (Adm Máximo)',
            senderRole: currentUser?.role || 'max_admin',
          },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.packet) {
          setRecentPackets((prev) => [data.packet, ...prev.filter((p) => p.id !== data.packet.id)].slice(0, 50));
        }
        if (data.servers) {
          setServers(data.servers);
        }
        return true;
      }
    } catch (err) {
      console.error('Falha ao despachar pacote pelo Hub:', err);
    }
    return false;
  };

  const handleForceProfileSync = async () => {
    try {
      sounds.playPop();
      await fetchWithFallback('/api/global/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users }),
      });
    } catch (err) {
      console.error('Falha ao forçar sincronização de perfis:', err);
    }
  };

  const handleToggleEventStatus = async (eventId: string) => {
    playSoundEffect('special_event');
    const stoppedBy = currentUser?.name || 'Administrador';
    setSchoolEvents((prev) =>
      prev.map((ev) => {
        if (ev.id === eventId) {
          const nextActive = ev.active === false;
          return {
            ...ev,
            active: nextActive,
            stoppedAt: nextActive ? undefined : new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            stoppedBy: nextActive ? undefined : stoppedBy
          };
        }
        return ev;
      })
    );
    try {
      await fetchWithFallback('/api/global/events/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, stoppedBy }),
      });
    } catch {}
  };

  const handleAddSchoolEvent = async (event: SchoolEvent) => {
    playSoundEffect('special_event');
    setSchoolEvents((prev) => [event, ...prev.filter((e) => e.id !== event.id)]);
    try {
      await fetchWithFallback('/api/global/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event }),
      });
    } catch {}
  };

  const handleRemoveSchoolEvent = async (eventId: string) => {
    sounds.playPop();
    setSchoolEvents((prev) => prev.filter((ev) => ev.id !== eventId));
    try {
      await fetchWithFallback(`/api/global/events/${eventId}`, {
        method: 'DELETE',
      });
    } catch {}
  };

  const handleAddReview = (review: Omit<SchoolReview, 'id' | 'date' | 'likes'>) => {
    const newRev: SchoolReview = {
      ...review,
      id: `rev-${Date.now()}`,
      date: 'Agora mesmo',
      likes: 0
    };
    setReviews((prev) => [newRev, ...prev]);
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('hl_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('hl_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('hl_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('hl_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('hl_config', JSON.stringify(storeConfig));
  }, [storeConfig]);

  useEffect(() => {
    localStorage.setItem('hl_stories', JSON.stringify(stories));
  }, [stories]);

  useEffect(() => {
    localStorage.setItem('hl_devices', JSON.stringify(loggedDevices));
  }, [loggedDevices]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('hl_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('hl_current_user');
    }
  }, [currentUser]);

  // Record device on mount
  useEffect(() => {
    const dev = detectCurrentDevice(currentUser?.email);
    setLoggedDevices((prev) => {
      const exists = prev.some((d) => d.ipSimulated === dev.ipSimulated && d.deviceType === dev.deviceType);
      return exists ? prev : [dev, ...prev];
    });
  }, [currentUser?.email]);

  // Cart Handlers
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: Math.min(product.stock, item.quantity + quantity) }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          unitPrice: product.price,
          quantity: Math.min(product.stock, quantity),
          imageUrl: product.imageUrl,
        },
      ];
    });
  };

  const handleQuickOrder = (product: Product) => {
    handleAddToCart(product, 1);
    setIsOrderModalOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as OrderItem[]
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Orders Placed
  const handleOrderPlaced = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
    // Also increment seller sales
    setUsers((prevUsers) =>
      prevUsers.map((u) =>
        u.role === 'seller' || u.isMaxAdmin ? { ...u, salesCount: u.salesCount + 1 } : u
      )
    );
  };

  // Stories Likes & Add (Sincronizado globalmente no servidor)
  const handleLikeStory = async (storyId: string) => {
    sounds.playPop();
    setStories((prev) =>
      prev.map((s) => {
        if (s.id === storyId) {
          setUsers((prevUsers) =>
            prevUsers.map((u) =>
              u.id === s.authorId ? { ...u, likesReceived: (u.likesReceived || 0) + 1 } : u
            )
          );
          return { ...s, likes: (s.likes || 0) + 1 };
        }
        return s;
      })
    );
    try {
      await fetch(`/api/global/stories/${storyId}/like`, {
        method: 'POST',
      });
    } catch {}
  };

  const handleAddStory = async (newStory: Omit<StatusStory, 'id' | 'timestamp' | 'likes'>) => {
    sounds.playSuccess();
    const fullStory: StatusStory = {
      ...newStory,
      id: `story-${Date.now()}`,
      timestamp: 'Agora',
      likes: 1,
    };
    setStories((prev) => [fullStory, ...prev]);
    try {
      await fetchWithFallback('/api/global/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story: fullStory }),
      });
    } catch {}
  };

  // Follow / Unfollow
  const handleFollowToggle = (targetUserId: string) => {
    setFollowedUserIds((prev) => {
      const isFollowing = prev.includes(targetUserId);
      const next = isFollowing ? prev.filter((id) => id !== targetUserId) : [...prev, targetUserId];

      setUsers((prevUsers) =>
        prevUsers.map((u) => {
          if (u.id === targetUserId) {
            return {
              ...u,
              followersCount: isFollowing ? Math.max(0, u.followersCount - 1) : u.followersCount + 1,
            };
          }
          return u;
        })
      );

      return next;
    });
  };

  // Trigger Light Show
  const handleTriggerLightShow = (mode: 'confetti' | 'rainbow' | 'flash_sale' | 'neon_disco') => {
    setLightShowMode(mode);
  };

  const handleLogout = () => {
    sounds.playPop();
    setCurrentUser(null);
    localStorage.removeItem('hl_current_user');
  };

  const cartTotalQuantity = cartItems.reduce((acc, it) => acc + it.quantity, 0);

  // If no user is logged in, show login gate FIRST as requested
  if (!currentUser) {
    return (
      <LoginScreen
        users={users}
        onDeleteUser={handleDeleteUser}
        onLogin={(user) => {
          setCurrentUser(user);
          try {
            localStorage.setItem('hl_current_user', JSON.stringify(user));
          } catch {}
        }}
        onRegisterUser={(newUser) => {
          const updated = [...users, newUser];
          setUsers(updated);
          try {
            localStorage.setItem('hl_users', JSON.stringify(updated));
            localStorage.setItem('hl_current_user', JSON.stringify(newUser));
          } catch {}
          setCurrentUser(newUser);
        }}
        onExploreAsGuest={() => {
          const guest: UserProfile = {
            id: `guest-${Date.now()}`,
            name: 'Visitante do Gilvan',
            email: 'visitante@gilvansampaio.com',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
            role: 'client',
            isMaxAdmin: false,
            followersCount: 0,
            likesReceived: 0,
            salesCount: 0,
            permissions: {
              canEditProducts: false,
              canViewOrders: false,
              canEditSchedule: false,
              canPostStatus: false,
              canManageCoupons: false,
              canSendGlobalMessages: false,
              canChatWithClients: false,
              canManageTeam: false,
            },
            deviceLastUsed: 'Visitante',
            bio: 'Visitando o catálogo do HL Vendas no Gilvan Sampaio',
            createdAt: new Date().toISOString(),
          };
          setCurrentUser(guest);
          try {
            localStorage.setItem('hl_current_user', JSON.stringify(guest));
          } catch {}
        }}
        pickupLocation={storeConfig?.pickupLocation || INITIAL_STORE_CONFIG.pickupLocation}
        pickupSchedule={storeConfig?.pickupSchedule || INITIAL_STORE_CONFIG.pickupSchedule}
      />
    );
  }

  const hasValidYoutubeVideo = Boolean(
    storeConfig?.siteYoutubeBgActive &&
    storeConfig?.siteYoutubeBgUrl &&
    storeConfig.siteYoutubeBgUrl.trim() !== '' &&
    extractYouTubeId(storeConfig.siteYoutubeBgUrl)
  );

  return (
    <div className={`min-h-screen text-gray-900 font-sans flex flex-col selection:bg-pink-300 selection:text-pink-900 relative ${
      hasValidYoutubeVideo ? 'bg-[#FFF9F9]/70' : 'bg-[#FFF9F9]'
    }`}>
      {/* Background Video from YouTube - Apenas se ativo com URL válida; se não tiver, permanece fundo padrão */}
      {hasValidYoutubeVideo && (
        <SiteBackgroundVideo
          storeConfig={storeConfig}
          currentTab={currentTab}
          isMaxAdmin={isMaxAdmin}
        />
      )}

      {/* Light Show Overlay Event - only rendered when user triggers an event */}
      <LightShowOverlay
        mode={lightShowMode}
        activeMode={lightShowMode}
        onClose={() => setLightShowMode(null)}
      />

      {/* Global Real-time Announcement Overlay com foto do João Lucas e fanfarra oficial */}
      <GlobalAnnouncementOverlay />

      {/* Main Responsive Navigation with Tab Bar */}
      <Navbar
        currentUser={currentUser}
        currentTab={currentTab}
        storeConfig={storeConfig}
        symbolConfig={symbolConfig}
        customSymbols={customSymbols}
        onSelectTab={(tab) => {
          sounds.playPop();
          setCurrentTab(tab);
        }}
        onOpenLoginModal={() => {
          sounds.playPop();
          setIsLoginModalOpen(true);
        }}
        onOpenAvatarModal={handleOpenAvatarModal}
        handleLogout={handleLogout}
        onOpenOrderModal={() => {
          sounds.playPop();
          setIsOrderModalOpen(true);
        }}
        cartCount={cartTotalQuantity}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        onDismissGlobalAnnouncement={() => {
          // Fechamento exclusivamente local na tela do visitante, preservando o aviso global ativo na loja
        }}
      />

      {/* Main Content Area - Strictly Organized by Tabs */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6 relative z-10">
        <AnimatePresence mode="wait">
          {/* TAB 1: Catálogo (Layout Repaginado idêntico à foto de referência) */}
          {currentTab === 'catalog' && (
            <motion.div
              key="catalog"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-6"
            >
              {/* Screenshot 1: Top Floating Pills */}
              <div className="flex items-center justify-center gap-2 pt-1">
                <div
                  onClick={() => {
                    if (isMaxAdmin) {
                      sounds.playPop();
                      setIsEditPillModalOpen(true);
                    }
                  }}
                  className={`bg-gradient-to-r from-orange-400 to-amber-500 text-white font-bold text-xs px-4 py-1 rounded-full shadow-xs flex items-center gap-1.5 transition-all ${
                    isMaxAdmin ? 'cursor-pointer hover:scale-105 ring-2 ring-amber-300 ring-offset-1 select-none' : ''
                  }`}
                  title={isMaxAdmin ? 'Clique para editar a frase (Exclusivo Adm Máximo João Lucas)' : undefined}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{storeConfig?.customNoticePillText || 'nada'}</span>
                  {isMaxAdmin && (
                    <Edit3 className="w-3 h-3 text-amber-100 ml-0.5 hover:text-white" />
                  )}
                </div>
                <div className="bg-white border border-purple-200 text-purple-700 font-bold text-xs px-4 py-1 rounded-full shadow-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                  <span>Vendas da Helena</span>
                  <span>🌸</span>
                </div>
              </div>

              {/* Screenshot 1: Big Hero Title, Subtitle, Description */}
              <div className="text-center space-y-2 py-1 sm:py-2">
                <h1 className="font-display font-black text-4xl sm:text-6xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600">
                  HL Vendas
                </h1>
                <h2 className="text-[#0284c7] font-extrabold text-xl sm:text-2xl flex items-center justify-center gap-1.5">
                  <span>Tudo pra sua escola!</span>
                  <span className="text-xl">🗨️</span>
                </h2>
                <p className="text-purple-900/80 font-medium text-xs sm:text-sm max-w-lg mx-auto leading-relaxed px-2">
                  Lápis, squishys, canetinhas, mini cadernos e muito mais! Tudo fofinho, colorido e baratinho. Encomende já e receba na escola! ❤️‍🩹
                </p>

                {/* Screenshot 1: Exact Two-Tone School Delivery Location Pill */}
                <div className="flex flex-col sm:flex-row items-center justify-center max-w-2xl mx-auto mt-4 text-xs font-bold rounded-2xl sm:rounded-full overflow-hidden shadow-xs border border-purple-100">
                  <div className="w-full sm:w-auto bg-[#fde047] text-yellow-950 px-4 py-2.5 flex items-center justify-center gap-1.5 whitespace-nowrap">
                    <span>📍</span>
                    <span>{storeConfig?.pickupLocation || 'na calçada na frente do potão — C.E.P.M.G gilvan sampaio'}</span>
                  </div>
                  <div className="w-full sm:w-auto bg-[#f3e8ff] text-purple-950 px-4 py-2.5 flex items-center justify-center gap-1.5 whitespace-nowrap border-t sm:border-t-0 sm:border-l border-purple-200/60">
                    <span>🕒</span>
                    <span>{storeConfig?.pickupSchedule || '17:30 — toda segunda e terça'}</span>
                  </div>
                </div>

                {/* Screenshot 1: Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      sounds.playPop();
                      setIsOrderModalOpen(true);
                    }}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-full shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <span>🛍️</span>
                    <span>Encomendar Agora</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      sounds.playPop();
                      const el = document.getElementById('catalog-products-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-white hover:bg-purple-50 text-purple-700 border-2 border-purple-200 font-bold text-xs sm:text-sm px-6 py-2.5 rounded-full shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <span>👀</span>
                    <span>Ver Produtos</span>
                  </motion.button>
                </div>

                {/* Lançador Interativo de Símbolos: dura 2s com a foto de perfil de quem enviou */}
                <SymbolReactionLaunchBar
                  symbols={customSymbols}
                  currentUser={currentUser}
                />
              </div>

              {/* Engagement Metrics Banner: Total de Likes dinâmico sincronizado em tempo real */}
              <StoreEngagementMetrics
                orders={orders}
                onOpenLeaderboard={() => setCurrentTab('leaderboard')}
                onOpenOrderModal={() => setIsOrderModalOpen(true)}
                globalStoreLikes={storeLikes}
                onToggleGlobalLike={handleToggleStoreLike}
              />

              {/* 2. PRODUTOS E CATÁLOGO */}
              <div id="catalog-products-section">
                <CatalogSection
                  products={products}
                  onPreview={(p) => setPreviewProduct(p)}
                  onQuickOrder={handleQuickOrder}
                  cartItemIds={cartItems.map((i) => i.productId)}
                />
              </div>
            </motion.div>
          )}

          {/* TAB 2: Status & Vídeos (Stories de 20 min com som e posts) */}
          {currentTab === 'stories' && (
            <motion.div
              key="stories"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-3xl p-5 border-3 border-pink-200 shadow-sm text-center">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-2xl mx-auto mb-2 font-bold">
                  📸
                </div>
                <h2 className="font-display font-black text-xl sm:text-2xl text-gray-900">
                  Status & Vídeos da Equipe
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-lg mx-auto">
                  Acompanhe os status gerados pela Lumininha AI a cada 20 minutos com áudio e as publicações dos novos squishies e materiais da vendedora Helena!
                </p>
              </div>

              <StatusStories
                stories={stories}
                currentUser={currentUser}
                onLikeStory={handleLikeStory}
                onAddStory={handleAddStory}
                onOpenProduct={(productId) => {
                  const found = products.find((p) => p.id === productId);
                  if (found) setPreviewProduct(found);
                }}
                products={products}
              />
            </motion.div>
          )}

          {/* TAB 3: Eventos Especiais (Roleta, Alertas, Confetes, Cupons - Duram até o Adm Parar) */}
          {currentTab === 'events' && (
            <motion.div
              key="events"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <EventsSection
                onTriggerLightShow={handleTriggerLightShow}
                coupons={coupons}
                currentUser={currentUser}
                events={schoolEvents}
                onToggleEventStatus={handleToggleEventStatus}
                onAddEvent={handleAddSchoolEvent}
                onRemoveEvent={handleRemoveSchoolEvent}
              />
            </motion.div>
          )}

          {/* TAB: Perfis & Bate-Papo da Comunidade */}
          {currentTab === 'profiles' && (
            <motion.div
              key="profiles"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <CommunityProfilesChat
                users={users}
                currentUser={currentUser}
                onUpdateUsers={(updatedUsers) => setUsers(updatedUsers)}
                onUpdateCurrentUser={(updated) => setCurrentUser(updated)}
                onOpenAvatarModal={handleOpenAvatarModal}
                onDeleteUser={handleDeleteUser}
                onUpdateUserAvatar={handleSaveAvatar}
                onUpdateUserProfile={handleUpdateUserProfile}
                followedUserIds={followedUserIds}
                onFollowToggle={handleFollowToggle}
                reviews={reviews}
                onAddReview={handleAddReview}
                orders={orders}
              />
            </motion.div>
          )}

          {/* TAB: Estúdio de Símbolos & Animações do João Lucas (Apenas Adm Máximo ou redireciona) */}
          {currentTab === 'symbols-studio' && isMaxAdmin && (
            <motion.div
              key="symbols-studio"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <JoaoLucasSymbolStudio
                currentUser={currentUser}
                config={symbolConfig}
                symbols={customSymbols}
                onUpdateConfig={setSymbolConfig}
                onUpdateSymbols={setCustomSymbols}
              />
            </motion.div>
          )}

          {/* TAB 4: Ranking Vendedores (Leaderboard do Gilvan Sampaio) */}
          {currentTab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <TopSellersLeaderboard
                users={users}
                onFollowToggle={handleFollowToggle}
                followedUserIds={followedUserIds}
                currentUser={currentUser}
                orders={orders}
                onUpdateUser={handleUpdateUserProfile}
              />
            </motion.div>
          )}

          {/* TAB 5: Lumininha AI (Mascote com reações emocionais) */}
          {currentTab === 'lumininha' && (
            <motion.div
              key="lumininha"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <LumininhaWidget
                products={products}
                currentUser={currentUser}
                symbolConfig={symbolConfig}
                customSymbols={customSymbols}
                temperature={temperature}
                weatherType={weatherType}
                youtubeUrl={youtubeUrl}
                onNavigateToAdminMascot={() => setCurrentTab('admin')}
                onOpenProduct={(id) => {
                  const found = products.find((p) => p.id === id);
                  if (found) setPreviewProduct(found);
                }}
              />
            </motion.div>
          )}

          {/* TAB 6: Painel Administrativo (Acesso João Lucas / Equipe) */}
          {currentTab === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <AdminPanel
                currentUser={currentUser}
                products={products}
                orders={orders}
                users={users}
                coupons={coupons}
                storeConfig={storeConfig}
                loggedDevices={loggedDevices}
                onUpdateStoreConfig={handleUpdateStoreConfig}
                onUpdateProducts={setProducts}
                onUpdateUsers={setUsers}
                onUpdateCoupons={setCoupons}
                onTriggerLightShow={handleTriggerLightShow}
                onDeleteUser={handleDeleteUser}
                onUpdateUserProfile={handleUpdateUserProfile}
                onUpdateUserAvatar={handleSaveAvatar}
                symbolConfig={symbolConfig}
                customSymbols={customSymbols}
                onUpdateSymbolConfig={setSymbolConfig}
                onUpdateSymbols={setCustomSymbols}
                weatherType={weatherType}
                temperature={temperature}
                youtubeUrl={youtubeUrl}
                onUpdateWeather={setWeatherType}
                onUpdateTemperature={setTemperature}
                onUpdateYoutubeUrl={setYoutubeUrl}
                servers={servers}
                recentPackets={recentPackets}
                onDispatchServerPacket={handleDispatchServerPacket}
                onForceProfileSync={handleForceProfileSync}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Product Preview Modal */}
      <ProductPreviewModal
        product={previewProduct}
        onClose={() => setPreviewProduct(null)}
        onAddToCart={(prod, qty) => handleAddToCart(prod, qty)}
      />

      {/* Order / Cart Modal */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onOrderPlaced={handleOrderPlaced}
        coupons={coupons}
        storeConfig={storeConfig}
        currentUser={currentUser}
      />

      {/* Profile Switch Modal */}
      <ProfileLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        users={users}
        onDeleteUser={handleDeleteUser}
        onSelectUser={(u) => {
          setCurrentUser(u);
          try {
            localStorage.setItem('hl_current_user', JSON.stringify(u));
          } catch {}
        }}
        onRegisterUser={(newUser) => {
          const updated = [...users, newUser];
          setUsers(updated);
          try {
            localStorage.setItem('hl_users', JSON.stringify(updated));
            localStorage.setItem('hl_current_user', JSON.stringify(newUser));
          } catch {}
          setCurrentUser(newUser);
        }}
        currentUser={currentUser}
      />

      {/* Avatar Edit Modal (Accessible from anywhere) */}
      <AvatarEditModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        user={avatarModalUser}
        onSaveAvatar={handleSaveAvatar}
      />

      {/* Edit Hero Pill Modal (Exclusivo Adm Máximo João Lucas) */}
      <EditHeroPillModal
        isOpen={isEditPillModalOpen}
        onClose={() => setIsEditPillModalOpen(false)}
        currentText={storeConfig?.customNoticePillText || 'nada'}
        onSave={(newText) => {
          const updatedConfig = { ...storeConfig, customNoticePillText: newText };
          setStoreConfig(updatedConfig);
          try {
            localStorage.setItem('hl_config', JSON.stringify(updatedConfig));
          } catch {}
        }}
      />

      {/* Floating Action Button at bottom-right: Mascote Lumininha ou Símbolo Substituto do João */}
      <div className="fixed bottom-5 right-5 z-40">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            sounds.playSparkle();
            setCurrentTab('lumininha');
          }}
          className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-indigo-600 text-white shadow-2xl flex items-center justify-center cursor-pointer border-3 border-white overflow-hidden group"
          title={activeReplacementSymbol ? `Mascote Oficial do Site: ${activeReplacementSymbol.name}` : "Abrir Assistente Lumininha AI"}
        >
          {activeReplacementSymbol ? (
            activeReplacementSymbol.category === 'pixel' && activeReplacementSymbol.pixelMatrix ? (
              <div className="grid grid-cols-8 w-8 h-8 rounded-xs overflow-hidden bg-gray-950 p-0.5">
                {activeReplacementSymbol.pixelMatrix.map((color, cellIdx) => (
                  <div
                    key={cellIdx}
                    style={{ backgroundColor: color || 'transparent' }}
                    className="w-full h-full"
                  />
                ))}
              </div>
            ) : (
              <motion.span
                animate={
                  activeReplacementSymbol.animationEffect === 'spin'
                    ? { rotate: 360 }
                    : activeReplacementSymbol.animationEffect === 'bounce'
                    ? { y: [-4, 4, -4], scale: [0.95, 1.05, 0.95] }
                    : activeReplacementSymbol.animationEffect === 'pulse'
                    ? { scale: [0.9, 1.2, 0.9] }
                    : activeReplacementSymbol.animationEffect === 'heartbeat'
                    ? { scale: [1, 1.25, 1, 1.3, 1] }
                    : activeReplacementSymbol.animationEffect === 'sway'
                    ? { rotate: [-15, 15, -15] }
                    : { scale: [1, 1.1, 1] }
                }
                transition={{
                  duration: activeReplacementSymbol.speed === 'turbo' ? 0.8 : activeReplacementSymbol.speed === 'fast' ? 1.4 : 2.2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="text-2xl"
                style={{ color: activeReplacementSymbol.color }}
              >
                {activeReplacementSymbol.charOrIcon}
              </motion.span>
            )
          ) : (
            <Sparkles className="w-6 h-6 text-yellow-300" />
          )}

          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-pink-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white animate-bounce shadow-xs">
            {activeReplacementSymbol ? '⭐' : '!'}
          </span>
        </motion.button>
      </div>

      {/* Footer with Gilvan Sampaio notice & detected device indicator */}
      <footer className="mt-12 border-t-2 border-pink-100 bg-white py-6 px-4 text-center text-xs text-gray-500 space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-3 font-display font-bold text-gray-700">
          <span>HL Vendas • Vendas da Helena</span>
          <span>•</span>
          <span className="text-pink-600">C.E.P.M.G Gilvan Sampaio</span>
          <span>•</span>
          <span>Segundas e Terças às 15:30</span>
        </div>

        <p className="text-[11px] text-gray-400 max-w-md mx-auto">
          Plataforma de encomendas de squishies, materiais fofos e papelaria para os estudantes. Pedidos entregues em mãos na saída das aulas!
        </p>

        <div className="flex items-center justify-center gap-2 pt-2 text-[10px] text-gray-400">
          <Smartphone className="w-3 h-3 text-pink-500" />
          <span>
            Dispositivo detectado: {detectCurrentDevice().deviceType} ({detectCurrentDevice().os}) • HL Vendas 2D v2.0
          </span>
        </div>
      </footer>

      {/* Camada ao Vivo de Símbolos Flutuantes e Animados (Dura exatamente 2 segundos quando lançado c/ foto) */}
      <LiveSymbolFloatingOverlay config={symbolConfig} symbols={customSymbols} />

      {/* Rádio YouTube Global ao Vivo: Som sincronizado para toda a escola quando o Adm toca */}
      <YouTubeAudioPlayer isMaxAdmin={isMaxAdmin} />
    </div>
  );
}
