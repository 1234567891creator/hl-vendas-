import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Star, Eye, Plus, Check, Heart, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { sounds } from '../utils/audioEffects';

interface ProductCardProps {
  product: Product;
  onPreview: (product: Product) => void;
  onQuickOrder: (product: Product) => void;
  isInCart?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPreview,
  onQuickOrder,
  isInCart,
}) => {
  const [liked, setLiked] = useState(false);
  const [imgError, setImgError] = useState(false);

  // High quality guaranteed fallback images based on category
  const fallbackImages: Record<string, string> = {
    squishies: 'https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=600&auto=format&fit=crop&q=80',
    lapis: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80',
    papelaria: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&auto=format&fit=crop&q=80',
    meninas: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
    kits: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80',
  };

  const imageSrc = imgError ? fallbackImages[product.category] || fallbackImages.squishies : product.imageUrl;

  // Format category name cleanly
  const displayCategory = product.category === 'squishies' ? 'squishs' : product.category;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="group relative bg-white rounded-[26px] border border-purple-100/90 hover:border-purple-300 p-3 sm:p-3.5 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden"
    >
      {/* Top Image Container with Screenshot Badges */}
      <div 
        onClick={() => {
          sounds.playPop();
          onPreview(product);
        }}
        className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#FDF8FD] cursor-pointer border border-purple-50 mb-3 flex items-center justify-center"
      >
        {/* Screenshot 2: Top-Left Category Pill Tag */}
        <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
          <span className="bg-[#7c3aed] text-white text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-xs tracking-wide">
            {displayCategory}
          </span>
        </div>

        {/* Screenshot 2: Top-Right Price Pill Tag */}
        <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
          <span className="bg-white/95 backdrop-blur-xs text-[#6b21a8] text-[11px] sm:text-xs font-black px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-xs border border-purple-100">
            R$ {product.price.toFixed(2).replace('.', ',')}
          </span>
        </div>

        {/* Floating Like Heart Button */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          onClick={(e) => {
            e.stopPropagation();
            sounds.playPop();
            setLiked(!liked);
          }}
          className="absolute bottom-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs shadow-sm flex items-center justify-center text-pink-500 hover:bg-pink-50 transition-colors"
          title="Favoritar"
        >
          <Heart className={`w-3.5 h-3.5 transition-colors ${liked ? 'fill-pink-500 text-pink-500' : 'text-gray-400'}`} />
        </motion.button>

        <img
          src={imageSrc}
          alt={product.name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Hover overlay hint */}
        <div className="absolute inset-0 bg-purple-950/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="bg-white/95 text-purple-700 font-display font-bold text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 backdrop-blur-xs">
            <Eye className="w-3.5 h-3.5" /> Ver Detalhes
          </span>
        </div>

        {/* Stock status badge */}
        <div className="absolute bottom-2.5 left-2.5 z-10">
          {product.stock <= 0 ? (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
              Esgotado
            </span>
          ) : product.stock < 5 ? (
            <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-200">
              Resta {product.stock}
            </span>
          ) : null}
        </div>
      </div>

      {/* Product Information */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Title in Deep Purple as in Screenshot 2 */}
          <h3 
            onClick={() => {
              sounds.playPop();
              onPreview(product);
            }}
            className="font-display font-black text-[#3b0764] text-sm sm:text-base leading-snug line-clamp-2 hover:text-purple-600 transition-colors cursor-pointer"
          >
            {product.name}
          </h3>

          {/* Subtitle / Description in Soft Purple */}
          <p className="text-purple-600/70 text-xs mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1 text-amber-500 font-bold text-xs mt-1.5">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-gray-700 text-xs">{product.rating.toFixed(1)}</span>
            <span className="text-gray-400 text-[10px]">({product.reviewCount})</span>
          </div>
        </div>

        {/* Full-width Screenshot 2 "Encomendar" Button */}
        <div className="mt-3 pt-2.5 border-t border-purple-50">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              sounds.playSuccess();
              onQuickOrder(product);
            }}
            className={`w-full py-2.5 px-4 rounded-xl sm:rounded-2xl font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition-all ${
              isInCart 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
            }`}
          >
            {isInCart ? (
              <>
                <Check className="w-4 h-4" />
                <span>No Pedido</span>
              </>
            ) : (
              <>
                <span className="text-base">🛍️</span>
                <span>Encomendar</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
