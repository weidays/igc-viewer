// 录制宣传片：node record.mjs [github-url] [hans|hant]   （hant = 繁體版）
// 用本机 Chrome 无头打开 IGC-Viewer.html，按脚本操作，CDP screencast 抓帧，ffmpeg 合成 out/promo.mp4
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const url = process.argv[2] || 'github.com/igc-viewer';
const lang = process.argv[3] === 'hant' ? 'hant' : 'hans';
const out = path.join(here, 'out'), frames = path.join(out, 'frames-' + lang);
fs.rmSync(frames, { recursive: true, force: true }); fs.mkdirSync(frames, { recursive: true });

const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--window-size=1280,807', '--force-device-scale-factor=1.5'] });
const page = await browser.newPage({ viewport: null });
await page.addInitScript({ path: path.join(here, 'demo-init.js') });
await page.goto(pathToFileURL(path.join(here, '..', 'IGC-Viewer.html')).href);
const vp = await page.evaluate(() => [innerWidth, innerHeight, devicePixelRatio]);
if (vp.join() !== '1280,720,1.5') throw new Error('unexpected viewport ' + vp + ' — tweak --window-size');
await page.evaluate(l => { setLang(l); pv.card('title'); pv.cursor(false); }, lang);
// warm map tiles for the demo area so the recording doesn't show grey squares
const nFlights = await page.evaluate(async () => {
  const root = await showDirectoryPicker(), y = await root.getDirectoryHandle('2025'); window.__warm = [];
  for await (const [, h] of y.entries()) { const tr = IGCViewer.parseIGC(await (await h.getFile()).text()); window.__warm.push(L.latLngBounds(tr.lat.map((a, i) => [a, tr.lon[i]]))); }
  return window.__warm.length;
});
for (let i = 0; i < nFlights; i++) { await page.evaluate(i => map.fitBounds(__warm[i], { padding: [24, 24], animate: false, maxZoom: 16 }), i); await page.waitForTimeout(1500); }

const cdp = await page.context().newCDPSession(page);
const shots = [];
cdp.on('Page.screencastFrame', async f => {
  const file = path.join(frames, String(shots.length).padStart(5, '0') + '.jpg');
  fs.writeFileSync(file, Buffer.from(f.data, 'base64'));
  shots.push({ file, ts: f.metadata.timestamp });
  cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
});
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 });
// keep frames flowing even when nothing moves (screencast only sends on repaint)
await page.evaluate(() => { const d = document.createElement('div'); d.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;opacity:.01;z-index:1'; document.body.appendChild(d); let i = 0; (function f() { d.style.background = (i++ & 1) ? '#000' : '#fff'; requestAnimationFrame(f); })(); });

const W = ms => page.waitForTimeout(ms);
const box = async sel => { const b = await page.locator(sel).first().boundingBox(); return [b.x + b.width / 2, b.y + b.height / 2]; };
let mx = 900, my = 420;
async function glide(x, y, ms = 700) { const n = Math.max(8, Math.round(ms / 16)); for (let i = 1; i <= n; i++) { const k = i / n, e = k < .5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2; await page.mouse.move(mx + (x - mx) * e, my + (y - my) * e); await W(ms / n); } mx = x; my = y; }
async function click(sel) { const [x, y] = await box(sel); await glide(x, y); await W(150); await page.mouse.down(); await W(80); await page.mouse.up(); }
const cap = (t, s) => page.evaluate(([t, s]) => pv.cap(t, s), [t, s]);
const key = async (k, wait) => { await page.keyboard.press(k); await W(wait); };

// 1. title
await W(2600);
await page.evaluate(() => pv.card(null)); await W(500);
await page.mouse.move(mx, my); await page.evaluate(() => pv.cursor(true));
// 2. open folder
await cap('打开文件夹，自动找出所有 IGC', '子文件夹也会一起扫描');
await click('#btnDir');
await W(2600);
// 3. fast browsing
await cap('↑ ↓ 秒切换，航迹立刻出来', '后台预读相邻文件，不用等');
await glide(640, 360, 500);
for (let i = 0; i < 3; i++) await key('ArrowDown', 1050);
await W(500);
// 4. profile ↔ map
await cap('高度曲线与地图联动', '时间 · 高度 · 爬升率 · 地速');
const pb = await page.locator('#prof').boundingBox();
await glide(pb.x + 80, pb.y + pb.height / 2, 600);
await glide(pb.x + pb.width - 40, pb.y + pb.height / 2, 3200);
await W(400);
await glide(640, 330, 500);
// 5. suspicious-only filter
await cap('⚠ 可疑：只看有问题的记录', '打开文件夹后在后台逐个检查');
await click('#btnSus'); await W(1700);
await glide(640, 330, 500);
// 6. GPS jumps → mark
await cap('自动标出 GPS 跳点', '橙色圈 = 定位漂移');
await W(2200);
await cap('按 Del 标记，自动跳到下一个');
await key('Delete', 1300);
await key('Delete', 1200);
// 7. shuttle ride → mark
await cap('自动识别疑似接驳车', '紫色虚线 = 降落后坐车的路段');
await W(2800);
await key('Delete', 800);
await cap('一键清理，先移到「_已删除」可恢复');
await click('#btnDel'); await W(1300);
await click('#dlgMove'); await W(1700);
await cap(null); await W(400);
// 8. end card
await page.evaluate(u => { pv.cursor(false); pv.card('end', u); }, url);
await W(3200);

await cdp.send('Page.stopScreencast');
await browser.close();

// assemble variable-rate frames into constant 30 fps
const lines = ['ffconcat version 1.0'];
for (let i = 0; i < shots.length; i++) {
  const d = i + 1 < shots.length ? shots[i + 1].ts - shots[i].ts : 0.5;
  lines.push(`file '${shots[i].file}'`, `duration ${Math.max(0.001, d).toFixed(4)}`);
}
lines.push(`file '${shots.at(-1).file}'`);
fs.writeFileSync(path.join(out, `frames-${lang}.txt`), lines.join('\n'));
const mp4 = path.join(out, `promo-${lang}.mp4`);
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-safe', '0', '-f', 'concat', '-i', path.join(out, `frames-${lang}.txt`),
  '-vf', 'fps=30,scale=1920:1080:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-crf', '18', '-preset', 'slow', '-movflags', '+faststart', mp4], { stdio: 'inherit' });
console.log('frames', shots.length, '->', mp4);
