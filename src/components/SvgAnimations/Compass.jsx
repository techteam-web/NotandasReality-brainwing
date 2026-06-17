import { useEffect, useLayoutEffect, useRef } from "react";
import compassFile from "../../assets/Cumpass.svg?raw";

/**
 * Decorative compass rose.
 *
 * The asset is inlined (Vite `?raw`) so we can spin the whole rose — the
 * inner star *and* the N/S/E/W bezel — together around the compass centre.
 *
 * Pass `yaw` (in degrees) to orient the rose, e.g. the live look-direction
 * of a 360° pano. Omit it (defaults to 0) for a static rose, as on the home
 * map. Flip the sign of `yaw` at the call site if the rotation reads backwards.
 */

// Drop the XML prolog so the markup is clean HTML for dangerouslySetInnerHTML.
const compassMarkup = compassFile.slice(compassFile.indexOf("<svg"));

const SVG_NS = "http://www.w3.org/2000/svg";

const Compass = ({ yaw = 0, transitionMs = 80, className = "" }) => {
  const containerRef = useRef(null);
  const roseRef = useRef(null);

  // Wire up the inlined SVG once it's in the DOM: pull every drawable element
  // into one <g> so the whole rose spins as a single unit. (<defs> stays put —
  // it only holds the <style>, which applies regardless of nesting.)
  useLayoutEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const svg = root.querySelector("svg");
    if (!svg) return;
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");

    const rose = document.createElementNS(SVG_NS, "g");
    for (const node of Array.from(svg.childNodes)) {
      if (node.nodeType !== 1 || node.tagName.toLowerCase() === "defs") continue;
      rose.appendChild(node); // moves it out of <svg> into the group
    }
    svg.appendChild(rose);
    roseRef.current = rose;
  }, []);

  // Spin the rose to match the yaw. We rotate via the SVG `transform`
  // attribute around the compass centre (600,600 in the `0 0 1200 1200`
  // viewBox) — `rotate(angle cx cy)` is rock-solid across browsers, unlike
  // CSS transform-box/transform-origin on an SVG <g>.
  useEffect(() => {
    const rose = roseRef.current;
    if (!rose) return;
    rose.style.transition = transitionMs
      ? `transform ${transitionMs}ms ease-out`
      : "none";
    // A CSS `transform` would override the attribute below — keep it clear.
    rose.style.removeProperty("transform");
    rose.setAttribute("transform", `rotate(${-yaw} 600 600)`);
  }, [yaw, transitionMs]);

  return (
    <div
      ref={containerRef}
      className={className}
      dangerouslySetInnerHTML={{ __html: compassMarkup }}
    />
  );
};

export default Compass;
