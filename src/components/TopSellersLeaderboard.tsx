import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, 
  Crown, 
  Heart, 
  Users, 
  ShoppingBag, 
  Sparkles, 
  Smartphone, 
  UserPlus, 
  UserCheck, 
  ShieldCheck,
  Flame,
  Star
} from 'lucide-react';
import { UserProfile, Order } from '../types';
import { sounds } from '../utils/audioEffects';
import { ProfileReportModal } from './ProfileReportModal';

interface TopSellersLeaderboardProps {
  users: UserProfile[];
  onFollowToggle: (userId: string) => void;
  followedUserIds: string[];
  currentUser: UserProfile | null;
  orders?: Order[];
  onUpdateUser?: (updated: UserProfile) => void;
}

export const TopSellersLeaderboard: React.FC<TopSellersLeaderboardProps> = ({
  users,
  onFollowToggle,
  followedUserIds,
  currentUser,
  orders = [],
  onUpdateUser,
}) => {
  const [filterRole, setFilterRole] = useState<'all' | 'sellers' | 'all_profiles'>('all');
  const [selectedUserForReport, setSelectedUserForReport] = useState<UserProfile | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Sort by likes received + sales count
  const sortedUsers = [...users].sort((a, b) => {
    const scoreA = a.likesReceived * 1.5 + a.salesCount * 3 + a.followersCount;
    const scoreB = b.likesReceived * 1.5 + b.salesCount * 3 + b.followersCount;
    return scoreB - scoreA;
  });

  const topSellers = sortedUsers.filter((u) => u.role !== 'client' || filterRole === 'all_profiles');

  const rawLikes = users.reduce((acc, u) => acc + u.likesReceived, 0);
  const rawSales = users.reduce((acc, u) => acc + u.salesCount, 0);
  const rawFollows = users.reduce((acc, u) => acc + u.followersCount, 0);

  // System baseline metrics requested by user: 1400 likes, 223 delivered sales, 372 active followers, 100% Top
  const totalLikes = Math.max(1400, rawLikes);
  const totalSales = Math.max(223, rawSales);
  const totalFollows = Math.max(372, rawFollows);

  const handleOpenReport = (user: UserProfile) => {
    sounds.playSparkle();
    setSelectedUserForReport(user);
    setIsReportOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Real-time Engagement Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-3xl p-4 shadow-sm border-2 border-pink-400 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-bold text-lg">
            <Heart className="w-5 h-5 fill-white text-white" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-pink-100 block">Total de Likes</span>
            <span className="font-display font-black text-xl sm:text-2xl">{totalLikes}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-3xl p-4 shadow-sm border-2 border-purple-400 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-bold text-lg">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-purple-100 block">Vendas Entregues</span>
            <span className="font-display font-black text-xl sm:text-2xl">{totalSales}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-400 to-yellow-500 text-amber-950 rounded-3xl p-4 shadow-sm border-2 border-yellow-300 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/40 flex items-center justify-center font-bold text-lg">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-amber-900 block">Seguidores Ativos</span>
            <span className="font-display font-black text-xl sm:text-2xl">{totalFollows}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-3xl p-4 shadow-sm border-2 border-emerald-400 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-bold text-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-emerald-100 block">Escola Gilvan</span>
            <span className="font-display font-black text-xl sm:text-2xl">100% Top</span>
          </div>
        </div>
      </div>

      {/* Leaderboard Ranking Card */}
      <div className="bg-white rounded-3xl border-3 border-pink-200 p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-pink-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-lg sm:text-xl text-gray-900 leading-tight">
                Top Global Vendedores & Comunidade HL
              </h2>
              <p className="text-xs text-gray-500">
                Os vendedores mais curtidos e seguidos pelos alunos do C.E.P.M.G Gilvan Sampaio
              </p>
            </div>
          </div>

          {/* Tab Filter */}
          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-2xl border border-gray-200 text-xs font-bold">
            <button
              onClick={() => setFilterRole('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filterRole === 'all' ? 'bg-pink-500 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Vendedores Top
            </button>
            <button
              onClick={() => setFilterRole('all_profiles')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filterRole === 'all_profiles' ? 'bg-pink-500 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Todos os Perfis
            </button>
          </div>
        </div>

        {/* Podium / Ranked Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {topSellers.map((user, index) => {
            const isFollowed = followedUserIds.includes(user.id);
            const isMe = currentUser?.id === user.id;

            return (
              <motion.div
                key={user.id}
                whileHover={{ y: -4 }}
                className={`relative rounded-3xl p-4 sm:p-5 border-3 transition-all flex flex-col justify-between ${
                  user.isMaxAdmin
                    ? 'bg-gradient-to-b from-amber-50/80 to-white border-yellow-400 shadow-md ring-2 ring-yellow-400/20'
                    : index === 0
                    ? 'bg-gradient-to-b from-pink-50/80 to-white border-pink-400 shadow-md'
                    : 'bg-white border-pink-200 hover:border-pink-300 shadow-xs'
                }`}
              >
                {/* Ranking Position Badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1">
                  {index === 0 ? (
                    <span className="bg-yellow-400 text-yellow-950 font-black text-xs px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1 border border-yellow-300">
                      🥇 #1 Top Vendedor
                    </span>
                  ) : index === 1 ? (
                    <span className="bg-gray-200 text-gray-800 font-bold text-xs px-2 py-0.5 rounded-full">
                      🥈 #2
                    </span>
                  ) : index === 2 ? (
                    <span className="bg-amber-700/20 text-amber-900 font-bold text-xs px-2 py-0.5 rounded-full">
                      🥉 #3
                    </span>
                  ) : (
                    <span className="text-gray-400 font-bold text-xs">
                      #{index + 1}
                    </span>
                  )}
                </div>

                {/* Profile Header */}
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-pink-300 shadow-sm"
                    />
                    {user.isMaxAdmin ? (
                      <span className="absolute -top-2 -right-2 bg-yellow-400 text-amber-950 p-1 rounded-full shadow-md text-xs font-black border border-white" title="Adm Máximo (João Lucas)">
                        👑
                      </span>
                    ) : (
                      <span className="absolute -bottom-1 -right-1 bg-pink-500 text-white p-0.5 rounded-full shadow-xs">
                        <Star className="w-3 h-3 fill-yellow-300 text-yellow-300" />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 pr-12">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-display font-black text-base text-gray-900 truncate">
                        {user.name}
                      </h3>
                    </div>

                    <p className="text-[11px] font-semibold text-purple-600">
                      {user.isMaxAdmin ? '👑 Adm Máximo (Dono)' : user.role === 'seller' ? '✨ Vendedora Estrela' : '🎓 Aluno(a) Gilvan Sampaio'}
                    </p>

                    {user.deviceLastUsed && (
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                        <Smartphone className="w-2.5 h-2.5 text-pink-500" />
                        <span className="truncate max-w-[130px]">{user.deviceLastUsed}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <p className="text-gray-600 text-xs mt-3 line-clamp-2 leading-relaxed">
                  {user.bio || 'Membro oficial do HL Vendas no C.E.P.M.G Gilvan Sampaio.'}
                </p>

                {/* Metrics Row */}
                <div className="grid grid-cols-3 gap-2 bg-pink-50/50 rounded-2xl p-2.5 my-3 text-center border border-pink-100">
                  <div>
                    <span className="block text-[10px] text-gray-500 font-semibold">Likes</span>
                    <span className="font-display font-black text-sm text-pink-600">
                      {user.likesReceived}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-500 font-semibold">Vendas</span>
                    <span className="font-display font-black text-sm text-purple-600">
                      {user.salesCount}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-500 font-semibold">Seguidores</span>
                    <span className="font-display font-black text-sm text-amber-600">
                      {user.followersCount + (isFollowed ? 1 : 0)}
                    </span>
                  </div>
                </div>

                {/* Actions: Follow and View Report */}
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isMe}
                    onClick={() => {
                      sounds.playPop();
                      onFollowToggle(user.id);
                    }}
                    className={`flex-1 py-2.5 rounded-2xl font-display font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                      isMe
                        ? 'bg-gray-100 text-gray-400 cursor-default'
                        : isFollowed
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                        : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-sm cursor-pointer'
                    }`}
                  >
                    {isMe ? (
                      <span>Seu Perfil</span>
                    ) : isFollowed ? (
                      <>
                        <UserCheck className="w-4 h-4 text-emerald-700" />
                        <span>Seguindo</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Seguir</span>
                      </>
                    )}
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => handleOpenReport(user)}
                    className="px-3 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-2xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                    title="Ver Relatório Completo do Perfil"
                  >
                    <span>📊</span>
                    <span>Relatório</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Profile Report Modal */}
      <ProfileReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        user={selectedUserForReport}
        currentUser={currentUser}
        orders={orders}
        onUpdateUser={(updated) => {
          if (onUpdateUser) onUpdateUser(updated);
          setSelectedUserForReport(updated);
        }}
        isFollowing={selectedUserForReport ? followedUserIds.includes(selectedUserForReport.id) : false}
        onToggleFollow={onFollowToggle}
      />
    </div>
  );
};
