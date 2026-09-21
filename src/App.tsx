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
  WeatherType
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
      const saved = localStorage.getItem('hl_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((u: UserProfile) =>
            u.email.toLowerCase() === 'joaolucasgp1234@gmail.com'
              ? { ...u, password: 'hlvendas2026', isMaxAdmin: true }
              : u
          );
        }
      }
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
      await fetch('/api/global/config', {
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
      await fetch('/api/global/users/delete', {
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
      await fetch('/api/global/users', {
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
      await fetch('/api/global/likes/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ change }),
      });
    } catch {}
  };

  // Motor Global de Sincronização em Tempo Real (SSE + Polling de segurança)
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let pollInterval: any = null;

    const syncWithServer = async () => {
      try {
        const res = await fetch('/api/global/state');
        if (!res.ok) return;
        const data = await res.json();
        if (data && typeof data === 'object') {
          const deletedIds: string[] = Array.isArray(data.deletedUserIds) ? data.deletedUserIds : [];
          if (deletedIds.length > 0) {
            localStorage.setItem('hl_deleted_user_ids', JSON.stringify(deletedIds));
          }
          if (Array.isArray(data.schoolEvents)) setSchoolEvents(data.schoolEvents);
          if (Array.isArray(data.stories)) setStories(data.stories);
          if (typeof data.storeLikes === 'number') setStoreLikes(data.storeLikes);
          if (data.productLikes && typeof data.productLikes === 'object') setProductLikes(data.productLikes);
          if (data.storeConfig && typeof data.storeConfig === 'object') {
            setStoreConfig((prev) => ({ ...prev, ...data.storeConfig }));
          }
          if (Array.isArray(data.users) && data.users.length > 0) {
            setUsers(data.users.filter((u: any) => !deletedIds.includes(u.id)));
          }
        }
      } catch {}
    };

    syncWithServer();
    pollInterval = setInterval(syncWithServer, 8000);

    try {
      eventSource = new EventSource('/api/radio/stream');

      eventSource.addEventListener('global_init', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          if (data) {
            const deletedIds: string[] = Array.isArray(data.deletedUserIds) ? data.deletedUserIds : [];
            if (deletedIds.length > 0) {
              localStorage.setItem('hl_deleted_user_ids', JSON.stringify(deletedIds));
            }
            if (Array.isArray(data.schoolEvents)) setSchoolEvents(data.schoolEvents);
            if (Array.isArray(data.stories)) setStories(data.stories);
            if (typeof data.storeLikes === 'number') setStoreLikes(data.storeLikes);
            if (data.productLikes) setProductLikes(data.productLikes);
            if (data.storeConfig) setStoreConfig((prev) => ({ ...prev, ...data.storeConfig }));
            if (Array.isArray(data.users)) setUsers(data.users.filter((u: any) => !deletedIds.includes(u.id)));
          }
        } catch {}
      });

      eventSource.addEventListener('events_updated', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          if (Array.isArray(data)) setSchoolEvents(data);
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
            setUsers(updatedUsers.filter((u: any) => !deletedIds.includes(u.id)));
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
            setUsers((prev) => prev.filter((u) => u.id !== userId));
            setStories((prev) => prev.filter((s) => s.authorId !== userId));
          }
        } catch {}
      });
    } catch {}

    return () => {
      if (eventSource) eventSource.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  const handleToggleEventStatus = async (eventId: string) => {
    sounds.playPop();
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
      await fetch('/api/global/events/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, stoppedBy }),
      });
    } catch {}
  };

  const handleAddSchoolEvent = async (event: SchoolEvent) => {
    sounds.playSuccess();
    setSchoolEvents((prev) => [event, ...prev.filter((e) => e.id !== event.id)]);
    try {
      await fetch('/api/global/events', {
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
      await fetch(`/api/global/events/${eventId}`, {
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
      await fetch('/api/global/stories', {
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
          handleUpdateStoreConfig({
            ...storeConfig,
            globalAnnouncementActive: false,
          });
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
