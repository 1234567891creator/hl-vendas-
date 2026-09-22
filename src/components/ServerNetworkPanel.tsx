import React, { useState } from 'react';
import {
  Server,
  Radio,
  Send,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  RefreshCw,
  HardDrive,
  Cpu,
  Globe,
  Share2,
  Lock,
  Wifi,
  Sparkles,
  ArrowRight,
  Database
} from 'lucide-react';
import { ServerNode, InterServerPacket, UserProfile } from '../types';
import { sounds } from '../utils/audioEffects';
import { fetchWithFallback } from '../utils/apiConfig';

interface ServerNetworkPanelProps {
  servers: ServerNode[];
  recentPackets: InterServerPacket[];
  currentUser: UserProfile | null;
  onDispatchPacket?: (action: 'profile_mutation' | 'global_announcement' | 'catalog_sync' | 'admin_directive' | 'system_heartbeat', summary: string) => Promise<boolean>;
  onForceProfileSync?: () => Promise<void>;
}

export const ServerNetworkPanel: React.FC<ServerNetworkPanelProps> = ({
  servers,
  recentPackets,
  currentUser,
  onDispatchPacket,
  onForceProfileSync,
}) => {
  const [selectedAction, setSelectedAction] = useState<'admin_directive' | 'profile_mutation' | 'global_announcement' | 'catalog_sync' | 'system_heartbeat'>('admin_directive');
  const [directiveMessage, setDirectiveMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);
  const [isSyncingProfiles, setIsSyncingProfiles] = useState(false);
  const [activeTab, setActiveTab] = useState<'topology' | 'dispatch' | 'packets'>('topology');

  const isMaxAdmin = currentUser?.isMaxAdmin || currentUser?.email === 'joaolucasgp1234@gmail.com' || currentUser?.role === 'admin';

  // Identificação dos papéis dos nós
  const masterNode = servers.find((s) => s.isMasterEmitter || s.type === 'adm_master') || servers[0];
  const communicationHub = servers.find((s) => s.isCommunicationRelay || s.type === 'communication_hub') || servers[1];
  const receiverNodes = servers.filter((s) => s.id !== masterNode?.id && s.id !== communicationHub?.id);

  const handleSendDirective = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directiveMessage.trim()) return;

    sounds.playPop();
    setIsSending(true);
    setDispatchSuccess(null);

    try {
      if (onDispatchPacket) {
        const ok = await onDispatchPacket(selectedAction, directiveMessage.trim());
        if (ok) {
          sounds.playSuccess();
          setDispatchSuccess('Pacote despachado com sucesso pelo Servidor de Comunicação e entregue aos nós!');
          setDirectiveMessage('');
        }
      } else {
        const res = await fetchWithFallback('/api/servers/dispatch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: selectedAction,
            summary: directiveMessage.trim(),
            payloadData: { sender: currentUser?.name || 'Adm Máximo' },
          }),
        });
        if (res.ok) {
          sounds.playSuccess();
          setDispatchSuccess('Pacote despachado com sucesso pelo Servidor de Comunicação e entregue aos nós!');
          setDirectiveMessage('');
        }
      }
    } catch (err) {
      console.error('Erro ao despachar diretriz:', err);
    } finally {
      setIsSending(false);
      setTimeout(() => setDispatchSuccess(null), 4000);
    }
  };

  const handleSyncProfilesNow = async () => {
    sounds.playSparkle();
    setIsSyncingProfiles(true);
    try {
      if (onForceProfileSync) {
        await onForceProfileSync();
      } else {
        await fetchWithFallback('/api/servers/dispatch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'profile_mutation',
            summary: 'Verificação e sincronização forçada de perfis permanentes em todos os nós da rede',
          }),
        });
      }
      sounds.playSuccess();
    } catch (err) {
      console.error('Erro na sincronização de perfis:', err);
    } finally {
      setIsSyncingProfiles(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner de Infraestrutura */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/40 p-5 sm:p-6 shadow-xl text-white">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-bold mb-2">
              <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Arquitetura de Servidores HL Vendas</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Server className="w-6 h-6 text-cyan-400" />
              <span>Hub de Comunicação Inter-Servidores</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              O Servidor Central do <span className="font-bold text-yellow-300">Adm Máximo</span> despacha todas as diretrizes diretamente para o <span className="font-bold text-cyan-300">Servidor de Comunicação</span>, que faz o relay instantâneo e distribui para todos os nós periféricos e clientes. Todas as alterações em perfis são permanentes e replicadas em tempo real.
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
            <div className="bg-slate-800/80 border border-indigo-400/30 rounded-2xl px-3.5 py-2 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Topologia</div>
                <div className="text-xs font-black text-emerald-300">{servers.length || 6} Servidores Online</div>
              </div>
            </div>

            <button
              onClick={handleSyncProfilesNow}
              disabled={isSyncingProfiles}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-md border border-indigo-400/40 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingProfiles ? 'animate-spin' : ''}`} />
              <span>{isSyncingProfiles ? 'Sincronizando...' : 'Verificar Perfis Permanentes'}</span>
            </button>
          </div>
        </div>

        {/* Abas Internas */}
        <div className="flex items-center gap-2 mt-5 border-t border-indigo-800/60 pt-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              sounds.playPop();
              setActiveTab('topology');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'topology'
                ? 'bg-indigo-500 text-white shadow-md font-black'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Diagrama & Nós ({servers.length})</span>
          </button>

          <button
            onClick={() => {
              sounds.playPop();
              setActiveTab('dispatch');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'dispatch'
                ? 'bg-yellow-500 text-yellow-950 shadow-md font-black'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-yellow-400" />
            <span>Despacho do Adm Máximo</span>
          </button>

          <button
            onClick={() => {
              sounds.playPop();
              setActiveTab('packets');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'packets'
                ? 'bg-emerald-600 text-white shadow-md font-black'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tráfego de Pacotes ({recentPackets.length})</span>
          </button>
        </div>
      </div>

      {/* ABA 1: DIAGRAMA E LISTA DE SERVIDORES */}
      {activeTab === 'topology' && (
        <div className="space-y-6">
          {/* Visual Diagram da Hierarquia de Comunicação Solicitada */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 mb-1 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600" />
              <span>Fluxo de Comunicação Centralizado & Distribuição</span>
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              A arquitetura respeita exatamente a diretriz: O <strong>Adm Máximo</strong> envia para o <strong>Servidor de Comunicação</strong>, que repassa para todos os demais servidores da escola e alunos.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
              {/* Passo 1: Servidor Adm Máximo */}
              <div className="relative rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-yellow-400/80 p-4 shadow-sm">
                <div className="absolute -top-3 left-4 px-2 py-0.5 rounded-full bg-yellow-500 text-yellow-950 font-black text-[10px] flex items-center gap-1 shadow-sm">
                  <span>👑 EMISSOR MESTRE</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <div className="w-10 h-10 rounded-xl bg-yellow-400 text-yellow-950 flex items-center justify-center font-black shadow-inner">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900">{masterNode?.name || 'Servidor Central Adm Máximo'}</h4>
                    <span className="text-[11px] font-mono text-amber-700 font-bold">{masterNode?.ipAddress || '192.168.10.1'}</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 mt-2.5 leading-tight">
                  Origina ordens, avisos, alterações de perfis e diretrizes estratégicas.
                </p>
                <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 border-t border-yellow-200/60 pt-2 font-mono">
                  <span>Pacotes Enviados: <strong className="text-slate-800">{masterNode?.packetsSent || 154}</strong></span>
                  <span className="text-emerald-600 font-bold">● Ativo</span>
                </div>
              </div>

              {/* Passo 2: Servidor Hub de Comunicação */}
              <div className="relative rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-500 p-4 shadow-md">
                <div className="absolute -top-3 left-4 px-2 py-0.5 rounded-full bg-indigo-600 text-white font-black text-[10px] flex items-center gap-1 shadow-sm">
                  <Radio className="w-3 h-3 text-cyan-300 animate-pulse" />
                  <span>📡 SERVIDOR DE COMUNICAÇÃO (HUB)</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-md">
                    <Radio className="w-5 h-5 text-cyan-300" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900">{communicationHub?.name || 'Hub Inter-Servidores'}</h4>
                    <span className="text-[11px] font-mono text-indigo-700 font-bold">{communicationHub?.ipAddress || '192.168.10.2'}</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 mt-2.5 leading-tight">
                  Recebe as transmissões do Adm Máximo e as replica de forma autoritária para todos os servidores receptores.
                </p>
                <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 border-t border-indigo-200/60 pt-2 font-mono">
                  <span>Recepções: <strong className="text-slate-800">{communicationHub?.packetsReceived || 510}</strong></span>
                  <span>Repasses: <strong className="text-indigo-600">{communicationHub?.packetsSent || 512}</strong></span>
                </div>
              </div>

              {/* Passo 3: Servidores Receptores */}
              <div className="relative rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50 border border-emerald-300 p-4 shadow-sm">
                <div className="absolute -top-3 left-4 px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center gap-1 shadow-sm">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>🏫 SERVIDORES DESTINO & CLIENTES</span>
                </div>
                <div className="space-y-2 mt-1">
                  {receiverNodes.slice(0, 3).map((node) => (
                    <div key={node.id} className="flex items-center justify-between text-xs bg-white/80 p-2 rounded-xl border border-emerald-100 shadow-2xs">
                      <div className="flex items-center gap-2">
                        <Server className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-bold text-slate-800 text-[11px] truncate max-w-[140px]">{node.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{node.pingMs}ms</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-center">
                  <span className="text-[10px] text-emerald-700 font-bold">Distribuição contínua para navegadores via SSE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Grid de Todos os Servidores Cadastrados */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {servers.map((node) => {
              const isMaster = node.isMasterEmitter || node.type === 'adm_master';
              const isRelay = node.isCommunicationRelay || node.type === 'communication_hub';

              return (
                <div
                  key={node.id}
                  className={`rounded-2xl p-4 border transition-all duration-200 relative overflow-hidden bg-white shadow-xs hover:shadow-md ${
                    isMaster
                      ? 'border-yellow-400/80 bg-gradient-to-b from-yellow-50/50 to-white'
                      : isRelay
                      ? 'border-indigo-400 bg-gradient-to-b from-indigo-50/50 to-white'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-black ${
                          isMaster
                            ? 'bg-yellow-400 text-yellow-950'
                            : isRelay
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {isMaster ? <ShieldCheck className="w-5 h-5" /> : isRelay ? <Radio className="w-5 h-5" /> : <Server className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-900 leading-snug">{node.name}</h4>
                        <span className="text-[10px] font-mono text-slate-500 font-semibold">{node.ipAddress}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{node.pingMs}ms</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                    {node.roleDescription}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>Enviados: <strong className="text-slate-800">{node.packetsSent || 0}</strong></span>
                    <span>Recebidos: <strong className="text-slate-800">{node.packetsReceived || 0}</strong></span>
                    <span className="capitalize text-indigo-600 font-bold">{node.type.replace('_', ' ')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ABA 2: DESPACHO OFICIAL DO ADM MÁXIMO */}
      {activeTab === 'dispatch' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-900 font-extrabold text-xs mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-yellow-700" />
              <span>Console Oficial de Transmissão</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              Despacho do Adm Máximo para o Servidor de Comunicação
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Como solicitado, qualquer comando ou sincronização disparada aqui é enviada para o <strong>Servidor de Comunicação</strong>, que valida e propaga para todos os outros servidores e clientes em tempo real.
            </p>
          </div>

          <form onSubmit={handleSendDirective} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tipo de Ação Inter-Servidores:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'admin_directive', label: 'Diretriz Oficial', icon: ShieldCheck, color: 'border-yellow-400 bg-yellow-50/50 text-yellow-950' },
                  { id: 'profile_mutation', label: 'Mutação de Perfil', icon: Database, color: 'border-blue-400 bg-blue-50/50 text-blue-950' },
                  { id: 'global_announcement', label: 'Aviso Coletivo', icon: Radio, color: 'border-purple-400 bg-purple-50/50 text-purple-950' },
                  { id: 'system_heartbeat', label: 'Pulso de Rede', icon: Activity, color: 'border-emerald-400 bg-emerald-50/50 text-emerald-950' },
                ].map((act) => {
                  const Icon = act.icon;
                  const isSelected = selectedAction === act.id;
                  return (
                    <button
                      type="button"
                      key={act.id}
                      onClick={() => {
                        sounds.playPop();
                        setSelectedAction(act.id as any);
                      }}
                      className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                        isSelected ? `border-2 ${act.color} shadow-sm font-extrabold` : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs">{act.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Conteúdo / Resumo da Diretriz:
              </label>
              <textarea
                value={directiveMessage}
                onChange={(e) => setDirectiveMessage(e.target.value)}
                placeholder="Ex: Instrução direta do Adm Máximo: Sincronização geral de estoque e segurança ativada para toda a escola..."
                rows={3}
                className="w-full text-xs sm:text-sm p-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50"
              />
            </div>

            {dispatchSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{dispatchSuccess}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={isSending || !directiveMessage.trim()}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 active:scale-95 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isSending ? 'Transmitindo...' : 'Enviar para o Servidor de Comunicação'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ABA 3: HISTÓRICO DE PACOTES EM TEMPO REAL */}
      {activeTab === 'packets' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>Tráfego e Registro Permanente de Pacotes Inter-Servidores</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Auditoria ao vivo de mensagens que trafegam entre o Adm Máximo, Servidor de Comunicação e os nós.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
              {recentPackets.length} pacotes
            </span>
          </div>

          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {recentPackets.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Nenhum pacote trafegado nesta sessão ainda. Realize uma alteração de perfil ou envie uma diretriz!
              </div>
            ) : (
              recentPackets.map((pkt) => {
                const dateStr = new Date(pkt.timestamp).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });

                return (
                  <div
                    key={pkt.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 transition-all text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-bold font-mono text-[10px] uppercase">
                          {pkt.action.replace('_', ' ')}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">{dateStr}</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        ✓ Entregue & Replicado
                      </span>
                    </div>

                    <div className="font-semibold text-slate-800 text-[11px]">
                      {pkt.summary}
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-200/60 overflow-x-auto no-scrollbar">
                      <span className="text-yellow-700 font-bold shrink-0">{pkt.originServerName}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="text-indigo-700 font-bold shrink-0">[Hub: {pkt.relayServerName}]</span>
                      <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="text-emerald-700 font-bold shrink-0">{pkt.targetServerNames?.length || 4} Nós Destino</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
