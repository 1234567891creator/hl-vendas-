import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  KeyRound,
  Eye,
  EyeOff,
  GraduationCap,
  Mail,
  Crown,
  Sparkles,
  Check,
  Shield,
  Save,
  RotateCcw
} from 'lucide-react';
import { UserProfile } from '../types';
import { sounds } from '../utils/audioEffects';

interface EditUserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onSaveUser: (updatedUser: UserProfile) => void;
  isMaxAdminViewer?: boolean;
}

export const EditUserProfileModal: React.FC<EditUserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onSaveUser,
  isMaxAdminViewer = true,
}) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [schoolClass, setSchoolClass] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [isMaxAdmin, setIsMaxAdmin] = useState(false);
  const [role, setRole] = useState<'superadmin' | 'seller' | 'client'>('client');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPassword(user.password || '');
      setSchoolClass(user.schoolClass || '');
      setEmail(user.email || '');
      setBio(user.bio || '');
      setIsMaxAdmin(Boolean(user.isMaxAdmin));
      setRole(user.role || 'client');
      setShowPassword(true);
      setSuccessMsg('');
      setErrorMsg('');
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const isTargetRootAccount =
    user.email?.toLowerCase() === 'joaolucasgp1234@gmail.com' && user.id === 'user-joao-lucas';

  const handleGeneratePassword = () => {
    sounds.playPop();
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#';
    let generated = '';
    for (let i = 0; i < 8; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generated);
  };

  const handleSetSimplePassword = () => {
    sounds.playPop();
    setPassword('123456');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('O nome do usuário não pode ficar vazio.');
      sounds.playError();
      return;
    }

    sounds.playSuccess();
    const updatedUser: UserProfile = {
      ...user,
      name: name.trim(),
      password: password.trim(),
      schoolClass: schoolClass.trim() || undefined,
      email: email.trim() || user.email,
      bio: bio.trim(),
      isMaxAdmin: isTargetRootAccount ? true : isMaxAdmin,
      role: isMaxAdmin ? 'superadmin' : role,
      permissions: isMaxAdmin
        ? {
            canEditProducts: true,
            canViewOrders: true,
            canEditSchedule: true,
            canPostStatus: true,
            canManageCoupons: true,
            canSendGlobalMessages: true,
            canChatWithClients: true,
            canManageTeam: true,
          }
        : user.permissions,
    };

    onSaveUser(updatedUser);
    setSuccessMsg('Perfil e credenciais atualizados com sucesso!');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border-4 border-pink-200 overflow-hidden text-gray-800 animate-fadeIn my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white p-4 sm:p-5 relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-white/80 shadow-md"
                referrerPolicy="no-referrer"
              />
              {user.isMaxAdmin && (
                <span
                  className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-950 text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-xs border border-white"
                  title="Adm Máximo"
                >
                  👑
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-display font-black text-base text-white">Editar Perfil</h3>
                <span className="bg-white/20 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  Admin
                </span>
              </div>
              <p className="text-pink-100 text-xs truncate max-w-[240px]">
                Alterando dados e senha de <strong className="text-white">{user.name}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-300 text-rose-800 text-xs p-3 rounded-2xl font-bold">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs p-3 rounded-2xl font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Nome do Usuário */}
          <div>
            <label className="block text-xs font-black text-gray-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-pink-600" />
              <span>Nome do Perfil</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Helena Santos"
              className="w-full bg-pink-50/40 border-2 border-pink-200 focus:border-pink-500 rounded-2xl px-3.5 py-2.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all shadow-2xs"
              required
            />
            <span className="text-[11px] text-gray-500 block mt-1">
              O novo nome aparecerá imediatamente na loja, nos stories, comentários e no chat.
            </span>
          </div>

          {/* Senha de Acesso */}
          <div className="bg-gradient-to-br from-purple-50/60 to-pink-50/60 border-2 border-purple-200 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-purple-600" />
                <span>Senha de Acesso</span>
              </label>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSetSimplePassword}
                  className="text-[10px] font-bold text-purple-700 bg-white hover:bg-purple-100 border border-purple-300 px-2 py-0.5 rounded-lg transition-colors cursor-pointer shadow-2xs"
                  title="Define a senha fácil '123456'"
                >
                  Padrão (123456)
                </button>
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="text-[10px] font-bold text-indigo-700 bg-white hover:bg-indigo-100 border border-indigo-300 px-2 py-0.5 rounded-lg transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
                  title="Gera uma senha aleatória segura"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Gerar</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a nova senha para este perfil"
                className="w-full bg-white border-2 border-purple-300 focus:border-purple-600 rounded-xl px-3 py-2 text-sm font-mono font-bold text-purple-950 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all pr-10 shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-purple-500 hover:text-purple-800 p-1 cursor-pointer"
                title={showPassword ? 'Ocultar senha' : 'Ver senha em texto'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-purple-800 pt-0.5">
              <span>Status atual: <strong>{password ? `Senha: ${password}` : 'Sem senha personalizada'}</strong></span>
              <span className="text-[10px] text-purple-600">O usuário usará esta senha para entrar</span>
            </div>
          </div>

          {/* Turma & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-gray-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                <span>Turma Escolar</span>
              </label>
              <input
                type="text"
                value={schoolClass}
                onChange={(e) => setSchoolClass(e.target.value)}
                placeholder="Ex: 9º B, 8º A..."
                className="w-full bg-gray-50 border border-gray-300 focus:border-purple-500 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-indigo-600" />
                <span>Email / Login</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@escola.com"
                className="w-full bg-gray-50 border border-gray-300 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>

          {/* Cargo & Adm Máximo */}
          {isMaxAdminViewer && !isTargetRootAccount && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3 flex items-center justify-between gap-3">
              <div className="text-left">
                <div className="font-bold text-xs text-amber-950 flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-amber-600" />
                  <span>Definir como Administrador Máximo 👑</span>
                </div>
                <span className="text-[10px] text-amber-800 block">
                  Permite gerenciar produtos, pedidos, sorteios e todos os outros perfis.
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setIsMaxAdmin(!isMaxAdmin);
                  if (!isMaxAdmin) setRole('superadmin');
                }}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs ${
                  isMaxAdmin
                    ? 'bg-amber-600 text-white ring-2 ring-amber-400'
                    : 'bg-white border border-amber-300 text-amber-800 hover:bg-amber-100'
                }`}
              >
                {isMaxAdmin ? 'Sim, é Adm Máximo 👑' : 'Não'}
              </button>
            </div>
          )}

          {/* Biografia */}
          <div>
            <label className="block text-xs font-black text-gray-800 uppercase tracking-wider mb-1">
              Biografia / Recado do Perfil
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              placeholder="Fale sobre este membro ou recado no perfil..."
              className="w-full bg-gray-50 border border-gray-300 focus:border-pink-500 rounded-xl p-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-200"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-black text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
