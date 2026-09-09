/**
 * Measures the real geometry of a project page, in the browser, at 1920×1080.
 *
 *   npm run dev
 *   node scripts/measure-page.mjs                 # every project
 *   node scripts/measure-page.mjs notan-tides
 *
 * At 1920×1080 the design box is at scale 1 (see components/DesignStage.jsx),
 * so screen pixels ARE design pixels and everything printed here can be pasted
 * straight into buildingViewsData.js.
 *
 * Why the browser and not the source files: the tower's outline is the union of
 * its floor cut-outs, which are laid over the photo with `preserveAspectRatio
 * slice` — so where it lands depends on the photo's crop, the frame's shape and
 * the layer's transform. `getBoundingClientRect()` knows all three. Parsing the
 * SVGs instead reads background rects and relative path commands as geometry
 * and puts Notan Edge's tower at x = -3,974,123,215.
 *
 * Reported per project:
 *   tower L/R     the silhouette's extent, union of every floor cut-out
 *   sky L/R       the middle of the sky either side of it — where a readout
 *                 standing "between the tower and the edge of the picture" goes
 *   markC / inkC  the mark's box centre, and the centre of its INK (the marks
 *                 carry uneven transparent padding, so the two differ)
 *   amenC         the amenity text's own centre
 *   drift         inkC − amenC. This is the number that makes the mark look
 *                 off-centre over its own amenities.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const PORT = 9457;
const ORIGIN = process.env.ORIGIN || "http://localhost:5173";
const CHROME_CANDIDATES = [
  process.env.CHROME,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
].filter(Boolean);

const ALL = [
  "notan-dc",
  "notan-edge",
  "notan-jewel",
  "notan-space",
  "notan-terrace",
  "notan-crown",
  "notan-lands-end",
  "notan-views",
  "notan-beach-house",
  "notan-tides",
];
const argIds = process.argv.slice(2).filter((a, i, arr) => !a.startsWith("--") && arr[i - 1] !== "--at");
const ids = argIds.length ? argIds : ALL;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const CHROME = CHROME_CANDIDATES.find((p) => fs.existsSync(p));
if (!CHROME) {
  console.error("Could not find Chrome. Set CHROME=/path/to/chrome.");
  process.exit(1);
}

const userDir = fs.mkdtempSync(path.join(os.tmpdir(), "notan-measure-"));
const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${userDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "about:blank",
  ],
  { stdio: "ignore" },
);
process.on("exit", () => {
  chrome.kill();
  try {
    fs.rmSync(userDir, { recursive: true, force: true });
  } catch {
    /* a locked profile dir is harmless */
  }
});

let wsUrl;
for (let i = 0; i < 80 && !wsUrl; i++) {
  try {
    wsUrl = (
      await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json()
    ).webSocketDebuggerUrl;
  } catch {
    await sleep(200);
  }
}
if (!wsUrl) {
  console.error("Chrome did not start");
  process.exit(1);
}
const ws = new WebSocket(wsUrl);
await new Promise((r) => (ws.onopen = r));
let msgId = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    const { resolve, reject } = pending.get(m.id);
    pending.delete(m.id);
    m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result);
  }
};
const send = (method, params = {}, sessionId) =>
  new Promise((resolve, reject) => {
    const id = ++msgId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params, sessionId }));
  });

const { targetId } = await send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await send("Target.attachToTarget", {
  targetId,
  flatten: true,
});
await send("Page.enable", {}, sessionId);
await send("Runtime.enable", {}, sessionId);
/* Default 1920×1080 — the size the design box is at scale 1, so screen
   pixels are design pixels. `--at WxH` re-measures at another window, which is
   how you check that a wrap or a placement does NOT move between shapes. */
const atArg = process.argv.indexOf("--at");
const [VW, VH] =
  atArg > -1 ? process.argv[atArg + 1].split("x").map(Number) : [1920, 1080];
await send(
  "Emulation.setDeviceMetricsOverride",
  { width: VW, height: VH, deviceScaleFactor: 1, mobile: false },
  sessionId,
);

/* Runs in the page. Returns plain numbers only. */
const PROBE = `(async () => {
  const R = (el) => { const b = el.getBoundingClientRect();
    return { l: b.left, r: b.right, t: b.top, b: b.bottom, w: b.width, h: b.height }; };

  /* the tower: union of every floor cut-out's rendered box */
  const shapes = [...document.querySelectorAll('svg polygon, svg path')]
    .filter((s) => s.closest('svg')?.getAttribute('preserveAspectRatio') === 'xMidYMid slice');
  let tower = null;
  for (const s of shapes) {
    const b = s.getBoundingClientRect();
    if (!b.width || !b.height) continue;
    tower = tower
      ? { l: Math.min(tower.l, b.left), r: Math.max(tower.r, b.right),
          t: Math.min(tower.t, b.top), b: Math.max(tower.b, b.bottom) }
      : { l: b.left, r: b.right, t: b.top, b: b.bottom };
  }

  /* the project mark, and where its INK sits inside its own box */
  const img = document.querySelector('header img');
  let mark = null, ink = null;
  if (img) {
    mark = R(img);
    try { await img.decode(); } catch (e) { /* already decoded */ }
    const c = document.createElement('canvas');
    const W = c.width = 600;
    const H = c.height = Math.max(1, Math.round(600 * (img.naturalHeight / img.naturalWidth)));
    const g = c.getContext('2d');
    g.drawImage(img, 0, 0, W, H);
    let d = null;
    try { d = g.getImageData(0, 0, W, H).data; } catch (e) { d = null; }
    if (d) {
      let x0 = W, x1 = -1, y0 = H, y1 = -1;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        if (d[(y * W + x) * 4 + 3] > 24) {
          if (x < x0) x0 = x; if (x > x1) x1 = x;
          if (y < y0) y0 = y; if (y > y1) y1 = y;
        }
      }
      ink = x1 < 0 ? null : { x0: x0 / W, x1: (x1 + 1) / W, y0: y0 / H, y1: (y1 + 1) / H };
    }
  }

  /* the amenity text: the widest line's extent */
  const lines = [...document.querySelectorAll('.amenity-line')];
  let am = null;
  for (const el of lines) {
    const b = el.getBoundingClientRect();
    am = am ? { l: Math.min(am.l, b.left), r: Math.max(am.r, b.right) }
            : { l: b.left, r: b.right };
  }
  /* Each line's WORDS, measured with a Range — the line elements are blocks,
     so their own rect is the container's width and says nothing about where
     the text inside them actually sits. */
  const lineCentres = lines.map((el) => {
    const r = document.createRange();
    r.selectNodeContents(el);
    const b = r.getBoundingClientRect();
    return { c: (b.left + b.right) / 2, l: b.left, r: b.right };
  });

  /* One rect per RENDERED row — an authored line that wraps returns several.
     Each row's own centre is what the eye reads as "centred", so a row that
     ends on an in-flow separator shows up here as an outlier. */
  const rows = [];
  for (const el of lines) {
    const r = document.createRange();
    r.selectNodeContents(el);
    /* getClientRects() gives a rect per inline FRAGMENT, several to a row, so
       they are grouped by their top edge to recover the rows themselves.
       Ranges over TEXT NODES only, so a separator drawn with ::after is not
       counted — what is measured is where the WORDS sit, which is what the eye
       reads as centred. */
    const texts = [];
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let t;
    while ((t = walk.nextNode())) if (t.nodeValue.trim()) texts.push(t);
    const rects = [];
    for (const node of texts) {
      const rr = document.createRange();
      rr.selectNodeContents(node);
      for (const b of rr.getClientRects()) rects.push(b);
    }
    const byTop = new Map();
    for (const b of rects) {
      if (b.width < 1) continue;
      const key = Math.round(b.top);
      const g = byTop.get(key);
      byTop.set(
        key,
        g ? { l: Math.min(g.l, b.left), r: Math.max(g.r, b.right) }
          : { l: b.left, r: b.right },
      );
    }
    for (const g of byTop.values()) {
      rows.push({ l: +g.l.toFixed(1), r: +g.r.toFixed(1),
                  c: +((g.l + g.r) / 2).toFixed(1), w: +(g.r - g.l).toFixed(1) });
    }
  }

  /* How wide each authored line WANTS to be, and how wide the box lets it be.
     A line wider than its box wraps, and a wrapped row can end on a separator
     that was meant to sit between two items — which pushes that row's words
     left of every other row's. */
  const listBox = lines[0]?.parentElement;
  const natural = lines.map((el) => {
    const prev = el.style.whiteSpace;
    el.style.whiteSpace = 'nowrap';
    const r = document.createRange();
    r.selectNodeContents(el);
    const w = r.getBoundingClientRect().width;
    el.style.whiteSpace = prev;
    return Math.round(w);
  });
  const boxW = listBox ? listBox.getBoundingClientRect().width : null;

  const label = [...document.querySelectorAll('p')]
    .find((p) => /^amenities$/i.test(p.textContent.trim()));
  const sub = document.querySelector('header p');
  const aside = document.querySelector('aside');

  /* Everything the picture layer carries, as one box — the number that says
     how much of the picture's edge may be cropped before the composition
     starts losing pieces. */
  let bounds = null;
  const grow = (b) => {
    if (!b || (!b.width && !b.height)) return;
    bounds = bounds
      ? { l: Math.min(bounds.l, b.left), r: Math.max(bounds.r, b.right),
          t: Math.min(bounds.t, b.top), b: Math.max(bounds.b, b.bottom) }
      : { l: b.left, r: b.right, t: b.top, b: b.bottom };
  };
  for (const el of [img, sub, label, aside]) if (el) grow(el.getBoundingClientRect());
  for (const el of lines) {
    const rr = document.createRange();
    rr.selectNodeContents(el);
    for (const b of rr.getClientRects()) grow(b);
  }

  return {
    bounds, tower, mark, ink,
    amenities: am,
    label: label ? R(label) : null,
    sub: sub ? R(sub) : null,
    aside: aside ? R(aside) : null,
    lineCentres,
    rows,
    natural,
    boxW,
    lines: lines.length,
  };
})()`;

const num = (v, n = 0) => (v == null ? "—" : v.toFixed(n));
const pad = (s, n) => String(s).padEnd(n);

console.log(
  pad("project", 19) +
    pad("towerL", 8) +
    pad("towerR", 8) +
    pad("skyL", 7) +
    pad("skyR", 7) +
    pad("markC", 8) +
    pad("inkC", 8) +
    pad("amenC", 8) +
    pad("drift", 7) +
    pad("asideC", 8) +
    pad("lines", 6) +
    pad("rows", 6) +
    "row spread",
);

const out = {};
for (const id of ids) {
  await send("Page.navigate", { url: `${ORIGIN}/projects/${id}` }, sessionId);
  await sleep(1200);
  await send(
    "Runtime.evaluate",
    {
      expression: `(() => { const b = [...document.querySelectorAll('button')]
        .find((x) => /enter|continue|full/i.test(x.textContent || '')); if (b) b.click(); })()`,
    },
    sessionId,
  );
  await sleep(3600);
  const { result } = await send(
    "Runtime.evaluate",
    { expression: PROBE, awaitPromise: true, returnByValue: true },
    sessionId,
  );
  const m = result.value;
  if (!m) {
    console.log(pad(id, 19) + "probe failed");
    continue;
  }
  const markC = m.mark ? m.mark.l + m.mark.w / 2 : null;
  const inkC =
    m.mark && m.ink ? m.mark.l + ((m.ink.x0 + m.ink.x1) / 2) * m.mark.w : null;
  const amenC = m.amenities ? (m.amenities.l + m.amenities.r) / 2 : null;
  const asideC = m.aside ? m.aside.l + m.aside.w / 2 : null;
  const skyL = m.tower ? Math.max(0, m.tower.l) / 2 : null;
  const skyR = m.tower ? (Math.min(1920, m.tower.r) + 1920) / 2 : null;

  out[id] = { ...m, markC, inkC, amenC, asideC, skyL, skyR };
  console.log(
    pad(id, 19) +
      pad(num(m.tower?.l), 8) +
      pad(num(m.tower?.r), 8) +
      pad(num(skyL), 7) +
      pad(num(skyR), 7) +
      pad(num(markC, 1), 8) +
      pad(num(inkC, 1), 8) +
      pad(num(amenC, 1), 8) +
      pad(inkC != null && amenC != null ? (inkC - amenC).toFixed(1) : "—", 7) +
      pad(num(asideC, 1), 8) +
      pad(m.lines, 6) +
      /* how far apart the lines' own centres are: the number that makes a
         centred block look crooked */
      pad(m.rows?.length ?? "—", 6) +
      (m.rows?.length
        ? (
            Math.max(...m.rows.map((x) => x.c)) -
            Math.min(...m.rows.map((x) => x.c))
          ).toFixed(1)
        : "—"),
  );
}

const file = path.join(os.tmpdir(), "notan-measure.json");
fs.writeFileSync(file, JSON.stringify(out, null, 2));
console.log(`\nfull measurements → ${file}`);
ws.close();
process.exit(0);
