import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  ShoppingBag, 
  Users, 
  Sparkles, 
  Check, 
  Star, 
  Award, 
  TrendingUp, 
  Plus,
  MessageSquare
} from 'lucide-react';
import { sounds } from '../utils/audioEffects';
import { Order, SchoolReview } from '../types';

interface StoreEngagementMetricsProps {
  orders: Order[];
  onOpenLeaderboard?: () => void;
  onOpenOrderModal?: () => void;
  onOpenProfilesTab?: () => void;
  reviews?: SchoolReview[];
  onAddReview?: (review: Omit<SchoolReview, 'id' | 'date' | 'likes'>) => void;
  globalStoreLikes?: number;
  onToggleGlobalLike?: (isLiked: boolean) => void;
}

export const StoreEngagementMetrics: React.FC<StoreEngagementMetricsProps> = ({
  orders,
  onOpenLeaderboard,
  onOpenOrderModal,
  onOpenProfilesTab,
  reviews = [],
  onAddReview,
  globalStoreLikes,
  onToggleGlobalLike,
}) => {
  // Real-time Likes State sincronizado com backend global ou local
  const [localLikes, setLocalLikes] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('hl_store_likes_zeroed');
      if (saved !== null) return Math.max(0, Number(saved));
    } catch {}
    return 0;
  });

  const displayLikes = typeof globalStoreLikes === 'number' ? globalStoreLikes : localLikes;

  const [hasLikedStore, setHasLikedStore] = useState<boolean>(() => {
    try {
      return localStorage.getItem('hl_user_liked_store_zeroed') === 'true';
    } catch {}
    return false;
  });

  // Real-time Followers State - Starts at 0
  const [storeFollowers, setStoreFollowers] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('hl_store_followers_zeroed');
      if (saved !== null) return Math.max(0, Number(saved));
    } catch {}
    return 0;
  });

  const [isFollowingStore, setIsFollowingStore] = useState<boolean>(() => {
    try {
      return localStorage.getItem('hl_user_following_store_zeroed') === 'true';
    } catch {}
    return false;
  });

  // Calculate real delivered orders count: Starts strictly at 0 and grows only when orders are marked as 'entregue'
  const totalDelivered = orders.filter((o) => o.status === 'entregue').length;

  // School Score calculated exclusively from school reviews:
  // "menos a da escola que so abaixa ou sobe por avaliações"
  const totalReviewStars = reviews.reduce((acc, r) => acc + r.rating, 0);
  const averageStars = reviews.length > 0 ? totalReviewStars / reviews.length : 5.0;
  const schoolPercentage = Math.min(100, Math.max(0, Math.round((averageStars / 5) * 100)));

  // Quick review modal
  const [isQuickReviewOpen, setIsQuickReviewOpen] = useState(false);
  const [quickRating, setQuickRating] = useState(5);
  const [quickComment, setQuickComment] = useState('');
  const [quickName, setQuickName] = useState('');
  const [reviewSent, setReviewSent] = useState(false);

  // Handle Like Button (Sincronizado globalmente no servidor)
  const handleLikeToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playPop();
    const nextLiked = !hasLikedStore;
    setHasLikedStore(nextLiked);
    localStorage.setItem('hl_user_liked_store_zeroed', String(nextLiked));

    if (onToggleGlobalLike) {
      onToggleGlobalLike(nextLiked);
    } else {
      const updated = nextLiked ? localLikes + 1 : Math.max(0, localLikes - 1);
      setLocalLikes(updated);
      localStorage.setItem('hl_store_likes_zeroed', updated.toString());
    }
  };

  // Handle Follow Button
  const handleFollowToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playSparkle();
    if (isFollowingStore) {
      const updated = Math.max(0, storeFollowers - 1);
      setStoreFollowers(updated);
      setIsFollowingStore(false);
      localStorage.setItem('hl_store_followers_zeroed', updated.toString());
      localStorage.setItem('hl_user_following_store_zeroed', 'false');
    } else {
      const updated = storeFollowers + 1;
      setStoreFollowers(updated);
      setIsFollowingStore(true);
      localStorage.setItem('hl_store_followers_zeroed', updated.toString());
      localStorage.setItem('hl_user_following_store_zeroed', 'true');
    }
  };

  const handleQuickReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickComment.trim()) return;

    sounds.playFanfare();
    if (onAddReview) {
      onAddReview({
        authorId: `rev-anon-${Date.now()}`,
        authorName: quickName.trim() || 'Aluno do Gilvan',
        authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        rating: quickRating,
        comment: quickComment.trim(),
        studentGrade: 'C.E.P.M.G Gilvan Sampaio',
      });
    }

    setReviewSent(true);
    setTimeout(() => {
      setReviewSent(false);
      setIsQuickReviewOpen(false);
      setQuickComment('');
      setQuickName('');
    }, 1500);
  };

  return (
    <div className="w-full space-y-2">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Metric 1: Total de Likes (Starts at 0, grows/shrinks dynamically) */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={handleLikeToggle}
          className="group relative cursor-pointer bg-gradient-to-br from-pink-500 to-rose-600 text-white rounded-3xl p-3.5 sm:p-4 shadow-sm hover:shadow-md border-2 border-pink-400 flex flex-col justify-between transition-all select-none overflow-hidden"
          title="Clique para curtir ou descurtir a loja HL Vendas!"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 shadow-inner">
              <Heart className={`w-5 h-5 transition-transform group-hover:scale-110 ${hasLikedStore ? 'fill-white text-white' : 'text-white'}`} />
            </div>
            <button
              type="button"
              className={`text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full transition-all shadow-xs cursor-pointer ${
                hasLikedStore ? 'bg-white text-pink-600' : 'bg-white/25 text-white hover:bg-white/35'
              }`}
            >
              {hasLikedStore ? '❤️ Curtido' : '+ Curtir'}
            </button>
          </div>

          <div className="mt-2 sm:mt-3">
            <span className="text-[11px] sm:text-xs font-semibold text-pink-100 block">
              Total de Likes
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-black text-2xl sm:text-3xl tracking-tight leading-none">
                {displayLikes}
              </span>
              <span className="text-[10px] text-pink-200 font-bold">dinâmico</span>
            </div>
          </div>
        </motion.div>

        {/* Metric 2: Vendas Entregues (Starts at 0, counts real delivered orders) */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => onOpenOrderModal && onOpenOrderModal()}
          className="group relative cursor-pointer bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-3xl p-3.5 sm:p-4 shadow-sm hover:shadow-md border-2 border-purple-400 flex flex-col justify-between transition-all select-none overflow-hidden"
          title="Clique para encomendar ou ver entregas!"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 shadow-inner">
              <ShoppingBag className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full bg-purple-400/40 text-purple-100">
              {totalDelivered > 0 ? `${totalDelivered} Concluídas` : 'Zeradas'}
            </span>
          </div>

          <div className="mt-2 sm:mt-3">
            <span className="text-[11px] sm:text-xs font-semibold text-purple-100 block">
              Vendas Entregues
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-black text-2xl sm:text-3xl tracking-tight leading-none">
                {totalDelivered}
              </span>
              <span className="text-[10px] text-purple-200 font-bold">pedidos</span>
            </div>
          </div>
        </motion.div>

        {/* Metric 3: Seguidores Ativos (Starts at 0, grows/shrinks dynamically) */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={handleFollowToggle}
          className="group relative cursor-pointer bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-500 text-amber-950 rounded-3xl p-3.5 sm:p-4 shadow-sm hover:shadow-md border-2 border-yellow-300 flex flex-col justify-between transition-all select-none overflow-hidden"
          title="Clique para seguir ou deixar de seguir a loja!"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/35 flex items-center justify-center flex-shrink-0 shadow-inner">
              <Users className="w-5 h-5 text-amber-950 group-hover:scale-110 transition-transform" />
            </div>
            <button
              type="button"
              className={`text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full transition-all shadow-xs cursor-pointer ${
                isFollowingStore ? 'bg-amber-950 text-yellow-300' : 'bg-white/40 text-amber-950 hover:bg-white/60'
              }`}
            >
              {isFollowingStore ? '✓ Seguindo' : '+ Seguir'}
            </button>
          </div>

          <div className="mt-2 sm:mt-3">
            <span className="text-[11px] sm:text-xs font-bold text-amber-900 block">
              Seguidores Ativos
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-black text-2xl sm:text-3xl tracking-tight leading-none text-amber-950">
                {storeFollowers}
              </span>
              <span className="text-[10px] text-amber-900 font-bold">alunos</span>
            </div>
          </div>
        </motion.div>

        {/* Metric 4: Escola Gilvan (Only changes based on real reviews!) */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => {
            sounds.playSparkle();
            setIsQuickReviewOpen(true);
          }}
          className="group relative cursor-pointer bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 text-white rounded-3xl p-3.5 sm:p-4 shadow-sm hover:shadow-md border-2 border-emerald-400 flex flex-col justify-between transition-all select-none overflow-hidden"
          title="Clique para avaliar a escola e ver a aprovação mudar!"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 shadow-inner">
              <Sparkles className="w-5 h-5 text-yellow-200 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-center gap-0.5 text-yellow-300">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3 h-3 ${s <= Math.round(averageStars) ? 'fill-yellow-300 text-yellow-300' : 'text-emerald-300'}`}
                />
              ))}
            </div>
          </div>

          <div className="mt-2 sm:mt-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold text-emerald-100 block">
                Escola Gilvan
              </span>
              <span className="text-[9px] bg-white/20 px-1.5 py-0.2 rounded-full font-bold">
                ⭐ Avaliar
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-black text-2xl sm:text-3xl tracking-tight leading-none">
                {schoolPercentage}% Top
              </span>
              <span className="text-[10px] text-emerald-200 font-bold">
                ({reviews.length} avaliações)
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Rating Modal */}
      <AnimatePresence>
        {isQuickReviewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl border-3 border-emerald-400 p-5 w-full max-w-sm shadow-2xl text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-display font-black text-base text-gray-900 flex items-center gap-1.5">
                  <span>⭐ Avaliar Escola C.E.P.M.G Gilvan</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsQuickReviewOpen(false)}
                  className="text-gray-400 hover:text-gray-600 font-bold text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Sua avaliação afeta a porcentagem de aprovação da escola em tempo real!
              </p>

              <form onSubmit={handleQuickReviewSubmit} className="space-y-3">
                <div className="flex items-center justify-center gap-2 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => {
                        sounds.playPop();
                        setQuickRating(star);
                      }}
                      className="p-1 hover:scale-120 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 ${star <= quickRating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                      />
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  placeholder="Seu nome (ex: Julia, 7º B)..."
                  className="w-full px-3 py-2 bg-gray-50 rounded-xl text-xs border border-gray-200 focus:ring-2 focus:ring-emerald-400 font-medium"
                />

                <input
                  type="text"
                  value={quickComment}
                  onChange={(e) => setQuickComment(e.target.value)}
                  placeholder="Comentário sobre a escola e as vendas..."
                  className="w-full px-3 py-2 bg-gray-50 rounded-xl text-xs border border-gray-200 focus:ring-2 focus:ring-emerald-400 font-medium"
                  required
                />

                {reviewSent ? (
                  <div className="text-xs font-bold text-emerald-600 text-center py-2 flex items-center justify-center gap-1">
                    <Check className="w-4 h-4" />
                    <span>Nota registrada! A porcentagem foi atualizada!</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsQuickReviewOpen(false)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer hover:shadow-md transition-all"
                    >
                      Enviar Nota
                    </button>
                  </div>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
