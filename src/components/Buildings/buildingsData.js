import notanCrown from "../../assets/buildings/notan_crown.png";
import notanJewel from "../../assets/buildings/Notan_jewel.png";
import notanEdge from "../../assets/buildings/notan_edge.png";
import notanSpace from "../../assets/buildings/notan_space.png";
import notanDc from "../../assets/buildings/notan dc.png";
import notanTerrace from "../../assets/buildings/notan_terrace.png";
import notanTides from "../../assets/buildings/Notan_tides.png";
import notanViews from "../../assets/buildings/notan_views.png";

/**
 * Every building that stands on the map.
 *
 * To move a building, change `top` / `left` — they are percentages of the
 * map and mark the point where the building's BASE touches the ground.
 * `width` controls its size, `tooltip: "bottom"` flips the card below the
 * building (use it for buildings near the top edge of the screen).
 * `href` is the future views page route.
 *
 * Two separate labels, on purpose:
 *   `area`     — the small uppercase line inside the map tooltip.
 *                Keep it short and simple, it sits in a narrow card.
 *   `subtitle` — the line under the name on the building page.
 *                Written out in full exactly as it should read (add
 *                ", Mumbai" yourself if you want it). Falls back to
 *                `<area>, Mumbai` when left out.
 */
export const BUILDINGS = [
  {
    id: "notan-crown",
    name: "Notan Crown",
    area: "Bandra West",
    subtitle: "S.V.Road,Bandra West, Mumbai",
    tagline: "A quiet address by the shore.",
    img: notanCrown,
    top: "92%",
    left: "52.7%",
    width: "clamp(42px, 4.2vw, 74px)",
    href: "/projects/notan-crown",
  },
  {
    id: "notan-jewel",
    name: "Notan Jewel",
    area: "Bandra West",
    // subtitle: "Bandra West, Mumbai",
    tagline: "Ambition. Structure. Permanence.",
    img: notanJewel,
    top: "84%",
    left: "50.3%",
    width: "clamp(42px, 4.2vw, 74px)",
    // tooltip: "bottom",
    href: "/projects/notan-jewel",
  },
  {
    id: "notan-edge",
    name: "Notan Edge",
    area: "Vile Parle",
    subtitle: "V.M.Road,Vile Parle, Mumbai",
    tagline: "Where the city meets the sky.",
    img: notanEdge,
    top: "29%",
    left: "56.2%",
    tooltip: "bottom",
    width: "clamp(42px, 3.8vw, 74px)",
    href: "/projects/notan-edge",
  },
  {
    id: "notan-space",
    name: "Notan Spaces",
    area: "Santacruz East",
    // subtitle: "Santacruz East, Mumbai",
    tagline: "The Architecture of Ambition.",
    img: notanSpace,
    top: "61%",
    left: "64.3%",
    width: "clamp(42px, 4.3vw, 74px)",
    href: "/projects/notan-space",
  },
  {
    id: "notan-dc",
    name: "Notan DC",
    area: "Juhu",
    subtitle: "N.S.Road No.10,J.V.P.D,Juhu,Mumbai",
    tagline: "Rooted in legacy. Reimagined for tomorrow.",
    img: notanDc,
    top: "18%",
    left: "51.5%",
    tooltip: "bottom",
    width: "clamp(42px, 3.2vw, 74px)",
    href: "/projects/notan-dc",
  },
  {
    id: "notan-terrace",
    name: "Notan Terraces",
    area: "Juhu",
    subtitle: "N.S.Road No.11,J.V.P.D,Juhu, Mumbai",
    tagline: "Evenings that open outward.",
    img: notanTerrace,
    top: "25.4%",
    left: "50.3%",
    tooltip: "bottom",
    width: "clamp(42px, 3.2vw, 74px)",
    href: "/projects/notan-terrace",
  },
  // {
  //   id: "notan-lands-end",
  //   name: "Notan Tides",
  //   area: "Bandra",
  //   subtitle: "Bandra, Mumbai",
  //   tagline: "Living in rhythm with the sea.",
  //   img: notanTides,
  //   top: "86%",
  //   left: "68%",
  //   width: "clamp(64px, 6.5vw, 110px)",
  //   href: "/projects/notan-tides",
  // },
  {
    id: "notan-views",
    name: "Notan Views",
    area: "Bandra West",
    tagline: "Panoramic living and outlook.",
    img: notanViews,
    top: "80%",
    left: "68%",
    width: "clamp(42px, 4.2vw, 74px)",
    href: "/projects/notan-views",
  },
];
