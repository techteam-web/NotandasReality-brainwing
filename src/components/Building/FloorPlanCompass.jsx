import compassSvg from "../../assets/floorPlan_Compass.svg";

/**
 * The north compass laid on a floor-plan photo.
 *
 * Renders as a child of the plan box, positioned in the plan's own percentage
 * space, so it pans and zooms with the paper it's drawn on and stays glued to
 * the same corner at every screen size. Placement comes from
 * floorPlanCompassData.js — see that file for what each knob means.
 *
 * `rotation` turns the artwork clockwise about its own centre; the asset is
 * drawn with North up, so 0 means north is up the page.
 */
const FloorPlanCompass = ({
  rotation = 0,
  size = 13,
  x = 10,
  y = 85,
  opacity = 0.92,
  className = "",
  style,
}) => (
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
    <img
      src={compassSvg}
      alt=""
      draggable="false"
      className="block h-full w-full object-contain select-none drop-shadow-[0_2px_6px_rgba(31,42,64,0.25)]"
      // rotate the artwork inside its already-centred box, so `rotation` never
      // moves the compass off the spot x/y put it on
      style={{ transform: `rotate(${rotation}deg)` }}
    />
  </div>
);

export default FloorPlanCompass;
