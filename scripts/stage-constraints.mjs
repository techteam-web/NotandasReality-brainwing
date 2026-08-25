/**
 * Where may the hero text stand?
 *
 *   node scripts/stage-constraints.mjs              # every building
 *   node scripts/stage-constraints.mjs notan-space  # just one
 *   node scripts/stage-constraints.mjs --sweep      # add the continuity sweep
 *
 * The building page lays its text over a photo that `object-cover` crops
 * differently at every viewport shape. ImageStage gives that text the photo's
 * own coordinate space, and this script checks the numbers that go in it:
 *
 *   keep-out zone  the union box of every floor cut-out — the tower itself,
 *                  as a percentage of the photo. Text must stay off it.
 *   visible window the part of the photo that survives the cover crop at a
 *                  given viewport. Text must stay inside it.
 *
 * Both are computed, never eyeballed: the cut-outs come from the same parser
 * the page renders with (floorGeometry.js), and the text boxes are measured
 * from the class strings buildingViewsData.js actually ships.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildFloors,
  buildFloorsFromCombined,
  floorsBounds,
  boundsToPercent,
  pointsBounds,
  pathBounds,
  parseViewBox,
} from "../src/components/Building/floorGeometry.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SVG_DIR = path.join(ROOT, "src/assets/Building_Floor_SVG");
const PHOTO_DIR = path.join(ROOT, "src/assets/ViewsBuildings");
const LOGO_DIR = path.join(ROOT, "src/assets/Buildings_Logo");
const VIEWS_FILE = path.join(
  ROOT,
  "src/components/Building/buildingViewsData.js",
);
const BUILDINGS_FILE = path.join(
  ROOT,
  "src/components/Buildings/buildingsData.js",
);
const AMENITIES_FILE = path.join(
  ROOT,
  "src/components/Building/AmenitiesData.js",
);

/* Mirrors the globs in floorShapes.js and the imports in buildingViewsData.js.
   `combined: true` means one elevation SVG holding every floor. */
const SOURCES = {
  "notan-dc": {
    dir: "Nothan_DC",
    photo: "Notan-DC.webp",
    logo: "notan D.C. logo.svg",
  },
  "notan-edge": {
    dir: "Nothan_Edge",
    photo: "Notan_EDGE.webp",
    logo: "notan edge logo.svg",
  },
  "notan-jewel": {
    combined: "Nothan_jewel/nothan_jewel-2.8x.svg",
    photo: "Notan_jewel_sketch.webp",
    logo: "notan jewel logo.svg",
  },
  "notan-space": {
    combined: "Nothan_space/Notan_space_.svg",
    photo: "Notan_space_sketch.webp",
    logo: "notan spaces.svg",
  },
  "notan-terrace": {
    combined: "Nothan_terrace/Notan_terrace_2.8x.svg",
    photo: "Notan_terrace_sketch.webp",
    logo: "notan Terraces logo.svg",
  },
  "notan-crown": {
    combined: "Nothan_crown/Notan_crown_.svg",
    photo: "Notan_crown_sketch.webp",
    logo: "notan Crown logo.png",
  },
  "notan-lands-end": {
    combined: "Notan_Lands-End/Notan_Lands-End_building_Cutout.svg",
    photo: "Notan_Lands-End.webp",
    logo: "notan Lands End logo.svg",
  },
  "notan-views": {
    dir: "Notan_Views",
    photo: "notan_Views.webp",
    logo: "notan Views logo.svg",
  },
  "notan-beach-house": {
    combined: "Notan_Beach-House/NOTAN-BEACH-HOUSE-BUILDINGSVG.svg",
    photo: "Notan_Beach-House.webp",
    logo: "notan beach house logo.svg",
  },
  "notan-tides": {
    combined: "Notan_Tides/notan-Tides_BuildingSvg.svg",
    photo: "Notan_Tides.webp",
    logo: "Notan Tides.svg",
  },
};

/* Same order as the brief. Height matters as much as width: the same width
   with a different height is a different crop. */
const MATRIX = [
  [1024, 768],
  [1280, 800],
  [1280, 1024],
  [1366, 768],
  [1440, 900],
  [1512, 982],
  [1536, 864],
  [1600, 1200],
  [1920, 1080],
  [1920, 1200],
  [2560, 1440],
  [3440, 1440],
];

/** Text must clear the tower by this much, as a percentage of photo width. */
const KEEP_OUT_MARGIN = 2;

/**
 * Slack held back when turning a building's block boxes into the range of
 * viewport SHAPES it survives. The box edges come partly from measured text,
 * and measured text is an estimate; a percent of the photo covers roughly a
 * tenth of error on the widest block before the band is wrong.
 */
const RATIO_GUARD = 1;

/**
 * The smallest each kind of type may render at before the stage stops being
 * worth using and the flow layout should take over. These are not aspirations
 * — they are what the page already ships at its smallest breakpoint today
 * (amenity items `lg:text-[10px]`, subtitle `lg:text-[8px]`), so the flow
 * fallback triggers where the design was already at its limit rather than
 * somewhere new.
 */
const MIN_TYPE_PX = { body: 10, label: 8, display: 16 };

/* ---------------------------------------------------------------- images */

/** Intrinsic size from a WebP/PNG header — the browser's naturalWidth/Height. */
const imageSize = (file) => {
  const buf = fs.readFileSync(file);
  if (buf.toString("ascii", 0, 4) === "RIFF") {
    const fmt = buf.toString("ascii", 12, 16);
    if (fmt === "VP8X")
      return { w: 1 + buf.readUIntLE(24, 3), h: 1 + buf.readUIntLE(27, 3) };
    if (fmt === "VP8 ")
      return {
        w: buf.readUInt16LE(26) & 0x3fff,
        h: buf.readUInt16LE(28) & 0x3fff,
      };
    if (fmt === "VP8L") {
      const bits = buf.readUInt32LE(21);
      return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 };
    }
  }
  if (buf.readUInt32BE(0) === 0x89504e47)
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  throw new Error(`cannot read the size of ${path.basename(file)}`);
};

/**
 * The logo's INK box inside its own canvas.
 *
 * The square marks sit in the middle of a 2000×2000 artboard with transparent
 * padding all round; what the eye sees — and what must clear the tower — is
 * the ink, not the artboard.
 */
const logoInk = (file) => {
  if (file.endsWith(".png")) {
    const { w, h } = imageSize(file);
    // a tight-cropped bitmap IS its own ink box
    return { ar: w / h, x: 0, y: 0, w: 1, h: 1 };
  }
  const raw = fs.readFileSync(file, "utf8");
  const vb = parseViewBox(raw.match(/viewBox="([^"]+)"/)?.[1]);
  if (!vb) throw new Error(`no viewBox in ${path.basename(file)}`);

  let box = null;
  const fold = (b) => {
    box = box
      ? {
          minX: Math.min(box.minX, b.minX),
          minY: Math.min(box.minY, b.minY),
          maxX: Math.max(box.maxX, b.maxX),
          maxY: Math.max(box.maxY, b.maxY),
        }
      : b;
  };
  for (const m of raw.matchAll(/\sd="([^"]+)"/g)) fold(pathBounds(m[1]));
  for (const m of raw.matchAll(/points="([^"]+)"/g)) fold(pointsBounds(m[1]));
  for (const m of raw.matchAll(/<rect\b[^>]*>/g)) {
    const num = (k) => Number(m[0].match(new RegExp(`${k}="([-\\d.]+)"`))?.[1]);
    const [x, y, w, h] = [
      num("x") || 0,
      num("y") || 0,
      num("width"),
      num("height"),
    ];
    if (Number.isFinite(w) && Number.isFinite(h))
      fold({ minX: x, minY: y, maxX: x + w, maxY: y + h });
  }
  if (!box) throw new Error(`no drawable ink in ${path.basename(file)}`);

  return {
    ar: vb.w / vb.h,
    // ink as a fraction of the canvas
    x: (box.minX - vb.x) / vb.w,
    y: (box.minY - vb.y) / vb.h,
    w: (box.maxX - box.minX) / vb.w,
    h: (box.maxY - box.minY) / vb.h,
  };
};

/* ------------------------------------------------------- text measurement */

/* Adobe Times-Roman advance widths, per 1000 units of em. The page renders in
   "Times New Roman", which is metrically the same face. */
const W = {
  " ": 250,
  "!": 333,
  '"': 408,
  "#": 500,
  $: 500,
  "%": 833,
  "&": 778,
  "'": 333,
  "(": 333,
  ")": 333,
  "*": 500,
  "+": 564,
  ",": 250,
  "-": 333,
  ".": 250,
  "/": 278,
  0: 500,
  1: 500,
  2: 500,
  3: 500,
  4: 500,
  5: 500,
  6: 500,
  7: 500,
  8: 500,
  9: 500,
  ":": 278,
  ";": 278,
  "<": 564,
  "=": 564,
  ">": 564,
  "?": 444,
  "@": 921,
  A: 722,
  B: 667,
  C: 667,
  D: 722,
  E: 611,
  F: 556,
  G: 722,
  H: 722,
  I: 333,
  J: 389,
  K: 722,
  L: 611,
  M: 889,
  N: 722,
  O: 722,
  P: 556,
  Q: 722,
  R: 667,
  S: 556,
  T: 611,
  U: 722,
  V: 722,
  W: 944,
  X: 722,
  Y: 722,
  Z: 611,
  "[": 333,
  "\\": 278,
  "]": 333,
  "^": 469,
  _: 500,
  "`": 333,
  a: 444,
  b: 500,
  c: 444,
  d: 500,
  e: 444,
  f: 333,
  g: 500,
  h: 500,
  i: 278,
  j: 278,
  k: 500,
  l: 278,
  m: 778,
  n: 500,
  o: 500,
  p: 500,
  q: 500,
  r: 333,
  s: 389,
  t: 278,
  u: 500,
  v: 500,
  w: 722,
  x: 500,
  y: 500,
  z: 444,
  "{": 480,
  "|": 200,
  "}": 480,
  "~": 541,
  "’": 333,
  "‘": 333,
  "“": 444,
  "”": 444,
  "–": 500,
  "—": 1000,
  Ç: 667,
  é: 444,
  "°": 400,
};

/**
 * Width of a run of text, in the same unit as `size`.
 * `tracking` is letter-spacing in em; CSS adds it after every character.
 */
const runWidth = (text, size, tracking = 0, bold = false) => {
  let em = 0;
  for (const ch of text) em += (W[ch] ?? 500) / 1000 + tracking;
  // Times Bold runs a few percent wider than Roman across a mixed line
  return em * size * (bold ? 1.06 : 1);
};

/** Greedy word wrap. Returns the line count and the widest line. */
const wrap = (text, size, maxWidth, tracking = 0, bold = false) => {
  const words = text.split(/\s+/).filter(Boolean);
  const space = runWidth(" ", size, tracking, bold);
  let lines = 1;
  let cur = 0;
  let widest = 0;
  for (const word of words) {
    const w = runWidth(word, size, tracking, bold);
    const next = cur === 0 ? w : cur + space + w;
    if (cur > 0 && next > maxWidth) {
      widest = Math.max(widest, cur);
      lines += 1;
      cur = w;
    } else {
      cur = next;
    }
  }
  widest = Math.max(widest, cur);
  return { lines, widest };
};

/* ------------------------------------------------- Tailwind class reading */

/**
 * Lengths in the class strings, converted to cqw — 1cqw is 1% of the photo's
 * width, which is also 1% of the stage, so cqw and "stage percent across" are
 * the same number. Anything absolute (px, rem) has to be resolved against the
 * stage width of the viewport being tested, which is why every box is
 * recomputed per row of the matrix rather than measured once.
 */
const toCqw = (token, ctx) => {
  const t = String(token).trim();
  const fn = t.match(/^(max|min|clamp)\((.*)\)$/);
  if (fn) {
    const args = splitArgs(fn[2]).map((a) => toCqw(a, ctx));
    if (fn[1] === "max") return Math.max(...args);
    if (fn[1] === "min") return Math.min(...args);
    return Math.min(Math.max(args[0], args[1]), args[2]);
  }
  const m = t.match(/^(-?[\d.]+)(cqw|px|rem|em|%)?$/);
  if (!m) throw new Error(`length not understood: "${token}"`);
  const n = Number(m[1]);
  switch (m[2]) {
    case "cqw":
    case "%":
    case undefined:
      return n;
    case "px":
      return (n / ctx.stageW) * 100;
    case "rem":
      return ((n * 16) / ctx.stageW) * 100;
    case "em":
      return n * (ctx.fontSize ?? 0);
    default:
      return n;
  }
};

const splitArgs = (s) => {
  const out = [];
  let depth = 0;
  let cur = "";
  for (const ch of s) {
    if (ch === "(") depth += 1;
    if (ch === ")") depth -= 1;
    if (ch === "," && depth === 0) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
};

/** Pull `prefix-[value]` out of a class string. Underscores are CSS spaces. */
const arb = (classes, prefix) => {
  const re = new RegExp(`(?:^|\\s)-?${prefix}-\\[([^\\]]+)\\]`);
  const m = (classes ?? "").match(re);
  if (!m) return null;
  const raw = m[1].replace(/_/g, " ");
  return m[0].trim().startsWith("-") ? `-${raw}` : raw;
};

const need = (classes, prefix, where) => {
  const v = arb(classes, prefix);
  if (v === null)
    throw new Error(`${where}: missing ${prefix}-[…] in "${classes}"`);
  return v;
};

/** Any responsive prefix left in a staged class string is a bug: it jumps. */
const BREAKPOINT_RE = /(?:^|\s)(sm|md|lg|xl|2xl|3xl|4xl|5xl|mob|max-\w+):/g;
const breakpointsIn = (classes) => [
  ...new Set([...(classes ?? "").matchAll(BREAKPOINT_RE)].map((m) => m[1])),
];

/* --------------------------------------------------- reading the app data */

/** The object literal for one key, brace-matched out of a source file. */
const sliceObject = (src, key) => {
  const at = src.indexOf(`"${key}"`);
  if (at < 0) return null;
  const open = src.indexOf("{", at);
  let depth = 0;
  for (let i = open; i < src.length; i += 1) {
    if (src[i] === "{") depth += 1;
    else if (src[i] === "}") {
      depth -= 1;
      if (depth === 0) return src.slice(open, i + 1);
    }
  }
  return null;
};

/** `key: "value"` (possibly wrapped onto the next line) inside a slice. */
const stringProp = (slice, key) => {
  const m = slice.match(new RegExp(`\\b${key}\\s*:\\s*\\n?\\s*"([^"]*)"`));
  return m ? m[1] : null;
};

const readViews = () => {
  const src = fs.readFileSync(VIEWS_FILE, "utf8");
  const views = {};
  for (const id of Object.keys(SOURCES)) {
    const slice = sliceObject(src, id);
    if (!slice) continue;
    views[id] = {
      staged: /\bstage\s*:\s*true\b/.test(slice),
      viewBox: stringProp(slice, "viewBox"),
      headerClass: stringProp(slice, "headerClass"),
      headerLogoClass: stringProp(slice, "headerLogoClass"),
      headerSubClass: stringProp(slice, "headerSubClass"),
      asideClass: stringProp(slice, "asideClass"),
      amenityClass: stringProp(slice, "amenityClass"),
      amenityListClass: stringProp(slice, "amenityListClass"),
      amenityItemClass: stringProp(slice, "amenityItemClass"),
    };
  }
  return views;
};

const readBuildings = () => {
  const src = fs.readFileSync(BUILDINGS_FILE, "utf8");
  const out = {};
  for (const m of src.matchAll(/id:\s*"([^"]+)"/g)) {
    const seg = src.slice(m.index, src.indexOf("},", m.index));
    const grab = (k) =>
      seg.match(new RegExp(`^\\s*${k}:\\s*"([^"]*)"`, "m"))?.[1];
    out[m[1]] = {
      name: grab("name"),
      area: grab("area"),
      subtitle: grab("subtitle"),
    };
  }
  return out;
};

const readAmenities = () => {
  const src = fs.readFileSync(AMENITIES_FILE, "utf8");
  const out = {};
  for (const id of Object.keys(SOURCES)) {
    const slice = sliceObject(src, id);
    if (!slice) continue;
    out[id] = [...slice.matchAll(/:\s*"([^"]*)"/g)]
      .flatMap((m) => m[1].split("|"))
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return out;
};

/* --------------------------------------------------------- the geometry */

const floorsFor = (id) => {
  const src = SOURCES[id];
  if (src.combined)
    return buildFloorsFromCombined(
      fs.readFileSync(path.join(SVG_DIR, src.combined), "utf8"),
    );
  const dir = path.join(SVG_DIR, src.dir);
  const files = {};
  for (const name of fs.readdirSync(dir))
    if (name.endsWith(".svg"))
      files[`${src.dir}/${name}`] = fs.readFileSync(
        path.join(dir, name),
        "utf8",
      );
  return buildFloors(files);
};

/** The photo's rendered box and the slice of it the viewport can see. */
const stageFor = (vw, vh, ar) => {
  const stageW = Math.max(vw, vh * ar);
  const stageH = Math.max(vh, vw / ar);
  const cropX = ((stageW - vw) / 2 / stageW) * 100;
  const cropY = ((stageH - vh) / 2 / stageH) * 100;
  return {
    stageW,
    stageH,
    visible: {
      left: cropX,
      right: 100 - cropX,
      top: cropY,
      bottom: 100 - cropY,
    },
  };
};

/* ------------------------------------------------- the three text blocks */

/*
 * These mirror the staged markup in BuildingPage.jsx one for one. The shared
 * numbers live in STAGE_TYPE there and are repeated here; if you change one,
 * change the other and re-run this script.
 */
const STAGE_TYPE = {
  asideLabelSize: 0.95,
  asideLabelTracking: 0.16,
  asideLead: 1.2,
  asideGap: 0.9,
  asideNumRow: 4.4,
  asideNumSize: 4,
  amenityLabelSize: 0.75,
  amenityLabelTracking: 0.42,
  amenityRuleGap: 0.6,
  amenityListGap: 0.7,
  amenityRowGap: 0.25,
  amenityLead: 1.35,
  subLead: 1.2,
};

/**
 * Each block's box, in cqw across and cqw down (multiply the down figure by
 * `ar` to read it as a percentage of the photo's height).
 */
const blockBoxes = (view, building, amenities, logo, ctx) => {
  const boxes = {};
  const T = STAGE_TYPE;

  /* ---- header: the logo's ink, plus the subtitle under it ---- */
  {
    const cls = view.headerClass;
    const x = Number(need(cls, "left", "headerClass").replace("%", ""));
    const y = Number(need(cls, "top", "headerClass").replace("%", ""));
    const logoW = toCqw(
      need(view.headerLogoClass, "w", "headerLogoClass"),
      ctx,
    );
    const logoBoxH = logoW / logo.ar;

    // negative margins trim the artboard's transparent padding away, so the
    // logo's LAYOUT height equals its ink height
    const mt = toCqw(arb(view.headerLogoClass, "mt") ?? "0", ctx);
    const mb = toCqw(arb(view.headerLogoClass, "mb") ?? "0", ctx);
    const inkW = logo.w * logoW;
    const inkH = logo.h * logoBoxH;
    // ink offset from the centre of the img box, positive = ink sits right/low
    const inkDx = (logo.x + logo.w / 2 - 0.5) * logoW;
    const inkDy = (logo.y + logo.h / 2 - 0.5) * logoBoxH;

    const subSize = toCqw(
      need(view.headerSubClass, "text", "headerSubClass"),
      ctx,
    );
    const subTrack = view.headerSubClass.includes("tracking-[")
      ? toCqw(arb(view.headerSubClass, "tracking"), {
          ...ctx,
          fontSize: subSize,
        })
      : 0;
    const subGap = toCqw(arb(view.headerSubClass, "mt") ?? "0", ctx);
    const bold = /\bfont-bold\b/.test(view.headerSubClass);
    const text = (
      building.subtitle || `${building.area}, Mumbai`
    ).toUpperCase();
    const subW = runWidth(text, subSize, subTrack / subSize, bold);
    const subH = T.subLead * subSize;

    // shrink-to-fit: the header is as wide as its widest child
    const width = Math.max(logoW, subW);
    const layoutH = logoBoxH + mt + mb + subGap + subH;
    // top of the layout box, relative to the centre the translate puts at y
    const logoTop = -layoutH / 2 + mt;
    const inkTop = logoTop + logo.y * logoBoxH;
    const subTop = -layoutH / 2 + logoBoxH + mt + mb + subGap;
    const visTop = Math.min(inkTop, subTop);
    const visBottom = Math.max(inkTop + inkH, subTop + subH);

    boxes.header = {
      x,
      y,
      // the ink can sit off-centre in its artboard; the visible box follows it
      left: x + Math.min(inkDx - inkW / 2, -subW / 2),
      right: x + Math.max(inkDx + inkW / 2, subW / 2),
      up: -visTop,
      down: visBottom,
      width,
      detail: `logo ${logoW.toFixed(1)}cqw (ink ${inkW.toFixed(1)}×${inkH.toFixed(1)}), sub ${subW.toFixed(1)}cqw ${subSize.toFixed(2)}cqw type`,
    };
  }

  /* ---- aside: label over the big floor numeral ---- */
  {
    const cls = view.asideClass;
    const x = Number(need(cls, "left", "asideClass").replace("%", ""));
    const y = Number(need(cls, "top", "asideClass").replace("%", ""));
    const width = toCqw(need(cls, "w", "asideClass"), ctx);
    // whichever of the two states is taller
    const lines = Math.max(
      wrap("Now viewing Floor:", T.asideLabelSize, width, T.asideLabelTracking)
        .lines,
      wrap("Pick a floor", T.asideLabelSize, width, T.asideLabelTracking).lines,
    );
    const height =
      lines * T.asideLead * T.asideLabelSize + T.asideGap + T.asideNumRow;
    boxes.aside = {
      x,
      y,
      left: x - width / 2,
      right: x + width / 2,
      up: height / 2,
      down: height / 2,
      width,
      detail: `${width.toFixed(1)}cqw wide, label wraps to ${lines} line${lines > 1 ? "s" : ""}`,
    };
  }

  /* ---- amenities: caption, rule, then a wrapped row of items ---- */
  if (amenities.length) {
    const x = Number(
      need(view.amenityClass, "left", "amenityClass").replace("%", ""),
    );
    const y = Number(
      need(view.amenityClass, "top", "amenityClass").replace("%", ""),
    );
    const width = toCqw(
      need(view.amenityListClass, "w", "amenityListClass"),
      ctx,
    );
    const size = toCqw(
      need(view.amenityItemClass, "text", "amenityItemClass"),
      ctx,
    );
    const sepMargin = toCqw(
      need(view.amenityItemClass, "after:mx", "amenityItemClass"),
      ctx,
    );
    const sepWidth = runWidth("|", size) + sepMargin * 2;

    // flex-wrap, greedy: every item but the last carries its "|" separator
    const items = amenities.map((text, i) => ({
      text,
      w: runWidth(text, size) + (i === amenities.length - 1 ? 0 : sepWidth),
    }));
    const widest = Math.max(...items.map((i) => i.w));
    let rows = 1;
    let cur = 0;
    for (const item of items) {
      if (cur > 0 && cur + item.w > width + 1e-9) {
        rows += 1;
        cur = item.w;
      } else cur += item.w;
    }

    const labelH = T.amenityLead * T.amenityLabelSize;
    const listH = rows * T.amenityLead * size + (rows - 1) * T.amenityRowGap;
    const height = labelH + T.amenityRuleGap + T.amenityListGap + listH;

    boxes.amenity = {
      x,
      y,
      left: x - width / 2,
      right: x + width / 2,
      up: height / 2,
      down: height / 2,
      width,
      overflow: widest > width ? widest - width : 0,
      detail: `${width.toFixed(1)}cqw wide, ${rows} row${rows > 1 ? "s" : ""} at ${size.toFixed(2)}cqw${widest > width ? `  ⚠ widest item ${widest.toFixed(1)}cqw overflows` : ""}`,
    };
  }

  return boxes;
};

/* ------------------------------------------------- type size and its floor */

/**
 * Every type size on the stage, as the raw token so a floor inside it stays
 * visible. `role` picks which minimum in MIN_TYPE_PX applies.
 */
const typeScale = (view) => [
  {
    name: "header subtitle",
    role: "label",
    token: need(view.headerSubClass, "text", "headerSubClass"),
  },
  {
    name: "amenity item",
    role: "body",
    token: need(view.amenityItemClass, "text", "amenityItemClass"),
  },
  {
    name: "aside label",
    role: "body",
    token: `${STAGE_TYPE.asideLabelSize}cqw`,
  },
  {
    name: "aside numeral",
    role: "display",
    token: `${STAGE_TYPE.asideNumSize}cqw`,
  },
  {
    name: "amenity caption",
    role: "label",
    token: `${STAGE_TYPE.amenityLabelSize}cqw`,
  },
];

/**
 * Is an absolute floor doing the work at this stage width?
 *
 * A size written purely in cqw is the same number of cqw at any stage width;
 * one with a px arm is not. So resolve the token at two stage widths and see
 * whether the answer moved — no need to pick the expression apart.
 */
const flooredAt = (token, stageW) =>
  Math.abs(toCqw(token, { stageW }) - toCqw(token, { stageW: stageW * 2 })) >
  1e-9;

/**
 * The smallest stage width at which every size still clears its minimum.
 * Measured against the cqw arm alone (a huge stage width, where no floor can
 * be winning) — this is the width the flow fallback has to take over below,
 * and equally the width below which a floor would otherwise have to kick in.
 */
const minStageWidth = (view) =>
  Math.max(
    ...typeScale(view).map(
      (t) => (MIN_TYPE_PX[t.role] / toCqw(t.token, { stageW: 1e7 })) * 100,
    ),
  );

/** A ratio as the integer fraction a media query wants. */
const asFraction = (r) => `${Math.round(r * 1000)}/1000`;

/**
 * The media query that takes a building OFF the stage: too narrow a shape,
 * too wide a shape, or too small a photo to read.
 */
const flowQuery = ({ ratioMin, ratioMax, stageMin, ar }) => {
  const maxW = Math.ceil(stageMin) - 1;
  const maxH = Math.ceil(stageMin / ar) - 1;
  /* One `or` group, NOT a comma-separated media list: Tailwind's
     @custom-variant keeps only the first condition of a comma list and drops
     the rest silently, which would leave two of these three arms doing
     nothing at all. Verified against the compiled CSS. */
  return `(${[
    `(max-aspect-ratio: ${asFraction(ratioMin)})`,
    Number.isFinite(ratioMax)
      ? `(min-aspect-ratio: ${asFraction(ratioMax)})`
      : null,
    `((max-width: ${maxW}px) and (max-height: ${maxH}px))`,
  ]
    .filter(Boolean)
    .join(" or ")})`;
};

/* -------------------------------------------------------------- checking */

const overlaps = (a, b) =>
  a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

const checkBlock = (box, ar, keepOut, visible) => {
  const rect = {
    left: box.left,
    right: box.right,
    top: box.y - box.up * ar,
    bottom: box.y + box.down * ar,
  };
  const problems = [];

  if (keepOut) {
    const zone = {
      left: keepOut.left - KEEP_OUT_MARGIN,
      right: keepOut.right + KEEP_OUT_MARGIN,
      top: keepOut.top - KEEP_OUT_MARGIN * ar,
      bottom: keepOut.bottom + KEEP_OUT_MARGIN * ar,
    };
    if (overlaps(rect, zone)) problems.push("hits tower");
  }
  if (rect.left < visible.left)
    problems.push(`off L by ${(visible.left - rect.left).toFixed(1)}`);
  if (rect.right > visible.right)
    problems.push(`off R by ${(rect.right - visible.right).toFixed(1)}`);
  if (rect.top < visible.top)
    problems.push(`off T by ${(visible.top - rect.top).toFixed(1)}`);
  if (rect.bottom > visible.bottom)
    problems.push(`off B by ${(rect.bottom - visible.bottom).toFixed(1)}`);

  return { rect, problems };
};

/* ---------------------------------------------------------------- report */

const pct = (n) => `${n.toFixed(1)}%`;
const pad = (s, n) => String(s).padEnd(n);

const run = () => {
  const args = process.argv.slice(2);
  const wantSweep = args.includes("--sweep");
  /* --viewport 1728x1117 — check one specific screen on top of the matrix,
     for when someone asks "what does MY window do". Repeatable. */
  const extra = args
    .filter((a) => a.startsWith("--viewport="))
    .map((a) => a.slice(11).split(/[x×]/).map(Number))
    .filter(([w, h]) => w > 0 && h > 0);
  const matrix = [...MATRIX, ...extra];
  const only = args.filter((a) => !a.startsWith("--"));

  const views = readViews();
  const buildings = readBuildings();
  const amenityData = readAmenities();
  const ids = (only.length ? only : Object.keys(SOURCES)).filter((id) => {
    if (SOURCES[id]) return true;
    console.error(`unknown building: ${id}`);
    return false;
  });

  let failures = 0;
  const thresholds = {};

  for (const id of ids) {
    const src = SOURCES[id];
    const view = views[id];
    const floors = floorsFor(id);
    const viewBox = floors[0]?.shapes[0]?.viewBox ?? view?.viewBox;
    const keepOut = boundsToPercent(floorsBounds(floors), viewBox);
    const photo = imageSize(path.join(PHOTO_DIR, src.photo));
    const ar = photo.w / photo.h;
    const vbAr = parseViewBox(viewBox)
      ? parseViewBox(viewBox).w / parseViewBox(viewBox).h
      : ar;

    console.log(`\n${"=".repeat(78)}`);
    console.log(
      `${id}   photo ${photo.w}×${photo.h}  ar ${ar.toFixed(4)}   viewBox ${viewBox}`,
    );
    console.log(`${"=".repeat(78)}`);
    console.log(
      `first-paint ar from viewBox ${vbAr.toFixed(4)} — ${Math.abs(vbAr - ar) / ar < 0.002 ? "within 0.2% of the photo, no visible jump on load" : `⚠ ${((Math.abs(vbAr - ar) / ar) * 100).toFixed(2)}% off the photo`}`,
    );
    console.log(
      `keep-out (tower): x ${pct(keepOut.left)} → ${pct(keepOut.right)}   y ${pct(keepOut.top)} → ${pct(keepOut.bottom)}   (${floors.length} floors)`,
    );
    console.log(
      `free space: left of tower ${pct(keepOut.left)} wide, right of tower ${pct(100 - keepOut.right)} wide`,
    );

    /* the crop, ratio by ratio */
    console.log(`\n  visible window of the photo, per viewport`);
    console.log(
      `  ${pad("viewport", 12)}${pad("stage px", 14)}${pad("x visible", 20)}y visible`,
    );
    for (const [vw, vh] of matrix) {
      const s = stageFor(vw, vh, ar);
      console.log(
        `  ${pad(`${vw}×${vh}`, 12)}${pad(`${Math.round(s.stageW)}×${Math.round(s.stageH)}`, 14)}${pad(`${pct(s.visible.left)} → ${pct(s.visible.right)}`, 20)}${pct(s.visible.top)} → ${pct(s.visible.bottom)}`,
      );
    }

    if (!view?.staged) {
      console.log(
        `\n  not on the stage yet — still positioned against the viewport.`,
      );
      continue;
    }

    /* leftover breakpoints would break continuity */
    const stray = [
      ["headerClass", view.headerClass],
      ["headerLogoClass", view.headerLogoClass],
      ["headerSubClass", view.headerSubClass],
      ["asideClass", view.asideClass],
      ["amenityClass", view.amenityClass],
      ["amenityListClass", view.amenityListClass],
      ["amenityItemClass", view.amenityItemClass],
    ].flatMap(([k, v]) => breakpointsIn(v).map((bp) => `${k}: ${bp}:`));
    if (stray.length) {
      failures += stray.length;
      console.log(`\n  ✗ responsive prefixes still in the data — these jump:`);
      stray.forEach((s) => console.log(`      ${s}`));
    }

    const building = buildings[id] ?? {};
    const amenities = amenityData[id] ?? [];
    const logo = logoInk(path.join(LOGO_DIR, src.logo));

    /* boxes at the largest stage, just to describe them */
    const describe = blockBoxes(view, building, amenities, logo, {
      stageW: 1920,
    });
    console.log(`\n  blocks (centre → box, as % of the photo)`);
    for (const [name, box] of Object.entries(describe)) {
      console.log(
        `  ${pad(name, 9)}centre ${pad(`${pct(box.x)}, ${pct(box.y)}`, 16)}x ${pad(`${pct(box.left)} → ${pct(box.right)}`, 20)}${box.detail}`,
      );
      if (box.overflow > 0) failures += 1;
    }

    /* The crop is driven by the viewport's SHAPE, so the honest summary of
       "where does this stop working" is a ratio window, not a width. Narrower
       than the low end and the sides are eaten; wider and the top and bottom
       are. Whatever breakpoint the small-screen fallback uses has to sit
       outside this window. */
    {
      const edges = Object.values(describe);
      const slackX =
        Math.min(
          ...edges.map((b) => b.left),
          ...edges.map((b) => 100 - b.right),
        ) - RATIO_GUARD;
      const slackY =
        Math.min(
          ...edges.map((b) => b.y - b.up * ar),
          ...edges.map((b) => 100 - (b.y + b.down * ar)),
        ) - RATIO_GUARD;
      const ratioMin = ar * (1 - (2 * slackX) / 100);
      const ratioMax = slackY > 0 ? ar / (1 - (2 * slackY) / 100) : Infinity;
      const stageMin = minStageWidth(view);

      thresholds[id] = { ratioMin, ratioMax, stageMin, ar };

      console.log(`\n  off-stage thresholds (derived, not chosen)`);
      console.log(
        `  stageRatioMin  ${ratioMin.toFixed(3)}   narrower than this and the crop eats a block (${slackX.toFixed(1)}% slack across, guard ${RATIO_GUARD}%)`,
      );
      console.log(
        `  stageRatioMax  ${ratioMax > 99 ? "∞" : ratioMax.toFixed(3)}   wider than this and the vertical crop eats a block (${slackY.toFixed(1)}% slack down)`,
      );
      console.log(
        `  stageMinWidth  ${Math.ceil(stageMin)}px of photo — below it type falls under its minimum:`,
      );
      for (const t of typeScale(view)) {
        const cqw = toCqw(t.token, { stageW: 1e7 });
        const needs = (MIN_TYPE_PX[t.role] / cqw) * 100;
        console.log(
          `      ${pad(t.name, 17)}${pad(t.token, 22)}${pad(`${cqw.toFixed(2)}cqw`, 10)}min ${MIN_TYPE_PX[t.role]}px (${t.role}) → needs ${Math.ceil(needs)}px of stage`,
        );
      }
      console.log(`  flow when: @media ${flowQuery(thresholds[id])}`);

      /* The interaction: a floor that raises type on a small stage stops the
         text shrinking while the box around it keeps shrinking, which is an
         overlap bug wearing a type bug's clothes. It is only a problem if it
         can happen while the building is still ON the stage — inside its own
         ratio band and above its own minimum width. */
      const floored = [];
      for (let r = ratioMin; r <= Math.min(ratioMax, 4); r += 0.01) {
        for (const vh of [400, 600, 768, 900, 1080, 1440, 2160]) {
          const vw = Math.round(r * vh);
          const s = stageFor(vw, vh, ar);
          if (s.stageW < stageMin) continue; // already off the stage
          for (const t of typeScale(view))
            if (flooredAt(t.token, s.stageW))
              floored.push(
                `${t.name} at ${vw}×${vh} (stage ${Math.round(s.stageW)}px)`,
              );
        }
      }
      if (floored.length) {
        failures += 1;
        console.log(
          `  ✗ a type floor is active while still on the stage — the text stops shrinking but its box does not, so this is a PLACEMENT bug to fix before tuning the floor:`,
        );
        [...new Set(floored)]
          .slice(0, 6)
          .forEach((f) => console.log(`      ${f}`));
      } else {
        console.log(
          `  ✓ no type floor is ever active inside the band — the flow fallback takes over exactly where a floor would have had to`,
        );
      }
    }

    /* the matrix */
    console.log(
      `\n  ${pad("block", 9)}${pad("viewport", 12)}${pad("box x", 20)}${pad("box y", 20)}result`,
    );
    for (const name of Object.keys(describe)) {
      for (const [vw, vh] of matrix) {
        const s = stageFor(vw, vh, ar);
        const boxes = blockBoxes(view, building, amenities, logo, {
          stageW: s.stageW,
        });
        const { rect, problems } = checkBlock(
          boxes[name],
          ar,
          keepOut,
          s.visible,
        );
        if (problems.length) failures += 1;
        console.log(
          `  ${pad(name, 9)}${pad(`${vw}×${vh}`, 12)}${pad(`${pct(rect.left)} → ${pct(rect.right)}`, 20)}${pad(`${pct(rect.top)} → ${pct(rect.bottom)}`, 20)}${problems.length ? `✗ ${problems.join(", ")}` : "✓ pass"}`,
        );
      }
    }

    /* continuity: nothing may jump as the window is dragged */
    if (wantSweep) {
      console.log(`\n  continuity sweep, 1024 → 3440 in 20px steps`);
      for (const vh of [768, 900, 1080, 1440]) {
        // A block SHOULD drift as the window grows — the photo behind it is
        // scaling, so ~0.74px of travel per px of width is right and constant.
        // What a leftover breakpoint class looks like is that steady drift
        // interrupted: one step far bigger than the two around it. So the
        // measure is the change in step size, not the step size.
        let worstStep = { px: 0, at: null, block: null };
        let worstBreak = { px: 0, at: null, block: null };
        let prev = null;
        let prevStep = null;

        for (let vw = 1024; vw <= 3440; vw += 20) {
          const s = stageFor(vw, vh, ar);
          const boxes = blockBoxes(view, building, amenities, logo, {
            stageW: s.stageW,
          });
          const px = {};
          for (const [name, b] of Object.entries(boxes)) {
            // where the block's centre lands on screen, in device pixels
            px[name] = {
              x: (b.x / 100) * s.stageW - (s.stageW - vw) / 2,
              y: (b.y / 100) * s.stageH - (s.stageH - vh) / 2,
            };
          }

          const step = {};
          if (prev) {
            for (const name of Object.keys(px)) {
              step[name] = Math.hypot(
                px[name].x - prev[name].x,
                px[name].y - prev[name].y,
              );
              if (step[name] > worstStep.px)
                worstStep = { px: step[name], at: vw, block: name };
              if (prevStep) {
                const jerk = Math.abs(step[name] - prevStep[name]);
                if (jerk > worstBreak.px)
                  worstBreak = { px: jerk, at: vw, block: name };
              }
            }
            prevStep = step;
          }
          prev = px;
        }

        // the one legitimate change of pace is where max() swaps branch —
        // the photo stops being height-driven and starts being width-driven,
        // which shifts the drift by a few px per step and stays continuous
        const ok = worstBreak.px < 8;
        console.log(
          `  h=${pad(vh, 6)}drift ≤ ${worstStep.px.toFixed(1)}px/step, largest change of pace ${worstBreak.px.toFixed(1)}px (${worstBreak.block} at ${worstBreak.at}px wide)  ${ok ? "✓ smooth" : "✗ jumps"}`,
        );
        if (!ok) failures += 1;
      }
    }
  }

  /* One rule for the app, strictest across every building on the stage. It
     tightens as buildings convert — re-run this and paste the line into
     index.css each time one lands. */
  const staged = Object.entries(thresholds);
  if (staged.length) {
    const combined = {
      ratioMin: Math.max(...staged.map(([, t]) => t.ratioMin)),
      ratioMax: Math.min(...staged.map(([, t]) => t.ratioMax)),
      stageMin: Math.max(...staged.map(([, t]) => t.stageMin)),
      ar: Math.min(...staged.map(([, t]) => t.ar)),
    };
    console.log(`\n${"=".repeat(78)}`);
    console.log(
      `flow-layout rule, strictest across the ${staged.length} staged building${staged.length > 1 ? "s" : ""} (${staged.map(([i]) => i).join(", ")}):`,
    );
    const line = `@custom-variant flow (@media ${flowQuery(combined)});`;
    console.log(`\n${line}\n`);

    /* The rule the app actually ships has to be the rule this computes. Only
       meaningful on a full run — a single-building run has nothing to be
       strictest across. */
    if (!only.length) {
      const css = fs.readFileSync(path.join(ROOT, "src/index.css"), "utf8");
      const shipped = css.match(/@custom-variant flow \(.*?\);/s)?.[0];
      if (shipped === line) {
        console.log(`  ✓ src/index.css ships exactly this rule\n`);
      } else {
        failures += 1;
        console.log(`  ✗ src/index.css is out of date — paste the line above.`);
        console.log(
          `    it currently has: ${shipped ?? "(no flow variant)"}\n`,
        );
      }
    }

    for (const [id, t] of staged)
      console.log(
        `  ${pad(id, 20)}ratio ${t.ratioMin.toFixed(3)} → ${t.ratioMax > 99 ? "∞" : t.ratioMax.toFixed(3)}   stage ≥ ${Math.ceil(t.stageMin)}px`,
      );
  }

  console.log(`\n${"=".repeat(78)}`);
  console.log(
    failures === 0 ? "all checks pass" : `${failures} failing check(s)`,
  );
  process.exit(failures === 0 ? 0 : 1);
};

run();
