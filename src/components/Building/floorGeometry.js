/**
 * Pure geometry for the floor cut-outs — no Vite, no DOM, no React.
 *
 * floorShapes.js pairs these with `import.meta.glob` to build the floor data
 * the page renders; scripts/stage-constraints.mjs pairs the very same
 * functions with `fs` to compute where the tower stands. One parser, so the
 * keep-out zone the script reports is the silhouette the page actually draws.
 */

/* ---------- reading a cut-out SVG ---------- */

export const parseShape = (raw) => {
  const points = raw.match(/points="([^"]+)"/);
  const d = raw.match(/\sd="([^"]+)"/);
  const viewBoxMatch = raw.match(/viewBox="([^"]+)"/);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : null;

  if (points) return { type: "polygon", points: points[1].trim(), viewBox };
  if (d) return { type: "path", d: d[1].trim(), viewBox };

  return null;
};

/** One cut-out file per floor (DC, Edge, Views). `files` is path -> raw SVG. */
export const buildFloors = (files) =>
  Object.entries(files)
    .map(([path, raw]) => {
      const file = path.split("/").pop().replace(".svg", "");
      const isTerrace = /terrace/i.test(file);
      const isGround = /ground/i.test(file);
      // ground floor → 0 (the base); terrace → a sentinel above every real
      // floor so it always sorts last and never collides with ground when its
      // filename carries no digit (e.g. Terrace_Floor.svg).
      const num = isGround
        ? 0
        : isTerrace
          ? 9999
          : parseInt(file.match(/(\d+)/)?.[1] ?? "0", 10);
      const label = isTerrace
        ? "Terrace"
        : isGround
          ? "Ground Floor"
          : `Floor ${num}`;
      const shape = parseShape(raw);
      return {
        num,
        isTerrace,
        isGround,
        label,
        // one file = one shape; combined SVGs can hand back several (see below)
        shapes: shape ? [shape] : [],
      };
    })
    .filter((f) => f.shapes.length)
    // bottom floor first → top floor last, matching the building top-to-bottom
    .sort((a, b) => a.num - b.num);

/**
 * Split ONE combined elevation SVG into the same floor objects buildFloors
 * produces. Every floor is an element carrying an `id` that names it —
 * "Ground_floor", "floor_7", "terrace" — set either on the shape itself
 * (Jewel: <polygon id="floor_7" points=…>) or on a wrapping <g> with the
 * shape just inside it (Space: <g id="floor_x5F_7"><polyline points=…></g>).
 *
 * For each id we take the slice of markup up to the next floor id and pull the
 * first geometry out of it (`points` → polygon, else `d` → path). Illustrator
 * escapes underscores as "_x5F_", so we unescape before reading the number —
 * otherwise "floor_x5F_15" would parse the 5 in "x5F" as the floor.
 *
 * A floor drawn in more than one piece arrives as repeated ids — Illustrator
 * suffixes the clashes, so Tides' L-shaped plan gives "_12th" for the tower
 * face and "_12th-2" for the return wing. Those are one floor, so shapes are
 * grouped by floor number and the floor carries all of them: the aside lists
 * "12th Floor" once, and hovering either piece lights the whole level.
 */
export const FLOOR_ID_RE =
  /id="([^"]*(?:floor|ground|terrace|podium|amenity|typical|refuge|_\d+|\d+st|\d+nd|\d+rd|\d+th)[^"]*)"/gi;

export const buildFloorsFromCombined = (raw) => {
  if (!raw) return [];
  const vb = raw.match(/viewBox="([^"]+)"/);
  const viewBox = vb ? vb[1] : null;

  const ids = [...raw.matchAll(FLOOR_ID_RE)];
  const byFloor = new Map();

  ids.forEach((m, i) => {
    const id = m[1].replace(/_x5f_/gi, "_");
    const seg = raw.slice(m.index, ids[i + 1]?.index ?? raw.length);
    const points = seg.match(/points="([^"]+)"/);
    const d = seg.match(/\sd="([^"]+)"/);
    const shape = points
      ? { type: "polygon", points: points[1].trim(), viewBox }
      : d
        ? { type: "path", d: d[1].trim(), viewBox }
        : null;
    if (!shape) return;

    const isGround = /ground/i.test(id);
    const isTerrace = /terrace/i.test(id);
    const num = isGround
      ? 0
      : isTerrace
        ? 9999
        : parseInt(id.match(/(\d+)/)?.[1] ?? "0", 10);
    const label = isTerrace
      ? "Terrace"
      : isGround
        ? "Ground Floor"
        : `Floor ${num}`;

    const floor = byFloor.get(num) ?? {
      num,
      isTerrace,
      isGround,
      label,
      shapes: [],
    };
    floor.shapes.push(shape);
    byFloor.set(num, floor);
  });

  return [...byFloor.values()].sort((a, b) => a.num - b.num);
};

/* ---------- bounding boxes, in viewBox units ---------- */

const emptyBounds = () => ({
  minX: Infinity,
  minY: Infinity,
  maxX: -Infinity,
  maxY: -Infinity,
});

const grow = (b, x, y) => {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return;
  if (x < b.minX) b.minX = x;
  if (x > b.maxX) b.maxX = x;
  if (y < b.minY) b.minY = y;
  if (y > b.maxY) b.maxY = y;
};

const NUM_RE = /-?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g;
const readNums = (s) => (s.match(NUM_RE) ?? []).map(Number);

/** `points="x,y x,y …"` — commas and spaces are interchangeable in SVG. */
export const pointsBounds = (points, into) => {
  const b = into ?? emptyBounds();
  const n = readNums(points);
  for (let i = 0; i + 1 < n.length; i += 2) grow(b, n[i], n[i + 1]);
  return b;
};

/**
 * `d="…"` — every on-path point plus every Bézier control point.
 *
 * Control points are taken as-is rather than solved for, so a curve's box can
 * come out slightly LARGER than the curve itself. For a keep-out zone that
 * errs the safe way: text is pushed a little further off the tower, never on.
 */
export const pathBounds = (d, into) => {
  const b = into ?? emptyBounds();
  let cx = 0;
  let cy = 0;
  let startX = 0;
  let startY = 0;

  const segments = d.match(/[MmLlHhVvCcSsQqTtAaZz][^MmLlHhVvCcSsQqTtAaZz]*/g);
  if (!segments) return b;

  for (const seg of segments) {
    const cmd = seg[0];
    const rel = cmd === cmd.toLowerCase();
    const n = readNums(seg.slice(1));
    let i = 0;

    switch (cmd.toUpperCase()) {
      case "M":
        // the first pair moves; any further pairs are implicit linetos, and
        // closepath returns to that first pair
        while (i + 1 < n.length) {
          cx = rel ? cx + n[i] : n[i];
          cy = rel ? cy + n[i + 1] : n[i + 1];
          if (i === 0) {
            startX = cx;
            startY = cy;
          }
          grow(b, cx, cy);
          i += 2;
        }
        break;
      case "L":
      case "T":
        while (i + 1 < n.length) {
          cx = rel ? cx + n[i] : n[i];
          cy = rel ? cy + n[i + 1] : n[i + 1];
          grow(b, cx, cy);
          i += 2;
        }
        break;
      case "H":
        while (i < n.length) {
          cx = rel ? cx + n[i] : n[i];
          grow(b, cx, cy);
          i += 1;
        }
        break;
      case "V":
        while (i < n.length) {
          cy = rel ? cy + n[i] : n[i];
          grow(b, cx, cy);
          i += 1;
        }
        break;
      case "C":
        while (i + 5 < n.length) {
          const pts = [];
          for (let k = 0; k < 6; k += 2) {
            pts.push([
              rel ? cx + n[i + k] : n[i + k],
              rel ? cy + n[i + k + 1] : n[i + k + 1],
            ]);
          }
          pts.forEach(([x, y]) => grow(b, x, y));
          [cx, cy] = pts[2];
          i += 6;
        }
        break;
      case "S":
      case "Q":
        while (i + 3 < n.length) {
          const pts = [];
          for (let k = 0; k < 4; k += 2) {
            pts.push([
              rel ? cx + n[i + k] : n[i + k],
              rel ? cy + n[i + k + 1] : n[i + k + 1],
            ]);
          }
          pts.forEach(([x, y]) => grow(b, x, y));
          [cx, cy] = pts[1];
          i += 4;
        }
        break;
      case "A":
        // rx ry rot large-arc sweep x y — an arc never leaves the box of its
        // endpoints grown by its radii: the safe over-estimate again.
        while (i + 6 < n.length) {
          const rx = Math.abs(n[i]);
          const ry = Math.abs(n[i + 1]);
          const ex = rel ? cx + n[i + 5] : n[i + 5];
          const ey = rel ? cy + n[i + 6] : n[i + 6];
          grow(b, Math.min(cx, ex) - rx, Math.min(cy, ey) - ry);
          grow(b, Math.max(cx, ex) + rx, Math.max(cy, ey) + ry);
          cx = ex;
          cy = ey;
          i += 7;
        }
        break;
      case "Z":
        cx = startX;
        cy = startY;
        break;
      default:
        break;
    }
  }

  return b;
};

export const shapeBounds = (shape, into) =>
  shape.type === "polygon"
    ? pointsBounds(shape.points, into)
    : pathBounds(shape.d, into);

/** Union box of every shape of every floor — the tower's whole silhouette. */
export const floorsBounds = (floors) => {
  const b = emptyBounds();
  floors.forEach((f) => f.shapes.forEach((s) => shapeBounds(s, b)));
  return Number.isFinite(b.minX) ? b : null;
};

/** "0 0 1672 941" → { x, y, w, h }. */
export const parseViewBox = (viewBox) => {
  const [x, y, w, h] = readNums(viewBox ?? "");
  return Number.isFinite(w) && Number.isFinite(h) ? { x, y, w, h } : null;
};

/**
 * A viewBox-unit box as percentages of the photo — the coordinate space the
 * stage lays text out in.
 */
export const boundsToPercent = (bounds, viewBox) => {
  const vb = parseViewBox(viewBox);
  if (!bounds || !vb) return null;
  return {
    left: ((bounds.minX - vb.x) / vb.w) * 100,
    right: ((bounds.maxX - vb.x) / vb.w) * 100,
    top: ((bounds.minY - vb.y) / vb.h) * 100,
    bottom: ((bounds.maxY - vb.y) / vb.h) * 100,
  };
};

/** The photo's aspect ratio implied by a viewBox — the stage's first guess. */
export const ratioFromViewBox = (viewBox) => {
  const vb = parseViewBox(viewBox);
  return vb && vb.h > 0 ? vb.w / vb.h : 16 / 9;
};
