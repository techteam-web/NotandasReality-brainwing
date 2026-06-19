import { useEffect, useRef, useState } from "react";
import { MARZIPANO_SRC, floorKey, toDeg } from "./panoData";
import MiniCompass from "../SvgAnimations/MiniCompass";

/**
 * Full-screen 360° pano overlay for a single building floor.
 *
 * Loads the Marzipano runtime (once, from /public) and renders the floor's
 * pano with the view *restricted to a horizontal arc* (the "140°" window) so
 * visitors look across the facade rather than spinning a full 360°. The arc,
 * facing (yaw/pitch) and zoom (fov) all come from `pano` — see panoData.js.
 *
 * The toolbar shows the live view angles and a "Copy config" button: drag to
 * the framing you want, copy, and paste the snippet back into panoData.js —
 * FLOOR_PANO_MAP for a whole floor, or REGION_PANO_MAP when opened from a
 * specific floor-plan room (regionName set).
 */

// Vertical look range allowed around the configured pitch.
const PITCH_HALF_RANGE = (40 * Math.PI) / 180;
const HFOV_MIN = (25 * Math.PI) / 180;

const TWO_PI = 2 * Math.PI;
// Wrap an angle into (-π, π] — same normalization Marzipano uses for yaw.
const wrapPi = (a) => {
  let x = a % TWO_PI;
  if (x > Math.PI) x -= TWO_PI;
  if (x <= -Math.PI) x += TWO_PI;
  return x;
};

/**
 * Wrap-aware replacement for Marzipano's `limit.yaw`.
 *
 * The built-in clamps the raw (already wrapped to ±π) yaw, which breaks when the
 * allowed arc straddles the ±180° seam: dragging past -180° wraps yaw to +179°
 * and the clamp snaps it to the far edge, so the view appears to "reset". We
 * instead clamp the offset *from the arc centre* (always within ±half, half<π),
 * which has no seam, then wrap the result back.
 */
const limitYawArc = (center, half) => (params) => {
  const delta = Math.min(Math.max(wrapPi(params.yaw - center), -half), half);
  params.yaw = wrapPi(center + delta);
  return params;
};

let marzipanoPromise = null;
const loadMarzipano = () => {
  if (window.Marzipano) return Promise.resolve(window.Marzipano);
  if (marzipanoPromise) return marzipanoPromise;
  marzipanoPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = MARZIPANO_SRC;
    s.async = true;
    s.onload = () => resolve(window.Marzipano);
    s.onerror = () => reject(new Error("Failed to load Marzipano"));
    document.head.appendChild(s);
  });
  return marzipanoPromise;
};

const PanoViewer = ({
  buildingName,
  floor,
  floorTitle,
  pano,
  regionName,
  onClose,
}) => {
  const panoRef = useRef(null);
  const viewerRef = useRef(null);
  const viewRef = useRef(null);
  const rafRef = useRef(0);

  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [angles, setAngles] = useState({ yaw: 0, pitch: 0, fov: 0 });
  const [copied, setCopied] = useState(false);

  // close on Escape
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // build the Marzipano viewer for this floor's pano
  useEffect(() => {
    if (!pano || !panoRef.current) return;
    let disposed = false;

    loadMarzipano()
      .then((Marzipano) => {
        if (disposed || !panoRef.current) return;

        const viewer = new Marzipano.Viewer(panoRef.current, {
          controls: { mouseViewMode: "drag" },
        });
        viewerRef.current = viewer;

        const source = Marzipano.ImageUrlSource.fromString(
          `${pano.tilesUrl}/{z}/{f}/{y}/{x}.jpg`,
          { cubeMapPreviewUrl: `${pano.tilesUrl}/preview.jpg` }
        );
        const geometry = new Marzipano.CubeGeometry(pano.levels);

        const { yaw, pitch } = pano.center;
        const half = pano.panRad / 2;
        const maxHfov = Math.min(pano.panRad, (110 * Math.PI) / 180);
        const limit = Marzipano.RectilinearView.limit;
        const limiter = Marzipano.util.compose(
          limit.traditional(pano.faceSize, (100 * Math.PI) / 180, maxHfov),
          limitYawArc(yaw, half),
          limit.pitch(pitch - PITCH_HALF_RANGE, pitch + PITCH_HALF_RANGE),
          limit.hfov(HFOV_MIN, maxHfov)
        );

        const view = new Marzipano.RectilinearView({ ...pano.center }, limiter);
        viewRef.current = view;

        const scene = viewer.createScene({
          source,
          geometry,
          view,
          pinFirstLevel: true,
        });
        scene.switchTo();

        const sync = () => {
          rafRef.current = 0;
          setAngles({ yaw: view.yaw(), pitch: view.pitch(), fov: view.fov() });
        };
        sync();
        view.addEventListener("change", () => {
          if (!rafRef.current) rafRef.current = requestAnimationFrame(sync);
        });

        setLoading(false);
      })
      .catch(() => !disposed && setFailed(true));

    return () => {
      disposed = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
      viewRef.current = null;
    };
  }, [pano]);

  const zoom = (factor) => {
    const v = viewRef.current;
    if (v) v.setFov(v.fov() * factor);
  };
  const resetView = () => {
    const v = viewRef.current;
    if (v) v.setParameters({ ...pano.center });
  };

  const copyConfig = () => {
    if (!pano) return;
    const key = floorKey(floor);
    const k = typeof key === "string" ? `"${key}"` : String(key);
    const yaw = Math.round(toDeg(angles.yaw));
    const pitch = Math.round(toDeg(angles.pitch));
    const fov = Math.round(toDeg(angles.fov));
    const pan = Math.round(toDeg(pano.panRad));

    // From a floor-plan room → REGION_PANO_MAP entry; otherwise → FLOOR_PANO_MAP.
    const snippet =
      regionName != null
        ? `// REGION_PANO_MAP[${k}]\n` +
          `"${regionName}": { yawDeg: ${yaw}, pitchDeg: ${pitch}, fovDeg: ${fov}, panDeg: ${pan} },`
        : `${key}: { scene: "${pano.id}", yawDeg: ${yaw}, pitchDeg: ${pitch}, fovDeg: ${fov}, panDeg: ${pan} },`;

    navigator.clipboard?.writeText(snippet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-[#0e1726]"
      style={{ fontFamily: '"Times New Roman", Times, serif' }}
    >
      {/* top bar */}
      <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-6 py-4 md:px-10">
        <div className="text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
          <p className="text-[10px] uppercase tracking-[3px] text-white/60">
            {buildingName} · 360° view
            {regionName ? ` · ${regionName}` : ""}
          </p>
          <h2 className="mt-0.5 font-serif text-2xl italic text-[#e8c879] md:text-3xl">
            {pano ? pano.name : floorTitle}
          </h2>
        </div>

        <button
          onClick={onClose}
          aria-label="Close 360° view"
          className="group inline-flex items-center gap-2  border border-white/20 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white transition-colors hover:border-[#e8c879] hover:bg-[#e8c879]/10 hover:text-[#e8c879]"
        >
          Close
          <span className="text-sm leading-none transition-transform group-hover:rotate-90">
            ✕
          </span>
        </button>
      </div>

      {/* pano stage */}
      {pano ? (
        <>
          <div ref={panoRef} className="absolute inset-0 h-full w-full" />

          {loading && !failed && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-white/70">
              <span className="text-[11px] uppercase tracking-[4px]">
                Loading 360° view…
              </span>
            </div>
          )}
          {failed && (
            <div className="absolute inset-0 flex items-center justify-center text-center text-white/80">
              <p className="text-sm">Couldn’t load the 360° view.</p>
            </div>
          )}

          {/* realtime mini compass — the dial spins with the live look direction */}
          {!loading && !failed && (
            <MiniCompass
              yaw={toDeg(angles.yaw)}
              transitionMs={0}
              className="pointer-events-none absolute bottom-6 left-6 z-10 h-16 w-16 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] md:h-28 md:w-28"
            />
          )}

          {/* bottom toolbar */}
          {!failed && (
            <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-wrap items-center justify-center gap-1 rounded-full border border-white/20 bg-black/45 p-1.5 backdrop-blur-md">
              <button
                onClick={() => zoom(1.15)}
                aria-label="Zoom out"
                className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-white transition-colors hover:bg-white/15 hover:text-[#e8c879]"
              >
                −
              </button>
              <button
                onClick={() => zoom(0.87)}
                aria-label="Zoom in"
                className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-white transition-colors hover:bg-white/15 hover:text-[#e8c879]"
              >
                +
              </button>
              <button
                onClick={resetView}
                className="px-3 text-xs uppercase tracking-wider text-white transition-colors hover:text-[#e8c879]"
              >
                Reset
              </button>

              <span className="mx-1 hidden h-5 w-px bg-white/20 sm:block" />

              {/* live angles — read these off to tune FLOOR_PANO_MAP */}
              <span className="hidden px-2 font-mono text-[11px] tracking-wide text-white/70 sm:inline">
                yaw {Math.round(toDeg(angles.yaw))}° · pitch{" "}
                {Math.round(toDeg(angles.pitch))}° · fov{" "}
                {Math.round(toDeg(angles.fov))}°
              </span>
              <button
                onClick={copyConfig}
                className="rounded-full px-3 py-1 text-xs uppercase tracking-wider text-white transition-colors hover:bg-white/15 hover:text-[#e8c879]"
              >
                {copied ? "Copied!" : "Copy config"}
              </button>
            </div>
          )}
        </>
      ) : (
        /* floor has no pano yet */
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center text-white/80">
          <p className="text-[11px] uppercase tracking-[4px] text-white/50">
            360° view coming soon
          </p>
          <p className="mt-3 font-serif text-2xl italic text-[#e8c879]">
            {floorTitle}
          </p>
          <p className="mt-2 text-sm text-white/60">
            No exterior 360° capture exists for this floor yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default PanoViewer;
