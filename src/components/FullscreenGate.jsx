import { useState, useEffect, useCallback } from "react"

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

const Overlay = ({ onEnter }) => (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-black/85 backdrop-blur-2xl">
    {/* soft golden glow behind the content */}
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          "radial-gradient(circle at 50% 38%, rgba(218,165,32,0.14), transparent 60%)",
      }}
    />

    <div className="relative flex flex-col items-center px-8 text-center">
      {/* pulsing ring + expand glyph */}
      <div className="relative mb-9 flex h-28 w-28 items-center justify-center">
        <span className="fs-ring absolute inset-0 rounded-full border border-[rgba(218,165,32,0.5)]" />
        <span
          className="fs-ring absolute inset-0 rounded-full border border-[rgba(218,165,32,0.5)]"
          style={{ animationDelay: "0.9s" }}
        />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-[rgba(218,165,32,0.6)] bg-[rgba(218,165,32,0.06)]">
          <ExpandIcon className="h-9 w-9 text-[rgb(218,165,32)]" />
        </div>
      </div>

      <h2
        className="mb-3 text-3xl font-semibold tracking-wide text-white md:text-4xl"
        style={{ fontFamily: "'Times New Roman', Times, serif" }}
      >
        Best Viewed in Full Screen
      </h2>

      <p className="mb-9 max-w-md text-sm leading-relaxed text-[#9aa0a6] md:text-base">
        This experience unfolds across the entire canvas. Enter full screen to
        explore the map in its full glory.
      </p>

      <button
        onClick={onEnter}
        className="group relative inline-flex items-center gap-3 rounded-full border border-[rgba(218,165,32,0.6)] bg-[rgba(218,165,32,0.08)] px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-[rgb(218,165,32)] transition-all duration-300 hover:bg-[rgba(218,165,32,0.16)] hover:shadow-[0_0_25px_rgba(218,165,32,0.35)]"
      >
        <ExpandIcon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
        Enter Full Screen
      </button>

      <p className="mt-7 text-xs uppercase tracking-[0.3em] text-[#5a5d61]">
        Press Esc to exit
      </p>
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
    if (p && p.catch) p.catch(() => {}) // ignore rej/unsupported quietly
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
