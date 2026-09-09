/**
 * How wide must each project's artboard be drawn so its "notan" matches?
 *
 *   node scripts/logo-metrics.mjs           # print the table
 *   node scripts/logo-metrics.mjs --write   # write headerLogoClass into the data
 *
 * Every project mark is the same "notan" wordmark with the project's name set
 * under it — but at a different scale inside a different artboard. The
 * wordmark is 79.4% of the Terraces artboard and only 66.7% of the Lands End
 * one, so one shared width class renders the brand at ten different sizes.
 * That is what this solves: `w` per project such that the WORDMARK lands on
 * one width, and the negative margins that trim the artboard's transparent
 * padding back to the mark's own ink.
 *
 * Finding the wordmark, without eyeballing it: the wordmark and the name below
 * are joined only by the thin descender swirl, so a profile of "how wide is
 * the drawing at this height" reads as a broad plateau (the wordmark), a sharp
 * neck (the swirl on its own), then the name. The narrowest row in the middle
 * of the ink is the split, and it is found rather than guessed.
 *
 * The profile is read off a RASTER of each mark, not off the SVG's path data.
 * Several of these files draw inside transformed groups, and a parser that
 * ignores `transform` measures them wildly wrong — Lands End reads as 17% of
 * its artboard instead of 67%. Rendering the file is the only way to measure
 * what will actually be on screen, so this drives headless Chrome. Set CHROME
 * if it is installed somewhere unusual.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LOGO_DIR = path.join(ROOT, "src/assets/Buildings_Logo");
const DATA = path.join(ROOT, "src/components/Building/buildingViewsData.js");

/* The width Notan Terraces' "notan" is DRAWN at, per breakpoint — the ladder
   every other project is matched to. Not the width its class asks for: a
   shared `2xl:h-75` capped the square marks, so at 3xl a `w-80` (320px) mark
   actually drew at 300. These are the drawn widths, multiplied by the share of
   the Terraces artboard its wordmark occupies. */
const TERRACE_DRAWN = {
  "": 256,
  "sm:": 288,
  "md:": 400,
  "lg:": 184,
  "xl:": 200,
  "2xl:": 264,
  "3xl:": 300,
  "4xl:": 360,
};
const TERRACE_MARK_W = 0.79;

const LOGOS = {
  "notan-dc": "notan D.C. logo.svg",
  "notan-edge": "notan edge logo.svg",
  "notan-jewel": "notan jewel logo.svg",
  "notan-space": "notan spaces.svg",
  "notan-terrace": "notan Terraces logo.svg",
  "notan-crown": "notan Crown logo.png",
  "notan-lands-end": "notan Lands End logo.svg",
  "notan-views": "notan Views logo.svg",
  "notan-beach-house": "notan beach house logo.svg",
  "notan-tides": "Notan Tides.svg",
};

const CHROME_CANDIDATES = [
  process.env.CHROME,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

const CHROME = CHROME_CANDIDATES.find((p) => fs.existsSync(p));
if (!CHROME) {
  console.error("Could not find Chrome. Set CHROME=/path/to/chrome and retry.");
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const PORT = 9455;
const userDir = fs.mkdtempSync(path.join(os.tmpdir(), "logo-metrics-"));
const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${userDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--allow-file-access-from-files", // so the canvas may be read back
    "--hide-scrollbars",
    "about:blank",
  ],
  { stdio: "ignore" },
);

const cleanup = () => {
  chrome.kill();
  try {
    fs.rmSync(userDir, { recursive: true, force: true });
  } catch {
    /* a locked profile dir is harmless */
  }
};
process.on("exit", cleanup);

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

/* The page has to BE a file:// document before it may read file:// images —
   an about:blank page has a null origin and every load is refused. */
const blank = path.join(userDir, "blank.html");
fs.writeFileSync(
  blank,
  "<!doctype html><meta charset=utf-8><title>probe</title>",
);
const { targetId } = await send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await send("Target.attachToTarget", {
  targetId,
  flatten: true,
});
await send("Page.enable", {}, sessionId);
await send("Runtime.enable", {}, sessionId);
await send("Page.navigate", { url: "file://" + encodeURI(blank) }, sessionId);
await sleep(400);

/** Rasterise one mark and read the wordmark and ink out of it. */
const PROBE = (url) => `(async () => {
  const N = 1200;
  const img = new Image();
  await new Promise((res, rej) => { img.onload = res; img.onerror = () => rej(new Error("load")); img.src = ${JSON.stringify(url)}; });
  const nw = img.naturalWidth, nh = img.naturalHeight, ar = nw / nh;
  const W = N, H = Math.max(1, Math.round(N / ar));
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d", { willReadFrequently: true });
  g.drawImage(img, 0, 0, W, H);
  const d = g.getImageData(0, 0, W, H).data;

  const A = 12;                                   // alpha counts as ink
  const L = new Array(H).fill(W), R = new Array(H).fill(-1);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      if (d[(y * W + x) * 4 + 3] > A) { if (x < L[y]) L[y] = x; if (x > R[y]) R[y] = x; }

  let y0 = -1, y1 = -1;
  for (let y = 0; y < H; y++) if (R[y] >= 0) { if (y0 < 0) y0 = y; y1 = y; }
  if (y0 < 0) throw new Error("no ink");
  const width = (y) => (R[y] < 0 ? 0 : R[y] - L[y] + 1);

  const a = y0 + Math.round((y1 - y0) * 0.25), z = y0 + Math.round((y1 - y0) * 0.75);
  let neck = a;
  for (let y = a; y <= z; y++) if (width(y) < width(neck)) neck = y;

  let markW = 0;
  for (let y = y0; y <= neck; y++) if (width(y) > markW) markW = width(y);

  return { ar, markW: markW / W, inkTop: y0 / H, inkBottom: (y1 + 1) / H };
})()`;

const rows = [];
for (const [id, file] of Object.entries(LOGOS)) {
  const url = "file://" + encodeURI(path.join(LOGO_DIR, file));
  const { result, exceptionDetails } = await send(
    "Runtime.evaluate",
    { expression: PROBE(url), returnByValue: true, awaitPromise: true },
    sessionId,
  );
  if (exceptionDetails) {
    console.error(
      `${id}: ${exceptionDetails.exception?.description || exceptionDetails.text}`,
    );
    process.exit(1);
  }
  const m = result.value;
  /* Solve this artboard's width so its wordmark lands on the Terraces ladder.
     `h-auto` keeps the artboard's own ratio, so the drawn width IS this. */
  const cls = Object.entries(TERRACE_DRAWN)
    .map(([bp, drawn]) => {
      const target = drawn * TERRACE_MARK_W;
      return `${bp}w-[${Math.round((target / m.markW) * 10) / 10}px]`;
    })
    .join(" ");
  /* Trim the artboard's transparent padding back to the ink. A % margin on the
     image resolves against its own width, so an artboard's vertical padding
     has to be divided by its ratio to become a share of that width — which is
     what makes one pair cover every breakpoint. */
  const trim = `mt-[-${+((m.inkTop / m.ar) * 100).toFixed(2)}%] mb-[-${+(((1 - m.inkBottom) / m.ar) * 100).toFixed(2)}%]`;
  rows.push({ id, m, cls, trim });
}

console.log(`wordmark ladder, from Notan Terraces as drawn\n`);
console.log(
  "id".padEnd(19),
  "artboard AR".padStart(11),
  "wordmark".padStart(9),
  "headerLogoClass",
);
for (const { id, m, cls } of rows)
  console.log(
    id.padEnd(19),
    m.ar.toFixed(4).padStart(11),
    (m.markW * 100).toFixed(2).padStart(8) + "%",
    cls,
  );

if (process.argv.includes("--write")) {
  let src = fs.readFileSync(DATA, "utf8");
  let n = 0;
  for (const { id, cls, trim } of rows) {
    const re = new RegExp(`("${id}": \\{[\\s\\S]*?headerLogoClass:\\s*)"[^"]*"`);
    if (!re.test(src)) continue;
    src = src.replace(re, `$1"${cls}"`);
    n++;
    /* the ink trim, written in place or added after the width ladder */
    for (const [key, val] of [["headerLogoTrim", trim]]) {
      const has = new RegExp(`("${id}": \\{[\\s\\S]*?${key}:\\s*)"[^"]*"`);
      if (has.test(src)) {
        src = src.replace(has, `$1"${val}"`);
      } else {
        const after = new RegExp(
          `("${id}": \\{[\\s\\S]*?headerLogoClass:\\s*"[^"]*",\\n)`,
        );
        src = src.replace(after, `$1    ${key}: "${val}",\n`);
      }
    }
  }
  fs.writeFileSync(DATA, src);
  console.log(`\nwrote ${n} headerLogoClass values into buildingViewsData.js`);
}

ws.close();
process.exit(0);
