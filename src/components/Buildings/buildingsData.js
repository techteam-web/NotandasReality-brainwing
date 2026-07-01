import notanCrown from "../../assets/buildings/notan_crown.png";
import notanJewel from "../../assets/buildings/Notan_jewel.png";
import notanEdge from "../../assets/buildings/notan_edge.png";
import notanSpace from "../../assets/buildings/notan_space.png";
import notanDc from "../../assets/buildings/notan dc.png";
import notanTerrace from "../../assets/buildings/notan_terrace.png";
import notanTides from "../../assets/buildings/Notan_tides.png";

/**
 * Every building that stands on the map.
 *
 * To move a building, change `top` / `left` — they are percentages of the
 * map and mark the point where the building's BASE touches the ground.
 * `width` controls its size, `tooltip: "bottom"` flips the card below the
 * building (use it for buildings near the top edge of the screen).
 * `href` is the future views page route.
 */
export const BUILDINGS = [
  {
    id: "notan-crown",
    name: "Notan Crown",
    area: "Bandra West",
    tagline: "A quiet address by the shore.",
    img: notanCrown,
    top: "95%", 
    left: "53%",
    width: "clamp(42px, 4.2vw, 74px)",
    href: "/projects/notan-crown",
  },
  {
    id: "notan-jewel",
    name: "Notan Jewel",
    area: "Bandra West",
    tagline: "Crafted to catch the light.",
    img: notanJewel,
    top: "82%",
    left: "49%",
    width: "clamp(42px, 4.2vw, 74px)",
    // tooltip: "bottom",
    href: "/projects/notan-jewel",
  },
  {
    id: "notan-edge",
    name: "Notan Edge",
    area: "Vile Parle",
    tagline: "Where the city meets the sky.",
    img: notanEdge,
    top: "30%",
    left: "58.6%",
    width: "clamp(42px, 3.8vw, 74px)",
    href: "/projects/notan-edge",
  },
  {
    id: "notan-space",
    name: "Notan Space",
    area: "Santacruz East",
    tagline: "Room to live, room to breathe.",
    img: notanSpace,
    top: "63%",
    left: "64.6%",
    width: "clamp(42px, 4.3vw, 74px)",
    href: "/projects/notan-space",
  },
  {
    id: "notan-dc",
    name: "Notan DC",
    area: "Juhu",
    tagline: "Business, beautifully placed.",
    img: notanDc,
    top: "19%",
    left: "52%",
      tooltip: "bottom",
    width: "clamp(42px, 3.2vw, 74px)",
    href: "/projects/notan-dc",
  },
  {
    id: "notan-terrace",
    name: "Notan Terrace",
    area: "Juhu",
    tagline: "Evenings that open outward.",
    img: notanTerrace,
    top: "28.5%", 
    left: "53%", 
    width: "clamp(42px, 3.2vw, 74px)",
    href: "/projects/notan-terrace",
  },
  // {
  //   id: "notan-lands-end",
  //   name: "Notan Tides",
  //   area: "Bandra",
  //   tagline: "Living in rhythm with the sea.",
  //   img: notanTides,
  //   top: "86%",
  //   left: "68%",
  //   width: "clamp(64px, 6.5vw, 110px)",
  //   href: "/projects/notan-tides",
  // },
];
