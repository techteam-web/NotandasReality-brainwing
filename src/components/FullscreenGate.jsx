import { useState, useEffect, useCallback } from "react"
import brandLogo from "../assets/notandaslogo.svg"
import fullscreenBg from "../assets/fullscreengatebg.png"

// Watercolour paper backdrop bundled from /src/assets. The CSS wash below
// stands in underneath it so the paper feels continuous if the image fails.
const BG_SRC = fullscreenBg

// ---- cross-browser fullscreen helpers -------------------------------------
const getFsElement = () =>
  document.fullscreenElement ||
  document.webkitFullscreenElement ||
  document.msFullscreenElement ||
  null

const requestFs = (el) => {
  const fn =
    el.requestFullscreen ||
    el.webkitRequestFullscreen ||
    el.msRequestFullscreen
  // requestFullscreen must be called from a user gesture (the button click)
  return fn ? fn.call(el) : undefined
}

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
)

// Hand-drawn gold underline — the same loose double-stroke swoosh used beneath
// the floor titles in the plan overlay (see FloorPlanOverlay design language)
const GoldUnderline = ({ className }) => (
  <svg
    viewBox="0 0 240 20"
    className={className}
    fill="none"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <path
      d="M5 11 C 55 4, 120 4, 165 8 C 200 11, 222 9, 235 6"
      stroke="#c79a3a"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d="M22 16 C 80 12, 150 13, 214 13"
      stroke="#c79a3a"
      strokeWidth="1.4"
      strokeLinecap="round"
      opacity="0.5"
    />
  </svg>
)

const serif = { fontFamily: "'Times New Roman', Times, serif" }

const Overlay = ({ onEnter }) => (
  <div className="fixed inset-0 z-9999 flex items-center justify-center overflow-hidden">
    {/* CSS watercolour wash — stands in until /public/fullscreen_bg.png exists,
        and shows through the panel either way so the paper feels continuous */}
    <div
      className="absolute inset-0 bg-[#f4efe3]"
      style={{
        background:
          "radial-gradient(120% 90% at 88% 8%, rgba(150,182,214,0.30), transparent 42%)," +
          "radial-gradient(90% 80% at 6% 78%, rgba(150,182,214,0.34), transparent 46%)," +
          "radial-gradient(70% 60% at 50% 110%, rgba(214,182,138,0.28), transparent 55%)," +
          "linear-gradient(180deg, #f6f1e7 0%, #f3eee2 55%, #efe7d6 100%)",
      }}
    />

    {/* the actual watercolour sheet (full-bleed). Hides itself cleanly if the
        file hasn't been added yet, falling back to the wash above */}
    <img
      src={BG_SRC}
      alt=""
      aria-hidden="true"
      draggable="false"
      onError={(e) => {
        e.currentTarget.style.display = "none"
      }}
      className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
    />

    {/* gentle cream vignette to seat the panel and keep the text legible */}
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          "radial-gradient(circle at 50% 46%, rgba(246,241,231,0.55), transparent 60%), radial-gradient(circle at 50% 50%, transparent 62%, rgba(70,60,35,0.12))",
      }}
    />

    {/* the framed cream panel — echoes the sketch-bordered panels of the plan */}
    <div className="fs-rise relative mx-6 w-[min(92vw,32rem)] overflow-hidden rounded-[14px] border border-[rgba(31,42,64,0.18)] bg-[#faf6ed]/88 px-9 py-12 text-center shadow-[0_30px_80px_-32px_rgba(60,50,25,0.55)] backdrop-blur-md sm:px-14">
      {/* fine gold double keyline, like the framed floor-plan sheets */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-2 rounded-[10px] border border-[rgba(184,134,11,0.28)]"
      />
      {/* faint gold sheen bleeding down from the top, as in the plan aside */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-[#e8c879]/20 to-transparent" />

      <div className="relative flex flex-col items-center">
        {/* brand mark */}
        <img
          src={brandLogo}
          alt="Notandas Realty"
          className="fs-float mb-7 h-24 w-auto opacity-95"
          draggable="false"
        />

        
        {/* italic serif heading with the hand-drawn gold underline */}
        <div className="relative inline-block">
          <h2
            className="text-3xl italic tracking-wide text-[#1f2a40] md:text-[2.6rem] md:leading-tight"
            style={serif}
          >
            Best Viewed in Full Screen
          </h2>
          <GoldUnderline className="absolute -bottom-3 left-1/2 h-4 w-[78%] -translate-x-1/2" />
        </div>

        {/* slim diamond divider */}
        <div className="mb-6 mt-9 flex items-center gap-3" aria-hidden="true">
          <span className="h-px w-12 bg-[rgba(184,134,11,0.45)]" />
          <span className="h-1.5 w-1.5 rotate-45 bg-[#b8860b]" />
          <span className="h-px w-12 bg-[rgba(184,134,11,0.45)]" />
        </div>


        <button
          onClick={onEnter}
          onTouchEnd={onEnter}
          className="group inline-flex items-center gap-2.5 rounded-full border border-[#b8860b] bg-[#b8860b] px-9 py-3.5 text-xs font-semibold uppercase tracking-[0.26em] text-[#faf6ed] shadow-[0_12px_28px_-12px_rgba(184,134,11,0.7)] transition-all duration-300 hover:border-[#8f6708] hover:bg-[#8f6708] hover:shadow-[0_16px_34px_-12px_rgba(184,134,11,0.8)] active:translate-y-px"
          style={serif}
        >
          <ExpandIcon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
          Enter Full Screen
        </button>

        <p className="mt-7 text-[11px] uppercase tracking-[0.32em] text-[#a89c83]">
          Press Esc to exit
        </p>
      </div>
    </div>
  </div>
)

/**
 * Wraps the app and only reveals it while the browser is in full screen.
 * Whenever the user leaves full screen (Esc / minimise / restore), a themed
 * overlay invites them back to full screen.
 */
const FullscreenGate = ({ children }) => {
  const [isFullscreen, setIsFullscreen] = useState(() => !!getFsElement())
  const [hasEntered, setHasEntered] = useState(() => !!getFsElement())

  useEffect(() => {
    const onChange = () => {
      const fs = !!getFsElement()
      setIsFullscreen(fs)
      if (fs) setHasEntered(true)
    }
    const events = [
      "fullscreenchange",
      "webkitfullscreenchange",
      "MSFullscreenChange",
    ]
    events.forEach((e) => document.addEventListener(e, onChange))
    return () =>
      events.forEach((e) => document.removeEventListener(e, onChange))
  }, [])

  const enterFullscreen = useCallback(() => {
    const p = requestFs(document.documentElement)
    if (!p || !p.catch) {
      setHasEntered(true)
      setIsFullscreen(true)
      return
    }

    p.catch(() => {
      setHasEntered(true)
      setIsFullscreen(true)
    }) // fall back to app entry on mobile / unsupported browsers
  }, [])

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
  )
}

export default FullscreenGate
