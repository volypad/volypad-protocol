// Register pattern: every external fact is exactly one record with a state.
// state: 'stated' | 'absent' | 'unconfirmed'
export const REGISTER = {
  chain: {
    state: 'stated',
    name: 'Elysium',
    id: 99901,
    hex: '0x1863d',
    currency: 'HYPE',
    rpc: 'https://rpc.elysium.kinetiq.xyz',
    explorer: 'https://explorer.elysium.kinetiq.xyz',
  },
  // Contract address: not announced. Set value to a 0x address and state to 'stated'.
  ca: { state: 'absent', value: null },
  x: { state: 'stated', url: 'https://x.com/volypad' },
  github: { state: 'absent', url: null },
  market: {
    state: 'stated',
    url: 'https://api.geckoterminal.com/api/v2/networks/elysium/trending_pools',
  },
  ownSource: {
    state: 'stated',
    url: 'https://api.dexscreener.com/latest/dex/tokens/{CA}',
  },
};

// Link rule: store URL, derive handle. No href for unstated records.
export function linkOf(rec) {
  return rec.state === 'stated' && rec.url ? rec.url : null;
}
export function handleOf(rec) {
  const u = linkOf(rec);
  if (!u) return null;
  try {
    const seg = new URL(u).pathname.split('/').filter(Boolean)[0];
    return seg ? '@' + seg : null;
  } catch { return null; }
}

// Gate: a value is accepted when it is a well-formed 0x address (40 hex chars).
// Valid 0x hex is never rejected; anything else keeps the slot inert (unconfirmed).
const EVM = /^0x[0-9a-fA-F]{40}$/;
export function gateCA(rec = REGISTER.ca) {
  if (rec.state !== 'stated' || typeof rec.value !== 'string') return null;
  const v = rec.value.trim();
  return EVM.test(v) ? v : null;
}
