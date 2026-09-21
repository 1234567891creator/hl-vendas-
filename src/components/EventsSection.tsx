import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Flame, 
  Bell, 
  Trophy, 
  Ticket, 
  Gift, 
  Volume2, 
  Play, 
  Check, 
  Copy,
  Clock,
  Zap,
  RotateCcw
} from 'lucide-react';
import { Coupon, UserProfile, SchoolEvent } from '../types';
import { sounds } from '../utils/audioEffects';

interface EventsSectionProps {
  onTriggerLightShow: (mode: 'confetti' | 'rainbow' | 'flash_sale' | 'neon_disco') => void;
  coupons: Coupon[];
  currentUser: UserProfile | null;
  onApplyCoupon?: (code: string) => void;
  events?: SchoolEvent[];
  onToggleEventStatus?: (eventId: string) => void;
  onRemoveEvent?: (eventId: string) => void;
  onAddEvent?: (event: SchoolEvent) => void;
}

export const EventsSection: React.FC<EventsSectionProps> = ({
  onTriggerLightShow,
  coupons,
  currentUser,
  events = [],
  onToggleEventStatus,
  onRemoveEvent,
  onAddEvent,
}) => {
  const isMaxAdmin = currentUser?.email?.toLowerCase() === 'joaolucasgp1234@gmail.com' || currentUser?.isMaxAdmin;
  const hasAdminAccess = isMaxAdmin || currentUser?.role === 'seller';
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newBadge, setNewBadge] = useState('Especial Gilvan');
  const [newIcon, setNewIcon] = useState('🎉');

  // Roulette Game State
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [wheelResult, setWheelResult] = useState<string | null>(null);
  const [hasSpun, setHasSpun] = useState(false);

  // Copied coupon feedback
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const wheelPrizes = [
    { label: '10% OFF no Gilvan', code: 'GILVAN10', icon: '🎟️', color: 'bg-pink-500' },
    { label: 'Brinde Surpresa na Porta', code: 'BRINDEFOFO', icon: '🎁', color: 'bg-purple-500' },
    { label: 'R$ 5,00 de Desconto', code: 'HELENA5', icon: '💸', color: 'bg-amber-500' },
    { label: '15% no Squishy Gatinho', code: 'SQUISHY15', icon: '🐾', color: 'bg-rose-500' },
    { label: 'Tente Novamente', code: null, icon: '🔄', color: 'bg-gray-400' },
    { label: 'Adesivo Kawaii Grátis', code: 'ADESIVOKAWAI', icon: '✨', color: 'bg-indigo-500' },
  ];

  const handleSpinWheel = () => {
    if (isSpinning || hasSpun) return;

    setIsSpinning(true);
    setWheelResult(null);
    sounds.playPop();

    // Random prize calculation
    const randomIndex = Math.floor(Math.random() * wheelPrizes.length);
    const extraSpins = 5 * 360; // 5 full rotations
    const sliceAngle = 360 / wheelPrizes.length;
    const targetAngle = extraSpins + (randomIndex * sliceAngle) + (sliceAngle / 2);

    setWheelRotation((prev) => prev + targetAngle);

    setTimeout(() => {
      setIsSpinning(false);
      setHasSpun(true);
      const wonPrize = wheelPrizes[randomIndex];
      setWheelResult(wonPrize.label);

      if (wonPrize.code) {
        sounds.playFanfare();
        onTriggerLightShow('confetti');
      } else {
        sounds.playPop();
      }
    }, 3500);
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    sounds.playSuccess();
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 rounded-3xl p-5 sm:p-7 text-white shadow-md border-3 border-pink-300 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 max-w-xl">
          <span className="bg-yellow-400 text-yellow-950 font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider inline-block">
            Mural de Eventos & Atrações
          </span>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white">
            Eventos Especiais HL Vendas
          </h2>
          <p className="text-xs sm:text-sm text-pink-100 font-medium">
            Participe dos eventos temáticos, gire a roleta da sorte para ganhar descontos e aproveite as promoções relâmpago na porta do C.E.P.M.G Gilvan Sampaio!
          </p>
        </div>

        <div className="w-16 h-16 rounded-3xl bg-white/20 flex items-center justify-center text-4xl shadow-inner flex-shrink-0">
          🎉
        </div>
      </div>

      {/* Grid of Interactive Events */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* EVENT 1: Roleta da Sorte Diária */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border-3 border-pink-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎰</span>
                <div>
                  <h3 className="font-display font-black text-base sm:text-lg text-gray-900 leading-tight">
                    Roleta da Sorte do Gilvan
                  </h3>
                  <span className="text-[11px] text-gray-500 font-medium">Gire e ganhe cupons e brindes na entrega</span>
                </div>
              </div>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                1 Giro por Sessão
              </span>
            </div>

            {/* Wheel Visual */}
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto my-4 flex items-center justify-center">
              {/* Pointer Marker */}
              <div className="absolute -top-2 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-pink-600 drop-shadow-md"></div>

              {/* Animated Wheel Body */}
              <motion.div
                animate={{ rotate: wheelRotation }}
                transition={{ duration: 3.5, ease: [0.15, 0.9, 0.2, 1] }}
                className="w-full h-full rounded-full border-4 border-yellow-400 shadow-lg overflow-hidden relative bg-gradient-to-tr from-pink-400 via-purple-400 to-rose-400 flex items-center justify-center"
              >
                <div className="w-12 h-12 rounded-full bg-white border-2 border-pink-400 z-10 flex items-center justify-center font-black text-xs text-pink-600 shadow-md">
                  HL
                </div>
                {/* Visual slices decoration */}
                <div className="absolute inset-0 flex items-center justify-center opacity-30 text-white font-bold text-[10px]">
                  <span>✨ 🎁 🎟️ 🐾 ✨ 💸</span>
                </div>
              </motion.div>
            </div>

            {/* Result Message */}
            {wheelResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-pink-50 border-2 border-pink-300 rounded-2xl text-center mb-3"
              >
                <span className="text-xs text-gray-600 font-bold block">Seu resultado da sorte:</span>
                <span className="text-sm font-display font-black text-pink-600 block mt-0.5">
                  🎉 {wheelResult}
                </span>
                <span className="text-[10px] text-gray-400 block mt-0.5">
                  Avise a Helena na porta do colégio para resgatar!
                </span>
              </motion.div>
            )}
          </div>

          <motion.button
            whileHover={{ scale: isSpinning || hasSpun ? 1 : 1.03 }}
            whileTap={{ scale: isSpinning || hasSpun ? 1 : 0.97 }}
            disabled={isSpinning || hasSpun}
            onClick={handleSpinWheel}
            className={`w-full py-3 rounded-2xl font-display font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
              hasSpun
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                : isSpinning
                ? 'bg-pink-400 text-white cursor-wait animate-pulse'
                : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600'
            }`}
          >
            <Zap className="w-4 h-4 text-yellow-300" />
            <span>{hasSpun ? 'Giro Realizado!' : isSpinning ? 'Girando a Roleta...' : 'Girar Roleta da Sorte'}</span>
          </motion.button>
        </div>

        {/* EVENT 2: Cupons Ativos e Descontos Escolares */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border-3 border-pink-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎟️</span>
                <div>
                  <h3 className="font-display font-black text-base sm:text-lg text-gray-900 leading-tight">
                    Cupons & Códigos de Desconto
                  </h3>
                  <span className="text-[11px] text-gray-500 font-medium">Copie e aplique na sua encomenda</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-600 mb-3">
              Estes cupons foram liberados pela vendedora Helena e pelo João Lucas para os estudantes do Gilvan Sampaio:
            </p>

            <div className="space-y-2.5">
              {coupons.filter((c) => c.active).map((coupon) => (
                <div
                  key={coupon.id}
                  className="bg-pink-50/60 border-2 border-pink-200 rounded-2xl p-3 flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-black text-xs sm:text-sm text-pink-600 bg-white px-2.5 py-0.5 rounded-lg border border-pink-200 tracking-wider">
                        {coupon.code}
                      </span>
                      <span className="bg-yellow-400 text-yellow-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                        {coupon.discountType === 'percent' ? `${coupon.discountValue}% OFF` : `R$ ${coupon.discountValue.toFixed(2)} OFF`}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500 block">
                      {coupon.minOrderValue ? `Válido para pedidos acima de R$ ${coupon.minOrderValue.toFixed(2)}` : 'Sem valor mínimo!'}
                    </span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCopyCoupon(coupon.code)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 shadow-2xs transition-all ${
                      copiedCode === coupon.code
                        ? 'bg-green-500 text-white'
                        : 'bg-white hover:bg-pink-100 text-pink-600 border border-pink-300'
                    }`}
                  >
                    {copiedCode === coupon.code ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </motion.button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-pink-100 text-[11px] text-gray-400 text-center">
            💡 Cole o código copiado na sua sacola de encomendas antes de enviar!
          </div>
        </div>
      </div>

      {/* EVENT 3: Disparadores de Efeitos & Iluminação (Acessíveis para Todos os Alunos e com modo especial do Adm) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-3 border-pink-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <div>
              <h3 className="font-display font-black text-base sm:text-lg text-gray-900 leading-tight">
                Efeitos Visuais & Sonoros Interativos
              </h3>
              <span className="text-[11px] text-gray-500 font-medium">
                Clique nos botões abaixo para disparar animações e sons no site
              </span>
            </div>
          </div>
          {isMaxAdmin && (
            <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-3 py-1 rounded-full border border-amber-300">
              👑 Disparador Oficial do Adm
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Confetti Celebration */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onTriggerLightShow('confetti')}
            className="p-4 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-100 border-2 border-pink-300 text-left hover:border-pink-400 transition-all shadow-2xs group"
          >
            <div className="w-10 h-10 rounded-xl bg-pink-500 text-white flex items-center justify-center text-xl mb-2 shadow-xs group-hover:scale-110 transition-transform">
              🎊
            </div>
            <span className="font-display font-black text-xs text-gray-900 block leading-tight">
              Chuva de Confetes
            </span>
            <span className="text-[10px] text-gray-500 font-medium block mt-0.5">
              Comemoração fofa com fanfarra
            </span>
          </motion.button>

          {/* Flash Sale Siren */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onTriggerLightShow('flash_sale')}
            className="p-4 rounded-2xl bg-gradient-to-br from-red-50 to-orange-100 border-2 border-red-300 text-left hover:border-red-400 transition-all shadow-2xs group"
          >
            <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center text-xl mb-2 shadow-xs group-hover:scale-110 transition-transform">
              🚨
            </div>
            <span className="font-display font-black text-xs text-gray-900 block leading-tight">
              Sirene Relâmpago
            </span>
            <span className="text-[10px] text-gray-500 font-medium block mt-0.5">
              Alerta de squishies em promoção
            </span>
          </motion.button>

          {/* Golden Rainbow */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onTriggerLightShow('rainbow')}
            className="p-4 rounded-2xl bg-gradient-to-br from-yellow-50 to-amber-100 border-2 border-amber-300 text-left hover:border-amber-400 transition-all shadow-2xs group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xl mb-2 shadow-xs group-hover:scale-110 transition-transform">
              🌈
            </div>
            <span className="font-display font-black text-xs text-gray-900 block leading-tight">
              Arco-Íris Dourado
            </span>
            <span className="text-[10px] text-gray-500 font-medium block mt-0.5">
              Brilhos e sinos mágicos
            </span>
          </motion.button>

          {/* Neon Disco */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onTriggerLightShow('neon_disco')}
            className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-100 border-2 border-purple-300 text-left hover:border-purple-400 transition-all shadow-2xs group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center text-xl mb-2 shadow-xs group-hover:scale-110 transition-transform">
              🪩
            </div>
            <span className="font-display font-black text-xs text-gray-900 block leading-tight">
              Baladinha Neon
            </span>
            <span className="text-[10px] text-gray-500 font-medium block mt-0.5">
              Luzes de discoteca 2D
            </span>
          </motion.button>
        </div>
      </div>

      {/* EVENT 4: Mural de Eventos Fixos & Permanentes (Duram até o Adm parar) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-3 border-purple-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-purple-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📌</span>
              <h3 className="font-display font-black text-base sm:text-lg text-gray-900 leading-tight">
                Mural de Eventos da Escola (Duração até o Adm Parar)
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Todos os eventos duram ininterruptamente até que o administrador que os colocou clique em <strong>Parar Evento</strong>.
            </p>
          </div>

          {hasAdminAccess && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                sounds.playPop();
                setIsAddingEvent(!isAddingEvent);
              }}
              className="px-3.5 py-1.5 bg-gradient-to-r from-purple-700 to-indigo-700 text-white rounded-2xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span>{isAddingEvent ? 'Fechar' : '➕ Novo Evento (Adm)'}</span>
            </motion.button>
          )}
        </div>

        {/* Form to create new event lasting until adm stops it */}
        {hasAdminAccess && isAddingEvent && (
          <div className="p-4 bg-purple-50 rounded-2xl border-2 border-purple-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-purple-900 uppercase flex items-center gap-1.5">
                <span>👑 Criar Evento com Duração Contínua</span>
              </h4>
              <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full border border-green-200">
                🟢 Fica ativo até o Adm parar
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Título do evento (ex: Festival do Squishy Rosa)..."
                className="px-3 py-2 bg-white rounded-xl text-xs border border-purple-200 focus:ring-2 focus:ring-purple-400 font-medium"
              />
              <input
                type="text"
                value={newBadge}
                onChange={(e) => setNewBadge(e.target.value)}
                placeholder="Tag (ex: Semana Especial, Edição Limitada)..."
                className="px-3 py-2 bg-white rounded-xl text-xs border border-purple-200 focus:ring-2 focus:ring-purple-400 font-medium"
              />
            </div>
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Descrição completa do evento e regras de entrega no Gilvan Sampaio..."
              rows={2}
              className="w-full px-3 py-2 bg-white rounded-xl text-xs border border-purple-200 focus:ring-2 focus:ring-purple-400 font-medium"
            />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-purple-900">Ícone:</span>
                {['🎉', '🐾', '💖', '🎒', '⭐', '🛍️', '⚡', '👑'].map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setNewIcon(ic)}
                    className={`text-base p-1 rounded-lg border ${newIcon === ic ? 'bg-purple-200 border-purple-400' : 'bg-white border-purple-100'}`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!newTitle.trim()) return;
                  sounds.playSuccess();
                  if (onAddEvent) {
                    onAddEvent({
                      id: `ev-custom-${Date.now()}`,
                      title: newTitle.trim(),
                      subtitle: newBadge,
                      description: newDesc.trim() || 'Evento fixo para os alunos do C.E.P.M.G Gilvan Sampaio.',
                      badge: newBadge || 'Atração Fixa',
                      icon: newIcon,
                      type: 'custom',
                      createdAt: new Date().toLocaleDateString('pt-BR'),
                      createdBy: currentUser?.name || 'João Lucas (Adm Máximo)',
                      canBeRemovedByMaxAdminOnly: true,
                      active: true
                    });
                  }
                  setNewTitle('');
                  setNewDesc('');
                  setIsAddingEvent(false);
                }}
                className="w-full sm:w-auto px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
              >
                Salvar & Ativar Evento
              </button>
            </div>
          </div>
        )}

        {/* Grid of Events */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {events.map((ev) => {
            const isEventActive = ev.active !== false;

            return (
              <div
                key={ev.id}
                className={`rounded-2xl p-4 border flex flex-col justify-between space-y-3 relative transition-all ${
                  isEventActive 
                    ? 'bg-purple-50/40 border-purple-200 shadow-2xs' 
                    : 'bg-gray-100 border-gray-300 opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl p-1.5 bg-white rounded-xl border border-purple-100 shadow-2xs">
                      {ev.icon}
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                      isEventActive 
                        ? 'bg-green-100 text-green-800 border-green-200' 
                        : 'bg-red-100 text-red-800 border-red-200'
                    }`}>
                      {isEventActive ? '🟢 Ativo até Adm Parar' : '⏹️ Encerrado pelo Adm'}
                    </span>
                  </div>

                  <h4 className="font-display font-black text-sm text-gray-900 leading-tight">
                    {ev.title}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">
                    {ev.description}
                  </p>
                  <span className="inline-block text-[10px] text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md font-bold mt-2">
                    Tag: {ev.badge}
                  </span>
                </div>

                <div className="pt-2 border-t border-purple-100 flex flex-col gap-2">
                  <div className="text-[10px] text-gray-400 font-semibold flex items-center justify-between">
                    <span>Criado por: {ev.createdBy || 'Adm'}</span>
                    {ev.stoppedAt && (
                      <span className="text-red-500">Parado em: {ev.stoppedAt}</span>
                    )}
                  </div>

                  {/* Admin Controls to Stop, Resume or Remove */}
                  {hasAdminAccess && (
                    <div className="flex items-center justify-end gap-1.5 pt-1">
                      {onToggleEventStatus && (
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playPop();
                            onToggleEventStatus(ev.id);
                          }}
                          className={`text-[10px] font-black px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                            isEventActive
                              ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                              : 'bg-green-100 hover:bg-green-200 text-green-900 border border-green-300'
                          }`}
                          title={isEventActive ? 'Parar este evento (o evento fica pausado até você reativar)' : 'Reativar evento'}
                        >
                          {isEventActive ? '⏹️ Parar Evento' : '▶️ Reativar Evento'}
                        </button>
                      )}

                      {(isMaxAdmin || !ev.canBeRemovedByMaxAdminOnly) && onRemoveEvent && (
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playPop();
                            onRemoveEvent(ev.id);
                          }}
                          className="text-[10px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2 py-1 rounded-lg cursor-pointer transition-colors"
                          title="Excluir este evento definitivamente"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
