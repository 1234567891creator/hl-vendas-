import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Link, Check, Sparkles, Image as ImageIcon, Camera } from 'lucide-react';
import { UserProfile } from '../types';
import { sounds } from '../utils/audioEffects';

interface AvatarEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onSaveAvatar: (userId: string, newAvatarUrl: string) => void;
}

// Curated list of cute school & kawaii avatars
const PRESET_AVATARS = [
  {
    name: 'Gatinho Mochi',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    tag: '👑 João Lucas'
  },
  {
    name: 'Helena Estrela',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    tag: '🌸 Helena'
  },
  {
    name: 'Sofia Vendedora',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    tag: '🎀 Sofia'
  },
  {
    name: 'Aluna Estudante',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    tag: '🎒 Maria Clara'
  },
  {
    name: 'Garoto Escolar',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    tag: '📘 Aluno'
  },
  {
    name: 'Garota Fofa',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80',
    tag: '✨ Kawaii'
  },
  {
    name: 'Squishy Sorvete',
    url: 'https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=200&auto=format&fit=crop&q=80',
    tag: '🍦 Sorvete'
  },
  {
    name: 'Panda Rosa',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&auto=format&fit=crop&q=80',
    tag: '🐼 Pandinha'
  },
  {
    name: 'Ursinho Mel',
    url: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=200&auto=format&fit=crop&q=80',
    tag: '🧸 Fofura'
  },
  {
    name: 'Papelaria Chic',
    url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=200&auto=format&fit=crop&q=80',
    tag: '✏️ Escolar'
  },
  {
    name: 'Lettering Colorido',
    url: 'https://images.unsplash.com/photo-1585336261026-418071839977?w=200&auto=format&fit=crop&q=80',
    tag: '🖊️ Cores'
  },
  {
    name: 'Caderno Mágico',
    url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=200&auto=format&fit=crop&q=80',
    tag: '📒 Notas'
  }
];

export const AvatarEditModal: React.FC<AvatarEditModalProps> = ({
  isOpen,
  onClose,
  user,
  onSaveAvatar,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'preset' | 'url'>('preset');
  const [previewUrl, setPreviewUrl] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setPreviewUrl(user.avatar || '');
      setUrlInput(user.avatar || '');
      setErrorMsg('');
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP).');
      sounds.playPop();
      return;
    }

    // Limit to 4MB for localStorage comfort
    if (file.size > 4 * 1024 * 1024) {
      setErrorMsg('A imagem é muito pesada. Escolha uma foto menor que 4MB.');
      sounds.playPop();
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setPreviewUrl(event.target.result);
        setErrorMsg('');
        sounds.playSuccess();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) {
      setErrorMsg('Cole um link válido de imagem.');
      return;
    }
    setPreviewUrl(urlInput.trim());
    setErrorMsg('');
    sounds.playPop();
  };

  const handleSave = () => {
    if (!previewUrl) {
      setErrorMsg('Escolha ou envie uma foto para salvar!');
      return;
    }
    sounds.playSuccess();
    onSaveAvatar(user.id, previewUrl);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          className="bg-white rounded-3xl border-3 border-pink-300 w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-bold text-lg shadow-inner">
                <Camera className="w-5 h-5 text-yellow-300" />
              </div>
              <div>
                <h3 className="font-display font-black text-base leading-tight">
                  Mudar Foto de Perfil
                </h3>
                <p className="text-[11px] text-pink-100 font-medium">
                  Perfil: <span className="font-bold underline">{user.name}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Current Avatar Big Preview */}
          <div className="bg-pink-50/60 p-4 border-b border-pink-100 flex items-center justify-center gap-4">
            <div className="relative">
              <img
                src={previewUrl || user.avatar}
                alt={user.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
                }}
                className="w-20 h-20 rounded-2xl object-cover border-3 border-pink-400 shadow-md bg-white"
              />
              <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-yellow-950 p-1 rounded-full shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="text-left">
              <span className="text-xs font-bold text-gray-800 block">
                Foto Selecionada
              </span>
              <span className="text-[11px] text-gray-500 block">
                {user.email}
              </span>
              <span className="inline-block mt-1 text-[10px] font-extrabold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                {user.isMaxAdmin ? '👑 Administrador Máximo' : user.role === 'seller' ? 'Vendedora' : 'Estudante'}
              </span>
            </div>
          </div>

          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-3 p-2 bg-gray-50 border-b border-pink-100 gap-1 text-xs font-bold">
            <button
              onClick={() => {
                sounds.playPop();
                setActiveTab('preset');
              }}
              className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'preset'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-200/70'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Avatares</span>
            </button>

            <button
              onClick={() => {
                sounds.playPop();
                setActiveTab('upload');
              }}
              className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-pink-500 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-200/70'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Meu Arquivo</span>
            </button>

            <button
              onClick={() => {
                sounds.playPop();
                setActiveTab('url');
              }}
              className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'url'
                  ? 'bg-pink-500 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-200/70'
              }`}
            >
              <Link className="w-3.5 h-3.5" />
              <span>Link URL</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4 flex-1 overflow-y-auto space-y-3">
            {errorMsg && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {/* TAB: Presets */}
            {activeTab === 'preset' && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-gray-600 block">
                  Escolha um avatar fofinho da galeria HL Vendas:
                </span>
                <div className="grid grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-1">
                  {PRESET_AVATARS.map((item, idx) => {
                    const isCurrent = previewUrl === item.url;
                    return (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => {
                          sounds.playPop();
                          setPreviewUrl(item.url);
                          setErrorMsg('');
                        }}
                        className={`relative rounded-2xl overflow-hidden border-2 p-1 text-center transition-all ${
                          isCurrent
                            ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-400'
                            : 'border-pink-100 hover:border-pink-300 bg-white'
                        }`}
                      >
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-full aspect-square rounded-xl object-cover"
                        />
                        <span className="text-[9px] font-bold text-gray-700 truncate block mt-1">
                          {item.tag}
                        </span>
                        {isCurrent && (
                          <div className="absolute top-1 right-1 bg-purple-600 text-white rounded-full p-0.5 shadow-xs">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: Local Upload */}
            {activeTab === 'upload' && (
              <div className="space-y-3 text-center py-3">
                <label className="border-2 border-dashed border-pink-300 hover:border-pink-500 bg-pink-50/50 hover:bg-pink-100/50 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors block">
                  <Upload className="w-8 h-8 text-pink-500 mb-2 animate-bounce" />
                  <span className="font-display font-black text-sm text-gray-800 block">
                    Clique aqui para selecionar uma foto
                  </span>
                  <span className="text-xs text-gray-500 mt-1 block">
                    Do seu celular ou computador (PNG, JPG, WEBP)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-gray-400">
                  A imagem é salva imediatamente no perfil do usuário no sistema.
                </p>
              </div>
            )}

            {/* TAB: URL Link */}
            {activeTab === 'url' && (
              <div className="space-y-3 py-2">
                <label className="block text-xs font-bold text-gray-700">
                  Link Direto da Imagem na Internet:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://exemplo.com/minha-foto.jpg"
                    className="flex-1 bg-pink-50/50 border border-pink-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-3 py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs rounded-xl transition-colors"
                  >
                    Testar
                  </button>
                </div>
                <p className="text-[11px] text-gray-400">
                  Você pode usar links do Imgur, Unsplash, Pinterest ou redes sociais.
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-gray-50 border-t border-pink-100 flex items-center justify-end gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-600 font-bold text-xs hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-display font-black text-xs shadow-md hover:shadow-lg flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Foto de Perfil</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
