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
      "my-[-30%] w-64 sm:w-72 md:w-100 lg:w-36 xl:w-44 xl:h-auto 2xl:w-60 3xl:w-80 4xl:w-90 laptop-sm:w-47",

    headerSubClass:
      "font-bold lg:-mt-17 lg:text-[6px] xl:mt-2 2xl:-mt-5 3xl:mt-3 3xl:text-[11px] 4xl:-mt-7 4xl:text-[14px] laptop-sm:-mt-11 laptop-sm:text-[8px]",
    nMarkFill: "black",

    amenityListClass:
      "max-w-lg lg:w-[24rem] xl:w-[28rem] 2xl:w-[32rem] 3xl:w-[40rem] 4xl:w-[50rem] ",
    amenityItemClass:
      "lg:text-[11px] xl:text-[14px] 2xl:text-[15px] 3xl:text-[21px] 4xl:text-[25px] 5xl:text-[30px] mac:text-[20px] mac:leading-[1.5rem] laptop-sm:text-[14px] laptop-sm:leading-[1.2rem] mac-14:text-[20px] mac-14:leading-[1.5rem] mp:text-[17px] mp:leading-[1.3rem] 5xl:text-[34px] 4xl:leading-[2.2rem] 5xl:leading-[3.2rem]",
    amenityClass:
      "laptop-sm:top-[34%] laptop-sm:right-[-12%] mac-14:-right-[5.6%] mac:-right-[1.8%] imac-24:right-[3.3%] imac-24:top-[40%] ultrawide:right-[7.8%] 5xl:top-[40%] 5xl:right-[12%] w-[calc(100%-2.5rem)] max-w-xl sm:max-w-2xl lg:max-w-3xl mp:top-[35%] mp:-right-[7%] lg:top-56 lg:-right-38 2xl:-right-17 2xl:top-[40%] 3xl:top-[38%] 3xl:right-[0.3%] 4xl:top-[40%] 4xl:right-[3.4%] xl:-right-28 xl:top-63",

    asideClass:
      "left-80 top-26 2xl:left-95 2xl:top-65 xl:left-73 xl:top-54 lg:left-53 lg:top-36 3xl:left-120 3xl:top-[35%] 4xl:left-[27%] 4xl:top-[37%] ",

    headerClass:
      "laptop-sm:top-[10%] laptop-sm:right-[8%] lg:top-[10%] lg:right-[12%] xl:top-[15%] xl:right-[8%] 2xl:right-[10%] 3xl:top-[17%] 3xl:right-[10%] 4xl:right-[9%] 4xl:top-[15%] 5xl:right-[16.6%] 5xl:top-[15%] ultrawide:right-[12%] ",
  },
  "notan-edge": {
    viewImg: notanEdgeView,
    // matches the shared viewBox baked into Building_Floor_SVG/Nothan_Edge/*.svg
    viewBox: "-9554435 -6002850 4615 2597",
    floors: NOTAN_EDGE_FLOORS,
    headerClass:
      "left-80 top-36 mp:left-[16%] md:top-127 2xl:left-74 2xl:top-40 xl:left-55  xl:top-25 lg:left-47 lg:top-4  3xl:left-102 3xl:top-70 4xl:left-137 5xl:left-[20.3%] laptop-sm:left-[14%] mac-14:left-[15%] ",
    headerLogoClass:
      "my-[-30%]  w-64 sm:w-72 md:w-100 lg:w-36 xl:w-48 2xl:w-76 4xl:w-100 5xl:w-145 ",
    nMarkFill: "black",
    amenityClass:
      "laptop-sm:top-[35%] laptop-sm:-left-[9%] w-[calc(100%-2.5rem)] max-w-xl sm:max-w-2xl lg:max-w-3xl bottom-55 left-75 md:bottom-15 md:left-15 lg:bottom-52 lg:-left-22 2xl:top-[40%] 2xl:left-17 3xl:top-130 3xl:left-45 4xl:left-100 4xl:top-150 5xl:top-[35%] 5xl:left-[18%]  xl:left-1 xl:top-68",
    headerSubClass:
      " font-bold lg:-mt-17 lg:text-[7px]  xl:-mt-1 2xl:mt-2 4xl:-mt-7 4xl:text-[16px] 5xl:mt-10 5xl:text-[20px]",
    amenityListClass:
      "max-w-lg lg:w-[26rem] xl:w-[30rem] 2xl:w-[34rem] 3xl:w-[42rem] 4xl:w-[52rem]",
    amenityItemClass:
      "lg:text-[10px] xl:text-[11.5px] 2xl:text-[13.5px] 3xl:text-[16px] 4xl:text-[23px] 4xl:leading-[1.5] 5xl:text-[37px] laptop-sm:text-[13px] mp:leading-[1.3rem] ",
  },
  "notan-jewel": {
    viewImg: notanJewelView,
    // matches the combined Building_Floor_SVG/Nothan_jewel/nothan_jewel-2.8x.svg
    viewBox: "0 0 4615 2597",
    floors: NOTAN_JEWEL_FLOORS,
    asideClass:
      "left-80 top-36 md:top-127 2xl:left-99 2xl:top-60 xl:left-57 xl:top-46 lg:left-53 lg:top-32 3xl:left-115 3xl:top-85 4xl:left-178 4xl:top-120",
    headerSubClass:
      " font-bold lg:-mt-18 lg:text-[7px]  xl:mt-2 2xl:mt-1 3xl:text-[13px] 4xl:-mt-3 4xl:text-[16px]",
    headerLogoClass:
      "my-[-30%] w-64 sm:w-72 md:w-100 lg:w-36  xl:w-58 2xl:w-76 4xl:w-110",
    headerClass:
      "right-[15%] top-[30%] mp:right-[17%] xl:top-[12%] xl:right-59 2xl:right-[17%] 2xl:top-[15%]  lg:top-[8%] lg:right-[21%] 3xl:top-[18%] 3xl:right-[19.7%] 4xl:top-[15%] 4xl:right-[17%]",
    nMarkFill: "black",
    amenityClass:
      "w-[calc(100%-2.5rem)] max-w-xl sm:max-w-2xl lg:max-w-3xl bottom-55 right-75 mp:-right-10 lg:bottom-46 lg:-right-25 lg:h-35 2xl:right-13 2xl:top-[40%] 3xl:top-110 3xl:right-35 4xl:top-140 4xl:right-65  xl:-right-[3%] xl:top-[37%] ",
    amenityListClass:
      "max-w-lg lg:w-[24rem] xl:w-[28rem] 2xl:w-[32rem] 3xl:w-[40rem] 4xl:w-[50rem]",
    amenityItemClass:
      "lg:text-[11px] xl:text-[14px] 2xl:text-[15px] 3xl:text-[18px] 4xl:text-[22px]",
  },
  "notan-space": {
    viewImg: notanSpaceView,
    // matches the combined Building_Floor_SVG/Nothan_space/Notan_space_.svg
    viewBox: "0 0 1672 941",
    floors: NOTAN_SPACE_FLOORS,
    /* On the stage: every number below is a percentage of the PHOTO, not the
       window, and cqw is one percent of the photo's width. The tower stands at
       x 40.4% → 60.9%, full height, so the text lives in the sky either side of
       it — and the narrowest crop in the test matrix (1280×1024) only shows
       x 14.8% → 85.2%, which is what sets the widths.
       Checked by: node scripts/stage-constraints.mjs notan-space --sweep */
    stage: true,
    headerClass: "left-[74%] top-[24%]",
    headerLogoClass: "w-[20cqw] mt-[-6.82cqw] mb-[-6.62cqw] mp:w-[16cqw] ",
    headerSubClass: " font-bold mt-[0.8cqw] text-[0.68cqw] tracking-[0.45em] mp:mt-[1.6cqw]",
    asideClass: "left-[26%] top-[30%] w-[11cqw]",
    nMarkFill: "black",
    amenityClass: "left-[74.6%] top-[52%]",
    amenityListClass: "w-[24cqw]",
    amenityItemClass: "text-[0.9cqw] after:mx-[0.45cqw]",
  },
  "notan-terrace": {
    viewImg: notanTerraceView,
    // matches the combined Building_Floor_SVG/Nothan_terrace/Notan_terrace_2.8x.svg
    viewBox: "0 0 4615 2597",
    floors: NOTAN_TERRACE_FLOORS,
    headerClass:
      "laptop-sm:left-[11.1%] laptop-sm:top-[13%] mac-14:left-[11.3%] mac:left-[14.5%]  md:top-127 mp:top-35 2xl:left-[17%] 2xl:top-[16%] xl:left-40 xl:top-20 lg:left-31 lg:top-8  3xl:left-90 3xl:top-45 4xl:left-115 4xl:top-60 5xl:left-[17%] 5xl:top-[20%]",
    headerLogoClass:
      "my-[-30%] w-64 sm:w-72 md:w-100 lg:w-46 xl:w-50 2xl:w-66 4xl:w-90",
    headerSubClass:
      " font-bold lg:-mt-12 lg:text-[8px]  xl:mt-1 2xl:-mt-4 4xl:-mt-12 4xl:text-[16px]",
    nMarkFill: "black",
    amenityClass:
      "laptop-sm:top-[40%] laptop-sm:-left-[7%] mac-14:-left-[1%] mac-14:top-[33%] mac:top-[35%] mac:right-[10%] w-[calc(100%-2.5rem)] max-w-xl sm:max-w-2xl lg:max-w-3xl bottom-55 left-75 mp:top-[34%] mp:-left-6 md:bottom-15 md:left-15 lg:bottom-55 lg:-left-25 2xl:left-15 2xl:top-[40%] 3xl:left-[9%] 3xl:top-110 4xl:left-90 4xl:top-140 xl:-left-7 xl:top-63 5xl:left-[15%] 5xl:top-[38%]",
    amenityListClass:
      "max-w-lg lg:w-[26rem] xl:w-[30rem] 2xl:w-[34rem] 3xl:w-[42rem] 4xl:w-[52rem]",
    amenityItemClass:
      "lg:text-[12px] lg:-tracking-[.2px] xl:text-[15px] 2xl:text-[17px] 3xl:leading-[1.7rem] 3xl:text-[20px] 4xl:text-[29px] 4xl:leading-[2rem] mac:text-[20px] mac:leading-[1.5rem] laptop-sm:text-[14px] laptop-sm:leading-[1.2rem] mac-14:text-[20px] mac-14:leading-[1.5rem] mp:text-[17px] mp:leading-[1.3rem] 5xl:text-[34px] 5xl:leading-[3.2rem]",
    asideClass:
      " top-[30%] xl:top-[20%] 2xl:right-[17%] lg:top-[15%] lg:right-[16%] 3xl:top-[30%] 3xl:right-[20%] 4xl:top-[25%]",
  },
  "notan-crown": {
    viewImg: notanCrownView,
    // matches the combined Building_Floor_SVG/Nothan_crown/Notan_crown_.svg
    viewBox: "0 0 460.8 259.2",
    floors: NOTAN_CROWN_FLOORS,
    headerClass:
      "left-80 top-36 md:top-127 2xl:left-27 2xl:top-45 xl:left-14 xl:top-36 lg:left-12 lg:top-35 3xl:left-44 3xl:top-57 4xl:left-70 4xl:top-90",
    headerSubClass:
      " font-bold lg:-mt-1 lg:text-[8px] xl:mt-1 3xl:mt-2 3xl:text-[13px] 4xl:mt-4 4xl:text-[16px]",
    headerLogoClass:
      "w-34  lg:w-36 lg:h-[4.2rem] xl:w-44 xl:h-[5.25rem] 2xl:w-56 2xl:h-[6.25rem] 3xl:h-28 3xl:w-59 4xl:w-76 4xl:h-[9rem]",
    asideClass:
      "right-[15%] top-[20%] 2xl:right-33 xl:top-[25%] xl:right-25 lg:top-[19%] lg:right-16 3xl:top-[24%] 3xl:right-[10%] 4xl:top-[35%]",
    nMarkFill: "black",
    amenityClass:
      "w-[calc(100%-2.5rem)] max-w-xl sm:max-w-2xl lg:max-w-3xl bottom-55 left-75 md:bottom-15 md:left-15 2xl:left-55 3xl:left-39 4xl:left-120 xl:left-27",
    amenityListClass: "max-w-lg lg:w-[24rem] xl:w-[28rem] 2xl:w-[32rem] 3xl:w-[40rem] 4xl:w-[50rem]",
    amenityItemClass:
      "lg:text-[12px] xl:text-[14px] 2xl:text-[15px] 3xl:text-[18px] 4xl:text-[24px]",
  },

  "notan-lands-end": {
    viewImg: notanLandsEndView,
    // matches the viewBox baked into Building_Floor_SVG/Notan_Lands-End/Notan_Lands-End_building_Cutout.svg
    viewBox: "0 0 10000 5886",
    floors: NOTAN_LANDS_END_FLOORS,
    headerClass:
      "top-36 mp:left-[12%]  2xl:left-[13%] xl:left-[15%] xl:top-30 lg:left-42 lg:top-5 3xl:left-[18%] 3xl:top-34 4xl:top-43 4xl:left-[17%]",
    asideClass:
      "right-[15%] top-[30%] xl:top-[25%] xl:right-60 2xl:right-[19%] lg:top-[23%] lg:right-[15.5%] 3xl:top-[23%] 3xl:right-[22%]",
    headerSubClass:
      " font-bold lg:-mt-20 lg:text-[7px] xl:-mt-4 3xl:-mt-3 4xl:-mt-14 4xl:text-[16px]",
    headerLogoClass:
      "my-[-30%] w-64 sm:w-72 md:w-100 lg:w-36 xl:w-48 2xl:w-76 4xl:w-100",
    nMarkFill: "black",
    amenityClass:
      "w-[calc(100%-2.5rem)] max-w-xl sm:max-w-2xl lg:max-w-3xl bottom-55 right-85 lg:bottom-56 lg:-left-[10%] lg:h-35 2xl:left-6 2xl:top-[42%] 3xl:top-110 3xl:left-27 4xl:top-150 4xl:left-70 xl:-left-[3%] xl:top-[40%]",
    amenityListClass:
      "max-w-lg lg:w-[26rem] xl:w-[30rem] 2xl:w-[34rem] 3xl:w-[42rem] 4xl:w-[54rem]",
    amenityItemClass:
      "lg:text-[10px] xl:text-[12px] 2xl:text-[14px] 3xl:text-[17px] 4xl:text-[23px]",
  },
  "notan-views": {
    viewImg: notanViewsView,
    // matches the combined Building_Floor_SVG/Notan_Views/*.svg
    viewBox: "0 0 4615 2597",
    floors: NOTAN_VIEWS_FLOORS,
    asideClass:
      "left-80 top-36 md:top-127 2xl:left-94 2xl:top-67 xl:left-87 xl:top-64 lg:left-63 lg:top-28 3xl:left-135 3xl:top-90 4xl:left-188 4xl:top-130",
    headerClass:
      "right-[15%] top-[30%] mp:right-[17%] xl:top-[12%] xl:right-60 2xl:right-[16%] 2xl:top-[15%] lg:top-[3%] lg:right-[15.5%] 3xl:top-[18%] 3xl:right-[19.7%] 4xl:top-[15%] 4xl:right-[17%]",
    headerSubClass:
      " font-bold lg:-mt-18 lg:text-[8px] xl:mt-4 2xl:mt-1 3xl:mt-2 3xl:text-[13px] 4xl:mt-4 4xl:text-[16px]",
    headerLogoClass:
      "my-[-30%] w-64 sm:w-72 md:w-100 lg:w-36 xl:w-58 2xl:w-76 4xl:w-130",
    nMarkFill: "black",
    amenityClass:
      "w-[calc(100%-2.5rem)] max-w-xl sm:max-w-2xl lg:max-w-3xl bottom-55 right-85 mp:-right-12 lg:bottom-56 lg:-right-35 lg:h-35 2xl:right-7 3xl:top-110 3xl:right-35 4xl:top-130 4xl:right-70 xl:-right-[3%] xl:top-[37%] 5xl:right-123 5xl:top-180",
    amenityListClass:
      "max-w-lg lg:w-[26rem] xl:w-[30rem] 2xl:w-[34rem] 3xl:w-[42rem] 4xl:w-[54rem]",
    amenityItemClass:
      "lg:text-[9.5px] xl:text-[11.5px] 2xl:text-[13px] 3xl:text-[15.5px] 4xl:text-[22px]",
  },

  "notan-beach-house": {
    viewImg: notanBeachHouseView,
    // matches Building_Floor_SVG/Notan_Beach-House/NOTAN-BEACH-HOUSE-BUILDINGSVG.svg,
    // and the render's own 8000×3636 — the cut-out bands land on the tower as drawn
    viewBox: "0 0 8000 3636",
    floors: NOTAN_BEACH_HOUSE_FLOORS,
    // The tower sits left of centre (34–58% of the frame) with open sea and sky
    // to its right, so the mark and the floor readout both live over the water.
    // Starting placement — dial in against the live page like the others.
    headerClass:
      "right-[8%] mac:right-[10.5%] top-[10%] lg:right-[11%] lg:top-[2%] xl:right-[11%] xl:top-[10%] 2xl:right-[12%] 2xl:top-[11%] 3xl:right-[12%] 3xl:top-[15%] 4xl:right-[13%] 4xl:top-[13%] 5xl:right-[14%] 5xl:top-[12%]",
    headerLogoClass:
      "my-[-30%] w-64 sm:w-72 md:w-100 lg:w-22 xl:w-28 2xl:w-35 3xl:w-40  4xl:w-55 mp:w-35 mac:w-45 ",
    headerSubClass:
      " font-bold lg:-mt-22 lg:text-[8px] xl:-mt-7 2xl:-mt-15 3xl:-mt-12 3xl:text-[12px] 4xl:-mt-24 4xl:text-[16px] mp:-mt-3 mp:text-[12px] mac:-mt-10 mac:text-[14px]",
    asideClass:
      "left-[9%] top-[15%] lg:left-[13%] xl:top-[20%] 2xl:left-[15%] 2xl:top-[21%] 3xl:top-[25%] 4xl:left-[16%] 4xl:top-[24%]",
    nMarkFill: "black",
    amenityClass:
      "w-[calc(100%-2.5rem)] max-w-xl sm:max-w-2xl lg:max-w-3xl bottom-55 right-85 mp:-right-40 lg:bottom-54 lg:-right-54 lg:h-35 2xl:-right-32 2xl:top-[40%] 3xl:top-115 3xl:-right-22 4xl:top-150 4xl:right-13 xl:-right-[14%] xl:top-[38%] 5xl:right-[6%] 5xl:top-[35%]",
    amenityListClass:
      "max-w-lg lg:w-[26rem] xl:w-[30rem] 2xl:w-[34rem] 3xl:w-[44rem] 4xl:w-[54rem]",
    amenityItemClass:
      "lg:text-[9.5px] xl:text-[12.5px] 2xl:text-[13.5px] 3xl:text-[17px] 4xl:text-[21px]",
  },

  "notan-tides": {
    viewImg: notanTidesView,
    // matches Building_Floor_SVG/Notan_Tides/notan-Tides_BuildingSvg.svg, and
    // the render's own 4627×2603 — the bands land on the tower as drawn
    viewBox: "0 0 4627 2603",
    floors: NOTAN_TIDES_FLOORS,
    // The tower stands centre-right (35–66% of the frame) against open sky to
    // its left, so the mark and the floor readout both sit over that sky.
    // Starting placement — dial in against the live page like the others.
    headerClass:
      " top-36 mp:top-16 mp:left-[9%] 2xl:-left-[54%] xl:left-[12.3%] xl:top-14 lg:left-38 lg:-top-2 2xl:left-[9%] 2xl:top-[12%] 3xl:left-[13%] 3xl:top-[11%] 4xl:left-[13%] 4xl:top-25",
    asideClass:
      "right-[15%] top-[30%] xl:top-[18%] xl:right-44 2xl:right-[15%] 2xl:top-[20%] lg:top-[13%] lg:right-[15.5%] 3xl:top-[23%] 3xl:right-[18%] 4xl:top-[20%] 4xl:right-[19%]",
    headerSubClass:
      " font-bold lg:-mt-20 lg:text-[7px] xl:-mt-4 3xl:-mt-3 4xl:-mt-14 4xl:text-[16px]",
    headerLogoClass:
      "my-[-30%] w-64 sm:w-72 md:w-100 lg:w-36 xl:w-48 2xl:w-76 4xl:w-100",
    nMarkFill: "black",
    amenityClass:
      "w-[calc(100%-2.5rem)] max-w-xl sm:max-w-2xl lg:max-w-3xl bottom-55  lg:bottom-63 lg:-left-[15.6%]  2xl:-left-17 2xl:top-[37%] 3xl:top-85 3xl:left-4 4xl:top-100 4xl:left-37 xl:-left-[10%] xl:top-[28%]",
    amenityListClass:
      "max-w-lg lg:w-[26rem] xl:w-[30rem] 2xl:w-[34rem] 3xl:w-[42rem] 4xl:w-[54rem]",
    amenityItemClass:
      "lg:text-[9.5px] xl:text-[12px] 2xl:text-[12.5px] 3xl:text-[17px] 4xl:text-[24px]",
  },
};
