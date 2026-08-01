import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import compassFile from "../../assets/floorPlan_Compass.svg?raw";

/**
 * The north compass laid on a floor-plan photo.
 *
 * Renders as a child of the plan box, positioned in the plan's own percentage
 * space, so it pans and zooms with the paper it's drawn on and stays glued to
 * the same corner at every screen size. Placement comes from
 * floorPlanCompassData.js — see that file for what each knob means.
 *
 * `rotation` turns the artwork clockwise — it's drawn north-up, so 0 means
 * north is up the page. The turn is part of the JSX, not something an effect
 * or a tween applies afterwards: every mount paints already rotated, so
 * switching floors or reopening the page can never show the dial snapping
 * back to north and swinging out again. The eased turn exists only for a
 * LATER bearing change on a live dial (a floor whose plan is shot
 * differently), enabled after the first paint.
 *
 * The only animation is a short fade/scale entrance on its own inner element,
 * so it can never fight the rotation for the transform.
 */

// Inline the markup (Vite `?raw`), minus the XML prolog so it's clean HTML for
// dangerouslySetInnerHTML. An inline <svg>'s <style> applies to the WHOLE
// document, so the asset's generic .cls-N names are namespaced on the way in
// (Cumpass.svg, inlined by SvgAnimations/Compass, ships its own .st-N set) and
// the boilerplate Illustrator id dropped, since two inlined sheets would
// otherwise both answer to #Layer_1.
const compassMarkup = compassFile
  .slice(compassFile.indexOf("<svg"))
  .replace("<svg", '<svg width="100%" height="100%"')
  .replace(/\bcls-/g, "fpc-")
  .replace(/\sid="Layer_1"/, "");

// The dial's hub — where the needle's arms converge (605.73, 689.11 in the
// 1254×1254 viewBox), as percentages. Rotation and the entrance both pivot
// here rather than the box centre, which sits a couple of percent off it; a
// centre pivot made the dial orbit slightly instead of turning in place.
const HUB_ORIGIN = "48.3038% 54.9529%";

const FloorPlanCompass = ({
  rotation = 0,
  size = 10,
  x = 96,
  y = 93.6,
  opacity = 0.92,
  className = "",
  style,
}) => {
  const rotorRef = useRef(null); // carries `rotation`, nothing else
  const fxRef = useRef(null); // carries the entrance fade/scale, nothing else

  // Ease later bearing changes (a floor override turning a live dial) — but
  // only from the second paint on. Enabling the transition after mount means
  // a fresh mount shows the configured rotation outright instead of
  // transitioning to it from zero. React's style diffing never touches
  // properties it didn't render, so this survives re-renders.
  useEffect(() => {
    rotorRef.current?.style.setProperty(
      "transition",
      "transform 0.5s ease-out",
    );
  }, []);

  // Entrance: fade/scale out of the hub, once per mount.
  useGSAP(() => {
    gsap.from(fxRef.current, {
      autoAlpha: 0,
      scale: 0.85,
      transformOrigin: HUB_ORIGIN,
      duration: 0.5,
      ease: "power2.out",
    });
  });

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute select-none ${className}`}
      style={{
        // width drives the box; aspect-ratio keeps it square (the artwork's
        // viewBox is 1254×1254), so one `size` number holds on any plan ratio
        left: `${x}%`,
        top: `${y}%`,
        width: `${size}%`,
        aspectRatio: 1,
        transform: "translate(-50%, -50%)",
        opacity,
        ...style,
      }}
    >
      {/* placement, rotation and entrance each own one element's transform —
          stacked this way none of them can ever overwrite another */}
      <div
        ref={rotorRef}
        className="h-full w-full"
        style={{
          transform: `rotate(${rotation}deg)`,
          transformOrigin: HUB_ORIGIN,
        }}
      >
        <div
          ref={fxRef}
          className="h-full w-full drop-shadow-[0_2px_6px_rgba(31,42,64,0.25)]"
          dangerouslySetInnerHTML={{ __html: compassMarkup }}
        />
      </div>
    </div>
  );
};

export default FloorPlanCompass;
