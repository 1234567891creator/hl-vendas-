import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Sparkles, 
  SlidersHorizontal, 
  RotateCcw, 
  Smile, 
  Heart,
  PackageCheck
} from 'lucide-react';
import { Product, ProductCategory } from '../types';
import { ProductCard } from './ProductCard';
import { sounds } from '../utils/audioEffects';

interface CatalogSectionProps {
  products: Product[];
  onPreview: (product: Product) => void;
  onQuickOrder: (product: Product) => void;
  cartItemIds: string[];
}

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  products,
  onPreview,
  onQuickOrder,
  cartItemIds,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [onlyInStock, setOnlyInStock] = useState(false);

  const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'squishs', label: 'squishs' },
    { id: 'borachas', label: 'borachas' },
    { id: 'canetas marcadoras', label: 'canetas marcadoras' },
    { id: 'cadernos', label: 'cadernos' },
    { id: 'estojos', label: 'estojos' },
    { id: 'marca textos', label: 'marca textos' },
  ];

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Match category loosely to handle squishies/squishs
        let matchesCategory = selectedCategory === 'all';
        if (!matchesCategory) {
          if (selectedCategory === 'squishs') {
            matchesCategory = p.category === 'squishs' || p.category === 'squishies';
          } else if (selectedCategory === 'borachas') {
            matchesCategory = p.category === 'borachas' || p.tags.some(t => t.toLowerCase().includes('boracha') || t.toLowerCase().includes('borracha'));
          } else if (selectedCategory === 'canetas marcadoras') {
            matchesCategory = p.category === 'canetas marcadoras' || p.category === 'lapis' || p.tags.some(t => t.toLowerCase().includes('caneta') || t.toLowerCase().includes('lápis'));
          } else if (selectedCategory === 'cadernos') {
            matchesCategory = p.category === 'cadernos' || p.category === 'papelaria' || p.tags.some(t => t.toLowerCase().includes('caderno') || t.toLowerCase().includes('notas'));
          } else if (selectedCategory === 'estojos') {
            matchesCategory = p.category === 'estojos' || p.tags.some(t => t.toLowerCase().includes('estojo'));
          } else if (selectedCategory === 'marca textos') {
            matchesCategory = p.category === 'marca textos' || p.tags.some(t => t.toLowerCase().includes('marca texto'));
          } else {
            matchesCategory = p.category === selectedCategory;
          }
        }

        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStock = !onlyInStock || p.stock > 0;
        return matchesCategory && matchesSearch && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        // Default: featured first, then newest
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      });
  }, [products, selectedCategory, searchQuery, onlyInStock, sortBy]);

  return (
    <div className="space-y-6">
      {/* Screenshot 2: Section Header "Nossos Produtos 🎁" */}
      <div className="text-center pt-2 pb-1">
        <h2 className="font-display font-black text-2xl sm:text-3xl tracking-tight inline-flex items-center justify-center gap-2">
          <span className="text-[#7c3aed]">Nossos</span>
          <span className="text-[#0284c7]">Produtos</span>
          <span className="text-2xl">🎁</span>
        </h2>
        <p className="text-purple-600/80 text-xs sm:text-sm font-medium mt-1">
          Uma variedade fofinha para deixar seu dia mais colorido!
        </p>
      </div>

      {/* Screenshot 2: Category Filter Bar with Rounded Pills */}
      <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto no-scrollbar pb-1 pt-1 px-1">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                sounds.playPop();
                setSelectedCategory(cat.id);
              }}
              className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-full font-display font-bold text-xs sm:text-sm whitespace-nowrap transition-all shadow-xs ${
                isSelected
                  ? 'bg-[#7c3aed] text-white shadow-md shadow-purple-500/20'
                  : 'bg-white hover:bg-purple-50 text-purple-800 border border-purple-200'
              }`}
            >
              <span>{cat.label}</span>
              {isSelected && (
                <span className="bg-white/25 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1.5">
                  {filteredProducts.length}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-purple-100 p-3 sm:p-3.5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar gatinho, borracha, caneta, squishy..."
            className="w-full bg-purple-50/50 border border-purple-200/80 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-gray-800 placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters Controls */}
        <div className="flex flex-wrap items-center justify-between w-full md:w-auto gap-2 text-xs">
          {/* In Stock toggle */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              sounds.playPop();
              setOnlyInStock(!onlyInStock);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-colors ${
              onlyInStock
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <PackageCheck className="w-3.5 h-3.5" />
            <span>Apenas em Estoque</span>
          </motion.button>

          {/* Sort selector */}
          <div className="flex items-center gap-1.5 bg-gray-100 rounded-xl px-2.5 py-1.5 border border-gray-200">
            <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-gray-700 font-bold focus:outline-none text-xs cursor-pointer"
            >
              <option value="featured">Mais Populares</option>
              <option value="price-asc">Menor Preço</option>
              <option value="price-desc">Maior Preço</option>
              <option value="rating">Melhor Avaliados</option>
            </select>
          </div>

          {/* Reset Filters button if any active */}
          {(searchQuery || selectedCategory !== 'all' || onlyInStock || sortBy !== 'featured') && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                sounds.playPop();
                setSearchQuery('');
                setSelectedCategory('all');
                setOnlyInStock(false);
                setSortBy('featured');
              }}
              className="text-pink-600 hover:text-pink-800 font-bold flex items-center gap-1 px-2 py-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Limpar</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <motion.div 
          layout
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5"
        >
          <AnimatePresence>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onPreview={onPreview}
                onQuickOrder={onQuickOrder}
                isInCart={cartItemIds.includes(product.id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="bg-white rounded-3xl border-3 border-dashed border-pink-200 p-8 text-center max-w-md mx-auto space-y-3">
          <div className="w-16 h-16 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center mx-auto text-2xl animate-bounce">
            🧸
          </div>
          <h3 className="font-display font-bold text-lg text-gray-800">
            Nenhum produto fofo encontrado!
          </h3>
          <p className="text-xs text-gray-500">
            Tente buscar com outras palavras ou limpe os filtros para ver todo o catálogo do Gilvan Sampaio.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              sounds.playPop();
              setSearchQuery('');
              setSelectedCategory('all');
              setOnlyInStock(false);
            }}
            className="bg-pink-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm hover:bg-pink-600"
          >
            Ver Todos os Produtos
          </motion.button>
        </div>
      )}
    </div>
  );
};
