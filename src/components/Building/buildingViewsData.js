import notanDcView from "../../assets/ViewsBuildings/Notan-DC.webp";
import notanEdgeView from "../../assets/ViewsBuildings/Notan_EDGE.webp";
import notanJewelView from "../../assets/ViewsBuildings/Notan_jewel_sketch.webp";
import notanSpaceView from "../../assets/ViewsBuildings/Notan_space_sketch.webp";
import notanTerraceView from "../../assets/ViewsBuildings/Notan_terrace_sketch.webp";
import notanCrownView from "../../assets/ViewsBuildings/Notan_crown_sketch.webp";
import notanViewsView from "../../assets/ViewsBuildings/notan_Views.webp";
import {
  NOTAN_DC_FLOORS,
  NOTAN_EDGE_FLOORS,
  NOTAN_JEWEL_FLOORS,
  NOTAN_SPACE_FLOORS,
  NOTAN_TERRACE_FLOORS,
  NOTAN_CROWN_FLOORS,
  NOTAN_VIEWS_FLOORS,
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
    headerLogoClass:
    "my-[-30%] w-64 sm:w-72 md:w-100 lg:w-36 xl:w-44 xl:h-auto 2xl:w-60 2xl:h-13 3xl:w-80 4xl:w-90",

    headerSubClass:
      "font-bold lg:-mt-17 lg:text-[6px] xl:text-[2px] xl:mt-2 2xl:-mt-5 2xl:text-[10px] 3xl:mt-3 3xl:text-[11px] 4xl:-mt-7 4xl:text-[14px]",
    nMarkFill: "black",
 
    amenityListClass:
      "max-w-lg xl:w-[27rem] lg:w-[15rem] 2xl:w-[20rem] 3xl:w-[26rem] 4xl:w-[33rem]",
    amenityItemClass:
      "lg:text-[10px] xl:text-[15px] 2xl:text-[15.2px] 3xl:text-[18px] 4xl:text-[25px]",
   amenityClass:
      "w-[calc(100%-2.5rem)] max-w-xl sm:max-w-2xl lg:max-w-3xl lg:top-60 lg:-right-40 2xl:-right-17 2xl:top-95 3xl:top-110 3xl:right-10 4xl:top-155 4xl:right-43 xl:-right-28 xl:top-73",

      asideClass:
      "left-80 top-26 2xl:left-95 2xl:top-65 xl:left-73 xl:top-54 lg:left-53 lg:top-36 3xl:left-120 3xl:top-[35%] 4xl:left-[27%] 4xl:top-[37%] ",

    headerClass: "lg:top-[10%] lg:right-[12%] xl:top-[15%] xl:right-[8%] 2xl:right-[10%] 3xl:top-[17%] 3xl:right-[13%] 4xl:top-[15%] 4xl:right-[13%]",

  },
  "notan-edge": {
    viewImg: notanEdgeView,
    // matches the shared viewBox baked into Building_Floor_SVG/Nothan_Edge/*.svg
    viewBox: "-9554435 -6002850 4615 2597",
    floors: NOTAN_EDGE_FLOORS,
    headerClass:
      "left-80 top-36 md:top-127 2xl:left-74 2xl:top-40 xl:left-65  xl:top-35 lg:left-52 lg:top-15  3xl:left-102 3xl:top-70 4xl:left-137 4xl:top-70",
    headerLogoClass:
       "my-[-30%] w-64 sm:w-72 md:w-100 lg:w-36 xl:w-48 2xl:w-76 4xl:w-100",
    nMarkFill: "black",
    amenityClass:
      "w-[calc(100%-2.5rem)] max-w-xl sm:max-w-2xl lg:max-w-3xl bottom-55 left-75 md:bottom-15 md:left-15 lg:bottom-35 lg:-left-17 2xl:top-90 2xl:left-17 3xl:top-130 3xl:left-45 4xl:left-100 4xl:top-150 xl:left-5 xl:top-80",
      headerSubClass:
      "lg:-mt-17 lg:text-[7px] xl:text-[-23px]  xl:-mt-1 2xl:mt-2 2xl:text-[10px] 2xl:text-bold 3xl:mt-2 3xl:text-[10px] 4xl:-mt-7 4xl:text-[16px]",
    amenityListClass: "max-w-lg lg:max-w-[21rem] 2xl:max-w-[32rem] 3xl:max-w-[32rem] 4xl:max-w-[43rem]",
    amenityItemClass:
      "lg:text-[9px] xl:text-[10px] 2xl:text-[14px] 3xl:text-[15px] 4xl:text-[24px]",
  },
  "notan-jewel": {
    viewImg: notanJewelView,
    // matches the combined Building_Floor_SVG/Nothan_jewel/nothan_jewel-2.8x.svg
    viewBox: "0 0 4615 2597",
    floors: NOTAN_JEWEL_FLOORS,
    asideClass:
      "left-80 top-36 md:top-127 2xl:left-99 2xl:top-60 xl:left-57 xl:top-46 lg:left-53 lg:top-32 3xl:left-115 3xl:top-85 4xl:left-178 4xl:top-120",
    headerSubClass:
      "lg:-mt-18 lg:text-[7px] xl:text-[-23px]  xl:mt-2 2xl:mt-1 2xl:text-[10px] 2xl:text-bold 3xl:mt-1 3xl:text-[13px] 4xl:-mt-3 4xl:text-[16px]",
    headerLogoClass:
      "my-[-30%] w-64 sm:w-72 md:w-100 lg:w-36  xl:w-58 2xl:w-76 4xl:w-110",
      headerClass:
      "right-[15%] top-[30%] xl:top-[12%] xl:right-59 2xl:right-[19%] 2xl:top-[15%]  lg:top-[8%] lg:right-[21%] 3xl:top-[18%] 3xl:right-[19.7%] 4xl:top-[15%] 4xl:right-[17%]",
    nMarkFill: "black",
    amenityClass:
      "w-[calc(100%-2.5rem)] max-w-xl sm:max-w-2xl lg:max-w-3xl bottom-55 right-75  lg:bottom-46 lg:-right-25 lg:h-35 2xl:right-13 2xl:top-[40%] 3xl:top-110 3xl:right-35 4xl:top-140 4xl:right-65  xl:-right-[3%] xl:top-[37%] ",
    amenityListClass:
      "max-w-lg lg:w-[17rem] xl:w-[23rem] 2xl:w-[26rem] 3xl:w-[32rem] 4xl:w-[53rem]",
    amenityItemClass:
      "lg:text-[11px] xl:text-[15.5px] 2xl:text-[15.2px] 3xl:text-[18px] 4xl:text-[22px]",
  },
  "notan-space": {
    viewImg: notanSpaceView,
    // matches the combined Building_Floor_SVG/Nothan_space/Notan_space_.svg
    viewBox: "0 0 1672 941",
    floors: NOTAN_SPACE_FLOORS,
    headerClass:
      "left-80 top-36 md:top-127 2xl:left-[65.6%] 2xl:top-44 xl:left-[62.5%] xl:top-40 lg:left-[65.8%] lg:top-24 3xl:left-316 3xl:top-60 4xl:left-[63.6%] 4xl:top-[28%]",
    headerLogoClass:
      "my-[-30%] w-64 sm:w-72 md:w-100 lg:w-36 xl:w-68 2xl:w-76 4xl:w-130",
    headerSubClass:
      "lg:-mt-18 lg:text-[8px] xl:mt-4 2xl:-mt-1 3xl:-mt-1 3xl:text-[13px] 4xl:mt-4 4xl:text-[16px]",
    asideClass:
      "left-[25%] top-[20%] md:right-12 md:w-44 2xl:top-[19%] xl:top-[18%]  lg:top-[23%] 3xl:top-[24%] 4xl:top-[25%]",
    nMarkFill: "black",
    amenityClass:
      "w-[calc(100%-2.5rem)] max-w-xl sm:max-w-2xl lg:max-w-3xl md:bottom-15 md:right-15 lg:bottom-48 lg:-right-33 2xl:-right-[1%] 2xl:top-94 3xl:top-122 3xl:right-26 4xl:top-170 4xl:right-[11%] xl:-right-[3%] xl:top-74",
    amenityListClass:
      "max-w-lg lg:w-[16rem] xl:w-[19rem] 3xl:w-[28rem] 4xl:w-[33rem]",
    amenityItemClass:
      "lg:text-[10px] xl:text-[12px] 2xl:text-[15.2px] 3xl:text-[18px] 4xl:text-[25px]",
  },
  "notan-terrace": {
    viewImg: notanTerraceView,
    // matches the combined Building_Floor_SVG/Nothan_terrace/Notan_terrace_2.8x.svg
    viewBox: "0 0 4615 2597",
    floors: NOTAN_TERRACE_FLOORS,
    headerClass:
      "left-80 top-36 md:top-127 2xl:left-70 2xl:top-20 xl:left-45 xl:top-20 lg:left-37 lg:top-8 3xl:left-90 3xl:top-45 4xl:left-115 4xl:top-60 ",
    headerLogoClass:
      "my-[-30%] w-64 sm:w-72 md:w-100 lg:w-46 xl:w-50 2xl:w-66 4xl:w-90",
       headerSubClass:
      "font-bold lg:-mt-12 lg:text-[8px] xl:text-[1rem]  xl:mt-1 2xl:-mt-4 2xl:text-[10px] 2xl:text-bold 3xl:-mt-4 3xl:text-[10px] 4xl:-mt-12 4xl:text-[16px]",
    nMarkFill: "black",
    amenityClass:
      "w-[calc(100%-2.5rem)] max-w-xl sm:max-w-2xl lg:max-w-3xl bottom-55 left-75 md:bottom-15 md:left-15 lg:bottom-55 lg:-left-22 2xl:left-20 2xl:top-[35%] 3xl:left-39 3xl:top-110 4xl:left-90 4xl:top-140 xl:-left-5 xl:top-63",
    amenityListClass: "max-w-lg lg:max-w-[18rem] xl:max-w-[23rem] 3xl:max-w-[32rem] 4xl:max-w-[53rem]",
    amenityItemClass:
      "lg:text-[9px] xl:text-[12px] 2xl:text-[14px] 3xl:text-[15px] 4xl:text-[23px]",
      asideClass:
      " top-[30%] xl:top-[20%] xl:right-[16%] 2xl:right-[17%] 2xl:top-[20%] xl:top-[10%] lg:top-[15%] lg:right-[16%] 3xl:top-[30%] 3xl:right-[20%] 4xl:top-[25%]",
  },
  "notan-crown": {
    viewImg: notanCrownView,
    // matches the combined Building_Floor_SVG/Nothan_crown/Notan_crown_.svg
    viewBox: "0 0 460.8 259.2",
    floors: NOTAN_CROWN_FLOORS,
    headerClass:
      "left-80 top-36 md:top-127 2xl:left-27 2xl:top-45 xl:left-14 xl:top-36 lg:left-12 lg:top-35 3xl:left-44 3xl:top-57 4xl:left-70 4xl:top-90",
      headerSubClass:
      "lg:-mt-1 lg:text-[8px] xl:mt-1 2xl:mt-1 3xl:mt-2 3xl:text-[13px] 4xl:mt-4 4xl:text-[16px]",
    headerLogoClass: "w-34  lg:w-36 lg:h-[4.2rem] xl:w-44 xl:h-[5.25rem] 2xl:w-56 2xl:h-[6.25rem] 3xl:h-28 3xl:w-59 4xl:w-76 4xl:h-[9rem]",
    asideClass:
      "right-[15%] top-[20%] 2xl:top-[25%] 2xl:right-33 xl:top-[25%] xl:right-25 lg:top-[19%] lg:right-16 3xl:top-[24%] 3xl:right-[10%] 4xl:top-[35%]",
    nMarkFill: "black",
    amenityClass:
      "w-[calc(100%-2.5rem)] max-w-xl sm:max-w-2xl lg:max-w-3xl bottom-55 left-75 md:bottom-15 md:left-15 lg:bottom-15 lg:left-15 2xl:left-55 3xl:left-39 4xl:left-120 xl:left-27",
    amenityListClass: "max-w-lg",
    amenityItemClass:
      "lg:text-[16px] xl:text-[15.5px] 2xl:text-[15.2px] 3xl:text-[18px] 4xl:text-[25px]",
  },
  "notan-views": {
    viewImg: notanViewsView,
    // matches the combined Building_Floor_SVG/Notan_Views/*.svg
    viewBox: "0 0 4615 2597",
    floors: NOTAN_VIEWS_FLOORS,
    headerClass:
      "left-80 top-36 md:top-127 2xl:left-59 2xl:top-80 xl:left-57 xl:top-64 lg:left-53 lg:top-32 3xl:left-95 3xl:top-90 4xl:left-98 4xl:top-130",
      headerSubClass:
      "lg:-mt-18 lg:text-[8px] xl:mt-4 2xl:mt-1 3xl:mt-2 3xl:text-[13px] 4xl:mt-4 4xl:text-[16px]",
    headerLogoClass:
      "my-[-30%] w-64 sm:w-72 md:w-100 lg:w-36  xl:w-58 2xl:w-76 4xl:w-130",
    nMarkFill: "black",
    amenityClass:
      "w-[calc(100%-2.5rem)] max-w-xl sm:max-w-2xl lg:max-w-3xl bottom-55 right-75  lg:bottom-46 lg:-right-25 lg:h-35 2xl:right-13 2xl:top-[40%] 3xl:top-110 3xl:right-35 4xl:top-130 4xl:right-70  xl:-right-[3%] xl:top-[37%] ",
    amenityListClass:
      "max-w-lg lg:w-[17rem] xl:w-[23rem] 2xl:w-[26rem] 3xl:w-[32rem] 4xl:w-[53rem]",
    amenityItemClass:
      "lg:text-[11px] xl:text-[15.5px] 2xl:text-[15.2px] 3xl:text-[18px] 4xl:text-[29px]",
  },
};
