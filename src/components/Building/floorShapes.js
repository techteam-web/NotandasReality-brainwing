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

const parseShape = (raw) => {
  const points = raw.match(/points="([^"]+)"/);
  if (points) return { type: "polygon", points: points[1].trim() };

  const d = raw.match(/\sd="([^"]+)"/);
  if (d) return { type: "path", d: d[1].trim() };

  return null;
};

const buildFloors = (files) =>
  Object.entries(files)
    .map(([path, raw]) => {
      const file = path.split("/").pop().replace(".svg", "");
      const isTerrace = /terrace/i.test(file);
      const isGround = /ground/i.test(file);
      // ground floor has no digit in its name → keep it at num 0 (the base)
      const num = isGround ? 0 : parseInt(file.match(/(\d+)/)?.[1] ?? "0", 10);
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

export const NOTAN_DC_FLOORS = buildFloors(NOTAN_DC_FILES);
