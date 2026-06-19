/**
 * 360° pano configuration for the buildings, consumed by PanoViewer.jsx.
 *
 * The tiles live in /public/panos/<building>/tiles/<sceneId>/... (moved there
 * from the original Marzipano export so they get a stable, un-hashed URL that
 * Marzipano can build at runtime). The Marzipano runtime itself is loaded as a
 * plain script from /public/panos/marzipano.js.
 *
 * Each building is one entry in PANO_BUILDINGS (keyed by the `/projects/:id`
 * route param) and is described by three tables:
 *   1. *_PANO_SCENES   — one entry per captured pano (the raw Marzipano scene
 *      metadata: id, name, and the "as-shot" view direction in radians).
 *   2. *_FLOOR_PANO_MAP — which pano each building floor opens, plus how the
 *      view is framed for that floor. THIS is the table you tune.
 *   3. *_REGION_PANO_MAP — optional per-room facing overrides for that floor.
 *
 * ── Tuning a floor ─────────────────────────────────────────────────────────
 * Open a floor's pano in the app, drag to the angle you want, then click
 * "Copy config" in the viewer toolbar. It copies a snippet like:
 *
 *     2: { scene: "14-l0015_2nd-f_71m", yawDeg: -88, pitchDeg: -25, fovDeg: 78, panDeg: 140 },
 *
 * Paste it over that floor's entry in the matching building's map below.
 *
 *   • yawDeg / pitchDeg — the FACE of the view (which way it points). Omit to
 *     use the pano's as-shot direction.
 *   • fovDeg            — zoom / field of view. Omit to use the as-shot zoom.
 *   • panDeg            — how wide a horizontal arc you may look across
 *     (the "restrict to 140°" window). Defaults to 140.
 */

const BASE = import.meta.env.BASE_URL; // usually "/"
export const MARZIPANO_SRC = `${BASE}panos/marzipano.js`;

export const DEFAULT_PAN_DEG = 140;

// Notan DC and Notan Edge were both exported with the same cube tiling / face
// size, so the geometry below is shared by every scene of either building.
const LEVELS = [
  { tileSize: 256, size: 256, fallbackOnly: true },
  { tileSize: 512, size: 512 },
  { tileSize: 512, size: 1024 },
  { tileSize: 512, size: 2048 },
  { tileSize: 512, size: 4096 },
];
const FACE_SIZE = 3600;
const FOV = 1.397892632121691; // ≈ 80° — shared "as-shot" zoom
const SCENE_DEFAULTS = { levels: LEVELS, faceSize: FACE_SIZE };

/* ══════════════════════════════════════════════════════════════════════════
 * NOTAN DC
 * ════════════════════════════════════════════════════════════════════════ */

/** Raw captured panos. `view` is the as-shot direction (radians). */
const DC_PANO_SCENES = [
  { id: "0-0001_mumty-level-services_5074m", name: "Mumty Level Services · 50.74m", view: { yaw: -1.5290442265518642, pitch: 0.11888036727305895, fov: FOV } },

  { id: "1-0002_terrace-f_4755m", name: "Terrace · 47.55m", view: { yaw: -1.5328247846000842, pitch: -0.05337156400268661, fov: FOV } },
  { id: "2-0003_14th-f_duplex-l2_441m", name: "14th Floor (Duplex L2) · 44.1m", view: { yaw: -1.5025580399221958, pitch: -0.0071226837266102905, fov: FOV } },
  { id: "3-0004_13th-f_duplex-l1_4065m", name: "13th Floor (Duplex L1) · 40.65m", view: { yaw: -1.5134883441799545, pitch: -0.09122142821705559, fov: FOV } },
  { id: "4-0005_12th-f_376m", name: "12th Floor · 37.6m", view: { yaw: -1.5102851862449782, pitch: -0.02585270389657346, fov: FOV } },
  { id: "5-0006_11th-f_triplex-l3_3455m", name: "11th Floor (Triplex L3) · 34.55m", view: { yaw: -1.5486359738136262, pitch: -0.006817886789779237, fov: FOV } },
  { id: "6-0007_10th-f_triplex-l2_315m", name: "10th Floor (Triplex L2) · 31.5m", view: { yaw: -1.5108486534543353, pitch: 0.05098137912418288, fov: FOV } },
  { id: "7-0008_9th-f_triplex-l1_2845m", name: "9th Floor (Triplex L1) · 28.45m", view: { yaw: -1.5585108284581999, pitch: 0.06360864731005478, fov: FOV } },
  { id: "8-0009_8th-f_refuge_254m", name: "8th Floor (Refuge) · 25.4m", view: { yaw: -1.5298932973069874, pitch: 0.040010136982782996, fov: FOV } },
  { id: "9-0010_7th-f_2235m", name: "7th Floor · 22.35m", view: { yaw: -1.4987107667626844, pitch: 0.051311109601915206, fov: FOV } },
  { id: "10-0011_6th-f_193m", name: "6th Floor · 19.3m", view: { yaw: -1.4914254012875485, pitch: -0.0013190155049223051, fov: FOV } },
  { id: "11-0012_5th-f_1625m", name: "5th Floor · 16.25m", view: { yaw: -1.4926547063556388, pitch: 0.024533688391645825, fov: FOV } },
  { id: "12-0013_4th-f_132m", name: "4th Floor · 13.2m", view: { yaw: -1.4637364463515041, pitch: 0.10024517837445757, fov: FOV } },
  { id: "13-0014_3rd-f_1015m", name: "3rd Floor · 10.15m", view: { yaw: -1.5211718660988858, pitch: -0.33136389031925084, fov: FOV } },
  { id: "14-l0015_2nd-f_71m", name: "2nd Floor · 7.1m", view: { yaw: -1.537132932918846, pitch: -0.4347103457519772, fov: FOV } },
  { id: "15-l0016_1st-f_405m", name: "1st Floor · 4.05m", view: { yaw: -1.4853486625285068, pitch: -0.5961658989145775, fov: FOV } },
];

/**
 * Which pano opens for each Notan DC floor, and how it's framed.
 *
 * Keys match floorKey(floor): "ground", "terrace", or the floor number.
 * Ground has no exterior pano (the lowest capture is the 1st floor), so it
 * stays null. The rooftop "0-0001_mumty-level-services_5074m" pano is unused —
 * assign it to a floor here if you want it reachable.
 *
 * Add yawDeg / pitchDeg / fovDeg to a row to override the as-shot framing
 * (see the file header for the workflow).
 */
const DC_FLOOR_PANO_MAP = {
  ground: null,
  1: { scene: "15-l0016_1st-f_405m", panDeg: DEFAULT_PAN_DEG },
  2: { scene: "14-l0015_2nd-f_71m", panDeg: DEFAULT_PAN_DEG },
  3: { scene: "13-0014_3rd-f_1015m", panDeg: DEFAULT_PAN_DEG },
  4: { scene: "12-0013_4th-f_132m", panDeg: DEFAULT_PAN_DEG },
  5: { scene: "11-0012_5th-f_1625m", panDeg: DEFAULT_PAN_DEG },
  6: { scene: "10-0011_6th-f_193m", panDeg: DEFAULT_PAN_DEG },
  7: { scene: "9-0010_7th-f_2235m", panDeg: DEFAULT_PAN_DEG },
  8: { scene: "8-0009_8th-f_refuge_254m", panDeg: DEFAULT_PAN_DEG },
  9: { scene: "7-0008_9th-f_triplex-l1_2845m", panDeg: DEFAULT_PAN_DEG },
  10: { scene: "6-0007_10th-f_triplex-l2_315m", panDeg: DEFAULT_PAN_DEG },
  11: { scene: "5-0006_11th-f_triplex-l3_3455m", panDeg: DEFAULT_PAN_DEG },
  12: { scene: "4-0005_12th-f_376m", panDeg: DEFAULT_PAN_DEG },
  13: { scene: "3-0004_13th-f_duplex-l1_4065m", panDeg: DEFAULT_PAN_DEG },
  14: { scene: "2-0003_14th-f_duplex-l2_441m", panDeg: DEFAULT_PAN_DEG },
  terrace: { scene: "1-0002_terrace-f_4755m", panDeg: DEFAULT_PAN_DEG },
};

/**
 * Per-room facing overrides — "a different angle for each view of a floor".
 *
 * Every room drawn on a floor plan (FloorPlanOverlay) opens that SAME floor's
 * pano, but each room faces a different side of the building, so each can frame
 * the view toward its own side. This table is where you set those angles.
 *
 *   REGION_PANO_MAP[<floorKey>]["<Room name>"] = { yawDeg, pitchDeg, fovDeg, panDeg }
 *
 *   • <floorKey>   — same key as FLOOR_PANO_MAP ("ground" / "terrace" / num).
 *   • "<Room name>"— EXACTLY the label shown when you hover the room on the
 *     plan (and in the 360° header). The rooms for each floor are pre-listed
 *     below; just fill the angles in.
 *   • yawDeg/pitchDeg/fovDeg — the facing/zoom to open at. Omit any to inherit
 *     the floor's framing. An empty {} means "open at the floor default".
 *   • panDeg — horizontal arc you may swing across (defaults to the floor's,
 *     then to 140).
 *   • scene — optional; omit to use the floor's pano. Set it only if a room
 *     should open a different capture.
 *
 * To find the numbers: click the room → drag the pano to the angle you want →
 * read the live "yaw … pitch … fov" readout in the viewer toolbar, or click
 * "Copy config" for a ready-to-paste, room-keyed snippet you drop in here.
 *
 * Floors 1/2/4/5/7 and 3/6/12 share a plan layout but are separate captures,
 * so each floor gets its own block (tune them independently).
 */
const DC_REGION_PANO_MAP = {
  1: {

    "Bedroom 1": { yawDeg: -113, pitchDeg: -5, fovDeg: 71, panDeg: 140 },
    "Bedroom 2": { yawDeg: 2, pitchDeg: 0, fovDeg: 63, panDeg: 140 },
    "Bedroom 3": { yawDeg: 42, pitchDeg: 2, fovDeg: 71, panDeg: 120 },
    "Bedroom 4": { yawDeg: 170, pitchDeg: 2, fovDeg: 66, panDeg: 120 },

  },
  2: {
    "Bedroom 1": { yawDeg: -113, pitchDeg: -5, fovDeg: 71, panDeg: 140 },
    "Bedroom 2": { yawDeg: 2, pitchDeg: 0, fovDeg: 63, panDeg: 140 },
    "Bedroom 3": { yawDeg: 42, pitchDeg: 2, fovDeg: 71, panDeg: 120 },
    "Bedroom 4": { yawDeg: 170, pitchDeg: 2, fovDeg: 66, panDeg: 120 },

  },
  3: {
    "Bedroom 1": { yawDeg: -113, pitchDeg: -5, fovDeg: 71, panDeg: 140 },
    "Bedroom 2": { yawDeg: 2, pitchDeg: 0, fovDeg: 63, panDeg: 140 },
    "Bedroom 3": { yawDeg: 42, pitchDeg: 2, fovDeg: 71, panDeg: 120 },
    "Bedroom 4": { yawDeg: 170, pitchDeg: 2, fovDeg: 66, panDeg: 120 },
  },
  4: {
    "Bedroom 1": { yawDeg: -113, pitchDeg: -5, fovDeg: 71, panDeg: 140 },
    "Bedroom 2": { yawDeg: 2, pitchDeg: 0, fovDeg: 63, panDeg: 140 },
    "Bedroom 3": { yawDeg: 42, pitchDeg: 2, fovDeg: 71, panDeg: 120 },
    "Bedroom 4": { yawDeg: 170, pitchDeg: 2, fovDeg: 66, panDeg: 120 },
  },
  5: {
    "Bedroom 1": { yawDeg: -113, pitchDeg: -5, fovDeg: 71, panDeg: 140 },
    "Bedroom 2": { yawDeg: 2, pitchDeg: 0, fovDeg: 63, panDeg: 140 },
    "Bedroom 3": { yawDeg: 42, pitchDeg: 2, fovDeg: 71, panDeg: 120 },
    "Bedroom 4": { yawDeg: 170, pitchDeg: 2, fovDeg: 66, panDeg: 120 },
  },
  6: {
    "Bedroom 1": { yawDeg: -113, pitchDeg: -5, fovDeg: 71, panDeg: 140 },
    "Bedroom 2": { yawDeg: 2, pitchDeg: 0, fovDeg: 63, panDeg: 140 },
    "Bedroom 3": { yawDeg: 42, pitchDeg: 2, fovDeg: 71, panDeg: 120 },
    "Bedroom 4": { yawDeg: 170, pitchDeg: 2, fovDeg: 66, panDeg: 120 },
  },
  7: {
    "Living Room": { yawDeg: -88, pitchDeg: -3, fovDeg: 71, panDeg: 140 },
    "Bedroom 1": { yawDeg: -121, pitchDeg: 2, fovDeg: 71, panDeg: 140 },
    "Bedroom 2": { yawDeg: 2, pitchDeg: 0, fovDeg: 63, panDeg: 140 },
    "Bedroom 3": { yawDeg: 42, pitchDeg: 2, fovDeg: 71, panDeg: 120 },
    "Bedroom 4": { yawDeg: 170, pitchDeg: 2, fovDeg: 66, panDeg: 120 },
  },
  8: {
    "Living Room": { yawDeg: -88, pitchDeg: -16, fovDeg: 71, panDeg: 140 },
    "Bedroom 1": { yawDeg: -121, pitchDeg: 1, fovDeg: 71, panDeg: 140 },
    "Bedroom 2": { yawDeg: 1, pitchDeg: 0, fovDeg: 63, panDeg: 140 },
    "Bedroom 3": { yawDeg: 38, pitchDeg: -1, fovDeg: 63, panDeg: 140 },
    "Refuge Area": { yawDeg: 101, pitchDeg: -1, fovDeg: 71, panDeg: 140 },
  },
  9: {
    "Living Room": { yawDeg: -88, pitchDeg: -3, fovDeg: 71, panDeg: 140 },
    "Bedroom 1": { yawDeg: -121, pitchDeg: 2, fovDeg: 71, panDeg: 140 },
    "Bedroom 2": { yawDeg: 25, pitchDeg: 0, fovDeg: 63, panDeg: 140 },
    "Bedroom 3": { yawDeg: 170, pitchDeg: 2, fovDeg: 66, panDeg: 120 },
  },
  10: {
    "Living Room": { yawDeg: -88, pitchDeg: -3, fovDeg: 71, panDeg: 140 },
    "Bedroom 01": { yawDeg: 170, pitchDeg: 2, fovDeg: 66, panDeg: 120 },
  },
  11: {

    "Masterbedroom": { yawDeg: -102, pitchDeg: -2, fovDeg: 71, panDeg: 140 },
    "Lounge": { yawDeg: -18, pitchDeg: 1, fovDeg: 71, panDeg: 140 },
    "Bedroom 4": { yawDeg: 170, pitchDeg: 2, fovDeg: 66, panDeg: 120 },
    "Study Office": { yawDeg: 61, pitchDeg: -6, fovDeg: 63, panDeg: 120 },
  },
  12: {
    Livingroom: { yawDeg: -88, pitchDeg: -3, fovDeg: 71, panDeg: 140 },
    "Bedroom 1": { yawDeg: -157, pitchDeg: -2, fovDeg: 71, panDeg: 140 },
    "Bedroom 3": { yawDeg: 42, pitchDeg: 2, fovDeg: 71, panDeg: 120 },
    "Bedroom 4": { yawDeg: 170, pitchDeg: 2, fovDeg: 66, panDeg: 120 },
    "Bedroom 2": { yawDeg: -18, pitchDeg: -2, fovDeg: 71, panDeg: 120 },
  },
  13: {
    Livingroom: { yawDeg: -88, pitchDeg: -3, fovDeg: 71, panDeg: 140 },
    "Bedroom 2": { yawDeg: 42, pitchDeg: 2, fovDeg: 71, panDeg: 120 },
    "Bedroom 4": { yawDeg: 170, pitchDeg: 2, fovDeg: 66, panDeg: 120 },
  },
  14: {
    "Master Bedroom": { yawDeg: -119, pitchDeg: -2, fovDeg: 71, panDeg: 120 },
    "Bedroom 02": { yawDeg: 3, pitchDeg: 0, fovDeg: 71, panDeg: 120 },
    "Bedroom 2": { yawDeg: 42, pitchDeg: 2, fovDeg: 71, panDeg: 120 },
    "Bedroom 4": { yawDeg: 170, pitchDeg: 2, fovDeg: 66, panDeg: 120 },
    "Lounge": { yawDeg: -18, pitchDeg: 1, fovDeg: 71, panDeg: 140 },
  },
  terrace: {
    "Pool Deck": { yawDeg: -88, pitchDeg: -3, fovDeg: 71, panDeg: 140 },
    "Socity Office": { yawDeg: -18, pitchDeg: 1, fovDeg: 90, panDeg: 70 },
    "Gym": { yawDeg: 31, pitchDeg: 12, fovDeg: 71, panDeg: 140 },
  },


};

/* ══════════════════════════════════════════════════════════════════════════
 * NOTAN EDGE
 * ════════════════════════════════════════════════════════════════════════ */

/** Raw captured panos. `view` is the as-shot direction (radians). */
const EDGE_PANO_SCENES = [
  { id: "3-0017_roof-level_524m", name: "Terrace · 52.4m", view: { yaw: -1.4212356099624053, pitch: -0.13387637790737372, fov: FOV } },
  { id: "4-0018_terrace-f_4765m", name: "15th Floor · 47.65m", view: { yaw: -1.4411417325977247, pitch: -0.09144206526422494, fov: FOV } },
  { id: "5-0019_14th-f_446m", name: "14th Floor · 44.6m", view: { yaw: -1.4555278783939762, pitch: -0.03021479871734911, fov: FOV } },
  { id: "6-0020_13th-f_4155m", name: "13th Floor · 41.55m", view: { yaw: -1.2835976281572172, pitch: -0.08276636659185144, fov: FOV } },
  { id: "7-0021_12th-f_385m", name: "12th Floor · 38.5m", view: { yaw: -1.3184411960648568, pitch: -0.14631098710741064, fov: FOV } },
  { id: "8-0022_11th-f_3545m", name: "11th Floor · 35.45m", view: { yaw: -1.2283058370422442, pitch: -0.10356123347483859, fov: FOV } },
  { id: "9-0023_10th-f_324m", name: "10th Floor · 32.4m", view: { yaw: -1.327650457865733, pitch: -0.03857890659613972, fov: FOV } },
  { id: "10-0024_9th-f_2935m", name: "9th Floor · 29.35m", view: { yaw: -1.4970755373835196, pitch: 0.011190338271322986, fov: FOV } },
  { id: "11-0025_8th-f_refuge_263m", name: "8th Floor (Refuge) · 26.3m", view: { yaw: -1.216811710436719, pitch: -0.008562222001279096, fov: FOV } },
  { id: "12-0026_7th-f_2325m", name: "7th Floor · 23.25m", view: { yaw: -1.1446689488485084, pitch: 0.03754689157078417, fov: FOV } },
  { id: "13-0027_6th-f_202m", name: "6th Floor · 20.2m", view: { yaw: -1.164383943830508, pitch: -0.13002194036717896, fov: FOV } },
  { id: "14-0028_5th-f_1715m", name: "5th Floor · 17.15m", view: { yaw: -1.3024809609728045, pitch: -0.1606284014682693, fov: FOV } },
  { id: "15-0029_4th-f_141m", name: "4th Floor · 14.1m", view: { yaw: -1.387462168615313, pitch: -0.20579761975137245, fov: FOV } },
  { id: "0-0030_3rd-f_115m", name: "3rd Floor · 11.5m", view: { yaw: -1.15827338281564, pitch: -0.0635767358605488, fov: FOV } },
  { id: "1-0031_2nd-f_8m", name: "2nd Floor · 8m", view: { yaw: -1.353179265406654, pitch: -0.2681335713898747, fov: FOV } },
  { id: "2-0032_1st-f_45m", name: "1st Floor · 4.5m", view: { yaw: -1.2697968880296848, pitch: -0.49851198147082876, fov: FOV } },
];

/**
 * Which pano opens for each Notan Edge floor, and how it's framed.
 *
 * Keys match floorKey(floor): "ground", "terrace", or the floor number.
 * Ground has no exterior pano (the lowest capture is the 1st floor), so it
 * stays null. There's no dedicated 15th-floor or terrace-roof capture, so the
 * top two captures step up one level each: floor 15 uses the terrace capture
 * (47.65m) and the terrace uses the roof-level capture (52.4m).
 */
const EDGE_FLOOR_PANO_MAP = {
  ground: null,
  1: { scene: "2-0032_1st-f_45m", panDeg: DEFAULT_PAN_DEG },
  2: { scene: "1-0031_2nd-f_8m", panDeg: DEFAULT_PAN_DEG },
  3: { scene: "0-0030_3rd-f_115m", panDeg: DEFAULT_PAN_DEG },
  4: { scene: "15-0029_4th-f_141m", panDeg: DEFAULT_PAN_DEG },
  5: { scene: "14-0028_5th-f_1715m", panDeg: DEFAULT_PAN_DEG },
  6: { scene: "13-0027_6th-f_202m", panDeg: DEFAULT_PAN_DEG },
  7: { scene: "12-0026_7th-f_2325m", panDeg: DEFAULT_PAN_DEG },
  8: { scene: "11-0025_8th-f_refuge_263m", panDeg: DEFAULT_PAN_DEG },
  9: { scene: "10-0024_9th-f_2935m", panDeg: DEFAULT_PAN_DEG },
  10: { scene: "9-0023_10th-f_324m", panDeg: DEFAULT_PAN_DEG },
  11: { scene: "8-0022_11th-f_3545m", panDeg: DEFAULT_PAN_DEG },
  12: { scene: "7-0021_12th-f_385m", panDeg: DEFAULT_PAN_DEG },
  13: { scene: "6-0020_13th-f_4155m", panDeg: DEFAULT_PAN_DEG },
  14: { scene: "5-0019_14th-f_446m", panDeg: DEFAULT_PAN_DEG },
  15: { scene: "4-0018_terrace-f_4765m", panDeg: DEFAULT_PAN_DEG },
  terrace: { scene: "3-0017_roof-level_524m", panDeg: DEFAULT_PAN_DEG },
};

/**
 * Per-room facing overrides for Notan Edge — same shape and workflow as
 * DC_REGION_PANO_MAP above. Empty for now: every floor-plan unit opens its
 * floor's pano at the as-shot framing until you tune it. Click a unit, drag to
 * the angle you want, then "Copy config" to get a ready-to-paste snippet keyed
 * by the unit label (e.g. "Unit 3": { … }).
 */
const EDGE_REGION_PANO_MAP = {
  // 14: {
  // "Unit 2": { yawDeg: -151, pitchDeg: -8, fovDeg: 78, panDeg: 140 },
  // },

  terrace: {
    // REGION_PANO_MAP["terrace"]
    "Terrace": { yawDeg: -151, pitchDeg: -6, fovDeg: 78, panDeg: 140 },
    "Commercial": { yawDeg: -11, pitchDeg: 1, fovDeg: 78, panDeg: 140 },

  },
  15: {
    "Terrace": { yawDeg: -151, pitchDeg: -6, fovDeg: 78, panDeg: 140 },
    "Commercial": { yawDeg: -11, pitchDeg: 1, fovDeg: 78, panDeg: 140 },
  },
  14: {


    "Commercial": { yawDeg: 94, pitchDeg: -3, fovDeg: 78, panDeg: 140 },
  },

  13: {

    "2,3,6,8,10,13 Floor": { yawDeg: 94, pitchDeg: -3, fovDeg: 78, panDeg: 140 },
  },
  11: {
    "Commercial": { yawDeg: 94, pitchDeg: -3, fovDeg: 78, panDeg: 140 },
  },
  10: {
         "2,3,6,8,10,13 Floor": { yawDeg: 94, pitchDeg: -3, fovDeg: 78, panDeg: 140 },
  },
  9: {
         "Commercial": { yawDeg: 94, pitchDeg: -3, fovDeg: 78, panDeg: 140 },
  },
  8 : {
    "2,3,6,8,10,13 Floor": { yawDeg: 94, pitchDeg: -3, fovDeg: 78, panDeg: 140 },
  },
  7 : {

   "Refuge Area": { yawDeg: -136, pitchDeg: 5, fovDeg: 78, panDeg: 140 },
   "Commercial": { yawDeg: 4, pitchDeg: -4, fovDeg: 78, panDeg: 140 },

  },
  6 : {
      "2,3,6,8,10,13 Floor": { yawDeg: 94, pitchDeg: -3, fovDeg: 78, panDeg: 140 },
  },
  5 : {
      "Commercial": { yawDeg: 94, pitchDeg: -3, fovDeg: 78, panDeg: 140 },
  },
  4 : {
      "Commercial": { yawDeg: 94, pitchDeg: -3, fovDeg: 78, panDeg: 140 },
  },
  3 : {
      "2,3,6,8,10,13 Floor": { yawDeg: 94, pitchDeg: -3, fovDeg: 78, panDeg: 140 },
  },
  2 : {
      "2,3,6,8,10,13 Floor": { yawDeg: 94, pitchDeg: -3, fovDeg: 78, panDeg: 140 },
  },
  1 : {
     "Commercial": { yawDeg: 94, pitchDeg: -3, fovDeg: 78, panDeg: 140 },
  },
 

};

/* ══════════════════════════════════════════════════════════════════════════
 * REGISTRY + RESOLUTION
 * ════════════════════════════════════════════════════════════════════════ */

/**
 * Every building's pano config, keyed by the `/projects/:id` route param used
 * in buildingsData.js / buildingViewsData.js. Add a building by dropping its
 * tiles into /public/panos/<id>/tiles and adding an entry here.
 */
const PANO_BUILDINGS = {
  "notan-dc": {
    tilesBase: `${BASE}panos/notan-dc/tiles`,
    sceneById: new Map(DC_PANO_SCENES.map((s) => [s.id, s])),
    floorMap: DC_FLOOR_PANO_MAP,
    regionMap: DC_REGION_PANO_MAP,
  },
  "notan-edge": {
    tilesBase: `${BASE}panos/notan-edge/tiles`,
    sceneById: new Map(EDGE_PANO_SCENES.map((s) => [s.id, s])),
    floorMap: EDGE_FLOOR_PANO_MAP,
    regionMap: EDGE_REGION_PANO_MAP,
  },
};

const DEG = Math.PI / 180;
export const toRad = (deg) => deg * DEG;
export const toDeg = (rad) => rad / DEG;

/** Stable key for a BuildingPage floor object (ground / terrace / number). */
export const floorKey = (floor) =>
  floor.isGround ? "ground" : floor.isTerrace ? "terrace" : floor.num;

/**
 * Turn a `{ scene, yawDeg?, pitchDeg?, fovDeg?, panDeg? }` config into a
 * ready-to-render pano (or null if the scene is missing), resolving the scene
 * against the given building. `center` is the framing the viewer opens at;
 * `panRad` is the total horizontal arc the user may look across. Shared by both
 * floor- and region-level lookups.
 */
const resolvePano = (building, cfg) => {
  if (!cfg) return null;
  const scene = building.sceneById.get(cfg.scene);
  if (!scene) return null;

  const center = {
    yaw: cfg.yawDeg != null ? toRad(cfg.yawDeg) : scene.view.yaw,
    pitch: cfg.pitchDeg != null ? toRad(cfg.pitchDeg) : scene.view.pitch,
    fov: cfg.fovDeg != null ? toRad(cfg.fovDeg) : scene.view.fov,
  };

  return {
    id: scene.id,
    name: scene.name,
    tilesUrl: `${building.tilesBase}/${scene.id}`,
    ...SCENE_DEFAULTS,
    center,
    panRad: toRad(cfg.panDeg ?? DEFAULT_PAN_DEG),
  };
};

/**
 * Resolve a floor to a ready-to-render pano config, or null if that building/
 * floor has no pano.
 */
export const getFloorPano = (buildingId, floor) => {
  const building = PANO_BUILDINGS[buildingId];
  if (!building || !floor) return null;
  return resolvePano(building, building.floorMap[floorKey(floor)]);
};

/**
 * Resolve the pano a floor-plan room opens. It's the floor's own pano, re-framed
 * by the matching region entry (facing/zoom/arc) when one exists.
 * `regionName == null` (the "whole floor" 360° button) falls back to the floor's
 * default framing, so the pano stays reachable even with no per-room overrides.
 */
export const getRegionPano = (buildingId, floor, regionName) => {
  const building = PANO_BUILDINGS[buildingId];
  if (!building || !floor) return null;

  const floorCfg = building.floorMap[floorKey(floor)];
  if (!floorCfg) return null;

  const override =
    regionName != null
      ? building.regionMap[floorKey(floor)]?.[regionName]
      : null;

  // Room values win; anything omitted (incl. the scene) inherits the floor's.
  return resolvePano(building, { ...floorCfg, ...override });
};
