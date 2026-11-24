// सपनों का घर: a lyric film in the Swiss Motion Graphics style. 1080×1920, render(t) is deterministic.
import { E, snap, lin, seg, lerp, clamp, BEAT, E8, E16, nb } from './ease.js';

const W = 1080, H = 1920, DUR = 87.19;
const C = { page: '#EAE9E5', ink: '#111111', g1: '#C9C7C1', g2: '#DAD8D2', g3: '#8E8C86', red: '#E30613' };
const MX = 72, GUT = 24, COLW = (W - 2 * MX - 5 * GUT) / 6;           // 6-column page grid
const fx = i => MX + i * (COLW + GUT);
// artifact grid: 8 × 8 modules of 108 px, ground line at y = 1704
const M = 108, AX = 108, GY = 1704;
const cellX = c => AX + c * M, cellY = r => GY - (r + 1) * M;
const WIN = [4, 1];                                                     // the window: where the red block lives

const cv = document.getElementById('c'), g = cv.getContext('2d');
await Promise.all(['400', '500', '600', '700'].map(w => document.fonts.load(`${w} 60px Hind`, 'सपनों का घर')));
const LY = await (await fetch('lyrics.json')).json();
LY.forEach((L, i) => { L.t0 = L.ta[0]; L.next = i + 1 < LY.length ? LY[i + 1].ta[0] : 73.0; L.out = Math.max(L.tb[L.tb.length - 1] + 1.2, L.next - E8); });
LY[3].out = 43.2; LY[7].out = 73.0;

// ---------------------------------------------------------------- times
const T = {
  build: nb(12.3), cut: 32.78, leak: 34.42, fall: 38.6, chair: nb(43.66), tags: [51.66, 52.68, 53.5, 54.08],
  ledger: nb(57.64), back: 61.2, sold: [66.08, 67.12, 68.38, 69.06], home: 73.3, ghost: nb(72.4), title: nb(76.3), end: DUR,
};

// ---------------------------------------------------------------- blocks
// a block: keys [[t_arrive, col, row, dur]], born (wipe in), cut (knife + collapse), out (pushed off right)
const house = [];
for (let r = 0; r < 3; r++) for (let c = 1; c <= 6; c++) if (!(c === 2 && r < 2) && !(c === WIN[0] && r === WIN[1])) house.push([c, r]);
for (let c = 0; c <= 7; c++) house.push([c, 3]);
for (let c = 2; c <= 5; c++) house.push([c, 4]);
for (let c = 3; c <= 4; c++) house.push([c, 5]);
const BL = house.map(([c, r], i) => ({ id: i, keys: [[0, c, r, 0]], born: T.build + i * BEAT, cut: r >= 4 ? T.cut : null, out: null }));
const alive = BL.filter(b => b.cut == null);                            // 23 blocks survive the roof cut

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const at = (b, t) => { let k = b.keys[0]; for (const x of b.keys) if (x[0] - x[3] <= t) k = x; return k; };
// re-flow every surviving block into new slots; arrivals two per sixteenth, nearest to the cause first
function reflow(t0, slots, cause, dur) {
  const from = alive.map(b => ({ b, p: at(b, 1e9).slice(1, 3) }));
  from.sort((u, v) => u.p[1] - v.p[1] || u.p[0] - v.p[0]);
  const sl = slots.slice().sort((u, v) => u[1] - v[1] || u[0] - v[0]);
  const pair = from.map((u, i) => ({ b: u.b, s: sl[i] }));
  pair.sort((u, v) => dist(u.s, cause) - dist(v.s, cause));
  pair.forEach((u, k) => u.b.keys.push([t0 + Math.floor(k / 2) * E16 + dur, u.s[0], u.s[1], dur]));
}
const slotsFall = []; for (let i = 0; i < 23; i++) slotsFall.push([i % 8, Math.floor(i / 8)]);
reflow(T.fall, slotsFall, WIN, E8);
const slotsChair = [];
for (let r = 0; r <= 7; r++) slotsChair.push([1, r]);
for (let r = 5; r <= 7; r++) slotsChair.push([2, r]);
for (let c = 2; c <= 6; c++) slotsChair.push([c, 3], [c, 2]);
slotsChair.push([6, 0], [6, 1]);
reflow(T.chair, slotsChair, [4, 3], BEAT);
const LROWS = [[6, 6], [4, 6], [2, 6], [0, 5]];                         // ledger: [row, width], cols from 1
const slotsLedger = []; LROWS.forEach(([r, w]) => { for (let c = 1; c <= w; c++) slotsLedger.push([c, r]); });
reflow(T.ledger, slotsLedger, [1, 6], BEAT);
LROWS.forEach(([r], i) => alive.forEach(b => { if (at(b, 1e9)[2] === r) b.out = T.sold[i]; }));

// the red block: the only exception. linear, unsnapped. path keys [t, col, row]
const RED = [[0, 4, 1], [T.leak, 4, 1], [35.45, 5.37, 2.18], [35.95, 5.37, 2.18], [37.4, 10.2, 7.6],
  [T.back, 9.6, 0], [62.7, 6, 0], [T.home, 6, 0], [75.0, 4, 1]];
function redPos(t) {
  for (let i = 1; i < RED.length; i++) if (t < RED[i][0]) { const a = RED[i - 1], b = RED[i], p = lin(t, a[0], b[0]); return [lerp(a[1], b[1], p), lerp(a[2], b[2], p)]; }
  return RED[RED.length - 1].slice(1);
}

// ---------------------------------------------------------------- camera (artifact zone only)
const CAM = [[0, 1], [nb(16.32), 1.22, BEAT], [nb(23.64), 1, BEAT], [nb(34.42), .9, BEAT], [T.chair, 1, BEAT], [nb(79.0), 1.28, BEAT * 2]];
function camS(t) { let v = CAM[0][1]; for (let i = 1; i < CAM.length; i++) { const [t1, v1, d] = CAM[i]; if (t < t1 - d) break; v = lerp(v, v1, snap(t, t1, d)); } return v; }
const ANCH = [cellX(WIN[0]) + M / 2, cellY(WIN[1]) + M / 2];

// ---------------------------------------------------------------- type
function font(w, s) { g.font = `${w} ${s}px Hind`; g.letterSpacing = s >= 90 ? `${(-s * .015).toFixed(1)}px` : '0px'; }
const tw = s => g.measureText(s).width;
// clip-reveal: rises from below its baseline (p 0→1), leaves upward (q 0→1)
function reveal(s, x, y, size, p, q = 0) {
  if (p <= 0 || q >= 1) return;
  g.save(); g.beginPath(); g.rect(x - 4, y - size * 1.12, tw(s) + 8, size * 1.6); g.clip();
  g.fillText(s, x, y + (1 - p) * size * 1.6 - q * size * 1.6); g.restore();
}
function fitSize(s, max, w) { font(600, max); const m = tw(s); return m > w ? Math.floor(max * w / m) : max; }
const LSIZE = Math.min(...LY.flatMap(L => [fitSize(L.a, 92, W - 2 * MX), fitSize(L.b, 92, W - 2 * MX)]));

const TX = [];                                                          // texts on screen this frame (readcheck)
function phrase(id, s, ts, x, y, size, q) {
  const ws = s.split(' ');
  let cx = x;
  ws.forEach((w, i) => { reveal(w, cx, y, size, snap(window.__t, ts[i] + E16, E16), q); cx += tw(w + ' '); });
  if (window.__t >= ts[0] + E16 && q <= 0) TX.push({ id, text: s, x0: x, y0: y - size, x1: x + tw(s), y1: y + size * .4 });
}

// ---------------------------------------------------------------- draw
function rule(x, y, w, p) { if (p > 0) g.fillRect(x, y, w * p, 1); }
function pageGrid(t) {
  const on = [[0.5, 12.0], [40.3, 43.3], [72.4, 76.0]];
  for (const [a, b] of on) {
    const p = snap(t, a + E8, E8) * (1 - snap(t, b, E8)); if (p <= 0) continue;
    g.fillStyle = C.g2;
    for (let i = 0; i < 6; i++) { g.fillRect(fx(i), 200, 1, 520 * p); g.fillRect(fx(i) + COLW, 200, 1, 520 * p); }
  }
}
function artGrid(t) {
  g.fillStyle = C.g2;
  for (let i = 0; i <= 8; i++) {                                        // lines grow out of the red block, nearest first
    const dv = Math.abs(i - 4.5), p = lin(t, 1.0 + dv * E8, 1.0 + dv * E8 + BEAT * 2);
    if (p > 0) { const h = 8 * M * p, cy = cellY(WIN[1]) + M / 2; g.fillRect(AX + i * M, Math.max(cellY(7), cy - h), 1, Math.min(GY, cy + h) - Math.max(cellY(7), cy - h)); }
    const dh = Math.abs(i - 1.5), q = lin(t, 1.2 + dh * E8, 1.2 + dh * E8 + BEAT * 2);
    if (q > 0) { const w = 8 * M * q, cx = ANCH[0]; g.fillRect(Math.max(AX, cx - w), GY - i * M, Math.min(AX + 8 * M, cx + w) - Math.max(AX, cx - w), 1); }
  }
  g.fillStyle = C.ink; const pg = lin(t, .6, 1.6); if (pg > 0) g.fillRect(MX, GY, (W - 2 * MX) * pg, 2);   // ground line
}
function block(t, b) {
  if (t < b.born - E8) return;
  const k = at(b, t); let c = k[1], r = k[2];
  const prev = b.keys[b.keys.indexOf(k) - 1];
  if (prev && t < k[0]) { const p = snap(t, k[0], k[3]); c = lerp(prev[1], k[1], p); r = lerp(prev[2], k[2], p); }
  let x = cellX(c) + 3, y = cellY(r) + 3, w = M - 6, h = M - 6;
  const pin = snap(t, b.born, E8); h *= pin; y += (M - 6) * (1 - pin);  // wipe up from its floor
  if (b.cut != null && t > b.cut) { const col = 1 - snap(t, b.cut + E8, E8); if (col <= 0) return; const m = y + h / 2; h *= col; y = m - h / 2; }
  if (b.out != null && t > b.out) { x += 1200 * snap(t, b.out + BEAT, BEAT); if (x > W) return; }
  g.fillStyle = C.ink; g.fillRect(x, y, w, h);
}
function knife(t, tc, y, x0 = MX, x1 = W - MX) {
  if (t > tc - E16 && t < tc + E8) { g.fillStyle = C.ink; g.fillRect(x0, y - 1, (x1 - x0) * lin(t, tc - E16, tc), 2); }
}
function ghost(t) {
  if (t < T.ghost - E8) return;
  g.strokeStyle = C.g1; g.lineWidth = 2;
  house.forEach(([c, r]) => { const p = snap(t, T.ghost + r * E8, E8); if (p <= 0) return; g.save(); g.beginPath(); g.rect(cellX(c), cellY(r) + M * (1 - p), M, M * p); g.clip(); g.strokeRect(cellX(c) + 4, cellY(r) + 4, M - 8, M - 8); g.restore(); });
}
function tags(t) {
  if (t < T.tags[0] - E16 || t > T.ledger) return;
  const q = snap(t, T.ledger - BEAT, E8), cells = [[6, 1], [6, 3], [2, 7], [1, 0]];
  font(500, 26);
  cells.forEach(([c, r], i) => {
    const p = snap(t, T.tags[i], E16); if (p <= 0) return;
    const y = cellY(r) + M / 2, x0 = cellX(c) + M, x1 = W - MX - 60;
    g.fillStyle = C.ink; g.fillRect(x0, y, (x1 - x0) * lin(t, T.tags[i] - E16, T.tags[i] + E16) * (1 - q), 1);
    reveal('₹', x1 + 14, y + 10, 26, p, q);
  });
}

function header(t, sec, n) {
  g.fillStyle = C.ink; rule(MX, 96, W - 2 * MX, lin(t, .3, 1.3));
  font(500, 26); const p = snap(t, 1.4, E16);
  g.fillStyle = C.ink; reveal('सपनों का घर', fx(0), 140, 26, p);
  g.fillStyle = C.g3; reveal(sec, fx(2), 140, 26, p);
  g.fillStyle = C.ink; reveal(n, fx(4), 140, 26, p);
  TX.push({ id: 'hdr', text: '', pass: true, x0: 0, y0: 100, x1: W, y1: 150 });
}
function footer(t) {
  g.fillStyle = C.ink; rule(MX, 1772, W - 2 * MX, lin(t, .5, 1.5));
  const [c, r] = redPos(t), on = Math.abs(c - Math.round(c)) < .005 && Math.abs(r - Math.round(r)) < .005;
  font(500, 24); const p = snap(t, 1.8, E16);
  g.fillStyle = C.g3; reveal('मॉड्यूल 108 px · 139.5 bpm', fx(0), 1812, 24, p);
  g.fillStyle = C.ink; reveal(`कॉलम ${c.toFixed(2)} · पंक्ति ${r.toFixed(2)}`, fx(2), 1812, 24, p);
  reveal(on ? 'ग्रिड पर' : 'ग्रिड से बाहर', fx(4) + COLW / 2, 1812, 24, p);
  const n = BL.filter(b => t >= b.born && (b.cut == null || t < b.cut) && (b.out == null || t < b.out)).length;
  g.fillStyle = C.g3; reveal(`ब्लॉक ${String(n).padStart(2, '0')} / 29`, fx(0), 1848, 24, p);
  TX.push({ id: 'ftr', text: '', pass: true, x0: 0, y0: 1780, x1: W, y1: 1860 });
}

function render(t) {
  window.__t = t; TX.length = 0;
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = C.page; g.fillRect(0, 0, W, H);
  const li = LY.findIndex(L => t >= L.t0 - E8 && t < L.out + E8);
  const sec = t < 12 ? 'प्रस्तावना' : t > 72.5 ? 'समापन' : (LY[li] ?? (t < 43 ? LY[3] : LY[4])).sec;
  const n = li >= 0 ? String(li + 1).padStart(2, '0') + ' / 08' : t < 12 ? '00 / 08' : t > 72.5 ? '08 / 08' : '04 / 08';
  pageGrid(t); header(t, sec, n); footer(t);

  // intro title
  if (t < 12.2) {
    const q = snap(t, 11.6, E8); g.fillStyle = C.ink; font(700, 150);
    reveal('सपनों', fx(0), 430, 150, snap(t, nb(2.0), E16), q);
    reveal('का घर', fx(0), 600, 150, snap(t, nb(2.6), E16), q);
    if (t > nb(2.6)) TX.push({ id: 'title', text: 'सपनों का घर', x0: fx(0), y0: 280, x1: 900, y1: 650 });
    font(500, 28); g.fillStyle = C.g3;
    reveal('एक गीत, आठ पंक्तियाँ, एक सपना', fx(0), 700, 28, snap(t, nb(4.0), E16), q);
  }
  // lyric lines
  LY.forEach((L, i) => {
    if (t < L.t0 - E8 || t > L.out + E8) return;
    const q = snap(t, L.out + E8, E8);
    font(500, 28); g.fillStyle = C.g3;
    reveal(`${L.sec} · पंक्ति ${i + 1}`, fx(0), 330, 28, snap(t, L.t0, E16), q);
    font(600, LSIZE); g.fillStyle = C.ink;
    phrase(`L${i}a`, L.a, L.ta, fx(0), 480, LSIZE, q);
    phrase(`L${i}b`, L.b, L.tb, fx(0), 480 + LSIZE * 1.42, LSIZE, q);
  });
  // ending title
  if (t > T.title - E8) {
    g.fillStyle = C.ink; font(700, 150);
    reveal('सपनों', fx(0), 430, 150, snap(t, T.title, E16));
    reveal('का घर', fx(0), 600, 150, snap(t, T.title + E8, E16));
    if (t > T.title + E8) TX.push({ id: 'end', text: 'सपनों का घर', x0: fx(0), y0: 280, x1: 900, y1: 650 });
    font(500, 30); g.fillStyle = C.g3;
    reveal('कब तक बिकेगी मेहनत यूँ ही?', fx(0), 700, 30, snap(t, nb(78.2), E16));
    if (t > nb(78.2)) TX.push({ id: 'end2', text: 'कब तक बिकेगी मेहनत यूँ ही?', x0: fx(0), y0: 670, x1: 700, y1: 710 });
  }

  // artifact zone, under the camera
  const s = camS(t);
  g.save(); g.beginPath(); g.rect(0, 770, W, 1000); g.clip();
  g.translate(ANCH[0], ANCH[1]); g.scale(s, s); g.translate(-ANCH[0], -ANCH[1]);
  artGrid(t); ghost(t);
  BL.forEach(b => block(t, b));
  knife(t, T.cut, cellY(4) + M, AX - 20, AX + 8 * M + 20);
  T.sold.forEach((ts, i) => knife(t, ts, cellY(LROWS[i][0]) + M / 2, AX - 20, AX + 8 * M + 20));
  const [rc, rr] = redPos(t), rp = snap(t, .25, E16);
  g.fillStyle = C.red; g.fillRect(cellX(rc) + 3, cellY(rr) + 3 + (M - 6) * (1 - rp), M - 6, (M - 6) * rp);
  g.restore();
  tags(t);
}

window.DUR = DUR;
window.EV = [];
window.TEXTS = t => { render(t); return TX.slice(); };
window.render = render;
window.READY = true;
