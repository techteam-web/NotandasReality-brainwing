/**
 * Maps every building floor to its detailed floor-plan photo and the hover
 * regions drawn on top of it.
 *
 * Two asset families feed this:
 *   1. The plan photos in /Notan_floor_plans/<Building>/*.jpeg, grouped by the
 *      floors that share a layout (e.g. "1,2,4,5,7_floor_plane.jpeg").
 *   2. The hover cut-outs in Building_Floor_SVG/<Building>/FloorPlan_ImgSvg —
 *      DC keeps one SVG per room inside SVG_unit_<range>/ folders; Edge keeps a
 *      single SVG per range holding every unit shape. Each shares the same
 *      viewBox as its matching photo, so the overlay lands exactly on the plan.
 *
 * Both naming schemes encode the floors they cover in the filename, so we parse
 * those out once and look a floor up by number — ground and terrace included.
 */

/* ---- plan photos (URLs), resolved from the project root ---- */
const DC_IMAGES = import.meta.glob("/Notan_floor_plans/Notan_DC/*.jpeg", {
  query: "?url",
  import: "default",
  eager: true,
});
const EDGE_IMAGES = import.meta.glob("/Notan_floor_plans/Notan_edge/*.jpeg", {
  query: "?url",
  import: "default",
  eager: true,
});

/* ---- hover cut-outs (raw SVG markup) ---- */
const DC_SVGS = import.meta.glob(
  "../../assets/Building_Floor_SVG/Nothan_DC/FloorPlan_ImgSvg/**/*.svg",
  { query: "?raw", import: "default", eager: true }
);
const EDGE_SVGS = import.meta.glob(
  "../../assets/Building_Floor_SVG/Nothan_Edge/FloorPlan_ImgSvg/**/*.svg",
  { query: "?raw", import: "default", eager: true }
);

/**
 * Reads the floors a filename covers. Returns one of:
 *   { ground: true } | { terrace: true } | { basement: true } | { nums: [...] }
 * Numbers are taken from the part before the word "floor" so a trailing
 * "10th_floor_plan" never bleeds extra digits in.
 */
const floorKeysFromName = (name) => {
  const lower = name.toLowerCase();
  if (/ground/.test(lower)) return { ground: true };
  if (/terrace/.test(lower)) return { terrace: true };
  if (/basement/.test(lower)) return { basement: true };
  const head = lower.split("floor")[0];
  const nums = (head.match(/\d+/g) || []).map(Number);
  return { nums };
};

const keyMatches = (keys, floor) => {
  if (!keys) return false;
  if (floor.isGround) return !!keys.ground;
  if (floor.isTerrace) return !!keys.terrace;
  return Array.isArray(keys.nums) && keys.nums.includes(floor.num);
};

const prettify = (file) =>
  file
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * Pulls every <path>/<polygon>/<rect> geometry out of a raw SVG, in document
 * order. <rect> is converted to an equivalent 4-point polygon so the overlay
 * renderers (which only draw <path>/<polygon>) need no special case.
 */
const TAG_RE = /<(path|polygon|rect)\b([^>]*)>/g;
const attrOf = (attrs, name) => {
  const m = attrs.match(new RegExp(`\\s${name}="([^"]+)"`));
  return m ? m[1].trim() : null;
};
const parseShapes = (raw) => {
  const shapes = [];
  for (const [, tag, attrs] of raw.matchAll(TAG_RE)) {
    if (tag === "path") {
      const d = attrOf(attrs, "d");
      if (d) shapes.push({ type: "path", d });
    } else if (tag === "polygon") {
      const points = attrOf(attrs, "points");
      if (points) shapes.push({ type: "polygon", points });
    } else {
      const x = parseFloat(attrOf(attrs, "x")) || 0;
      const y = parseFloat(attrOf(attrs, "y")) || 0;
      const w = parseFloat(attrOf(attrs, "width"));
      const h = parseFloat(attrOf(attrs, "height"));
      if (w > 0 && h > 0) {
        shapes.push({
          type: "polygon",
          points: `${x},${y} ${x + w},${y} ${x + w},${y + h} ${x},${y + h}`,
        });
      }
    }
  }
  return shapes;
};

const viewBoxOf = (raw) => {
  const m = raw.match(/viewBox="([^"]+)"/);
  return m ? m[1] : null;
};

/* ---- build the photo lookup for one building ---- */
const buildImages = (files) =>
  Object.entries(files).map(([path, url]) => {
    const file = path.split("/").pop().replace(/\.jpe?g$/i, "");
    return { keys: floorKeysFromName(file), url };
  });

/**
 * Build the hover-region groups for one building. SVGs sitting in a sub-folder
 * (DC) are grouped by that folder, one region per room file; flat SVGs (Edge)
 * each form their own group with one region per shape inside.
 */
const buildGroups = (files) => {
  const groups = new Map();

  for (const [path, raw] of Object.entries(files)) {
    const rel = path.split("FloorPlan_ImgSvg/")[1] || "";
    const inFolder = rel.includes("/");
    const groupKey = inFolder ? rel.split("/")[0] : rel.replace(".svg", "");
    const fileName = rel.split("/").pop().replace(".svg", "");

    if (!groups.has(groupKey)) {
      groups.set(groupKey, {
        keys: floorKeysFromName(groupKey),
        viewBox: viewBoxOf(raw),
        regions: [],
      });
    }
    const group = groups.get(groupKey);
    if (!group.viewBox) group.viewBox = viewBoxOf(raw);

    const shapes = parseShapes(raw);
    shapes.forEach((shape) => {
      const name =
        inFolder && shapes.length === 1
          ? prettify(fileName)
          : `Unit ${group.regions.length + 1}`;
      group.regions.push({ name, ...shape });
    });
  }

  return [...groups.values()];
};

const BUILDINGS = {
  "notan-dc": { images: buildImages(DC_IMAGES), groups: buildGroups(DC_SVGS) },
  "notan-edge": {
    images: buildImages(EDGE_IMAGES),
    groups: buildGroups(EDGE_SVGS),
  },
};

/**
 * Resolve the plan photo + hover overlay for a given building floor.
 * `available` is false when no photo exists for that floor yet.
 */
export const getFloorPlan = (buildingId, floor) => {
  const b = BUILDINGS[buildingId];
  if (!b || !floor) return { available: false, planImg: null, viewBox: null, regions: [] };

  const img = b.images.find((i) => keyMatches(i.keys, floor));
  const group = b.groups.find((g) => keyMatches(g.keys, floor));

  return {
    available: !!img,
    planImg: img?.url ?? null,
    viewBox: group?.viewBox ?? null,
    regions: group?.regions ?? [],
  };
};
