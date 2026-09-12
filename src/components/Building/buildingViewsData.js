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
      "w-[245.6px] sm:w-[276.3px] md:w-[383.8px] lg:w-[287.9px]",
    headerLogoTrim: "mt-[-31.17%] mb-[-31.58%]",

    headerSubClass: "font-bold lg:text-[12px]",
    nMarkFill: "black",

    amenityListClass:
      "max-w-lg lg:w-[40rem]",
    amenityItemClass: "lg:text-[17px]",
    amenityClass:
      "w-[calc(100%-2.5rem)] max-w-xl sm:max-w-2xl lg:max-w-3xl lg:top-[42%] lg:right-[0.3%]",

    /* The floor readout, anchored on its CENTRE as a share of the picture —
       %, not px, and centre, not corner, so the same one spot serves a
       1920-wide picture layer and an 820-wide portrait canvas. Measured off
       the live page: node scripts/measure-page.mjs */
    asideClass:
      "left-80 top-26 lg:left-[28.75%] lg:top-[35.00%] lg:right-auto lg:bottom-auto lg:-translate-x-1/2 portrait:left-[28.75%]! portrait:top-[35.00%]! portrait:right-auto! portrait:bottom-auto! portrait:-translate-x-1/2!",

    headerClass:
      "lg:top-[17%] lg:right-[10%]",
  },
  "notan-edge": {
    viewImg: notanEdgeView,
    // matches the shared viewBox baked into Building_Floor_SVG/Nothan_Edge/*.svg
    viewBox: "-9554435 -6002850 4615 2597",
    floors: NOTAN_EDGE_FLOORS,
    headerClass:
      "left-80 top-36 md:top-127 lg:left-[20%] lg:top-58",
    headerLogoClass:
      "w-[253.3px] sm:w-[285px] md:w-[395.8px] lg:w-[296.9px]",
    headerLogoTrim: "mt-[-31.83%] mb-[-32%]",
    /* the wordmark sits 0.67% left of its artboard's centre, so the mark's INK — not its box — is what lines up with
       the amenities below it. Measured: node scripts/measure-page.mjs notan-edge */
    headerLogoNudge: "translate-x-[0.67%]",
    /* The floor readout, anchored on its CENTRE as a share of the picture —
       %, not px, and centre, not corner, so the same one spot serves a
       1920-wide picture layer and an 820-wide portrait canvas. Measured off
       the live page: node scripts/measure-page.mjs. Edge had no placement of
       its own at all and was falling through to the component's default. */
    asideClass:
      "left-[65%] top-1/2 lg:left-[69.58%] lg:top-[40.37%] lg:right-auto lg:bottom-auto lg:translate-y-0 lg:-translate-x-1/2 portrait:left-[69.58%]! portrait:top-[40.37%]! portrait:right-auto! portrait:bottom-auto! portrait:translate-y-0! portrait:-translate-x-1/2!",
    nMarkFill: "black",
    amenityClass:
      "w-[calc(100%-2.5rem)] max-w-xl sm:max-w-2xl lg:max-w-3xl bottom-55 left-75 md:bottom-15 md:left-15 lg:bottom-52 lg:top-130 lg:left-45",
    headerSubClass: "font-bold lg:text-[12px]",
    amenityListClass:
      "max-w-lg lg:w-[42rem]",
    amenityItemClass: "lg:text-[17px]", 
  },
  "notan-jewel": {
    viewImg: notanJewelView,
    // matches the combined Building_Floor_SVG/Nothan_jewel/nothan_jewel-2.8x.svg
    viewBox: "0 0 4615 2597",
    floors: NOTAN_JEWEL_FLOORS,
    /* The floor readout, anchored on its CENTRE as a share of the picture —
       %, not px, and centre, not corner, so the same one spot serves a
       1920-wide picture layer and an 820-wide portrait canvas. Measured off
       the live page: node scripts/measure-page.mjs */
    /* The floor readout, anchored on its CENTRE as a share of the picture —
       %, not px, and centre, not corner, so the same one spot serves a
       1920-wide picture layer and an 820-wide portrait canvas. Measured off
       the live page: node scripts/measure-page.mjs */
    asideClass:
      "left-80 top-36 md:top-127 lg:left-[27.71%] lg:top-[31.48%] lg:right-auto lg:bottom-auto lg:-translate-x-1/2 portrait:left-[27.71%]! portrait:top-[31.48%]! portrait:right-auto! portrait:bottom-auto! portrait:-translate-x-1/2!",
    headerSubClass: "font-bold lg:text-[12px]",
    headerLogoClass:
      "w-[265.5px] sm:w-[298.7px] md:w-[414.9px] lg:w-[311.2px]",
    headerLogoTrim: "mt-[-32.67%] mb-[-32.83%]",
    headerClass:
      "] lg:top-[20%] lg:right-[14.7%]",
    nMarkFill: "black",
    amenityClass:
      "w-[calc(100%-2.5rem)] max-w-xl sm:max-w-2xl lg:max-w-3xl bottom-55 right-75 lg:bottom-46 lg:h-35 lg:top-[47%] lg:right-[2%]",
    amenityListClass:
      "max-w-lg lg:w-[40rem]",
    amenityItemClass: "lg:text-[17px]",
  },
  "notan-space": {
    viewImg: notanSpaceView,
    // matches the combined Building_Floor_SVG/Nothan_space/Notan_space_.svg
    viewBox: "0 0 1672 941",
    floors: NOTAN_SPACE_FLOORS,
    /* The tower stands at x 40.4% → 60.9% of the photo, full height, so the
       text lives in the sky either side of it. This was the one project laid
       out on ImageStage — a second coordinate system, in container units,
       measured against a box of its own. The picture layer is that same
       1920×1080 now (see components/DesignStage.jsx), so the percentages carry
       over untouched; what they needed was the centre anchoring the stage used
       to apply for them, and widths in px, since container units have no
       container once the stage is gone. */
    headerClass: "left-[74%] top-[24%]",
    headerLogoClass: "w-[289.9px] sm:w-[326.2px] md:w-[453px] lg:w-[339.8px]",
    headerLogoTrim: "mt-[-34.08%] mb-[-34.33%]",
    headerSubClass: "font-bold tracking-[0.45em] lg:text-[12px]",
    /* The floor readout, anchored on its CENTRE as a share of the picture —
       %, not px, and centre, not corner, so the same one spot serves a
       1920-wide picture layer and an 820-wide portrait canvas. Measured off
       the live page: node scripts/measure-page.mjs */
    asideClass:
      "left-[26%] top-[30%] w-[211.2px] -translate-x-1/2 -translate-y-1/2 lg:translate-y-0 portrait:translate-y-0! lg:left-[26.00%] lg:top-[21.76%] lg:right-auto lg:bottom-auto lg:-translate-x-1/2 portrait:left-[26.00%]! portrait:top-[21.76%]! portrait:right-auto! portrait:bottom-auto! portrait:-translate-x-1/2!",
    nMarkFill: "black",
    amenityClass: "left-[74.6%] top-[49%] -translate-x-1/2 -translate-y-1/2",
    amenityListClass: "w-[460.8px]",
    amenityItemClass: "lg:text-[17px]",
  },
  "notan-terrace": {
    viewImg: notanTerraceView,
    // matches the combined Building_Floor_SVG/Nothan_terrace/Notan_terrace_2.8x.svg
    viewBox: "0 0 4615 2597",
    floors: NOTAN_TERRACE_FLOORS,
    headerClass:
      "md:top-127 lg:left-85 lg:top-45",
    headerLogoClass:
      "w-[256px] sm:w-[288px] md:w-[400px] lg:w-[300px]",
    headerLogoTrim: "mt-[-31.67%] mb-[-32%]",
    headerSubClass: "font-bold lg:text-[12px]",
    nMarkFill: "black",
    amenityClass:
      "lg:right-[10%] w-[calc(100%-2.5rem)] max-w-xl sm:max-w-2xl lg:max-w-3xl bottom-55 left-75 md:bottom-15 md:left-15 lg:bottom-55 lg:left-[9%] lg:top-[40%]",
    amenityListClass:
      "max-w-lg lg:w-[42rem]",
    amenityItemClass: "lg:text-[17px]",
    /* The floor readout, anchored on its CENTRE as a share of the picture —
       %, not px, and centre, not corner, so the same one spot serves a
       1920-wide picture layer and an 820-wide portrait canvas. Measured off
       the live page: node scripts/measure-page.mjs */
    asideClass:
      "top-[30%] lg:left-[76.25%] lg:top-[30.00%] lg:right-auto lg:bottom-auto lg:-translate-x-1/2 portrait:left-[76.25%]! portrait:top-[30.00%]! portrait:right-auto! portrait:bottom-auto! portrait:-translate-x-1/2!",
  },
  "notan-crown": {
    viewImg: notanCrownView,
    // matches the combined Building_Floor_SVG/Nothan_crown/Notan_crown_.svg
    viewBox: "0 0 460.8 259.2",
    floors: NOTAN_CROWN_FLOORS,
    headerClass:
      "left-80 top-36 md:top-127 lg:top-[106px] lg:left-[386px] lg:-translate-x-1/2",
    headerSubClass: "font-bold lg:text-[12px]",
    headerLogoClass:
      "w-[203.4px] sm:w-[228.9px] md:w-[317.9px] lg:w-[238.4px]",
    headerLogoTrim: "mt-[-0%] mb-[-0%]",
    /* The floor readout, anchored on its CENTRE as a share of the picture —
       %, not px, and centre, not corner, so the same one spot serves a
       1920-wide picture layer and an 820-wide portrait canvas. Measured off
       the live page: node scripts/measure-page.mjs */
    asideClass:
      "right-[15%] top-[20%] lg:left-[86.25%] lg:top-[24.00%] lg:right-auto lg:bottom-auto lg:-translate-x-1/2 portrait:left-[86.25%]! portrait:top-[24.00%]! portrait:right-auto! portrait:bottom-auto! portrait:-translate-x-1/2!",
    nMarkFill: "black",
    amenityClass:
      "w-[calc(100%-2.5rem)] max-w-xl sm:max-w-2xl lg:max-w-3xl bottom-55 left-75 md:bottom-15 md:left-15 lg:top-[357px] lg:bottom-auto lg:left-[386px] lg:-translate-x-1/2",
    amenityListClass: "max-w-lg lg:w-[40rem]",
    amenityItemClass: "lg:text-[17px]",
  },

  "notan-lands-end": {
    viewImg: notanLandsEndView,
    // matches the viewBox baked into Building_Floor_SVG/Notan_Lands-End/Notan_Lands-End_building_Cutout.svg
    viewBox: "0 0 10000 5886",
    floors: NOTAN_LANDS_END_FLOORS,
    headerClass:
      "top-36 lg:left-[16%] lg:top-34",
    /* The floor readout, anchored on its CENTRE as a share of the picture —
       %, not px, and centre, not corner, so the same one spot serves a
       1920-wide picture layer and an 820-wide portrait canvas. Measured off
       the live page: node scripts/measure-page.mjs */
    asideClass:
      "right-[15%] top-[30%] lg:left-[74.25%] lg:top-[23.00%] lg:right-auto lg:bottom-auto lg:-translate-x-1/2 portrait:left-[74.25%]! portrait:top-[23.00%]! portrait:right-auto! portrait:bottom-auto! portrait:-translate-x-1/2!",
    headerSubClass:"font-bold lg:text-[12px]",
    headerLogoClass:
       "w-[304.5px] sm:w-[342.6px] md:w-[475.8px] lg:w-[356.8px]",
    headerLogoTrim: "mt-[-5.58%] mb-[-8.75%]",
    /* 10.8% of padding on the left against 4% on the right, so the mark's INK — not its box — is what lines up with
       the amenities below it. Measured: node scripts/measure-page.mjs notan-lands-end */
    headerLogoNudge: "translate-x-[-3.42%]",
    nMarkFill: "black",
    amenityClass:
      "w-[calc(100%-2.5rem)] max-w-xl sm:max-w-2xl lg:max-w-3xl bottom-55 right-85 lg:bottom-56 lg:h-35 lg:top-[38%] lg:left-26",
    amenityListClass:
      "max-w-lg lg:w-[52rem]",
    amenityItemClass: "lg:text-[17px]",
  },
  "notan-views": {
    viewImg: notanViewsView,
    // matches the combined Building_Floor_SVG/Notan_Views/*.svg
    viewBox: "0 0 4615 2597",
    floors: NOTAN_VIEWS_FLOORS,
    /* The floor readout, anchored on its CENTRE as a share of the picture —
       %, not px, and centre, not corner, so the same one spot serves a
       1920-wide picture layer and an 820-wide portrait canvas. Measured off
       the live page: node scripts/measure-page.mjs */
    asideClass:
      "left-80 top-36 md:top-127 lg:left-[31.87%] lg:top-[33.33%] lg:right-auto lg:bottom-auto lg:-translate-x-1/2 portrait:left-[31.87%]! portrait:top-[33.33%]! portrait:right-auto! portrait:bottom-auto! portrait:-translate-x-1/2!",
    headerClass:
      "right-[15%] top-[30%] lg:top-[14%] lg:right-[12%]",
    headerSubClass: "font-bold lg:text-[12px]",
    headerLogoClass:
      "w-[262.9px] sm:w-[295.8px] md:w-[410.8px] lg:w-[308.1px]",
    headerLogoTrim: "mt-[-35%] mb-[-30.17%]",
    nMarkFill: "black",
    amenityClass:
      "w-[calc(100%-2.5rem)] max-w-xl sm:max-w-2xl lg:max-w-3xl bottom-55 right-85 lg:bottom-66 lg:h-35 lg:top-110 lg:right-[max(calc(-1%_+_var(--crop-x,0px)/2),calc(var(--crop-x,0px)_-_124px))]",
    amenityListClass:
      "max-w-lg lg:w-[42rem]",
    amenityItemClass: "lg:text-[17px]",
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
      "top-[10%] lg:right-[15%] lg:top-[14%]",
    headerLogoClass:
      "w-[207.8px] sm:w-[233.8px] md:w-[324.7px] lg:w-[243.5px]",
    headerLogoTrim: "mt-[-7.58%] mb-[-4.5%]",
    /* the wordmark sits 0.83% left of its artboard's centre, so the mark's INK — not its box — is what lines up with
       the amenities below it. Measured: node scripts/measure-page.mjs notan-beach-house */
    headerLogoNudge: "translate-x-[0.83%]",
    headerSubClass: "font-bold lg:text-[12px]",
    /* The floor readout, anchored on its CENTRE as a share of the picture —
       %, not px, and centre, not corner, so the same one spot serves a
       1920-wide picture layer and an 820-wide portrait canvas. Measured off
       the live page: node scripts/measure-page.mjs */
    asideClass:
      "left-[9%] top-[15%] lg:left-[18.75%] lg:top-[25.00%] lg:right-auto lg:bottom-auto lg:-translate-x-1/2 portrait:left-[18.75%]! portrait:top-[25.00%]! portrait:right-auto! portrait:bottom-auto! portrait:-translate-x-1/2!",
    nMarkFill: "black",
    amenityClass:
      "w-[calc(100%-2.5rem)] max-w-xl sm:max-w-2xl lg:max-w-3xl bottom-55 right-85 lg:bottom-36 lg:top-120 lg:right-[max(calc(-0.75rem_+_var(--crop-x,0px)/2),calc(var(--crop-x,0px)_-_124px))]",
    amenityListClass:
      "max-w-lg lg:w-[54rem]",
    amenityItemClass: "lg:text-[17px]",
  },

  "notan-tides": {
    viewImg: notanTidesView,
    // matches Building_Floor_SVG/Notan_Tides/notan-Tides_BuildingSvg.svg — the
    // cut-out's own space. The photo is 1672×941 (ratio 1.7768) against the
    // viewBox's 1.7776, a 0.05% difference, so cover and slice crop as one and
    // the bands land on the tower as drawn.
    viewBox: "0 0 4627 2603",
    floors: NOTAN_TIDES_FLOORS,
    // The tower stands centre-right (35–66% of the frame) against open sky to
    // its left, so the mark and the floor readout both sit over that sky.
    // Starting placement — dial in against the live page like the others.
    headerClass:
      "top-36 lg:left-[14%] lg:top-[6%]",
    /* The floor readout, anchored on its CENTRE as a share of the picture —
       %, not px, and centre, not corner, so the same one spot serves a
       1920-wide picture layer and an 820-wide portrait canvas. Measured off
       the live page: node scripts/measure-page.mjs */
    asideClass:
      "right-[15%] top-[30%] lg:left-[82.92%] lg:top-[23.00%] lg:right-auto lg:bottom-auto lg:-translate-x-1/2 portrait:left-[82.92%]! portrait:top-[23.00%]! portrait:right-auto! portrait:bottom-auto! portrait:-translate-x-1/2!",
    headerSubClass: "font-bold lg:text-[12px]",
     headerLogoClass:
      "w-[222.4px] sm:w-[250.3px] md:w-[347.6px] lg:w-[260.7px]",
    headerLogoTrim: "mt-[-5.75%] mb-[-6.84%]",
    nMarkFill: "black",
    amenityClass:
      "w-[calc(100%-2.5rem)] max-w-xl sm:max-w-2xl lg:max-w-3xl bottom-55 lg:bottom-63 lg:top-112 lg:left-[max(calc(-48px_+_var(--crop-x,0px)/2),calc(var(--crop-x,0px)_-_124px))]",
    amenityListClass:
      "max-w-lg lg:w-[42rem]",
    amenityItemClass: "lg:text-[17px]",
  },
};
