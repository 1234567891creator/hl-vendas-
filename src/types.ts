export type ProductCategory = 
  | 'squishies' 
  | 'lapis' 
  | 'papelaria' 
  | 'meninas' 
  | 'kits' 
  | 'squishs' 
  | 'borachas' 
  | 'canetas marcadoras' 
  | 'cadernos' 
  | 'estojos' 
  | 'marca textos' 
  | string;

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: ProductCategory;
  imageUrl: string;
  additionalImages?: string[];
  stock: number;
  tags: string[];
  rating: number;
  reviewCount: number;
  featured?: boolean;
  isNew?: boolean;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  imageUrl: string;
}

export interface DeviceInfo {
  deviceType: string;
  browser: string;
  os: string;
  screenSize: string;
  ipSimulated: string;
  userAgent: string;
  timestamp: string;
  loggedUserEmail?: string;
}

export interface Order {
  id: string;
  createdAt: string;
  clientName: string;
  clientContact: string;
  studentGrade: string;
  pickupDay: string;
  items: OrderItem[];
  totalAmount: number;
  discountApplied: number;
  couponCode?: string;
  notes?: string;
  status: 'pendente' | 'confirmado' | 'pronto' | 'entregue' | 'cancelado';
  deviceInfo: DeviceInfo;
  sellerNotifiedEmail: string;
}

export interface UserPermissions {
  canEditProducts: boolean;
  canViewOrders: boolean;
  canEditSchedule: boolean;
  canPostStatus: boolean;
  canManageCoupons: boolean;
  canSendGlobalMessages: boolean;
  canChatWithClients: boolean;
  canManageTeam: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'superadmin' | 'seller' | 'client';
  isMaxAdmin: boolean;
  followersCount: number;
  likesReceived: number;
  salesCount: number;
  password?: string;
  permissions: UserPermissions;
  createdAt: string;
  deviceLastUsed?: string;
  bio?: string;
  schoolClass?: string;
}

export interface StatusStory {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  mediaType: 'image' | 'video_card';
  mediaUrl: string;
  caption: string;
  productLinkedId?: string;
  timestamp: string;
  likes: number;
  isLumininhaAuto?: boolean;
  hasSound?: boolean;
  audioTone?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minOrderValue?: number;
  targetEmail?: string; // Empty means for everyone
  expiresAt?: string;
  active: boolean;
  usageCount: number;
}

export interface StoreConfig {
  storeName: string;
  pickupLocation: string;
  pickupSchedule: string;
  sellerNotificationEmail: string;
  globalAnnouncement: string;
  globalAnnouncementActive: boolean;
  globalAnnouncementSenderName?: string;
  globalAnnouncementSenderAvatar?: string;
  globalAnnouncementSenderRole?: string;
  globalAnnouncementSenderVerified?: boolean;
  globalAnnouncementCreatedAt?: number;
  globalAnnouncementDurationSeconds?: number;
  allowClientOrders: boolean;
  emergencyDiscountActive: boolean;
  lightShowMode?: 'none' | 'confetti' | 'rainbow' | 'flash_sale' | 'neon_disco';
  customNoticePillText?: string;
  baseLikes?: number;
  baseSalesDelivered?: number;
  baseFollowers?: number;
  lumininhaYouTubeVideoUrl?: string;
  siteYoutubeBgActive?: boolean;
  siteYoutubeBgUrl?: string;
  siteYoutubeBgOpacity?: number; // 10 a 90%
  siteYoutubeBgMuted?: boolean;
  siteYoutubeBgBlur?: number; // 0 a 10px
}

export type WeatherType = 'calor' | 'frio' | 'bom' | 'chuva';

export interface LumininhaState {
  temperature: number; // in Celsius
  weatherCondition: WeatherType;
  moodName: string;
  avatarAnimation: string;
  expression: string;
  speechBubble: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'lumininha' | 'admin' | 'seller';
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
  productSuggestionId?: string;
  emotion?: string;
}

export interface SchoolReview {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
  studentGrade?: string;
  likes: number;
}

export interface CommunityChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderRole: string;
  text: string;
  timestamp: string;
  channel: string; // 'geral' or target userId
  sticker?: string;
}

export interface SchoolEvent {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  icon: string;
  type: 'roleta' | 'cupons' | 'sorteio' | 'promocao' | 'custom';
  createdAt: string;
  createdBy: string;
  canBeRemovedByMaxAdminOnly: boolean;
  active: boolean; // Dura permanentemente até o administrador que colocou parar
  stoppedAt?: string;
  stoppedBy?: string;
}

export type SymbolAnimationEffect = 
  | 'float' 
  | 'bounce' 
  | 'spin' 
  | 'pulse' 
  | 'wave' 
  | 'orbit' 
  | 'shake' 
  | 'zigzag' 
  | 'sway' 
  | 'heartbeat';

export interface CustomAnimationSettings {
  movementType: SymbolAnimationEffect;
  deltaX: number; // Deslocamento horizontal (-100 a +100 px)
  deltaY: number; // Deslocamento vertical (-100 a +100 px)
  rotationAngle: number; // Rotação máxima (0° a 360°)
  scaleMin: number; // Escala mínima (0.5 a 1.0)
  scaleMax: number; // Escala máxima (1.0 a 2.0)
  durationSeconds: number; // Duração do ciclo (0.3s a 6s)
  glowIntensity: number; // Intensidade do brilho neon (0 a 40px)
  easing: 'easeInOut' | 'linear' | 'spring';
  trailEffect?: 'none' | 'sparkles' | 'stars' | 'hearts' | 'neon';
}

export interface CustomSymbol {
  id: string;
  name: string;
  charOrIcon: string; // Emoji, texto ou 'pixel'
  category: 'emoji' | 'pixel' | 'custom_draw';
  pixelMatrix?: string[]; // Array com as cores da matriz 8x8 (quadro único ou inicial)
  pixelFrames?: string[][]; // Array com múltiplos quadros 8x8 para animação de pixel art
  pixelFps?: number; // Velocidade da animação em quadros por segundo (ex: 2, 4, 6, 8 fps)
  color: string;
  glowColor?: string;
  animationEffect: SymbolAnimationEffect;
  customAnimation?: CustomAnimationSettings;
  speed: 'slow' | 'normal' | 'fast' | 'turbo';
  scale: number;
  countOnScreen: number;
  isActiveOnSite: boolean;
  effectsDisabled?: boolean; // Permite desativar os efeitos específicos deste símbolo
  createdAt: string;
  isLumininhaReplacement?: boolean; // Se substitui a Lumininha como mascote animado do site
  sitePlacement?: 'mascot_corner' | 'top_banner' | 'floating_site' | 'navbar_badge';
}

export interface SiteSymbolAnimationConfig {
  enabled: boolean;
  effectsEnabled?: boolean; // Permite desativar/ativar todos os efeitos visuais nos símbolos
  activeEffect: SymbolAnimationEffect;
  customAnimation?: CustomAnimationSettings;
  speed: 'slow' | 'normal' | 'fast' | 'turbo';
  density: number;
  customSymbols: CustomSymbol[];
  replaceLumininhaWithSymbol?: boolean; // Se o símbolo substitui a Lumininha
  selectedMascotSymbolId?: string; // ID do símbolo que vira a nova mascote do site
}

export interface LiveRadioBroadcast {
  isPlaying: boolean;
  youtubeId: string;
  title: string;
  startedAt: number;
  updatedAt: number;
  playedBy: string;
  listenersCount: number;
}

export interface GlobalAnnouncement {
  id: string;
  senderId: string;
  senderName: string;
  senderPhoto: string;
  senderRole: string;
  badge?: string;
  title?: string;
  message: string;
  createdAt: number;
  durationMs: number; // Duração breve em milissegundos (ex: 7000ms = 7 segundos)
  priority?: 'normal' | 'urgent' | 'golden';
}

export interface SymbolLaunchEvent {
  id: string;
  symbol: CustomSymbol;
  senderName: string;
  senderAvatar: string;
  senderRole?: string;
  timestamp: number;
  durationSeconds: number; // Exatamente 2 segundos solicitados pelo usuário
}

export type ServerNodeType = 
  | 'adm_master' 
  | 'communication_hub' 
  | 'node_school' 
  | 'node_sellers' 
  | 'node_students' 
  | 'node_backup';

export interface ServerNode {
  id: string;
  name: string;
  type: ServerNodeType;
  ipAddress: string;
  status: 'online' | 'busy' | 'syncing' | 'standby';
  pingMs: number;
  lastSeen: number;
  packetsSent: number;
  packetsReceived: number;
  roleDescription: string;
  isMasterEmitter?: boolean;
  isCommunicationRelay?: boolean;
}

export interface InterServerPacket {
  id: string;
  timestamp: number;
  originServerId: string;
  originServerName: string;
  relayServerId: string;
  relayServerName: string;
  targetServerIds: string[];
  targetServerNames: string[];
  action: 'profile_mutation' | 'global_announcement' | 'catalog_sync' | 'admin_directive' | 'system_heartbeat';
  summary: string;
  payloadData?: any;
  status: 'relayed_and_delivered' | 'relaying' | 'queued';
}
