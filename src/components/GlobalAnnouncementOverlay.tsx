import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Sparkles, X, Megaphone, Radio } from 'lucide-react';
import { GlobalAnnouncement } from '../types';
import { sounds } from '../utils/audioEffects';

interface GlobalAnnouncementOverlayProps {
  // Allows testing or triggering locally if needed
  externalAnnouncement?: GlobalAnnouncement | null;
  onDismissExternal?: () => void;
}

export const GlobalAnnouncementOverlay: React.FC<GlobalAnnouncementOverlayProps> = ({
  externalAnnouncement,
  onDismissExternal,
}) => {
  const [activeAnnouncement, setActiveAnnouncement] = useState<GlobalAnnouncement | null>(null);
  const [progressPercent, setProgressPercent] = useState<number>(100);
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const triggerAnnouncement = (ann: GlobalAnnouncement) => {
    // Check if not expired
    const elapsed = Date.now() - ann.createdAt;
    const remaining = ann.durationMs - elapsed;
    if (remaining <= 500) return;

    sounds.playFanfare();
    setActiveAnnouncement(ann);
    setProgressPercent(100);

    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    const startTime = Date.now();
    const totalDuration = remaining;

    progressIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const spent = now - startTime;
      const leftRatio = Math.max(0, 1 - spent / totalDuration);
      setProgressPercent(leftRatio * 100);
    }, 50);

    dismissTimerRef.current = setTimeout(() => {
      setActiveAnnouncement(null);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (onDismissExternal) onDismissExternal();
    }, remaining);
  };

  // Watch external prop
  useEffect(() => {
    if (externalAnnouncement) {
      triggerAnnouncement(externalAnnouncement);
    }
  }, [externalAnnouncement]);

  // Connect to SSE stream to receive live announcements in real time
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let isMounted = true;

    try {
      eventSource = new EventSource('/api/radio/stream');

      eventSource.addEventListener('announcement', (event) => {
        try {
          const data: GlobalAnnouncement = JSON.parse(event.data);
          if (data && isMounted) {
            triggerAnnouncement(data);
          }
        } catch (err) {
          console.error('[SSE Global Announcement Parse Error]', err);
        }
      });
    } catch (err) {
      console.warn('[SSE Connection Warning]', err);
    }

    // Also check initial current announcement
    fetch('/api/announcement/current')
      .then((res) => res.json())
      .then((data) => {
        if (data?.announcement && isMounted) {
          triggerAnnouncement(data.announcement);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
      if (eventSource) eventSource.close();
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  const handleManualClose = () => {
    sounds.playPop();
    setActiveAnnouncement(null);
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    if (onDismissExternal) onDismissExternal();
  };

  return (
    <AnimatePresence>
      {activeAnnouncement && (
        <motion.div
          id="global-announcement-overlay"
          initial={{ opacity: 0, y: -60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[94%] max-w-2xl pointer-events-auto"
        >
          <div className="relative rounded-3xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 p-1 shadow-2xl shadow-amber-500/40 border-2 border-yellow-200">
            {/* Inner Content Card */}
            <div className="relative bg-gray-950/95 backdrop-blur-xl rounded-[22px] p-3.5 sm:p-4 text-white overflow-hidden">
              {/* Background Glow & Sparkles */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-3 sm:gap-4 relative z-10">
                {/* 1. SENDER PHOTO IN FRONT (Requested: foto de quem enviou na frente) */}
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl p-0.5 bg-gradient-to-tr from-yellow-300 via-amber-400 to-yellow-500 shadow-lg shadow-amber-500/30">
                    <img
                      src={activeAnnouncement.senderPhoto}
                      alt={activeAnnouncement.senderName}
                      className="w-full h-full object-cover rounded-[14px]"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  {/* Crown / Golden Badge Pin */}
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-950 p-1 rounded-full shadow-md border-2 border-gray-950">
                    <Crown className="w-3 h-3 fill-current" />
                  </div>
                </div>

                {/* 2. ANNOUNCEMENT TEXT & SENDER INFO */}
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-0.5">
                    <span className="bg-gradient-to-r from-amber-400 to-yellow-300 text-gray-950 text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                      <Megaphone className="w-3 h-3 fill-current" />
                      <span>{activeAnnouncement.badge || 'Aviso Global Oficial'}</span>
                    </span>

                    <span className="text-yellow-300 font-bold text-xs truncate">
                      {activeAnnouncement.senderName}
                    </span>
                  </div>

                  <p className="font-display font-black text-sm sm:text-base text-white leading-snug tracking-tight drop-shadow-sm line-clamp-3 sm:line-clamp-none">
                    "{activeAnnouncement.message}"
                  </p>

                  <div className="flex items-center gap-2 mt-1 text-[10px] text-amber-200/80 font-medium">
                    <span className="inline-flex items-center gap-1">
                      <Radio className="w-2.5 h-2.5 text-amber-400 animate-pulse" />
                      <span>Transmitido ao vivo para todos na escola</span>
                    </span>
                  </div>
                </div>

                {/* 3. DISMISS BUTTON */}
                <button
                  type="button"
                  id="btn-close-global-announcement"
                  onClick={handleManualClose}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-colors cursor-pointer flex-shrink-0 self-start sm:self-center"
                  title="Fechar aviso"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Bar Ticking Down Duration */}
              <div className="w-full bg-gray-800/80 rounded-full h-1 mt-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-yellow-300 via-amber-400 to-amber-500 h-full transition-all duration-75 ease-linear"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
