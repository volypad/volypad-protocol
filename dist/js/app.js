import { REGISTER, linkOf, handleOf, gateCA } from './register.js';

const $ = (s, r = document) => r.querySelector(s);
const RM = matchMedia('(prefers-reduced-motion: reduce)');
const BRAND_LOGO = '/brand/logo-128.png';

/* ---------- icons ---------- */
const X_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>';
const GH_SVG = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"/></svg>';
const COPY_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11"/><path d="M5 15V5h10"/></svg>';
const OK_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5"/></svg>';

/* ---------- helpers ---------- */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : null; };
const DASH = '—';
function fmtPrice(n) {
  if (n == null) return DASH;
  if (n >= 1000) return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (n >= 1) return '$' + n.toFixed(2);
  if (n >= 0.01) return '$' + n.toFixed(4);
  return '$' + n.toPrecision(4).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
}
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 });
const fmtUsd = (n) => (n == null ? DASH : '$' + compact.format(n));
const fmtChg = (n) => (n == null ? DASH : (n > 0 ? '+' : '') + n.toFixed(2) + '%');
const short = (a) => (a ? a.slice(0, 6) + '…' + a.slice(-4) : '');

let toastT;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 1600);
}
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch {
    try {
      const ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
      document.body.append(ta); ta.select(); const ok = document.execCommand('copy'); ta.remove(); return ok;
    } catch { return false; }
  }
}

/* count-up: instant under reduced motion */
function countTo(el, to, fmt, from = 0) {
  if (to == null) { el.textContent = DASH; return; }
  if (RM.matches) { el.textContent = fmt(to); return; }
  const t0 = performance.now(), D = 900;
  const step = (t) => {
    const p = Math.min(1, (t - t0) / D), e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
    el.textContent = fmt(from + (to - from) * e);
    if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(to);
  };
  requestAnimationFrame(step);
  setTimeout(() => { el.textContent = fmt(to); }, D + 150); // final value even if frames are throttled
}

/* ---------- social (always top-right, icon only, both at all breakpoints) ---------- */
(function social() {
  const box = $('#social');
  const xUrl = linkOf(REGISTER.x), xh = handleOf(REGISTER.x);
  box.insertAdjacentHTML('beforeend', xUrl
    ? `<a class="ico" href="${esc(xUrl)}" target="_blank" rel="noopener noreferrer" aria-label="X ${esc(xh)}">${X_SVG}</a>`
    : `<span class="ico inert" role="img" aria-disabled="true" aria-label="X (not available)">${X_SVG}</span>`);
  const gUrl = linkOf(REGISTER.github);
  box.insertAdjacentHTML('beforeend', gUrl
    ? `<a class="ico" href="${esc(gUrl)}" target="_blank" rel="noopener noreferrer" aria-label="GitHub">${GH_SVG}</a>`
    : `<span class="ico inert" role="img" aria-disabled="true" aria-label="GitHub (not available yet)">${GH_SVG}</span>`);
  // footer social: same records, no href when unstated
  const f = $('#fcol-soc');
  f.insertAdjacentHTML('beforeend', xUrl ? `<a href="${esc(xUrl)}" target="_blank" rel="noopener noreferrer">${esc(xh)}</a>` : '<span>X</span>');
  f.insertAdjacentHTML('beforeend', gUrl ? `<a href="${esc(gUrl)}" target="_blank" rel="noopener noreferrer">GitHub</a>` : '<span>GitHub · soon</span>');
})();

/* ---------- network card ---------- */
(function network() {
  const c = REGISTER.chain;
  const rows = [
    ['Chain', esc(c.name)], ['Chain ID', `${c.id} (${c.hex})`], ['Currency', esc(c.currency)],
    ['RPC', `<span>${esc(c.rpc.replace('https://', ''))}</span><button class="cp" type="button" data-copy="${esc(c.rpc)}" aria-label="Copy RPC address">${COPY_SVG}</button>`],
    ['Explorer', `<a href="${esc(c.explorer)}" target="_blank" rel="noopener noreferrer">${esc(c.explorer.replace('https://', ''))}</a>`],
  ];
  $('#netcard').innerHTML = rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
  $('#fcol-net').insertAdjacentHTML('beforeend', `<a href="${esc(c.explorer)}" target="_blank" rel="noopener noreferrer">Explorer</a><button class="cp" style="width:auto;justify-content:start;padding:0;border:0;font-size:14px;min-height:44px;display:flex;place-items:center" type="button" data-copy="${esc(c.rpc)}">Copy RPC</button>`);
  $('#t-chain').textContent = c.name; $('#t-id').textContent = String(c.id);
})();
document.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-copy]'); if (!b) return;
  const ok = await copyText(b.dataset.copy);
  toast(ok ? 'Copied' : 'Copy failed');
  if (ok && b.classList.contains('cp')) { b.classList.add('done'); setTimeout(() => b.classList.remove('done'), 1200); }
});

/* ---------- CA slot (both branches wired) ---------- */
const CA = gateCA();
(function caSlot() {
  const btn = $('#ca'), text = $('#ca-text'), act = $('#ca-act');
  if (CA) {
    btn.dataset.state = 'ready'; text.textContent = CA; act.textContent = 'Copy';
    btn.setAttribute('aria-label', 'Copy contract address ' + CA);
    btn.addEventListener('click', async () => {
      const ok = await copyText(CA);
      act.textContent = ok ? 'Copied' : 'Failed'; btn.classList.toggle('copied', ok); toast(ok ? 'Address copied' : 'Copy failed');
      setTimeout(() => { act.textContent = 'Copy'; btn.classList.remove('copied'); }, 1500);
    });
  } else {
    btn.dataset.state = 'inert'; btn.setAttribute('aria-disabled', 'true'); btn.tabIndex = -1;
    text.textContent = '0x · · · · · · · · · · · · · · · · · · · ·'; act.textContent = 'Soon';
    btn.addEventListener('click', (e) => e.preventDefault());
  }
})();

/* ---------- market ---------- */
const state = { pools: [], sort: 'vol', ever: false, own: null, ownErr: false, rowsByKey: new Map(), dexSeen: false };
const rowsEl = $('#rows');

function logoHTML(url, sym, brand) {
  const letter = esc((sym || '?').trim().charAt(0).toUpperCase() || '?');
  const src = brand ? BRAND_LOGO : url;
  return `<span class="logo" data-letter="${letter}">${src ? `<img src="${esc(src)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : letter}</span>`;
}
document.addEventListener('error', (e) => {
  const im = e.target; if (im.tagName !== 'IMG' || !im.closest('.logo')) return;
  const w = im.closest('.logo'); w.textContent = w.dataset.letter || '?';
}, true);

function skeletonRow(i) {
  const d = document.createElement('div');
  d.className = 'row skel'; d.style.setProperty('--i', i);
  d.innerHTML = `<span class="rk"></span><span class="asset"><span class="logo"></span><i></i></span><span class="c c-p"><i></i></span><span class="c c-g"><i></i></span><span class="c c-v"><i></i></span><span class="c c-l"><i></i></span><span></span>`;
  return d;
}

function rowHTML(m, rank) {
  return `<span class="rk">${rank}</span>
  <span class="asset">${logoHTML(m.logo, m.symbol, m.brand)}<span class="nm"><b>${esc(m.symbol)}</b><small>${esc(m.name)}</small></span></span>
  <span class="c c-p" data-k="price"></span><span class="c c-g" data-k="chg"></span>
  <span class="c c-v" data-l="Turnover" data-k="vol"></span><span class="c c-l" data-l="Depth" data-k="liq"></span>
  <button class="cp" type="button" data-copy="${esc(m.address)}" aria-label="Copy address of ${esc(m.symbol)}" title="Copy address">${COPY_SVG}</button>`;
}
function setCell(row, k, val, fmt, first) {
  const el = row.querySelector(`[data-k=${k}]`); if (!el) return;
  const prev = row._v?.[k]; row._v = row._v || {}; row._v[k] = val;
  if (k === 'chg') { el.classList.toggle('up', val != null && val >= 0); el.classList.toggle('dn', val != null && val < 0); }
  if (first) countTo(el, val, fmt, 0);
  else if (prev !== val) { el.textContent = fmt(val); }
  return prev;
}
function paintRow(row, m, first) {
  const p = setCell(row, 'price', m.price, fmtPrice, first);
  setCell(row, 'chg', m.chg, fmtChg, first);
  setCell(row, 'vol', m.vol, fmtUsd, first);
  setCell(row, 'liq', m.liq, fmtUsd, first);
  if (!first && p != null && m.price != null && p !== m.price) {
    row.dataset.flash = m.price > p ? 'up' : 'down';
    clearTimeout(row._ft); row._ft = setTimeout(() => { delete row.dataset.flash; }, 1500);
  }
}

function sorted(list) {
  const key = { vol: 'vol', chg: 'chg', liq: 'liq' }[state.sort];
  return [...list].sort((a, b) => (b[key] ?? -Infinity) - (a[key] ?? -Infinity));
}

function ownModel() {
  if (!CA) return null;
  const o = state.own;
  return { key: 'own', brand: true, symbol: o?.symbol || short(CA), name: o?.name || 'Our asset', address: CA,
    price: o?.price ?? null, chg: o?.chg ?? null, vol: o?.vol ?? null, liq: o?.liq ?? null };
}

function renderBoard() {
  const frag = [];
  // row #1: own asset
  let ownRow = state.rowsByKey.get('own');
  const om = ownModel();
  if (!CA) {
    if (!ownRow) {
      ownRow = document.createElement('div'); ownRow.className = 'row own ph'; ownRow.style.setProperty('--i', 0);
      ownRow.innerHTML = `<span class="rk">1</span><span class="asset">${logoHTML(null, 'V', true)}<span class="nm"><b>VOLYPAD</b><small>Awaiting address</small></span></span>
      <span class="c c-p ph-dots">· · · · ·</span><span class="c c-g ph-dots">· · · · ·</span><span class="c c-v ph-dots">· · · · ·</span><span class="c c-l ph-dots">· · · · ·</span><span></span>`;
      state.rowsByKey.set('own', ownRow);
    }
  } else {
    if (!ownRow || ownRow.classList.contains('ph')) {
      ownRow = document.createElement('div'); ownRow.className = 'row own'; ownRow.style.setProperty('--i', 0);
      ownRow.innerHTML = rowHTML(om, 1); state.rowsByKey.set('own', ownRow); paintRow(ownRow, om, true);
    } else {
      ownRow.querySelector('.asset b').textContent = om.symbol; ownRow.querySelector('.asset small').textContent = om.name;
      paintRow(ownRow, om, false);
    }
  }
  frag.push(ownRow);

  // rows 2..: trending (market source only), minus own token if deduped
  const list = sorted(state.pools).filter((m) => !(CA && m.token && m.token.toLowerCase() === CA.toLowerCase()));
  const keep = new Set(['own']);
  list.forEach((m, i) => {
    keep.add(m.key);
    let r = state.rowsByKey.get(m.key);
    if (!r || r.classList.contains('skel')) {
      r = document.createElement('div'); r.className = 'row'; r.innerHTML = rowHTML(m, i + 2);
      r.style.setProperty('--i', i + 1); state.rowsByKey.set(m.key, r); paintRow(r, m, true);
    } else { r.querySelector('.rk').textContent = i + 2; paintRow(r, m, false); }
    frag.push(r);
  });
  for (const [k, r] of state.rowsByKey) if (!keep.has(k)) { r.remove(); state.rowsByKey.delete(k); }
  rowsEl.replaceChildren(...frag);
}

function showSkeleton() {
  const f = [];
  for (let i = 0; i < 11; i++) f.push(skeletonRow(i));
  rowsEl.replaceChildren(...f);
}
/* tabs */
document.querySelectorAll('.tabs [role=tab]').forEach((t) => t.addEventListener('click', () => {
  document.querySelectorAll('.tabs [role=tab]').forEach((x) => x.setAttribute('aria-selected', String(x === t)));
  state.sort = t.dataset.sort;
  if (state.pools.length) renderBoard();
}));

/* ---------- ticker ---------- */
function renderTicker() {
  const track = $('#ticker-track');
  if (!state.pools.length) return;
  const items = sorted(state.pools).map((m) => `<span class="tk"><b>${esc(m.symbol)}</b><span class="px">${fmtPrice(m.price)}</span><span class="${m.chg != null && m.chg < 0 ? 'dn' : 'up'}">${m.chg != null && m.chg < 0 ? '▼' : '▲'} ${fmtChg(m.chg)}</span></span>`).join('');
  track.innerHTML = items + items;
}
function tickerSkeleton() {
  $('#ticker-track').innerHTML = Array.from({ length: 12 }, () => '<span class="tk sk"><i></i></span>').join('');
}

/* ---------- status / tiles ---------- */
function setPill(s, text) { const p = $('#pill'); p.dataset.s = s; $('#pill-text').textContent = text; }
function updateTiles() {
  const pools = state.pools;
  const t = $('#t-pools'), v = $('#t-vol');
  if (!pools.length) { t.textContent = DASH; v.textContent = DASH; return; }
  const total = pools.reduce((a, m) => a + (m.vol || 0), 0);
  countTo(t, pools.length, (n) => String(Math.round(n)));
  countTo(v, total, fmtUsd, state.lastTotal || 0); state.lastTotal = total;
}

/* ---------- fetching with exponential backoff ---------- */
async function fetchJSON(url, tries = 3) {
  let delay = 800, last;
  for (let i = 0; i < tries; i++) {
    try {
      const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 12000);
      const r = await fetch(url, { headers: { accept: 'application/json' }, signal: ctl.signal }); clearTimeout(to);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return await r.json();
    } catch (e) { last = e; if (i < tries - 1) { await new Promise((res) => setTimeout(res, delay)); delay *= 2; } }
  }
  throw last;
}

async function loadMarket() {
  const rec = REGISTER.market; if (rec.state !== 'stated') return false;
  const json = await fetchJSON(rec.url + '?include=base_token');
  const tokens = new Map((json.included || []).filter((i) => i.type === 'token').map((i) => [i.id, i.attributes]));
  const pools = (json.data || []).map((p) => {
    const a = p.attributes, baseId = p.relationships?.base_token?.data?.id, tk = tokens.get(baseId) || {};
    const addr = tk.address || (baseId ? baseId.split('_').pop() : p.attributes.address);
    const sym = tk.symbol || (a.name || '?').split(' / ')[0];
    const img = tk.image_url && !/missing/i.test(tk.image_url) ? tk.image_url : null;
    return { key: p.id, token: addr, address: addr, symbol: sym, name: tk.name || a.name, logo: img,
      price: num(a.base_token_price_usd), chg: num(a.price_change_percentage?.h24), vol: num(a.volume_usd?.h24), liq: num(a.reserve_in_usd) };
  }).sort((x, y) => (y.vol ?? -1) - (x.vol ?? -1)).slice(0, 10);
  if (!pools.length) throw new Error('empty');
  state.pools = pools; return true;
}

async function loadOwn() {
  if (!CA || REGISTER.ownSource.state !== 'stated') return;
  try {
    const json = await fetchJSON(REGISTER.ownSource.url.replace('{CA}', CA));
    const pairs = (json.pairs || []).slice().sort((a, b) => (num(b.volume?.h24) ?? 0) - (num(a.volume?.h24) ?? 0));
    const p = pairs[0];
    if (!p) { state.ownErr = false; return; }
    state.own = { symbol: p.baseToken?.symbol, name: p.baseToken?.name, price: num(p.priceUsd), chg: num(p.priceChange?.h24), vol: num(p.volume?.h24), liq: num(p.liquidity?.usd) };
    state.ownErr = false;
  } catch { state.ownErr = true; /* keep last good state.own */ }
}

let busy = false, timer = null, fails = 0;
async function refresh() {
  if (busy) return; busy = true;
  try {
    await Promise.all([
      loadMarket().then(() => { fails = 0; state.ever = true; }).catch(() => { fails++; }),
      loadOwn(),
    ]);
    if (fails > 0 && !state.ever) {
      setPill('error', 'Source offline'); $('#b-err').hidden = false;
      $('#b-err').textContent = '— Market source unreachable. Retrying every minute.';
      if (!rowsEl.querySelector('.row:not(.skel)')) { /* keep dashes visible */ markDash(); }
    } else if (fails > 0) {
      setPill('error', 'Stale · retrying'); $('#b-err').hidden = false;
      $('#b-err').textContent = '— Market source unreachable. Showing the last good data.';
    } else {
      setPill('ok', 'Streaming'); $('#b-err').hidden = true;
    }
    if (state.ever) { renderBoard(); renderTicker(); updateTiles(); }
    else if (CA) renderBoard();
  } finally { busy = false; schedule(); }
}
function markDash() {
  rowsEl.querySelectorAll('.skel').forEach((r) => {
    r.classList.remove('skel');
    r.querySelectorAll('.c').forEach((c) => { c.innerHTML = DASH; });
    r.querySelectorAll('.logo').forEach((l) => { l.style.animation = 'none'; });
  });
  $('#ticker-track').innerHTML = '<span class="tk"><b>—</b><span class="px">source offline</span></span>';
}
function schedule() {
  clearTimeout(timer);
  if (document.hidden) return; // paused while hidden
  timer = setTimeout(refresh, 60000);
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) clearTimeout(timer); else refresh();
});

/* ---------- scroll: progress, parallax, reveal, spotlight ---------- */
const bar = $('#progress');
const layers = [...document.querySelectorAll('.layer')];
let ticking = false;
function onScroll() {
  if (ticking) return; ticking = true;
  requestAnimationFrame(() => {
    const h = document.documentElement.scrollHeight - innerHeight, y = scrollY;
    bar.style.transform = `scaleX(${h > 0 ? Math.min(1, y / h) : 0})`;
    if (!RM.matches && y < innerHeight * 1.5) layers.forEach((l) => { l.style.transform = `translate3d(${px * 14 * Number(l.dataset.depth)}px,${y * Number(l.dataset.depth) + py * 10 * Number(l.dataset.depth)}px,0)`; });
    ticking = false;
  });
}
let px = 0, py = 0;
addEventListener('pointermove', (e) => { if (RM.matches) return; px = e.clientX / innerWidth - .5; py = e.clientY / innerHeight - .5; onScroll(); }, { passive: true });
addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); onScroll();

const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.setProperty('--d', String(el.parentElement.classList.contains('tiles') || el.parentElement.classList.contains('cards') ? [...el.parentElement.children].indexOf(el) : 0));
  if (RM.matches) el.classList.add('in'); else io.observe(el);
});

document.addEventListener('pointermove', (e) => {
  const t = e.target.closest?.('.spot, .row'); if (!t) return;
  const r = t.getBoundingClientRect();
  t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px');
}, { passive: true });

/* ---------- boot ---------- */
tickerSkeleton();
if (!CA) {
  renderBoard(); // builds the brand-logo placeholder as row #1
  rowsEl.append(...Array.from({ length: 10 }, (_, i) => skeletonRow(i + 1)));
} else {
  showSkeleton();
}
setPill('wait', 'Syncing');
refresh();
