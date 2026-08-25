/**
 * The photo's real rectangle, as a box you can put things in.
 *
 * The hero photo is `object-cover`, so it is scaled up until it covers the
 * viewport and the overflow is cropped away — how much overflow, and on which
 * axis, depends on the viewport's SHAPE, not its width. Text positioned
 * against the viewport therefore slides across the building as the window
 * changes, which is why placing it used to need a value per breakpoint per
 * element and still broke between them.
 *
 * This is the same rectangle, reproduced in CSS:
 *
 *     width  = max(frame width, frame height × ar)
 *     height = max(frame height, frame width ÷ ar)
 *
 * centred on the frame — which is exactly what `object-cover` and the floor
 * cut-outs' `preserveAspectRatio="xMidYMid slice"` both do. Anything laid out
 * inside is in the photo's coordinate space: `left-[74%]` means 74% of the
 * PHOTO, cropped or not, and stays welded to that point at every window size.
 *
 * `container-type: size` on the inner box makes `cqw` mean "one percent of
 * the photo's width", so type and box widths scale with the building instead
 * of needing a breakpoint each.
 *
 * Sizing is measured in container units against the frame, so the stage needs
 * no resize listener and no measurement effect — it is pure CSS. The frame is
 * expected to carry `container-type: size` itself (BuildingPage puts it on a
 * box that fills the frame).
 *
 * @param ar  the photo's aspect ratio — width ÷ height. Start it from the
 *            viewBox and refine it from the <img>'s naturalWidth/naturalHeight
 *            so there is nothing to see on first paint.
 */
const ImageStage = ({ ar, className = "", children }) => (
  <div
    className={`pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${className}`}
    style={{
      width: `max(100cqw, calc(100cqh * ${ar}))`,
      height: `max(100cqh, calc(100cqw / ${ar}))`,
    }}
  >
    {/* the container itself, so cqw inside reads as a percent of the photo */}
    <div className="absolute inset-0" style={{ containerType: "size" }}>
      {children}
    </div>
  </div>
);

export default ImageStage;
