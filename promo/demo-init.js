// Injected into IGC-Viewer.html before load: demo flights, mock folder, and video overlays.
(() => {
  /* ---------- realistic-ish synthetic paraglider flights ---------- */
  function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function flight(o) {
    const r = rng(o.seed), M = 111320;
    let lat = o.lat, lon = o.lon, alt = o.alt0, t = o.start, head = o.head;
    const wd = o.windDir, ws = o.windSpd;
    const fx = [];
    const push = () => fx.push([t, lat, lon, Math.round(alt)]);
    const move = (dx, dy) => { lat += dy / M; lon += dx / (M * Math.cos(lat * Math.PI / 180)); };
    push();
    for (let leg = 0; leg < o.legs; leg++) {
      // thermal: circle up to just under cloud base, drifting with the wind
      const top = 2650 + r() * 800, climb = 0.9 + r() * 2.6, rad = 45 + r() * 35, dirSign = r() < .5 ? 1 : -1;
      let a = r() * 6.28;
      for (let s = 0; alt < top && s < 1100; s++) { a += dirSign * 2 * Math.PI / 24; move(Math.cos(a) * rad * 2 * Math.PI / 24 + Math.sin(wd) * ws, Math.sin(a) * rad * 2 * Math.PI / 24 + Math.cos(wd) * ws); alt += climb + (r() - .5) * 1.8; t++; push(); }
      // glide: turn at a turnpoint every few legs, wander a little on the way
      if (leg % o.every === o.every - 1) head += o.tp; else head += (r() - .5) * .5;
      const floor = 1250 + r() * 1100;
      for (let s = 0; alt > floor; s++) { head += (r() - .5) * .03; move(Math.sin(head) * 9.5 + Math.sin(wd) * ws, Math.cos(head) * 9.5 + Math.cos(wd) * ws); alt -= 1.5 + (r() - .5) * 1.2; t++; push(); }
    }
    // final glide to the landing field
    while (alt > o.ground) { head += (r() - .5) * .03; move(Math.sin(head) * 9 + Math.sin(wd) * ws, Math.cos(head) * 9 + Math.cos(wd) * ws); alt -= 1.5; t++; push(); }
    for (let s = 0; s < 240; s++) { move((r() - .5) * .4, (r() - .5) * .4); t++; push(); }
    // forgot to stop the logger: shuttle back up a switchback road
    if (o.shuttle) {
      let h = 3.6, left = 0, turn = 1;
      for (let s = 0; s < o.shuttle; s++) {
        if (left <= 0) { left = 150 + r() * 400; for (let j = 0; j < 10; j++) { h += turn * Math.PI * .55 / 10; move(Math.sin(h) * 3, Math.cos(h) * 3); alt += .2; t++; push(); } turn = -turn; }
        const v = 8.5 * (0.7 + r() * .5); left -= v; h += (r() - .5) * .06; move(Math.sin(h) * v, Math.cos(h) * v); alt += v * .065; t++; push();
      }
    }
    if (o.jumps) for (let k = 0; k < o.jumps; k++) { const i = 200 + Math.floor(r() * (fx.length - 400)), n = 1 + Math.floor(r() * 3); for (let j = 0; j < n; j++) { fx[i + j][1] += .06 + r() * .04; fx[i + j][2] -= .05 * r(); fx[i + j][3] += 400; } }
    const dm = (v, w, h) => { const s = v >= 0 ? h[0] : h[1]; v = Math.abs(v); const d = Math.floor(v), m = Math.round((v - d) * 60000); return String(d).padStart(w, '0') + String(m).padStart(5, '0') + s; };
    const p2 = x => String(x).padStart(2, '0');
    const L = ['AXCTDEMO', 'HFDTEDATE:' + o.date + ',01', 'HFPLTPILOTINCHARGE:' + o.pilot, 'HFGTYGLIDERTYPE:' + o.glider];
    for (const [s, la, lo, al] of fx) L.push('B' + p2(s / 3600 | 0) + p2((s % 3600) / 60 | 0) + p2(s % 60) + dm(la, 2, 'NS') + dm(lo, 3, 'EW') + 'A' + String(Math.max(0, al - 25)).padStart(5, '0') + String(Math.max(0, al)).padStart(5, '0'));
    return L.join('\r\n') + '\r\n';
  }
  const base = { lat: 30.985, lon: 103.705, alt0: 1450, ground: 650, start: 3 * 3600 + 1800, windDir: 0.6, windSpd: 1.6, turn: 1.1, pilot: 'Demo Pilot' };
  const specs = [
    ['2025-04-12 XC.igc', { seed: 3, every: 3, tp: 2.1, date: '120425', head: 0.9, legs: 6, glider: 'Advance Iota 2' }],
    ['2025-05-03 XC.igc', { seed: 11, every: 4, tp: 2.4, date: '030525', head: 2.1, legs: 8, glider: 'Advance Iota 2' }],
    ['2025-05-18 XC.igc', { seed: 27, every: 99, tp: 0, date: '180525', head: 5.3, legs: 7, glider: 'Advance Iota 2' }],
    ['2025-06-07 XC.igc', { seed: 41, every: 3, tp: 2.1, date: '070625', head: 1.4, legs: 10, glider: 'Ozone Rush 6' }],
    ['2025-06-21 XC.igc', { seed: 58, every: 2, tp: 3.0, date: '210625', head: 3.4, legs: 6, glider: 'Ozone Rush 6', jumps: 2 }],
    ['2025-07-02 XC.igc', { seed: 66, every: 99, tp: 0, date: '020725', head: 0.2, legs: 5, glider: 'Ozone Rush 6', jumps: 3 }],
    ['2025-07-15 XC.igc', { seed: 77, every: 3, tp: -2.1, date: '150725', head: 4.4, legs: 6, glider: 'Ozone Rush 6', shuttle: 1300 }],
    ['2025-08-09 XC.igc', { seed: 90, every: 4, tp: 2.6, date: '090825', head: 2.7, legs: 8, glider: 'Ozone Rush 6' }],
    ['2025-09-01 XC.igc', { seed: 101, every: 3, tp: 2.1, date: '010925', head: 1.9, legs: 10, glider: 'Ozone Rush 6' }],
  ];
  class FH { constructor(name, data) { this.kind = 'file'; this.name = name; this.data = data; } async getFile() { return new File([this.data], this.name); } async createWritable() { const s = this; return { async write(b) { s.data = await b.text(); }, async close() {} }; } }
  class DH { constructor(name) { this.kind = 'directory'; this.name = name; this.c = new Map(); } async *entries() { for (const e of [...this.c]) yield e; } async getFileHandle(n, o) { if (this.c.has(n)) return this.c.get(n); if (o && o.create) { const f = new FH(n, ''); this.c.set(n, f); return f; } throw new DOMException('nf', 'NotFoundError'); } async getDirectoryHandle(n, o) { if (!this.c.has(n) && o && o.create) this.c.set(n, new DH(n)); if (!this.c.has(n)) throw new DOMException('nf', 'NotFoundError'); return this.c.get(n); } async removeEntry(n) { this.c.delete(n); } async requestPermission() { return 'granted'; } }
  const root = new DH('飞行记录'), y = new DH('2025'); root.c.set('2025', y);
  for (const [n, o] of specs) y.c.set(n, new FH(n, flight({ ...base, ...o })));
  window.showDirectoryPicker = async () => { root.name = typeof I18N !== 'undefined' && I18N.hant ? '飛行記錄' : '飞行记录'; return root; };

  /* ---------- overlays ---------- */
  const css = `
  #pv-cursor{position:fixed;left:0;top:0;width:22px;height:22px;z-index:99999;pointer-events:none;transform:translate(-3px,-2px);transition:opacity .2s}
  #pv-ring{position:fixed;width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;border:3px solid #2563eb;z-index:99998;pointer-events:none;opacity:0}
  #pv-ring.go{animation:pvr .45s ease-out}
  @keyframes pvr{from{opacity:.9;transform:scale(.4)}to{opacity:0;transform:scale(1.4)}}
  #pv-cap{position:fixed;left:50%;bottom:180px;transform:translate(-50%,12px);z-index:99990;pointer-events:none;background:rgba(17,24,39,.88);color:#fff;font:600 26px/1.3 "PingFang SC",system-ui,sans-serif;padding:12px 26px;border-radius:14px;opacity:0;transition:opacity .35s,transform .35s;white-space:nowrap;box-shadow:0 10px 30px rgba(0,0,0,.25)}
  #pv-cap.on{opacity:1;transform:translate(-50%,0)}
  #pv-cap small{display:block;font-weight:400;font-size:16px;opacity:.75;margin-top:2px}
  #pv-key{position:fixed;left:24px;bottom:24px;z-index:99990;pointer-events:none;font:700 30px/1 system-ui;color:#111;background:#fff;border:1px solid #cbd5e1;border-bottom-width:5px;border-radius:10px;padding:10px 16px;min-width:56px;text-align:center;opacity:0;transition:opacity .15s;box-shadow:0 6px 20px rgba(0,0,0,.18)}
  #pv-key.on{opacity:1}
  #pv-card{position:fixed;inset:0;z-index:100000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;background:radial-gradient(1200px 600px at 30% 20%,#1e3a8a,#0b1220 70%);color:#fff;font-family:"PingFang SC",system-ui,sans-serif;transition:opacity .6s;text-align:center}
  #pv-card.off{opacity:0;pointer-events:none}
  #pv-card h1{margin:0;font-size:84px;letter-spacing:1px;font-weight:800}
  #pv-card h1 span{color:#fb7185}
  #pv-card p{margin:0;font-size:30px;opacity:.9}
  #pv-card .tags{display:flex;gap:12px;margin-top:10px}
  #pv-card .tags b{font-weight:500;font-size:20px;border:1px solid rgba(255,255,255,.35);border-radius:999px;padding:6px 16px}
  #pv-card .url{font-family:Menlo,monospace;font-size:24px;color:#93c5fd;margin-top:8px}
  #pv-card svg{margin-bottom:6px}`;
  const keyName = { ArrowDown: '↓', ArrowUp: '↑', Delete: 'Del' };
  addEventListener('DOMContentLoaded', () => {
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    document.body.insertAdjacentHTML('beforeend', `
      <svg id="pv-cursor" viewBox="0 0 22 22"><path d="M2 1 L2 18 L6.5 13.8 L9.6 20.5 L12.6 19.2 L9.6 12.6 L15.5 12.6 Z" fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>
      <div id="pv-ring"></div><div id="pv-cap"></div><div id="pv-key"></div><div id="pv-card" class="off"></div>`);
    const cur = document.getElementById('pv-cursor'), ring = document.getElementById('pv-ring');
    addEventListener('mousemove', e => { cur.style.left = e.clientX + 'px'; cur.style.top = e.clientY + 'px'; }, true);
    addEventListener('mousedown', e => { ring.style.left = e.clientX + 'px'; ring.style.top = e.clientY + 'px'; ring.classList.remove('go'); void ring.offsetWidth; ring.classList.add('go'); }, true);
    let kt; addEventListener('keydown', e => { const k = document.getElementById('pv-key'); k.textContent = keyName[e.key] || e.key; k.classList.add('on'); clearTimeout(kt); kt = setTimeout(() => k.classList.remove('on'), 450); }, true);
  });
  const logo = `<svg width="120" height="120" viewBox="0 0 120 120"><circle cx="60" cy="60" r="56" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.25)"/><path d="M24 82 C40 40, 52 96, 66 58 S 90 30, 98 40" fill="none" stroke="#fb7185" stroke-width="6" stroke-linecap="round"/><circle cx="24" cy="82" r="7" fill="#22c55e"/><circle cx="98" cy="40" r="7" fill="#ef4444"/></svg>`;
  window.pv = {
    cap(t, sub) { const c = document.getElementById('pv-cap'); if (!t) { c.classList.remove('on'); return; } c.innerHTML = t + (sub ? `<small>${sub}</small>` : ''); c.classList.add('on'); },
    card(kind, url) {
      const c = document.getElementById('pv-card');
      if (!kind) { c.classList.add('off'); return; }
      c.innerHTML = kind === 'title'
        ? `${logo}<h1>IGC <span>Viewer</span></h1><p>滑翔伞 / 滑翔机飞行记录，一眼看完</p><div class="tags"><b>单个 HTML</b><b>双击即用</b><b>极速预览</b></div>`
        : `${logo}<h1>IGC <span>Viewer</span></h1><p>免费 · 开源 · MIT</p><div class="url">${url}</div>`;
      c.classList.remove('off');
    },
    cursor(on) { document.getElementById('pv-cursor').style.opacity = on ? 1 : 0; }
  };
})();
