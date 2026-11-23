// सपनों का घर (रात): night-silhouette lyric film, 1080×1920. render(t) is deterministic.
const W = 1080, H = 1920, DUR = 87.19;
const cv = document.getElementById('c'), g = cv.getContext('2d');
await Promise.all([document.fonts.load('italic 72px Tiro', 'सपनों का घर'), document.fonts.load('72px Tiro', 'सपनों का घर')]);
const LY = await (await fetch('lyrics.json')).json();
LY.forEach((L, i) => { L.t0 = L.ta[0]; L.out = i + 1 < LY.length ? LY[i + 1].ta[0] - .35 : 72.6; });
LY[3].out = 43.0;

// ---------------------------------------------------------------- helpers
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const ss = x => x * x * (3 - 2 * x);
const eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const sm = (t, a, b) => ss(seg(t, a, b));
function rnd(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let x = Math.imul(s ^ (s >>> 15), 1 | s); x ^= x + Math.imul(x ^ (x >>> 7), 61 | x); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
function track(keys, t) {              // keys [[t, value]], smooth ease between neighbours
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t < keys[i][0]) {
    const a = keys[i - 1], b = keys[i], p = eio(seg(t, a[0], b[0]));
    return Array.isArray(a[1]) ? a[1].map((v, j) => lerp(v, b[1][j], p)) : lerp(a[1], b[1], p);
  }
  return keys[keys.length - 1][1];
}
const C = {
  sky0: '#0B1433', sky1: '#18235A', sky2: '#352F66', far: '#3E3A6E', mid: '#2A2858', near: '#151634', ink: '#0A0D22',
  warm: [255, 196, 110], cold: [196, 214, 255], moon: '#F7E8BC', text: '#FBEFD2',
};
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

// ---------------------------------------------------------------- story times
const T = {
  lamp: 12.3, lampOff: 38.6, lampBack: 75.2,
  win: [13.84, 16.32, 19.9, 22.08, 23.64], door: 24.84, dim: [37.9, 38.3, 38.6, 39.1, 39.5],
  palace: 27.6, leak: 34.42, chair: 43.66, wake: 54.72, paper: 57.64, tear: 66.08, outro: 72.6, relight: [76.4, 78.0, 79.6, 81.2, 82.8], title: 76.4,
};

// ---------------------------------------------------------------- sky
const STARS = (() => { const r = rnd(7), s = []; for (let i = 0; i < 150; i++) s.push([r() * W, r() * 1150, .6 + r() * 1.8, r() * 6.28, .5 + r() * 2]); return s; })();
function sky(t) {
  const gr = g.createLinearGradient(0, 0, 0, 1350);
  gr.addColorStop(0, C.sky0); gr.addColorStop(.6, C.sky1); gr.addColorStop(1, C.sky2);
  g.fillStyle = gr; g.fillRect(-200, -200, W + 400, 1700);
  for (const [x, y, r, ph, sp] of STARS) { g.globalAlpha = .35 + .65 * (.5 + .5 * Math.sin(t * sp + ph)); g.fillStyle = '#FFF6DC'; g.beginPath(); g.arc(x, y, r, 0, 6.29); g.fill(); }
  g.globalAlpha = 1;
}
const moonCv = document.createElement('canvas'); moonCv.width = moonCv.height = 300;
function moon(t) {
  const m = moonCv.getContext('2d'); m.clearRect(0, 0, 300, 300);
  m.fillStyle = C.moon; m.beginPath(); m.arc(150, 150, 62, 0, 6.29); m.fill();
  m.globalCompositeOperation = 'destination-out'; m.beginPath(); m.arc(178, 128, 56, 0, 6.29); m.fill(); m.globalCompositeOperation = 'source-over';
  const x = 150 + t * .3, y = 660 - t * .2;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  glow(x, y, 160, [255, 236, 190], .16);
  g.drawImage(moonCv, x - 150, y - 150); g.restore();
}
function glow(x, y, r, c, a) {
  if (a <= 0) return;
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, rgba(c, a)); gr.addColorStop(.4, rgba(c, a * .45)); gr.addColorStop(1, rgba(c, 0));
  g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); g.restore();
}

// ---------------------------------------------------------------- distant city
const CITY = (() => { const r = rnd(11), b = []; let x = -150; while (x < W + 150) { const w = 50 + r() * 90; b.push([x, w, 60 + r() * 150, r() < .3]); x += w; } return b; })();
function city(t) {
  g.fillStyle = C.far;
  for (const [x, w, h, d] of CITY) { g.fillRect(x, 1300 - h, w, h); if (d) { g.beginPath(); g.arc(x + w / 2, 1300 - h, w * .32, Math.PI, 0); g.fill(); } }
  const r = rnd(5);                                                     // a few far windows
  for (let i = 0; i < 26; i++) { const x = r() * W, y = 1170 + r() * 110, on = Math.sin(t * .3 + i) > .2; if (on) { g.fillStyle = 'rgba(255,214,150,.35)'; g.fillRect(x, y, 6, 9); } }
}

// ---------------------------------------------------------------- the dream house (left)
const HX = 110, HB = 1330;                                              // left edge, base line
const HWIN = [[150, 1170], [270, 1170], [150, 1255], [270, 1255]];       // 4 windows + door
function houseLight(t) {
  let n = 0;
  for (let i = 0; i < 4; i++) {
    const on = sm(t, T.win[i], T.win[i] + .5) * (1 - sm(t, T.dim[i], T.dim[i] + .35)) + (i < 4 ? sm(t, T.relight[i], T.relight[i] + 1.2) * .9 : 0);
    n += clamp(on);
  }
  return n / 4;
}
function house(t) {
  const L = houseLight(t), dream = L;
  glow(HX + 160, 1180, 420, C.warm, .38 * dream);                       // the dream: warm light behind the house
  g.fillStyle = C.mid;
  g.beginPath(); g.moveTo(HX - 20, 1110); g.lineTo(HX + 160, 990); g.lineTo(HX + 340, 1110); g.closePath(); g.fill();   // roof
  g.fillRect(HX, 1100, 320, HB - 1100);
  g.fillRect(HX + 230, 1000, 34, 70);                                    // chimney
  HWIN.forEach(([x, y], i) => {
    const on = clamp(sm(t, T.win[i], T.win[i] + .5) * (1 - sm(t, T.dim[i], T.dim[i] + .35)) + sm(t, T.relight[i], T.relight[i] + 1.2) * .9);
    const fl = on * (.92 + .08 * Math.sin(t * 7 + i * 2));
    g.fillStyle = C.near; g.fillRect(x - 2, y - 2, 64, 58);
    if (fl > 0) { g.fillStyle = rgba(C.warm, fl); g.beginPath(); g.moveTo(x, y + 54); g.lineTo(x, y + 18); g.quadraticCurveTo(x + 30, y - 14, x + 60, y + 18); g.lineTo(x + 60, y + 54); g.fill(); glow(x + 30, y + 28, 90, C.warm, .35 * fl); }
  });
  const d = clamp(sm(t, T.door, T.door + .6) * (1 - sm(t, T.dim[4], T.dim[4] + .4)) + sm(t, T.relight[4], T.relight[4] + 1.5));
  g.fillStyle = C.near; g.fillRect(HX + 136, HB - 92, 50, 92);
  if (d > 0) { g.fillStyle = rgba(C.warm, d * .9); g.fillRect(HX + 140, HB - 86, 42, 86); glow(HX + 161, HB - 40, 120, C.warm, .3 * d); }
}

// ---------------------------------------------------------------- the palace of power (right)
const PX = 790, PB = 1330;
function palace(t) {
  const on = sm(t, T.palace, T.palace + 1.5), sleep = sm(t, T.wake, T.wake + 1.2) * (1 - sm(t, T.paper, T.paper + 1));
  const lit = on * (1 - .75 * sleep);
  glow(PX, 1120, 360, C.cold, .18 * lit);
  g.fillStyle = C.mid;
  g.beginPath(); g.arc(PX, 1080, 120, Math.PI, 0); g.fill();                         // dome
  g.beginPath(); g.moveTo(PX - 8, 962); g.lineTo(PX, 920); g.lineTo(PX + 8, 962); g.fill();   // finial
  g.fillRect(PX - 135, 1070, 270, 40);                                               // drum
  g.fillRect(PX - 220, 1100, 440, PB - 1100);                                        // body
  for (const s of [-1, 1]) {                                                         // minarets with small domes
    const mx = PX + s * 185; g.fillRect(mx - 18, 900, 36, PB - 900);
    g.beginPath(); g.arc(mx, 900, 26, Math.PI, 0); g.fill(); g.fillRect(mx - 26, 960, 52, 10);
  }
  // the great arch: cold light; the chair inside it from the antara
  const ax = PX, ay = 1330, aw = 120, ah = 190;
  g.fillStyle = C.near; archPath(ax, ay, aw, ah); g.fill();
  if (lit > 0) {
    g.fillStyle = rgba(C.cold, .85 * lit); archPath(ax, ay, aw - 10, ah - 8); g.fill();
    glow(ax, ay - 90, 200, C.cold, .35 * lit);
    const ch = sm(t, T.chair, T.chair + 1.2);
    if (ch > 0) {                                                                    // the chair (कुर्सी)
      g.globalAlpha = ch; g.fillStyle = C.near;
      g.fillRect(ax - 26, ay - 150, 12, 150); g.fillRect(ax - 26, ay - 72, 58, 12); g.fillRect(ax + 20, ay - 72, 12, 72);
      g.fillRect(ax - 36, ay - 158, 32, 10); g.globalAlpha = 1;
    }
  }
  [[-140, 1180], [140, 1180]].forEach(([dx, y]) => { g.fillStyle = C.near; archPath(PX + dx, y + 70, 50, 70); g.fill(); if (lit > 0) { g.fillStyle = rgba(C.cold, .7 * lit); archPath(PX + dx, y + 66, 42, 62); g.fill(); } });
}
function archPath(cx, base, w, h) {
  g.beginPath(); g.moveTo(cx - w / 2, base); g.lineTo(cx - w / 2, base - h * .6);
  g.quadraticCurveTo(cx - w / 2, base - h * .9, cx, base - h); g.quadraticCurveTo(cx + w / 2, base - h * .9, cx + w / 2, base - h * .6);
  g.lineTo(cx + w / 2, base); g.closePath();
}

// ---------------------------------------------------------------- papers (the leak) and torn pieces
const PAPERS = (() => { const r = rnd(21), p = []; for (let i = 0; i < 46; i++) p.push({ t0: T.leak + i * .085, vx: -(80 + r() * 210), up: 160 + r() * 260, gy: 40 + r() * 30, rot: r() * 6, sw: r() * 6, s: .7 + r() * .5 }); return p; })();
function papers(t) {
  for (const p of PAPERS) {
    const s = t - p.t0; if (s < 0 || s > 9) continue;
    const x = PX + p.vx * s + Math.sin(s * 2 + p.sw) * 30, y = 1250 - p.up * s + p.gy * s * s;
    if (y > 1560) continue;
    const a = clamp(s * 3) * (1 - sm(t, 42.5, 43.6));
    drawSheet(x, y, p.rot + Math.sin(s * 3 + p.sw) * .9, p.s, a);
  }
}
function drawSheet(x, y, rot, s, a, c = '#EFE4C6') {
  if (a <= 0) return;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.globalAlpha = a;
  g.fillStyle = c; g.fillRect(-14, -18, 28, 36);
  g.fillStyle = 'rgba(40,40,80,.45)'; for (let i = 0; i < 4; i++) g.fillRect(-9, -11 + i * 7, 18 - (i === 3 ? 7 : 0), 2);
  g.restore();
}

// ---------------------------------------------------------------- terrace, desk, lamp
const FY = 1560, SX = 440;                                             // floor line, student x
function terrace(t) {
  g.fillStyle = C.near; g.fillRect(-200, 1460, W + 400, 600);
  g.fillStyle = C.ink; g.fillRect(-200, FY, W + 400, 600);
  g.fillStyle = C.ink; g.fillRect(-200, 1452, W + 400, 14);             // parapet rail
  for (let x = -40; x < W + 80; x += 70) g.fillRect(x, 1452, 10, 110);
}
function lampOn(t) { return clamp(sm(t, T.lamp, T.lamp + .25) * (1 - sm(t, T.lampOff, T.lampOff + .2)) + sm(t, T.lampBack, T.lampBack + .4)); }
function desk(t) {
  const lx = SX + 300, on = lampOn(t), fl = on * (.94 + .06 * Math.sin(t * 13) * Math.sin(t * 5.3));
  glow(lx, 1360, 380, C.warm, .42 * fl);
  g.fillStyle = C.ink;
  g.fillRect(SX + 130, 1425, 240, 16); g.fillRect(SX + 142, 1440, 14, FY - 1440); g.fillRect(SX + 344, 1440, 14, FY - 1440);
  g.fillRect(SX + 180, 1413, 90, 12);                                              // books
  g.fillRect(lx - 24, 1418, 48, 8); g.fillRect(lx - 3, 1340, 6, 80);              // lamp base + stem
  g.beginPath(); g.moveTo(lx - 40, 1352); g.lineTo(lx - 18, 1318); g.lineTo(lx + 18, 1318); g.lineTo(lx + 40, 1352); g.fill();
  if (fl > 0) { g.fillStyle = rgba([255, 226, 160], fl); g.beginPath(); g.ellipse(lx, 1354, 34, 6, 0, 0, 6.29); g.fill(); }
  g.fillStyle = C.ink; g.fillRect(SX - 40, 1470, 90, FY - 1470);
  glow(lx - 60, FY + 60, 330, C.warm, .22 * fl);                                        // the stool
  const r = rnd(3);                                                                // embers above the lamp
  for (let i = 0; i < 14; i++) { const ph = r(), sp = .08 + r() * .08, life = ((t * sp + ph) % 1); const x = lx + (r() - .5) * 120 + Math.sin(t + i) * 10, y = 1330 - life * 260; g.fillStyle = rgba([255, 214, 140], fl * (1 - life) * .8); g.beginPath(); g.arc(x, y, 2 + r() * 2, 0, 6.29); g.fill(); }
}

// ---------------------------------------------------------------- the student: a small rig with blended poses
// angles in radians from straight down (limbs) or straight up (torso), positive = facing direction
const P = {
  write:  { hy: 0,    to: .28, hd: .3,  aU: .95, aF: 1.75, bU: .75, bF: 1.55, th: 1.52, sh: .04, tk: 1.45, sk: -.06 },
  slump:  { hy: 0,    to: .75, hd: .55, aU: 1.2, aF: 2.7,  bU: .9,  bF: 2.4,  th: 1.5,  sh: .05, tk: 1.42, sk: -.04 },
  stand:  { hy: -96,  to: -.04, hd: -.32, aU: .12, aF: .18, bU: -.06, bF: .02, th: .04, sh: 0,  tk: -.08, sk: 0 },
  ask:    { hy: -96,  to: -.08, hd: -.4, aU: 2.35, aF: 2.05, bU: -.06, bF: .02, th: .06, sh: 0,  tk: -.1,  sk: 0 },
  hold:   { hy: -96,  to: -.06, hd: -.45, aU: 2.75, aF: 2.95, bU: 2.55, bF: 2.85, th: .04, sh: 0, tk: -.08, sk: 0 },
  tear:   { hy: -96,  to: .02, hd: -.2, aU: 1.55, aF: 1.75, bU: -1.2, bF: -1.0, th: .06, sh: 0,  tk: -.1,  sk: 0 },
  down:   { hy: -96,  to: .18, hd: .5,  aU: .05, aF: .08, bU: -.02, bF: 0,   th: .02, sh: 0,  tk: -.04, sk: 0 },
  hope:   { hy: -96,  to: -.05, hd: -.25, aU: .4,  aF: .9,  bU: -.05, bF: .02, th: .04, sh: 0, tk: -.08, sk: 0 },
};
const POSES = [[0, 'write'], [37.9, 'write'], [38.9, 'slump'], [43.2, 'slump'], [44.6, 'stand'], [54.3, 'stand'], [55.2, 'ask'], [57.2, 'ask'], [58.4, 'hold'], [65.6, 'hold'], [66.3, 'tear'], [68.8, 'tear'], [70.0, 'down'], [74.6, 'down'], [76.2, 'hope']];
const DIR = [[0, 1], [74.9, 1], [75.6, -1]];                            // turns to face the dream house
function pose(t) {
  let a = POSES[0], b = POSES[0];
  for (let i = 0; i < POSES.length; i++) if (POSES[i][0] <= t) { a = POSES[i]; b = POSES[i + 1] || a; }
  const p = b === a ? 0 : eio(seg(t, a[0], b[0]));
  const A = P[a[1]], B = P[b[1]], o = {};
  for (const k in A) o[k] = lerp(A[k], B[k], p);
  if (t < 37.9 && t > T.lamp) { o.aF += Math.sin(t * 9) * .07; o.aU += Math.sin(t * 4.5) * .03; o.hd += Math.sin(t * .8) * .04; }   // writing
  o.to += Math.sin(t * 1.3) * .01;                                                                                               // breath
  return o;
}
const pt = (x, y, a, L, up = false) => up ? [x + Math.sin(a) * L, y - Math.cos(a) * L] : [x + Math.sin(a) * L, y + Math.cos(a) * L];
function limb(a, b, c, w) { g.lineWidth = w; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c[0], c[1]); g.stroke(); }
function student(t) {
  const o = pose(t), dr = track(DIR, t);
  g.save(); g.translate(SX, 1470 + o.hy); g.scale(dr, 1);
  g.strokeStyle = g.fillStyle = C.ink; g.lineCap = g.lineJoin = 'round';
  const hip = [0, 0], neck = pt(0, 0, o.to, 150, true), head = pt(neck[0], neck[1], o.to + o.hd, 44, true);
  const kn2 = pt(0, 0, o.tk, 96), ft2 = pt(kn2[0], kn2[1], o.sk, 98); limb(hip, kn2, ft2, 30);          // far leg
  const sh = pt(0, 0, o.to, 128, true);
  const el2 = pt(sh[0], sh[1], o.bU, 82), hd2 = pt(el2[0], el2[1], o.bF, 78); limb(sh, el2, hd2, 22);      // far arm
  g.beginPath(); const tr = o.to;                                                                      // torso (kurta)
  const n1 = pt(0, 0, tr, 140, true);
  g.moveTo(-30, 18); g.lineTo(n1[0] - 26 * Math.cos(tr), n1[1] - 26 * Math.sin(tr)); g.lineTo(n1[0] + 26 * Math.cos(tr), n1[1] + 26 * Math.sin(tr)); g.lineTo(34, 18); g.closePath(); g.fill();
  const kn = pt(0, 0, o.th, 96), ft = pt(kn[0], kn[1], o.sh, 98); limb(hip, kn, ft, 32);                 // near leg
  g.beginPath(); g.ellipse(ft[0] + 12, ft[1] + 4, 22, 9, 0, 0, 6.29); g.fill();
  g.beginPath(); g.ellipse(ft2[0] + 12, ft2[1] + 4, 22, 9, 0, 0, 6.29); g.fill();
  g.lineWidth = 16; g.beginPath(); g.moveTo(neck[0], neck[1]); g.lineTo(head[0], head[1]); g.stroke();
  g.beginPath(); g.arc(head[0], head[1] - 6, 34, 0, 6.29); g.fill();                                    // head
  g.beginPath(); g.arc(head[0] - 6, head[1] - 22, 30, Math.PI * 1.05, Math.PI * 1.95); g.fill();       // hair
  g.beginPath(); g.moveTo(head[0] + 28, head[1] - 4); g.lineTo(head[0] + 42, head[1] + 6); g.lineTo(head[0] + 28, head[1] + 10); g.fill(); // nose
  const el = pt(sh[0], sh[1], o.aU, 82), hn = pt(el[0], el[1], o.aF, 78); limb(sh, el, hn, 24);           // near arm
  g.restore();
  // the paper in his hands (57.6 → tear)
  const hp = sm(t, 58.0, 58.6) * (1 - sm(t, T.tear, T.tear + .2));
  if (hp > 0) {
    const hx = SX + dr * (Math.sin(o.to) * 128 + Math.sin(o.aU) * 82 + Math.sin(o.aF) * 78), hy = 1470 + o.hy - Math.cos(o.to) * 128 + Math.cos(o.aU) * 82 + Math.cos(o.aF) * 78;
    glow(hx, hy - 30, 160, C.warm, .45 * hp);
    drawSheet(hx, hy - 34, .08, 2.4, hp, '#FFF1CF');
  }
  if (t > T.tear && t < T.tear + 6) {                                                                     // torn pieces fly to the palace
    const r = rnd(33);
    for (let i = 0; i < 16; i++) {
      const s = t - T.tear - i * .06; if (s < 0) continue;
      const x0 = SX + 120, y0 = 1060, x = x0 + (PX - x0) * Math.min(1, s / 3.2) * (.6 + r() * .5) + Math.sin(s * 3 + i) * 20, y = y0 - 140 * Math.sin(Math.min(1, s / 3.2) * Math.PI) * (.6 + r()) + s * 25;
      g.save(); g.translate(x, y); g.rotate(s * (2 + r() * 3)); g.globalAlpha = 1 - seg(s, 3.2, 5); g.fillStyle = '#EFE4C6'; g.fillRect(-9, -7, 18 - r() * 6, 14 - r() * 5); g.restore();
    }
  }
}

// ---------------------------------------------------------------- camera
const CAM = [[0, [1.2, 540, 985]], [11, [1.2, 540, 985]], [26, [1.28, 470, 1080]], [33.5, [1.28, 600, 1080]], [37, [1.32, 690, 1100]], [43.6, [1.2, 540, 985]],
  [56.5, [1.24, 560, 1030]], [62, [1.32, 480, 1130]], [70, [1.24, 560, 1030]], [80, [1.2, 520, 985]], [87.2, [1.26, 420, 1060]]];
function cam(t) {
  const [s, cx, cy] = track(CAM, t);
  g.translate(W / 2, H / 2); g.scale(s, s); g.translate(-cx, -cy);
}

// ---------------------------------------------------------------- lyrics: italic serif, word by word, warm glow
const TX = [];
function fitSize(L) { let s = 92; g.font = `italic ${s}px Tiro`; const m = Math.max(g.measureText(L.a).width, g.measureText(L.b).width); return m > 960 ? Math.floor(s * 940 / m) : s; }
const SIZE = Math.min(...LY.map(fitSize));
function lineText(id, s, ts, y, size, fade, t) {
  g.font = `italic ${size}px Tiro`; g.textBaseline = 'alphabetic';
  const ws = s.split(' '), sp = g.measureText(' ').width, total = g.measureText(s).width;
  let x = W / 2 - total / 2;
  ws.forEach((w, i) => {
    const p = sm(t, ts[i] - .05, ts[i] + .45), a = p * fade;
    if (a > 0) {
      g.save(); g.globalAlpha = a; g.shadowColor = 'rgba(255,190,110,.85)'; g.shadowBlur = 26 * a;
      g.fillStyle = C.text; g.fillText(w, x, y + (1 - p) * 14); g.restore();
    }
    x += g.measureText(w).width + sp;
  });
  if (t >= ts[0] && fade >= 1) TX.push({ id, text: s, x0: W / 2 - total / 2, y0: y - size, x1: W / 2 + total / 2, y1: y + size * .4 });
}
function lyrics(t) {
  LY.forEach((L, i) => {                                   // one line on screen at a time
    const parts = [[L.a, L.ta, L.tb[0] - .35], [L.b, L.tb, L.out]];
    parts.forEach(([s, ts, out], j) => {
      if (t < ts[0] - .2 || t > out + .5) return;
      const fade = 1 - sm(t, out, out + .4);
      lineText(`L${i}${'ab'[j]}`, s, ts, 400, SIZE, fade, t);
    });
  });
  const title = (a, b, y0) => {
    const f = Math.min(a, b);
    if (f <= 0) return;
    g.save(); g.font = 'italic 124px Tiro'; g.textAlign = 'center'; g.globalAlpha = f; g.shadowColor = 'rgba(255,190,110,.9)'; g.shadowBlur = 40;
    g.fillStyle = C.text; g.fillText('सपनों का घर', W / 2, y0 + (1 - a) * 18); g.restore();
  };
  title(sm(t, 1.5, 3.2), 1 - sm(t, 10.6, 11.6), 420);
  if (t > 2.6 && t < 10.6) TX.push({ id: 'title', text: 'सपनों का घर', x0: 200, y0: 300, x1: 880, y1: 450 });
  title(sm(t, T.title, T.title + 1.6), 1, 420);
  if (t > T.title + 1) TX.push({ id: 'end', text: 'सपनों का घर', x0: 200, y0: 300, x1: 880, y1: 450 });
  const sub = sm(t, 79, 80.4);
  if (sub > 0) { g.save(); g.font = 'italic 46px Tiro'; g.textAlign = 'center'; g.globalAlpha = sub; g.fillStyle = 'rgba(251,239,210,.85)'; g.shadowColor = 'rgba(255,190,110,.7)'; g.shadowBlur = 18; g.fillText('कब तक बिकेगी मेहनत यूँ ही?', W / 2, 520); g.restore(); if (t > 80.4) TX.push({ id: 'end2', text: 'कब तक बिकेगी मेहनत यूँ ही?', x0: 240, y0: 480, x1: 840, y1: 535 }); }
}

// ---------------------------------------------------------------- frame
function render(t) {
  TX.length = 0;
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  g.fillStyle = C.sky0; g.fillRect(0, 0, W, H);
  g.save(); cam(t);
  sky(t); moon(t); city(t); house(t); palace(t); papers(t); terrace(t); desk(t); student(t);
  g.restore();
  const v = g.createRadialGradient(W / 2, H * .55, H * .3, W / 2, H * .55, H * .75);    // vignette
  v.addColorStop(0, 'rgba(5,6,20,0)'); v.addColorStop(1, 'rgba(5,6,20,.55)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  g.globalAlpha = 1 - sm(t, 0, 1.2); if (g.globalAlpha > 0) { g.fillStyle = '#05060F'; g.fillRect(0, 0, W, H); } g.globalAlpha = 1;
  portrait(t);
  lyrics(t);
}

// ---------------------------------------------------------------- the singer's portrait, in a glowing arch (outro)
const PIMG = new Image(); PIMG.src = 'portrait.jpg'; await PIMG.decode();
const PT = 80.4;
function portrait(t) {
  const a = sm(t, PT, PT + 1.4); if (a <= 0) return;
  g.fillStyle = `rgba(5,6,20,${.5 * a})`; g.fillRect(0, 0, W, H);                   // the night steps back
  const cx = 540, base = 1500, w = 640, h = 900, rise = 1 - eio(a);
  glow(cx, base - h / 2, 620, C.warm, .32 * a);
  g.save(); g.globalAlpha = a; g.translate(0, rise * 40);
  archPath(cx, base, w, h); g.save(); g.clip();
  const z = .45 * (1 + .05 * seg(t, PT, DUR)), iw = PIMG.width * z, ih = PIMG.height * z;
  g.drawImage(PIMG, cx - .43 * iw, 900 - .33 * ih, iw, ih);
  const sh = g.createLinearGradient(0, base - 260, 0, base); sh.addColorStop(0, 'rgba(10,13,34,0)'); sh.addColorStop(1, 'rgba(10,13,34,.6)');
  g.fillStyle = sh; g.fillRect(0, base - 260, W, 260);
  g.restore();
  g.shadowColor = 'rgba(255,190,110,.9)'; g.shadowBlur = 30; g.strokeStyle = rgba(C.warm, .95); g.lineWidth = 6;
  archPath(cx, base, w, h); g.stroke();
  g.restore();
}

window.DUR = DUR; window.EV = [];
window.TEXTS = t => { render(t); return TX.slice(); };
window.render = render; window.READY = true;
