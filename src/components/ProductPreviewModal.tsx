import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Star, 
  Sparkles, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Heart, 
  Check,
  Share2
} from 'lucide-react';
import { Product } from '../types';
import { sounds } from '../utils/audioEffects';

interface ProductPreviewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductPreviewModal: React.FC<ProductPreviewModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [imgZoomed, setImgZoomed] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!product) return null;

  const handleAdd = () => {
    sounds.playSuccess();
    onAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 900);
  };

  const handleShare = () => {
    sounds.playPop();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `Confira ${product.name} no HL Vendas! Retirada na porta do Gilvan Sampaio às 15:30 toda seg e ter! Preço: R$ ${product.price.toFixed(2)}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl border-4 border-pink-300 shadow-2xl overflow-hidden my-auto"
        >
          {/* Close button */}
          <button
            onClick={() => {
              sounds.playPop();
              onClose();
            }}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-500 hover:text-pink-600 hover:bg-pink-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6">
            {/* Left Image Section */}
            <div className="flex flex-col gap-3">
              <div 
                onClick={() => setImgZoomed(!imgZoomed)}
                className="relative aspect-square w-full rounded-2xl overflow-hidden bg-pink-50 border-2 border-pink-200 cursor-zoom-in group"
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-transform duration-300 ${
                    imgZoomed ? 'scale-150' : 'group-hover:scale-105'
                  }`}
                />
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
                  {imgZoomed ? 'Clique para normalizar' : 'Clique para zoom 🔍'}
                </div>
              </div>

              {/* Badges / Guarantees */}
              <div className="bg-pink-50/80 rounded-2xl p-2.5 border border-pink-200 text-xs flex items-center justify-between text-pink-900 font-medium">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Item conferido e testado</span>
                </div>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1 text-purple-700 hover:text-purple-900 font-bold text-[11px]"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copiado!' : 'Compartilhar'}</span>
                </button>
              </div>
            </div>

            {/* Right Details Section */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {product.category}
                  </span>
                  {product.isNew && (
                    <span className="bg-yellow-400 text-yellow-950 text-xs font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> NOVIDADE
                    </span>
                  )}
                </div>

                <h2 className="font-display font-black text-xl sm:text-2xl text-gray-900 leading-tight">
                  {product.name}
                </h2>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.round(product.rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-gray-700">{product.rating.toFixed(1)}</span>
                  <span className="text-xs text-gray-400">({product.reviewCount} avaliações de alunos)</span>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mt-3 leading-relaxed">
                  {product.description}
                </p>

                {/* Pickup notice */}
                <div className="mt-4 bg-purple-50 border border-purple-200 rounded-2xl p-3 text-xs text-purple-900">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <MapPin className="w-3.5 h-3.5 text-pink-500" />
                    <span>Ponto de Retirada Oficial:</span>
                  </div>
                  <p className="text-[11px] text-purple-800">
                    Na porta do <strong>C.E.P.M.G Gilvan Sampaio</strong> às <strong>15:30</strong> toda segunda e terça-feira!
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {product.tags.map((t, i) => (
                    <span
                      key={i}
                      className="bg-gray-100 text-gray-700 text-[10px] font-semibold px-2 py-0.5 rounded-md"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pricing, Quantity & Order */}
              <div className="mt-5 pt-4 border-t-2 border-pink-100">
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="font-display font-black text-2xl sm:text-3xl text-pink-600">
                    R$ {(product.price * quantity).toFixed(2)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-gray-400 text-sm line-through font-medium">
                      R$ {(product.originalPrice * quantity).toFixed(2)}
                    </span>
                  )}
                  {quantity > 1 && (
                    <span className="text-xs text-gray-500 font-semibold">
                      (R$ {product.price.toFixed(2)} cada)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Quantity selector */}
                  <div className="flex items-center bg-gray-100 rounded-2xl p-1 border border-gray-200">
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={() => {
                        sounds.playPop();
                        setQuantity(Math.max(1, quantity - 1));
                      }}
                      className="w-8 h-8 rounded-xl bg-white text-gray-700 font-bold flex items-center justify-center hover:bg-pink-50"
                    >
                      <Minus className="w-4 h-4" />
                    </motion.button>
                    <span className="w-8 text-center font-display font-bold text-sm text-gray-900">
                      {quantity}
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={() => {
                        sounds.playPop();
                        setQuantity(Math.min(product.stock, quantity + 1));
                      }}
                      className="w-8 h-8 rounded-xl bg-white text-gray-700 font-bold flex items-center justify-center hover:bg-pink-50"
                    >
                      <Plus className="w-4 h-4" />
                    </motion.button>
                  </div>

                  {/* Add to order button */}
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleAdd}
                    disabled={product.stock <= 0 || added}
                    className={`flex-1 py-3 px-4 rounded-2xl font-display font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all ${
                      added 
                        ? 'bg-emerald-600 text-white' 
                        : product.stock > 0
                        ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white hover:shadow-lg'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {added ? (
                      <>
                        <Check className="w-5 h-5" />
                        <span>Adicionado com Sucesso!</span>
                      </>
                    ) : product.stock > 0 ? (
                      <>
                        <ShoppingBag className="w-5 h-5" />
                        <span>Adicionar à Encomenda</span>
                      </>
                    ) : (
                      <span>Produto Esgotado</span>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
