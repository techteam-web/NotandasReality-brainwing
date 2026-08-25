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

import {
  buildFloors,
  buildFloorsFromCombined,
} from "./floorGeometry";

// Loaded eagerly as raw strings at build time — no runtime fetch.
const NOTAN_DC_FILES = import.meta.glob(
  "../../assets/Building_Floor_SVG/Nothan_DC/*.svg",
  { query: "?raw", import: "default", eager: true },
);

const NOTAN_EDGE_FILES = import.meta.glob(
  "../../assets/Building_Floor_SVG/Nothan_Edge/*.svg",
  { query: "?raw", import: "default", eager: true },
);

// Jewel and Space ship ONE combined elevation SVG (every floor is an element
// inside it, identified by `id`) rather than one file per floor. Glob still
// returns a single entry per building; buildFloorsFromCombined splits it.
const NOTAN_JEWEL_FILE = import.meta.glob(
  "../../assets/Building_Floor_SVG/Nothan_jewel/nothan_jewel-2.8x.svg",
  { query: "?raw", import: "default", eager: true },
);

const NOTAN_SPACE_FILE = import.meta.glob(
  "../../assets/Building_Floor_SVG/Nothan_space/Notan_space_.svg",
  { query: "?raw", import: "default", eager: true },
);

const NOTAN_TERRACE_FILE = import.meta.glob(
  "../../assets/Building_Floor_SVG/Nothan_terrace/Notan_terrace_2.8x.svg",
  { query: "?raw", import: "default", eager: true },
);

const NOTAN_CROWN_FILE = import.meta.glob(
  "../../assets/Building_Floor_SVG/Nothan_crown/Notan_crown_.svg",
  { query: "?raw", import: "default", eager: true },
);

const NOTAN_LANDS_END_FILE = import.meta.glob(
  "../../assets/Building_Floor_SVG/Notan_Lands-End/Notan_Lands-End_building_Cutout.svg",
  { query: "?raw", import: "default", eager: true },
);

const NOTAN_TIDES_FILE = import.meta.glob(
  "../../assets/Building_Floor_SVG/Notan_Tides/notan-Tides_BuildingSvg.svg",
  { query: "?raw", import: "default", eager: true },
);

const NOTAN_BEACH_HOUSE_FILE = import.meta.glob(
  "../../assets/Building_Floor_SVG/Notan_Beach-House/NOTAN-BEACH-HOUSE-BUILDINGSVG.svg",
  { query: "?raw", import: "default", eager: true },
);

const NOTAN_VIEWS_FILES = import.meta.glob(
  "../../assets/Building_Floor_SVG/Notan_Views/*.svg",
  { query: "?raw", import: "default", eager: true },
);

// The glob returns a one-entry map; grab that single combined SVG string.
const firstRaw = (files) => Object.values(files)[0];

export const NOTAN_DC_FLOORS = buildFloors(NOTAN_DC_FILES);
export const NOTAN_EDGE_FLOORS = buildFloors(NOTAN_EDGE_FILES);
export const NOTAN_JEWEL_FLOORS = buildFloorsFromCombined(
  firstRaw(NOTAN_JEWEL_FILE),
);
export const NOTAN_SPACE_FLOORS = buildFloorsFromCombined(
  firstRaw(NOTAN_SPACE_FILE),
);
export const NOTAN_TERRACE_FLOORS = buildFloorsFromCombined(
  firstRaw(NOTAN_TERRACE_FILE),
);
export const NOTAN_CROWN_FLOORS = buildFloorsFromCombined(
  firstRaw(NOTAN_CROWN_FILE),
);
export const NOTAN_LANDS_END_FLOORS = buildFloorsFromCombined(
  firstRaw(NOTAN_LANDS_END_FILE),
);
export const NOTAN_BEACH_HOUSE_FLOORS = buildFloorsFromCombined(
  firstRaw(NOTAN_BEACH_HOUSE_FILE),
);
export const NOTAN_TIDES_FLOORS = buildFloorsFromCombined(
  firstRaw(NOTAN_TIDES_FILE),
);
export const NOTAN_VIEWS_FLOORS = buildFloors(NOTAN_VIEWS_FILES);
