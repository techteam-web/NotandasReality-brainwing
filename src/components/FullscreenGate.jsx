import { useState, useEffect, useCallback } from "react";
import brandLogo from "../assets/notandaslogo.svg";
import fullscreenBg from "../assets/fullscreengatebg.png";

// Soft atmospheric backdrop bundled from /src/assets. The gradients below
// stand in underneath it so the page still feels layered if the image fails.
const BG_SRC = fullscreenBg;

// ---- cross-browser fullscreen helpers -------------------------------------
const getFsElement = () =>
  document.fullscreenElement ||
  document.webkitFullscreenElement ||
  document.msFullscreenElement ||
  null;

const requestFs = (el) => {
  const fn =
    el.requestFullscreen ||
    el.webkitRequestFullscreen ||
    el.msRequestFullscreen;
  // requestFullscreen must be called from a user gesture (the button click)
  return fn ? fn.call(el) : undefined;
};

// maximise / expand-arrows glyph
const ExpandIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M8 3H5a2 2 0 0 0-2 2v3" />
    <path d="M16 3h3a2 2 0 0 1 2 2v3" />
    <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
    <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
  </svg>
);

// Cool underline gesture that echoes the layered atmosphere used elsewhere on
// the page without leaning on warm metallic accents.
const AccentUnderline = ({ className }) => (
  <svg
    viewBox="0 0 240 20"
    className={className}
    fill="none"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <path
      d="M5 11 C 55 4, 120 4, 165 8 C 200 11, 222 9, 235 6"
      stroke="#6f7f95"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d="M22 16 C 80 12, 150 13, 214 13"
      stroke="#4e5157"
      strokeWidth="1.4"
      strokeLinecap="round"
      opacity="0.5"
    />
  </svg>
);

const serif = { fontFamily: "'Times New Roman', Times, serif" };

const Overlay = ({ onEnter }) => (
  <div className="fixed inset-0 z-9999 flex items-center justify-center overflow-hidden">
    {/* Deep atmospheric wash that keeps the page in the requested blue-gray
        family even if the backdrop image is unavailable. */}
    <div
      className="absolute inset-0 bg-[#070B17]"/>

    {/* The backdrop image sits under the wash and quietly falls away if the
        asset is missing. */}
    <img
      src={BG_SRC}
      alt=""
      aria-hidden="true"
      draggable="false"
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
      className="pointer-events-none absolute inset-0 h-full w-full object-cover select-none"
    />

    {/* Subtle vignette to keep the central panel readable. */}
    <div
      className="pointer-events-none absolute inset-0"
      style={{
       
      }}
    />

    {/* the framed cream panel — echoes the sketch-bordered panels of the plan */}
    <div className="fs-rise relative mx-6 w-[min(92vw,32rem)] overflow-hidden rounded-[14px] border border-[rgba(31,42,64,0.18)] bg-[#faf6ed]/88 px-9 py-22 text-center shadow-[0_30px_80px_-32px_rgba(60,50,25,0.55)] backdrop-blur-md sm:px-14">
      {/* fine gold double keyline, like the framed floor-plan sheets */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-2 rounded-[10px] border border-[rgba(117,129,150,0.26)]"
      />
      {/* Cool top sheen. */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-[#4E5157]/18 via-[#2f3e58]/10 to-transparent" />

      <div className="relative flex flex-col items-center">
        {/* Brand mark */}
        <img
          src={brandLogo}
          alt="Notandas Realty"
          className="fs-float mb-7 h-24 w-auto opacity-95"
          draggable="false"
        />

        {/* Serif heading with a cool underline accent. */}
        <div className="relative inline-block">
          <h2
            className="text-3xl tracking-wide text-[#4E5157] italic md:text-[2rem] md:leading-tight"
            style={serif}
          >
            Best Viewed in Full Screen
          </h2>
          <AccentUnderline className="absolute -bottom-7 left-1/2 h-4 w-[78%] -translate-x-1/2" />
        </div>

        {/* Slim divider. */}
        <div className="mt-9 mb-7 flex items-center gap-3" aria-hidden="true">
          {/* <span className="h-px w-12 bg-[rgba(117,129,150,0.45)]" />
          <span className="h-1.5 w-1.5 rotate-45 bg-[#4E5157]" />
          <span className="h-px w-12 bg-[rgba(117,129,150,0.45)]" /> */}
        </div>

        <button
          onClick={onEnter}
          onTouchEnd={onEnter}
          className="group inline-flex items-center gap-2.5 rounded-full border border-[rgba(117,129,150,0.34)] bg-[linear-gradient(180deg,#1A2334_0%,#11192B_100%)] px-9 py-3.5 text-xs font-semibold tracking-[0.26em] text-[#E6EAF0] uppercase shadow-[0_12px_28px_-12px_rgba(0,0,0,0.7)] transition-all duration-300 hover:border-[rgba(152,165,188,0.5)] hover:bg-[linear-gradient(180deg,#202A3E_0%,#151D2F_100%)] hover:shadow-[0_16px_34px_-12px_rgba(0,0,0,0.82)] active:translate-y-px"
          style={serif}
        >
          <ExpandIcon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
          Enter Full Screen
        </button>

        <p className="mt-7 text-[11px] tracking-[0.32em] text-[#6b6f76] uppercase">
          Press Esc to exit
        </p>
      </div>
    </div>
  </div>
);

/**
 * Wraps the app and only reveals it while the browser is in full screen.
 * Whenever the user leaves full screen (Esc / minimise / restore), a themed
 * overlay invites them back to full screen.
 */
const FullscreenGate = ({ children }) => {
  const [isFullscreen, setIsFullscreen] = useState(() => !!getFsElement());
  const [hasEntered, setHasEntered] = useState(() => !!getFsElement());

  useEffect(() => {
    const onChange = () => {
      const fs = !!getFsElement();
      setIsFullscreen(fs);
      if (fs) setHasEntered(true);
    };
    const events = [
      "fullscreenchange",
      "webkitfullscreenchange",
      "MSFullscreenChange",
    ];
    events.forEach((e) => document.addEventListener(e, onChange));
    return () =>
      events.forEach((e) => document.removeEventListener(e, onChange));
  }, []);

  const enterFullscreen = useCallback(() => {
    const p = requestFs(document.documentElement);
    if (!p || !p.catch) {
      setHasEntered(true);
      setIsFullscreen(true);
      return;
    }

    p.catch(() => {
      setHasEntered(true);
      setIsFullscreen(true);
    }); // fall back to app entry on mobile / unsupported browsers
  }, []);

  return (
    <>
      <div
        aria-hidden={!isFullscreen}
        className={isFullscreen ? undefined : "pointer-events-none select-none"}
      >
        {hasEntered && children}
      </div>

      {!isFullscreen && <Overlay onEnter={enterFullscreen} />}
    </>
  );
};

export default FullscreenGate;
