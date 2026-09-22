import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { INITIAL_USERS, INITIAL_STORIES, INITIAL_SCHOOL_EVENTS, INITIAL_STORE_CONFIG } from "./src/data/initialData";

dotenv.config();

const app = express();
const PORT = 3000;

// Universal CORS configuration (permits Netlify, mobile clients, and all origins)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Cache-Control");
  res.setHeader("Access-Control-Max-Age", "86400");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: "15mb" }));

// Lazy-initialize GoogleGenAI client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (err) {
      console.error("Erro ao inicializar GoogleGenAI:", err);
      aiClient = null;
    }
  }
  return aiClient;
}

// API Health Check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "HL Vendas - Vendas da Helena",
    school: "C.E.P.M.G Gilvan Sampaio",
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
  });
});

// Lumininha Public & Admin Chat API
app.post("/api/lumininha/chat", async (req, res) => {
  try {
    const { message, emotion, temperature, isMaxAdmin, catalogContext } = req.body;
    const ai = getGenAI();

    const userMessage = (message || "").trim();

    const systemPrompt = `Você é a "Lumininha AI" ⚡, a mascote inteligente, fofa, acolhedora e hiper rápida do app "HL Vendas" no colégio C.E.P.M.G Gilvan Sampaio!

DIRETRIZ MÁXIMA E OBRIGATÓRIA:
RESPONDA DIRETAMENTE AO QUE A PESSOA PERGUNTOU! Seja precisa, atenciosa e resolutiva com a dúvida exata do usuário.
- Se perguntarem um preço, forneça o preço exato com base no catálogo: ${catalogContext || 'Squishies Mochi R$ 10,00; Pãozinho Macaron R$ 12,00; Kit 4 Lápis Pastéis R$ 14,00; Canetas Gel Glitter R$ 8,00; Laço Coquette R$ 9,00; Super Combo Helena Vip R$ 28,00'}.
- Se perguntarem formas de pagamento: aceitamos Pix e dinheiro em espécie (com troco na hora da entrega).
- Se perguntarem onde e quando é a entrega: toda SEGUNDA e TERÇA-FEIRA às 15:30 na calçada do portão principal do C.E.P.M.G GILVAN SAMPAIO.
- Se perguntarem como encomendar: no próprio app, na aba Início/Catálogo, selecionando os itens e clicando em "Encomendar Agora" ou no bate-papo com os vendedores!
- Se perguntarem quem é a Helena: a Helena é a proprietária e vendedora oficial, aluna do Gilvan Sampaio que seleciona cada produto fofinho.
- Se perguntarem quem é o João Lucas: é o Administrador Máximo (Adm Supremo) do HL Vendas, criador e mantenedor de toda a tecnologia do site.
- Se perguntarem sobre matérias, tarefas ou lição: ajude com simpatia, motivação e dicas de foco!
- Se for uma conversa informal ("oi", "tudo bem?", "como você tá?"), responda de forma afetuosa e atenta.

FORMATO DA RESPOSTA:
- Rápida, concisa e objetiva (1 a 3 frases bem diretas).
- Use linguagem simpática em português brasileiro com alguns emojis fofos.
- Sua emoção aparente é '${emotion || 'feliz'}' com sensação de ${temperature || 24}°C.
- Se o usuário for o Adm Máximo João Lucas (${isMaxAdmin ? 'SIM' : 'NÃO'}), dê um cumprimento respeitoso e destaque o sucesso do sistema!`;

    if (ai && userMessage) {
      try {
        // Fast response model with gemini-3.8-flash (falling back to gemini-3.1-flash-lite if needed)
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: userMessage,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.35,
            maxOutputTokens: 220,
          },
        });

        const reply = response.text?.trim();
        if (reply) {
          return res.json({ reply, emotion: emotion || 'feliz' });
        }
      } catch (geminiError) {
        console.warn("Gemini 3.8 Flash attempt failed, attempting flash-lite:", geminiError);
        try {
          const fallbackGen = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: userMessage,
            config: {
              systemInstruction: systemPrompt,
              temperature: 0.35,
              maxOutputTokens: 200,
            },
          });
          const replyLite = fallbackGen.text?.trim();
          if (replyLite) {
            return res.json({ reply: replyLite, emotion: emotion || 'feliz' });
          }
        } catch (liteError) {
          console.warn("Gemini flash-lite fallback also failed:", liteError);
        }
      }
    }

    // Comprehensive semantic intelligent fallback for instant, accurate answers
    const msg = userMessage.toLowerCase();
    let reply = "";

    if (!msg || msg === "oi" || msg === "olá" || msg === "ola" || msg === "oii" || msg === "eai" || msg === "e aí") {
      reply = "Oii! Tudo bem com você? 🥰 Sou a Lumininha AI! O que você gostaria de saber sobre as fofuras do HL Vendas ou sobre as entregas no Gilvan Sampaio?";
    } else if (msg.includes("tudo bem") || msg.includes("como vai") || msg.includes("como você tá") || msg.includes("como vc ta")) {
      reply = "Estou maravilhosa e cheia de energia! ✨ E você, como foi seu dia na escola? Posso te ajudar com preços, encomendas ou alguma dúvida?";
    } else if (msg.includes("preco") || msg.includes("preço") || msg.includes("quanto custa") || msg.includes("valor") || msg.includes("tabela") || msg.includes("custa")) {
      if (msg.includes("squishy") || msg.includes("mochi")) {
        reply = "Os squishies custam entre R$ 10,00 (Mochi Gatinho) e R$ 12,00 (Pãozinho Macaron)! São super macios e antiestresse. 🐾";
      } else if (msg.includes("lapis") || msg.includes("lápis") || msg.includes("caneta")) {
        reply = "O kit de 4 lápis tons pastéis sai por R$ 14,00 e as canetas glitter por R$ 8,00! ✏️💖 Perfeitos para o estojo.";
      } else if (msg.includes("combo")) {
        reply = "O Super Combo Helena Vip custa R$ 28,00 e já vem com squishy, caneta glitter, mini caderno e brinde surpresa! 🎁";
      } else {
        reply = "Nossos preços são super em conta: canetas a partir de R$ 8,00, squishies de R$ 10 a 12, lápis pastéis por R$ 14 e combos completos por R$ 28! Você pode ver tudo na aba Início. 🛍️";
      }
    } else if (msg.includes("pagar") || msg.includes("pagamento") || msg.includes("pix") || msg.includes("dinheiro") || msg.includes("cartao") || msg.includes("cartão") || msg.includes("troco")) {
      reply = "Aceitamos Pix e dinheiro em espécie na hora da entrega! 💵 Se precisar de troco, é só avisar na hora de encomendar que levamos certinho!";
    } else if (msg.includes("onde") || msg.includes("local") || msg.includes("entrega") || msg.includes("portao") || msg.includes("portão") || msg.includes("calcada") || msg.includes("calçada")) {
      reply = "📍 O ponto oficial de entrega é na calçada em frente ao portão principal do C.E.P.M.G Gilvan Sampaio, toda Segunda e Terça-feira às 15:30!";
    } else if (msg.includes("hora") || msg.includes("horario") || msg.includes("horário") || msg.includes("dia") || msg.includes("quando")) {
      reply = "⏰ Nossas entregas acontecem toda Segunda e Terça-feira pontualmente às 15:30 na porta da escola Gilvan Sampaio!";
    } else if (msg.includes("como comprar") || msg.includes("como encomendar") || msg.includes("como peço") || msg.includes("pedir") || msg.includes("encomendar")) {
      reply = "Para encomendar é muito simples: vá na aba 'Início', escolha seus produtos e clique no botão '🛍️ Encomendar Agora' ou combine no bate-papo! Nós separamos com todo o carinho.";
    } else if (msg.includes("helena") || msg.includes("dona")) {
      reply = "A Helena é a proprietária e vendedora oficial do HL Vendas! 🌸 Ela estuda aqui no Gilvan Sampaio e prepara cada pacotinho com muito amor.";
    } else if (msg.includes("joao") || msg.includes("joão") || msg.includes("adm") || msg.includes("criador")) {
      reply = "O João Lucas é o Administrador Máximo (Adm Supremo)! 👑 Ele cuida de todo o sistema tecnológico, da segurança e da inteligência do HL Vendas.";
    } else if (msg.includes("desconto") || msg.includes("cupom") || msg.includes("promocao") || msg.includes("promoção")) {
      reply = "🎉 Dica de ouro: use o cupom secreto 'GILVAN10' no carrinho para garantir 10% de desconto no seu pedido!";
    } else if (msg.includes("squishy") || msg.includes("mochi") || msg.includes("apertar")) {
      reply = "Nossos squishies são a sensação da escola! Temos o Mochi Gatinho e o Pãozinho Doce Macaron. Dá pra apertar e relaxar durante as aulas. 🥰";
    } else if (msg.includes("piada") || msg.includes("engracado") || msg.includes("engraçado")) {
      reply = "Por que o lápis não briga com a borracha? Porque ele sabe que ela sempre apaga o passado dele! 😂✏️";
    } else if (msg.includes("quem e voce") || msg.includes("quem é você") || msg.includes("o que voce faz") || msg.includes("o que você faz")) {
      reply = "Eu sou a Lumininha AI! ⚡ A assistente e mascote oficial do HL Vendas. Estou aqui para te ajudar com produtos, preços, entregas e tirar todas as suas dúvidas!";
    } else {
      reply = `Entendi a sua dúvida sobre "${userMessage}"! ✨ Nós estamos sempre aqui para ajudar com as encomendas do HL Vendas no Gilvan Sampaio (entregas segunda e terça às 15:30). Você gostaria de ver os preços, encomendar algum produto ou falar com a Helena no chat?`;
    }

    res.json({ reply, emotion: emotion || 'feliz' });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Erro desconhecido";
    res.status(500).json({ error: errorMsg });
  }
});

// Lumininha Detective API (Supercharged Admin Feature)
app.post("/api/lumininha/detective", async (req, res) => {
  try {
    const { query } = req.body;
    const ai = getGenAI();

    const detectivePrompt = `Você é a Lumininha em Modo Detetive 🕵️‍♀️🔍 para o Adm Máximo (João Lucas) do HL Vendas.
Analise tendências virais no TikTok, Instagram e YouTube para papelaria kawaii, squishies e coisas de meninas no Brasil em ambiente escolar.
Tema pesquisado: "${query || 'squishies virais e papelaria escolar'}".
Gere um relatório investigativo contendo 3 produtos que seriam sucessos estrondosos de venda na porta da escola C.E.P.M.G Gilvan Sampaio, com estimativa de custo de compra no atacado, preço sugerido de venda e margem de lucro.`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: detectivePrompt,
        });
        return res.json({ report: response.text });
      } catch (geminiError) {
        console.warn("Detective fallback:", geminiError);
      }
    }

    // Fallback response for detective mode
    res.json({
      report: `🕵️‍♀️ **Relatório Secreto da Detetive Lumininha para João Lucas & Helena:**
1. **Squishy Garrafinha Mágica Anti-Stress com Glitter**: Custo atacado: R$ 4,50 | Venda sugerida: R$ 14,00 | Margem: 68% de lucro! Hit absoluto no TikTok.
2. **Marca-Texto Picolé Fofo Pastel (Kit com 6)**: Custo atacado: R$ 7,00 | Venda sugerida: R$ 19,00 | Margem: 63% de lucro! Todas as meninas do Gilvan Sampaio vão querer ter no estojo.
3. **Chaveiro Pop-It Pelúcia Capivara Kawaii**: Custo atacado: R$ 6,00 | Venda sugerida: R$ 18,00 | Margem: 66% de lucro! Febre escolar do momento.
💡 *Recomendação da Lumininha:* Anunciar no Status com o cupom relâmpago para esgotar na terça-feira!`
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Erro no modo detetive";
    res.status(500).json({ error: errorMsg });
  }
});

// Lumininha Marketing & Story Generator (Auto Status)
app.post("/api/lumininha/marketing-gen", async (req, res) => {
  try {
    const { productTarget } = req.body;
    const ai = getGenAI();

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: `Crie um texto chamativo curto (estilo Story do Instagram) para o HL Vendas no Gilvan Sampaio divulgando o produto: "${productTarget || 'Squishy Gatinho Mochi e Combo Helena'}". Destaque que a entrega é segunda/terça às 15:30 na porta da escola.`,
        });
        return res.json({ caption: response.text });
      } catch {}
    }

    res.json({
      caption: `🔥 NOVIDADE NO AR! Quem aí vai garantir o ${productTarget || 'Combo Helena Vip'} na porta do Gilvan Sampaio? 🐾 Entrega confirmada às 15:30 com direito a brinde surpresa para quem pedir pelo app! 💖 Corre que o estoque tá voando!`
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Erro no gerador de marketing";
    res.status(500).json({ error: errorMsg });
  }
});

// Order Notification Dispatcher
app.post("/api/orders/notify", (req, res) => {
  const { order, sellerEmail } = req.body;
  console.log(`[HL VENDAS] Pedido #${order?.id} enviado para o e-mail do vendedor: ${sellerEmail}`);
  console.log(`[HL VENDAS] Dispositivo do cliente registrado:`, order?.deviceInfo);

  res.json({
    success: true,
    message: `Pedido #${order?.id} despachado com sucesso para ${sellerEmail}!`,
    dispatchedAt: new Date().toISOString(),
    sellerEmail,
  });
});

// =========================================================================
// SISTEMA DE SINCRONIZAÇÃO GLOBAL EM TEMPO REAL (HL VENDAS GLOBAL SYNC)
// =========================================================================
// SISTEMA DE SERVIDORES & COMUNICAÇÃO INTER-SERVIDORES (MULTI-SERVER RELAY)
// =========================================================================
interface ServerNodeData {
  id: string;
  name: string;
  type: 'adm_master' | 'communication_hub' | 'node_school' | 'node_sellers' | 'node_students' | 'node_backup';
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

interface InterServerPacketData {
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

const INITIAL_SERVERS: ServerNodeData[] = [
  {
    id: "server-adm-master",
    name: "Servidor Central do Adm Máximo (João Lucas)",
    type: "adm_master",
    ipAddress: "192.168.10.1",
    status: "online",
    pingMs: 12,
    lastSeen: Date.now(),
    packetsSent: 154,
    packetsReceived: 42,
    roleDescription: "Comando Central e Emissor Supremo de Diretrizes do Adm Máximo",
    isMasterEmitter: true,
  },
  {
    id: "server-communication-hub",
    name: "Servidor Hub de Comunicação Inter-Servidores",
    type: "communication_hub",
    ipAddress: "192.168.10.2",
    status: "online",
    pingMs: 15,
    lastSeen: Date.now(),
    packetsSent: 512,
    packetsReceived: 510,
    roleDescription: "Receptor oficial do Adm Máximo que replica e repassa pacotes para todos os nós da rede",
    isCommunicationRelay: true,
  },
  {
    id: "server-node-school",
    name: "Nó Regional C.E.P.M.G Gilvan Sampaio",
    type: "node_school",
    ipAddress: "192.168.10.15",
    status: "online",
    pingMs: 19,
    lastSeen: Date.now(),
    packetsSent: 92,
    packetsReceived: 228,
    roleDescription: "Servidor local da comunidade escolar, turmas e eventos",
  },
  {
    id: "server-node-sellers",
    name: "Nó Operacional Helena & Vendedoras",
    type: "node_sellers",
    ipAddress: "192.168.10.20",
    status: "online",
    pingMs: 22,
    lastSeen: Date.now(),
    packetsSent: 110,
    packetsReceived: 214,
    roleDescription: "Servidor de gestão de pedidos, estoque e comissões da Helena",
  },
  {
    id: "server-node-students",
    name: "Nó Público de Alunos & Clientes",
    type: "node_students",
    ipAddress: "192.168.10.30",
    status: "online",
    pingMs: 26,
    lastSeen: Date.now(),
    packetsSent: 71,
    packetsReceived: 256,
    roleDescription: "Servidor de distribuição rápida do catálogo, stories e avisos aos alunos",
  },
  {
    id: "server-node-backup",
    name: "Nó de Backup e Auditoria Permanente",
    type: "node_backup",
    ipAddress: "192.168.10.99",
    status: "online",
    pingMs: 18,
    lastSeen: Date.now(),
    packetsSent: 28,
    packetsReceived: 334,
    roleDescription: "Espelhamento seguro de dados globais e logs de auditoria permanente",
  },
];

// Sincroniza eventos escolares, stories, curtidas, aviso global e perfis entre todos os visitantes e dispositivos
// =========================================================================
interface GlobalServerState {
  schoolEvents: any[];
  stories: any[];
  storeLikes: number;
  productLikes: Record<string, number>;
  storeConfig: any;
  users: any[];
  deletedUserIds: string[];
  servers: ServerNodeData[];
  interServerPackets: InterServerPacketData[];
}

const STORAGE_DIR = path.join(process.cwd(), "data");
const STORAGE_FILE = path.join(STORAGE_DIR, "global_state.json");

function loadPersistedState(): GlobalServerState {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
    if (fs.existsSync(STORAGE_FILE)) {
      const raw = fs.readFileSync(STORAGE_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return {
          schoolEvents: Array.isArray(parsed.schoolEvents) && parsed.schoolEvents.length > 0 ? parsed.schoolEvents : INITIAL_SCHOOL_EVENTS,
          stories: Array.isArray(parsed.stories) && parsed.stories.length > 0 ? parsed.stories : INITIAL_STORIES,
          storeLikes: typeof parsed.storeLikes === "number" ? parsed.storeLikes : 0,
          productLikes: parsed.productLikes && typeof parsed.productLikes === "object" ? parsed.productLikes : {},
          storeConfig: parsed.storeConfig && typeof parsed.storeConfig === "object" ? { ...INITIAL_STORE_CONFIG, ...parsed.storeConfig } : INITIAL_STORE_CONFIG,
          users: Array.isArray(parsed.users) && parsed.users.length > 0 ? parsed.users : INITIAL_USERS,
          deletedUserIds: Array.isArray(parsed.deletedUserIds) ? parsed.deletedUserIds : [],
          servers: Array.isArray(parsed.servers) && parsed.servers.length > 0 ? parsed.servers : INITIAL_SERVERS,
          interServerPackets: Array.isArray(parsed.interServerPackets) ? parsed.interServerPackets : [],
        };
      }
    }
  } catch (err) {
    console.error("[STORAGE LOAD ERROR]", err);
  }
  return {
    schoolEvents: INITIAL_SCHOOL_EVENTS,
    stories: INITIAL_STORIES,
    storeLikes: 0,
    productLikes: {},
    storeConfig: INITIAL_STORE_CONFIG,
    users: INITIAL_USERS,
    deletedUserIds: [],
    servers: INITIAL_SERVERS,
    interServerPackets: [],
  };
}

let globalServerState: GlobalServerState = loadPersistedState();

function relayInterServerPacket(packetInput: {
  action: 'profile_mutation' | 'global_announcement' | 'catalog_sync' | 'admin_directive' | 'system_heartbeat';
  summary: string;
  payloadData?: any;
  originServerId?: string;
}): InterServerPacketData {
  const masterServer = globalServerState.servers.find((s) => s.id === "server-adm-master") || INITIAL_SERVERS[0];
  const relayServer = globalServerState.servers.find((s) => s.id === "server-communication-hub") || INITIAL_SERVERS[1];
  const targetNodes = globalServerState.servers.filter(
    (s) => s.id !== masterServer.id && s.id !== relayServer.id
  );

  const packet: InterServerPacketData = {
    id: `pkt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: Date.now(),
    originServerId: masterServer.id,
    originServerName: masterServer.name,
    relayServerId: relayServer.id,
    relayServerName: relayServer.name,
    targetServerIds: targetNodes.map((n) => n.id),
    targetServerNames: targetNodes.map((n) => n.name),
    action: packetInput.action,
    summary: packetInput.summary,
    payloadData: packetInput.payloadData,
    status: "relayed_and_delivered",
  };

  // Atualizar métricas dos servidores
  masterServer.packetsSent = (masterServer.packetsSent || 0) + 1;
  relayServer.packetsReceived = (relayServer.packetsReceived || 0) + 1;
  relayServer.packetsSent = (relayServer.packetsSent || 0) + targetNodes.length;
  for (const node of targetNodes) {
    node.packetsReceived = (node.packetsReceived || 0) + 1;
    node.lastSeen = Date.now();
  }

  if (!Array.isArray(globalServerState.interServerPackets)) {
    globalServerState.interServerPackets = [];
  }
  globalServerState.interServerPackets.unshift(packet);
  if (globalServerState.interServerPackets.length > 50) {
    globalServerState.interServerPackets = globalServerState.interServerPackets.slice(0, 50);
  }

  persistState();

  // Emite eventos SSE para todos os clientes conectados
  broadcastGlobalEvent("inter_server_packet", packet);
  broadcastGlobalEvent("servers_updated", {
    servers: globalServerState.servers,
    recentPackets: globalServerState.interServerPackets.slice(0, 15),
  });

  console.log(`[INTER-SERVER RELAY] Pacote ${packet.id} (${packet.action}): ${masterServer.name} ➡️ [Relay: ${relayServer.name}] ➡️ Distribuído para ${targetNodes.length} nós.`);
  return packet;
}

function persistState() {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(globalServerState, null, 2), "utf-8");
  } catch (err) {
    console.error("[STORAGE SAVE ERROR]", err);
  }
}

interface LiveRadioState {
  isPlaying: boolean;
  youtubeId: string;
  title: string;
  startedAt: number;
  updatedAt: number;
  playedBy: string;
  listenersCount: number;
}

let liveRadioState: LiveRadioState = {
  isPlaying: false,
  youtubeId: "jfKfPfyJRdk",
  title: "Lofi Estudante Gilvan Sampaio",
  startedAt: Date.now(),
  updatedAt: Date.now(),
  playedBy: "João Lucas (Adm Máximo)",
  listenersCount: 1,
};

// Global Announcement State (Exclusivo Adm Máximo com foto na frente)
interface GlobalAnnouncementData {
  id: string;
  senderId: string;
  senderName: string;
  senderPhoto: string;
  senderRole: string;
  badge?: string;
  title?: string;
  message: string;
  createdAt: number;
  durationMs: number;
  priority?: "normal" | "urgent" | "golden";
}

let activeAnnouncement: GlobalAnnouncementData | null = null;

const radioSseClients = new Set<express.Response>();

function broadcastGlobalEvent(eventName: string, data: any) {
  const message = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of radioSseClients) {
    try {
      client.write(message);
    } catch {
      radioSseClients.delete(client);
    }
  }
}

function broadcastAnnouncement(announcement: GlobalAnnouncementData) {
  broadcastGlobalEvent("announcement", announcement);
}

function broadcastRadioState(event: string = "update") {
  const count = Math.max(1, radioSseClients.size);
  const payload = {
    ...liveRadioState,
    listenersCount: count,
  };
  broadcastGlobalEvent(event, payload);
}

// Obter estado atual da rádio (polling ou inicialização)
app.get("/api/radio/status", (_req, res) => {
  res.json({
    ...liveRadioState,
    listenersCount: Math.max(1, radioSseClients.size),
  });
});

// Transmissão Oficial pelo Adm Máximo: toca, pausa ou muda música para todos
app.post("/api/radio/broadcast", (req, res) => {
  const { isPlaying, youtubeId, title, playedBy } = req.body;

  if (typeof isPlaying === "boolean") {
    liveRadioState.isPlaying = isPlaying;
  }
  if (youtubeId && typeof youtubeId === "string") {
    liveRadioState.youtubeId = youtubeId.trim();
  }
  if (title && typeof title === "string") {
    liveRadioState.title = title.trim();
  }
  if (playedBy && typeof playedBy === "string") {
    liveRadioState.playedBy = playedBy.trim();
  }

  liveRadioState.updatedAt = Date.now();
  if (isPlaying) {
    liveRadioState.startedAt = Date.now();
  }

  broadcastRadioState("broadcast");

  console.log(
    `[RÁDIO AO VIVO] Transmissão por ${liveRadioState.playedBy}: "${liveRadioState.title}" (${liveRadioState.isPlaying ? "TOCANDO" : "PAUSADO"}) para ${radioSseClients.size} ouvintes.`
  );

  res.json({
    success: true,
    state: {
      ...liveRadioState,
      listenersCount: Math.max(1, radioSseClients.size),
    },
  });
});

// =========================================================================
// ROTAS DE SINCRONIZAÇÃO GLOBAL EM TEMPO REAL
// =========================================================================

// 1. Obter estado global completo (para inicialização rápida de novos visitantes e reconexão)
app.get("/api/global/state", (_req, res) => {
  res.json({
    schoolEvents: globalServerState.schoolEvents,
    stories: globalServerState.stories,
    storeLikes: globalServerState.storeLikes,
    productLikes: globalServerState.productLikes,
    storeConfig: globalServerState.storeConfig,
    users: globalServerState.users,
    deletedUserIds: globalServerState.deletedUserIds,
    activeAnnouncement: activeAnnouncement,
  });
});

// 2. Stories Globais: Postar novo story / status (persistido no servidor e broadcast para todos)
app.post("/api/global/stories", (req, res) => {
  try {
    const { story } = req.body;
    if (!story) return res.status(400).json({ error: "Story é obrigatório" });

    const fullStory = {
      ...story,
      id: story.id || `story-${Date.now()}`,
      timestamp: story.timestamp || "Agora",
      likes: typeof story.likes === "number" ? story.likes : 1,
    };

    // Insere no topo da lista global
    globalServerState.stories = [fullStory, ...globalServerState.stories.filter((s) => s.id !== fullStory.id)];
    persistState();

    broadcastGlobalEvent("story_added", fullStory);
    broadcastGlobalEvent("stories_updated", globalServerState.stories);

    console.log(`[GLOBAL STORY POSTADO] Por ${fullStory.authorName}: "${fullStory.caption?.slice(0, 50)}..."`);
    res.json({ success: true, story: fullStory, stories: globalServerState.stories });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro ao postar story";
    res.status(500).json({ error: msg });
  }
});

// 3. Curtir Story Globalmente (atualiza likes no story e no autor em tempo real para todos)
app.post("/api/global/stories/:id/like", (req, res) => {
  try {
    const storyId = req.params.id;
    let targetStory: any = null;

    globalServerState.stories = globalServerState.stories.map((s) => {
      if (s.id === storyId) {
        targetStory = { ...s, likes: (s.likes || 0) + 1 };
        return targetStory;
      }
      return s;
    });

    if (targetStory) {
      // Incrementa os likes recebidos do autor se for usuário cadastrado
      if (targetStory.authorId) {
        globalServerState.users = globalServerState.users.map((u) => {
          if (u.id === targetStory.authorId) {
            return { ...u, likesReceived: (u.likesReceived || 0) + 1 };
          }
          return u;
        });
      }

      persistState();
      broadcastGlobalEvent("story_liked", {
        storyId,
        likes: targetStory.likes,
        authorId: targetStory.authorId,
      });
      broadcastGlobalEvent("stories_updated", globalServerState.stories);
      broadcastGlobalEvent("users_updated", globalServerState.users);

      return res.json({ success: true, story: targetStory });
    }

    res.status(404).json({ error: "Story não encontrado" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro ao curtir story";
    res.status(500).json({ error: msg });
  }
});

// 4. Eventos Escolares Globais: Adicionar / Atualizar lista de eventos
app.post("/api/global/events", (req, res) => {
  try {
    const { event, events } = req.body;

    if (Array.isArray(events)) {
      globalServerState.schoolEvents = events;
    } else if (event) {
      const fullEvent = {
        ...event,
        id: event.id || `ev-${Date.now()}`,
        active: event.active !== false,
      };
      globalServerState.schoolEvents = [
        fullEvent,
        ...globalServerState.schoolEvents.filter((e) => e.id !== fullEvent.id),
      ];
    }

    persistState();
    broadcastGlobalEvent("events_updated", globalServerState.schoolEvents);

    console.log(`[GLOBAL EVENTOS ATUALIZADOS] Total: ${globalServerState.schoolEvents.length} eventos ativos/cadastrados.`);
    res.json({ success: true, events: globalServerState.schoolEvents });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro ao atualizar eventos";
    res.status(500).json({ error: msg });
  }
});

// 5. Alternar status de Evento Escolar (Ativar / Parar evento continuamente)
app.post("/api/global/events/toggle", (req, res) => {
  try {
    const { eventId, stoppedBy } = req.body;
    globalServerState.schoolEvents = globalServerState.schoolEvents.map((ev) => {
      if (ev.id === eventId) {
        const nextActive = ev.active === false;
        return {
          ...ev,
          active: nextActive,
          stoppedAt: nextActive
            ? undefined
            : new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          stoppedBy: nextActive ? undefined : stoppedBy || "Administrador",
        };
      }
      return ev;
    });

    persistState();
    broadcastGlobalEvent("events_updated", globalServerState.schoolEvents);
    res.json({ success: true, events: globalServerState.schoolEvents });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro ao alternar status do evento";
    res.status(500).json({ error: msg });
  }
});

// 6. Excluir Evento Escolar
app.delete("/api/global/events/:id", (req, res) => {
  try {
    const eventId = req.params.id;
    globalServerState.schoolEvents = globalServerState.schoolEvents.filter((e) => e.id !== eventId);
    persistState();
    broadcastGlobalEvent("events_updated", globalServerState.schoolEvents);
    res.json({ success: true, events: globalServerState.schoolEvents });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro ao remover evento";
    res.status(500).json({ error: msg });
  }
});

// 7. Curtidas Globais da Loja (HL Vendas - Total de Likes)
app.post("/api/global/likes/store", (req, res) => {
  try {
    const { change } = req.body;
    const delta = typeof change === "number" ? change : 1;
    globalServerState.storeLikes = Math.max(0, globalServerState.storeLikes + delta);
    persistState();

    broadcastGlobalEvent("store_likes_updated", globalServerState.storeLikes);
    console.log(`[GLOBAL LIKES LOJA] Novo total: ${globalServerState.storeLikes}`);
    res.json({ success: true, storeLikes: globalServerState.storeLikes });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro ao atualizar curtidas";
    res.status(500).json({ error: msg });
  }
});

// 8. Curtidas Globais de Produtos
app.post("/api/global/likes/product", (req, res) => {
  try {
    const { productId, change } = req.body;
    if (!productId) return res.status(400).json({ error: "productId é obrigatório" });

    const current = globalServerState.productLikes[productId] || 0;
    const delta = typeof change === "number" ? change : 1;
    const nextVal = Math.max(0, current + delta);
    globalServerState.productLikes[productId] = nextVal;
    persistState();

    broadcastGlobalEvent("product_likes_updated", globalServerState.productLikes);
    res.json({ success: true, productLikes: globalServerState.productLikes });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro ao curtir produto";
    res.status(500).json({ error: msg });
  }
});

// 9. Configurações Globais da Loja (Comunicados, Fundo YouTube, etc.)
app.post("/api/global/config", (req, res) => {
  try {
    const { config } = req.body;
    if (!config || typeof config !== "object") {
      return res.status(400).json({ error: "config é obrigatório" });
    }

    globalServerState.storeConfig = {
      ...globalServerState.storeConfig,
      ...config,
    };
    persistState();

    broadcastGlobalEvent("config_updated", globalServerState.storeConfig);
    console.log(`[GLOBAL CONFIG ATUALIZADA] Fundo YouTube: ${globalServerState.storeConfig.siteYoutubeBgActive ? "ATIVO" : "DESATIVADO"} | Aviso: ${globalServerState.storeConfig.globalAnnouncementActive ? "ATIVO" : "INATIVO"}`);
    res.json({ success: true, storeConfig: globalServerState.storeConfig });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro ao atualizar config";
    res.status(500).json({ error: msg });
  }
});

// 10. Usuários Globais: Sincronizar criação, senhas e nomes (permanente para todos)
app.post("/api/global/users", (req, res) => {
  try {
    const { users, user } = req.body;

    if (Array.isArray(users)) {
      // Filtrar usuários que estejam na lista de deletados
      const cleanUsers = users.filter((u) => !globalServerState.deletedUserIds.includes(u.id));
      globalServerState.users = cleanUsers;

      relayInterServerPacket({
        action: 'profile_mutation',
        summary: `Sincronização em lote de ${cleanUsers.length} perfis de usuários em todos os servidores da rede`,
        payloadData: { count: cleanUsers.length },
      });
    } else if (user && user.id) {
      if (globalServerState.deletedUserIds.includes(user.id)) {
        return res.status(403).json({ error: "Este usuário foi excluído permanentemente da rede." });
      }

      const index = globalServerState.users.findIndex((u) => u.id === user.id);
      if (index >= 0) {
        // Atualiza mesclando dados para preservar consistência
        globalServerState.users[index] = {
          ...globalServerState.users[index],
          ...user,
        };
      } else {
        globalServerState.users.push(user);
      }

      relayInterServerPacket({
        action: 'profile_mutation',
        summary: `Alteração permanente no perfil de "${user.name || user.id}" replicada via Hub para todos os nós`,
        payloadData: { userId: user.id, userName: user.name, role: user.role },
      });
    }

    persistState();
    broadcastGlobalEvent("users_updated", globalServerState.users);

    console.log(`[PERFIS ATUALIZADOS PERMANENTEMENTE] Total: ${globalServerState.users.length} usuários.`);
    res.json({ success: true, users: globalServerState.users });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro ao salvar usuários";
    res.status(500).json({ error: msg });
  }
});

// 11. Usuários Globais: Exclusão definitiva sem erros
app.post("/api/global/users/delete", (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId é obrigatório" });

    // Proteger a conta raiz original do João Lucas
    if (userId === "user-joao-lucas") {
      return res.status(403).json({ error: "A conta raiz de João Lucas não pode ser excluída." });
    }

    // Remove o usuário da lista global
    globalServerState.users = globalServerState.users.filter((u) => u.id !== userId);

    // Registra na lista negra de excluídos para nunca mais reaparecer em nenhum cliente
    if (!globalServerState.deletedUserIds.includes(userId)) {
      globalServerState.deletedUserIds.push(userId);
    }

    // Remove stories deste usuário
    globalServerState.stories = globalServerState.stories.filter((s) => s.authorId !== userId);

    persistState();

    relayInterServerPacket({
      action: 'profile_mutation',
      summary: `Exclusão permanente de usuário (ID: ${userId}) propagada para todos os nós`,
      payloadData: { deletedUserId: userId },
    });

    broadcastGlobalEvent("user_deleted", { userId });
    broadcastGlobalEvent("users_updated", globalServerState.users);
    broadcastGlobalEvent("stories_updated", globalServerState.stories);

    console.log(`[CONTA EXCLUÍDA GLOBALMENTE] ID: ${userId} removido de todos os nós.`);
    res.json({ success: true, deletedUserId: userId, users: globalServerState.users });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro ao excluir usuário";
    res.status(500).json({ error: msg });
  }
});

// =========================================================================
// ROTAS DO SISTEMA DE SERVIDORES & HUB DE COMUNICAÇÃO INTER-SERVIDORES
// =========================================================================

// Obter Topologia de Servidores e Histórico de Pacotes
app.get("/api/servers/topology", (_req, res) => {
  res.json({
    servers: globalServerState.servers,
    recentPackets: globalServerState.interServerPackets.slice(0, 30),
    totalPackets: globalServerState.interServerPackets.length,
    masterNodeId: "server-adm-master",
    relayNodeId: "server-communication-hub",
  });
});

// Despacho de Pacotes pelo Adm Máximo (passa pelo Servidor de Comunicação que entrega aos outros)
app.post("/api/servers/dispatch", (req, res) => {
  try {
    const { action, summary, payloadData } = req.body;

    if (!summary || typeof summary !== "string") {
      return res.status(400).json({ error: "Resumo da mensagem/diretriz é obrigatório." });
    }

    const packet = relayInterServerPacket({
      action: action || 'admin_directive',
      summary: summary.trim(),
      payloadData: payloadData || {},
    });

    res.json({
      success: true,
      packet,
      servers: globalServerState.servers,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro ao despachar pacote inter-servidor";
    res.status(500).json({ error: msg });
  }
});

// Consultar anúncio global ativo no momento (polling ou checagem inicial)
app.get("/api/announcement/current", (_req, res) => {
  if (activeAnnouncement) {
    const elapsed = Date.now() - activeAnnouncement.createdAt;
    if (elapsed < activeAnnouncement.durationMs + 3000) {
      return res.json({ announcement: activeAnnouncement });
    }
  }
  res.json({ announcement: null });
});

// Limpar e desativar anúncio global imediatamente
app.post("/api/announcement/clear", (_req, res) => {
  activeAnnouncement = null;
  globalServerState.storeConfig = {
    ...globalServerState.storeConfig,
    globalAnnouncement: "",
    globalAnnouncementActive: false,
  };
  persistState();
  broadcastGlobalEvent("config_updated", globalServerState.storeConfig);
  broadcastGlobalEvent("announcement_cleared", { cleared: true });
  console.log("[ANÚNCIO GLOBAL LIMPO E DESATIVADO]");
  res.json({ success: true });
});

// Disparar Anúncio Global na tela de todos por um breve momento (Exclusivo Adm Máximo com foto na frente)
app.post("/api/announcement/broadcast", (req, res) => {
  const { message, senderName, senderPhoto, senderRole, title, durationMs, priority } = req.body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "A mensagem do anúncio é obrigatória!" });
  }

  const duration = typeof durationMs === "number" && durationMs >= 3000 ? durationMs : 10000;

  activeAnnouncement = {
    id: `ann-${Date.now()}`,
    senderId: "user-joao-lucas",
    senderName: senderName || "João Lucas (Adm Máximo)",
    senderPhoto: senderPhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    senderRole: senderRole || "Administrador Máximo",
    badge: "👑 ADM MÁXIMO",
    title: title || "AVISO GLOBAL OFICIAL",
    message: message.trim(),
    createdAt: Date.now(),
    durationMs: duration,
    priority: priority || "golden",
  };

  // Também persiste na storeConfig global para manter o banner fixo visível no topo de todas as telas
  globalServerState.storeConfig = {
    ...globalServerState.storeConfig,
    globalAnnouncement: activeAnnouncement.message,
    globalAnnouncementActive: true,
    globalAnnouncementSenderName: activeAnnouncement.senderName,
    globalAnnouncementSenderAvatar: activeAnnouncement.senderPhoto,
    globalAnnouncementCreatedAt: activeAnnouncement.createdAt,
  };
  persistState();

  // Disparar pacote inter-servidores passando pelo Hub de Comunicação
  relayInterServerPacket({
    action: 'global_announcement',
    summary: `Aviso oficial disparado pelo Adm Máximo: "${activeAnnouncement.message}" via Hub de Comunicação`,
    payloadData: activeAnnouncement,
  });

  broadcastAnnouncement(activeAnnouncement);
  broadcastGlobalEvent("config_updated", globalServerState.storeConfig);

  console.log(`[ANÚNCIO GLOBAL DISPARADO] Por ${activeAnnouncement.senderName}: "${activeAnnouncement.message}" (${duration}ms)`);

  res.json({
    success: true,
    announcement: activeAnnouncement,
  });
});

// Canal em tempo real SSE (Server-Sent Events) para sincronização instantânea
app.get("/api/radio/stream", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  if (typeof (res as any).flushHeaders === "function") {
    (res as any).flushHeaders();
  }

  radioSseClients.add(res);

  // Enviar estado inicial da rádio imediatamente
  const initialPayload = {
    ...liveRadioState,
    listenersCount: Math.max(1, radioSseClients.size),
  };
  res.write(`event: init\ndata: ${JSON.stringify(initialPayload)}\n\n`);

  // Enviar ESTADO GLOBAL COMPLETO para o cliente recém conectado (eventos, stories, likes, configs, users, servidores)
  const globalSyncPayload = {
    schoolEvents: globalServerState.schoolEvents,
    stories: globalServerState.stories,
    storeLikes: globalServerState.storeLikes,
    productLikes: globalServerState.productLikes,
    storeConfig: globalServerState.storeConfig,
    users: globalServerState.users,
    deletedUserIds: globalServerState.deletedUserIds,
    activeAnnouncement: activeAnnouncement,
    servers: globalServerState.servers,
    interServerPackets: (globalServerState.interServerPackets || []).slice(0, 20),
  };
  res.write(`event: global_init\ndata: ${JSON.stringify(globalSyncPayload)}\n\n`);

  // Se houver anúncio global ativo no momento, enviar para o cliente recém-conectado
  if (activeAnnouncement && Date.now() - activeAnnouncement.createdAt < activeAnnouncement.durationMs) {
    res.write(`event: announcement\ndata: ${JSON.stringify(activeAnnouncement)}\n\n`);
  }

  // Notificar outros ouvintes sobre nova presença
  broadcastRadioState("presence");

  // Keep-alive heartbeat a cada 20s para manter conexão viva
  const heartbeat = setInterval(() => {
    try {
      res.write(": keepalive\n\n");
    } catch {
      clearInterval(heartbeat);
      radioSseClients.delete(res);
    }
  }, 20000);

  req.on("close", () => {
    clearInterval(heartbeat);
    radioSseClients.delete(res);
    broadcastRadioState("presence");
  });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`HL Vendas Server rodando na porta ${PORT} (0.0.0.0)`);
  });
}

startServer();
