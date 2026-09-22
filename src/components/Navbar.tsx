import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ShoppingBag, 
  MapPin, 
  ShieldCheck, 
  User, 
  Trophy, 
  Bot, 
  LogOut, 
  LogIn, 
  Flame, 
  Smartphone,
  Sliders,
  Bell,
  Sparkles,
  Camera,
  Sun,
  Moon,
  CheckCircle,
  Crown,
  X,
  Users
} from 'lucide-react';
import { UserProfile, StoreConfig, SiteSymbolAnimationConfig, CustomSymbol } from '../types';
import { sounds } from '../utils/audioEffects';
import { INITIAL_STORE_CONFIG } from '../data/initialData';

export interface NavbarProps {
  currentTab: 'catalog' | 'stories' | 'leaderboard' | 'ranking' | 'lumininha' | 'admin' | string;
  onSelectTab?: (tab: any) => void;
  setCurrentTab?: (tab: any) => void;
  currentUser: UserProfile | null;
  storeConfig?: StoreConfig;
  cartCount: number;
  onOpenLoginModal?: () => void;
  openAuthModal?: () => void;
  onOpenOrderModal?: () => void;
  onOpenAvatarModal?: (user: UserProfile) => void;
  handleLogout?: () => void;
  symbolConfig?: SiteSymbolAnimationConfig;
  customSymbols?: CustomSymbol[];
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onDismissGlobalAnnouncement?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  setCurrentTab,
  currentUser,
  storeConfig = INITIAL_STORE_CONFIG,
  cartCount,
  onOpenLoginModal,
  openAuthModal,
  onOpenOrderModal,
  onOpenAvatarModal,
  handleLogout,
  symbolConfig,
  customSymbols = [],
  isDarkMode = false,
  onToggleDarkMode,
  onDismissGlobalAnnouncement,
}) => {
  const isMaxAdmin = currentUser?.email?.toLowerCase() === 'joaolucasgp1234@gmail.com' ||
    currentUser?.email?.toLowerCase() === 'studioscreator1@gmail.com' ||
    currentUser?.isMaxAdmin === true;
  const hasAdminAccess = isMaxAdmin || currentUser?.role === 'seller';

  const [dismissedLocally, setDismissedLocally] = useState(false);

  useEffect(() => {
    setDismissedLocally(false);
  }, [storeConfig?.globalAnnouncement, storeConfig?.globalAnnouncementCreatedAt]);

  const safeConfig = storeConfig || INITIAL_STORE_CONFIG;

  const handleTabChange = (tab: any) => {
    sounds.playPop();
    if (onSelectTab) onSelectTab(tab);
    if (setCurrentTab) setCurrentTab(tab);
  };

  const handleAuthClick = () => {
    sounds.playPop();
    if (onOpenLoginModal) onOpenLoginModal();
    else if (openAuthModal) openAuthModal();
  };

  const handleLogoutClick = () => {
    if (handleLogout) {
      handleLogout();
    } else if (onOpenLoginModal) {
      onOpenLoginModal();
    }
  };

  const handleCartClick = () => {
    sounds.playPop();
    if (onOpenOrderModal) {
      onOpenOrderModal();
    } else {
      handleTabChange('catalog');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-purple-100 shadow-xs transition-all">
      {/* Global Notice Banner (if active) */}
      {safeConfig?.globalAnnouncementActive && safeConfig?.globalAnnouncement && !dismissedLocally && (
        <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 text-white text-xs sm:text-sm font-medium py-2 px-3 text-center flex items-center justify-between gap-2 shadow-inner border-b border-pink-400/40 relative">
          <div className="flex-1 flex items-center justify-center gap-2 flex-wrap">
            {/* Admin/Sender Profile Photo */}
            <div className="relative flex-shrink-0">
              <img
                src={safeConfig.globalAnnouncementSenderAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                alt={safeConfig.globalAnnouncementSenderName || 'Administrador'}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border-2 border-yellow-300 shadow-md ring-1 ring-white/60"
              />
              <span className="absolute -bottom-1 -right-1 bg-yellow-400 text-gray-900 rounded-full p-0.5 shadow-xs" title="Administrador Verificado">
                <Crown className="w-2.5 h-2.5" />
              </span>
            </div>

            {/* Admin/Sender Name with Verified Badge */}
            <div className="flex items-center gap-1 font-black text-yellow-200 text-xs sm:text-sm whitespace-nowrap bg-black/20 px-2 py-0.5 rounded-lg border border-white/20">
              <span>{safeConfig.globalAnnouncementSenderName || 'João Lucas (Admin)'}</span>
              <CheckCircle className="w-3.5 h-3.5 text-sky-300 fill-sky-300" />
            </div>

            <Bell className="w-4 h-4 animate-bounce text-yellow-200 flex-shrink-0" />
            
            <span className="font-bold tracking-wide text-center leading-snug max-w-3xl drop-shadow-xs">
              {safeConfig.globalAnnouncement}
            </span>
          </div>

          <button
            onClick={() => {
              sounds.playPop();
              setDismissedLocally(true);
              if (onDismissGlobalAnnouncement) onDismissGlobalAnnouncement();
            }}
            className="p-1 text-white/80 hover:text-white hover:bg-black/20 rounded-lg transition-colors cursor-pointer flex-shrink-0"
            title="Fechar comunicado"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5">
        <div className="flex items-center justify-between gap-3">
          {/* Screenshot 1: Brand Logo 🌸 HL Vendas */}
          <motion.div 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleTabChange('catalog')}
            className="cursor-pointer flex items-center gap-2 flex-shrink-0"
          >
            <span className="text-2xl sm:text-3xl leading-none">🌸</span>
            <span className="font-display font-black text-xl sm:text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600">
              HL Vendas
            </span>
          </motion.div>

          {/* Screenshot 1: Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-bold text-gray-700">
            <button
              onClick={() => handleTabChange('catalog')}
              className={`px-3 py-1.5 rounded-full transition-colors ${
                currentTab === 'catalog'
                  ? 'text-purple-700 bg-purple-50 font-extrabold'
                  : 'hover:text-purple-600 hover:bg-purple-50/50 text-gray-600'
              }`}
            >
              Início
            </button>

            <button
              onClick={() => {
                handleTabChange('catalog');
                // Smooth scroll to products section
                window.scrollTo({ top: 350, behavior: 'smooth' });
              }}
              className="px-3 py-1.5 rounded-full hover:text-purple-600 hover:bg-purple-50/50 text-gray-600 transition-colors"
            >
              Produtos
            </button>

            <button
              onClick={() => handleTabChange('stories')}
              className={`px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 ${
                currentTab === 'stories'
                  ? 'text-purple-700 bg-purple-50 font-extrabold'
                  : 'hover:text-purple-600 hover:bg-purple-50/50 text-gray-600'
              }`}
            >
              <span>Status</span>
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping"></span>
            </button>

            <button
              onClick={() => handleTabChange('events')}
              className={`px-3 py-1.5 rounded-full transition-colors ${
                currentTab === 'events'
                  ? 'text-purple-700 bg-purple-50 font-extrabold'
                  : 'hover:text-purple-600 hover:bg-purple-50/50 text-gray-600'
              }`}
            >
              Eventos
            </button>

            <button
              onClick={() => handleTabChange('leaderboard')}
              className={`px-3 py-1.5 rounded-full transition-colors ${
                currentTab === 'leaderboard'
                  ? 'text-purple-700 bg-purple-50 font-extrabold'
                  : 'hover:text-purple-600 hover:bg-purple-50/50 text-gray-600'
              }`}
            >
              Avaliações
            </button>

            {/* Aba de Perfis & Bate-papo da Comunidade solicitada */}
            <button
              onClick={() => handleTabChange('profiles')}
              className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                currentTab === 'profiles'
                  ? 'text-white bg-gradient-to-r from-pink-600 to-purple-600 font-extrabold shadow-xs'
                  : 'text-purple-700 bg-purple-50/70 hover:bg-purple-100 font-bold border border-purple-200'
              }`}
            >
              <span>💬 Perfis & Bate-Papo</span>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            </button>

            <button
              onClick={handleCartClick}
              className="px-3 py-1.5 rounded-full hover:text-purple-600 hover:bg-purple-50/50 text-gray-600 transition-colors"
            >
              Encomendar
            </button>

            <button
              onClick={() => {
                handleTabChange('catalog');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-3 py-1.5 rounded-full hover:text-purple-600 hover:bg-purple-50/50 text-gray-600 transition-colors"
            >
              Local & Horário
            </button>

            {hasAdminAccess && (
              <button
                onClick={() => handleTabChange('admin')}
                className={`px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 text-xs ${
                  currentTab === 'admin'
                    ? 'bg-purple-900 text-yellow-300 font-extrabold'
                    : 'text-purple-900 bg-purple-100 hover:bg-purple-200'
                }`}
              >
                <span>{isMaxAdmin ? '👑 Adm Máximo' : 'Painel'}</span>
              </button>
            )}
          </nav>

          {/* Screenshot 1: Right Side Controls (Profile & Encomendar Button) */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {currentUser ? (
              <div className="flex items-center gap-2 bg-purple-50 hover:bg-purple-100/70 transition-colors border border-purple-200/80 rounded-full p-1 sm:pr-3">
                {/* Clickable avatar to edit photo */}
                <div 
                  onClick={() => {
                    sounds.playPop();
                    if (onOpenAvatarModal) onOpenAvatarModal(currentUser);
                  }}
                  className="relative group cursor-pointer"
                  title="Clique para mudar sua foto de perfil"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-purple-400 group-hover:border-purple-600 shadow-xs"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="hidden sm:block text-left">
                  <div className="flex items-center gap-1 text-xs font-extrabold text-purple-950 leading-tight">
                    <span className="truncate max-w-[95px]">{currentUser.name}</span>
                    {currentUser.isMaxAdmin && (
                      <span className="text-yellow-500 text-[10px]" title="Administrador Máximo">👑</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playPop();
                      if (onOpenAvatarModal) onOpenAvatarModal(currentUser);
                    }}
                    className="text-[10px] text-purple-600 hover:text-purple-800 font-bold block leading-none flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Mudar Foto</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    if (onOpenLoginModal) onOpenLoginModal();
                  }}
                  className="p-1.5 text-purple-600 hover:text-purple-800 hover:bg-purple-100/60 rounded-full transition-colors cursor-pointer"
                  title="Trocar de Perfil"
                >
                  <Users className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors cursor-pointer ml-0.5"
                  title="Sair da Conta"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAuthClick}
                className="flex items-center gap-1 text-gray-700 hover:text-purple-700 font-bold text-xs sm:text-sm px-3 py-1.5 rounded-full hover:bg-purple-50 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Entrar</span>
              </motion.button>
            )}

            {/* Dark Mode Toggle Button */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                sounds.playPop();
                if (onToggleDarkMode) onToggleDarkMode();
              }}
              className={`p-2 rounded-full transition-all border cursor-pointer flex items-center justify-center ${
                isDarkMode
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/50 hover:bg-amber-400/30'
                  : 'bg-purple-100 text-purple-900 border-purple-200 hover:bg-purple-200'
              }`}
              title={isDarkMode ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
              aria-label={isDarkMode ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.button>

            {/* Screenshot 1: Rounded-full Magenta/Purple "Encomendar" Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCartClick}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full font-display font-bold text-xs sm:text-sm transition-all shadow-sm bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
            >
              <span>🛍️</span>
              <span>Encomendar</span>
              {cartCount > 0 && (
                <span className="bg-white text-purple-700 text-[10px] px-1.5 py-0.2 rounded-full font-black ml-0.5 shadow-xs">
                  {cartCount}
                </span>
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation Tabs (visible on small screens) */}
        <div className="flex md:hidden items-center justify-between overflow-x-auto no-scrollbar gap-1 pt-2 border-t border-purple-100 mt-2 text-xs font-bold text-gray-700">
          <button
            onClick={() => handleTabChange('catalog')}
            className={`px-3 py-1 rounded-full whitespace-nowrap ${currentTab === 'catalog' ? 'bg-purple-600 text-white' : 'bg-gray-100'}`}
          >
            Início
          </button>
          <button
            onClick={() => handleTabChange('stories')}
            className={`px-3 py-1 rounded-full whitespace-nowrap ${currentTab === 'stories' ? 'bg-purple-600 text-white' : 'bg-gray-100'}`}
          >
            Status
          </button>
          <button
            onClick={() => handleTabChange('profiles')}
            className={`px-3 py-1 rounded-full whitespace-nowrap flex items-center gap-1 ${currentTab === 'profiles' ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            <span>💬 Papo</span>
          </button>
          <button
            onClick={() => handleTabChange('events')}
            className={`px-3 py-1 rounded-full whitespace-nowrap ${currentTab === 'events' ? 'bg-purple-600 text-white' : 'bg-gray-100'}`}
          >
            Eventos
          </button>
          <button
            onClick={() => handleTabChange('leaderboard')}
            className={`px-3 py-1 rounded-full whitespace-nowrap ${currentTab === 'leaderboard' ? 'bg-purple-600 text-white' : 'bg-gray-100'}`}
          >
            Avaliações
          </button>
          {hasAdminAccess && (
            <button
              onClick={() => handleTabChange('admin')}
              className={`px-3 py-1 rounded-full whitespace-nowrap ${currentTab === 'admin' ? 'bg-gray-900 text-yellow-300' : 'bg-purple-100 text-purple-900'}`}
            >
              {isMaxAdmin ? '👑 Adm' : 'Painel'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
