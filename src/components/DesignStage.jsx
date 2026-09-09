import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { createPortal } from "react-dom";

/**
 * The whole site, laid out ONCE at 1920×1080 and scaled to the window.
 *
 * Every screen here is a fixed composition standing on a full-bleed image —
 * the map on notan_map.png (1920×1080 exactly), each project on its own
 * `object-cover` render. Those images are scaled by the browser to cover the
 * window; the type over them used to be positioned and sized per breakpoint,
 * by hand, which is why the same page read differently at lg than at 3xl: the
 * picture scaled and the text did not.
 *
 * So the text scales with it — but WHICH rectangle a thing belongs to depends
 * on what it is, and there are two of them.
 *
 *   THE PICTURE LAYER is the image's own rectangle: 1920×1080 design pixels,
 *   centred, scaled by `max(w/1920, h/1080)` — the same `cover` the photo and
 *   the map are fitted with. Anything that has to stay on a SPOT OF THE
 *   PICTURE lives here and is welded to it: the project mark and its
 *   amenities standing in the sky, the floor readout beside the tower, and on
 *   the map every pin, label and drawing — the boat, the ship, the sea link,
 *   the palms, the plane. Resize the window to any shape and they keep their
 *   patch of the image, because they crop exactly as the image crops.
 *
 *   THE CHROME LAYER is the window: (w/scale)×(h/scale) design pixels pinned
 *   to the top-left, at the same scale. Anything anchored to a CORNER OF THE
 *   SCREEN lives here — the Back button, the brand mark, the compass, and the
 *   full-screen overlays. It can never be cropped, because its four edges are
 *   the window's four edges. Put a thing here with `<Chrome>`.
 *
 * Both layers share one scale, so a 17px caption is 17 design pixels whether
 * it is welded to the sky or pinned to a corner.
 *
 * That split is the whole point, and the first version had no split: it put
 * everything in the picture layer, so the Back button and the brand mark —
 * which sit ON the window's edge — were cropped away with the picture's
 * overflow. The version before that fitted a single layer to the window
 * instead, which kept the corners but let the map drift out from under its
 * own pins whenever the window's height changed.
 *
 * Below `lg` the box is off, `<Chrome>` renders in place, and children lay
 * out against the real window — phones and small tablets keep their own
 * layouts, which is a different design, not this one scaled down to 5px type.
 *
 * Two things to know when working inside a layer:
 *   - `vh`/`vw` still mean the REAL window. Use `--dvh`/`--dvw` (1% of the
 *     layer) or `h-stage` instead.
 *   - `position: fixed` resolves against the layer, not the window, because a
 *     transformed ancestor becomes the containing block. In the chrome layer
 *     those are the same rectangle; in the picture layer `fixed inset-0`
 *     covers the picture, which is what the page background wants.
 */

export const DESIGN_W = 1920;
export const DESIGN_H = 1080;

/* Below this the site uses its own phone/tablet layout instead of a scaled
   1920×1080 one. Same number as Tailwind's `lg`, and as the `flow` variant in
   index.css — the three have to agree on where the desktop composition ends. */
const MIN_WIDTH = 1024;

/* Where the 1920×1080 composition stops making sense: when the window is
   TALLER than it is wide. Not before that — a near-square window gets the
   real composition, covering, cropped at the sides, which is better than a
   layout of its own. Past it the picture would have to be blown up so far to
   cover that almost nothing of it is left on screen, so upright windows get
   their own composition — see the
   `portrait` variant in index.css, which has to agree with this number. */
const MIN_RATIO = 0.999;

/* The portrait canvas: 820 design pixels wide, whatever the tablet is. An
   iPad Pro upright is 1024 CSS pixels and a Mini is 744, and scaling one
   design to both by width alone would put 18px type at 7px on the Mini. Fixing
   the canvas instead means the portrait composition is drawn once, at a width
   chosen for reading, and each device scales it: ×1.25 on the Pro, ×0.91 on
   the Mini. Height is whatever the window gives — the page is a column, so it
   simply has more or less room under the photo. */
export const PORTRAIT_W = 820;
const PORTRAIT_MIN_WIDTH = 640;

/*
  The picture COVERS the window. Always, at every shape — full width and full
  height, no ground showing at the top, bottom or sides. That is a requirement
  of the design, not a trade-off to be balanced against something else.

  This used to cap the scale below `cover` so that a composition whose text ran
  near an edge would letterbox rather than crop — at 1280×1024 that left 195px
  of bare ground under the picture, and 473px beside it on a 3440-wide window.
  Whatever it bought in un-cropped text it cost in a page that plainly looks
  broken, so it is gone: the scale is the cover scale and nothing trims it.

  What that means for the composition: at shapes far from 16:9 the crop is
  deep, and a block sitting close to an edge of the 1920×1080 design can be
  cut into. If one is, the fix is to move the block off the edge — check the
  clearances with `node scripts/measure-page.mjs` — not to shrink the picture.
*/

const measure = () => {
  if (typeof window === "undefined") {
    return { active: false, scale: 1, viewW: DESIGN_W, viewH: DESIGN_H };
  }
  const { innerWidth: w, innerHeight: h } = window;

  if (w / h < MIN_RATIO) {
    /* Portrait: one canvas width, and the window's own height in those same
       design pixels. There is no separate picture rectangle here — the photo
       is laid out in the column like everything else — so both layers are the
       window and `<Chrome>` changes only what paints on top. */
    const scale = w / PORTRAIT_W;
    return {
      active: w >= PORTRAIT_MIN_WIDTH,
      portrait: true,
      scale,
      boxW: PORTRAIT_W,
      boxH: h / scale,
      viewW: PORTRAIT_W,
      viewH: h / scale,
    };
  }

  /* max(), not min(): this is the scale the PICTURE is drawn at, and the
     picture covers — whichever axis needs the bigger scale to fill the window
     sets it, and the other axis overflows and is cropped, exactly as
     `object-fit: cover` would. The chrome layer divides the window back down
     by it. */
  const scale = Math.max(w / DESIGN_W, h / DESIGN_H);
  return {
    active: w >= MIN_WIDTH,
    portrait: false,
    scale,
    boxW: DESIGN_W,
    boxH: DESIGN_H,
    viewW: w / scale,
    viewH: h / scale,
  };
};

const ChromeContext = createContext(null);

/**
 * Renders its children in the chrome layer — the window's rectangle — instead
 * of on the picture. For anything anchored to a screen corner, and for
 * full-screen overlays, which must not crop with the image and must paint
 * above it. A no-op when the design box is off.
 */
export const Chrome = ({ children }) => {
  const node = useContext(ChromeContext);
  if (!node) return children;
  return createPortal(children, node);
};

const DesignStage = ({ children }) => {
  const [{ scale, boxW, boxH, viewW, viewH, portrait, active }, setBox] =
    useState(measure);

  /* The portal's node is made here rather than read off a ref, so it EXISTS
     ON THE FIRST RENDER. A ref would only be filled after the children had
     already rendered, and anything that reaches for its own DOM on mount —
     PageTransition sets up the ink wave's timeline that way — would find
     nothing there and never animate. `display: contents` keeps the wrapper
     out of the layout, so a child still positions against the layer. */
  const [chromeNode] = useState(() => {
    if (typeof document === "undefined") return null;
    const el = document.createElement("div");
    el.style.display = "contents";
    return el;
  });
  const mountChrome = useCallback(
    (layer) => {
      if (layer && chromeNode && chromeNode.parentNode !== layer) {
        layer.appendChild(chromeNode);
      }
    },
    [chromeNode],
  );

  useEffect(() => {
    const onResize = () => setBox(measure());
    onResize(); // the first paint measured before layout settled
    window.addEventListener("resize", onResize);
    /* Fullscreen and orientation changes fire `resize` too, but Safari can
       report the old size on the same tick, so re-measure after it lands. */
    const settle = () => requestAnimationFrame(onResize);
    window.addEventListener("orientationchange", settle);
    document.addEventListener("fullscreenchange", settle);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", settle);
      document.removeEventListener("fullscreenchange", settle);
    };
  }, []);

  if (!active) return children;

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#dfe7ee]">
      {/* the picture's rectangle — centred and covering, like the image.
          Upright, there is nothing to centre on: the canvas IS the window, so
          it is pinned to the corner like the chrome layer. */}
      <div
        className={
          portrait ? "absolute top-0 left-0" : "absolute top-1/2 left-1/2"
        }
        style={{
          width: boxW,
          height: boxH,
          transform: portrait
            ? `scale(${scale})`
            : `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: portrait ? "top left" : "center",
          "--dvw": `${boxW / 100}px`,
          "--dvh": `${boxH / 100}px`,
        }}
      >
        {/* Upright there is nothing to escape: the canvas and the window are
            the same rectangle, so `<Chrome>` renders in place and a page can
            lay its corners out in flow with everything else. */}
        <ChromeContext.Provider value={portrait ? null : chromeNode}>
          {children}
        </ChromeContext.Provider>
      </div>

      {/* the window's rectangle, in the same design pixels, painted over it.
          Transparent to the pointer so hovering a floor still reaches the
          picture; each child turns pointer events back on for itself. */}
      <div
        ref={mountChrome}
        className="pointer-events-none absolute top-0 left-0"
        style={{
          width: viewW,
          height: viewH,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          "--dvw": `${viewW / 100}px`,
          "--dvh": `${viewH / 100}px`,
        }}
      />
    </div>
  );
};

export default DesignStage;
