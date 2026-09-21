import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Sparkles, Save, Check, Crown } from 'lucide-react';
import { sounds } from '../utils/audioEffects';

interface EditHeroPillModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentText: string;
  onSave: (newText: string) => void;
}

export const EditHeroPillModal: React.FC<EditHeroPillModalProps> = ({
  isOpen,
  onClose,
  currentText,
  onSave,
}) => {
  const [text, setText] = useState(currentText || 'nada');

  if (!isOpen) return null;

  const presets = [
    'nada',
    'Promoção Relâmpago ⚡',
    'Novidades da Helena 🌸',
    'Chegaram Squishies Novos! 🐾',
    'Entrega Hoje às 17:30 🏫',
    'Tudo Fofinho & Baratinho 💖',
    'Top 1 do Gilvan Sampaio 🏆',
    'Volta às Aulas 🎒',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playSparkle();
    onSave(text.trim() || 'nada');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border-4 border-amber-300 overflow-hidden text-gray-800"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-bold text-xl shadow-inner">
              👑
            </div>
            <div>
              <h3 className="font-display font-black text-base sm:text-lg">
                Editar Frase em Destaque
              </h3>
              <p className="text-[11px] text-amber-100 flex items-center gap-1">
                <Crown className="w-3 h-3 text-yellow-300" />
                <span>Exclusivo para Adm Máximo (João Lucas)</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Digite a nova frase para a pílula do topo:
            </label>
            <div className="relative">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ex: nada ou Super Promoção"
                className="w-full bg-amber-50/50 border-2 border-amber-200 rounded-2xl px-4 py-3 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                maxLength={45}
                autoFocus
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold">
                {text.length}/45
              </span>
            </div>
          </div>

          {/* Live Preview of the pill */}
          <div className="bg-gray-50 rounded-2xl p-3 border border-gray-200 space-y-1 text-center">
            <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
              Prévia ao Vivo no Topo:
            </span>
            <div className="flex items-center justify-center pt-1">
              <div className="bg-gradient-to-r from-orange-400 to-amber-500 text-white font-bold text-xs px-4 py-1.5 rounded-full shadow-xs inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{text.trim() || 'nada'}</span>
              </div>
            </div>
          </div>

          {/* Suggestions Presets */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-gray-600 block">
              Sugestões Rápidas:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    setText(p);
                  }}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition-all font-semibold cursor-pointer ${
                    text === p
                      ? 'bg-amber-500 text-white border-amber-600 font-bold'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-amber-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-800 rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Frase</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
