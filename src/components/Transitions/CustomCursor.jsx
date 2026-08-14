import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

/*
  Site-wide custom cursor.

  Deliberately quiet: a solid ink core dot that stays on the pointer and an
  ink ring that settles in behind it, drawn dark throughout to stand off the
  pale map. Nothing spins, nothing bounces — the ring simply opens up and
  picks up the brand gold over anything clickable, so the pointer reads as a
  precise instrument on a sales tool rather than an effect.

  States (resolved from whatever sits under the pointer):
    idle      ink ring at rest around the dot
    hover     ring opens, thickens and turns gold, dot tucks down
    drag      tightened ring with two chevrons (pano canvases)
    text      ring folds away into a caret bar (inputs, textareas)
    disabled  faded ring, no dot (disabled buttons, .cursor-not-allowed)
    hidden    fades out entirely

  Opt in from any element with data attributes:
    data-cursor="hover | drag | text | disabled | hidden"
    data-cursor-text="Explore"   → small label under the ring

  Only mounts for real mice (hover + fine pointer), so touch devices keep
  their native behaviour, and it honours prefers-reduced-motion by dropping
  the follow lag.

  Usage — mount once, above everything else (see App.jsx):
    <CustomCursor />
*/

const FINE_POINTER = "(hover: hover) and (pointer: fine)";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

// how far under the pointer the optional label rides
const LABEL_OFFSET = 38;

// Anything that should feel clickable opens the ring.
const HOVER_SELECTOR = [
  "a[href]",
  "button",
  '[role="button"]',
  "summary",
  "select",
  "label[for]",
  ".cursor-pointer",
  '[data-cursor="hover"]',
].join(",");

// Look-around surfaces: Marzipano paints the panorama into a <canvas>.
const DRAG_SELECTOR = ["canvas", '[data-cursor="drag"]'].join(",");

const TEXT_SELECTOR = [
  'input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"])',
  "textarea",
  '[contenteditable="true"]',
  '[data-cursor="text"]',
].join(",");

const DISABLED_SELECTOR = [
  "button:disabled",
  '[aria-disabled="true"]',
  ".cursor-not-allowed",
  '[data-cursor="disabled"]',
].join(",");

const HIDDEN_SELECTOR = '[data-cursor="hidden"]';

/*
  Palette lifted from the map / marker / gate components.

  The site is mostly pale — a cream watercolour map and cream panels — so the
  cursor is drawn dark throughout: a deep navy line over a softer near-black
  outer edge that reads as depth rather than an outline.
*/
const INK = "#1F2A40";
const EDGE = "rgba(7,11,23,0.38)";
const GOLD = "#B8860B";

/*
  Per-state tween targets. `ring` scales the ring, `stroke` / `weight` swap
  its colour and thickness — those carry almost the whole cursor.
*/
const STATES = {
  idle: {
    ring: 1,
    ringOpacity: 1,
    stroke: INK,
    weight: 1.8,
    dot: 1,
    bar: 0,
    chevron: 0,
  },
  hover: {
    ring: 1.45,
    ringOpacity: 1,
    stroke: GOLD,
    weight: 2.4,
    dot: 0.55,
    bar: 0,
    chevron: 0,
  },
  drag: {
    ring: 1.2,
    ringOpacity: 1,
    stroke: INK,
    weight: 1.8,
    dot: 0,
    bar: 0,
    chevron: 1,
  },
  text: {
    ring: 0.6,
    ringOpacity: 0,
    stroke: INK,
    weight: 1.8,
    dot: 0,
    bar: 1,
    chevron: 0,
  },
  disabled: {
    ring: 0.9,
    ringOpacity: 0.5,
    stroke: INK,
    weight: 1.5,
    dot: 0,
    bar: 0,
    chevron: 0,
  },
};

const resolveState = (el) => {
  if (!el || typeof el.closest !== "function") return "idle";
  if (el.closest(HIDDEN_SELECTOR)) return "hidden";
  if (el.closest(DISABLED_SELECTOR)) return "disabled";
  if (el.closest(TEXT_SELECTOR)) return "text";
  if (el.closest(DRAG_SELECTOR)) return "drag";
  if (el.closest(HOVER_SELECTOR)) return "hover";
  return "idle";
};

const resolveLabel = (el) => {
  if (!el || typeof el.closest !== "function") return "";
  return el.closest("[data-cursor-text]")?.dataset.cursorText ?? "";
};

const CustomCursor = () => {
  // Real mice only — a phone or a pen never gets the custom cursor.
  const [enabled, setEnabled] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.(FINE_POINTER).matches === true,
  );

  const rootRef = useRef(null);
  const ringRef = useRef(null);
  const dotRef = useRef(null);
  const labelRef = useRef(null);
  const labelTextRef = useRef(null);

  // Imperative handles built inside the gsap context, driven by the listeners.
  const api = useRef({});
  const stateRef = useRef("idle");
  const labelValueRef = useRef("");
  const pressedRef = useRef(false);
  const visibleRef = useRef(false);

  // A mouse can be plugged in (or a tablet docked) mid-session.
  useEffect(() => {
    const mq = window.matchMedia?.(FINE_POINTER);
    if (!mq) return;
    const onChange = (e) => setEnabled(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useGSAP(
    (_context, contextSafe) => {
      if (!enabled || !rootRef.current) return;

      const reduced = window.matchMedia(REDUCED_MOTION).matches;
      const lag = (seconds) => (reduced ? 0.001 : seconds);
      const step = reduced ? 0.001 : 0.32;

      gsap.set([ringRef.current, dotRef.current, labelRef.current], {
        xPercent: -50,
        yPercent: -50,
        x: -400,
        y: -400,
        force3D: true,
      });
      gsap.set(rootRef.current, { opacity: 0 });
      gsap.set(labelRef.current, { opacity: 0, scale: 0.94 });
      gsap.set(".nrc-ring-line, .nrc-bar", { svgOrigin: "60 60" });
      gsap.set(".nrc-bar", { opacity: 0, scaleY: 0.5 });
      gsap.set(".nrc-chevron", { opacity: 0 });

      // The dot is all but glued to the pointer; the ring settles in behind.
      const follow = (el, duration) => ({
        x: gsap.quickTo(el, "x", { duration: lag(duration), ease: "power3" }),
        y: gsap.quickTo(el, "y", { duration: lag(duration), ease: "power3" }),
      });
      const ring = follow(ringRef.current, 0.34);
      const dot = follow(dotRef.current, 0.06);
      const label = follow(labelRef.current, 0.4);
      let primed = false;

      api.current.move = (x, y) => {
        // First sighting: drop the cursor straight onto the pointer instead
        // of flying it in from off-screen.
        if (!primed) {
          primed = true;
          gsap.set([ringRef.current, dotRef.current], { x, y });
          gsap.set(labelRef.current, { x, y: y + LABEL_OFFSET });
          return;
        }
        ring.x(x);
        ring.y(y);
        dot.x(x);
        dot.y(y);
        label.x(x);
        label.y(y + LABEL_OFFSET);
      };

      api.current.state = contextSafe((next) => {
        if (next === stateRef.current) return;
        stateRef.current = next;

        const s = STATES[next] ?? STATES.idle;
        const ease = "power3.out";

        gsap.to(".nrc-ring-line", {
          scale: s.ring * (pressedRef.current ? 0.88 : 1),
          opacity: s.ringOpacity,
          duration: step,
          ease,
        });
        gsap.to(".nrc-ring-stroke", {
          stroke: s.stroke,
          strokeWidth: s.weight,
          duration: step,
          ease,
        });
        gsap.to(".nrc-bar", {
          opacity: s.bar,
          scaleY: s.bar ? 1 : 0.5,
          duration: step * 0.7,
          ease,
        });
        gsap.to(".nrc-chevron", {
          opacity: s.chevron,
          x: (i) => (s.chevron ? 0 : i === 0 ? 6 : -6),
          duration: step,
          ease,
        });
        gsap.to(dotRef.current, {
          scale: s.dot * (pressedRef.current ? 1.4 : 1),
          duration: step,
          ease,
        });
      });

      api.current.press = contextSafe((down) => {
        if (pressedRef.current === down) return;
        pressedRef.current = down;

        const s = STATES[stateRef.current] ?? STATES.idle;
        const duration = reduced ? 0.001 : 0.22;
        gsap.to(".nrc-ring-line", {
          scale: s.ring * (down ? 0.88 : 1),
          duration,
          ease: "power2.out",
        });
        gsap.to(dotRef.current, {
          scale: s.dot * (down ? 1.4 : 1),
          duration,
          ease: "power2.out",
        });
      });

      api.current.show = contextSafe((visible) => {
        if (visibleRef.current === visible) return;
        visibleRef.current = visible;
        gsap.to(rootRef.current, {
          opacity: visible ? 1 : 0,
          duration: reduced ? 0.001 : visible ? 0.3 : 0.2,
          ease: "power2.out",
        });
      });

      api.current.label = contextSafe((text) => {
        if (text === labelValueRef.current) return;
        labelValueRef.current = text;

        if (!text) {
          gsap.to(labelRef.current, {
            opacity: 0,
            scale: 0.94,
            duration: reduced ? 0.001 : 0.18,
            ease: "power2.in",
          });
          return;
        }
        labelTextRef.current.textContent = text;
        gsap.to(labelRef.current, {
          opacity: 1,
          scale: 1,
          duration: reduced ? 0.001 : 0.28,
          ease: "power3.out",
        });
      });
    },
    { scope: rootRef, dependencies: [enabled] },
  );

  useEffect(() => {
    if (!enabled || !rootRef.current) return;

    // Hide the native pointer only while our cursor is actually up.
    const html = document.documentElement;
    html.classList.add("nrc-active");

    let lastTarget = null;

    const sync = (target) => {
      const el = target instanceof Element ? target : null;
      const next = resolveState(el);
      api.current.show?.(next !== "hidden");
      api.current.state?.(next === "hidden" ? "idle" : next);
      api.current.label?.(next === "hidden" ? "" : resolveLabel(el));
    };

    const onMove = (e) => {
      if (e.pointerType === "touch") return;
      api.current.move?.(e.clientX, e.clientY);
      if (e.target !== lastTarget) {
        lastTarget = e.target;
        sync(e.target);
      } else if (!visibleRef.current) {
        api.current.show?.(stateRef.current !== "hidden");
      }
    };

    // Content that appears *under* a resting pointer (tooltips, route swaps)
    // still fires pointerover, so the cursor keeps up without a move.
    const onOver = (e) => {
      if (e.pointerType === "touch" || e.target === lastTarget) return;
      lastTarget = e.target;
      sync(e.target);
    };

    const onDown = (e) => {
      if (e.pointerType === "touch") return;
      api.current.press?.(true);
    };
    const onUp = () => api.current.press?.(false);

    // relatedTarget is null when the pointer genuinely leaves the window.
    const onLeave = (e) => {
      if (e.relatedTarget) return;
      api.current.show?.(false);
    };
    const onBlur = () => {
      api.current.press?.(false);
      api.current.show?.(false);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
    window.addEventListener("blur", onBlur);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      html.classList.remove("nrc-active");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <style>{`
        html.nrc-active,
        html.nrc-active *,
        html.nrc-active *::before,
        html.nrc-active *::after { cursor: none !important; }
      `}</style>

      <div
        ref={rootRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-99999 select-none"
        style={{ opacity: 0 }}
      >
        {/* ── the ring: settles in a beat behind the pointer ── */}
        <div
          ref={ringRef}
          className="absolute top-0 left-0 h-30 w-30 will-change-transform"
        >
          <svg viewBox="0 0 120 120" className="h-full w-full" fill="none">
            <g className="nrc-ring-line">
              {/* softer near-black edge under the ink line — gives the ring
                  weight on the pale map without an outline around it */}
              <circle
                cx="60"
                cy="60"
                r="16"
                stroke={EDGE}
                strokeWidth="4.4"
                vectorEffect="non-scaling-stroke"
              />
              <circle
                className="nrc-ring-stroke"
                cx="60"
                cy="60"
                r="16"
                stroke={INK}
                strokeWidth="1.8"
                vectorEffect="non-scaling-stroke"
              />
            </g>

            {/* caret bar for editable text */}
            <g className="nrc-bar">
              <rect x="57" y="45" width="6" height="30" rx="3" fill={EDGE} />
              <rect
                x="58.8"
                y="46.5"
                width="2.4"
                height="27"
                rx="1.2"
                fill={INK}
              />
            </g>

            {/* ↔ chevrons on look-around surfaces */}
            <g className="nrc-chevron">
              <path
                d="M36 52 L30 60 L36 68"
                stroke={EDGE}
                strokeWidth="4.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M36 52 L30 60 L36 68"
                stroke={INK}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </g>
            <g className="nrc-chevron">
              <path
                d="M84 52 L90 60 L84 68"
                stroke={EDGE}
                strokeWidth="4.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M84 52 L90 60 L84 68"
                stroke={INK}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          </svg>
        </div>

        {/* ── the core dot: stays on the pointer ── */}
        <div
          ref={dotRef}
          className="absolute top-0 left-0 h-2 w-2 rounded-full will-change-transform"
          style={{
            backgroundColor: INK,
            boxShadow: `0 0 0 1.5px ${EDGE}, 0 1px 5px rgba(7,11,23,0.4)`,
          }}
        />

        {/* ── optional label, from data-cursor-text ── */}
        <div
          ref={labelRef}
          className="absolute top-0 left-0 rounded-sm border border-[#8ea2bf]/25 bg-[#070B17]/88 px-2.5 py-1 whitespace-nowrap backdrop-blur-[2px] will-change-transform"
          style={{ opacity: 0 }}
        >
          <span
            ref={labelTextRef}
            className="text-[9px] tracking-[0.22em] text-[#E6EAF0] uppercase"
            style={{ fontFamily: "'Times New Roman', Times, serif" }}
          />
        </div>
      </div>
    </>
  );
};

export default CustomCursor;
