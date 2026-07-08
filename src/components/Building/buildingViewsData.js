import notanDcView from "../../assets/ViewsBuildings/Notan-DC.webp";
import notanEdgeView from "../../assets/ViewsBuildings/Notan_EDGE.webp";
import notanJewelView from "../../assets/ViewsBuildings/Notan_jewel_sketch.webp";
import notanSpaceView from "../../assets/ViewsBuildings/Notan_space_sketch.webp";
import notanTerraceView from "../../assets/ViewsBuildings/Notan_terrace_sketch.webp";
import notanCrownView from "../../assets/ViewsBuildings/Notan_crown_sketch.webp";
import {
  NOTAN_DC_FLOORS,
  NOTAN_EDGE_FLOORS,
  NOTAN_JEWEL_FLOORS,
  NOTAN_SPACE_FLOORS,
  NOTAN_TERRACE_FLOORS,
  NOTAN_CROWN_FLOORS,
} from "./floorShapes";

/**
 * View-page configuration per building, keyed by the building `id` used in
 * buildingsData.js (the `/projects/:id` route param).
 *
 * Only Notan DC has art so far. To add another building later, drop its
 * photo into assets/ViewsBuildings, its floor cut-outs into
 * assets/Building_Floor_SVG/<Name>, wire a floors array in floorShapes.js,
 * then add an entry here — the page renders the rest automatically.
 */
export const BUILDING_VIEWS = {
  "notan-dc": {
    viewImg: notanDcView,
    // every floor SVG shares this coordinate space
    viewBox: "0 0 1672 941",
    floors: NOTAN_DC_FLOORS,
    headerClass:
      "left-80 top-36 md:top-127 2xl:left-74 2xl:top-107 xl:left-55  xl:top-90 lg:left-20 lg:top-70 3xl:left-102 3xl:top-105 4xl:left-137 4xl:top-150",
    amenityClass:
      "bottom-55 left-75 md:bottom-15 md:left-15 lg:bottom-15 lg:left-15 lg:h-35 2xl:h-65 2xl:left-57 2xl:top-137 3xl:top-150 3xl:left-87 3xl:h-75 4xl:top-190 4xl:left-148 4xl:h-76 xl:h-62 xl:left-32 xl:top-115 ",
  },
  "notan-edge": {
    viewImg: notanEdgeView,
    // matches the shared viewBox baked into Building_Floor_SVG/Nothan_Edge/*.svg
    viewBox: "-9554435 -6002850 4615 2597",
    floors: NOTAN_EDGE_FLOORS,
    headerClass:
      "left-80 top-36 md:top-127 2xl:left-74 2xl:top-90 xl:left-55  xl:top-65 lg:left-30 lg:top-50 3xl:left-102 3xl:top-105 4xl:left-137 4xl:top-150",
  },
  "notan-jewel": {
    viewImg: notanJewelView,
    // matches the combined Building_Floor_SVG/Nothan_jewel/nothan_jewel-2.8x.svg
    viewBox: "0 0 4615 2597",
    floors: NOTAN_JEWEL_FLOORS,
    amenityClass:
      "bottom-55 left-75 md:bottom-15 md:left-15 lg:bottom-15 lg:left-15 lg:h-35 2xl:left-55 2xl:top-133 2xl:h-60 3xl:top-165 3xl:left-87 4xl:bottom-70 4xl:left-90 xl:h-52 xl:left-27 ",
    headerClass:
      "left-80 top-36 md:top-127 2xl:left-59 2xl:top-90 xl:left-38 xl:top-74 lg:left-23 lg:top-54 3xl:left-89 3xl:top-127 4xl:left-90 4xl:top-150",

    // default header/aside positions are fine for this one, so no need to override
  },
  "notan-space": {
    viewImg: notanSpaceView,
    // matches the combined Building_Floor_SVG/Nothan_space/Notan_space_.svg
    viewBox: "0 0 1672 941",
    floors: NOTAN_SPACE_FLOORS,
    amenityClass:
      "bottom-55 left-75 md:bottom-15 md:left-15 lg:bottom-15 lg:left-15 lg:h-35 2xl:h-57 2xl:left-60 2xl:top-117 3xl:top-145 3xl:left-90 4xl:bottom-70 4xl:left-90 xl:h-52 xl:left-37 ",
    headerClass:
      "left-80 top-36 md:top-127 2xl:left-67 2xl:top-90 xl:left-55 xl:top-74  lg:left-23 lg:top-54 3xl:left-95 3xl:top-109 4xl:left-90 4xl:top-150",
  },
  "notan-terrace": {
    viewImg: notanTerraceView,
    // matches the combined Building_Floor_SVG/Nothan_terrace/Notan_terrace_2.8x.svg
    viewBox: "0 0 4615 2597",
    floors: NOTAN_TERRACE_FLOORS,
    headerClass:
      "left-80 top-36 md:top-127 2xl:left-60 2xl:top-70 xl:left-45  xl:top-55 lg:left-7 lg:top-40 3xl:left-90 3xl:top-105 4xl:left-137 4xl:top-150",
  },
  "notan-crown": {
    viewImg: notanCrownView,
    // matches the combined Building_Floor_SVG/Nothan_crown/Notan_crown_.svg
    viewBox: "0 0 1672 941",
    floors: NOTAN_CROWN_FLOORS,
    headerClass:
      "left-80 top-36 md:top-127 2xl:left-74 2xl:top-105 xl:left-60 xl:top-100 lg:left-20 lg:top-70 3xl:left-97 3xl:top-127 4xl:left-137 4xl:top-150",
    asideClass:
      "left-[25%] top-[20%] md:right-12 md:w-44 2xl:top-[10%] xl:top-[10%]  lg:top-[5%] 3xl:top-[14%] 4xl:top-[10%]",
  },
};
