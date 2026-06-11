import notanHouse from "../../assets/buildings/Notan_house.png";
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
    id: "notan-house",
    name: "Notan House",
    area: "Juhu",
    tagline: "A quiet address by the shore.",
    img: notanHouse,
    top: "30%",
    left: "56%",
    width: "clamp(64px, 6.5vw, 110px)",
    href: "/projects/notan-house",
  },
  {
    id: "notan-jewel",
    name: "Notan Jewel",
    area: "Juhu",
    tagline: "Crafted to catch the light.",
    img: notanJewel,
    top: "14%",
    left: "72%",
    width: "clamp(64px, 6.5vw, 110px)",
    tooltip: "bottom",
    href: "/projects/notan-jewel",
  },
  {
    id: "notan-edge",
    name: "Notan Edge",
    area: "Vile Parle",
    tagline: "Where the city meets the sky.",
    img: notanEdge,
    top: "34%",
    left: "78%",
    width: "clamp(64px, 6.5vw, 110px)",
    href: "/projects/notan-edge",
  },
  {
    id: "notan-space",
    name: "Notan Space",
    area: "Santacruz",
    tagline: "Room to live, room to breathe.",
    img: notanSpace,
    top: "50%",
    left: "62%",
    width: "clamp(64px, 6.5vw, 110px)",
    href: "/projects/notan-space",
  },
  {
    id: "notan-dc",
    name: "Notan DC",
    area: "Santacruz",
    tagline: "Business, beautifully placed.",
    img: notanDc,
    top: "68%",
    left: "80%",
    width: "clamp(64px, 6.5vw, 110px)",
    href: "/projects/notan-dc",
  },
  {
    id: "notan-terrace",
    name: "Notan Terrace",
    area: "Bandra",
    tagline: "Evenings that open outward.",
    img: notanTerrace,
    top: "74%",
    left: "56%",
    width: "clamp(64px, 6.5vw, 110px)",
    href: "/projects/notan-terrace",
  },
  {
    id: "notan-tides",
    name: "Notan Tides",
    area: "Bandra",
    tagline: "Living in rhythm with the sea.",
    img: notanTides,
    top: "86%",
    left: "68%",
    width: "clamp(64px, 6.5vw, 110px)",
    href: "/projects/notan-tides",
  },
];
