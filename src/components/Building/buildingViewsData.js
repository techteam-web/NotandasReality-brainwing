import notanDcView from "../../assets/ViewsBuildings/Notan-DC.webp";
import notanEdgeView from "../../assets/ViewsBuildings/Notan_EDGE.webp";
import notanJewelView from "../../assets/ViewsBuildings/Notan_jewel_sketch.webp";
import notanSpaceView from "../../assets/ViewsBuildings/Notan_space_sketch.webp";
import notanTerraceView from "../../assets/ViewsBuildings/Notan_terrace_sketch.webp";
import notanCrownView from "../../assets/ViewsBuildings/Notan_crown_sketch.webp";
import notanLandsEndView from "../../assets/ViewsBuildings/Notan_Lands-End.webp";
import notanViewsView from "../../assets/ViewsBuildings/notan_Views.webp";
import notanBeachHouseView from "../../assets/ViewsBuildings/Notan_Beach-House.webp";
import notanTidesView from "../../assets/ViewsBuildings/Notan_Tides.webp";
import {
  NOTAN_DC_FLOORS,
  NOTAN_EDGE_FLOORS,
  NOTAN_JEWEL_FLOORS,
  NOTAN_SPACE_FLOORS,
  NOTAN_TERRACE_FLOORS,
  NOTAN_CROWN_FLOORS,
  NOTAN_LANDS_END_FLOORS,
  NOTAN_VIEWS_FLOORS,
  NOTAN_BEACH_HOUSE_FLOORS,
  NOTAN_TIDES_FLOORS,
} from "./floorShapes";

/**
 * View-page configuration per building, keyed by the building `id` used in
 * buildingsData.js (the `/projects/:id` route param).
 *
 * To add another building, drop its photo into assets/ViewsBuildings, its
 * floor cut-outs into assets/Building_Floor_SVG/<Name>, wire a floors array in
 * floorShapes.js, then add an entry here — the page renders the rest
 * automatically.
 *
 * `plate` places the project's mark, address and amenities (see ProjectPlate).
 * It replaced six strings of per-breakpoint offsets per building, which drifted
 * apart at every width they hadn't been hand-tuned for:
 *
 *   x, y   centre of the plate, as a % of the RENDER — not of the viewport, so
 *          it stays over the same patch of sky however the photo is cropped
 *   w      plate width, and `mark` the width of the wordmark inside it, both
 *          in pixels at a 1920-wide render; they scale from there
 *   gap    space between the address block and the amenities, in root em.
 *          Deliberately different per project: it is the knob that balances the
 *          plate against ITS render, so the composition neither crowds nor
 *          leaves a dead patch under the text. Lands End's sky runs a long way
 *          down and wants 7; Edge's is tight and wants 2.6.
 *   type   nudge on the type scale alone (default 1)
 */
export const BUILDING_VIEWS = {
  "notan-dc": {
    viewImg: notanDcView,
    // every floor SVG shares this coordinate space
    viewBox: "0 0 1672 941",
    floors: NOTAN_DC_FLOORS,
    plate: { x: 77, y: 33, w: 470, mark: 250, gap: 3.6 },
    nMarkFill: "black",

    asideClass:
      "left-80 top-26 2xl:left-95 2xl:top-65 xl:left-73 xl:top-54 lg:left-53 lg:top-36 3xl:left-120 3xl:top-[35%] 4xl:left-[27%] 4xl:top-[37%] ",
  },
  "notan-edge": {
    viewImg: notanEdgeView,
    // matches the shared viewBox baked into Building_Floor_SVG/Nothan_Edge/*.svg
    viewBox: "-9554435 -6002850 4615 2597",
    floors: NOTAN_EDGE_FLOORS,
    plate: { x: 29, y: 42, w: 510, mark: 250, gap: 2.6 },
    nMarkFill: "black",
  },
  "notan-jewel": {
    viewImg: notanJewelView,
    // matches the combined Building_Floor_SVG/Nothan_jewel/nothan_jewel-2.8x.svg
    viewBox: "0 0 4615 2597",
    floors: NOTAN_JEWEL_FLOORS,
    plate: { x: 72, y: 36, w: 450, mark: 230, gap: 4.4 },
    asideClass:
      "left-80 top-36 md:top-127 2xl:left-99 2xl:top-60 xl:left-57 xl:top-46 lg:left-53 lg:top-32 3xl:left-115 3xl:top-85 4xl:left-178 4xl:top-120",
    nMarkFill: "black",
  },
  "notan-space": {
    viewImg: notanSpaceView,
    // matches the combined Building_Floor_SVG/Nothan_space/Notan_space_.svg
    viewBox: "0 0 1672 941",
    floors: NOTAN_SPACE_FLOORS,
    plate: { x: 73, y: 34, w: 430, mark: 245, gap: 3.6 },
    asideClass:
      "left-[25%] top-[20%] md:right-12 md:w-44 2xl:top-[19%] xl:top-[18%]  lg:top-[23%] 3xl:top-[24%] 4xl:top-[25%]",
    nMarkFill: "black",
  },
  "notan-terrace": {
    viewImg: notanTerraceView,
    // matches the combined Building_Floor_SVG/Nothan_terrace/Notan_terrace_2.8x.svg
    viewBox: "0 0 4615 2597",
    floors: NOTAN_TERRACE_FLOORS,
    plate: { x: 28, y: 40, w: 510, mark: 215, gap: 3.6 },
    nMarkFill: "black",
    asideClass:
      " top-[30%] xl:top-[20%] xl:right-[16%] 2xl:right-[17%] 2xl:top-[20%] xl:top-[10%] lg:top-[15%] lg:right-[16%] 3xl:top-[30%] 3xl:right-[20%] 4xl:top-[25%]",
  },
  "notan-crown": {
    viewImg: notanCrownView,
    // matches the combined Building_Floor_SVG/Nothan_crown/Notan_crown_.svg
    viewBox: "0 0 460.8 259.2",
    floors: NOTAN_CROWN_FLOORS,
    plate: { x: 19, y: 30, w: 400, mark: 300 },
    asideClass:
      "right-[15%] top-[20%] 2xl:top-[25%] 2xl:right-33 xl:top-[25%] xl:right-25 lg:top-[19%] lg:right-16 3xl:top-[24%] 3xl:right-[10%] 4xl:top-[35%]",
    nMarkFill: "black",
  },

  "notan-lands-end": {
    viewImg: notanLandsEndView,
    // matches the viewBox baked into Building_Floor_SVG/Notan_Lands-End/Notan_Lands-End_building_Cutout.svg
    viewBox: "0 0 10000 5886",
    floors: NOTAN_LANDS_END_FLOORS,
    plate: { x: 25, y: 40, w: 490, mark: 250, gap: 7 },
    asideClass:
      "right-[15%] top-[30%] xl:top-[25%] xl:right-60 2xl:right-[19%] 2xl:top-[25%] lg:top-[23%] lg:right-[15.5%] 3xl:top-[23%] 3xl:right-[22%] 4xl:top-[23%] 4xl:right-[22%]",
    nMarkFill: "black",
  },
  "notan-views": {
    viewImg: notanViewsView,
    // matches the combined Building_Floor_SVG/Notan_Views/*.svg
    viewBox: "0 0 4615 2597",
    floors: NOTAN_VIEWS_FLOORS,
    plate: { x: 76, y: 36, w: 470, mark: 230, gap: 3 },
    asideClass:
      "left-80 top-36 md:top-127 2xl:left-94 2xl:top-67 xl:left-87 xl:top-64 lg:left-63 lg:top-28 3xl:left-135 3xl:top-90 4xl:left-188 4xl:top-130",
    nMarkFill: "black",
  },

  "notan-beach-house": {
    viewImg: notanBeachHouseView,
    // matches Building_Floor_SVG/Notan_Beach-House/NOTAN-BEACH-HOUSE-BUILDINGSVG.svg,
    // and the render's own 8000×3636 — the cut-out bands land on the tower as drawn
    viewBox: "0 0 8000 3636",
    floors: NOTAN_BEACH_HOUSE_FLOORS,
    plate: { x: 75, y: 36, w: 460, mark: 185, gap: 2.8 },
    // The tower sits left of centre (34–58% of the frame) with open sea and sky
    // to its right, so the mark and the floor readout both live over the water.
    // Starting placement — dial in against the live page like the others.
    asideClass:
      "left-[9%] top-[15%] lg:left-[13%] lg:top-[15%] xl:left-[13%] xl:top-[20%] 2xl:left-[15%] 2xl:top-[21%] 3xl:right-[15%] 3xl:top-[25%] 4xl:left-[16%] 4xl:top-[24%]",
    nMarkFill: "black",
  },

  "notan-tides": {
    viewImg: notanTidesView,
    // matches Building_Floor_SVG/Notan_Tides/notan-Tides_BuildingSvg.svg, and
    // the render's own 4627×2603 — the bands land on the tower as drawn
    viewBox: "0 0 4627 2603",
    floors: NOTAN_TIDES_FLOORS,
    plate: { x: 21, y: 34, w: 490, mark: 230, gap: 3.6 },
    // The tower stands centre-right (35–66% of the frame) against open sky to
    // its left, so the mark and the floor readout both sit over that sky.
    // Starting placement — dial in against the live page like the others.
    asideClass:
      "right-[15%] top-[30%] xl:top-[18%] xl:right-44 2xl:right-[15%] 2xl:top-[20%] lg:top-[13%] lg:right-[15.5%] 3xl:top-[23%] 3xl:right-[18%] 4xl:top-[20%] 4xl:right-[19%]",
    nMarkFill: "black",
  },
};
