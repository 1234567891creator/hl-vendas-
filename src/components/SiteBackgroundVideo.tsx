import React from 'react';
import { StoreConfig } from '../types';

interface SiteBackgroundVideoProps {
  storeConfig: StoreConfig;
  currentTab: string;
  isMaxAdmin: boolean;
}

export const extractYouTubeId = (urlOrId: string): string => {
  if (!urlOrId) return '';
  const trimmed = urlOrId.trim();
  
  // Direct 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  
  // Standard, embed, shorts or shortened URLs
  const regExp = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
  const match = trimmed.match(regExp);
  return match && match[1] ? match[1] : '';
};

export const SiteBackgroundVideo: React.FC<SiteBackgroundVideoProps> = ({
  storeConfig,
  currentTab,
  isMaxAdmin,
}) => {
  // Check if background video is activated and has a valid URL
  const isActive = storeConfig?.siteYoutubeBgActive;
  const rawUrl = storeConfig?.siteYoutubeBgUrl;

  if (!isActive || !rawUrl) {
    return null;
  }

  const videoId = extractYouTubeId(rawUrl);
  if (!videoId) {
    return null;
  }

  const opacityPercent = typeof storeConfig.siteYoutubeBgOpacity === 'number' 
    ? Math.max(10, Math.min(95, storeConfig.siteYoutubeBgOpacity)) 
    : 40;

  const blurPx = typeof storeConfig.siteYoutubeBgBlur === 'number' 
    ? Math.max(0, Math.min(12, storeConfig.siteYoutubeBgBlur)) 
    : 0;

  return (
    <div 
      aria-hidden="true"
      id="site-youtube-bg-layer"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* Container with opacity and blur */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{
          opacity: opacityPercent / 100,
          filter: blurPx > 0 ? `blur(${blurPx}px)` : undefined,
          transform: blurPx > 0 ? 'scale(1.06)' : undefined, // Prevents edge clipping with blur
        }}
      >
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&playsinline=1&enablejsapi=1&rel=0&iv_load_policy=3&disablekb=1&fs=0`}
          title="Fundo do Site YouTube"
          className="absolute pointer-events-none border-0"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '100vw',
            height: '56.25vw', // 16:9 ratio
            minHeight: '100vh',
            minWidth: '177.78vh', // 16:9 ratio
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            border: 'none',
          }}
          tabIndex={-1}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>

      {/* Gentle soft glass tint to preserve text readability */}
      <div 
        className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/30 via-transparent to-pink-50/20"
      />

      {/* Badge showing that YouTube Background is Active (only for Max Admin) */}
      {isMaxAdmin && (
        <div className="fixed bottom-2 left-2 z-20 pointer-events-auto bg-black/75 hover:bg-black/90 backdrop-blur-md text-yellow-300 text-[10px] font-bold px-3 py-1 rounded-full border border-yellow-400/50 shadow-lg flex items-center gap-1.5 transition-opacity cursor-default">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
          <span>👑 Fundo YouTube Ativo ({opacityPercent}%)</span>
        </div>
      )}
    </div>
  );
};
