import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Heart, 
  Users, 
  ShoppingBag, 
  Printer, 
  ShieldCheck, 
  Smartphone, 
  Calendar, 
  Mail, 
  Sparkles, 
  Award, 
  Camera, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Package, 
  UserPlus, 
  UserCheck,
  Edit3,
  Save,
  DollarSign,
  Trash2
} from 'lucide-react';
import { UserProfile, Order } from '../types';
import { sounds } from '../utils/audioEffects';

interface ProfileReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  currentUser: UserProfile | null;
  orders: Order[];
  onUpdateUser: (updatedUser: UserProfile) => void;
  onOpenAvatarModal?: (user: UserProfile) => void;
  onDeleteUser?: (userId: string) => void;
  isFollowing?: boolean;
  onToggleFollow?: (userId: string) => void;
}

export const ProfileReportModal: React.FC<ProfileReportModalProps> = ({
  isOpen,
  onClose,
  user,
  currentUser,
  orders,
  onUpdateUser,
  onOpenAvatarModal,
  onDeleteUser,
  isFollowing = false,
  onToggleFollow,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'security' | 'admin_adjust'>('overview');
  const [hasLiked, setHasLiked] = useState(false);
  
  // Admin editable fields
  const [editSales, setEditSales] = useState<number>(user?.salesCount || 0);
  const [editLikes, setEditLikes] = useState<number>(user?.likesReceived || 0);
  const [editFollowers, setEditFollowers] = useState<number>(user?.followersCount || 0);
  const [editBio, setEditBio] = useState<string>(user?.bio || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  if (!isOpen || !user) return null;

  const isMaxAdmin = currentUser?.email?.toLowerCase() === 'joaolucasgp1234@gmail.com' || currentUser?.isMaxAdmin;
  const isOwnProfile = currentUser?.id === user.id || currentUser?.email === user.email;

  // Filter orders relevant to this user
  const userOrders = orders.filter((o) => {
    if (user.role === 'client') {
      return (
        o.clientName.toLowerCase().includes(user.name.toLowerCase().split(' ')[0]) ||
        o.clientContact.toLowerCase().includes(user.email.toLowerCase()) ||
        o.notes?.toLowerCase().includes(user.name.toLowerCase())
      );
    }
    // If seller or admin, show all or attributed orders
    return true;
  });

  const totalSpentOrGenerated = userOrders.reduce((acc, o) => acc + o.totalAmount, 0);
  const deliveredOrdersCount = userOrders.filter((o) => o.status === 'entregue').length;

  // Handle Like User
  const handleLikeUser = () => {
    if (hasLiked) return;
    sounds.playPop();
    setHasLiked(true);
    const updated = { ...user, likesReceived: user.likesReceived + 1 };
    onUpdateUser(updated);
  };

  // Handle Follow User
  const handleFollowClick = () => {
    sounds.playSparkle();
    if (onToggleFollow) {
      onToggleFollow(user.id);
    } else {
      const newFollowers = isFollowing ? Math.max(0, user.followersCount - 1) : user.followersCount + 1;
      onUpdateUser({ ...user, followersCount: newFollowers });
    }
  };

  // Handle Save Admin Adjustments
  const handleSaveAdjustments = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playSuccess();
    const updated: UserProfile = {
      ...user,
      salesCount: Number(editSales),
      likesReceived: Number(editLikes),
      followersCount: Number(editFollowers),
      bio: editBio,
    };
    onUpdateUser(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Real Printable Report
  const handlePrint = () => {
    sounds.playSparkle();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border-4 border-purple-200 overflow-hidden text-gray-800"
      >
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-purple-700 via-pink-600 to-indigo-700 text-white p-4 sm:p-6 relative flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5">
              {/* Avatar with Camera Button */}
              <div className="relative group cursor-pointer" onClick={() => onOpenAvatarModal && onOpenAvatarModal(user)}>
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-3 border-white shadow-lg"
                />
                <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold">
                  <Camera className="w-5 h-5" />
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display font-black text-xl sm:text-2xl leading-tight">
                    {user.name}
                  </h3>
                  {user.isMaxAdmin ? (
                    <span className="bg-amber-400 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                      👑 Adm Máximo
                    </span>
                  ) : user.role === 'seller' ? (
                    <span className="bg-pink-200 text-pink-900 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                      ⭐ Vendedora Oficial
                    </span>
                  ) : (
                    <span className="bg-purple-200 text-purple-900 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                      🎒 Estudante / Cliente
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-purple-100 mt-1">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    {user.email}
                  </span>
                  <span>•</span>
                  <span>C.E.P.M.G Gilvan Sampaio</span>
                </div>

                {user.bio && (
                  <p className="text-xs text-pink-100/90 italic mt-1 line-clamp-1">
                    "{user.bio}"
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrint}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
                title="Imprimir / Salvar Relatório em PDF"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Interactive Actions Banner */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-white/20 text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLikeUser}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all shadow-xs cursor-pointer ${
                  hasLiked 
                    ? 'bg-rose-500 text-white' 
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${hasLiked ? 'fill-white' : ''}`} />
                <span>{hasLiked ? 'Curtido!' : 'Dar Like'} ({user.likesReceived})</span>
              </button>

              {!isOwnProfile && (
                <button
                  type="button"
                  onClick={handleFollowClick}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all shadow-xs cursor-pointer ${
                    isFollowing 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-white text-purple-900 hover:bg-purple-50'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>Seguindo</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Seguir</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <span className="text-[11px] text-pink-100 font-semibold bg-white/10 px-2.5 py-1 rounded-full">
              ID: {user.id}
            </span>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 px-4 sm:px-6 pt-3 border-b border-gray-200 bg-gray-50 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-purple-600 text-purple-700 font-extrabold'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Visão Geral & Métricas
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1 ${
              activeTab === 'orders'
                ? 'border-purple-600 text-purple-700 font-extrabold'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <span>Histórico ({userOrders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'security'
                ? 'border-purple-600 text-purple-700 font-extrabold'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Dispositivo & Acesso
          </button>
          {isMaxAdmin && (
            <button
              onClick={() => {
                setEditSales(user.salesCount);
                setEditLikes(user.likesReceived);
                setEditFollowers(user.followersCount);
                setEditBio(user.bio || '');
                setActiveTab('admin_adjust');
              }}
              className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1 ${
                activeTab === 'admin_adjust'
                  ? 'border-amber-500 text-amber-700 font-extrabold'
                  : 'border-transparent text-amber-600 hover:text-amber-800'
              }`}
            >
              <span>Ajustes Adm</span>
              <Edit3 className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Tab Contents */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* KPI Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 text-center">
                  <span className="text-[10px] uppercase font-black text-rose-500 tracking-wider block">
                    Likes Recebidos
                  </span>
                  <span className="font-display font-black text-2xl text-rose-700 mt-1 block">
                    {user.likesReceived}
                  </span>
                  <span className="text-[10px] text-rose-400 font-semibold">
                    Engajamento Real
                  </span>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3.5 text-center">
                  <span className="text-[10px] uppercase font-black text-purple-500 tracking-wider block">
                    {user.role === 'client' ? 'Compras Feitas' : 'Vendas Fechadas'}
                  </span>
                  <span className="font-display font-black text-2xl text-purple-800 mt-1 block">
                    {user.salesCount || userOrders.length}
                  </span>
                  <span className="text-[10px] text-purple-400 font-semibold">
                    {deliveredOrdersCount} Entregues
                  </span>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-center">
                  <span className="text-[10px] uppercase font-black text-amber-600 tracking-wider block">
                    Seguidores
                  </span>
                  <span className="font-display font-black text-2xl text-amber-800 mt-1 block">
                    {user.followersCount}
                  </span>
                  <span className="text-[10px] text-amber-500 font-semibold">
                    Ativos na Escola
                  </span>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-center">
                  <span className="text-[10px] uppercase font-black text-emerald-600 tracking-wider block">
                    {user.role === 'client' ? 'Total Gasto' : 'Faturamento'}
                  </span>
                  <span className="font-display font-black text-xl text-emerald-800 mt-1 block">
                    R$ {totalSpentOrGenerated.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-emerald-500 font-semibold">
                    100% Auditado
                  </span>
                </div>
              </div>

              {/* Achievements & Status */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200 space-y-3">
                <h4 className="font-display font-bold text-sm text-purple-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-purple-600" />
                  <span>Classificação & Selos Escolares (Gilvan Sampaio)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-purple-100 flex items-center gap-2.5">
                    <span className="text-xl">🏆</span>
                    <div>
                      <span className="font-bold text-gray-900 block">
                        {user.isMaxAdmin ? 'Líder Supremo Gilvan' : user.role === 'seller' ? 'Vendedora Destaque' : 'Estudante VIP'}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {user.salesCount > 50 ? 'Mais de 50 pedidos concluídos' : 'Membro ativo da comunidade'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-purple-100 flex items-center gap-2.5">
                    <span className="text-xl">🌟</span>
                    <div>
                      <span className="font-bold text-gray-900 block">Avaliação Máxima 5.0</span>
                      <span className="text-[10px] text-gray-500">100% de satisfação na entrega do portão</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Details */}
              <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2 text-xs">
                <h4 className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Dados Cadastrais da Conta</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-gray-600 pt-1">
                  <div>
                    <span className="text-gray-400 block text-[10px]">Data de Entrada:</span>
                    <span className="font-semibold text-gray-800">
                      {new Date(user.createdAt || Date.now()).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Ponto de Retirada Preferencial:</span>
                    <span className="font-semibold text-purple-700">Portão Gilvan Sampaio (17:30)</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Permissão de Edição:</span>
                    <span className="font-semibold text-gray-800">
                      {user.permissions.canEditProducts ? 'Sim (Gerente)' : 'Apenas Visualização'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Status Operacional:</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Ativo & Verificado
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS HISTORY */}
          {activeTab === 'orders' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-xs font-bold text-gray-700">
                  Total de Encomendas Registradas: {userOrders.length}
                </span>
                <span className="text-[11px] text-purple-600 font-extrabold">
                  Soma: R$ {totalSpentOrGenerated.toFixed(2)}
                </span>
              </div>

              {userOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-400 space-y-2">
                  <Package className="w-10 h-10 mx-auto text-purple-200" />
                  <p className="text-xs font-semibold">Nenhuma encomenda registrada para este usuário ainda.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {userOrders.map((o) => (
                    <div
                      key={o.id}
                      className="bg-purple-50/40 border border-purple-100 rounded-2xl p-3.5 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="font-mono text-purple-900 text-xs">#{o.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          o.status === 'entregue'
                            ? 'bg-emerald-100 text-emerald-800'
                            : o.status === 'confirmado'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {o.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-gray-600">
                        <span>Cliente: <strong>{o.clientName}</strong> ({o.studentGrade || 'Gilvan'})</span>
                        <span className="font-extrabold text-purple-700 text-sm">
                          R$ {o.totalAmount.toFixed(2)}
                        </span>
                      </div>

                      <div className="bg-white/80 rounded-xl p-2 border border-purple-50 text-[11px] space-y-1">
                        {o.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-gray-700">
                            <span>{item.quantity}x {item.productName}</span>
                            <span className="font-semibold">R$ {(item.quantity * item.unitPrice).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-purple-100">
                        <span>Retirada: {o.pickupDay}</span>
                        <span>{new Date(o.createdAt).toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SECURITY & DEVICE */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3 text-xs">
                <div className="flex items-center gap-2 font-bold text-gray-800">
                  <Smartphone className="w-4 h-4 text-purple-600" />
                  <span>Dispositivo Registrado no Acesso</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-gray-600">
                  <div>
                    <span className="text-gray-400 text-[10px] block">Modelo Identificado:</span>
                    <span className="font-bold text-gray-900">{user.deviceLastUsed || 'iPhone / Android (Mobile)'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block">IP Simulado Local:</span>
                    <span className="font-mono text-gray-800">189.40.12.84 (Goiânia/GO)</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block">Última Conexão:</span>
                    <span className="font-medium text-gray-800">Hoje às 17:20</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block">Nível de Acesso:</span>
                    <span className="font-bold text-purple-700 uppercase">
                      {user.role} ({user.isMaxAdmin ? 'Super Root' : 'Standard'})
                    </span>
                  </div>
                </div>
              </div>

              {/* Permissions Checklist */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-2 text-xs">
                <h4 className="font-bold text-gray-800 mb-2">Permissões do Perfil:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  {Object.entries(user.permissions).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] text-white font-black ${val ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                        {val ? '✓' : '✕'}
                      </span>
                      <span className={val ? 'text-gray-800 font-semibold' : 'text-gray-400'}>
                        {key.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ADMIN ADJUSTMENTS (Apenas Adm Máximo) */}
          {activeTab === 'admin_adjust' && isMaxAdmin && (
            <form onSubmit={handleSaveAdjustments} className="space-y-4 text-xs">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-amber-900 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  <strong>Painel do Adm Máximo (João Lucas):</strong> Você pode ajustar métricas, pontos de vendas e biografias deste perfil diretamente.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Vendas Concluídas:</label>
                  <input
                    type="number"
                    value={editSales}
                    onChange={(e) => setEditSales(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Total de Likes:</label>
                  <input
                    type="number"
                    value={editLikes}
                    onChange={(e) => setEditLikes(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Seguidores:</label>
                  <input
                    type="number"
                    value={editFollowers}
                    onChange={(e) => setEditFollowers(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Biografia / Apresentação:</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={2}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {saveSuccess ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Alterações salvas com sucesso!
                  </span>
                ) : (
                  <span className="text-gray-400 text-[11px]">As alterações são salvas e persistidas no sistema.</span>
                )}

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-amber-950 font-bold rounded-xl shadow-xs hover:shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Ajustes do Perfil</span>
                </button>
              </div>

              {/* Zona de Exclusão de Perfil pelo Adm Máximo */}
              {!(user.email?.toLowerCase() === 'joaolucasgp1234@gmail.com' && user.id === 'user-joao-lucas') && onDeleteUser && (
                <div className="mt-4 pt-3 border-t border-red-100 bg-red-50/60 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <h5 className="font-bold text-red-800 text-xs">Excluir Perfil Definitivamente</h5>
                    <p className="text-[11px] text-red-600">
                      Remove o perfil e sincroniza a exclusão em todos os lugares (comentários, stories, chat e equipe).
                    </p>
                  </div>
                  {isConfirmingDelete ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playPop();
                          onDeleteUser(user.id);
                          setIsConfirmingDelete(false);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs shadow-xs cursor-pointer"
                      >
                        Confirmar Exclusão
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsConfirmingDelete(false)}
                        className="px-2.5 py-1.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg text-xs cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playPop();
                        setIsConfirmingDelete(true);
                      }}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-xs transition-colors flex-shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir Perfil</span>
                    </button>
                  )}
                </div>
              )}
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-3 flex items-center justify-between text-xs text-gray-500 flex-shrink-0">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Relatório Oficial HL Vendas • Gilvan Sampaio</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </motion.div>
    </div>
  );
};
