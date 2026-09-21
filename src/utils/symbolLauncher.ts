import { CustomSymbol, UserProfile, SymbolLaunchEvent } from '../types';
import { sounds } from './audioEffects';

/**
 * Dispara um símbolo na tela com a foto de perfil de quem enviou,
 * durando exatamente 2 segundos.
 */
export function launchSymbolReaction(symbol: CustomSymbol, user?: UserProfile | null) {
  try {
    sounds.playSparkle();
  } catch {}

  const launchDetail: SymbolLaunchEvent = {
    id: `launch-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    symbol,
    senderName: user?.name || 'Estudante do Gilvan',
    senderAvatar: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    senderRole: user?.role === 'superadmin' ? 'Adm Máximo' : user?.role === 'seller' ? 'Vendedora' : 'Estudante',
    timestamp: Date.now(),
    durationSeconds: 2, // Exatamente 2 segundos
  };

  const event = new CustomEvent('hl_launch_symbol', {
    detail: launchDetail,
  });

  window.dispatchEvent(event);
}
