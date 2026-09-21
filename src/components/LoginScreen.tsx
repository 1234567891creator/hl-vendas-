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
  MapPin,
  Clock,
  GraduationCap,
  Upload,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  Trash2
} from 'lucide-react';
import { UserProfile } from '../types';
import { detectCurrentDevice } from '../utils/deviceDetector';
import { sounds } from '../utils/audioEffects';

interface LoginScreenProps {
  users: UserProfile[];
  onLogin: (user: UserProfile) => void;
  onRegisterUser?: (user: UserProfile) => void;
  onExploreAsGuest?: () => void;
  onDeleteUser?: (userId: string) => void;
  pickupLocation?: string;
  pickupSchedule?: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  users,
  onLogin,
  onRegisterUser,
  onExploreAsGuest,
  onDeleteUser,
  pickupLocation = 'Na porta do C.E.P.M.G Gilvan Sampaio',
  pickupSchedule = 'Toda Segunda e Terça às 15:30',
}) => {
  const [tab, setTab] = useState<'login' | 'register' | 'switch_profile'>('login');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Selected profile for password challenge
  const [selectedUserForLogin, setSelectedUserForLogin] = useState<UserProfile | null>(null);
  const [profilePasswordPrompt, setProfilePasswordPrompt] = useState('');
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regClass, setRegClass] = useState('7º Ano A');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAvatar, setRegAvatar] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80');
  const [regIsMaxAdmin, setRegIsMaxAdmin] = useState(false);
  const avatarFileRef = useRef<HTMLInputElement | null>(null);

  const currentDevice = detectCurrentDevice();

  // Se o nome contiver "João Lucas" ou "joao lucas", sugere/marca Adm Máximo
  const handleRegNameChange = (name: string) => {
    setRegName(name);
    const normalized = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (normalized.includes('joao lucas') || normalized.includes('joaolucas')) {
      setRegIsMaxAdmin(true);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          sounds.playPop();
          setRegAvatar(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Login normal com credenciais
  const handleCredentialLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const targetEmail = loginEmail.trim().toLowerCase();
    const targetPass = loginPassword.trim();

    const foundUser = users.find((u) => 
      u.email.toLowerCase() === targetEmail || 
      u.name.toLowerCase() === targetEmail
    );

    if (!foundUser) {
      setErrorMsg('Perfil ou e-mail não encontrado no sistema!');
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
    onLogin(updatedUser);
  };

  // Login a partir de perfil selecionado na lista (PEDE SENHA SEMPRE!)
  const handleProfilePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForLogin) return;

    setErrorMsg('');
    const targetPass = profilePasswordPrompt.trim();
    const isMaxAdminTarget = selectedUserForLogin.isMaxAdmin || selectedUserForLogin.email.toLowerCase() === 'joaolucasgp1234@gmail.com';
    const expectedPass = isMaxAdminTarget ? (selectedUserForLogin.password || 'hlvendas2026') : (selectedUserForLogin.password || '123');

    if (targetPass !== expectedPass) {
      setErrorMsg('Senha incorreta para este perfil!');
      sounds.playPop();
      return;
    }

    sounds.playFanfare();
    const updatedUser: UserProfile = {
      ...selectedUserForLogin,
      password: expectedPass,
      deviceLastUsed: `${currentDevice.deviceType} (${currentDevice.os})`,
    };
    onLogin(updatedUser);
  };

  // Criar Novo Perfil
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!regName.trim()) {
      setErrorMsg('Por favor, informe seu nome!');
      sounds.playPop();
      return;
    }
    if (!regPassword.trim()) {
      setErrorMsg('Por favor, defina uma senha de acesso!');
      sounds.playPop();
      return;
    }

    const generatedEmail = regEmail.trim() 
      ? regEmail.trim().toLowerCase() 
      : `${regName.toLowerCase().replace(/[^a-z0-9]/g, '')}@aluno.cepmg.br`;

    // Verifica se já existe email
    const existing = users.find((u) => u.email.toLowerCase() === generatedEmail);
    if (existing) {
      setErrorMsg('Este e-mail já está em uso por outro perfil!');
      sounds.playPop();
      return;
    }

    sounds.playSuccess();
    const isNewMaxAdmin = regIsMaxAdmin || regName.toLowerCase().includes('joão lucas') || regName.toLowerCase().includes('joao lucas');

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: regName.trim(),
      email: generatedEmail,
      avatar: regAvatar,
      role: isNewMaxAdmin ? 'superadmin' : 'client',
      isMaxAdmin: isNewMaxAdmin,
      followersCount: 1,
      likesReceived: 0,
      salesCount: 0,
      password: regPassword.trim(),
      schoolClass: regClass,
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
      bio: isNewMaxAdmin ? 'Administrador Máximo do HL Vendas no Gilvan Sampaio 👑' : `Estudante da turma ${regClass} - C.E.P.M.G Gilvan Sampaio`,
      createdAt: new Date().toISOString(),
    };

    if (onRegisterUser) {
      onRegisterUser(newUser);
    } else {
      onLogin(newUser);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-purple-100 flex flex-col items-center justify-center p-3 sm:p-6 selection:bg-pink-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl border-4 border-pink-300 shadow-2xl overflow-hidden my-auto"
      >
        {/* Header with School Delivery Point */}
        <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white p-5 sm:p-6 text-center relative overflow-hidden">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-white/20 mx-auto flex items-center justify-center text-3xl font-bold shadow-inner mb-2">
            🎀
          </div>
          
          <h1 className="font-display font-black text-xl sm:text-2xl text-white tracking-tight">
            HL Vendas • Gilvan Sampaio
          </h1>
          <p className="text-xs text-pink-100 font-bold mt-0.5">
            Cadastre-se ou entre com seu perfil e senha
          </p>
          
          <div className="mt-2.5 bg-white/20 backdrop-blur-xs rounded-2xl p-2 text-left text-xs text-pink-50 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <MapPin className="w-3.5 h-3.5 text-yellow-300 flex-shrink-0" />
              <span>{pickupLocation}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-pink-100">
              <Clock className="w-3.5 h-3.5 text-yellow-300 flex-shrink-0" />
              <span>{pickupSchedule}</span>
            </div>
          </div>
        </div>

        {/* 3 Tabs: Entrar, Criar Perfil, Trocar Perfil */}
        <div className="flex border-b border-pink-100 bg-pink-50/60 p-1.5 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              setTab('login');
              setSelectedUserForLogin(null);
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
              tab === 'login'
                ? 'bg-white text-pink-600 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Entrar</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              setTab('register');
              setSelectedUserForLogin(null);
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
              tab === 'register'
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
              setTab('switch_profile');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
              tab === 'switch_profile'
                ? 'bg-white text-pink-600 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Perfis ({users.length})</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-2xl flex items-start gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN COM E-MAIL E SENHA */}
          {tab === 'login' && (
            <form onSubmit={handleCredentialLogin} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  E-mail ou Nome do Usuário
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Ex: joaolucasgp1234@gmail.com ou seu nome"
                    className="w-full bg-pink-50/40 border border-pink-200 rounded-xl pl-9 pr-3 py-2.5 font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Senha de Acesso
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Digite sua senha cadastrada"
                    className="w-full bg-pink-50/40 border border-pink-200 rounded-xl pl-9 pr-9 py-2.5 font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:to-rose-700 text-white font-display font-black text-xs rounded-2xl shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Entrar no HL Vendas</span>
              </motion.button>
            </form>
          )}

          {/* TAB 2: CRIAR NOVO PERFIL */}
          {tab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              <input
                type="file"
                ref={avatarFileRef}
                onChange={handleAvatarUpload}
                accept="image/*"
                className="hidden"
              />

              {/* Avatar Selector */}
              <div className="flex items-center gap-3 p-2 bg-pink-50/40 rounded-2xl border border-pink-200">
                <img
                  src={regAvatar}
                  alt="Avatar"
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-pink-400 shadow-xs"
                />
                <div className="flex-1">
                  <span className="font-bold text-gray-800 block text-[11px]">Sua Foto de Perfil</span>
                  <button
                    type="button"
                    onClick={() => avatarFileRef.current?.click()}
                    className="mt-1 text-[10px] text-pink-700 bg-white hover:bg-pink-100 border border-pink-300 px-2 py-0.5 rounded-lg font-bold inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Carregar Foto do Aparelho</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Seu Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => handleRegNameChange(e.target.value)}
                  placeholder="Ex: João Lucas ou Amanda Santos"
                  className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Turma / Ano</label>
                  <select
                    value={regClass}
                    onChange={(e) => setRegClass(e.target.value)}
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
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Crie uma senha"
                    className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">E-mail (Opcional)</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="Seu e-mail (opcional)"
                  className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              {/* Checkbox para João Lucas colocar como Adm Máximo */}
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3 space-y-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={regIsMaxAdmin}
                    onChange={(e) => setRegIsMaxAdmin(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-amber-400"
                  />
                  <span className="font-extrabold text-amber-950 text-xs flex items-center gap-1">
                    <span>👑</span>
                    <span>Definir como Administrador Máximo</span>
                  </span>
                </label>
                <p className="text-[10px] text-amber-800 pl-6 leading-tight">
                  Marque para conceder poderes totais ao perfil criado pelo João Lucas (acesso ao Painel, Coroa Dourada e Gerenciamento).
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-display font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Salvar Perfil e Entrar</span>
              </motion.button>
            </form>
          )}

          {/* TAB 3: PERFIS CADASTRADOS (EXIGE SENHA PARA QUALQUER UM!) */}
          {tab === 'switch_profile' && (
            <div className="space-y-3">
              {!selectedUserForLogin ? (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-700 block">
                    Escolha seu perfil cadastrado (exige senha para acessar):
                  </span>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {users.map((u) => {
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
                                  if (selectedUserForLogin?.id === u.id) setSelectedUserForLogin(null);
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
                            setSelectedUserForLogin(u);
                            setProfilePasswordPrompt('');
                            setErrorMsg('');
                          }}
                          className={`p-3 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] ${
                            u.isMaxAdmin
                              ? 'bg-amber-50/80 border-amber-300 hover:border-amber-400'
                              : 'bg-pink-50/40 border-pink-200 hover:border-pink-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={u.avatar}
                              alt={u.name}
                              className="w-10 h-10 rounded-xl object-cover border border-pink-300 flex-shrink-0"
                            />
                            <div className="text-left">
                              <div className="font-display font-bold text-xs text-gray-900 flex items-center gap-1">
                                <span>{u.name}</span>
                                {u.isMaxAdmin && <span title="Adm Máximo">👑</span>}
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
                                title={`Apagar perfil de ${u.name}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <span className="text-[10px] font-bold text-pink-600 bg-white px-2.5 py-1 rounded-xl border border-pink-200 shadow-2xs flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" />
                              <span>Digitar Senha</span>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleProfilePasswordSubmit} className="space-y-3 bg-purple-50/60 p-4 rounded-2xl border-2 border-purple-200 text-xs">
                  <div className="flex items-center gap-3 pb-2 border-b border-purple-200">
                    <img
                      src={selectedUserForLogin.avatar}
                      alt={selectedUserForLogin.name}
                      className="w-12 h-12 rounded-xl object-cover border-2 border-purple-400"
                    />
                    <div>
                      <div className="font-display font-bold text-sm text-gray-900 flex items-center gap-1">
                        <span>{selectedUserForLogin.name}</span>
                        {selectedUserForLogin.isMaxAdmin && <span>👑</span>}
                      </div>
                      <span className="text-[11px] text-gray-500 block">
                        {selectedUserForLogin.email}
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
                      value={profilePasswordPrompt}
                      onChange={(e) => setProfilePasswordPrompt(e.target.value)}
                      placeholder="Senha do perfil"
                      className="w-full bg-white border border-purple-300 rounded-xl p-2.5 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedUserForLogin(null)}
                      className="flex-1 py-2 bg-white hover:bg-gray-100 text-gray-700 font-bold rounded-xl border border-gray-300"
                    >
                      Voltar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs"
                    >
                      Entrar
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Botão de Convidado / Espiar Catálogo */}
          <div className="pt-2 border-t border-pink-100 flex flex-col items-center gap-2">
            {onExploreAsGuest && (
              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  onExploreAsGuest();
                }}
                className="text-xs text-purple-700 hover:text-purple-900 font-extrabold py-1.5 px-3 rounded-xl hover:bg-purple-50 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>✨ Olhar Catálogo como Visitante (Sem Login)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Captured Device Info */}
            <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 text-[10px] text-gray-500 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-pink-500 flex-shrink-0" />
              <span className="truncate">
                Dispositivo: <strong>{currentDevice.deviceType} ({currentDevice.os})</strong>
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
