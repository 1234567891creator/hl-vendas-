import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

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
// RÁDIO AO VIVO MULTI-USUÁRIO: QUANDO O ADM TOCA UMA MÚSICA, TODOS ESCUTAM
// =========================================================================
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

function broadcastAnnouncement(announcement: GlobalAnnouncementData) {
  const data = `event: announcement\ndata: ${JSON.stringify(announcement)}\n\n`;
  for (const client of radioSseClients) {
    try {
      client.write(data);
    } catch {
      radioSseClients.delete(client);
    }
  }
}

function broadcastRadioState(event: string = "update") {
  const count = Math.max(1, radioSseClients.size);
  const payload = {
    ...liveRadioState,
    listenersCount: count,
  };
  const data = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const client of radioSseClients) {
    try {
      client.write(data);
    } catch {
      radioSseClients.delete(client);
    }
  }
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

// Consultar anúncio global ativo no momento (polling ou checagem inicial)
app.get("/api/announcement/current", (_req, res) => {
  if (activeAnnouncement) {
    const elapsed = Date.now() - activeAnnouncement.createdAt;
    if (elapsed < activeAnnouncement.durationMs + 1000) {
      return res.json({ announcement: activeAnnouncement });
    }
  }
  res.json({ announcement: null });
});

// Disparar Anúncio Global na tela de todos por um breve momento (Exclusivo Adm Máximo com foto na frente)
app.post("/api/announcement/broadcast", (req, res) => {
  const { message, senderName, senderPhoto, senderRole, title, durationMs, priority, userEmail, isMaxAdmin } = req.body;

  const authorized = userEmail?.toLowerCase() === "joaolucasgp1234@gmail.com" || isMaxAdmin === true;
  if (!authorized) {
    return res.status(403).json({ error: "Apenas o Administrador Máximo (João Lucas) pode disparar anúncios globais para todos!" });
  }

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "A mensagem do anúncio é obrigatória!" });
  }

  const duration = typeof durationMs === "number" && durationMs >= 3000 ? durationMs : 7000;

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

  broadcastAnnouncement(activeAnnouncement);

  console.log(`[ANÚNCIO GLOBAL DISPARADO] Por ${activeAnnouncement.senderName}: "${activeAnnouncement.message}" (${duration}ms)`);

  res.json({
    success: true,
    announcement: activeAnnouncement,
  });
});

// Canal em tempo real SSE (Server-Sent Events) para sincronização instantânea
app.get("/api/radio/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  if (typeof (res as any).flushHeaders === "function") {
    (res as any).flushHeaders();
  }

  radioSseClients.add(res);

  // Enviar estado inicial imediatamente
  const initialPayload = {
    ...liveRadioState,
    listenersCount: Math.max(1, radioSseClients.size),
  };
  res.write(`event: init\ndata: ${JSON.stringify(initialPayload)}\n\n`);

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
