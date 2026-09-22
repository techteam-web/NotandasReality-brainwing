/**
 * Screenshots the running site at any set of viewport sizes.
 *
 *   npm run dev                                  # in another shell
 *   node scripts/shots.mjs 1920x1080 1024x768    # → /tmp/notan-shots/*.png
 *   node scripts/shots.mjs --url /projects/notan-tides 1920x1080
 *   node scripts/shots.mjs --out ./shots 2560x1440
 *
 * The composition here is a fixed one scaled to the window (see
 * components/DesignStage.jsx), so "does it still look right" is a question
 * about SHAPES of window, not about breakpoints — and the only honest way to
 * answer it is to look. This drives the same headless Chrome over CDP that
 * logo-metrics.mjs does; no extra dependency to install.
 *
 * Sizes are `WIDTHxHEIGHT`. Named presets are accepted too — `ipad-pro`,
 * `ipad-mini`, `fhd`, `lg` — see PRESETS.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const PORT = 9456;
const CHROME_CANDIDATES = [
  process.env.CHROME,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

/* The shapes worth checking: the reference, the two rungs that were being
   hand-tuned, the two tablets, and the two extremes. */
const PRESETS = {
  lg: [1024, 768],
  "lg-tall": [1024, 900],
  laptop: [1366, 768],
  "mac-14": [1512, 982],
  fhd: [1920, 1080],
  "fhd-tall": [1920, 1200],
  qhd: [2560, 1440],
  ultrawide: [3440, 1440],
  "ipad-pro": [1024, 1366],
  "ipad-pro-land": [1366, 1024],
  "ipad-mini": [744, 1133],
  "ipad-mini-land": [1133, 744],
  "ipad-air": [820, 1180],
};

const args = process.argv.slice(2);
let url = "/";
let outDir = path.join(os.tmpdir(), "notan-shots");
let origin = "http://localhost:5173";
const sizes = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--url") url = args[++i];
  else if (args[i] === "--out") outDir = args[++i];
  else if (args[i] === "--origin") origin = args[++i];
  else if (PRESETS[args[i]]) sizes.push([args[i], ...PRESETS[args[i]]]);
  else {
    const m = args[i].match(/^(\d+)x(\d+)$/);
    if (!m) {
      console.error(`not a size or preset: ${args[i]}`);
      process.exit(1);
    }
    sizes.push([args[i], +m[1], +m[2]]);
  }
}
if (!sizes.length) sizes.push(["fhd", ...PRESETS.fhd]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const CHROME = CHROME_CANDIDATES.find((p) => fs.existsSync(p));
if (!CHROME) {
  console.error("Could not find Chrome. Set CHROME=/path/to/chrome.");
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });
const userDir = fs.mkdtempSync(path.join(os.tmpdir(), "notan-shots-"));
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

const { targetId } = await send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await send("Target.attachToTarget", {
  targetId,
  flatten: true,
});
await send("Page.enable", {}, sessionId);
await send("Runtime.enable", {}, sessionId);

const slug = url.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "home";
for (const [name, w, h] of sizes) {
  await send(
    "Emulation.setDeviceMetricsOverride",
    { width: w, height: h, deviceScaleFactor: 1, mobile: false },
    sessionId,
  );
  await send("Page.navigate", { url: origin + url }, sessionId);
  /* The entry gate wants a click, and the route transition runs an ink wave
     for ~2.5s before the page is readable. Wait it out, then dismiss the
     fullscreen prompt if it is up and wait again. */
  await sleep(1200);
  await send(
    "Runtime.evaluate",
    {
      expression: `(() => {
        const btn = [...document.querySelectorAll('button')]
          .find((b) => /enter|continue|full/i.test(b.textContent || ''));
        if (btn) { btn.click(); return 'clicked: ' + btn.textContent.trim(); }
        return 'no gate button';
      })()`,
    },
    sessionId,
  );
  await sleep(3800); // the ink wave and the GSAP intros
  const { data } = await send(
    "Page.captureScreenshot",
    { format: "png" },
    sessionId,
  );
  const file = path.join(outDir, `${slug}-${name}-${w}x${h}.png`);
  fs.writeFileSync(file, Buffer.from(data, "base64"));
  console.log(file);
}
ws.close();
process.exit(0);
