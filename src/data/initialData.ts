import { Product, UserProfile, StatusStory, Coupon, StoreConfig, SchoolReview, SchoolEvent } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-ss-1',
    name: 'Squishy Sorvete 🤩 Antiestresse Textura Crocante',
    description: 'O que você precisa saber sobre este produto Quantidade de squishies: 1. Textura crocante e macia sensacional para aliviar a tensão nos estudos.',
    price: 15.00,
    originalPrice: 20.00,
    category: 'squishs',
    imageUrl: 'https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=600&auto=format&fit=crop&q=80',
    stock: 12,
    tags: ['squishs', 'Antiestresse', 'Top Gilvan'],
    rating: 5.0,
    reviewCount: 48,
    featured: true,
    isNew: true
  },
  {
    id: 'prod-bor-1',
    name: '🎒 Borracha Colorida Com Capa 2 Unidades',
    description: 'boracha para se divertir e apagar sem borrar a folha.',
    price: 1.50,
    originalPrice: 3.00,
    category: 'borachas',
    imageUrl: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80',
    stock: 40,
    tags: ['borachas', 'Escolar', 'Baratinho'],
    rating: 4.9,
    reviewCount: 33,
    featured: true,
    isNew: false
  },
  {
    id: 'prod-can-1',
    name: 'Kit 12 Cores Caneta 2 em 1 Brush Lettering e 🖊️ Ponta Fina Dual Pen Canetinha Colorir',
    description: 'Kit completo com 12 cores vibrantes para lettering, títulos de matérias e anotações lindas no C.E.P.M.G Gilvan Sampaio.',
    price: 6.00,
    originalPrice: 10.00,
    category: 'canetas marcadoras',
    imageUrl: 'https://images.unsplash.com/photo-1585336261026-418071839977?w=600&auto=format&fit=crop&q=80',
    stock: 25,
    tags: ['canetas marcadoras', '12 Cores', 'Lettering'],
    rating: 5.0,
    reviewCount: 62,
    featured: true,
    isNew: true
  },
  {
    id: 'prod-boo-1',
    name: '🎁 Borracha Boo! Escolar Divertida Brilha No Escuro Tris 2 Unidades',
    description: 'Borracha fantasma super fofa que brilha no escuro! O maior sucesso da escola.',
    price: 23.33,
    originalPrice: 28.00,
    category: 'borachas',
    imageUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&auto=format&fit=crop&q=80',
    stock: 8,
    tags: ['borachas', 'Brilha no Escuro', 'Tris'],
    rating: 4.8,
    reviewCount: 19,
    featured: true,
    isNew: true
  },
  {
    id: 'prod-sq-1',
    name: 'Squishy Mochi Gatinho Fofo Kawaii',
    description: 'Squishy antiestresse ultra macio em formato de gatinho dorminhoco. Perfeito para relaxar nos intervalos e decorar seu estojo!',
    price: 12.00,
    originalPrice: 16.00,
    category: 'squishs',
    imageUrl: 'https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=600&auto=format&fit=crop&q=80',
    stock: 15,
    tags: ['Mais Vendido', 'Kawaii', 'Antiestresse', 'Gatinho'],
    rating: 4.9,
    reviewCount: 38,
    featured: true,
    isNew: true
  },
  {
    id: 'prod-sq-2',
    name: 'Squishy Pãozinho Doce Macaron Rosa',
    description: 'Squishy de textura lentinha (slow rising) com cheirinho suave e visual de sobremesa fofa. Muito gostoso de apertar!',
    price: 15.00,
    originalPrice: 20.00,
    category: 'squishs',
    imageUrl: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&auto=format&fit=crop&q=80',
    stock: 8,
    tags: ['squishs', 'Slow Rising', 'Rosa', 'Docinho'],
    rating: 4.8,
    reviewCount: 24,
    featured: true
  },
  {
    id: 'prod-sq-3',
    name: 'Mini Squishy Panda Coração',
    description: 'Miniatura de pandinha com coração vermelho. Cabe na palma da mão ou preso na ponta do lápis!',
    price: 9.50,
    category: 'squishs',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    stock: 20,
    tags: ['squishs', 'Mini', 'Panda', 'Baratinho'],
    rating: 4.7,
    reviewCount: 19
  },
  {
    id: 'prod-lap-1',
    name: 'Kit 4 Lápis Tons Pastéis com Borracha Fofa',
    description: 'Conjunto com 4 lápis grafite HB com estampas delicadas de doces e borrachas removíveis no topo em formato de cupcake.',
    price: 14.00,
    originalPrice: 18.00,
    category: 'canetas marcadoras',
    imageUrl: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80',
    stock: 25,
    tags: ['canetas marcadoras', 'Tons Pastéis', 'Escolar'],
    rating: 5.0,
    reviewCount: 42,
    featured: true
  },
  {
    id: 'prod-lap-2',
    name: 'Caneta Gel Gliterizada Rosa Choque & Roxa',
    description: 'Escrita suave 0.5mm com tinta especial com brilho e secagem rápida. Deixa os cadernos do Gilvan Sampaio impecáveis!',
    price: 7.50,
    category: 'canetas marcadoras',
    imageUrl: 'https://images.unsplash.com/photo-1585336261026-418071839977?w=600&auto=format&fit=crop&q=80',
    stock: 30,
    tags: ['canetas marcadoras', 'Brilho', 'Gel', 'Caneta Fofa'],
    rating: 4.9,
    reviewCount: 31,
    isNew: true
  },
  {
    id: 'prod-lap-3',
    name: 'Marca Texto Fofo Picolé Tons Pastéis',
    description: 'Marca-texto em formato de picolé com ponta chanfrada, cores suaves que não marcam o verso da folha.',
    price: 8.50,
    originalPrice: 12.00,
    category: 'marca textos',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    stock: 12,
    tags: ['marca textos', 'Picolé', 'Pastel'],
    rating: 4.8,
    reviewCount: 18
  },
  {
    id: 'prod-pap-1',
    name: 'Mini Caderno Decorado Kawaii com Elástico',
    description: 'Caderninho de anotações com capa dura decorada e folhas pautadas. Ideal para levar na mochila.',
    price: 11.00,
    category: 'cadernos',
    imageUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&auto=format&fit=crop&q=80',
    stock: 18,
    tags: ['cadernos', 'Capa Dura', 'Resumos', 'Estudos'],
    rating: 4.9,
    reviewCount: 29,
    featured: true
  },
  {
    id: 'prod-pap-2',
    name: 'Estojo Pelúcia Fofinho Espaçoso',
    description: 'Estojo super macio de pelúcia com zíper reforçado, cabe todas as canetas, lápis e borrachas.',
    price: 16.50,
    originalPrice: 22.00,
    category: 'estojos',
    imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80',
    stock: 10,
    tags: ['Holográfico', 'Washi Tape', 'Brilho'],
    rating: 4.9,
    reviewCount: 15
  },
  {
    id: 'prod-men-1',
    name: 'Presilha de Cabelo Laço Cetim Coquette',
    description: 'Laço artesanal super delicado com presilha bico de pato reforçada. O acessório favorito das meninas na escola.',
    price: 10.00,
    category: 'meninas',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
    stock: 22,
    tags: ['Coquette', 'Laço', 'Acessórios'],
    rating: 5.0,
    reviewCount: 35,
    isNew: true
  },
  {
    id: 'prod-men-2',
    name: 'Chaveiro de Pelúcia Ursinho Moranguinho',
    description: 'Chaveiro com gancho dourado para prender na mochila ou no estojo escolar. Macio e fofíssimo!',
    price: 18.00,
    originalPrice: 24.00,
    category: 'meninas',
    imageUrl: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=600&auto=format&fit=crop&q=80',
    stock: 7,
    tags: ['Mochila', 'Pelúcia', 'Chaveiro'],
    rating: 5.0,
    reviewCount: 21,
    featured: true
  },
  {
    id: 'prod-kit-1',
    name: 'Super Combo Helena Vip: Squishy + Lápis + Laço',
    description: 'O combo mais desejado: 1 Squishy Mochi sortido + 2 Canetas Gel fofas + 1 Laço Coquette + Brinde surpresa!',
    price: 32.00,
    originalPrice: 42.00,
    category: 'kits',
    imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80',
    stock: 6,
    tags: ['Combo Especial', 'Melhor Custo-Benefício', 'Presente'],
    rating: 5.0,
    reviewCount: 54,
    featured: true,
    isNew: true
  }
];

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-joao-lucas',
    name: 'João Lucas (Adm Máximo)',
    email: 'joaolucasgp1234@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    role: 'superadmin',
    isMaxAdmin: true,
    followersCount: 0,
    likesReceived: 0,
    salesCount: 0,
    password: 'hlvendas2026',
    permissions: {
      canEditProducts: true,
      canViewOrders: true,
      canEditSchedule: true,
      canPostStatus: true,
      canManageCoupons: true,
      canSendGlobalMessages: true,
      canChatWithClients: true,
      canManageTeam: true
    },
    createdAt: '2025-01-10T10:00:00Z',
    deviceLastUsed: 'Desktop Chrome (Windows 11)',
    bio: '👑 Criador & Administrador Geral do HL Vendas. C.E.P.M.G Gilvan Sampaio.'
  },
  {
    id: 'user-helena',
    name: 'Helena (Co-Fundadora & Estrela)',
    email: 'helena.hlvendas@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'seller',
    isMaxAdmin: false,
    followersCount: 0,
    likesReceived: 0,
    salesCount: 0,
    password: '123',
    permissions: {
      canEditProducts: true,
      canViewOrders: true,
      canEditSchedule: false,
      canPostStatus: true,
      canManageCoupons: false,
      canSendGlobalMessages: false,
      canChatWithClients: true,
      canManageTeam: false
    },
    createdAt: '2025-01-12T14:30:00Z',
    deviceLastUsed: 'iPhone 14 (Safari iOS)',
    bio: '✨ Apaixonada por fofuras, squishies e papelaria. Te espero na porta da escola!'
  },
  {
    id: 'user-sofia',
    name: 'Sofia Vendedora',
    email: 'sofia.vendas@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    role: 'seller',
    isMaxAdmin: false,
    followersCount: 0,
    likesReceived: 0,
    salesCount: 0,
    password: '123',
    permissions: {
      canEditProducts: false,
      canViewOrders: true,
      canEditSchedule: false,
      canPostStatus: true,
      canManageCoupons: false,
      canSendGlobalMessages: false,
      canChatWithClients: true,
      canManageTeam: false
    },
    createdAt: '2025-02-01T09:00:00Z',
    deviceLastUsed: 'Samsung Galaxy A54 (Android 14)',
    bio: '🌸 Vendedora oficial da equipe HL Vendas no Gilvan Sampaio.'
  },
  {
    id: 'user-cliente-demo',
    name: 'Maria Clara (Estudante 8º B)',
    email: 'mariaclara.estudante@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
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
      canManageTeam: false
    },
    createdAt: '2025-02-15T16:00:00Z',
    deviceLastUsed: 'Motorola Moto G84 (Android 14)',
    bio: 'Colecionadora de squishies do Gilvan Sampaio!'
  }
];

export const INITIAL_STORIES: StatusStory[] = [
  {
    id: 'story-lumininha-auto-1',
    authorId: 'lumininha-ai',
    authorName: 'Lumininha AI ⚡',
    authorAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=LumininhaSparkle&backgroundColor=ffdf70',
    authorRole: 'Inteligência Oficial HL',
    mediaType: 'video_card',
    mediaUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80',
    caption: '✨ Status Lumininha: O Combo Helena Vip está com super desconto hoje! Garanta o seu antes do intervalo acabar!',
    productLinkedId: 'prod-kit-1',
    timestamp: 'Há 5 min',
    likes: 0,
    isLumininhaAuto: true,
    hasSound: true,
    audioTone: 'sparkle'
  },
  {
    id: 'story-lumininha-auto-2',
    authorId: 'lumininha-ai',
    authorName: 'Lumininha AI ⚡',
    authorAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=LumininhaSparkle&backgroundColor=ffdf70',
    authorRole: 'Inteligência Oficial HL',
    mediaType: 'video_card',
    mediaUrl: 'https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=800&auto=format&fit=crop&q=80',
    caption: '🐾 Status Lumininha: Novos Squishies Gatinho chegaram para as entregas de segunda e terça às 15:30 na porta do Gilvan Sampaio!',
    productLinkedId: 'prod-sq-1',
    timestamp: 'Há 25 min',
    likes: 0,
    isLumininhaAuto: true,
    hasSound: true,
    audioTone: 'happy'
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'cup-1',
    code: 'GILVAN10',
    discountType: 'percent',
    discountValue: 10,
    minOrderValue: 20,
    active: true,
    usageCount: 18,
    expiresAt: '2026-12-31'
  },
  {
    id: 'cup-2',
    code: 'HELENA5',
    discountType: 'fixed',
    discountValue: 5,
    minOrderValue: 25,
    active: true,
    usageCount: 29
  },
  {
    id: 'cup-3',
    code: 'VIPJOAO',
    discountType: 'percent',
    discountValue: 20,
    targetEmail: 'mariaclara.estudante@gmail.com',
    active: true,
    usageCount: 1
  }
];

export const INITIAL_CONFIG: StoreConfig = {
  storeName: 'HL Vendas - Vendas da Helena',
  pickupLocation: 'Na porta do C.E.P.M.G Gilvan Sampaio',
  pickupSchedule: 'Toda Segunda e Terça-feira às 15:30',
  sellerNotificationEmail: 'joaolucasgp1234@gmail.com',
  globalAnnouncement: '',
  globalAnnouncementActive: false,
  globalAnnouncementSenderName: 'João Lucas (Adm Máximo)',
  globalAnnouncementSenderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  globalAnnouncementSenderRole: 'Adm Máximo',
  globalAnnouncementSenderVerified: true,
  allowClientOrders: true,
  emergencyDiscountActive: false,
  lightShowMode: 'none',
  customNoticePillText: 'nada',
  baseLikes: 0,
  baseSalesDelivered: 0,
  baseFollowers: 0,
  siteYoutubeBgActive: false,
  siteYoutubeBgUrl: '',
  siteYoutubeBgOpacity: 45,
  siteYoutubeBgMuted: true,
  siteYoutubeBgBlur: 0
};

export const INITIAL_STORE_CONFIG = INITIAL_CONFIG;

export const INITIAL_SCHOOL_REVIEWS: SchoolReview[] = [
  {
    id: 'rev-1',
    authorId: 'user-cliente-demo',
    authorName: 'Maria Clara',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'Os squishies são super macios e a entrega na porta do Gilvan Sampaio é sempre no horário certo! Nota 10!',
    date: 'Hoje',
    studentGrade: '8º Ano B',
    likes: 3
  },
  {
    id: 'rev-2',
    authorId: 'rev-gabriel',
    authorName: 'Gabriel Santos',
    authorAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'Comprei o kit de canetas para as aulas e a qualidade é perfeita. Todo mundo na sala elogiou!',
    date: 'Ontem',
    studentGrade: '9º Ano A',
    likes: 5
  },
  {
    id: 'rev-3',
    authorId: 'rev-ana',
    authorName: 'Ana Júlia',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'A Helena e o João Lucas são muito atenciosos com os alunos. O melhor projeto do colégio!',
    date: 'Há 2 dias',
    studentGrade: '7º Ano C',
    likes: 2
  }
];

export const INITIAL_REVIEWS = INITIAL_SCHOOL_REVIEWS;

export const INITIAL_SCHOOL_EVENTS: SchoolEvent[] = [
  {
    id: 'ev-roleta-gilvan',
    title: 'Roleta da Sorte do Gilvan',
    subtitle: 'Gire e ganhe cupons e brindes na entrega',
    description: 'Participe do giro da sorte diário! Ganhe até 15% OFF ou brindes fofos entregues em mãos no portão da escola.',
    badge: 'Atração Contínua',
    icon: '🎰',
    type: 'roleta',
    createdAt: '2025-02-01',
    createdBy: 'João Lucas (Adm Máximo)',
    canBeRemovedByMaxAdminOnly: true,
    active: true
  },
  {
    id: 'ev-cupons-gilvan',
    title: 'Cupons & Códigos de Desconto',
    subtitle: 'Economize nos seus materiais e squishies',
    description: 'Códigos exclusivos liberados pela Helena e pelo João Lucas para toda a comunidade do C.E.P.M.G Gilvan Sampaio.',
    badge: 'Descontos Oficiais',
    icon: '🎟️',
    type: 'cupons',
    createdAt: '2025-02-01',
    createdBy: 'João Lucas (Adm Máximo)',
    canBeRemovedByMaxAdminOnly: true,
    active: true
  },
  {
    id: 'ev-sorteio-portao',
    title: 'Entrega Especial no Portão das 15:30',
    subtitle: 'Toda Segunda e Terça na saída da escola',
    description: 'Encontro com as vendedoras no portão principal do Gilvan Sampaio com brindes surpresa para as 5 primeiras encomendas.',
    badge: 'Presencial',
    icon: '🏫',
    type: 'custom',
    createdAt: '2025-02-10',
    createdBy: 'João Lucas (Adm Máximo)',
    canBeRemovedByMaxAdminOnly: true,
    active: true
  }
];

export const INITIAL_CUSTOM_SYMBOLS = [
  {
    id: 'sym-raio-joao',
    name: 'Raio de Energia do João Lucas',
    charOrIcon: '⚡',
    category: 'emoji' as const,
    color: '#EAB308',
    glowColor: 'rgba(234, 179, 8, 0.7)',
    animationEffect: 'pulse' as const,
    speed: 'fast' as const,
    scale: 1.4,
    countOnScreen: 8,
    isActiveOnSite: false,
    createdAt: '2025-02-15'
  },
  {
    id: 'sym-coroa-adm',
    name: 'Coroa Suprema do Adm Máximo',
    charOrIcon: '👑',
    category: 'emoji' as const,
    color: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.7)',
    animationEffect: 'float' as const,
    speed: 'normal' as const,
    scale: 1.3,
    countOnScreen: 6,
    isActiveOnSite: false,
    createdAt: '2025-02-15'
  },
  {
    id: 'sym-flor-helena',
    name: 'Flor Sakura da Helena',
    charOrIcon: '🌸',
    category: 'emoji' as const,
    color: '#EC4899',
    glowColor: 'rgba(236, 72, 153, 0.6)',
    animationEffect: 'spin' as const,
    speed: 'slow' as const,
    scale: 1.2,
    countOnScreen: 8,
    isActiveOnSite: false,
    createdAt: '2025-02-15'
  },
  {
    id: 'sym-squishy-pata',
    name: 'Patas de Squishy Fofo',
    charOrIcon: '🐾',
    category: 'emoji' as const,
    color: '#8B5CF6',
    glowColor: 'rgba(139, 92, 246, 0.6)',
    animationEffect: 'bounce' as const,
    speed: 'normal' as const,
    scale: 1.1,
    countOnScreen: 6,
    isActiveOnSite: false,
    createdAt: '2025-02-15'
  },
  {
    id: 'sym-diamante-gilvan',
    name: 'Diamante Escolar Gilvan',
    charOrIcon: '💎',
    category: 'emoji' as const,
    color: '#06B6D4',
    glowColor: 'rgba(6, 182, 212, 0.7)',
    animationEffect: 'wave' as const,
    speed: 'fast' as const,
    scale: 1.3,
    countOnScreen: 7,
    isActiveOnSite: false,
    createdAt: '2025-02-16'
  }
];

export const INITIAL_DEVICES = [
  {
    deviceType: 'Motorola Moto G (Celular)',
    os: 'Android 14',
    browser: 'Chrome Mobile',
    screenSize: '412x915',
    ipSimulated: '189.40.12.84',
    loggedUserEmail: 'helena.vendas@gmail.com',
    timestamp: new Date().toISOString()
  },
  {
    deviceType: 'Samsung Galaxy A54 (Celular)',
    os: 'Android 14',
    browser: 'Samsung Internet',
    screenSize: '390x844',
    ipSimulated: '177.135.210.19',
    loggedUserEmail: 'mariaclara.estudante@gmail.com',
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    deviceType: 'Notebook Dell Inspiron (PC)',
    os: 'Windows 11',
    browser: 'Chrome 122',
    screenSize: '1920x1080',
    ipSimulated: '177.92.44.110',
    loggedUserEmail: 'joaolucasgp1234@gmail.com',
    timestamp: new Date(Date.now() - 7200000).toISOString()
  }
];
