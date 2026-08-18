import { useEffect, useState } from "react";

/**
 * Reads the `w / h` ratio out of an SVG viewBox string, ignoring its origin
 * (some of the floor cut-outs carry huge negative origins from the CAD export).
 */
export const aspectFromViewBox = (viewBox) => {
  const parts = String(viewBox || "")
    .trim()
    .split(/[\s,]+/)
    .map(Number);
  const [, , w, h] = parts;
  return w > 0 && h > 0 ? w / h : 16 / 9;
};

const measure = (aspect) => {
  if (typeof window === "undefined") return { x: 0, y: 0, w: 0, h: 0 };
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  // the render is treated as `aspect` wide by 1 tall, then blown up until it
  // covers the viewport — exactly what `object-cover` does to the photo
  const scale = Math.max(vw / aspect, vh);
  const w = aspect * scale;
  const h = scale;
  return { x: (vw - w) / 2, y: (vh - h) / 2, w, h };
};

/**
 * Where a full-bleed `cover` image actually lands behind the viewport — the
 * building renders on the project pages, the map on the home page.
 *
 * The artwork is `object-cover` / `bg-cover` and the floor cut-outs are drawn
 * with `preserveAspectRatio="xMidYMid slice"`, so they all crop identically —
 * but that crop shifts as the window's own ratio changes. Anything anchored to
 * the viewport instead (`top-90 2xl:left-64 …`) slides off the patch of artwork
 * it was dialled in over the moment the window stops being 16:9.
 *
 * Anchor to the box this returns and a label stays on the same piece of the
 * artwork at every size — over the same sky, or on the same street corner.
 */
export const useCoverBox = (aspect) => {
  const [box, setBox] = useState(() => measure(aspect));

  useEffect(() => {
    const onResize = () => setBox(measure(aspect));
    onResize(); // fullscreen entry / first paint can both change the viewport
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [aspect]);

  return box;
};

/**
 * The size everything is drawn against — and the map artwork's own pixel width,
 * so a 1920-wide window renders the map at exactly 1:1.
 */
export const DESIGN_WIDTH = 1920;

/**
 * The one scale every overlay shares: strictly proportional to the artwork.
 *
 * This is deliberately linear. An earlier version eased off below 1920 to keep
 * small-screen type readable, and that is exactly what made lg/xl look wrong —
 * the artwork shrank faster than the text on it, so the amenities crowded the
 * tower and the map pins swelled against the coastline. Tracking the artwork
 * 1:1 means one composition, rendered larger or smaller: what reads well at
 * 3xl reads the same at lg, xl and 5xl.
 *
 * The bounds are only there to stop absurd viewports, not to shape the curve.
 */
export const uiScaleFor = (box) => {
  const scale = box.w ? box.w / DESIGN_WIDTH : 1;
  return Math.min(2.4, Math.max(0.55, scale));
};
