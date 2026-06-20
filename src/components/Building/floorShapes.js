/**
 * Reads every floor cut-out SVG for a building and turns it into plain
 * geometry the BuildingPage can render as one interactive overlay.
 *
 * Each source SVG (floor_1.svg … terrace_floor_15.svg) shares the same
 * `viewBox="0 0 1672 941"`, which is also the aspect ratio of the matching
 * ViewsBuildings photo — so when both are stretched into the same box the
 * polygons land exactly on their real floors.
 *
 * We only pull the raw geometry (`points` for polygons, `d` for paths) and
 * drop the source's `cls-1` fill, so the page is free to style hover/idle
 * states itself instead of fighting the baked-in blue.
 */

// Loaded eagerly as raw strings at build time — no runtime fetch.
const NOTAN_DC_FILES = import.meta.glob(
  "../../assets/Building_Floor_SVG/Nothan_DC/*.svg",
  { query: "?raw", import: "default", eager: true }
);

const NOTAN_EDGE_FILES = import.meta.glob(
  "../../assets/Building_Floor_SVG/Nothan_Edge/*.svg",
  { query: "?raw", import: "default", eager: true }
);

// Jewel and Space ship ONE combined elevation SVG (every floor is an element
// inside it, identified by `id`) rather than one file per floor. Glob still
// returns a single entry per building; buildFloorsFromCombined splits it.
const NOTAN_JEWEL_FILE = import.meta.glob(
  "../../assets/Building_Floor_SVG/Nothan_jewel/nothan_jewel-2.8x.svg",
  { query: "?raw", import: "default", eager: true }
);

const NOTAN_SPACE_FILE = import.meta.glob(
  "../../assets/Building_Floor_SVG/Nothan_space/Notan_space_.svg",
  { query: "?raw", import: "default", eager: true }
);

const parseShape = (raw) => {
  const points = raw.match(/points="([^"]+)"/);
  const d = raw.match(/\sd="([^"]+)"/);
  const viewBoxMatch = raw.match(/viewBox="([^"]+)"/);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : null;

  if (points) return { type: "polygon", points: points[1].trim(), viewBox };
  if (d) return { type: "path", d: d[1].trim(), viewBox };

  return null;
};

const buildFloors = (files) =>
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
      return {
        num,
        isTerrace,
        isGround,
        label,
        shape: parseShape(raw),
      };
    })
    .filter((f) => f.shape)
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
 */
const FLOOR_ID_RE = /id="([^"]*(?:floor|ground|terrace)[^"]*)"/gi;

const buildFloorsFromCombined = (raw) => {
  if (!raw) return [];
  const vb = raw.match(/viewBox="([^"]+)"/);
  const viewBox = vb ? vb[1] : null;

  const ids = [...raw.matchAll(FLOOR_ID_RE)];
  return ids
    .map((m, i) => {
      const id = m[1].replace(/_x5f_/gi, "_");
      const seg = raw.slice(m.index, ids[i + 1]?.index ?? raw.length);
      const points = seg.match(/points="([^"]+)"/);
      const d = seg.match(/\sd="([^"]+)"/);
      const shape = points
        ? { type: "polygon", points: points[1].trim(), viewBox }
        : d
          ? { type: "path", d: d[1].trim(), viewBox }
          : null;
      if (!shape) return null;

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
      return { num, isTerrace, isGround, label, shape };
    })
    .filter(Boolean)
    .sort((a, b) => a.num - b.num);
};

// The glob returns a one-entry map; grab that single combined SVG string.
const firstRaw = (files) => Object.values(files)[0];

export const NOTAN_DC_FLOORS = buildFloors(NOTAN_DC_FILES);
export const NOTAN_EDGE_FLOORS = buildFloors(NOTAN_EDGE_FILES);
export const NOTAN_JEWEL_FLOORS = buildFloorsFromCombined(firstRaw(NOTAN_JEWEL_FILE));
export const NOTAN_SPACE_FLOORS = buildFloorsFromCombined(firstRaw(NOTAN_SPACE_FILE));
