import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  User, 
  Crown, 
  Key, 
  Smartphone, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  X,
  UserPlus,
  LogIn,
  Upload,
  Eye,
  EyeOff,
  Trash2
} from 'lucide-react';
import { UserProfile } from '../types';
import { detectCurrentDevice } from '../utils/deviceDetector';
import { sounds } from '../utils/audioEffects';

interface ProfileLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  currentUser: UserProfile | null;
  onRegisterUser?: (user: UserProfile) => void;
  onDeleteUser?: (userId: string) => void;
}

export const ProfileLoginModal: React.FC<ProfileLoginModalProps> = ({
  isOpen,
  onClose,
  users,
  onSelectUser,
  currentUser,
  onRegisterUser,
  onDeleteUser,
}) => {
  const [modalTab, setModalTab] = useState<'profiles' | 'credentials' | 'create'>('profiles');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Selected profile to unlock with password
  const [challengeUser, setChallengeUser] = useState<UserProfile | null>(null);
  const [challengePass, setChallengePass] = useState('');
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Create new profile state
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileClass, setNewProfileClass] = useState('7º Ano A');
  const [newProfileEmail, setNewProfileEmail] = useState('');
  const [newProfilePassword, setNewProfilePassword] = useState('');
  const [newProfileAvatar, setNewProfileAvatar] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80');
  const [newProfileIsMaxAdmin, setNewProfileIsMaxAdmin] = useState(false);
  const avatarFileRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const currentDevice = detectCurrentDevice();

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          sounds.playPop();
          setNewProfileAvatar(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNameChange = (val: string) => {
    setNewProfileName(val);
    const normalized = val.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (normalized.includes('joao lucas') || normalized.includes('joaolucas')) {
      setNewProfileIsMaxAdmin(true);
    }
  };

  // Credential Login
  const handleCredentialLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const targetEmail = emailInput.trim().toLowerCase();
    const targetPass = passwordInput.trim();

    const foundUser = users.find((u) => 
      u.email.toLowerCase() === targetEmail || 
      u.name.toLowerCase() === targetEmail
    );

    if (!foundUser) {
      setErrorMsg('Perfil ou e-mail não cadastrado no sistema!');
      sounds.playPop();
      return;
    }

    const isMaxAdminTarget = foundUser.isMaxAdmin || targetEmail === 'joaolucasgp1234@gmail.com';
    const expectedPass = isMaxAdminTarget ? (foundUser.password || 'hlvendas2026') : (foundUser.password || '123');

    if (targetPass !== expectedPass) {
      setErrorMsg('Senha incorreta para este perfil!');
      sounds.playPop();
      return;
    }

    sounds.playFanfare();
    const updatedUser: UserProfile = {
      ...foundUser,
      password: expectedPass,
      deviceLastUsed: `${currentDevice.deviceType} (${currentDevice.os})`,
    };
    onSelectUser(updatedUser);
    onClose();
  };

  // Selected Profile Unlock
  const handleChallengeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeUser) return;

    setErrorMsg('');
    const targetPass = challengePass.trim();
    const isMaxAdminTarget = challengeUser.isMaxAdmin || challengeUser.email.toLowerCase() === 'joaolucasgp1234@gmail.com';
    const expectedPass = isMaxAdminTarget ? (challengeUser.password || 'hlvendas2026') : (challengeUser.password || '123');

    if (targetPass !== expectedPass) {
      setErrorMsg('Senha incorreta para este perfil!');
      sounds.playPop();
      return;
    }

    sounds.playFanfare();
    const updatedUser: UserProfile = {
      ...challengeUser,
      password: expectedPass,
      deviceLastUsed: `${currentDevice.deviceType} (${currentDevice.os})`,
    };
    onSelectUser(updatedUser);
    onClose();
  };

  // Create new profile
  const handleCreateProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!newProfileName.trim()) {
      setErrorMsg('Informe o nome para o perfil!');
      sounds.playPop();
      return;
    }
    if (!newProfilePassword.trim()) {
      setErrorMsg('Defina uma senha para o perfil!');
      sounds.playPop();
      return;
    }

    const generatedEmail = newProfileEmail.trim()
      ? newProfileEmail.trim().toLowerCase()
      : `${newProfileName.toLowerCase().replace(/[^a-z0-9]/g, '')}@aluno.cepmg.br`;

    const isNewMaxAdmin = newProfileIsMaxAdmin || newProfileName.toLowerCase().includes('joão lucas') || newProfileName.toLowerCase().includes('joao lucas');

    const created: UserProfile = {
      id: `user-${Date.now()}`,
      name: newProfileName.trim(),
      email: generatedEmail,
      avatar: newProfileAvatar,
      role: isNewMaxAdmin ? 'superadmin' : 'client',
      isMaxAdmin: isNewMaxAdmin,
      followersCount: 1,
      likesReceived: 0,
      salesCount: 0,
      password: newProfilePassword.trim(),
      schoolClass: newProfileClass,
      permissions: isNewMaxAdmin ? {
        canEditProducts: true,
        canViewOrders: true,
        canEditSchedule: true,
        canPostStatus: true,
        canManageCoupons: true,
        canSendGlobalMessages: true,
        canChatWithClients: true,
        canManageTeam: true,
      } : {
        canEditProducts: false,
        canViewOrders: false,
        canEditSchedule: false,
        canPostStatus: false,
        canManageCoupons: false,
        canSendGlobalMessages: false,
        canChatWithClients: false,
        canManageTeam: false,
      },
      deviceLastUsed: `${currentDevice.deviceType} (${currentDevice.os})`,
      bio: isNewMaxAdmin ? 'Administrador Máximo do HL Vendas no Gilvan Sampaio 👑' : `Estudante da turma ${newProfileClass} - C.E.P.M.G Gilvan Sampaio`,
      createdAt: new Date().toISOString(),
    };

    sounds.playSuccess();
    if (onRegisterUser) {
      onRegisterUser(created);
    } else {
      onSelectUser(created);
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          sounds.playPop();
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md bg-white rounded-3xl border-4 border-pink-300 shadow-2xl overflow-hidden my-auto"
      >
        {/* Close Button X */}
        <button
          type="button"
          onClick={() => {
            sounds.playPop();
            onClose();
          }}
          className="absolute right-3.5 top-3.5 z-20 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white p-5 text-center relative">
          <div className="w-12 h-12 rounded-2xl bg-white/20 mx-auto flex items-center justify-center mb-1 text-2xl font-bold shadow-inner">
            🎀
          </div>
          <h2 className="font-display font-black text-xl text-white">
            HL Vendas • Gilvan Sampaio
          </h2>
          <p className="text-xs text-pink-100 font-medium">
            Gerenciar perfil, trocar conta ou cadastrar novo
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-pink-100 bg-pink-50/60 p-1.5 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              setModalTab('profiles');
              setChallengeUser(null);
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
              modalTab === 'profiles'
                ? 'bg-white text-pink-600 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Perfis ({users.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              setModalTab('create');
              setChallengeUser(null);
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
              modalTab === 'create'
                ? 'bg-white text-pink-600 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Criar Perfil</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              setModalTab('credentials');
              setChallengeUser(null);
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
              modalTab === 'credentials'
                ? 'bg-white text-pink-600 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Login E-mail</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-2xl flex items-start gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: LISTA DE PERFIS COM SENHA */}
          {modalTab === 'profiles' && (
            <div className="space-y-3">
              {!challengeUser ? (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-700 block">
                    Escolha um perfil para entrar (exige a senha):
                  </span>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {users.map((u) => {
                      const isCurrent = currentUser?.id === u.id;
                      const isTargetRoot = u.email?.toLowerCase() === 'joaolucasgp1234@gmail.com' && u.id === 'user-joao-lucas';
                      const isDeletingThis = deletingUserId === u.id;

                      if (isDeletingThis) {
                        return (
                          <div
                            key={u.id}
                            onClick={(e) => e.stopPropagation()}
                            className="p-3 rounded-2xl border-2 border-rose-300 bg-rose-50 flex items-center justify-between gap-2 animate-fadeIn"
                          >
                            <div className="text-left">
                              <span className="font-bold text-xs text-rose-900 block">
                                Apagar conta de {u.name}?
                              </span>
                              <span className="text-[10px] text-rose-700 block">
                                Esta ação não pode ser desfeita.
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  sounds.playPop();
                                  if (onDeleteUser) onDeleteUser(u.id);
                                  setDeletingUserId(null);
                                  if (challengeUser?.id === u.id) setChallengeUser(null);
                                }}
                                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] rounded-xl cursor-pointer shadow-xs"
                              >
                                Sim, apagar
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingUserId(null)}
                                className="px-2 py-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-[11px] rounded-xl cursor-pointer"
                              >
                                Não
                              </button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={u.id}
                          onClick={() => {
                            sounds.playPop();
                            setChallengeUser(u);
                            setChallengePass('');
                            setErrorMsg('');
                          }}
                          className={`p-2.5 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] ${
                            isCurrent
                              ? 'bg-pink-100/70 border-pink-400'
                              : u.isMaxAdmin
                              ? 'bg-amber-50/70 border-amber-300 hover:border-amber-400'
                              : 'bg-pink-50/40 border-pink-200 hover:border-pink-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={u.avatar}
                              alt={u.name}
                              className="w-9 h-9 rounded-xl object-cover border border-pink-300 flex-shrink-0"
                            />
                            <div className="text-left">
                              <div className="font-display font-bold text-xs text-gray-900 flex items-center gap-1">
                                <span>{u.name}</span>
                                {u.isMaxAdmin && <span title="Adm Máximo">👑</span>}
                                {isCurrent && (
                                  <span className="text-[9px] bg-pink-500 text-white px-1.5 py-0.2 rounded-full font-bold">
                                    Atual
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-gray-500 block truncate max-w-[150px]">
                                {u.schoolClass ? `Turma: ${u.schoolClass}` : u.email}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {!isTargetRoot && onDeleteUser && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  sounds.playPop();
                                  setDeletingUserId(u.id);
                                }}
                                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-100 rounded-xl border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                                title={`Apagar conta de ${u.name}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <span className="text-[10px] font-bold text-pink-600 bg-white px-2.5 py-1 rounded-xl border border-pink-200 shadow-2xs flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" />
                              <span>{isCurrent ? 'Logado' : 'Senha'}</span>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleChallengeSubmit} className="space-y-3 bg-purple-50/70 p-4 rounded-2xl border-2 border-purple-200 text-xs">
                  <div className="flex items-center gap-3 pb-2 border-b border-purple-200">
                    <img
                      src={challengeUser.avatar}
                      alt={challengeUser.name}
                      className="w-11 h-11 rounded-xl object-cover border-2 border-purple-400"
                    />
                    <div>
                      <div className="font-display font-bold text-xs sm:text-sm text-gray-900 flex items-center gap-1">
                        <span>{challengeUser.name}</span>
                        {challengeUser.isMaxAdmin && <span>👑</span>}
                      </div>
                      <span className="text-[10px] text-gray-500 block">
                        {challengeUser.email}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-800 mb-1">
                      Digite a senha deste perfil:
                    </label>
                    <input
                      type="password"
                      required
                      autoFocus
                      value={challengePass}
                      onChange={(e) => setChallengePass(e.target.value)}
                      placeholder="Senha do perfil"
                      className="w-full bg-white border border-purple-300 rounded-xl p-2.5 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    {challengeUser.isMaxAdmin && (
                      <span className="text-[10px] text-amber-800 font-bold mt-1 block">
                        👑 Perfil com privilégios de Administrador Máximo
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setChallengeUser(null)}
                      className="flex-1 py-2 bg-white hover:bg-gray-100 text-gray-700 font-bold rounded-xl border border-gray-300 cursor-pointer"
                    >
                      Voltar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                    >
                      Entrar no Perfil
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: CRIAR NOVO PERFIL */}
          {modalTab === 'create' && (
            <form onSubmit={handleCreateProfileSubmit} className="space-y-3 text-xs">
              <input
                type="file"
                ref={avatarFileRef}
                onChange={handleAvatarUpload}
                accept="image/*"
                className="hidden"
              />

              <div className="flex items-center gap-3 p-2 bg-pink-50/40 rounded-2xl border border-pink-200">
                <img
                  src={newProfileAvatar}
                  alt="Avatar"
                  className="w-11 h-11 rounded-2xl object-cover border-2 border-pink-400 shadow-xs"
                />
                <div className="flex-1">
                  <span className="font-bold text-gray-800 block text-[11px]">Foto do Perfil</span>
                  <button
                    type="button"
                    onClick={() => avatarFileRef.current?.click()}
                    className="mt-0.5 text-[10px] text-pink-700 bg-white hover:bg-pink-100 border border-pink-300 px-2 py-0.5 rounded-lg font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Carregar Foto</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={newProfileName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ex: João Lucas ou Amanda"
                  className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Turma / Ano</label>
                  <select
                    value={newProfileClass}
                    onChange={(e) => setNewProfileClass(e.target.value)}
                    className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-2.5 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  >
                    <option value="6º Ano A">6º Ano A</option>
                    <option value="6º Ano B">6º Ano B</option>
                    <option value="7º Ano A">7º Ano A</option>
                    <option value="7º Ano B">7º Ano B</option>
                    <option value="8º Ano A">8º Ano A</option>
                    <option value="8º Ano B">8º Ano B</option>
                    <option value="9º Ano A">9º Ano A</option>
                    <option value="9º Ano B">9º Ano B</option>
                    <option value="1º Ano EM">1º Ano EM</option>
                    <option value="2º Ano EM">2º Ano EM</option>
                    <option value="3º Ano EM">3º Ano EM</option>
                    <option value="Equipe HL">Equipe HL</option>
                    <option value="Visitante">Visitante</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Senha de Acesso *</label>
                  <input
                    type="password"
                    required
                    value={newProfilePassword}
                    onChange={(e) => setNewProfilePassword(e.target.value)}
                    placeholder="Defina a senha"
                    className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>
              </div>

              {/* Opção Adm Máximo quando João Lucas cria */}
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-2.5 space-y-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProfileIsMaxAdmin}
                    onChange={(e) => setNewProfileIsMaxAdmin(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-amber-400"
                  />
                  <span className="font-extrabold text-amber-950 text-xs flex items-center gap-1">
                    <span>👑</span>
                    <span>Definir como Administrador Máximo</span>
                  </span>
                </label>
                <p className="text-[10px] text-amber-800 pl-6 leading-tight">
                  Coloca este perfil como Adm Máximo com poderes totais e coroa dourada 👑.
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-display font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Salvar Perfil e Fazer Login</span>
              </motion.button>
            </form>
          )}

          {/* TAB 3: CREDENTIALS */}
          {modalTab === 'credentials' && (
            <form onSubmit={handleCredentialLogin} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">E-mail ou Nome</label>
                <input
                  type="text"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="joaolucasgp1234@gmail.com"
                  className="w-full bg-pink-50/40 border border-pink-200 rounded-xl p-2.5 font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Senha de Acesso</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Digite sua senha cadastrada"
                    className="w-full bg-pink-50/40 border border-pink-200 rounded-xl pl-3 pr-9 py-2.5 font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white font-display font-black text-xs rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Entrar no HL Vendas</span>
              </motion.button>
            </form>
          )}

          {/* Captured Device Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-2 text-[10px] text-gray-500 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-pink-500 flex-shrink-0" />
            <span className="truncate">
              Dispositivo: <strong>{currentDevice.deviceType} ({currentDevice.os})</strong>
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
