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
const DC_IMAGES = import.meta.glob("/Notan_floor_plans/Notan_DC/*.{jpg,jpeg}", {
  query: "?url",
  import: "default",
  eager: true,
});
const EDGE_IMAGES = import.meta.glob(
  "/Notan_floor_plans/Notan_edge/*.{jpg,jpeg}",
  {
    query: "?url",
    import: "default",
    eager: true,
  },
);
const JEWEL_IMAGES = import.meta.glob(
  "/Notan_floor_plans/Notan_jewel/*.{jpg,jpeg}",
  {
    query: "?url",
    import: "default",
    eager: true,
  },
);
const SPACE_IMAGES = import.meta.glob(
  "/Notan_floor_plans/Notan_space/*.{jpg,jpeg}",
  {
    query: "?url",
    import: "default",
    eager: true,
  },
);

const TERRACE_IMAGES = import.meta.glob(
  "/Notan_floor_plans/Notan_terrace/*.{jpg,jpeg}",
  {
    query: "?url",
    import: "default",
    eager: true,
  },
);
const CROWN_IMAGES = import.meta.glob(
  "/Notan_floor_plans/Notan_crown/*.{jpg,jpeg}",
  {
    query: "?url",
    import: "default",
    eager: true,
  },
);

/* ---- hover cut-outs (raw SVG markup) ---- */
const DC_SVGS = import.meta.glob(
  "../../assets/Building_Floor_SVG/Nothan_DC/FloorPlan_ImgSvg/**/*.svg",
  { query: "?raw", import: "default", eager: true },
);
const EDGE_SVGS = import.meta.glob(
  "../../assets/Building_Floor_SVG/Nothan_Edge/FloorPlan_ImgSvg/**/*.svg",
  { query: "?raw", import: "default", eager: true },
);
// Jewel/Space keep their per-room cut-outs under a differently-named folder
// (one SVG per room, grouped by floor folder — same shape as DC).
const JEWEL_SVGS = import.meta.glob(
  "../../assets/Building_Floor_SVG/Nothan_jewel/Unit_plan_svg/**/*.svg",
  { query: "?raw", import: "default", eager: true },
);
const SPACE_SVGS = import.meta.glob(
  "../../assets/Building_Floor_SVG/Nothan_space/floor_plan_SVG/**/*.svg",
  { query: "?raw", import: "default", eager: true },
);

const TERRACE_SVGS = import.meta.glob(
  "../../assets/Building_Floor_SVG/Nothan_terrace/Unit_plan_SVG/**/*.svg",
  { query: "?raw", import: "default", eager: true },
);
const CROWN_SVGS = import.meta.glob(
  "../../assets/Building_Floor_SVG/Nothan_crown/Unit_plan_SVG/**/*.svg",
  { query: "?raw", import: "default", eager: true },
);
const VIEWS_IMAGES = import.meta.glob(
  "/Notan_floor_plans/Notan_Views/*.{jpg,jpeg}",
  {
    query: "?url",
    import: "default",
    eager: true,
  },
);

const VIEWS_SVGS = import.meta.glob(
  "../../assets/Building_Floor_SVG/Notan_Views/SVG/**/*.svg",
  { query: "?raw", import: "default", eager: true },
);

const LANDS_END_IMAGES = import.meta.glob(
  "/Notan_floor_plans/Notan_lands_end/*.{jpg,jpeg}",
  {
    query: "?url",
    import: "default",
    eager: true,
  },
);

const LANDS_END_SVGS = import.meta.glob(
  "../../assets/Building_Floor_SVG/Notan_Lands-End/FloorPlan_ImgSvg/**/*.svg",
  { query: "?raw", import: "default", eager: true },
);

const TIDES_IMAGES = import.meta.glob(
  "/Notan_floor_plans/Notan_Tides/*.{jpg,jpeg}",
  {
    query: "?url",
    import: "default",
    eager: true,
  },
);

const TIDES_SVGS = import.meta.glob(
  "../../assets/Building_Floor_SVG/Notan_Tides/FloorPlan_ImgSvg/**/*.svg",
  { query: "?raw", import: "default", eager: true },
);

const BEACH_HOUSE_IMAGES = import.meta.glob(
  "/Notan_floor_plans/Notan_Beach-House/*.{jpg,jpeg}",
  {
    query: "?url",
    import: "default",
    eager: true,
  },
);

const BEACH_HOUSE_SVGS = import.meta.glob(
  "../../assets/Building_Floor_SVG/Notan_Beach-House/FloorPlan_ImgSvg/**/*.svg",
  { query: "?raw", import: "default", eager: true },
);

/**
 * Some floors are offered in more than one layout and ship one sheet per
 * choice, tagged "(OPTION-1)" / "(OPTION-2)" in the filename (Beach House's
 * typical floors and terrace). This lifts that tag out.
 */
const OPTION_RE = /[([\s_-]*option[\s_-]*(\d+)[)\]]*/i;

/**
 * Reads the floors a filename covers. Returns one of:
 *   { ground: true } | { basement: true } | { terrace, nums: [...] }
 * where `terrace` flags a terrace plan and `nums` lists the numbered floors —
 * a single filename may carry both (e.g. "15th,terrace_floor") so one plan can
 * serve a numbered floor and the terrace at once. Numbers are taken from the
 * part before the word "floor" so a trailing "10th_floor_plan" never bleeds
 * extra digits in.
 *
 * `option` is the layout choice this sheet is (null on floors offered only one
 * way), and `base` the name with that tag removed — read off first so an
 * "(OPTION-2)" is never mistaken for a floor number, and kept so sibling
 * sheets can be told apart by what actually differs in their names.
 */
const floorKeysFromName = (name) => {
  const tag = name.match(OPTION_RE);
  const option = tag ? Number(tag[1]) : null;
  const base = tag ? name.replace(OPTION_RE, " ") : name;
  const lower = base.toLowerCase();
  if (/ground/.test(lower)) return { ground: true, option, base };
  if (/basement/.test(lower)) return { basement: true, option, base };
  const terrace = /terrace/.test(lower);
  const podium = /podium/.test(lower);
  const head = lower.split("floor")[0];
  const nums = (head.match(/\d+/g) || []).map(Number);
  if (podium && nums.length === 0) {
    nums.push(1, 2, 3, 4, 5, 6, 7, 8, 9);
  }
  return { terrace, podium, nums, option, base };
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
    const file = path
      .split("/")
      .pop()
      .replace(/\.jpe?g$/i, "");
    return { keys: floorKeysFromName(file), url };
  });

/**
 * Build the hover-region groups for one building. SVGs sitting in a sub-folder
 * (DC, Jewel, Space) are grouped by that folder, one region per room file; flat
 * SVGs (Edge) each form their own group with one region per shape inside.
 *
 * `marker` is the folder that separates the building root from the floor
 * folders in each path — "FloorPlan_ImgSvg" for DC/Edge, "Unit_plan_svg" for
 * Jewel, "floor_plan_SVG" for Space — so the floor key parses off the right
 * segment.
 */
const buildGroups = (files, marker = "FloorPlan_ImgSvg") => {
  const groups = new Map();

  for (const [path, raw] of Object.entries(files)) {
    const rel =
      path.split(`/${marker}/`)[1] || path.split(`${marker}/`)[1] || "";
    const inFolder = rel.includes("/");
    let groupKey = inFolder ? rel.split("/")[0] : rel.replace(".svg", "");
    // Normalize common misspellings so folder names match plan image keys
    groupKey = groupKey.replace(/terrece/gi, "terrace");
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
  "notan-jewel": {
    images: buildImages(JEWEL_IMAGES),
    groups: buildGroups(JEWEL_SVGS, "Unit_plan_svg"),
  },
  "notan-space": {
    images: buildImages(SPACE_IMAGES),
    groups: buildGroups(SPACE_SVGS, "floor_plan_SVG"),
  },
  "notan-terrace": {
    images: buildImages(TERRACE_IMAGES),
    groups: buildGroups(TERRACE_SVGS, "Unit_plan_SVG"),
  },
  "notan-crown": {
    images: buildImages(CROWN_IMAGES),
    groups: buildGroups(CROWN_SVGS, "Unit_plan_SVG"),
  },
  "notan-views": {
    images: buildImages(VIEWS_IMAGES),
    groups: buildGroups(VIEWS_SVGS, "SVG"),
  },
  "notan-lands-end": {
    images: buildImages(LANDS_END_IMAGES),
    groups: buildGroups(LANDS_END_SVGS, "FloorPlan_ImgSvg"),
  },
  "notan-beach-house": {
    images: buildImages(BEACH_HOUSE_IMAGES),
    groups: buildGroups(BEACH_HOUSE_SVGS, "FloorPlan_ImgSvg"),
  },
  "notan-tides": {
    images: buildImages(TIDES_IMAGES),
    groups: buildGroups(TIDES_SVGS, "FloorPlan_ImgSvg"),
  },
};

/* ---- naming a floor's layout options ---- */

const commonPrefixLen = (strs) => {
  let i = 0;
  while (i < strs[0].length && strs.every((s) => s[i] === strs[0][i])) i += 1;
  return i;
};
const commonSuffixLen = (strs, cap) => {
  let i = 0;
  const room = Math.min(...strs.map((s) => s.length - cap));
  while (i < room && strs.every((s) => s[s.length - 1 - i] === strs[0][strs[0].length - 1 - i]))
    i += 1;
  return i;
};

/** Trim a name fragment to readable Title Case, or "" if it holds no words. */
const tidy = (s) => {
  const t = s
    .replace(/_+/g, " ")
    .replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, "")
    .replace(/\s+/g, " ");
  return /[A-Za-z0-9]/.test(t)
    ? t.replace(/[A-Za-z]+/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    : "";
};

/**
 * Label the sheets a floor is offered as. The button text is the filename's
 * own "Option N"; the caption under it is whatever actually DIFFERS between
 * the sibling names once their shared wording is stripped — so the typical
 * floors read "4 Bed + Study" / "5 Bed", while the terrace's two sheets (whose
 * names match apart from the tag) stay uncaptioned instead of repeating one
 * line twice.
 */
const optionsOf = (sheets) => {
  const names = sheets.map((s) => s.keys.base);
  const pre = commonPrefixLen(names);
  const suf = commonSuffixLen(names, pre);
  const captions = names.map((n) => tidy(n.slice(pre, n.length - suf)));
  const captioned = captions.every(Boolean);
  return sheets.map((s, i) => ({
    label: `Option ${s.keys.option ?? i + 1}`,
    caption: captioned ? captions[i] : null,
    url: s.url,
  }));
};

/**
 * Resolve the plan photo + hover overlay for a given building floor.
 * `available` is false when no photo exists for that floor yet.
 *
 * Floors offered in several layouts return one entry per sheet in `options`
 * (empty on the usual one-sheet floor) and the photo/overlay for the one
 * `optionIndex` picks; callers render `options` as a toggle. Sheets are
 * ordered by their own "Option N" rather than by filename, since the tags are
 * punctuated inconsistently and alphabetise backwards.
 */
export const getFloorPlan = (buildingId, floor, optionIndex = 0) => {
  const b = BUILDINGS[buildingId];
  if (!b || !floor)
    return {
      available: false,
      planImg: null,
      viewBox: null,
      regions: [],
      options: [],
      optionIndex: 0,
    };

  const byOption = (a, z) => (a.keys.option ?? 0) - (z.keys.option ?? 0);
  const sheets = b.images.filter((i) => keyMatches(i.keys, floor)).sort(byOption);
  const overlays = b.groups.filter((g) => keyMatches(g.keys, floor)).sort(byOption);

  // Only sheets that actually carry an "(OPTION-N)" tag are a choice the
  // visitor gets to make. Some buildings have two sheets covering one floor
  // just from overlapping legacy names (Terraces' floor 5 is in both
  // "1,3,5,9_floor" and "5th_floor"); those are not options, so the first
  // still wins silently rather than sprouting a toggle.
  const tagged = sheets.length > 1 && sheets.every((s) => s.keys.option != null);
  const options = tagged ? optionsOf(sheets) : [];
  const idx = options.length
    ? Math.min(Math.max(optionIndex, 0), options.length - 1)
    : 0;

  const img = sheets[idx] ?? null;
  // per-option cut-outs pair up by tag; a floor drawn once for both layouts
  // keeps using that single overlay
  const group =
    overlays.find((g) => g.keys.option === img?.keys.option) ??
    overlays.find((g) => g.keys.option == null) ??
    overlays[0] ??
    null;

  return {
    // available when either a photo or overlay group exists — some buildings
    // provide only the SVG cut-outs without a matching photo; still render
    // the regions over a neutral background in that case.
    available: !!img || !!group,
    planImg: img?.url ?? null,
    viewBox: group?.viewBox ?? null,
    regions: group?.regions ?? [],
    options,
    optionIndex: idx,
  };
};
