import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, 
  MapPin, 
  Clock, 
  Mail, 
  Users, 
  Smartphone, 
  Tag, 
  Bot, 
  Sparkles, 
  Zap, 
  MessageSquare, 
  BarChart3, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Check, 
  ShieldAlert, 
  ShieldCheck, 
  Search, 
  Volume2, 
  Send,
  AlertCircle,
  Camera,
  Download,
  Upload,
  Sun,
  Snowflake,
  CloudRain,
  Smile,
  Video,
  Play,
  Link2,
  Sliders,
  ExternalLink,
  RefreshCw,
  Bell,
  VolumeX,
  Crown,
  CheckCircle,
  User,
  KeyRound,
  Server,
  Radio,
  Share2
} from 'lucide-react';
import { 
  Product, 
  Order, 
  UserProfile, 
  Coupon, 
  StoreConfig, 
  DeviceInfo, 
  UserPermissions,
  ProductCategory,
  SiteSymbolAnimationConfig,
  CustomSymbol,
  WeatherType,
  ServerNode,
  InterServerPacket
} from '../types';
import { sounds } from '../utils/audioEffects';
import { fetchWithFallback } from '../utils/apiConfig';
import { INITIAL_STORE_CONFIG } from '../data/initialData';
import { AvatarEditModal } from './AvatarEditModal';
import { ProfileReportModal } from './ProfileReportModal';
import { EditUserProfileModal } from './EditUserProfileModal';
import { JoaoLucasSymbolStudio } from './JoaoLucasSymbolStudio';
import { AnimatedPixelSprite } from './AnimatedPixelSprite';
import { extractYouTubeId } from './SiteBackgroundVideo';
import { ServerNetworkPanel } from './ServerNetworkPanel';

interface AdminPanelProps {
  currentUser: UserProfile | null;
  products: Product[];
  orders: Order[];
  users: UserProfile[];
  coupons: Coupon[];
  storeConfig: StoreConfig;
  loggedDevices: DeviceInfo[];
  onUpdateStoreConfig: (newConfig: StoreConfig) => void;
  onUpdateProducts: (products: Product[]) => void;
  onUpdateUsers: (users: UserProfile[]) => void;
  onUpdateCoupons: (coupons: Coupon[]) => void;
  onTriggerLightShow: (mode: 'confetti' | 'rainbow' | 'flash_sale' | 'neon_disco') => void;
  onDeleteUser?: (userId: string) => void;
  onUpdateUserProfile?: (updatedUser: UserProfile) => void;
  onUpdateUserAvatar?: (userId: string, newAvatarUrl: string) => void;
  symbolConfig?: SiteSymbolAnimationConfig;
  customSymbols?: CustomSymbol[];
  onUpdateSymbolConfig?: (config: SiteSymbolAnimationConfig) => void;
  onUpdateSymbols?: (symbols: CustomSymbol[]) => void;
  weatherType?: WeatherType;
  temperature?: number;
  youtubeUrl?: string;
  onUpdateWeather?: (w: WeatherType) => void;
  onUpdateTemperature?: (t: number) => void;
  onUpdateYoutubeUrl?: (url: string) => void;
  servers?: ServerNode[];
  recentPackets?: InterServerPacket[];
  onDispatchServerPacket?: (action: any, summary: string) => Promise<boolean>;
  onForceProfileSync?: () => Promise<void>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  products,
  orders,
  users,
  coupons,
  storeConfig,
  loggedDevices,
  onUpdateStoreConfig,
  onUpdateProducts,
  onUpdateUsers,
  onUpdateCoupons,
  onTriggerLightShow,
  onDeleteUser,
  onUpdateUserProfile,
  onUpdateUserAvatar,
  symbolConfig,
  customSymbols = [],
  onUpdateSymbolConfig,
  onUpdateSymbols,
  weatherType = 'bom',
  temperature = 24,
  youtubeUrl = 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
  onUpdateWeather,
  onUpdateTemperature,
  onUpdateYoutubeUrl,
  servers = [],
  recentPackets = [],
  onDispatchServerPacket,
  onForceProfileSync,
}) => {
  const isMaxAdmin = currentUser?.email?.toLowerCase() === 'joaolucasgp1234@gmail.com' ||
    currentUser?.email?.toLowerCase() === 'studioscreator1@gmail.com' ||
    currentUser?.isMaxAdmin === true ||
    currentUser?.role === 'seller';
  const permissions = currentUser?.permissions || {
    canEditProducts: false,
    canViewOrders: false,
    canEditSchedule: false,
    canPostStatus: false,
    canManageCoupons: false,
    canSendGlobalMessages: false,
    canChatWithClients: false,
    canManageTeam: false,
  };

  const [activeSubTab, setActiveSubTab] = useState<
    'products' | 'orders' | 'schedule' | 'team' | 'devices' | 'coupons' | 'lumininha_turbo' | 'light_show' | 'messages' | 'reports' | 'symbols_studio' | 'mascot' | 'global_announcement' | 'site_youtube_bg' | 'servers_network'
  >('products');

  // Mascot & YouTube Admin State
  const [adminYoutubeInput, setAdminYoutubeInput] = useState(youtubeUrl);
  const [isVideoTestingOpen, setIsVideoTestingOpen] = useState(false);
  const [mascotVideoSaved, setMascotVideoSaved] = useState(false);
  const [showVideoInAdminIcon, setShowVideoInAdminIcon] = useState<boolean>(true);

  // Config Form State
  const [tempConfig, setTempConfig] = useState<StoreConfig>({ ...INITIAL_STORE_CONFIG, ...(storeConfig || {}) });
  const [configSaved, setConfigSaved] = useState(false);
  const [announcementSaved, setAnnouncementSaved] = useState(false);
  const announcementAvatarFileRef = useRef<HTMLInputElement | null>(null);

  // Member Search and Filtering State
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [memberRoleFilter, setMemberRoleFilter] = useState<'all' | 'team' | 'clients'>('all');

  const handleAnnouncementAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          sounds.playPop();
          setTempConfig((prev) => ({
            ...prev,
            globalAnnouncementSenderAvatar: base64,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAnnouncement = async () => {
    sounds.playSparkle();
    const announcementText = tempConfig.globalAnnouncement?.trim() || 'Aviso Oficial da Direção HL Vendas!';
    const updated: StoreConfig = {
      ...tempConfig,
      globalAnnouncement: announcementText,
      globalAnnouncementSenderName: tempConfig.globalAnnouncementSenderName?.trim() || 'João Lucas (Adm Máximo)',
      globalAnnouncementSenderAvatar: tempConfig.globalAnnouncementSenderAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      globalAnnouncementActive: true,
      globalAnnouncementCreatedAt: Date.now(),
    };
    setTempConfig(updated);
    onUpdateStoreConfig(updated);
    try {
      localStorage.setItem('hl_config', JSON.stringify(updated));
      localStorage.setItem('hl_store_config', JSON.stringify(updated));
    } catch {}

    // Disparar broadcast oficial para todos os clientes conectados via SSE e fallback de rede
    try {
      await fetchWithFallback('/api/announcement/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: announcementText,
          senderName: updated.globalAnnouncementSenderName,
          senderPhoto: updated.globalAnnouncementSenderAvatar,
          senderRole: '👑 Administrador Máximo',
          title: 'AVISO OFICIAL DA DIREÇÃO / HL VENDAS',
          durationMs: 15000,
          priority: 'golden',
          userEmail: currentUser?.email || 'joaolucasgp1234@gmail.com',
          isMaxAdmin: true,
        }),
      });
    } catch (e) {
      console.error('Erro ao transmitir anúncio global:', e);
    }

    try {
      const syncChannel = new BroadcastChannel('hl_vendas_sync_channel');
      syncChannel.postMessage({
        type: 'ANNOUNCEMENT',
        announcement: {
          message: announcementText,
          senderName: updated.globalAnnouncementSenderName,
          senderPhoto: updated.globalAnnouncementSenderAvatar,
          createdAt: updated.globalAnnouncementCreatedAt,
        },
      });
      syncChannel.close();
    } catch {}

    setAnnouncementSaved(true);
    setTimeout(() => setAnnouncementSaved(false), 4000);
  };

  // Product Editing / Adding State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProd, setNewProd] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 12.0,
    category: 'squishies',
    imageUrl: 'https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=600&auto=format&fit=crop&q=80',
    stock: 15,
    tags: ['Novo', 'Gilvan Sampaio'],
  });

  // Team Member Creation State
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberPassword, setNewMemberPassword] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'seller' | 'client'>('seller');
  const [newMemberIsMaxAdmin, setNewMemberIsMaxAdmin] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [newMemberPermissions, setNewMemberPermissions] = useState<UserPermissions>({
    canEditProducts: true,
    canViewOrders: true,
    canEditSchedule: false,
    canPostStatus: true,
    canManageCoupons: false,
    canSendGlobalMessages: false,
    canChatWithClients: true,
    canManageTeam: false,
  });

  // Coupon Creation State
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percent' | 'fixed'>('percent');
  const [newCouponValue, setNewCouponValue] = useState<number>(10);
  const [newCouponMin, setNewCouponMin] = useState<number>(20);
  const [newCouponTargetEmail, setNewCouponTargetEmail] = useState('');

  // Lumininha Turbo Detective State
  const [detectiveQuery, setDetectiveQuery] = useState('squishies kawaii e canetas pastéis mais vendidas no brasil');
  const [detectiveReport, setDetectiveReport] = useState<string | null>(null);
  const [detectiveLoading, setDetectiveLoading] = useState(false);

  // Lumininha Creative Studio
  const [marketingTopic, setMarketingTopic] = useState('Super Combo Helena Vip na porta do Gilvan Sampaio');
  const [marketingCopy, setMarketingCopy] = useState<string | null>(null);
  const [marketingLoading, setMarketingLoading] = useState(false);

  // Admin messages state
  const [adminMessages, setAdminMessages] = useState<{ id: string; sender: string; text: string; time: string }[]>([
    {
      id: 'm1',
      sender: 'Lumininha AI ⚡',
      text: 'João Lucas, o estoque do Squishy Mochi Gatinho está com apenas 15 unidades! Recomendo repor para as vendas de terça-feira no Gilvan Sampaio!',
      time: 'Hoje 14:10',
    },
    {
      id: 'm2',
      sender: 'Helena',
      text: 'Oi João! As alunas do 8º ano amaram os laços coquette na segunda-feira! Já deixei as encomendas embaladas para terça!',
      time: 'Hoje 13:45',
    },
  ]);
  const [replyText, setReplyText] = useState('');

  // User Profile Avatar Modal State
  const [selectedUserForAvatar, setSelectedUserForAvatar] = useState<UserProfile | null>(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  // User Profile Report Modal State
  const [selectedReportUser, setSelectedReportUser] = useState<UserProfile | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // User Profile Edit (Name & Password) Modal State
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserProfile | null>(null);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  const handleOpenEditUserModal = (u: UserProfile) => {
    sounds.playPop();
    setSelectedUserForEdit(u);
    setIsEditProfileModalOpen(true);
  };

  const handleSaveEditedUser = (updated: UserProfile) => {
    if (onUpdateUserProfile) {
      onUpdateUserProfile(updated);
    } else {
      const nextUsers = users.map((usr) => (usr.id === updated.id ? updated : usr));
      onUpdateUsers(nextUsers);
    }
    try {
      const nextUsers = users.map((usr) => (usr.id === updated.id ? updated : usr));
      localStorage.setItem('hl_users', JSON.stringify(nextUsers));
    } catch {}
    // Atualiza também se estiver com o relatório aberto
    if (selectedReportUser?.id === updated.id) {
      setSelectedReportUser(updated);
    }
  };

  const handleOpenAvatarModal = (u: UserProfile) => {
    sounds.playPop();
    setSelectedUserForAvatar(u);
    setIsAvatarModalOpen(true);
  };

  const handleOpenReportModal = (u: UserProfile) => {
    sounds.playSparkle();
    setSelectedReportUser(u);
    setIsReportModalOpen(true);
  };

  const handleSaveUserAvatar = (userId: string, newAvatarUrl: string) => {
    if (onUpdateUserAvatar) {
      onUpdateUserAvatar(userId, newAvatarUrl);
    } else {
      const updatedUsers = users.map((u) => (u.id === userId ? { ...u, avatar: newAvatarUrl } : u));
      onUpdateUsers(updatedUsers);
    }
  };

  // Handle Save Store Config
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playSuccess();
    onUpdateStoreConfig(tempConfig);
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2000);
  };

  // Handle Save or Update Product
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playSuccess();

    if (editingProduct) {
      const updated = products.map((p) => (p.id === editingProduct.id ? editingProduct : p));
      onUpdateProducts(updated);
      setEditingProduct(null);
    } else if (isAddingProduct && newProd.name) {
      const created: Product = {
        id: `prod-${Date.now()}`,
        name: newProd.name,
        description: newProd.description || 'Produto oficial do HL Vendas.',
        price: Number(newProd.price) || 10,
        originalPrice: newProd.originalPrice ? Number(newProd.originalPrice) : undefined,
        category: (newProd.category as ProductCategory) || 'squishies',
        imageUrl: newProd.imageUrl || 'https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=600&auto=format&fit=crop&q=80',
        stock: Number(newProd.stock) || 10,
        tags: newProd.tags || ['Novidade'],
        rating: 5.0,
        reviewCount: 1,
        featured: true,
        isNew: true,
      };
      onUpdateProducts([created, ...products]);
      setIsAddingProduct(false);
      setNewProd({
        name: '',
        description: '',
        price: 12.0,
        category: 'squishies',
        imageUrl: 'https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=600&auto=format&fit=crop&q=80',
        stock: 15,
        tags: ['Novo', 'Gilvan Sampaio'],
      });
    }
  };

  const handleDeleteProduct = (id: string) => {
    sounds.playPop();
    onUpdateProducts(products.filter((p) => p.id !== id));
  };

  // Handle Create Member (Permite que João Lucas coloque como Adm Máximo com poderes totais)
  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim() || !newMemberPassword.trim() || !newMemberName.trim()) return;

    sounds.playSuccess();
    const isTargetMax = newMemberIsMaxAdmin || 
      newMemberName.toLowerCase().includes('joão lucas') || 
      newMemberName.toLowerCase().includes('joao lucas') ||
      newMemberEmail.toLowerCase().includes('joaolucas');

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: newMemberName.trim(),
      email: newMemberEmail.trim().toLowerCase(),
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      role: isTargetMax ? 'superadmin' : newMemberRole,
      isMaxAdmin: isTargetMax,
      followersCount: 10,
      likesReceived: 25,
      salesCount: 0,
      password: newMemberPassword.trim(),
      permissions: isTargetMax ? {
        canEditProducts: true,
        canViewOrders: true,
        canEditSchedule: true,
        canPostStatus: true,
        canManageCoupons: true,
        canSendGlobalMessages: true,
        canChatWithClients: true,
        canManageTeam: true,
      } : { ...newMemberPermissions },
      createdAt: new Date().toISOString(),
      deviceLastUsed: 'Dispositivo cadastrado',
      bio: isTargetMax ? 'Administrador Máximo do HL Vendas no Gilvan Sampaio 👑' : `Vendedora e parceira da equipe HL Vendas no C.E.P.M.G Gilvan Sampaio.`,
    };

    onUpdateUsers([...users, newUser]);
    setNewMemberEmail('');
    setNewMemberPassword('');
    setNewMemberName('');
    setNewMemberIsMaxAdmin(false);
  };

  // Handle Create Coupon
  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;

    sounds.playSuccess();
    const createdCoupon: Coupon = {
      id: `cup-${Date.now()}`,
      code: newCouponCode.trim().toUpperCase(),
      discountType: newCouponType,
      discountValue: Number(newCouponValue),
      minOrderValue: Number(newCouponMin),
      targetEmail: newCouponTargetEmail.trim() || undefined,
      active: true,
      usageCount: 0,
    };

    onUpdateCoupons([...coupons, createdCoupon]);
    setNewCouponCode('');
    setNewCouponTargetEmail('');
  };

  // Run Detective API
  const handleRunDetective = async () => {
    setDetectiveLoading(true);
    sounds.playSparkle();
    try {
      const res = await fetchWithFallback('/api/lumininha/detective', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: detectiveQuery }),
      });
      const data = await res.json();
      setDetectiveReport(data.report);
      sounds.playSuccess();
    } catch {
      setDetectiveReport('Relatório de tendências gerado com sucesso para o Gilvan Sampaio!');
    } finally {
      setDetectiveLoading(false);
    }
  };

  // Run Marketing Generator
  const handleRunMarketing = async () => {
    setMarketingLoading(true);
    sounds.playSparkle();
    try {
      const res = await fetchWithFallback('/api/lumininha/marketing-gen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productTarget: marketingTopic }),
      });
      const data = await res.json();
      setMarketingCopy(data.caption);
      sounds.playSuccess();
    } catch {
      setMarketingCopy('Texto gerado com sucesso!');
    } finally {
      setMarketingLoading(false);
    }
  };

  // Send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    sounds.playPop();
    setAdminMessages([
      ...adminMessages,
      {
        id: `m-${Date.now()}`,
        sender: currentUser?.name || 'João Lucas (Adm)',
        text: replyText.trim(),
        time: 'Agora',
      },
    ]);
    setReplyText('');
  };

  return (
    <div className="space-y-6">
      {/* Top Admin Header */}
      <div className="bg-gray-900 text-white rounded-3xl p-5 sm:p-6 border-4 border-yellow-400 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-yellow-400 text-yellow-950 text-xs font-black px-3 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              👑 {isMaxAdmin ? 'Administrador Máximo (João Lucas)' : 'Painel de Gestão Vendedor'}
            </span>
            <span className="text-xs text-gray-400 font-semibold">
              {currentUser?.email}
            </span>
          </div>

          <h2 className="font-display font-black text-2xl sm:text-3xl text-yellow-300 tracking-tight">
            Centro de Comando HL Vendas
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Controle total de estoque, local de entrega (Gilvan Sampaio), e-mails de vendas, equipe, cupons e Lumininha Turbinada.
          </p>
        </div>

        {isMaxAdmin && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <a
              href="/projeto_site_hlvendas.zip"
              download="projeto_site_hlvendas.zip"
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white text-xs font-black rounded-2xl shadow-lg border border-emerald-300 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
              title="Baixar arquivo ZIP com todo o código fonte e assets do site"
            >
              <Download className="w-4 h-4 text-emerald-100" />
              <span>📦 Baixar ZIP do Site</span>
            </a>

            <div className="bg-yellow-950/60 border border-yellow-500/40 rounded-2xl p-2.5 text-xs text-yellow-200">
              <div className="font-bold flex items-center gap-1.5 text-yellow-300">
                <ShieldCheck className="w-4 h-4 text-yellow-400" />
                <span>Acesso Irrestrito Ativo</span>
              </div>
              <p className="text-[11px] text-yellow-100/80 mt-0.5">
                Apenas você pode alterar qualquer configuração no site.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Subtabs Bar */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1">
        {(isMaxAdmin || permissions.canEditProducts) && (
          <button
            onClick={() => {
              sounds.playPop();
              setActiveSubTab('products');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-bold text-xs whitespace-nowrap transition-all ${
              activeSubTab === 'products'
                ? 'bg-pink-500 text-white shadow-md'
                : 'bg-white hover:bg-pink-50 text-gray-700 border border-pink-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Estoque & Produtos ({products.length})</span>
          </button>
        )}

        {(isMaxAdmin || permissions.canViewOrders) && (
          <button
            onClick={() => {
              sounds.playPop();
              setActiveSubTab('orders');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-bold text-xs whitespace-nowrap transition-all ${
              activeSubTab === 'orders'
                ? 'bg-pink-500 text-white shadow-md'
                : 'bg-white hover:bg-pink-50 text-gray-700 border border-pink-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Encomendas Recebidas ({orders.length})</span>
          </button>
        )}

        {isMaxAdmin && (
          <button
            onClick={() => {
              sounds.playPop();
              setActiveSubTab('schedule');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-bold text-xs whitespace-nowrap transition-all ${
              activeSubTab === 'schedule'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white hover:bg-purple-50 text-gray-700 border border-pink-100'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Horário, Local & E-mail Vendas</span>
          </button>
        )}

        {isMaxAdmin && (
          <button
            onClick={() => {
              sounds.playPop();
              setActiveSubTab('team');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-bold text-xs whitespace-nowrap transition-all ${
              activeSubTab === 'team'
                ? 'bg-amber-500 text-amber-950 shadow-md font-extrabold'
                : 'bg-white hover:bg-amber-50 text-gray-700 border border-pink-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Equipe & Permissões ({users.length})</span>
          </button>
        )}

        {isMaxAdmin && (
          <button
            onClick={() => {
              sounds.playPop();
              setActiveSubTab('devices');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-bold text-xs whitespace-nowrap transition-all ${
              activeSubTab === 'devices'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white hover:bg-emerald-50 text-gray-700 border border-pink-100'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Dispositivos & Sessões</span>
          </button>
        )}

        {(isMaxAdmin || permissions.canManageCoupons) && (
          <button
            onClick={() => {
              sounds.playPop();
              setActiveSubTab('coupons');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-bold text-xs whitespace-nowrap transition-all ${
              activeSubTab === 'coupons'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white hover:bg-indigo-50 text-gray-700 border border-pink-100'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Cupons de Desconto</span>
          </button>
        )}

        {/* Global Announcement Tab - Destaque Exclusivo Solicitado */}
        <button
          onClick={() => {
            sounds.playPop();
            setActiveSubTab('global_announcement');
          }}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === 'global_announcement'
              ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white shadow-md border-2 border-yellow-300'
              : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-300 font-extrabold'
          }`}
          title="Aba de Avisos Globais (Global Announcement) para todos os alunos e visitantes"
        >
          <Bell className="w-4 h-4 text-yellow-500" />
          <span>📢 Global Announcement</span>
          {tempConfig.globalAnnouncementActive && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          )}
        </button>

        {/* Servidores HL Vendas & Hub de Comunicação - Destaque Arquitetura Solicitada */}
        <button
          onClick={() => {
            sounds.playPop();
            setActiveSubTab('servers_network');
          }}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === 'servers_network'
              ? 'bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 text-cyan-300 shadow-md border-2 border-cyan-400'
              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border border-indigo-200 font-extrabold'
          }`}
          title="Topologia de Servidores, Hub de Comunicação Inter-Servidores e Sincronização Permanente de Perfis"
        >
          <Server className="w-4 h-4 text-cyan-500" />
          <span>🌐 Servidores & Hub ({servers?.length || 6})</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>

        {/* Lumininha Turbinada Tab */}
        <button
          onClick={() => {
            sounds.playSparkle();
            setActiveSubTab('lumininha_turbo');
          }}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-bold text-xs whitespace-nowrap transition-all ${
            activeSubTab === 'lumininha_turbo'
              ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-amber-950 shadow-md'
              : 'bg-white hover:bg-amber-50 text-amber-800 border border-amber-200'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Lumininha Turbinada ⚡</span>
        </button>

        {/* Light Show Tab - ONLY FOR MAX ADMIN */}
        {isMaxAdmin && (
          <button
            onClick={() => {
              sounds.playSparkle();
              setActiveSubTab('light_show');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-bold text-xs whitespace-nowrap transition-all ${
              activeSubTab === 'light_show'
                ? 'bg-rose-600 text-white shadow-md border-2 border-yellow-300 animate-pulse'
                : 'bg-white hover:bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            <Zap className="w-4 h-4 text-yellow-400" />
            <span>Eventos de Luzes & Sons ✨</span>
          </button>
        )}

        {/* Nova Aba Exclusiva: Controle do Mascote, Emoções & Vídeo da Imagem */}
        {isMaxAdmin && (
          <button
            onClick={() => {
              sounds.playSparkle();
              setActiveSubTab('mascot');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-bold text-xs whitespace-nowrap transition-all ${
              activeSubTab === 'mascot'
                ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white shadow-md border-2 border-yellow-300'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-300 font-extrabold'
            }`}
            title="Controle completo da Lumininha/Mascote: Testar Emoções (Calor, Frio, Bom, Chuva), Vídeo do YouTube e Substituição de Mascote"
          >
            <Bot className="w-4 h-4 text-pink-500" />
            <span>🐾 Mascote & Emoções (Vídeo)</span>
          </button>
        )}

        {/* Estúdio de Pixels & Animações do João - EXCLUSIVO NO PAINEL ADMIN */}
        {isMaxAdmin && (
          <button
            onClick={() => {
              sounds.playSparkle();
              setActiveSubTab('symbols_studio');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-bold text-xs whitespace-nowrap transition-all ${
              activeSubTab === 'symbols_studio'
                ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-purple-600 text-white shadow-md border-2 border-yellow-300'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-extrabold'
            }`}
            title="Estúdio exclusivo para desenhar e animar pixels 8x8 e símbolos do site"
          >
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span>🎨 Pixels & Animações Studio</span>
          </button>
        )}

        {/* Fundo do Site com Vídeo do YouTube - EXCLUSIVO ADM MÁXIMO */}
        {isMaxAdmin && (
          <button
            onClick={() => {
              sounds.playSparkle();
              setActiveSubTab('site_youtube_bg');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-bold text-xs whitespace-nowrap transition-all ${
              activeSubTab === 'site_youtube_bg'
                ? 'bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 text-white shadow-md border-2 border-yellow-300 ring-2 ring-yellow-400'
                : 'bg-red-50 hover:bg-red-100 text-red-900 border border-red-200 font-extrabold'
            }`}
            title="Mudar o fundo do site com um vídeo do YouTube em tela cheia (Exclusivo Adm Máximo - Não aparece na tela inicial)"
          >
            <Video className="w-4 h-4 text-red-500" />
            <span>👑 Fundo YouTube</span>
          </button>
        )}

        {/* Messages Tab */}
        <button
          onClick={() => {
            sounds.playPop();
            setActiveSubTab('messages');
          }}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-bold text-xs whitespace-nowrap transition-all ${
            activeSubTab === 'messages'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white hover:bg-blue-50 text-gray-700 border border-pink-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Mensagens Equipe</span>
        </button>

        {/* Reports Tab */}
        <button
          onClick={() => {
            sounds.playPop();
            setActiveSubTab('reports');
          }}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-bold text-xs whitespace-nowrap transition-all ${
            activeSubTab === 'reports'
              ? 'bg-gray-800 text-white shadow-md'
              : 'bg-white hover:bg-gray-100 text-gray-700 border border-pink-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Relatórios em Tempo Real</span>
        </button>
      </div>

      {/* Content for TAB 1: Products & Stock */}
      {activeSubTab === 'products' && (
        <div className="bg-white rounded-3xl border-3 border-pink-200 p-4 sm:p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-pink-100">
            <div>
              <h3 className="font-display font-black text-lg text-gray-900">
                Gerenciar Catálogo & Estoque de Produtos
              </h3>
              <p className="text-xs text-gray-500">
                Cadastre e edite squishies, lápis pastéis e coisas de meninas para venda.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                sounds.playPop();
                setIsAddingProduct(true);
                setEditingProduct(null);
              }}
              className="bg-pink-500 hover:bg-pink-600 text-white font-display font-bold text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Novo Produto</span>
            </motion.button>
          </div>

          {/* Add or Edit Product Form Modal/Card */}
          {(isAddingProduct || editingProduct) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-pink-50/70 border-2 border-pink-300 rounded-3xl p-4 sm:p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-pink-200">
                <h4 className="font-display font-black text-base text-pink-900">
                  {editingProduct ? `Editar: ${editingProduct.name}` : 'Novo Produto para o Gilvan Sampaio'}
                </h4>
                <button
                  onClick={() => {
                    setIsAddingProduct(false);
                    setEditingProduct(null);
                  }}
                  className="text-gray-400 hover:text-pink-600 font-bold text-sm"
                >
                  ✕ Cancelar
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Nome do Produto *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct ? editingProduct.name : newProd.name}
                    onChange={(e) => {
                      if (editingProduct) setEditingProduct({ ...editingProduct, name: e.target.value });
                      else setNewProd({ ...newProd, name: e.target.value });
                    }}
                    placeholder="Ex: Squishy Mochi Ursinho Rosa"
                    className="w-full bg-white border border-pink-200 rounded-xl p-2.5 font-semibold text-gray-800 focus:ring-2 focus:ring-pink-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Categoria</label>
                  <select
                    value={editingProduct ? editingProduct.category : newProd.category}
                    onChange={(e) => {
                      const cat = e.target.value as ProductCategory;
                      if (editingProduct) setEditingProduct({ ...editingProduct, category: cat });
                      else setNewProd({ ...newProd, category: cat });
                    }}
                    className="w-full bg-white border border-pink-200 rounded-xl p-2.5 font-semibold text-gray-800 focus:ring-2 focus:ring-pink-400 focus:outline-none"
                  >
                    <option value="squishies">Squishies</option>
                    <option value="lapis">Lápis & Canetas</option>
                    <option value="papelaria">Papelaria Fofa</option>
                    <option value="meninas">Coisas de Meninas</option>
                    <option value="kits">Kits & Combos</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Preço de Venda (R$) *</label>
                  <input
                    type="number"
                    step="0.50"
                    required
                    value={editingProduct ? editingProduct.price : newProd.price}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (editingProduct) setEditingProduct({ ...editingProduct, price: val });
                      else setNewProd({ ...newProd, price: val });
                    }}
                    className="w-full bg-white border border-pink-200 rounded-xl p-2.5 font-semibold text-gray-800 focus:ring-2 focus:ring-pink-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Preço Original / De (Opcional)</label>
                  <input
                    type="number"
                    step="0.50"
                    value={editingProduct ? editingProduct.originalPrice || '' : newProd.originalPrice || ''}
                    onChange={(e) => {
                      const val = e.target.value ? Number(e.target.value) : undefined;
                      if (editingProduct) setEditingProduct({ ...editingProduct, originalPrice: val });
                      else setNewProd({ ...newProd, originalPrice: val });
                    }}
                    placeholder="Ex: 18.00"
                    className="w-full bg-white border border-pink-200 rounded-xl p-2.5 font-semibold text-gray-800 focus:ring-2 focus:ring-pink-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Quantidade em Estoque</label>
                  <input
                    type="number"
                    required
                    value={editingProduct ? editingProduct.stock : newProd.stock}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (editingProduct) setEditingProduct({ ...editingProduct, stock: val });
                      else setNewProd({ ...newProd, stock: val });
                    }}
                    className="w-full bg-white border border-pink-200 rounded-xl p-2.5 font-semibold text-gray-800 focus:ring-2 focus:ring-pink-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">URL da Imagem</label>
                  <input
                    type="url"
                    value={editingProduct ? editingProduct.imageUrl : newProd.imageUrl}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (editingProduct) setEditingProduct({ ...editingProduct, imageUrl: val });
                      else setNewProd({ ...newProd, imageUrl: val });
                    }}
                    className="w-full bg-white border border-pink-200 rounded-xl p-2.5 font-semibold text-gray-800 focus:ring-2 focus:ring-pink-400 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">Descrição Detalhada</label>
                  <textarea
                    rows={2}
                    value={editingProduct ? editingProduct.description : newProd.description}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (editingProduct) setEditingProduct({ ...editingProduct, description: val });
                      else setNewProd({ ...newProd, description: val });
                    }}
                    placeholder="Descreva a fofura, toque, textura e durabilidade..."
                    className="w-full bg-white border border-pink-200 rounded-xl p-2.5 font-semibold text-gray-800 focus:ring-2 focus:ring-pink-400 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingProduct(false);
                      setEditingProduct(null);
                    }}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar Produto</span>
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Products Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-pink-100 rounded-2xl overflow-hidden">
              <thead className="bg-pink-50 text-pink-900 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Foto</th>
                  <th className="p-3">Produto</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3">Preço</th>
                  <th className="p-3">Estoque</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-100 font-medium">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-pink-50/40 transition-colors">
                    <td className="p-3">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-10 h-10 rounded-xl object-cover border border-pink-200"
                      />
                    </td>
                    <td className="p-3 font-bold text-gray-900">
                      <div className="truncate max-w-[200px]">{p.name}</div>
                      <div className="text-[10px] text-gray-400 font-normal truncate max-w-[200px]">
                        {p.description}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="capitalize bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-3 font-display font-bold text-pink-600 text-sm">
                      R$ {p.price.toFixed(2)}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                          p.stock <= 5
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {p.stock} un
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => {
                          sounds.playPop();
                          setEditingProduct(p);
                          setIsAddingProduct(false);
                        }}
                        className="p-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100"
                        title="Editar"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Content for TAB 2: Orders Received */}
      {activeSubTab === 'orders' && (
        <div className="bg-white rounded-3xl border-3 border-pink-200 p-4 sm:p-6 shadow-sm space-y-4">
          <div className="pb-3 border-b border-pink-100 flex items-center justify-between">
            <div>
              <h3 className="font-display font-black text-lg text-gray-900">
                Encomendas para Entrega no C.E.P.M.G Gilvan Sampaio
              </h3>
              <p className="text-xs text-gray-500">
                Avisos enviados automaticamente para o e-mail: <strong>{storeConfig?.sellerNotificationEmail || 'joaolucasgp1234@gmail.com'}</strong>
              </p>
            </div>
            <span className="bg-pink-100 text-pink-800 font-bold text-xs px-3 py-1 rounded-full">
              {orders.length} pedidos registrados
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12 text-gray-400 space-y-2">
              <div className="text-4xl">📦</div>
              <p className="font-bold text-sm">Nenhuma encomenda pendente no momento!</p>
              <p className="text-xs">Assim que um estudante encomendar, os dados e dispositivo aparecerão aqui.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-pink-50/40 border-2 border-pink-200 rounded-2xl p-4 text-xs space-y-2 hover:border-pink-300 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-pink-100">
                    <div>
                      <span className="font-display font-black text-pink-600 text-sm">
                        Pedido #{ord.id}
                      </span>
                      <span className="text-gray-400 ml-2 text-[11px]">
                        {new Date(ord.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px] uppercase">
                        {ord.status}
                      </span>
                      <span className="font-display font-black text-gray-900 text-sm">
                        Total: R$ {ord.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-gray-700">
                    <div>
                      <strong>Estudante:</strong> {ord.clientName}
                    </div>
                    <div>
                      <strong>Contato:</strong> {ord.clientContact}
                    </div>
                    <div>
                      <strong>Turma:</strong> {ord.studentGrade}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-2.5 border border-pink-100">
                    <strong className="block text-gray-900 mb-1">Itens Encomendados:</strong>
                    <ul className="list-disc list-inside space-y-0.5 text-gray-600">
                      {ord.items.map((it, idx) => (
                        <li key={idx}>
                          {it.quantity}x {it.productName} (R$ {(it.unitPrice * it.quantity).toFixed(2)})
                        </li>
                      ))}
                    </ul>
                    {ord.notes && (
                      <p className="mt-1 text-[11px] text-purple-700 font-medium">
                        <strong>Obs do aluno:</strong> {ord.notes}
                      </p>
                    )}
                  </div>

                  {/* Device Information Captured */}
                  <div className="bg-gray-100 rounded-xl p-2 text-[11px] text-gray-600 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 truncate">
                      <Smartphone className="w-3.5 h-3.5 text-pink-500 flex-shrink-0" />
                      <span className="truncate">
                        <strong>Dispositivo do Comprador:</strong> {ord.deviceInfo.deviceType} ({ord.deviceInfo.os}) • Navegador: {ord.deviceInfo.browser} • IP: {ord.deviceInfo.ipSimulated}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-semibold">
                      Tela: {ord.deviceInfo.screenSize}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content for TAB 3: Schedule, Location & Seller Notification Email */}
      {activeSubTab === 'schedule' && (
        <div className="bg-white rounded-3xl border-3 border-pink-200 p-4 sm:p-6 shadow-sm space-y-5">
          <div className="pb-3 border-b border-pink-100">
            <h3 className="font-display font-black text-lg text-gray-900">
              Horário, Local e Configuração de E-mail de Vendas
            </h3>
            <p className="text-xs text-gray-500">
              Configure onde as vendas ocorrem e para qual e-mail as encomendas de alunos serão notificadas.
            </p>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-pink-500" />
                  <span>Ponto de Entrega Oficial *</span>
                </label>
                <input
                  type="text"
                  required
                  value={tempConfig.pickupLocation}
                  onChange={(e) => setTempConfig({ ...tempConfig, pickupLocation: e.target.value })}
                  className="w-full bg-pink-50/50 border border-pink-200 rounded-xl p-3 font-semibold text-gray-800 focus:ring-2 focus:ring-pink-400 focus:outline-none"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Ex: Na porta do C.E.P.M.G Gilvan Sampaio
                </span>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span>Dias e Horários das Vendas *</span>
                </label>
                <input
                  type="text"
                  required
                  value={tempConfig.pickupSchedule}
                  onChange={(e) => setTempConfig({ ...tempConfig, pickupSchedule: e.target.value })}
                  className="w-full bg-pink-50/50 border border-pink-200 rounded-xl p-3 font-semibold text-gray-800 focus:ring-2 focus:ring-pink-400 focus:outline-none"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Ex: Toda Segunda e Terça-feira às 15:30
                </span>
              </div>
            </div>

            {/* Seller Notification Email (Strict requirement from user) */}
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 space-y-2">
              <label className="block font-bold text-amber-950 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-amber-600" />
                <span>E-mail do Vendedor para Receber os Pedidos (Configuração João Lucas) *</span>
              </label>
              <input
                type="email"
                required
                value={tempConfig.sellerNotificationEmail}
                onChange={(e) => setTempConfig({ ...tempConfig, sellerNotificationEmail: e.target.value })}
                className="w-full bg-white border border-amber-300 rounded-xl p-3 font-bold text-amber-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <p className="text-[11px] text-amber-800">
                ⚠️ Conforme solicitado: todas as encomendas feitas por alunos no app serão direcionadas para este e-mail informado antes pelo João Lucas!
              </p>
            </div>

            {/* Frase em Destaque no Topo (Badge "nada") - Exclusivo Adm Máximo */}
            <div className="bg-amber-50/70 border-2 border-amber-300 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-amber-950 flex items-center gap-1.5 text-xs sm:text-sm">
                  <span>👑</span>
                  <span>Frase do Destaque Superior (Apenas Adm Máximo João Lucas)</span>
                </label>
                <span className="text-[10px] bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full font-black">
                  Exclusivo
                </span>
              </div>
              <input
                type="text"
                value={tempConfig.customNoticePillText ?? 'nada'}
                onChange={(e) => setTempConfig({ ...tempConfig, customNoticePillText: e.target.value })}
                placeholder="Ex: nada ou Promoção Relâmpago"
                className="w-full bg-white border border-amber-300 rounded-xl p-2.5 font-bold text-gray-800 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <p className="text-[11px] text-amber-800">
                Altera o texto da pílula laranja que fica no topo da página inicial (ao lado de "Vendas da Helena 🌸").
              </p>
            </div>

            {/* Global Alert Bar Message */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-gray-700">Mensagem Global de Aviso no Topo do Site</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempConfig.globalAnnouncementActive}
                    onChange={(e) => setTempConfig({ ...tempConfig, globalAnnouncementActive: e.target.checked })}
                    className="w-4 h-4 text-pink-600 rounded"
                  />
                  <span className="font-bold text-gray-600">Exibir Aviso no Topo</span>
                </label>
              </div>

              <textarea
                rows={2}
                value={tempConfig.globalAnnouncement}
                onChange={(e) => setTempConfig({ ...tempConfig, globalAnnouncement: e.target.value })}
                placeholder="Digite a mensagem de aviso para a escola..."
                className="w-full bg-pink-50/50 border border-pink-200 rounded-xl p-3 font-medium text-gray-800 focus:ring-2 focus:ring-pink-400 focus:outline-none"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setTempConfig({ ...tempConfig, globalAnnouncement: '', globalAnnouncementActive: false })}
                  className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1 hover:underline"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpar Mensagem Global</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              {configSaved && (
                <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
                  <Check className="w-4 h-4" /> Configurações salvas no sistema!
                </span>
              )}

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-display font-bold text-sm rounded-2xl shadow-md flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Informações do Gilvan Sampaio</span>
              </motion.button>
            </div>
          </form>
        </div>
      )}

      {/* Content for TAB 4: Team & Granular Permissions */}
      {activeSubTab === 'team' && (
        <div className="bg-white rounded-3xl border-3 border-pink-200 p-4 sm:p-6 shadow-sm space-y-6">
          <div className="pb-3 border-b border-pink-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-display font-black text-lg text-gray-900">
                Equipe de Vendedores & Adms (Perfis Criados pelo Adm)
              </h3>
              <p className="text-xs text-gray-500">
                O Adm Máximo pode selecionar exatamente o que cada vendedor/adm secundário pode fazer.
              </p>
            </div>
          </div>

          {/* New Member Registration Form */}
          <div className="bg-purple-50/60 border-2 border-purple-200 rounded-3xl p-4 sm:p-5 space-y-4">
            <h4 className="font-display font-black text-sm text-purple-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-600" />
              <span>Cadastrar Novo Vendedor ou Administrador Secundário</span>
            </h4>

            <form onSubmit={handleCreateMember} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={newMemberName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewMemberName(val);
                      const norm = val.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                      if (norm.includes('joao lucas') || norm.includes('joaolucas')) {
                        setNewMemberIsMaxAdmin(true);
                      }
                    }}
                    placeholder="Ex: João Lucas ou Sofia"
                    className="w-full bg-white border border-purple-200 rounded-xl p-2.5 font-medium text-gray-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">E-mail de Login</label>
                  <input
                    type="email"
                    required
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="Ex: sofia@gmail.com"
                    className="w-full bg-white border border-purple-200 rounded-xl p-2.5 font-medium text-gray-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Senha de Acesso</label>
                  <input
                    type="password"
                    required
                    value={newMemberPassword}
                    onChange={(e) => setNewMemberPassword(e.target.value)}
                    placeholder="Defina a senha"
                    className="w-full bg-white border border-purple-200 rounded-xl p-2.5 font-medium text-gray-800 focus:outline-none"
                  />
                </div>
              </div>

              {/* Permission Checkboxes */}
              <div className="bg-white rounded-2xl p-3 border border-purple-200 space-y-2">
                <span className="font-bold text-purple-950 block">
                  Permissões Autorizadas pelo Adm Máximo:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-gray-700">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newMemberPermissions.canEditProducts}
                      onChange={(e) =>
                        setNewMemberPermissions({ ...newMemberPermissions, canEditProducts: e.target.checked })
                      }
                      className="rounded text-pink-600"
                    />
                    <span>Editar Produtos</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newMemberPermissions.canViewOrders}
                      onChange={(e) =>
                        setNewMemberPermissions({ ...newMemberPermissions, canViewOrders: e.target.checked })
                      }
                      className="rounded text-pink-600"
                    />
                    <span>Ver Encomendas</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newMemberPermissions.canPostStatus}
                      onChange={(e) =>
                        setNewMemberPermissions({ ...newMemberPermissions, canPostStatus: e.target.checked })
                      }
                      className="rounded text-pink-600"
                    />
                    <span>Postar Status</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newMemberPermissions.canChatWithClients}
                      onChange={(e) =>
                        setNewMemberPermissions({ ...newMemberPermissions, canChatWithClients: e.target.checked })
                      }
                      className="rounded text-pink-600"
                    />
                    <span>Atender Clientes</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newMemberPermissions.canManageCoupons}
                      onChange={(e) =>
                        setNewMemberPermissions({ ...newMemberPermissions, canManageCoupons: e.target.checked })
                      }
                      className="rounded text-pink-600"
                    />
                    <span>Criar Cupons</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newMemberPermissions.canSendGlobalMessages}
                      onChange={(e) =>
                        setNewMemberPermissions({ ...newMemberPermissions, canSendGlobalMessages: e.target.checked })
                      }
                      className="rounded text-pink-600"
                    />
                    <span>Avisos Globais</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newMemberPermissions.canEditSchedule}
                      onChange={(e) =>
                        setNewMemberPermissions({ ...newMemberPermissions, canEditSchedule: e.target.checked })
                      }
                      className="rounded text-pink-600"
                    />
                    <span>Mudar Horário</span>
                  </label>
                </div>
              </div>

              {/* Opção para colocar como Administrador Máximo */}
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3 space-y-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newMemberIsMaxAdmin}
                    onChange={(e) => setNewMemberIsMaxAdmin(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-amber-400"
                  />
                  <span className="font-extrabold text-amber-950 text-xs flex items-center gap-1">
                    <span>👑</span>
                    <span>Definir como Administrador Máximo (Acesso Total com Coroa Dourada)</span>
                  </span>
                </label>
                <p className="text-[11px] text-amber-800 pl-6 leading-tight">
                  Quando o João Lucas criar um perfil, pode marcá-lo como Adm Máximo para ter controle total de produtos, pedidos, equipe e aviso global.
                </p>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Salvar e Cadastrar Perfil</span>
              </button>
            </form>
          </div>

          {/* Members & Profiles Management List */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-pink-100">
              <div>
                <h4 className="font-display font-black text-base text-gray-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>Gerenciamento de Perfis Cadastrados</span>
                </h4>
                <p className="text-xs text-gray-500">
                  Gerencie todos os perfis do site: altere fotos, veja relatórios ou exclua perfis com sincronização automática em todo o site.
                </p>
              </div>

              {/* Quick Category Filters */}
              <div className="flex items-center gap-1.5 bg-purple-50 p-1 rounded-2xl border border-purple-200">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    setMemberRoleFilter('all');
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    memberRoleFilter === 'all'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-purple-700 hover:bg-purple-100'
                  }`}
                >
                  Todos ({users.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    setMemberRoleFilter('team');
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    memberRoleFilter === 'team'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-purple-700 hover:bg-purple-100'
                  }`}
                >
                  Equipe ({users.filter((u) => u.role === 'seller' || u.role === 'superadmin').length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    setMemberRoleFilter('clients');
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    memberRoleFilter === 'clients'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-purple-700 hover:bg-purple-100'
                  }`}
                >
                  Estudantes ({users.filter((u) => u.role === 'client').length})
                </button>
              </div>
            </div>

            {/* Search Bar for Profiles */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
                placeholder="Pesquisar perfil por nome, e-mail ou sala..."
                className="w-full bg-pink-50/40 border border-pink-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-2xl pl-9 pr-4 py-2 text-xs font-medium text-gray-900 placeholder-gray-400 outline-none transition-all"
              />
              {memberSearchQuery && (
                <button
                  type="button"
                  onClick={() => setMemberSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Profiles Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {users
                .filter((u) => {
                  if (memberRoleFilter === 'team') return u.role === 'seller' || u.role === 'superadmin';
                  if (memberRoleFilter === 'clients') return u.role === 'client';
                  return true;
                })
                .filter((u) => {
                  if (!memberSearchQuery.trim()) return true;
                  const query = memberSearchQuery.toLowerCase();
                  return (
                    u.name.toLowerCase().includes(query) ||
                    u.email.toLowerCase().includes(query) ||
                    (u.schoolClass && u.schoolClass.toLowerCase().includes(query))
                  );
                })
                .map((u) => (
                  <div
                    key={u.id}
                    className={`rounded-2xl p-4 border-2 text-xs flex flex-col justify-between gap-3 transition-all hover:shadow-xs ${
                      u.isMaxAdmin ? 'bg-amber-50/80 border-amber-300' : 'bg-white border-pink-100 hover:border-pink-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        onClick={() => handleOpenAvatarModal(u)}
                        className="relative group/avatar cursor-pointer flex-shrink-0"
                        title="Clique para mudar a foto deste perfil"
                      >
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-pink-300 group-hover/avatar:border-purple-500 transition-colors shadow-xs"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity text-white">
                          <Camera className="w-5 h-5" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-sm text-gray-900 truncate">{u.name}</span>
                          {u.isMaxAdmin && (
                            <span className="bg-amber-200 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                              <span>👑</span>
                              <span>Adm Máximo</span>
                            </span>
                          )}
                          {!u.isMaxAdmin && u.role === 'seller' && (
                            <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              🌸 Vendedora
                            </span>
                          )}
                          {!u.isMaxAdmin && u.role === 'client' && (
                            <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              🎒 Estudante/Cliente
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] text-gray-500 block truncate">{u.email}</span>
                        {u.schoolClass && (
                          <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md font-bold inline-block">
                            Turma: {u.schoolClass}
                          </span>
                        )}

                        <div className="text-[11px] text-gray-700 pt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-gray-500">Senha:</span>
                          <span className="font-mono text-[11px] font-bold bg-purple-50 text-purple-900 border border-purple-200 px-2 py-0.5 rounded-lg shadow-2xs">
                            {u.password || '123456 (Padrão)'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Profile Action Bar */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleOpenEditUserModal(u)}
                          className="inline-flex items-center gap-1 text-[11px] text-pink-700 bg-pink-50 hover:bg-pink-100 border border-pink-300 px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                          title={`Mudar nome, senha e dados de ${u.name}`}
                        >
                          <KeyRound className="w-3 h-3 text-pink-600" />
                          <span>Mudar Nome/Senha</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenAvatarModal(u)}
                          className="inline-flex items-center gap-1 text-[11px] text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1 rounded-xl font-bold transition-colors cursor-pointer"
                        >
                          <Camera className="w-3 h-3" />
                          <span>Mudar Foto</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenReportModal(u)}
                          className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-xl font-bold transition-colors cursor-pointer"
                        >
                          <BarChart3 className="w-3 h-3" />
                          <span>Relatório</span>
                        </button>

                        {/* Botão para colocar como Adm Máximo ou alternar */}
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playSparkle();
                            const nextMax = !u.isMaxAdmin;
                            const updated = users.map((usr) =>
                              usr.id === u.id
                                ? {
                                    ...usr,
                                    isMaxAdmin: nextMax,
                                    role: nextMax ? 'superadmin' : usr.role === 'superadmin' ? 'seller' : usr.role,
                                    permissions: nextMax
                                      ? {
                                          canEditProducts: true,
                                          canViewOrders: true,
                                          canEditSchedule: true,
                                          canPostStatus: true,
                                          canManageCoupons: true,
                                          canSendGlobalMessages: true,
                                          canChatWithClients: true,
                                          canManageTeam: true,
                                        }
                                      : usr.permissions,
                                  }
                                : usr
                            );
                            onUpdateUsers(updated);
                            try {
                              localStorage.setItem('hl_users', JSON.stringify(updated));
                            } catch {}
                          }}
                          className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer shadow-xs ${
                            u.isMaxAdmin
                              ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                              : 'bg-purple-100 text-purple-800 border border-purple-300 hover:bg-purple-200'
                          }`}
                          title={u.isMaxAdmin ? 'Remover status de Adm Máximo deste perfil' : 'Definir este perfil como Administrador Máximo (Acesso Total)'}
                        >
                          <Crown className="w-3 h-3 text-amber-600" />
                          <span>{u.isMaxAdmin ? '👑 É Adm Máximo' : 'Tornar Adm Máximo 👑'}</span>
                        </button>
                      </div>

                      {/* Delete Profile Button: permite apagar qualquer conta exceto a raiz original */}
                      {!(u.email?.toLowerCase() === 'joaolucasgp1234@gmail.com' && u.id === 'user-joao-lucas') ? (
                        deletingUserId === u.id ? (
                          <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-1.5 flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-rose-800">
                              Apagar {u.name}?
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                sounds.playPop();
                                if (onDeleteUser) {
                                  onDeleteUser(u.id);
                                }
                                onUpdateUsers(users.filter((item) => item.id !== u.id));
                                setDeletingUserId(null);
                              }}
                              className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg cursor-pointer"
                            >
                              Sim
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingUserId(null)}
                              className="px-2 py-0.5 bg-white border border-gray-300 text-gray-700 font-bold text-[10px] rounded-lg cursor-pointer"
                            >
                              Não
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              sounds.playPop();
                              setDeletingUserId(u.id);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-xl font-bold transition-colors cursor-pointer shadow-xs"
                            title={`Apagar perfil de ${u.name}`}
                          >
                            <Trash2 className="w-3 h-3 text-rose-600" />
                            <span>Apagar Perfil</span>
                          </button>
                        )
                      ) : (
                        <span className="text-[10px] text-amber-700 font-bold bg-amber-100/70 px-2 py-0.5 rounded-lg flex items-center gap-1">
                          <span>🛡️</span>
                          <span>Conta Principal</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Content for TAB 5: Devices & Connected Sessions */}
      {activeSubTab === 'devices' && (
        <div className="bg-white rounded-3xl border-3 border-pink-200 p-4 sm:p-6 shadow-sm space-y-4">
          <div className="pb-3 border-b border-pink-100 flex items-center justify-between">
            <div>
              <h3 className="font-display font-black text-lg text-gray-900">
                Auditoria de Dispositivos e Perfis que Logaram
              </h3>
              <p className="text-xs text-gray-500">
                Registro de segurança automático dos celulares, computadores e navegadores que acessaram o HL Vendas.
              </p>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
              {loggedDevices.length} dispositivos registrados
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-pink-100 rounded-2xl overflow-hidden">
              <thead className="bg-gray-100 text-gray-700 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Dispositivo / Aparelho</th>
                  <th className="p-3">Sistema / SO</th>
                  <th className="p-3">Navegador</th>
                  <th className="p-3">Resolução Tela</th>
                  <th className="p-3">IP Registrado</th>
                  <th className="p-3">Usuário Logado</th>
                  <th className="p-3">Horário</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {loggedDevices.map((dev, idx) => (
                  <tr key={idx} className="hover:bg-pink-50/30">
                    <td className="p-3 font-bold text-gray-900 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-pink-500" />
                      <span>{dev.deviceType}</span>
                    </td>
                    <td className="p-3">{dev.os}</td>
                    <td className="p-3">{dev.browser}</td>
                    <td className="p-3 font-mono text-[11px] text-gray-500">{dev.screenSize}</td>
                    <td className="p-3 font-mono text-[11px] text-purple-600 font-bold">{dev.ipSimulated}</td>
                    <td className="p-3 font-semibold text-pink-600">
                      {dev.loggedUserEmail || 'Visitante Aluno'}
                    </td>
                    <td className="p-3 text-gray-400 text-[10px]">
                      {new Date(dev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Content for TAB 6: Coupons & Discounts */}
      {activeSubTab === 'coupons' && (
        <div className="bg-white rounded-3xl border-3 border-pink-200 p-4 sm:p-6 shadow-sm space-y-6">
          <div className="pb-3 border-b border-pink-100">
            <h3 className="font-display font-black text-lg text-gray-900">
              Cupons de Desconto & Ofertas Programadas
            </h3>
            <p className="text-xs text-gray-500">
              Crie cupons para a escola inteira ou direcione para e-mails de clientes específicos!
            </p>
          </div>

          {/* Create Coupon Form */}
          <form onSubmit={handleCreateCoupon} className="bg-pink-50/50 border border-pink-200 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Código do Cupom *</label>
              <input
                type="text"
                required
                value={newCouponCode}
                onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                placeholder="Ex: VOLTAASAULAS"
                className="w-full uppercase bg-white border border-pink-200 rounded-xl p-2.5 font-bold text-gray-800"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Tipo de Desconto</label>
              <select
                value={newCouponType}
                onChange={(e) => setNewCouponType(e.target.value as any)}
                className="w-full bg-white border border-pink-200 rounded-xl p-2.5 font-bold text-gray-800"
              >
                <option value="percent">Porcentagem (%)</option>
                <option value="fixed">Valor Fixo (R$)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Valor do Desconto *</label>
              <input
                type="number"
                required
                value={newCouponValue}
                onChange={(e) => setNewCouponValue(Number(e.target.value))}
                className="w-full bg-white border border-pink-200 rounded-xl p-2.5 font-bold text-gray-800"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">E-mail Exclusivo (Opcional)</label>
              <input
                type="email"
                value={newCouponTargetEmail}
                onChange={(e) => setNewCouponTargetEmail(e.target.value)}
                placeholder="Deixe vazio para todos"
                className="w-full bg-white border border-pink-200 rounded-xl p-2.5 font-medium text-gray-800"
              />
            </div>

            <div className="sm:col-span-4 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Criar Novo Cupom</span>
              </button>
            </div>
          </form>

          {/* Coupons List */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {coupons.map((c) => (
              <div
                key={c.id}
                className="bg-white border-2 border-purple-200 rounded-2xl p-3.5 space-y-1.5 shadow-xs text-xs"
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="font-mono text-sm text-purple-700 font-black">{c.code}</span>
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px]">
                    {c.discountType === 'percent' ? `${c.discountValue}% OFF` : `R$ ${c.discountValue.toFixed(2)} OFF`}
                  </span>
                </div>
                <div className="text-[11px] text-gray-500">
                  {c.targetEmail ? (
                    <span className="text-pink-600 font-bold">Exclusivo para: {c.targetEmail}</span>
                  ) : (
                    <span>Válido para todos os estudantes</span>
                  )}
                </div>
                <div className="text-[10px] text-gray-400 flex items-center justify-between pt-1 border-t border-gray-100">
                  <span>Usado {c.usageCount} vezes</span>
                  <button
                    onClick={() => onUpdateCoupons(coupons.filter((item) => item.id !== c.id))}
                    className="text-red-400 hover:text-red-600 font-bold"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content for TAB: Global Announcement (Avisos Globais no Topo do Site) */}
      {activeSubTab === 'global_announcement' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-purple-700 via-pink-600 to-rose-600 rounded-3xl p-5 sm:p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-yellow-200">
                <Bell className="w-3.5 h-3.5" />
                <span>📢 Aba de Avisos Globais (Global Announcement)</span>
              </div>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-white">
                Transmissor de Avisos Globais para a Escola
              </h3>
              <p className="text-xs sm:text-sm text-pink-100 max-w-2xl">
                Configure comunicados urgentes, horários de entrega na porta do Gilvan Sampaio, avisos de estoque e promoções que aparecerão na faixa fixa no topo de todo o site para todos os alunos.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className={`px-4 py-2 rounded-2xl font-black text-xs flex items-center gap-2 shadow-sm ${
                tempConfig.globalAnnouncementActive
                  ? 'bg-emerald-400 text-emerald-950 border border-emerald-300'
                  : 'bg-white/20 text-white'
              }`}>
                <span className={`w-2.5 h-2.5 rounded-full ${
                  tempConfig.globalAnnouncementActive ? 'bg-emerald-700 animate-ping' : 'bg-gray-300'
                }`} />
                <span>{tempConfig.globalAnnouncementActive ? 'AVISO ATIVO NO SITE' : 'AVISO DESATIVADO'}</span>
              </div>
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="bg-white rounded-3xl border-3 border-purple-200 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-black text-base text-gray-900 flex items-center gap-2">
                <span>👀 Pré-visualização Ao Vivo (Como os alunos verão no topo)</span>
                <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2.5 py-0.5 rounded-full">
                  Visual em Tempo Real
                </span>
              </h4>
              <span className="text-xs text-gray-500">
                {tempConfig.globalAnnouncementActive ? '✅ Visível para todos' : '⚠️ Invisível até ser ativado'}
              </span>
            </div>

            {/* Actual Live Banner matching Navbar.tsx */}
            <div className="overflow-hidden rounded-2xl border-2 border-purple-300 shadow-md">
              <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 text-white text-xs sm:text-sm font-medium py-2.5 px-4 flex items-center justify-between gap-3 shadow-inner">
                <div className="flex-1 flex items-center justify-center gap-2 flex-wrap text-center">
                  {/* Admin/Sender Profile Photo */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={tempConfig.globalAnnouncementSenderAvatar || currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                      alt={tempConfig.globalAnnouncementSenderName || currentUser?.name || 'Administrador'}
                      className="w-7 h-7 rounded-full object-cover border-2 border-yellow-300 shadow-md ring-1 ring-white/60"
                    />
                    <span className="absolute -bottom-1 -right-1 bg-yellow-400 text-gray-900 rounded-full p-0.5 shadow-xs" title="Administrador Verificado">
                      <Crown className="w-2.5 h-2.5" />
                    </span>
                  </div>

                  {/* Admin/Sender Name with Verified Badge */}
                  <div className="flex items-center gap-1 font-black text-yellow-200 text-xs sm:text-sm whitespace-nowrap bg-black/20 px-2 py-0.5 rounded-lg border border-white/20">
                    <span>{tempConfig.globalAnnouncementSenderName || currentUser?.name || 'João Lucas (Admin)'}</span>
                    <CheckCircle className="w-3.5 h-3.5 text-sky-300 fill-sky-300" />
                  </div>

                  <Bell className="w-4 h-4 animate-bounce text-yellow-200 flex-shrink-0" />
                  
                  <span className="font-bold tracking-wide text-center leading-snug drop-shadow-xs">
                    {tempConfig.globalAnnouncement || 'Escreva o comunicado abaixo para visualizar este aviso em tempo real...'}
                  </span>
                </div>

                <div className="text-white/60 text-xs px-2 py-1 bg-black/20 rounded-lg flex-shrink-0">
                  Botão Fechar (X)
                </div>
              </div>
            </div>
          </div>

          {/* Announcement Editor & Controls */}
          <div className="bg-white rounded-3xl border-3 border-pink-200 p-5 sm:p-6 shadow-sm space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-pink-100">
                <div>
                  <h4 className="font-display font-black text-lg text-gray-900">
                    Configurações do Comunicado
                  </h4>
                  <p className="text-xs text-gray-500">
                    Ative ou desative o aviso e escreva o texto que será transmitido aos clientes.
                  </p>
                </div>

                {/* Main Toggle Switch */}
                <label className="flex items-center gap-3 cursor-pointer select-none bg-pink-50 hover:bg-pink-100 p-2.5 px-4 rounded-2xl border border-pink-200 transition-colors">
                  <span className="font-black text-xs text-gray-800">
                    Ativar Faixa no Topo do Site:
                  </span>
                  <input
                    type="checkbox"
                    checked={tempConfig.globalAnnouncementActive}
                    onChange={(e) => {
                      sounds.playPop();
                      setTempConfig({ ...tempConfig, globalAnnouncementActive: e.target.checked });
                    }}
                    className="w-5 h-5 accent-pink-600 rounded-md cursor-pointer"
                  />
                  <span className={`text-xs font-black uppercase px-2 py-0.5 rounded-full ${
                    tempConfig.globalAnnouncementActive
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-300 text-gray-700'
                  }`}>
                    {tempConfig.globalAnnouncementActive ? 'LIGADO' : 'DESLIGADO'}
                  </span>
                </label>
              </div>

              {/* Sender Identity Configuration */}
              <div className="bg-purple-50/70 rounded-3xl p-4 sm:p-5 border-2 border-purple-200 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-purple-200/70">
                  <div>
                    <span className="text-xs font-black text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
                      <Crown className="w-4 h-4 text-amber-500" />
                      <span>Nome e Foto do Emissor do Comunicado Global</span>
                    </span>
                    <p className="text-[11px] text-purple-700 mt-0.5">
                      Personalize a foto e o nome que aparecerão ao lado da coroa e do selo de verificado no topo do site.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.playPop();
                      setTempConfig((prev) => ({
                        ...prev,
                        globalAnnouncementSenderName: currentUser?.name || 'João Lucas (Adm Máximo)',
                        globalAnnouncementSenderAvatar: currentUser?.avatar || currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
                      }));
                    }}
                    className="text-xs font-bold text-purple-800 bg-white hover:bg-purple-100 border border-purple-300 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <span>✨ Usar Meu Nome e Foto Atuais</span>
                  </button>
                </div>

                {/* Hidden File Input for Device Upload */}
                <input
                  type="file"
                  ref={announcementAvatarFileRef}
                  onChange={handleAnnouncementAvatarUpload}
                  accept="image/*"
                  className="hidden"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Sender Name Field */}
                  <div>
                    <label className="block text-xs font-black text-gray-800 mb-1.5">
                      Nome do Administrador / Emissor *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={tempConfig.globalAnnouncementSenderName ?? 'João Lucas (Adm Máximo)'}
                        onChange={(e) => setTempConfig({ ...tempConfig, globalAnnouncementSenderName: e.target.value })}
                        placeholder="Ex: João Lucas (Adm Máximo)"
                        className="w-full bg-white border border-purple-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 rounded-2xl pl-10 pr-3 py-2.5 text-xs font-bold text-gray-900 outline-none transition-all shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Sender Photo Configuration & Upload */}
                  <div>
                    <label className="block text-xs font-black text-gray-800 mb-1.5">
                      Foto de Perfil do Emissor *
                    </label>
                    <div className="flex items-center gap-2.5">
                      <div className="relative group/photo flex-shrink-0">
                        <img
                          src={tempConfig.globalAnnouncementSenderAvatar || currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                          alt="Foto do Emissor"
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-400 shadow-sm ring-2 ring-purple-200"
                        />
                        <span className="absolute -bottom-1 -right-1 bg-amber-400 text-gray-900 rounded-full p-0.5 shadow-xs">
                          <Crown className="w-2.5 h-2.5" />
                        </span>
                      </div>

                      <div className="flex-1 space-y-1.5">
                        <button
                          type="button"
                          onClick={() => announcementAvatarFileRef.current?.click()}
                          className="w-full bg-white hover:bg-purple-50 text-purple-700 border-2 border-purple-300 hover:border-purple-500 rounded-xl px-3 py-1.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Subir Foto do Aparelho (PC / Celular)</span>
                        </button>

                        <input
                          type="text"
                          value={tempConfig.globalAnnouncementSenderAvatar ?? ''}
                          onChange={(e) => setTempConfig({ ...tempConfig, globalAnnouncementSenderAvatar: e.target.value })}
                          placeholder="Ou cole o link da foto (https://...)"
                          className="w-full bg-white border border-purple-200 focus:border-purple-500 rounded-xl px-2.5 py-1 text-[11px] font-medium text-gray-700 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Avatar Quick Presets */}
                <div className="pt-2 border-t border-purple-200/60 flex items-center gap-2 overflow-x-auto pb-1">
                  <span className="text-[11px] font-bold text-purple-900 flex-shrink-0">Fotos Rápidas:</span>
                  {[
                    { label: 'João Lucas', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80' },
                    { label: 'Helena', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
                    { label: 'Ursinho Fofo', url: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=100&auto=format&fit=crop&q=80' },
                    { label: 'Mascote Gamer', url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100&auto=format&fit=crop&q=80' },
                    { label: 'Estrela Dourada', url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=100&auto=format&fit=crop&q=80' }
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        sounds.playPop();
                        setTempConfig((prev) => ({
                          ...prev,
                          globalAnnouncementSenderAvatar: preset.url
                        }));
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-purple-200 hover:border-purple-400 text-[11px] font-bold text-gray-700 cursor-pointer flex-shrink-0 shadow-xs"
                    >
                      <img src={preset.url} alt={preset.label} className="w-4 h-4 rounded-full object-cover" />
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Input Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-black text-sm text-gray-800">
                    Texto do Comunicado Global (Global Announcement) *
                  </label>
                  <span className="text-xs font-mono text-gray-400">
                    {(tempConfig.globalAnnouncement || '').length} caracteres
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={tempConfig.globalAnnouncement}
                  onChange={(e) => setTempConfig({ ...tempConfig, globalAnnouncement: e.target.value })}
                  placeholder="Ex: 📢 Aviso: Entregas hoje às 15:30 na porta do C.E.P.M.G Gilvan Sampaio! Não se atrase! 🐾"
                  className="w-full bg-pink-50/50 border-2 border-pink-200 focus:border-purple-500 rounded-2xl p-3.5 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                />
              </div>

              {/* Quick Template Preset Chips */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-black text-gray-500 uppercase tracking-wider block">
                  💡 Modelos Rápidos de Avisos do Gilvan Sampaio (Clique para aplicar):
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    '📢 Entregas hoje às 15:30 na porta do C.E.P.M.G Gilvan Sampaio! Não se atrase! 🐾',
                    '🌸 Chegaram novos squishies fofinhos e pelúcias no catálogo! Garanta o seu antes que acabe!',
                    '⚡ Promoção Relâmpago: use o cupom GILVAN10 no carrinho para 10% de desconto hoje!',
                    '📦 Pedidos confirmados até as 14:00 serão entregues hoje no portão da escola!',
                    '🏫 Aviso Escolar Gilvan: Terça-feira teremos novidades exclusivas na porta!',
                    '🎉 Parabéns a todos os estudantes! Brindes especiais nos pedidos acima de R$ 30,00!'
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        sounds.playPop();
                        setTempConfig({
                          ...tempConfig,
                          globalAnnouncement: preset,
                          globalAnnouncementActive: true
                        });
                      }}
                      className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold px-3 py-1.5 rounded-xl border border-purple-200 transition-transform active:scale-95 text-left cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Save Bar */}
            <div className="pt-4 border-t border-pink-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {announcementSaved && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1.5 text-xs font-black text-emerald-800 bg-emerald-100 px-3.5 py-2 rounded-xl border-2 border-emerald-300 shadow-xs"
                  >
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Foto, Nome e Aviso Salvos Permanentemente no Site! 📢✨</span>
                  </motion.div>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={async () => {
                    sounds.playPop();
                    const updated = {
                      ...tempConfig,
                      globalAnnouncement: '',
                      globalAnnouncementActive: false
                    };
                    setTempConfig(updated);
                    onUpdateStoreConfig(updated);
                    try {
                      localStorage.setItem('hl_config', JSON.stringify(updated));
                      localStorage.setItem('hl_store_config', JSON.stringify(updated));
                    } catch {}
                    try {
                      await fetchWithFallback('/api/announcement/clear', { method: 'POST' });
                    } catch {}
                  }}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-2xl transition-colors cursor-pointer"
                >
                  Limpar e Desativar
                </button>

                <button
                  type="button"
                  onClick={handleSaveAnnouncement}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:to-rose-700 text-white font-black text-xs rounded-2xl shadow-md flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Foto, Nome e Transmitir Aviso 📢</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content for TAB 7: Lumininha Turbinada (Admin Superpowers) */}
      {activeSubTab === 'lumininha_turbo' && (
        <div className="bg-gradient-to-br from-amber-500/10 via-pink-500/10 to-purple-500/10 rounded-3xl border-3 border-amber-300 p-4 sm:p-6 shadow-sm space-y-6">
          <div className="pb-3 border-b border-amber-200 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-2xl shadow-md">
              ⚡
            </div>
            <div>
              <h3 className="font-display font-black text-xl text-gray-900">
                Lumininha AI Turbinada para o Painel do Adm
              </h3>
              <p className="text-xs text-gray-600">
                Superpoderes de criação: Modo Detetive de Produtos no Google/YouTube, estúdio de marketing e gerador de status!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Detective Mode */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-amber-200 space-y-3 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🕵️‍♀️</span>
                <div>
                  <h4 className="font-display font-black text-base text-gray-900">
                    Modo Detetive: Caçadora de Tendências
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Procura os produtos mais virais do TikTok/YouTube para vender no Gilvan Sampaio com margem de lucro calculada.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  value={detectiveQuery}
                  onChange={(e) => setDetectiveQuery(e.target.value)}
                  placeholder="Pesquisar tendências..."
                  className="w-full bg-amber-50/50 border border-amber-200 rounded-xl p-2.5 text-xs font-semibold text-gray-800"
                />
                <button
                  onClick={handleRunDetective}
                  disabled={detectiveLoading}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-orange-400 text-amber-950 font-display font-bold text-xs rounded-xl shadow-xs hover:shadow-md flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{detectiveLoading ? 'Investigando com a IA...' : 'Investigar Tendências Virais'}</span>
                </button>
              </div>

              {detectiveReport && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3 text-xs text-gray-800 max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed font-medium">
                  {detectiveReport}
                </div>
              )}
            </div>

            {/* Creative Studio & Video Copy Generator */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-pink-200 space-y-3 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎨</span>
                <div>
                  <h4 className="font-display font-black text-base text-gray-900">
                    Estúdio Criativo: Roteiro & Anúncios
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Cria roteiros chamativos e descrições para os vídeos de 20 minutos da Lumininha.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  value={marketingTopic}
                  onChange={(e) => setMarketingTopic(e.target.value)}
                  placeholder="Produto ou tema do anúncio..."
                  className="w-full bg-pink-50/50 border border-pink-200 rounded-xl p-2.5 text-xs font-semibold text-gray-800"
                />
                <button
                  onClick={handleRunMarketing}
                  disabled={marketingLoading}
                  className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-display font-bold text-xs rounded-xl shadow-xs hover:shadow-md flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{marketingLoading ? 'Gerando...' : 'Gerar Roteiro de Status com Som'}</span>
                </button>
              </div>

              {marketingCopy && (
                <div className="bg-pink-50/70 border border-pink-200 rounded-2xl p-3 text-xs text-gray-800 max-h-56 overflow-y-auto leading-relaxed font-medium">
                  {marketingCopy}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content for TAB 8: Light & Sound Show (Exclusivo Adm Máximo) */}
      {activeSubTab === 'light_show' && isMaxAdmin && (
        <div className="bg-gradient-to-br from-purple-900 via-gray-900 to-black rounded-3xl border-4 border-yellow-400 p-5 sm:p-7 text-white shadow-2xl space-y-5">
          <div className="pb-3 border-b border-white/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-yellow-300 animate-bounce" />
              <div>
                <h3 className="font-display font-black text-xl text-yellow-300">
                  Painel de Eventos de Luzes com Sons (Exclusivo João Lucas)
                </h3>
                <p className="text-xs text-gray-300">
                  Dispare efeitos visuais ao vivo no site de todos os alunos com fanfarras, sirenes e confetes!
                </p>
              </div>
            </div>
            <span className="bg-yellow-400 text-yellow-950 font-black text-xs px-3 py-1 rounded-full uppercase">
              Somente Adm Máximo
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTriggerLightShow('flash_sale')}
              className="p-5 rounded-3xl bg-gradient-to-br from-red-600 to-rose-700 border-2 border-red-400 shadow-lg text-left space-y-2 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-bold text-lg">
                🚨
              </div>
              <h4 className="font-display font-black text-base group-hover:text-yellow-300 transition-colors">
                Alerta Sirene Relâmpago
              </h4>
              <p className="text-xs text-red-100">
                Dispara sirene de emergência e banner pulsante de promoção instantânea.
              </p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTriggerLightShow('confetti')}
              className="p-5 rounded-3xl bg-gradient-to-br from-pink-600 to-purple-600 border-2 border-pink-400 shadow-lg text-left space-y-2 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-bold text-lg">
                🎉
              </div>
              <h4 className="font-display font-black text-base group-hover:text-yellow-300 transition-colors">
                Explosão de Confetes
              </h4>
              <p className="text-xs text-pink-100">
                Chuva de confetes 2D coloridos com fanfarra comemorativa de vitórias!
              </p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTriggerLightShow('rainbow')}
              className="p-5 rounded-3xl bg-gradient-to-br from-purple-600 via-pink-600 to-amber-500 border-2 border-yellow-300 shadow-lg text-left space-y-2 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-bold text-lg">
                🌈
              </div>
              <h4 className="font-display font-black text-base group-hover:text-yellow-300 transition-colors">
                Arco-Íris Brilhante
              </h4>
              <p className="text-xs text-purple-100">
                Transição de cores com sintetizador de sinos cintilantes.
              </p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTriggerLightShow('neon_disco')}
              className="p-5 rounded-3xl bg-gradient-to-br from-blue-600 to-teal-500 border-2 border-teal-300 shadow-lg text-left space-y-2 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-bold text-lg">
                🪩
              </div>
              <h4 className="font-display font-black text-base group-hover:text-yellow-300 transition-colors">
                Baladinha Neon
              </h4>
              <p className="text-xs text-blue-100">
                Iluminação estroboscópica festiva com sons para animar as vendas!
              </p>
            </motion.button>
          </div>
        </div>
      )}

      {/* Content for TAB EXCLUSIVA: Site YouTube Background Video (Somente Adm Máximo) */}
      {activeSubTab === 'site_youtube_bg' && isMaxAdmin && (
        <div className="bg-white rounded-3xl border-3 border-red-200 p-4 sm:p-7 shadow-sm space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 rounded-2xl p-4 sm:p-5 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                <h3 className="font-display font-black text-lg sm:text-xl text-yellow-300">
                  Fundo do Site com Vídeo do YouTube
                </h3>
              </div>
              <p className="text-xs text-white/90 leading-relaxed max-w-2xl">
                Defina qualquer vídeo do YouTube como plano de fundo animado para o site do Gilvan Sampaio!
              </p>
            </div>
            <span className="bg-yellow-400 text-yellow-950 font-black text-[11px] px-3 py-1 rounded-full uppercase tracking-wider shadow-xs flex-shrink-0 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Somente Adm Máximo
            </span>
          </div>

          {/* Informational Banner */}
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 flex items-start gap-3 text-emerald-900 text-xs shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-200 text-emerald-900 flex items-center justify-center font-bold flex-shrink-0 text-sm">
              🎬
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-emerald-950 text-sm">
                Fundo do Site com Vídeo Ativo em Todo o Site!
              </h4>
              <p className="text-emerald-800 leading-relaxed">
                O vídeo do YouTube roda como plano de fundo imersivo em todo o site (inclusive na Tela Inicial e em todas as páginas).
                Os controles de configuração e personalização do fundo são <strong>100% exclusivos do Adm Máximo</strong> aqui no painel e <strong>não aparecem na tela inicial para ninguém</strong>!
              </p>
            </div>
          </div>

          {/* Configuration Form */}
          <div className="space-y-6">
            {/* Activation Switch */}
            <div className="bg-pink-50/50 border border-pink-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-red-600" />
                  <h4 className="font-bold text-gray-900 text-sm">
                    Status do Fundo em Vídeo do YouTube
                  </h4>
                </div>
                <p className="text-xs text-gray-500">
                  Ligue ou desligue o vídeo de fundo para as páginas secundárias quando desejar.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    const updated = {
                      ...tempConfig,
                      siteYoutubeBgActive: false,
                      siteYoutubeBgUrl: ''
                    };
                    setTempConfig(updated);
                    onUpdateStoreConfig(updated);
                    try {
                      localStorage.setItem('hl_config', JSON.stringify(updated));
                    } catch {}
                  }}
                  className="px-4 py-2.5 rounded-2xl font-bold text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  title="Remove o vídeo e restaura o fundo original limpo do site"
                >
                  <span>🎨 Usar Fundo Padrão (Sem Vídeo)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    const updated = {
                      ...tempConfig,
                      siteYoutubeBgActive: !tempConfig.siteYoutubeBgActive
                    };
                    setTempConfig(updated);
                    onUpdateStoreConfig(updated);
                    try {
                      localStorage.setItem('hl_config', JSON.stringify(updated));
                    } catch {}
                  }}
                  className={`px-5 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                    tempConfig.siteYoutubeBgActive
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 ring-2 ring-emerald-400'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${tempConfig.siteYoutubeBgActive ? 'bg-white animate-pulse' : 'bg-gray-400'}`} />
                  <span>{tempConfig.siteYoutubeBgActive ? 'VÍDEO ATIVADO NO SITE' : 'VÍDEO DESATIVADO'}</span>
                </button>
              </div>
            </div>

            {/* YouTube Link Input */}
            <div className="space-y-2">
              <label className="block font-bold text-xs text-gray-800 flex items-center gap-1.5">
                <Link2 className="w-4 h-4 text-red-600" />
                <span>Link ou URL do Vídeo do YouTube:</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={tempConfig.siteYoutubeBgUrl || ''}
                  onChange={(e) => setTempConfig({ ...tempConfig, siteYoutubeBgUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=... ou https://youtu.be/..."
                  className="flex-1 bg-gray-50 border border-gray-300 rounded-2xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    sounds.playSuccess();
                    onUpdateStoreConfig(tempConfig);
                    try {
                      localStorage.setItem('hl_config', JSON.stringify(tempConfig));
                    } catch {}
                  }}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer flex-shrink-0"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Link</span>
                </button>
              </div>
              <p className="text-[11px] text-gray-400">
                Aceita qualquer formato: vídeos normais (watch?v=), links encurtados (youtu.be), shorts ou o ID de 11 caracteres.
              </p>
            </div>

            {/* Presets Kawaii & Estilosos Prontos em 1 clique */}
            <div className="space-y-2.5 bg-gray-50 rounded-2xl p-4 border border-gray-200">
              <span className="font-bold text-xs text-gray-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Sugestões Kawaii & Lofi Prontas (Clique para aplicar imediatamente):</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {[
                  { name: '🎧 Lofi Hip Hop Relax (Gilvan)', url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk' },
                  { name: '🌸 Chuva de Sakura & Anime Relax', url: 'https://www.youtube.com/watch?v=5qap5aO4i9A' },
                  { name: '🛍️ Papelaria Kawaii & Estudo Fofo', url: 'https://www.youtube.com/watch?v=TURbeWK2wwg' },
                  { name: '🪐 Galáxia Neon & Estrelas Lofi', url: 'https://www.youtube.com/watch?v=DWcJFNfaw9c' },
                  { name: '🧸 Squishies Fofos & Mochi Anime', url: 'https://www.youtube.com/watch?v=lTRiuFIWV54' },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      sounds.playPop();
                      const updated = {
                        ...tempConfig,
                        siteYoutubeBgUrl: preset.url,
                        siteYoutubeBgActive: true
                      };
                      setTempConfig(updated);
                      onUpdateStoreConfig(updated);
                      try {
                        localStorage.setItem('hl_config', JSON.stringify(updated));
                      } catch {}
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                      tempConfig.siteYoutubeBgUrl === preset.url
                        ? 'bg-red-50 border-red-300 text-red-800 shadow-xs ring-1 ring-red-400'
                        : 'bg-white hover:bg-red-50/50 border-gray-200 text-gray-700'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Adjustments: Opacity & Blur */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Opacity Slider */}
              <div className="bg-pink-50/30 border border-pink-100 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between font-bold text-xs text-gray-800">
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-pink-600" />
                    <span>Opacidade do Vídeo de Fundo:</span>
                  </span>
                  <span className="text-pink-600 font-mono text-sm">
                    {tempConfig.siteYoutubeBgOpacity ?? 30}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="85"
                  step="5"
                  value={tempConfig.siteYoutubeBgOpacity ?? 30}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const updated = { ...tempConfig, siteYoutubeBgOpacity: val };
                    setTempConfig(updated);
                    onUpdateStoreConfig(updated);
                    try {
                      localStorage.setItem('hl_config', JSON.stringify(updated));
                    } catch {}
                  }}
                  className="w-full accent-red-600 cursor-pointer"
                />
                <p className="text-[10px] text-gray-400">
                  Valores entre 25% e 40% garantem o visual perfeito com alta legibilidade de todos os textos.
                </p>
              </div>

              {/* Blur Level Buttons */}
              <div className="bg-pink-50/30 border border-pink-100 rounded-2xl p-4 space-y-2">
                <span className="font-bold text-xs text-gray-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>Efeito de Desfoque (Blur Glass):</span>
                </span>
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[
                    { label: 'Nenhum', blur: 0 },
                    { label: 'Leve (2px)', blur: 2 },
                    { label: 'Médio (4px)', blur: 4 },
                    { label: 'Forte (8px)', blur: 8 },
                  ].map((b) => (
                    <button
                      key={b.blur}
                      type="button"
                      onClick={() => {
                        sounds.playPop();
                        const updated = { ...tempConfig, siteYoutubeBgBlur: b.blur };
                        setTempConfig(updated);
                        onUpdateStoreConfig(updated);
                        try {
                          localStorage.setItem('hl_config', JSON.stringify(updated));
                        } catch {}
                      }}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                        (tempConfig.siteYoutubeBgBlur ?? 0) === b.blur
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-white hover:bg-purple-50 text-gray-700 border border-gray-200'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400">
                  Um desfoque leve cria um ambiente estético suave sem cansar os olhos dos alunos.
                </p>
              </div>
            </div>

            {/* Live Preview Box */}
            <div className="bg-gray-900 rounded-2xl p-4 sm:p-5 border-2 border-gray-800 text-white space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                <span className="font-bold text-xs text-gray-300 flex items-center gap-2">
                  <Play className="w-4 h-4 text-red-500 fill-red-500" />
                  <span>Pré-visualização do Vídeo (Loop em Silêncio):</span>
                </span>
                <span className="text-[11px] text-gray-400">
                  Reprodução idêntica ao fundo
                </span>
              </div>

              {tempConfig.siteYoutubeBgUrl ? (
                <div className="relative rounded-xl overflow-hidden aspect-video bg-black max-w-lg mx-auto border border-gray-700">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${extractYouTubeId(tempConfig.siteYoutubeBgUrl)}?autoplay=1&mute=1&controls=0&loop=1&playlist=${extractYouTubeId(tempConfig.siteYoutubeBgUrl)}&playsinline=1&modestbranding=1&rel=0&iv_load_policy=3`}
                    title="Prévia Vídeo YouTube Fundo"
                    className="w-full h-full border-0 pointer-events-none"
                    style={{
                      opacity: (tempConfig.siteYoutubeBgOpacity ?? 30) / 100,
                      filter: (tempConfig.siteYoutubeBgBlur ?? 0) > 0 ? `blur(${tempConfig.siteYoutubeBgBlur}px)` : undefined,
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none flex items-end p-3">
                    <span className="text-xs text-yellow-300 font-bold bg-black/60 px-2 py-0.5 rounded-md">
                      ✨ Vídeo Ativo (Opacidade: {tempConfig.siteYoutubeBgOpacity ?? 30}%)
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 text-xs">
                  Insira uma URL do YouTube acima para ver a pré-visualização.
                </div>
              )}
            </div>

            {/* Big Action Save Button */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                {configSaved && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1.5 text-xs font-black text-emerald-700 bg-emerald-100 px-3.5 py-2 rounded-xl border border-emerald-200"
                  >
                    <Check className="w-4 h-4" />
                    <span>Configuração do Fundo Salva com Sucesso! 🎬✨</span>
                  </motion.div>
                )}
              </div>

              <button
                type="button"
                onClick={handleSaveConfig}
                className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-extrabold text-sm rounded-2xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Configuração do Fundo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content for TAB 9: Team Messages & Lumininha */}
      {activeSubTab === 'messages' && (
        <div className="bg-white rounded-3xl border-3 border-pink-200 p-4 sm:p-6 shadow-sm space-y-4">
          <div className="pb-3 border-b border-pink-100">
            <h3 className="font-display font-black text-lg text-gray-900">
              Caixa de Entrada & Comunicação com a Equipe e Lumininha
            </h3>
            <p className="text-xs text-gray-500">
              Receba relatórios operacionais da Lumininha e mensagens de Helena e vendedoras.
            </p>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto">
            {adminMessages.map((m) => (
              <div
                key={m.id}
                className="bg-pink-50/50 border border-pink-200 rounded-2xl p-3.5 space-y-1 text-xs"
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="text-pink-700">{m.sender}</span>
                  <span className="text-[10px] text-gray-400 font-normal">{m.time}</span>
                </div>
                <p className="text-gray-800 leading-relaxed font-medium">{m.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2 pt-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Enviar mensagem para a equipe ou para a Lumininha..."
              className="flex-1 bg-pink-50/50 border border-pink-200 rounded-2xl px-4 py-2.5 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs rounded-2xl shadow-sm flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Enviar</span>
            </button>
          </form>
        </div>
      )}

      {/* Content for TAB 10: Real-time Reports */}
      {activeSubTab === 'reports' && (
        <div className="bg-white rounded-3xl border-3 border-pink-200 p-4 sm:p-6 shadow-sm space-y-5">
          <div className="pb-3 border-b border-pink-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-display font-black text-lg sm:text-xl text-gray-900 flex items-center gap-2">
                <span>📊</span>
                <span>Relatórios Oficiais de Perfis & Desempenho</span>
              </h3>
              <p className="text-xs text-gray-500">
                Relatórios reais, auditados e interativos de cada vendedor e estudante do C.E.P.M.G Gilvan Sampaio.
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>🖨️</span>
              <span>Imprimir Relatório Geral</span>
            </button>
          </div>

          {/* Store Macro Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-pink-50 rounded-2xl p-3.5 border border-pink-200 text-center">
              <span className="text-[10px] uppercase font-bold text-gray-500 block">Faturamento Previsto</span>
              <span className="font-display font-black text-xl sm:text-2xl text-pink-600 block mt-1">
                R$ {orders.reduce((acc, o) => acc + o.totalAmount, 0).toFixed(2)}
              </span>
              <span className="text-[10px] text-pink-400 font-semibold">{orders.length} pedidos</span>
            </div>

            <div className="bg-purple-50 rounded-2xl p-3.5 border border-purple-200 text-center">
              <span className="text-[10px] uppercase font-bold text-gray-500 block">Vendas Entregues</span>
              <span className="font-display font-black text-xl sm:text-2xl text-purple-700 block mt-1">
                {223 + orders.filter(o => o.status === 'entregue').length}
              </span>
              <span className="text-[10px] text-purple-400 font-semibold">100% no portão</span>
            </div>

            <div className="bg-amber-50 rounded-2xl p-3.5 border border-amber-200 text-center">
              <span className="text-[10px] uppercase font-bold text-gray-500 block">Total de Likes</span>
              <span className="font-display font-black text-xl sm:text-2xl text-amber-700 block mt-1">
                {users.reduce((acc, u) => acc + u.likesReceived, 0)}
              </span>
              <span className="text-[10px] text-amber-500 font-semibold">Engajamento real</span>
            </div>

            <div className="bg-emerald-50 rounded-2xl p-3.5 border border-emerald-200 text-center">
              <span className="text-[10px] uppercase font-bold text-gray-500 block">Seguidores Ativos</span>
              <span className="font-display font-black text-xl sm:text-2xl text-emerald-700 block mt-1">
                {users.reduce((acc, u) => acc + u.followersCount, 0)}
              </span>
              <span className="text-[10px] text-emerald-500 font-semibold">Alunos Gilvan</span>
            </div>
          </div>

          {/* Interactive Profile Reports List */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs sm:text-sm text-gray-800 flex items-center gap-1.5">
                <span>👥</span>
                <span>Relatórios Individuais dos Membros & Clientes (Clique para Abrir):</span>
              </h4>
              <span className="text-[11px] text-purple-600 font-bold">
                {users.length} perfis cadastrados
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {users.map((profile) => (
                <div
                  key={profile.id}
                  className="bg-white hover:bg-purple-50/40 transition-colors border-2 border-purple-100 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-purple-200 shadow-xs"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-gray-900 text-xs sm:text-sm">{profile.name}</span>
                        {profile.isMaxAdmin && <span>👑</span>}
                      </div>
                      <span className="text-[10px] text-gray-500 block">{profile.email}</span>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                        <span className="text-purple-700 font-bold">
                          {profile.salesCount} vendas
                        </span>
                        <span>•</span>
                        <span className="text-rose-600 font-bold">
                          {profile.likesReceived} likes
                        </span>
                        <span>•</span>
                        <span className="text-amber-600 font-bold">
                          {profile.followersCount} seguidores
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenReportModal(profile)}
                    className="px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-transform hover:scale-105"
                  >
                    <span>📊</span>
                    <span>Ver Relatório</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content for TAB: Mascote & Emoções (Controle da Lumininha e Símbolo do João da Imagem) */}
      {activeSubTab === 'mascot' && isMaxAdmin && (
        <div className="space-y-6 pt-2">
          {/* Header Explanation */}
          <div className="bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 rounded-3xl p-5 sm:p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-yellow-200 mb-2">
                <span>👑 Aba Exclusiva do Adm Máximo</span>
              </div>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-white">
                Controle do Mascote, Emoções & Vídeo do YouTube
              </h3>
              <p className="text-xs sm:text-sm text-pink-100 max-w-2xl mt-1">
                Aba dedicada exclusivamente para testar as reações da Lumininha (Calor, Frio, Bom, Chuva), trocar o link do vídeo do YouTube e definir se você deseja usar seu símbolo animado/pixel art como mascote oficial do HL Vendas!
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  sounds.playSparkle();
                  setActiveSubTab('symbols_studio');
                }}
                className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-yellow-950 font-black text-xs rounded-2xl shadow-md flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4" />
                <span>Desenhar Pixels no Estúdio</span>
              </button>
            </div>
          </div>

          {/* Interactive Card Exactly as Shown in the User's Screenshot */}
          {(() => {
            const adminActiveSymbol = symbolConfig?.replaceLumininhaWithSymbol
              ? customSymbols.find((s) => s.id === symbolConfig.selectedMascotSymbolId) || customSymbols[0]
              : null;

            let emotionData = {
              mood: 'bom',
              face: '🥰',
              accessory: '✨',
              title: 'Radiante & Feliz!',
              reactionNote: 'Pulando de alegria com os novos squishies!',
              bgColor: 'from-pink-400 via-rose-400 to-yellow-300',
              borderColor: 'border-pink-400',
            };

            if (weatherType === 'calor' || temperature >= 30) {
              emotionData = {
                mood: 'calor',
                face: '🥵',
                accessory: '🪭',
                title: 'Com Calorão!',
                reactionNote: 'Abanando um leque fofo!',
                bgColor: 'from-amber-400 via-orange-400 to-rose-400',
                borderColor: 'border-orange-400',
              };
            } else if (weatherType === 'frio' || temperature <= 16) {
              emotionData = {
                mood: 'frio',
                face: '🥶',
                accessory: '🧣',
                title: 'Com Friozinho!',
                reactionNote: 'Tremendo fofinha com cachecol!',
                bgColor: 'from-blue-400 via-cyan-400 to-indigo-400',
                borderColor: 'border-blue-400',
              };
            } else if (weatherType === 'chuva') {
              emotionData = {
                mood: 'chuva',
                face: '🌧️',
                accessory: '☔',
                title: 'Com Chuva no Gilvan!',
                reactionNote: 'Segurando um guarda-chuva fofo!',
                bgColor: 'from-purple-500 via-indigo-500 to-cyan-500',
                borderColor: 'border-purple-400',
              };
            }

            const extractYtId = (url: string) => {
              if (!url) return 'jfKfPfyJRdk';
              const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|shorts\/|&v=)([^#&?]*).*/;
              const match = url.match(regExp);
              return match && match[2].length === 11 ? match[2] : 'jfKfPfyJRdk';
            };

            const adminYtId = extractYtId(adminYoutubeInput || youtubeUrl);

            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-black text-lg text-gray-900 flex items-center gap-2">
                    <span>👀 Pré-Visualização Ao Vivo (Como a Mascote Reage no Site)</span>
                    <span className="text-xs font-bold text-pink-600 bg-pink-100 px-2.5 py-0.5 rounded-full">
                      Tempo Real
                    </span>
                  </h4>
                  <span className="text-xs text-gray-500">
                    Qualquer emoção que você testar aqui já atualiza a IA instantaneamente.
                  </span>
                </div>

                {/* THE EXACT BANNER FROM THE SCREENSHOT */}
                <div className={`bg-gradient-to-r ${emotionData.bgColor} rounded-3xl p-5 sm:p-6 text-white shadow-lg border-4 ${emotionData.borderColor} transition-all duration-500`}>
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
                    {/* Mascot Avatar and Info */}
                    <div className="flex items-center gap-4 text-center sm:text-left">
                      <div
                        onClick={() => {
                          sounds.playPop();
                          setIsVideoTestingOpen((prev) => !prev);
                        }}
                        className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-black shadow-xl flex items-center justify-center text-4xl sm:text-5xl border-4 border-white flex-shrink-0 overflow-hidden cursor-pointer group select-none"
                        title="Vídeo no Ícone da IA (Sem som) - Clique para abrir o teste ampliado"
                      >
                        {showVideoInAdminIcon && adminYtId ? (
                          <div className="absolute inset-0 w-full h-full overflow-hidden bg-black flex items-center justify-center">
                            <iframe
                              src={`https://www.youtube-nocookie.com/embed/${adminYtId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${adminYtId}&playsinline=1&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&fs=0`}
                              title="Vídeo no Ícone da IA (Sem som)"
                              className="w-[220%] h-[220%] -ml-[60%] -mt-[60%] object-cover pointer-events-none"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              tabIndex={-1}
                            />
                            {/* Floating badge: Sem Som 🔇 */}
                            <div className="absolute bottom-1 right-1 bg-black/80 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 pointer-events-none z-10 border border-white/20">
                              <VolumeX className="w-2.5 h-2.5 text-rose-300" />
                              <span>Sem som</span>
                            </div>
                            <div className="absolute top-1 left-1 bg-red-600/90 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider flex items-center gap-1 pointer-events-none z-10">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                              <span>AO VIVO</span>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full bg-white/95 flex items-center justify-center">
                            {adminActiveSymbol ? (
                              adminActiveSymbol.category === 'pixel' ? (
                                <AnimatedPixelSprite
                                  frames={adminActiveSymbol.pixelFrames}
                                  matrix={adminActiveSymbol.pixelMatrix}
                                  fps={adminActiveSymbol.pixelFps || 4}
                                  size="lg"
                                  className="rounded-xl"
                                />
                              ) : (
                                <span style={{ color: adminActiveSymbol.color }}>
                                  {adminActiveSymbol.charOrIcon}
                                </span>
                              )
                            ) : (
                              <span>{emotionData.face}</span>
                            )}
                            <span className="absolute -bottom-1 -right-1 text-2xl animate-spin">
                              {adminActiveSymbol ? '✨' : emotionData.accessory}
                            </span>
                          </div>
                        )}

                        <div className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow-md group-hover:scale-125 transition-transform z-10" title="Vídeo no Ícone (Sem som)">
                          <Video className="w-2.5 h-2.5 fill-white" />
                        </div>
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                          <span className="bg-white/30 backdrop-blur-xs text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                            {adminActiveSymbol ? `MASCOTE DO JOÃO: ${adminActiveSymbol.name.toUpperCase()}` : 'MASCOTE OFICIAL HL VENDAS'}
                          </span>
                          <span className="bg-white/90 text-gray-900 font-bold text-xs px-2.5 py-0.5 rounded-full shadow-xs">
                            {temperature}°C
                          </span>

                          {/* Toggle Video inside Icon */}
                          <button
                            type="button"
                            onClick={() => {
                              sounds.playPop();
                              setShowVideoInAdminIcon((prev) => !prev);
                            }}
                            className={`text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs transition-all cursor-pointer ${
                              showVideoInAdminIcon 
                                ? 'bg-amber-300 hover:bg-amber-200 text-amber-950' 
                                : 'bg-white/90 hover:bg-white text-gray-800'
                            }`}
                            title="Alternar vídeo no ícone"
                          >
                            <Video className="w-3 h-3 text-red-600" />
                            <span>{showVideoInAdminIcon ? '🎬 Vídeo no Ícone Ativo' : '🐾 Exibir Mascote'}</span>
                          </button>

                          {/* Mute indicator */}
                          <span className="bg-black/40 text-yellow-200 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                            <VolumeX className="w-3 h-3" />
                            <span>Sem som</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              sounds.playPop();
                              setIsVideoTestingOpen((prev) => !prev);
                            }}
                            className="text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs bg-white text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>{isVideoTestingOpen ? 'Fechar Vídeo' : 'Vídeo YouTube ▶'}</span>
                          </button>
                        </div>

                        <h2 className="font-display font-black text-2xl sm:text-3xl mt-1 tracking-tight text-white drop-shadow-sm">
                          {adminActiveSymbol ? `${adminActiveSymbol.name} AI` : `Lumininha AI: ${emotionData.title}`}
                        </h2>

                        <p className="text-xs sm:text-sm text-white/90 font-medium max-w-lg mt-0.5">
                          {adminActiveSymbol
                            ? `Símbolo animado exclusivo substituindo a Lumininha como mascote oficial do site com movimento de ${adminActiveSymbol.animationEffect || 'spin'}!`
                            : `${emotionData.reactionNote} • Especialista em vendas e encomendas para a porta do Gilvan Sampaio!`}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-yellow-200 mt-1 font-semibold">
                          <span>👆 Passe o mouse ou toque com o dedo na Lumininha para rodar o vídeo!</span>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Climate & Emotion Controller FROM SCREENSHOT */}
                    <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 border border-white/30 space-y-2 w-full md:w-auto">
                      <span className="text-[11px] font-bold text-white uppercase tracking-wider block text-center md:text-left">
                        TESTAR EMOÇÕES DA LUMININHA:
                      </span>

                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playPop();
                            onUpdateWeather?.('calor');
                            onUpdateTemperature?.(34);
                          }}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                            weatherType === 'calor'
                              ? 'bg-orange-500 text-white shadow-md ring-2 ring-white'
                              : 'bg-white/30 hover:bg-white/40 text-white'
                          }`}
                          title="Calorão"
                        >
                          <Sun className="w-3.5 h-3.5" />
                          <span>34°C Calor</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            sounds.playPop();
                            onUpdateWeather?.('frio');
                            onUpdateTemperature?.(13);
                          }}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                            weatherType === 'frio'
                              ? 'bg-blue-600 text-white shadow-md ring-2 ring-white'
                              : 'bg-white/30 hover:bg-white/40 text-white'
                          }`}
                          title="Friozinho"
                        >
                          <Snowflake className="w-3.5 h-3.5" />
                          <span>13°C Frio</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            sounds.playPop();
                            onUpdateWeather?.('bom');
                            onUpdateTemperature?.(24);
                          }}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                            weatherType === 'bom'
                              ? 'bg-pink-600 text-white shadow-md ring-2 ring-white'
                              : 'bg-white/30 hover:bg-white/40 text-white'
                          }`}
                          title="Agradável e Feliz"
                        >
                          <Smile className="w-3.5 h-3.5" />
                          <span>24°C Bom</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            sounds.playPop();
                            onUpdateWeather?.('chuva');
                            onUpdateTemperature?.(19);
                          }}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                            weatherType === 'chuva'
                              ? 'bg-purple-700 text-white shadow-md ring-2 ring-white'
                              : 'bg-white/30 hover:bg-white/40 text-white'
                          }`}
                          title="Chuva e Zangadinha"
                        >
                          <CloudRain className="w-3.5 h-3.5" />
                          <span>Chuva</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Test YouTube Video Display */}
                  <AnimatePresence>
                    {isVideoTestingOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-white/20 overflow-hidden"
                      >
                        <div className="bg-gray-950/95 rounded-2xl p-4 text-white space-y-3 border border-yellow-300">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-yellow-300 flex items-center gap-1.5">
                              <Video className="w-4 h-4 text-red-500" />
                              <span>Teste de Reprodução do Vídeo do YouTube</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setIsVideoTestingOpen(false)}
                              className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2.5 py-1 rounded-lg"
                            >
                              Fechar Teste
                            </button>
                          </div>
                          <div className="relative aspect-video w-full max-w-xl mx-auto rounded-xl overflow-hidden shadow-2xl bg-black border border-gray-800">
                            <iframe
                              src={`https://www.youtube-nocookie.com/embed/${extractYtId(adminYoutubeInput || youtubeUrl)}?autoplay=1&mute=1&rel=0&playsinline=1`}
                              title="Vídeo YouTube Mascote HL Vendas (Sem som)"
                              className="w-full h-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                            />
                            <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/20 pointer-events-none">
                              <VolumeX className="w-3 h-3 text-rose-300" />
                              <span>Sem som</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Video & Mascot Replacement Configuration Grids */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* YouTube Video URL Manager */}
                  <div className="bg-white rounded-3xl p-5 border-2 border-rose-100 shadow-xs space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
                        <Video className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-display font-black text-sm text-gray-900">
                          Configuração do Vídeo do YouTube da Mascote
                        </h4>
                        <p className="text-xs text-gray-500">
                          Cole o link de qualquer vídeo ou Short do YouTube para rodar na mascote.
                        </p>
                      </div>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!adminYoutubeInput.trim()) return;
                        sounds.playSuccess();
                        onUpdateYoutubeUrl?.(adminYoutubeInput.trim());
                        setMascotVideoSaved(true);
                        setTimeout(() => setMascotVideoSaved(false), 3000);
                      }}
                      className="space-y-3"
                    >
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Link Completo do YouTube:
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={adminYoutubeInput}
                            onChange={(e) => setAdminYoutubeInput(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="w-full px-3.5 py-2.5 pr-20 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-mono text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              sounds.playPop();
                              setIsVideoTestingOpen((prev) => !prev);
                            }}
                            className="absolute right-2 top-2 px-2.5 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-[11px] rounded-xl cursor-pointer"
                          >
                            Testar
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playPop();
                            const defaultUrl = 'https://www.youtube.com/watch?v=jfKfPfyJRdk';
                            setAdminYoutubeInput(defaultUrl);
                            onUpdateYoutubeUrl?.(defaultUrl);
                          }}
                          className="text-xs text-gray-500 hover:text-gray-700 underline font-medium cursor-pointer"
                        >
                          Restaurar Vídeo Padrão
                        </button>

                        <button
                          type="submit"
                          className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{mascotVideoSaved ? 'Salvo no Site! ✨' : 'Salvar Vídeo no Site'}</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Mascot Official Replacement Switcher */}
                  <div className="bg-white rounded-3xl p-5 border-2 border-purple-100 shadow-xs space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-display font-black text-sm text-gray-900">
                          Substituição Oficial do Mascote
                        </h4>
                        <p className="text-xs text-gray-500">
                          Escolha se o site usará a Lumininha clássica ou um dos seus Símbolos Animados.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-purple-50/70 border border-purple-100">
                        <div>
                          <span className="font-bold text-xs text-purple-950 block">
                            Substituir Lumininha pelo Símbolo do João?
                          </span>
                          <span className="text-[11px] text-purple-700">
                            {symbolConfig?.replaceLumininhaWithSymbol
                              ? 'Ativo: Seu símbolo está no topo como mascote!'
                              : 'Inativo: A Lumininha original está sendo exibida.'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playPop();
                            if (symbolConfig && onUpdateSymbolConfig) {
                              onUpdateSymbolConfig({
                                ...symbolConfig,
                                replaceLumininhaWithSymbol: !symbolConfig.replaceLumininhaWithSymbol,
                              });
                            }
                          }}
                          className={`px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer ${
                            symbolConfig?.replaceLumininhaWithSymbol
                              ? 'bg-purple-600 text-white'
                              : 'bg-white text-gray-700 border border-gray-300'
                          }`}
                        >
                          {symbolConfig?.replaceLumininhaWithSymbol ? 'Sim (Ativo)' : 'Não (Lumininha)'}
                        </button>
                      </div>

                      {symbolConfig?.replaceLumininhaWithSymbol && (
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1.5">
                            Selecione qual Símbolo/Pixel será a Mascote:
                          </label>
                          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                            {customSymbols.map((sym) => {
                              const isSelected = symbolConfig.selectedMascotSymbolId === sym.id;
                              return (
                                <div
                                  key={sym.id}
                                  onClick={() => {
                                    sounds.playSparkle();
                                    if (onUpdateSymbolConfig) {
                                      onUpdateSymbolConfig({
                                        ...symbolConfig,
                                        selectedMascotSymbolId: sym.id,
                                      });
                                    }
                                  }}
                                  className={`p-2.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-2 ${
                                    isSelected
                                      ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-300'
                                      : 'border-gray-200 hover:border-purple-300 bg-white'
                                  }`}
                                >
                                  <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-lg overflow-hidden flex-shrink-0">
                                    {sym.category === 'pixel' ? (
                                      <AnimatedPixelSprite
                                        frames={sym.pixelFrames}
                                        matrix={sym.pixelMatrix}
                                        fps={sym.pixelFps || 4}
                                        size="sm"
                                      />
                                    ) : (
                                      <span style={{ color: sym.color }}>{sym.charOrIcon}</span>
                                    )}
                                  </div>
                                  <div className="overflow-hidden">
                                    <span className="font-bold text-xs text-gray-900 block truncate">
                                      {sym.name}
                                    </span>
                                    <span className="text-[10px] text-gray-500 uppercase">
                                      {sym.category === 'pixel' ? 'Pixel Art' : sym.animationEffect}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Content for TAB 11: Símbolos & Animações do João Lucas (Estúdio Exclusivo no Painel) */}
      {activeSubTab === 'symbols_studio' && isMaxAdmin && symbolConfig && onUpdateSymbolConfig && onUpdateSymbols && (
        <div className="pt-2">
          <JoaoLucasSymbolStudio
            currentUser={currentUser}
            config={symbolConfig}
            symbols={customSymbols}
            onUpdateConfig={onUpdateSymbolConfig}
            onUpdateSymbols={onUpdateSymbols}
          />
        </div>
      )}

      {/* Content for TAB: Servidores HL Vendas & Hub Inter-Servidores */}
      {activeSubTab === 'servers_network' && (
        <div className="pt-2">
          <ServerNetworkPanel
            servers={servers}
            recentPackets={recentPackets}
            currentUser={currentUser}
            onDispatchPacket={onDispatchServerPacket}
            onForceProfileSync={onForceProfileSync}
          />
        </div>
      )}

      {/* Profile Report Modal */}
      <ProfileReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        user={selectedReportUser}
        currentUser={currentUser}
        orders={orders}
        onUpdateUser={(updated) => {
          if (onUpdateUserProfile) {
            onUpdateUserProfile(updated);
          } else {
            const newUsers = users.map((u) => (u.id === updated.id ? updated : u));
            onUpdateUsers(newUsers);
          }
          setSelectedReportUser(updated);
        }}
        onOpenAvatarModal={(u) => handleOpenAvatarModal(u)}
        onDeleteUser={(userId) => {
          if (onDeleteUser) {
            onDeleteUser(userId);
          } else {
            onUpdateUsers(users.filter((u) => u.id !== userId));
          }
        }}
      />

      {/* Edit User Profile & Password Modal */}
      <EditUserProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        user={selectedUserForEdit}
        onSaveUser={handleSaveEditedUser}
        isMaxAdminViewer={isMaxAdmin}
      />

      {/* Avatar Edit Modal for Team Members */}
      <AvatarEditModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        user={selectedUserForAvatar}
        onSaveAvatar={handleSaveUserAvatar}
      />
    </div>
  );
};
