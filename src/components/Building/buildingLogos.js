import dcLogo from "../../assets/Buildings_Logo/notan D.C. logo.svg";
import edgeLogo from "../../assets/Buildings_Logo/notan edge logo.svg";
import jewelLogo from "../../assets/Buildings_Logo/notan jewel logo.svg";
import spaceLogo from "../../assets/Buildings_Logo/notan spaces.svg";
import terraceLogo from "../../assets/Buildings_Logo/notan Terraces logo.svg";
import landsEndLogo from "../../assets/Buildings_Logo/notan Lands End logo.svg";
import viewsLogo from "../../assets/Buildings_Logo/notan Views logo.svg";
import crownLogo from "../../assets/Buildings_Logo/notan Crown logo.png";
import beachHouseLogo from "../../assets/Buildings_Logo/notan beach house logo.svg";
import tidesLogo from "../../assets/Buildings_Logo/Notan Tides.svg";
import finalLogo from "../../assets/Buildings_Logo/Notandas Final Logo.svg";

/**
 * Dedicated project marks, keyed by the /projects/:id route id.
 * Projects without their own mark are NOT listed here — consumers decide
 * their own fallback (master logo, animated emblem, name as text, …).
 */
export const BUILDING_LOGOS = {
  "notan-dc": dcLogo,
  "notan-edge": edgeLogo,
  "notan-jewel": jewelLogo,
  "notan-space": spaceLogo,
  "notan-terrace": terraceLogo,
  "notan-lands-end": landsEndLogo,
  "notan-views": viewsLogo,
  "notan-crown": crownLogo,
  "notan-beach-house": beachHouseLogo,
  "notan-tides": tidesLogo,
};

/**
 * Marks whose artwork is cropped tight to its pixels (Crown is a landscape
 * PNG with no transparent padding), unlike the square SVG marks whose content
 * sits in the middle ~40% of the canvas. Consumers must skip their
 * padding-compensation styling (negative margins, oversized boxes) for these.
 */
export const TIGHT_CROPPED_LOGOS = new Set(["notan-crown"]);

/** Master Notandas brand mark. */
export const NOTANDAS_LOGO = finalLogo;

/**
 * Where the visible mark actually sits inside each logo file, as fractions of
 * the artwork box — measured once from each SVG's ink bounds (getBBox) against
 * its viewBox, and from the raster's pixel size for Crown.
 *
 * The wordmark SVGs are all drawn on a 2000×2000 canvas with the lettering
 * floating in the middle third: only ~34% of the height is ink, the rest is
 * transparent air. Anything that lays a mark out has to cancel that padding,
 * or the mark reads tiny and whatever sits beneath it drifts half a screen
 * away. `aspect` is the file's own width ÷ height.
 *
 * Consumers scale the artwork so its INK is the width they asked for, then
 * offset it by (x, y) — see ProjectPlate. That makes "logo width" mean the
 * same thing for every project, whatever padding its file happens to carry.
 */
export const LOGO_INK = {
  "notan-dc": { x: 0.0863, y: 0.3116, w: 0.8274, h: 0.3724, aspect: 1 },
  "notan-edge": { x: 0.0922, y: 0.3183, w: 0.8024, h: 0.361, aspect: 1 },
  "notan-jewel": { x: 0.117, y: 0.3269, w: 0.7655, h: 0.3445, aspect: 1 },
  "notan-space": { x: 0.1206, y: 0.3412, w: 0.7583, h: 0.3153, aspect: 1 },
  "notan-terrace": { x: 0.1027, y: 0.3174, w: 0.7941, h: 0.3627, aspect: 1 },
  "notan-lands-end": { x: 0.0912, y: 0.2825, w: 0.8389, h: 0.3645, aspect: 1 },
  "notan-views": { x: 0.1133, y: 0.3503, w: 0.7734, h: 0.3481, aspect: 1 },
  "notan-tides": { x: 0.2195, y: 0.3737, w: 0.5611, h: 0.2631, aspect: 1 },
  // already cropped to their pixels — no padding to cancel
  "notan-beach-house": { x: 0, y: 0, w: 1, h: 1, aspect: 841.89 / 595.28 },
  "notan-crown": { x: 0, y: 0, w: 1, h: 1, aspect: 6901 / 3110 },
};

/** Fallback for a mark with no measurement: assume it fills its own box. */
export const FULL_INK = { x: 0, y: 0, w: 1, h: 1, aspect: 1 };
