/**
 * Which way the minimap radar's cone faces, per building / floor / room.
 *
 * The radar (FloorPlanRadar, drawn on PanoViewer's mini floor plan) already
 * aims itself: it takes plan north from floorPlanCompassData's `rotation` and
 * adds the live view direction, so the cone turns as the visitor drags. This
 * file is the CORRECTION on top of that — for when a capture was shot off-axis
 * from the sheet it's paired with, and the cone lands beside the right rooms
 * instead of on them.
 *
 * ── It corrects itself from the room yaws you already set ──────────────────
 * Mostly you don't write anything here. Every room in REGION_PANO_MAP carries a
 * hand-tuned `yawDeg` — the direction the camera must face to look at that room
 * — and the floor plan already knows where that room sits on the paper. Point
 * those two at each other and the correction falls out:
 *
 *     facing = (angle from the plan's centre out to the room)
 *              − (where the radar would have pointed for that room's yawDeg)
 *
 * The viewer measures that for every room on the floor that has its own yawDeg
 * and a shape on the plan, then averages them (a circular mean, so the ±180°
 * seam can't skew it). One number, derived per floor, from data you already
 * tuned — and it re-derives itself the moment you change a room's yawDeg, so
 * the radar can never drift out of step with the panos again.
 *
 * A floor with no room yaws at all falls back to its building's value, then to
 * no correction.
 *
 * ── The knobs ──────────────────────────────────────────────────────────────
 *   • auto    — how that derivation is applied.
 *       "floor"  (default) one correction per floor, averaged over its rooms.
 *         Steadiest: every room on the floor reads the same way, and one
 *         sloppily-tuned yaw can't throw the cone off on its own.
 *       "room"   each room aligns to its OWN yawDeg, so opening a room lands
 *         the cone exactly on it (rooms with no yaw of their own use the floor
 *         average). Use it when a floor's rooms disagree with each other.
 *       false    no derivation; `facing` alone, defaulting to 0.
 *   • facing  — MANUAL override, degrees CLOCKWISE. Set it and the derivation
 *     is ignored at that scope: 90 = quarter-turn right, -90 = left, 180 = it
 *     was facing exactly backwards. Leave it out (null) to stay automatic.
 *     Turns the swing band with it; the N tick stays put, since that belongs to
 *     the plan, not the capture.
 *   • visible — false hides the radar on plans where it doesn't help (a sheet
 *     with two plans on it, a schematic with no real orientation).
 *
 * ── Scope: building → floor → room ─────────────────────────────────────────
 * A building's own `facing` is the default for every floor of it. One floor
 * shot differently goes under `floors`, keyed exactly like panoData's floorKey
 * ("ground", "terrace", or the floor number). One room facing its own way goes
 * under that floor's `rooms`, keyed by the EXACT label on the plan (the same
 * string REGION_PANO_MAP uses, and what the 360° header shows).
 *
 * Most specific wins: room > floor > building > DEFAULT_RADAR. Anything you
 * leave out falls through to the level below, so a building that only needs one
 * number is one line.
 *
 * ── Dialling it in ─────────────────────────────────────────────────────────
 * Open any 360° with `?radar=1` on the URL. A panel appears bottom-left with ±
 * buttons, a live readout of where the cone points on the plan, and a
 * Room / Floor / Building switch that says which scope your nudges are writing
 * to. Walk the floors, nudge each one until its cone covers the room you're
 * actually looking at, then hit Copy — you get every dial-in from the session as
 * a ready-to-paste block for FLOOR_PLAN_RADAR below. Dial-ins only apply while
 * the panel is open, so a normal visit always renders what's written here.
 */

/** Shape every building / floor / room entry falls back to. */
export const DEFAULT_RADAR = {
  facing: null, // null → derive it from the room yaws
  auto: "floor",
  visible: true,
};

/**
 * Per-building radar aim, keyed by the `/projects/:id` route id (the same ids as
 * FLOOR_PLAN_COMPASS / PANO_BUILDINGS). Only list what differs from the level
 * above it.
 *
 * Every building is empty to start with, which means "derive it" — the room
 * yaws do the work. Add a value only where you want to overrule that: a floor
 * whose rooms are unhelpfully tuned, a plan sheet nothing else fits. Dial one in
 * with `?radar=1` and paste the result over the entry.
 *
 * Shape:
 *   "notan-dc": {
 *     facing: -12,                                  // pin the whole building
 *     auto: "room",                                 // …or aim room by room
 *     floors: {
 *       14: {
 *         facing: 8,                                // pin just the 14th
 *         rooms: { "Master Bedroom": { facing: 22 } },  // pin just that room
 *       },
 *       terrace: { visible: false },
 *     },
 *   },
 */
export const FLOOR_PLAN_RADAR = {
  "notan-dc": {},
  "notan-edge": {},
  "notan-jewel": {},
  "notan-space": {},
  "notan-terrace": {},
  "notan-crown": {},
  "notan-views": {},
  "notan-lands-end": {},
};

/** Same key panoData uses: "ground", "terrace", or the floor number. */
export const radarFloorKey = (floor) =>
  floor?.isGround ? "ground" : floor?.isTerrace ? "terrace" : floor?.num;

/**
 * Resolve the radar aim for one building / floor / room: DEFAULT_RADAR, with the
 * building's entry laid over it, then that floor's, then that room's. Always
 * returns a complete config, so callers never have to null-check a knob.
 */
export const getFloorPlanRadar = (buildingId, floor, regionName) => {
  const { floors, ...building } = FLOOR_PLAN_RADAR[buildingId] ?? {};
  const { rooms, ...floorCfg } = floors?.[radarFloorKey(floor)] ?? {};
  const roomCfg = (regionName != null && rooms?.[regionName]) || {};

  return { ...DEFAULT_RADAR, ...building, ...floorCfg, ...roomCfg };
};

/* ══════════════════════════════════════════════════════════════════════════
 * Deriving the correction from the room yaws
 * ════════════════════════════════════════════════════════════════════════ */

const DEG = Math.PI / 180;

/** Wrap to (-180, 180], the range the viewer works in. */
const wrap = (deg) => {
  const x = ((deg % 360) + 360) % 360;
  return x > 180 ? x - 360 : x;
};

/**
 * The angle from the plan's centre out to a point on it — degrees clockwise
 * from straight up the sheet, the same convention the radar draws in. (SVG y
 * grows downward, hence the negated dy.)
 */
export const planAngleTo = (centre, point) =>
  Math.atan2(point.x - centre.x, -(point.y - centre.y)) / DEG;

/**
 * Average a set of corrections as directions rather than numbers: summing unit
 * vectors and taking the angle back off the total. -179° and +179° average to
 * 180°, which is right, where a plain mean would say 0° — exactly backwards.
 */
const circularMean = (degs) => {
  let x = 0;
  let y = 0;
  for (const d of degs) {
    x += Math.cos(d * DEG);
    y += Math.sin(d * DEG);
  }
  // all samples cancelled out (opposite pairs) — no meaningful average
  if (Math.hypot(x, y) < 1e-9) return null;
  return wrap(Math.atan2(y, x) / DEG);
};

/**
 * Work out how far this floor's capture is turned relative to its plan, from
 * the rooms that carry their own yaw.
 *
 * `samples` are `{ name, planAngle, radarAngle }` — where the room sits on the
 * paper, and where the radar WOULD point for that room's configured yaw. The
 * gap between them is the correction; per room, and averaged for the floor.
 *
 * Returns `{ floor, rooms, count }`, or null when nothing on this floor says
 * anything (no room yaws, or no shapes to measure them against).
 */
export const deriveRadarFacing = (samples) => {
  const rooms = {};
  const all = [];
  for (const { name, planAngle, radarAngle } of samples) {
    const delta = wrap(planAngle - radarAngle);
    rooms[name] = Math.round(delta);
    all.push(delta);
  }
  if (!all.length) return null;
  const mean = circularMean(all);
  return mean == null
    ? null
    : { floor: Math.round(mean), rooms, count: all.length };
};

/**
 * The correction actually in force for a room: the scope's manual `facing` if it
 * has one, else whatever the derivation found, else nothing.
 */
export const radarFacingFor = (cfg, derived, regionName) => {
  if (cfg.facing != null) return cfg.facing;
  if (!cfg.auto || !derived) return 0;
  if (cfg.auto === "room" && regionName != null) {
    return derived.rooms[regionName] ?? derived.floor;
  }
  return derived.floor;
};

/* ══════════════════════════════════════════════════════════════════════════
 * Tuning-panel plumbing (?radar=1). None of this runs in a normal visit.
 * ════════════════════════════════════════════════════════════════════════ */

/** The three scopes a dial-in can be written to, widest last. */
export const RADAR_SCOPES = ["room", "floor", "building"];

/**
 * Flat key for one dial-in. A scope is just this key with the parts it doesn't
 * own left empty, so "most specific wins" is a lookup down three keys.
 */
export const radarTuneKey = (scope, buildingId, floor, regionName) => {
  const f = scope === "building" ? "" : (radarFloorKey(floor) ?? "");
  const r = scope === "room" ? (regionName ?? "") : "";
  return `${buildingId}||${f}||${r}`;
};

/**
 * What the panel should show right now: the most specific dial-in that covers
 * this room, or `fallback` (what the app would render on its own — file value or
 * derived) when the session hasn't touched it. `tune` is the map of key → facing.
 */
export const resolveRadarTune = (
  tune,
  buildingId,
  floor,
  regionName,
  fallback = 0,
) => {
  for (const scope of RADAR_SCOPES) {
    const hit = tune[radarTuneKey(scope, buildingId, floor, regionName)];
    if (hit != null) return hit;
  }
  return fallback;
};

const quoteFloor = (key) => (/^\d+$/.test(key) ? key : `"${key}"`);

/**
 * Turn a session's dial-ins into a paste-ready FLOOR_PLAN_RADAR fragment —
 * buildings, their floors, their rooms, nested the way this file wants them.
 */
export const buildRadarSnippet = (tune) => {
  const tree = {};
  for (const [key, facing] of Object.entries(tune)) {
    const [buildingId, floorK, roomName] = key.split("||");
    const b = (tree[buildingId] ??= { facing: null, floors: {} });
    if (!floorK) b.facing = facing;
    else {
      const f = (b.floors[floorK] ??= { facing: null, rooms: {} });
      if (roomName) f.rooms[roomName] = facing;
      else f.facing = facing;
    }
  }

  const lines = ["// paste into FLOOR_PLAN_RADAR in floorPlanRadarData.js"];
  for (const [buildingId, b] of Object.entries(tree)) {
    lines.push(`"${buildingId}": {`);
    lines.push(`  facing: ${b.facing ?? 0},`);
    const floorKeys = Object.keys(b.floors);
    if (floorKeys.length) {
      lines.push("  floors: {");
      for (const floorK of floorKeys) {
        const f = b.floors[floorK];
        const roomNames = Object.keys(f.rooms);
        const head = `    ${quoteFloor(floorK)}: {`;
        if (!roomNames.length) {
          lines.push(`${head} facing: ${f.facing ?? 0} },`);
          continue;
        }
        lines.push(head);
        if (f.facing != null) lines.push(`      facing: ${f.facing},`);
        lines.push("      rooms: {");
        for (const room of roomNames) {
          lines.push(`        "${room}": { facing: ${f.rooms[room]} },`);
        }
        lines.push("      },");
        lines.push("    },");
      }
      lines.push("  },");
    }
    lines.push("},");
  }
  return lines.join("\n");
};
