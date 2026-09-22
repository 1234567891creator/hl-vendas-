import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  MapPin, 
  Calendar, 
  Tag, 
  Smartphone, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Plus,
  Minus,
  Mail
} from 'lucide-react';
import { Order, OrderItem, Coupon, StoreConfig, UserProfile } from '../types';
import { detectCurrentDevice } from '../utils/deviceDetector';
import { sounds } from '../utils/audioEffects';
import { fetchWithFallback } from '../utils/apiConfig';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: OrderItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onOrderPlaced: (order: Order) => void;
  coupons: Coupon[];
  storeConfig: StoreConfig;
  currentUser: UserProfile | null;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderPlaced,
  coupons,
  storeConfig,
  currentUser,
}) => {
  const [clientName, setClientName] = useState(currentUser?.name || '');
  const [clientContact, setClientContact] = useState('');
  const [studentGrade, setStudentGrade] = useState('7º Ano - Gilvan Sampaio');
  const [pickupDay, setPickupDay] = useState('Próxima Segunda-feira (15:30)');
  const [notes, setNotes] = useState('');
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

  // Calculate discount
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percent') {
      discount = (subtotal * appliedCoupon.discountValue) / 100;
    } else {
      discount = Math.min(subtotal, appliedCoupon.discountValue);
    }
  }

  const finalTotal = Math.max(0, subtotal - discount);

  const handleApplyCoupon = () => {
    const code = couponCodeInput.trim().toUpperCase();
    if (!code) return;

    const found = coupons.find((c) => c.code.toUpperCase() === code && c.active);
    if (!found) {
      setCouponMessage({ text: 'Cupom inválido ou expirado!', isError: true });
      return;
    }

    if (found.minOrderValue && subtotal < found.minOrderValue) {
      setCouponMessage({
        text: `Valor mínimo para este cupom é R$ ${found.minOrderValue.toFixed(2)}`,
        isError: true,
      });
      return;
    }

    if (found.targetEmail && currentUser?.email?.toLowerCase() !== found.targetEmail.toLowerCase()) {
      setCouponMessage({
        text: 'Este cupom exclusivo é destinado a outro estudante/e-mail!',
        isError: true,
      });
      return;
    }

    sounds.playSparkle();
    setAppliedCoupon(found);
    setCouponMessage({
      text: `Cupom aplicado! Desconto de ${
        found.discountType === 'percent' ? `${found.discountValue}%` : `R$ ${found.discountValue.toFixed(2)}`
      }`,
      isError: false,
    });
  };

  const handleFinishOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    if (!clientName.trim()) {
      alert('Por favor, informe seu nome!');
      return;
    }

    setSubmitting(true);
    const deviceInfo = detectCurrentDevice(currentUser?.email);

    const newOrder: Order = {
      id: `HL-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString(),
      clientName: clientName.trim(),
      clientContact: clientContact.trim() || 'Não informado',
      studentGrade,
      pickupDay,
      items: [...cartItems],
      totalAmount: finalTotal,
      discountApplied: discount,
      couponCode: appliedCoupon?.code,
      notes: notes.trim(),
      status: 'pendente',
      deviceInfo,
      sellerNotifiedEmail: storeConfig?.sellerNotificationEmail || 'joaolucasgp1234@gmail.com',
    };

    // Send order to backend API to simulate email notification to seller
    try {
      await fetchWithFallback('/api/orders/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: newOrder,
          sellerEmail: storeConfig?.sellerNotificationEmail || 'joaolucasgp1234@gmail.com',
        }),
      });
    } catch (err) {
      console.warn('Falha no envio de notificação simulada:', err);
    }

    sounds.playFanfare();
    onOrderPlaced(newOrder);
    onClearCart();
    setSuccessOrder(newOrder);
    setSubmitting(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 25 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl border-4 border-pink-300 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4 sm:p-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-yellow-300" />
              <div>
                <h2 className="font-display font-black text-lg sm:text-xl">
                  {successOrder ? 'Encomenda Confirmada!' : 'Finalizar Encomenda'}
                </h2>
                <p className="text-xs text-pink-100 font-medium">
                  {storeConfig?.pickupLocation || 'Na porta do C.E.P.M.G Gilvan Sampaio'} • {storeConfig?.pickupSchedule || 'Toda Segunda e Terça às 15:30'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playPop();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success screen if order completed */}
          {successOrder ? (
            <div className="p-6 sm:p-8 text-center space-y-4 overflow-y-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>

              <h3 className="font-display font-black text-2xl text-gray-900">
                Oba, {successOrder.clientName}! Pedido #{successOrder.id} Feito!
              </h3>

              <div className="bg-pink-50 border-2 border-pink-200 rounded-2xl p-4 text-left text-xs sm:text-sm space-y-2">
                <div className="flex items-center justify-between font-bold text-pink-900 pb-2 border-b border-pink-200">
                  <span>Ponto de Entrega:</span>
                  <span className="text-right">{storeConfig?.pickupLocation || 'Na porta do C.E.P.M.G Gilvan Sampaio'}</span>
                </div>
                <div className="flex items-center justify-between font-semibold text-gray-700">
                  <span>Dia e Horário:</span>
                  <span>{successOrder.pickupDay}</span>
                </div>
                <div className="flex items-center justify-between font-semibold text-gray-700">
                  <span>Total da Encomenda:</span>
                  <span className="text-pink-600 font-display font-black text-base">
                    R$ {successOrder.totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-purple-700 text-[11px] pt-1">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> Notificação enviada para o vendedor:
                  </span>
                  <span className="font-bold underline">{successOrder.sellerNotifiedEmail}</span>
                </div>
              </div>

              {/* Registered Device Feedback */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-[11px] text-gray-500 text-left flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-pink-500 flex-shrink-0" />
                <span>
                  <strong>Dispositivo Registrado:</strong> {successOrder.deviceInfo.deviceType} ({successOrder.deviceInfo.os} - {successOrder.deviceInfo.browser}) • IP: {successOrder.deviceInfo.ipSimulated}
                </span>
              </div>

              <p className="text-xs text-gray-500">
                A Helena e a equipe do HL Vendas já estão separando seus fofos para entregar na porta da escola!
              </p>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  sounds.playPop();
                  setSuccessOrder(null);
                  onClose();
                }}
                className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white font-display font-bold text-sm rounded-2xl shadow-md"
              >
                Voltar ao Catálogo
              </motion.button>
            </div>
          ) : (
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
              {/* Cart Items List */}
              {cartItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500 space-y-2">
                  <div className="text-4xl">🛒</div>
                  <p className="font-bold text-sm">Sua sacola de encomendas está vazia!</p>
                  <p className="text-xs">Escolha alguns squishies ou lápis fofos no catálogo para continuar.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <h3 className="font-display font-bold text-sm text-gray-800 flex items-center justify-between">
                      <span>Itens Escolhidos ({cartItems.length})</span>
                      <span className="text-xs text-gray-400 font-normal">
                        Entregues no Gilvan Sampaio
                      </span>
                    </h3>

                    <div className="max-h-48 overflow-y-auto divide-y divide-pink-100 border border-pink-100 rounded-2xl p-2 bg-pink-50/30">
                      {cartItems.map((item) => (
                        <div key={item.productId} className="py-2 flex items-center justify-between gap-3">
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className="w-12 h-12 rounded-xl object-cover border border-pink-200"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-xs text-gray-900 truncate">
                              {item.productName}
                            </h4>
                            <p className="text-[11px] text-pink-600 font-semibold">
                              R$ {item.unitPrice.toFixed(2)} un
                            </p>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-2 py-1">
                            <button
                              type="button"
                              onClick={() => {
                                sounds.playPop();
                                onUpdateQuantity(item.productId, -1);
                              }}
                              className="text-gray-500 hover:text-pink-600 font-bold text-xs"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-bold text-gray-800 w-4 text-center">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                sounds.playPop();
                                onUpdateQuantity(item.productId, 1);
                              }}
                              className="text-gray-500 hover:text-pink-600 font-bold text-xs"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <span className="font-display font-bold text-xs text-gray-900 w-16 text-right">
                            R$ {(item.unitPrice * item.quantity).toFixed(2)}
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              sounds.playPop();
                              onRemoveItem(item.productId);
                            }}
                            className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Coupon Input */}
                  <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-bold text-purple-900">
                        Possui Cupom de Desconto?
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value)}
                        placeholder="Ex: GILVAN10 ou HELENA5"
                        className="flex-1 uppercase bg-white border border-purple-200 rounded-xl px-3 py-1.5 text-xs font-bold text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition-colors shadow-xs"
                      >
                        Aplicar
                      </button>
                    </div>

                    {couponMessage && (
                      <p
                        className={`text-[11px] font-bold ${
                          couponMessage.isError ? 'text-red-600' : 'text-emerald-700'
                        }`}
                      >
                        {couponMessage.text}
                      </p>
                    )}
                  </div>

                  {/* Order Form */}
                  <form onSubmit={handleFinishOrder} className="space-y-3 pt-2 border-t border-pink-100">
                    <h3 className="font-display font-bold text-sm text-gray-800">
                      Dados do Estudante / Comprador
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Nome Completo *
                        </label>
                        <input
                          type="text"
                          required
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          placeholder="Ex: Beatriz Lima"
                          className="w-full bg-pink-50/50 border border-pink-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          WhatsApp / Telefone para aviso
                        </label>
                        <input
                          type="text"
                          value={clientContact}
                          onChange={(e) => setClientContact(e.target.value)}
                          placeholder="Ex: (62) 99999-9999"
                          className="w-full bg-pink-50/50 border border-pink-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Turma / Série no Gilvan Sampaio
                        </label>
                        <select
                          value={studentGrade}
                          onChange={(e) => setStudentGrade(e.target.value)}
                          className="w-full bg-pink-50/50 border border-pink-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-400"
                        >
                          <option>6º Ano - Gilvan Sampaio</option>
                          <option>7º Ano - Gilvan Sampaio</option>
                          <option>8º Ano - Gilvan Sampaio</option>
                          <option>9º Ano - Gilvan Sampaio</option>
                          <option>1º Ano Ensino Médio</option>
                          <option>2º Ano Ensino Médio</option>
                          <option>3º Ano Ensino Médio</option>
                          <option>Professor(a) / Funcionário(a)</option>
                          <option>Comunidade Externa / Pais</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Dia da Retirada na Porta da Escola
                        </label>
                        <select
                          value={pickupDay}
                          onChange={(e) => setPickupDay(e.target.value)}
                          className="w-full bg-pink-50/50 border border-pink-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-400"
                        >
                          <option>Próxima Segunda-feira (15:30)</option>
                          <option>Próxima Terça-feira (15:30)</option>
                          <option>Segunda-feira seguinte (15:30)</option>
                          <option>Terça-feira seguinte (15:30)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Observações Especiais (Cores preferidas, detalhes)
                      </label>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Ex: Quero o gatinho cinza ou com laço rosa!"
                        className="w-full bg-pink-50/50 border border-pink-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-400"
                      />
                    </div>

                    {/* Auto-detected Device Info Pill */}
                    <div className="bg-gray-100 rounded-xl p-2.5 text-[11px] text-gray-600 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 truncate">
                        <Smartphone className="w-3.5 h-3.5 text-pink-500 flex-shrink-0" />
                        <span className="truncate">
                          <strong>Dispositivo vinculado ao pedido:</strong> {detectCurrentDevice().deviceType} ({detectCurrentDevice().os})
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-sm">
                        Autenticado
                      </span>
                    </div>

                    {/* Summary Totals */}
                    <div className="bg-pink-50 rounded-2xl p-4 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-gray-600">
                        <span>Subtotal:</span>
                        <span>R$ {subtotal.toFixed(2)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex items-center justify-between text-emerald-600 font-bold">
                          <span>Desconto ({appliedCoupon?.code}):</span>
                          <span>- R$ {discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between font-display font-black text-base sm:text-lg text-pink-600 pt-1 border-t border-pink-200">
                        <span>Total a Pagar na Retirada:</span>
                        <span>R$ {finalTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white font-display font-bold text-sm sm:text-base rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <span>Processando encomenda...</span>
                      ) : (
                        <>
                          <span>Confirmar Encomenda para Gilvan Sampaio</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>
                  </form>
                </>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
