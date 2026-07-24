import dcLogo from "../../assets/Buildings_Logo/notan D.C. logo.svg";
import edgeLogo from "../../assets/Buildings_Logo/notan edge logo.svg";
import jewelLogo from "../../assets/Buildings_Logo/notan jewel logo.svg";
import spaceLogo from "../../assets/Buildings_Logo/notan spaces.svg";
import terraceLogo from "../../assets/Buildings_Logo/notan Terraces logo.svg";
import landsEndLogo from "../../assets/Buildings_Logo/notan Lands End logo.svg";
import viewsLogo from "../../assets/Buildings_Logo/notan Views logo.svg";
import crownLogo from "../../assets/Buildings_Logo/notan Crown logo.png";
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
