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
      "left-80 top-36 md:top-127 2xl:left-82 2xl:top-30 xl:left-53 xl:top-17 lg:left-58 lg:top-10 3xl:left-100 3xl:top-55 4xl:left-115 4xl:top-50 ",
    headerLogoClass:
      "my-[-30%] w-64 sm:w-72 md:w-100 lg:w-36 xl:w-58  2xl:w-56 3xl:w-80 4xl:w-90",
    headerSubClass:
      "lg:-mt-14 lg:text-[5px] xl:text-[-23px]  xl:mt-10 2xl:-mt-5 2xl:text-[8px] 2xl:text-bold 3xl:mt-5 3xl:text-[10px] 4xl:-mt-7 4xl:text-[16px]",
    nMarkFill: "black",
    amenityClass:
      "w-[calc(100%-2.5rem)] max-w-xl sm:max-w-2xl lg:max-w-3xl bottom-55 left-75 md:bottom-15 md:left-15 lg:top-60 lg:-left-23 2xl:left-16 2xl:top-82 3xl:top-110 3xl:left-45 4xl:top-150 4xl:left-90 xl:-left-2 xl:top-63",
    amenityListClass:
      "max-w-lg xl:w-[17rem] lg:w-[15rem] 2xl:w-[20rem] 3xl:w-[26rem] 4xl:w-[33rem]",
    amenityItemClass:
      "lg:text-[10px] xl:text-[12px] 2xl:text-[15.2px] 3xl:text-[18px] 4xl:text-[25px]",
    asideClass: "xl:top-[18%] xl:left-[67%] lg:top-[18%] lg:left-[67%]",
  },
  "notan-edge": {
    viewImg: notanEdgeView,
    // matches the shared viewBox baked into Building_Floor_SVG/Nothan_Edge/*.svg
    viewBox: "-9554435 -6002850 4615 2597",
    floors: NOTAN_EDGE_FLOORS,
    headerClass:
      "left-80 top-36 md:top-127 2xl:left-74 2xl:top-60 xl:left-55  xl:top-65 lg:left-45 lg:top-15 3xl:left-102 3xl:top-70 4xl:left-137 4xl:top-110",
    headerLogoClass:
      "my-[-30%] w-64 sm:w-72 md:w-100 lg:w-36 xl:w-68 2xl:w-76 4xl:w-130",
    nMarkFill: "black",
    amenityClass:
      "w-[calc(100%-2.5rem)] max-w-xl sm:max-w-2xl lg:max-w-3xl bottom-55 left-75 md:bottom-15 md:left-15 lg:bottom-15 lg:left-15 2xl:left-55 3xl:left-39 4xl:left-120 xl:left-27",
      headerSubClass:
      "lg:-mt-14 lg:text-[7px] xl:text-[-23px]  xl:mt-8 2xl:mt-3 2xl:text-[8px] 2xl:text-bold 3xl:mt-5 3xl:text-[10px] 4xl:mt-7 4xl:text-[16px]",
    amenityListClass: "max-w-lg",
    amenityItemClass:
      "lg:text-[16px] xl:text-[15.5px] 2xl:text-[15.2px] 3xl:text-[18px] 4xl:text-[25px]",
  },
  "notan-jewel": {
    viewImg: notanJewelView,
    // matches the combined Building_Floor_SVG/Nothan_jewel/nothan_jewel-2.8x.svg
    viewBox: "0 0 4615 2597",
    floors: NOTAN_JEWEL_FLOORS,
    headerClass:
      "left-80 top-36 md:top-127 2xl:left-59 2xl:top-80 xl:left-57 xl:top-34 lg:left-53 lg:top-12 3xl:left-95 3xl:top-30 4xl:left-90 4xl:top-150",
    headerSubClass:
      "lg:-mt-14 lg:text-[7px] xl:text-[-23px]  xl:mt-8 2xl:-mt-5 2xl:text-[8px] 2xl:text-bold 3xl:mt-5 3xl:text-[10px] 4xl:-mt-7 4xl:text-[16px]",
    headerLogoClass:
      "my-[-30%] w-64 sm:w-72 md:w-100 lg:w-36  xl:w-58 2xl:w-76 4xl:w-130",
    nMarkFill: "black",
    amenityClass:
      "w-[calc(100%-2.5rem)] max-w-xl sm:max-w-2xl lg:max-w-3xl bottom-55 left-75 md:bottom-15 md:left-15 lg:bottom-56 lg:-left-25 lg:h-35 2xl:left-55 2xl:top-133 2xl:h-60 3xl:top-90 3xl:left-39 4xl:top-220 4xl:left-120  xl:-left-[3%] xl:top-[37%] ",
    amenityListClass:
      "max-w-lg lg:w-[14rem] xl:w-[23rem] 2xl:w-[20rem] 3xl:w-[32rem] 4xl:w-[33rem]",
    amenityItemClass:
      "lg:text-[8px] xl:text-[15.5px] 2xl:text-[15.2px] 3xl:text-[18px] 4xl:text-[25px]",
  },
  "notan-space": {
    viewImg: notanSpaceView,
    // matches the combined Building_Floor_SVG/Nothan_space/Notan_space_.svg
    viewBox: "0 0 1672 941",
    floors: NOTAN_SPACE_FLOORS,
    headerClass:
      "left-80 top-36 md:top-127 2xl:left-[65%] 2xl:top-44 xl:left-[62%] xl:top-40 lg:left-[65%] lg:top-24 3xl:left-318 3xl:top-60 4xl:left-[63%] 4xl:top-[28%]",
    headerLogoClass:
      "my-[-30%] w-64 sm:w-72 md:w-100 lg:w-36 xl:w-68 2xl:w-76 4xl:w-130",
    headerSubClass:
      "lg:-mt-16 lg:text-[8px] xl:mt-6 2xl:mt-1 3xl:mt-5 3xl:text-[13px] 4xl:mt-4 4xl:text-[16px]",
    asideClass:
      "left-[25%] top-[20%] md:right-12 md:w-44 2xl:top-[10%] xl:top-[10%]  lg:top-[5%] 3xl:top-[14%] 4xl:top-[10%]",
    nMarkFill: "white",
    amenityClass:
      "w-[calc(100%-2.5rem)] max-w-xl sm:max-w-2xl lg:max-w-3xl bottom-55 left-75 md:bottom-15 md:left-15 lg:bottom-45 lg:left-95 2xl:left-[51%] 2xl:top-94 3xl:top-122 3xl:left-263 4xl:top-178 4xl:left-[59%] xl:left-[43%] xl:top-74",
    amenityListClass:
      "max-w-lg lg:w-[12rem] xl:w-[19rem] 3xl:w-[28rem] 4xl:w-[33rem]",
    amenityItemClass:
      "lg:text-[9px] xl:text-[12px] 2xl:text-[15.2px] 3xl:text-[18px] 4xl:text-[25px]",
  },
  "notan-terrace": {
    viewImg: notanTerraceView,
    // matches the combined Building_Floor_SVG/Nothan_terrace/Notan_terrace_2.8x.svg
    viewBox: "0 0 4615 2597",
    floors: NOTAN_TERRACE_FLOORS,
    headerClass:
      "left-80 top-36 md:top-127 2xl:left-70 2xl:top-60 xl:left-45  xl:top-55 lg:left-37 lg:top-25 3xl:left-90 3xl:top-70 4xl:left-120 4xl:top-100 ",
    headerLogoClass:
      "my-[-30%] w-64 sm:w-72 md:w-100 lg:w-46 xl:w-68 2xl:w-76 4xl:w-130",
       headerSubClass:
      "lg:-mt-12 lg:text-[8px] xl:text-[-23px]  xl:mt-8 2xl:mt-3 2xl:text-[10px] 2xl:text-bold 3xl:mt-5 3xl:text-[10px] 4xl:mt-7 4xl:text-[16px]",
    nMarkFill: "black",
    amenityClass:
      "w-[calc(100%-2.5rem)] max-w-xl sm:max-w-2xl lg:max-w-3xl bottom-55 left-75 md:bottom-15 md:left-15 lg:bottom-15 lg:left-15 2xl:left-55 3xl:left-39 4xl:left-120 xl:left-27",
    amenityListClass: "max-w-lg",
    amenityItemClass:
      "lg:text-[16px] xl:text-[15.5px] 2xl:text-[15.2px] 3xl:text-[18px] 4xl:text-[25px]",
      asideClass:
      "left-[65%] top-[30%] xl:top-[24%] 2xl:left-[65%] 2xl:top-[30%] xl:top-[10%]  lg:top-[15%] 3xl:top-[18%] 4xl:top-[25%]",
  },
  "notan-crown": {
    viewImg: notanCrownView,
    // matches the combined Building_Floor_SVG/Nothan_crown/Notan_crown_.svg
    viewBox: "0 0 1672 941",
    floors: NOTAN_CROWN_FLOORS,
    headerClass:
      "left-80 top-36 md:top-127 2xl:left-79 2xl:top-105 xl:left-59 xl:top-90 lg:left-45 lg:top-65 3xl:left-108 3xl:top-127 4xl:left-137 4xl:top-150",
      headerSubClass:
      "lg:mt-3 lg:text-[8px] ",
    headerLogoClass: "w-34  lg:w-36 lg:h-[4.2rem] xl:w-47 xl:h-[5.25rem] 2xl:w-56 2xl:h-[6.25rem] 3xl:h-36 3xl:w-59 4xl:w-76 4xl:h-[10.5rem]",
    asideClass:
      "left-[25%] top-[20%] md:right-12 md:w-44 2xl:top-[10%] xl:top-[10%]  lg:top-[5%] 3xl:top-[14%] 4xl:top-[10%]",
    nMarkFill: "black",
    amenityClass:
      "w-[calc(100%-2.5rem)] max-w-xl sm:max-w-2xl lg:max-w-3xl bottom-55 left-75 md:bottom-15 md:left-15 lg:bottom-15 lg:left-15 2xl:left-55 3xl:left-39 4xl:left-120 xl:left-27",
    amenityListClass: "max-w-lg",
    amenityItemClass:
      "lg:text-[16px] xl:text-[15.5px] 2xl:text-[15.2px] 3xl:text-[18px] 4xl:text-[25px]",
  },
};
