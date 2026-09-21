import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  MessageCircle, 
  Search, 
  UserPlus, 
  UserCheck, 
  Send, 
  Smile, 
  Sparkles, 
  Star, 
  ShieldCheck, 
  Flame, 
  Heart, 
  Camera, 
  Check, 
  Clock, 
  User, 
  MessageSquare,
  Award,
  Crown,
  Trash2
} from 'lucide-react';
import { UserProfile, SchoolReview, CommunityChatMessage, Order } from '../types';
import { sounds } from '../utils/audioEffects';
import { ProfileReportModal } from './ProfileReportModal';

interface CommunityProfilesChatProps {
  users: UserProfile[];
  currentUser: UserProfile | null;
  onUpdateUsers: (updatedUsers: UserProfile[]) => void;
  onUpdateCurrentUser?: (user: UserProfile) => void;
  onOpenAvatarModal?: (user: UserProfile) => void;
  onDeleteUser?: (userId: string) => void;
  onUpdateUserAvatar?: (userId: string, newAvatarUrl: string) => void;
  onUpdateUserProfile?: (updatedUser: UserProfile) => void;
  followedUserIds: string[];
  onFollowToggle: (userId: string) => void;
  reviews: SchoolReview[];
  onAddReview: (review: Omit<SchoolReview, 'id' | 'date' | 'likes'>) => void;
  orders: Order[];
}

export const CommunityProfilesChat: React.FC<CommunityProfilesChatProps> = ({
  users,
  currentUser,
  onUpdateUsers,
  onUpdateCurrentUser,
  onOpenAvatarModal,
  onDeleteUser,
  onUpdateUserAvatar,
  onUpdateUserProfile,
  followedUserIds,
  onFollowToggle,
  reviews,
  onAddReview,
  orders,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profiles' | 'chat' | 'reviews'>('profiles');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'students' | 'team'>('all');
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Direct Chat Target User
  const [selectedChatUser, setSelectedChatUser] = useState<UserProfile | null>(null);

  // Profile Report Modal State
  const [selectedUserForReport, setSelectedUserForReport] = useState<UserProfile | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // New Student Profile Form State
  const [isCreateProfileOpen, setIsCreateProfileOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGrade, setNewGrade] = useState('8º Ano A');
  const [newBio, setNewBio] = useState('');
  const [newAvatar, setNewAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');

  // Review Form State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewGrade, setReviewGrade] = useState('8º Ano A');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Chat Messages State with localStorage
  const [chatMessages, setChatMessages] = useState<CommunityChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('hl_community_chat_messages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      {
        id: 'msg-seed-1',
        senderId: 'user-joao-lucas',
        senderName: 'João Lucas (Adm Máximo)',
        senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        senderRole: 'Adm Máximo',
        text: 'Bem-vindos ao Bate-Papo da Comunidade do C.E.P.M.G Gilvan Sampaio! 🐾 Aqui todos os alunos podem conversar e tirar dúvidas das entregas!',
        timestamp: '14:30',
        channel: 'geral',
        sticker: '⚡',
      },
      {
        id: 'msg-seed-2',
        senderId: 'user-helena',
        senderName: 'Helena',
        senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        senderRole: 'Vendedora Estrela',
        text: 'Oii gente! Segunda às 15:30 estarei no portão com os squishies e borrachas novas! Quem quiser reservar é só chamar aqui ou no catálogo! 💖',
        timestamp: '14:45',
        channel: 'geral',
        sticker: '🐾',
      },
      {
        id: 'msg-seed-3',
        senderId: 'user-cliente-demo',
        senderName: 'Maria Clara',
        senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        senderRole: 'Estudante',
        text: 'Helena, o meu squishy do pandinha já tá separado? Vou buscar na segunda!',
        timestamp: '15:10',
        channel: 'geral',
        sticker: '✨',
      }
    ];
  });

  const [chatInputText, setChatInputText] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('hl_community_chat_messages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    if (activeSubTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeSubTab, selectedChatUser]);

  // Current User Avatar sync: ensure messages show the current updated avatar
  const getSenderAvatar = (userId: string, defaultAvatar: string) => {
    const found = users.find((u) => u.id === userId);
    return found?.avatar || defaultAvatar;
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.bio && u.bio.toLowerCase().includes(searchQuery.toLowerCase())) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (roleFilter === 'students') return u.role === 'client';
    if (roleFilter === 'team') return u.role !== 'client';
    return true;
  });

  // School rating calculation from reviews
  const totalStars = reviews.reduce((acc, r) => acc + r.rating, 0);
  const avgStars = reviews.length > 0 ? totalStars / reviews.length : 5.0;
  const schoolScorePercentage = Math.min(100, Math.max(0, Math.round((avgStars / 5) * 100)));

  // Send Message
  const handleSendMessage = (e?: React.FormEvent, customSticker?: string) => {
    if (e) e.preventDefault();
    if (!chatInputText.trim() && !customSticker) return;

    sounds.playPop();

    const sender = currentUser || {
      id: 'guest-student',
      name: 'Aluno do Gilvan',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      role: 'client',
      isMaxAdmin: false,
    };

    const newMsg: CommunityChatMessage = {
      id: `cmsg-${Date.now()}`,
      senderId: sender.id,
      senderName: sender.name,
      senderAvatar: sender.avatar,
      senderRole: sender.isMaxAdmin ? 'Adm Máximo' : sender.role === 'seller' ? 'Vendedora' : 'Estudante',
      text: chatInputText.trim() || (customSticker ? `Enviou ${customSticker}` : ''),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      channel: selectedChatUser ? selectedChatUser.id : 'geral',
      sticker: customSticker,
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setChatInputText('');
  };

  // Submit Review
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    sounds.playFanfare();
    setIsSubmittingReview(true);

    const author = currentUser || {
      id: `anon-${Date.now()}`,
      name: 'Estudante Gilvan',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    };

    onAddReview({
      authorId: author.id,
      authorName: author.name,
      authorAvatar: author.avatar,
      rating: reviewRating,
      comment: reviewComment.trim(),
      studentGrade: reviewGrade,
    });

    setReviewComment('');
    setReviewSuccess(true);
    setIsSubmittingReview(false);
    setTimeout(() => setReviewSuccess(false), 3000);
  };

  // Create or Update Profile
  const handleCreateStudentProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    sounds.playSuccess();

    const newProfile: UserProfile = {
      id: `user-student-${Date.now()}`,
      name: newName.trim(),
      email: `${newName.toLowerCase().replace(/\s+/g, '')}@estudante.gilvan`,
      avatar: newAvatar,
      role: 'client',
      isMaxAdmin: false,
      followersCount: 0,
      likesReceived: 0,
      salesCount: 0,
      password: '123',
      permissions: {
        canEditProducts: false,
        canViewOrders: false,
        canEditSchedule: false,
        canPostStatus: false,
        canManageCoupons: false,
        canSendGlobalMessages: false,
        canChatWithClients: true,
        canManageTeam: false,
      },
      createdAt: new Date().toISOString(),
      deviceLastUsed: 'Celular Estudante',
      bio: `🎒 Estudante ${newGrade} do C.E.P.M.G Gilvan Sampaio. ${newBio.trim()}`,
    };

    const updated = [...users, newProfile];
    onUpdateUsers(updated);

    // If currentUser is guest, set as current user
    if (!currentUser || currentUser.role === 'client') {
      if (onUpdateCurrentUser) onUpdateCurrentUser(newProfile);
    }

    setNewName('');
    setNewBio('');
    setIsCreateProfileOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Community Top Header Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 rounded-3xl p-5 sm:p-7 text-white shadow-md border-3 border-pink-300 flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden">
        {/* Cute floating sticker decorations */}
        <div className="absolute top-2 right-4 text-3xl opacity-20 pointer-events-none animate-bounce">
          🐾 💖 ✨
        </div>

        <div className="space-y-1 text-center md:text-left max-w-xl">
          <div className="inline-flex items-center gap-1.5 bg-yellow-400 text-yellow-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Comunidade Escolar C.E.P.M.G Gilvan Sampaio</span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
            Perfis & Bate-Papo da Escola
          </h2>
          <p className="text-xs sm:text-sm text-pink-100 font-medium">
            Encontre colegas de turma, adicione novos amigos, converse em tempo real e avalie a loja e a escola!
          </p>
        </div>

        {/* School Dynamic Score Badge */}
        <div 
          onClick={() => setActiveSubTab('reviews')}
          className="cursor-pointer bg-white/20 backdrop-blur-md rounded-2xl p-3 border border-white/40 flex items-center gap-3 text-white hover:bg-white/30 transition-all flex-shrink-0 shadow-sm"
          title="Clique para ver e adicionar avaliações da escola"
        >
          <div className="w-12 h-12 rounded-xl bg-white text-yellow-500 flex items-center justify-center font-black text-2xl shadow-inner">
            ⭐
          </div>
          <div className="text-left">
            <span className="text-[10px] font-bold text-pink-200 block uppercase">
              Aprovação Escolar
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-display font-black text-2xl tracking-tight text-yellow-300">
                {schoolScorePercentage}% Top
              </span>
            </div>
            <span className="text-[10px] text-white/80 font-medium block">
              {reviews.length} avaliações de alunos
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex items-center justify-center sm:justify-start gap-2 border-b border-pink-100 pb-3">
        <button
          type="button"
          onClick={() => {
            sounds.playPop();
            setActiveSubTab('profiles');
          }}
          className={`px-4 py-2 rounded-2xl font-display font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'profiles'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-purple-50 border border-gray-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Diretório de Alunos ({users.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playPop();
            setActiveSubTab('chat');
          }}
          className={`px-4 py-2 rounded-2xl font-display font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer relative ${
            activeSubTab === 'chat'
              ? 'bg-pink-600 text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-pink-50 border border-gray-200'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>Bate-Papo ao Vivo</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playPop();
            setActiveSubTab('reviews');
          }}
          className={`px-4 py-2 rounded-2xl font-display font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'reviews'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-amber-50 border border-gray-200'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Avaliações ({reviews.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. ABA: DIRETÓRIO DE PERFIS (ADICIONAR PESSOAS) */}
      {/* ========================================================================= */}
      {activeSubTab === 'profiles' && (
        <div className="space-y-4">
          {/* Controls: Search, Filters, and Add Profile Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-pink-100 shadow-2xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nome, turma ou bio..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-2xl text-xs sm:text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setRoleFilter('all')}
                  className={`px-2.5 py-1 rounded-xl transition-colors cursor-pointer ${
                    roleFilter === 'all' ? 'bg-white text-purple-700 shadow-2xs' : 'text-gray-500'
                  }`}
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter('students')}
                  className={`px-2.5 py-1 rounded-xl transition-colors cursor-pointer ${
                    roleFilter === 'students' ? 'bg-white text-purple-700 shadow-2xs' : 'text-gray-500'
                  }`}
                >
                  Alunos
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter('team')}
                  className={`px-2.5 py-1 rounded-xl transition-colors cursor-pointer ${
                    roleFilter === 'team' ? 'bg-white text-purple-700 shadow-2xs' : 'text-gray-500'
                  }`}
                >
                  Equipe HL
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  sounds.playPop();
                  setIsCreateProfileOpen(true);
                }}
                className="px-3 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer flex-shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Criar Perfil</span>
              </motion.button>
            </div>
          </div>

          {/* Profile Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => {
              const isMe = currentUser?.id === user.id;
              const isFollowed = followedUserIds.includes(user.id);
              const isMaxAdmin = user.isMaxAdmin || user.email?.toLowerCase() === 'joaolucasgp1234@gmail.com';

              return (
                <motion.div
                  key={user.id}
                  whileHover={{ y: -3 }}
                  className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-pink-100 hover:border-pink-300 shadow-sm transition-all flex flex-col justify-between relative group"
                >
                  <div>
                    {/* Top row: Avatar and Badges */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="relative">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-pink-200 shadow-xs"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" title="Online no colégio"></span>
                      </div>

                      <div className="text-right flex flex-col items-end gap-1">
                        {isMaxAdmin ? (
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <Crown className="w-3 h-3 text-amber-600" />
                            <span>Adm Máximo</span>
                          </span>
                        ) : user.role === 'seller' ? (
                          <span className="bg-pink-100 text-pink-800 border border-pink-300 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-pink-600" />
                            <span>Vendedora</span>
                          </span>
                        ) : (
                          <span className="bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Estudante
                          </span>
                        )}

                        <span className="text-[10px] text-gray-400 font-medium">
                          {user.followersCount} amigos
                        </span>
                      </div>
                    </div>

                    {/* Name & Bio */}
                    <h3 className="font-display font-black text-sm sm:text-base text-gray-900 leading-tight">
                      {user.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 min-h-[2rem]">
                      {user.bio || 'Estudante do C.E.P.M.G Gilvan Sampaio. Apaixonado(a) por fofuras e squishies!'}
                    </p>
                  </div>

                  {/* Actions: Add/Follow, Chat, and Report */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                    {/* Add / Follow Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isMe}
                      onClick={() => {
                        sounds.playPop();
                        onFollowToggle(user.id);
                      }}
                      className={`flex-1 py-2 rounded-2xl font-display font-bold text-xs flex items-center justify-center gap-1 transition-all shadow-xs ${
                        isMe
                          ? 'bg-gray-100 text-gray-400 cursor-default'
                          : isFollowed
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200 cursor-pointer'
                          : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white cursor-pointer'
                      }`}
                    >
                      {isMe ? (
                        <span>Você</span>
                      ) : isFollowed ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Amigo</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>+ Adicionar</span>
                        </>
                      )}
                    </motion.button>

                    {/* Chat Direct Button */}
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playPop();
                        setSelectedChatUser(user);
                        setActiveSubTab('chat');
                      }}
                      className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
                      title={`Bater papo com ${user.name}`}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>

                    {/* View Report Button */}
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playSparkle();
                        setSelectedUserForReport(user);
                        setIsReportModalOpen(true);
                      }}
                      className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
                      title="Ver Relatório do Perfil"
                    >
                      <Award className="w-4 h-4 text-amber-500" />
                    </button>

                    {/* Quick Delete Profile Button (Only for Max Admin & not self/not primary root account) */}
                    {(currentUser?.isMaxAdmin || currentUser?.email?.toLowerCase() === 'joaolucasgp1234@gmail.com') && !isMe && !(user.email?.toLowerCase() === 'joaolucasgp1234@gmail.com' && user.id === 'user-joao-lucas') && (
                      deletingUserId === user.id ? (
                        <div className="flex items-center gap-1 bg-rose-50 border border-rose-300 rounded-xl p-1">
                          <button
                            type="button"
                            onClick={() => {
                              sounds.playPop();
                              if (onDeleteUser) {
                                onDeleteUser(user.id);
                              } else {
                                onUpdateUsers(users.filter((u) => u.id !== user.id));
                              }
                              setDeletingUserId(null);
                            }}
                            className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded-lg cursor-pointer hover:bg-rose-700"
                          >
                            Apagar
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingUserId(null)}
                            className="px-1.5 py-0.5 bg-white border border-gray-300 text-gray-700 text-[10px] font-bold rounded-lg cursor-pointer"
                          >
                            X
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playPop();
                            setDeletingUserId(user.id);
                          }}
                          className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
                          title={`Apagar perfil de ${user.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ABA: BATE-PAPO AO VIVO (CHAT DA ESCOLA & PRIVADO) */}
      {/* ========================================================================= */}
      {activeSubTab === 'chat' && (
        <div className="bg-white rounded-3xl border-2 border-pink-200 shadow-sm overflow-hidden flex flex-col h-[560px]">
          {/* Chat Header */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 border-b border-pink-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-400 to-purple-500 text-white flex items-center justify-center font-bold text-lg shadow-xs">
                {selectedChatUser ? (
                  <img
                    src={selectedChatUser.avatar}
                    alt=""
                    className="w-full h-full object-cover rounded-2xl"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  '🏫'
                )}
              </div>
              <div>
                <h3 className="font-display font-black text-sm sm:text-base text-gray-900 leading-tight flex items-center gap-1.5">
                  <span>{selectedChatUser ? selectedChatUser.name : 'Bate-Papo Geral Gilvan Sampaio'}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </h3>
                <span className="text-[11px] text-gray-500 font-medium">
                  {selectedChatUser 
                    ? 'Conversa Privada • Resposta em tempo real' 
                    : 'Canal aberto para todos os estudantes, vendedoras e administradores'}
                </span>
              </div>
            </div>

            {selectedChatUser && (
              <button
                type="button"
                onClick={() => setSelectedChatUser(null)}
                className="text-xs font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
              >
                Voltar ao Geral
              </button>
            )}
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-pink-50/20">
            {chatMessages
              .filter((m) => {
                if (selectedChatUser) {
                  return m.channel === selectedChatUser.id || (m.senderId === selectedChatUser.id);
                }
                return m.channel === 'geral';
              })
              .map((msg) => {
                const isMine = currentUser ? msg.senderId === currentUser.id : false;
                const avatarUrl = getSenderAvatar(msg.senderId, msg.senderAvatar);

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <img
                      src={avatarUrl}
                      alt=""
                      className="w-8 h-8 rounded-xl object-cover border border-pink-200 flex-shrink-0 mt-0.5 shadow-2xs"
                      referrerPolicy="no-referrer"
                    />

                    <div className={`max-w-[80%] sm:max-w-[70%] ${isMine ? 'items-end text-right' : 'items-start text-left'}`}>
                      <div className="flex items-center gap-1.5 mb-0.5 text-[11px]">
                        <span className="font-bold text-gray-800">{msg.senderName}</span>
                        <span className="text-[9px] text-gray-400 font-semibold">{msg.timestamp}</span>
                      </div>

                      <div
                        className={`p-3 rounded-2xl text-xs sm:text-sm font-medium shadow-2xs ${
                          isMine
                            ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-tr-xs'
                            : 'bg-white text-gray-800 border border-pink-100 rounded-tl-xs'
                        }`}
                      >
                        {msg.text}
                        {msg.sticker && (
                          <span className="text-xl block mt-1">{msg.sticker}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Cute Stickers Bar */}
          <div className="px-4 py-2 bg-white border-t border-gray-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-bold text-gray-400 flex items-center gap-1 flex-shrink-0">
              <Smile className="w-3.5 h-3.5 text-pink-400" />
              <span>Figurinhas:</span>
            </span>
            {['🐾 Squishy', '✏️ Lápis', '💖 Amor', '🎁 Brinde', '⭐ Gilvan', '⚡ Lumininha'].map((sticker) => (
              <button
                key={sticker}
                type="button"
                onClick={() => handleSendMessage(undefined, sticker)}
                className="px-2.5 py-1 bg-pink-50 hover:bg-pink-100 text-pink-700 text-[11px] font-bold rounded-xl flex-shrink-0 transition-colors cursor-pointer border border-pink-200"
              >
                {sticker}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-pink-100 flex items-center gap-2">
            <input
              type="text"
              value={chatInputText}
              onChange={(e) => setChatInputText(e.target.value)}
              placeholder={
                selectedChatUser 
                  ? `Conversar no privado com ${selectedChatUser.name}...` 
                  : 'Escreva sua mensagem para a comunidade do Gilvan Sampaio...'
              }
              className="flex-1 px-4 py-2.5 bg-gray-50 rounded-2xl text-xs sm:text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
            />

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-display font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs cursor-pointer hover:shadow-md transition-all flex-shrink-0"
            >
              <Send className="w-4 h-4" />
              <span>Enviar</span>
            </motion.button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ABA: MURAL DE AVALIAÇÕES DA ESCOLA GILVAN */}
      {/* ========================================================================= */}
      {activeSubTab === 'reviews' && (
        <div className="space-y-6">
          {/* Score Hero Summary */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-amber-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-16 h-16 rounded-2xl bg-amber-400 text-white flex items-center justify-center font-black text-3xl shadow-inner flex-shrink-0">
                ⭐
              </div>
              <div>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Métrica Dinâmica de Avaliações
                </span>
                <h3 className="font-display font-black text-xl sm:text-2xl text-gray-900 mt-0.5">
                  Nota da Escola: {schoolScorePercentage}% de Aprovação
                </h3>
                <p className="text-xs text-gray-500">
                  Esta estatística sobe ou desce exclusivamente de acordo com as avaliações dos estudantes! Média atual: <strong>{avgStars.toFixed(1)} / 5.0 estrelas</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-amber-400 text-2xl">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-6 h-6 ${s <= Math.round(avgStars) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
          </div>

          {/* New Review Form */}
          <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 rounded-3xl p-5 border-2 border-pink-200 shadow-sm">
            <h4 className="font-display font-black text-base text-gray-900 mb-1 flex items-center gap-1.5">
              <span>⭐ Deixe sua Avaliação para a Escola e o HL Vendas</span>
            </h4>
            <p className="text-xs text-gray-500 mb-4">
              Sua nota ajuda a calcular a porcentagem oficial de aprovação do C.E.P.M.G Gilvan Sampaio!
            </p>

            <form onSubmit={handleSubmitReview} className="space-y-3">
              {/* Interactive Stars Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-700">Sua Nota:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => {
                        sounds.playPop();
                        setReviewRating(star);
                      }}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-black text-amber-600 ml-2">
                  {reviewRating === 5 ? '5.0 (Excelente!)' : `${reviewRating}.0 estrelas`}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Conte como foi sua experiência com os squishies e a entrega no portão..."
                    className="w-full px-4 py-2.5 bg-white rounded-2xl text-xs sm:text-sm border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
                    required
                  />
                </div>
                <div>
                  <select
                    value={reviewGrade}
                    onChange={(e) => setReviewGrade(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white rounded-2xl text-xs sm:text-sm border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 font-semibold text-gray-700 cursor-pointer"
                  >
                    <option value="6º Ano A">6º Ano A</option>
                    <option value="6º Ano B">6º Ano B</option>
                    <option value="7º Ano A">7º Ano A</option>
                    <option value="7º Ano B">7º Ano B</option>
                    <option value="7º Ano C">7º Ano C</option>
                    <option value="8º Ano A">8º Ano A</option>
                    <option value="8º Ano B">8º Ano B</option>
                    <option value="9º Ano A">9º Ano A</option>
                    <option value="9º Ano B">9º Ano B</option>
                    <option value="Ensino Médio">Ensino Médio</option>
                    <option value="Professor / Funcionário">Professor / Funcionário</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                {reviewSuccess ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    <span>Avaliação publicada com sucesso! A nota da escola foi atualizada!</span>
                  </span>
                ) : (
                  <span className="text-[11px] text-gray-400">
                    O cálculo da média é atualizado instantaneamente.
                  </span>
                )}

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={isSubmittingReview || !reviewComment.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-display font-bold text-xs sm:text-sm shadow-xs cursor-pointer hover:shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Star className="w-4 h-4" />
                  <span>Publicar Avaliação</span>
                </motion.button>
              </div>
            </form>
          </div>

          {/* Reviews List */}
          <div className="space-y-3">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-3xl p-4 sm:p-5 border border-pink-100 shadow-2xs space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={rev.authorAvatar}
                      alt=""
                      className="w-10 h-10 rounded-2xl object-cover border border-pink-200 shadow-2xs"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="font-display font-black text-sm text-gray-900 leading-tight">
                        {rev.authorName}
                      </h4>
                      <span className="text-[11px] text-purple-700 font-semibold">
                        {rev.studentGrade || 'Estudante Gilvan Sampaio'} • {rev.date}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-gray-700 font-medium pl-13">
                  "{rev.comment}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CRIAR MEU PERFIL DE ESTUDANTE */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isCreateProfileOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl border-3 border-pink-300 p-5 sm:p-6 w-full max-w-md shadow-2xl relative"
            >
              <h3 className="font-display font-black text-lg text-gray-900 mb-1">
                🎒 Criar Meu Perfil de Aluno
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Adicione seu nome e turma para que outros alunos possam te encontrar e bater papo!
              </p>

              <form onSubmit={handleCreateStudentProfile} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Seu Nome / Apelido:</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ex: Beatriz Lima"
                    className="w-full px-3.5 py-2.5 bg-gray-50 rounded-2xl text-xs sm:text-sm border border-gray-200 focus:ring-2 focus:ring-pink-400 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Turma / Série:</label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 rounded-2xl text-xs sm:text-sm border border-gray-200 focus:ring-2 focus:ring-pink-400 font-semibold text-gray-700 cursor-pointer"
                  >
                    <option value="6º Ano A">6º Ano A</option>
                    <option value="6º Ano B">6º Ano B</option>
                    <option value="7º Ano A">7º Ano A</option>
                    <option value="7º Ano B">7º Ano B</option>
                    <option value="8º Ano A">8º Ano A</option>
                    <option value="8º Ano B">8º Ano B</option>
                    <option value="9º Ano A">9º Ano A</option>
                    <option value="9º Ano B">9º Ano B</option>
                    <option value="Ensino Médio">Ensino Médio</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Sua Bio Fofa:</label>
                  <input
                    type="text"
                    value={newBio}
                    onChange={(e) => setNewBio(e.target.value)}
                    placeholder="Ex: Adoro squishies de gatinho e canetas coloridas!"
                    className="w-full px-3.5 py-2.5 bg-gray-50 rounded-2xl text-xs sm:text-sm border border-gray-200 focus:ring-2 focus:ring-pink-400 font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Escolha seu Avatar:</label>
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {[
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                      'https://api.dicebear.com/7.x/bottts/svg?seed=Estudante1&backgroundColor=ffdf70',
                      'https://api.dicebear.com/7.x/bottts/svg?seed=Estudante2&backgroundColor=c0aede'
                    ].map((av) => (
                      <img
                        key={av}
                        src={av}
                        alt=""
                        onClick={() => setNewAvatar(av)}
                        className={`w-11 h-11 rounded-xl object-cover cursor-pointer border-2 transition-all ${
                          newAvatar === av ? 'border-pink-500 scale-110 shadow-sm' : 'border-gray-200 opacity-60 hover:opacity-100'
                        }`}
                        referrerPolicy="no-referrer"
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateProfileOpen(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl text-xs font-bold shadow-xs cursor-pointer hover:shadow-md transition-all"
                  >
                    Salvar Perfil
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Profile Report Modal */}
      <ProfileReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        user={selectedUserForReport}
        currentUser={currentUser}
        orders={orders}
        onUpdateUser={(updated) => {
          if (onUpdateUserProfile) {
            onUpdateUserProfile(updated);
          } else {
            const updatedList = users.map((u) => (u.id === updated.id ? updated : u));
            onUpdateUsers(updatedList);
          }
          setSelectedUserForReport(updated);
        }}
        onOpenAvatarModal={onOpenAvatarModal}
        onDeleteUser={onDeleteUser}
        isFollowing={selectedUserForReport ? followedUserIds.includes(selectedUserForReport.id) : false}
        onToggleFollow={onFollowToggle}
      />
    </div>
  );
};
