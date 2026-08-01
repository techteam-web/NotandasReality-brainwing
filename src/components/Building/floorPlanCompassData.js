/**
 * North compass drawn on top of the floor-plan photo (FloorPlanOverlay).
 *
 * The artwork is one shared asset (assets/floorPlan_Compass.svg, drawn with
 * North straight up). Every plan is shot at its own orientation, so each
 * building says how far to turn that artwork, how big to draw it and where on
 * the plan it should sit.
 *
 * ── The four knobs ─────────────────────────────────────────────────────────
 *   • rotation — degrees CLOCKWISE to turn the compass so its N arm points at
 *     true north ON THIS PLAN. 0 = north is up the page, 90 = north is to the
 *     right, 180 = north is down the page, -90 (or 270) = north is to the left.
 *   • size     — diameter, as a % of the plan photo's WIDTH. One number for
 *     both axes (the artwork is square), so it scales with the plan on every
 *     screen size instead of drifting.
 *   • x / y    — where the compass's CENTRE sits, as a % of the plan photo's
 *     width / height. 0,0 is the plan's top-left corner, 100,100 the
 *     bottom-right. The default parks it in the bottom-right corner.
 *   • opacity  — 0–1, for plans whose corner artwork is busy.
 *
 * Coordinates are percentages of the plan box (never pixels) because the box
 * is sized from the plan's aspect ratio and then zoomed/panned — a percentage
 * keeps the compass glued to the same spot on the paper at any zoom.
 *
 * ── Dialling a building in ─────────────────────────────────────────────────
 * Open any floor plan with `?fpcompass=1` on the URL. A panel appears with
 * nudges for all four knobs; drag them until the compass sits right, hit Copy
 * and paste the snippet into FLOOR_PLAN_COMPASS below. Nothing else to wire up.
 *
 * Dial-ins also save to the browser as you nudge, so the placement already
 * holds across floor switches and reloads on that device before it's pasted
 * here. The moment this file's entry for the building changes, that saved
 * sketch retires itself — what's written here always wins in the end.
 *
 * Scope: a building's entry is the default for all its floors. When one floor's
 * plan is shot differently (a rotated terrace sheet, say), add it under that
 * building's `floors` map, keyed exactly like panoData's floorKey — "ground",
 * "terrace", or the floor number. Floor wins over building, building over
 * DEFAULT_COMPASS, and any key you leave out falls through to the level below.
 */

/** Shape every building/floor entry falls back to. */
export const DEFAULT_COMPASS = {
  rotation: 0,
  size: 10, // % of plan width
  x: 96, // % from the plan's left edge → bottom-left corner
  y: 93.6, // % from the plan's top edge
  visible: true,
};

/**
 * Per-building compass placement, keyed by the /projects/:id route id (the same
 * ids as BUILDING_LOGOS / BUILDINGS). Only list what differs from
 * DEFAULT_COMPASS; anything omitted is inherited.
 */
export const FLOOR_PLAN_COMPASS = {
  "notan-dc": {
    rotation: 130,
  },
  "notan-edge": {
    rotation: -76,
  },
  "notan-jewel": {
    rotation: 89,
  },
  "notan-space": {
    rotation: 17,
  },
  "notan-terrace": {
    rotation: -11,
  },
  "notan-crown": {
    rotation: 11,
  },
  "notan-views": {
    rotation: 17,
  },
  "notan-lands-end": {
    rotation: 0,
  },
};

/** Same key panoData uses: "ground", "terrace", or the floor number. */
const floorKey = (floor) =>
  floor?.isGround ? "ground" : floor?.isTerrace ? "terrace" : floor?.num;

/**
 * Resolve the compass placement for one building floor: DEFAULT_COMPASS, with
 * the building's entry laid over it, with that floor's override laid over that.
 * Always returns a complete config, so callers never have to null-check a knob.
 */
export const getFloorPlanCompass = (buildingId, floor) => {
  const building = FLOOR_PLAN_COMPASS[buildingId] ?? {};
  const { floors, ...buildingCfg } = building;
  const floorCfg = floor ? (floors?.[floorKey(floor)] ?? {}) : {};

  return { ...DEFAULT_COMPASS, ...buildingCfg, ...floorCfg };
};
