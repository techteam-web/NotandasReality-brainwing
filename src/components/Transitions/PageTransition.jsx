import { cloneElement, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import gateBg from "../../assets/fullscreengatebg.png";

gsap.registerPlugin(useGSAP);

/*
  "Ink tide" page transition.

  Three hand-drawn wave bands — Arabian-sea navy, brand gold, ink black —
  roll up over the map like the tide coming in, the gold Notandas wordmark
  flashes while the screen is covered (the route swaps underneath), then
  the tide recedes off the top of the screen.

  Usage (children must be a single <Routes> element):
    <PageTransition>
      <Routes>...</Routes>
    </PageTransition>
*/

const AMP = 7; // wave amplitude (viewBox units)
const BAND = 150; // wave band height — taller than the screen so it always covers
const BELOW = 115; // band parked below the viewport
const COVER = -25; // band fully covering the viewport
const ABOVE = -BAND - 15; // band parked above the viewport

const waveD = (top) => {
  const b = top + BAND;
  return `M 0 ${top} C 30 ${top - AMP} 70 ${top + AMP} 100 ${top} L 100 ${b} C 70 ${b + AMP} 30 ${b - AMP} 0 ${b} Z`;
};

const LAYERS = [
  { color: "#3b5382" }, // Arabian-sea navy leads the tide
  { color: "#DAA520" }, // gold sliver follows
  { color: "#101014" }, // ink black carries the wordmark
];

const PageTransition = ({ children }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);

  const overlayRef = useRef(null);
  const bgRef = useRef(null);
  const emblemRef = useRef(null);
  const underlineRef = useRef(null);
  const pathRefs = useRef([]);
  const proxies = useRef(LAYERS.map(() => ({ top: BELOW })));
  const tlRef = useRef(null);

  const setWave = (i, top) => pathRefs.current[i]?.setAttribute("d", waveD(top));

  const parkBelow = () => {
    proxies.current.forEach((p, i) => {
      p.top = BELOW;
      setWave(i, BELOW);
    });
  };

  // Tide rolls in from the bottom — navy first, ink last
  const addCover = (tl, at) => {
    proxies.current.forEach((p, i) => {
      tl.to(
        p,
        {
          top: COVER,
          duration: 0.85,
          ease: "power3.inOut",
          onUpdate: () => setWave(i, p.top),
        },
        at + i * 0.1
      );
    });
  };

  // Tide pulls away off the top — ink first, navy trailing
  const addReveal = (tl, at) => {
    proxies.current.forEach((p, i) => {
      tl.to(
        p,
        {
          top: ABOVE,
          duration: 0.9,
          ease: "power3.inOut",
          onUpdate: () => setWave(i, p.top),
        },
        at + (LAYERS.length - 1 - i) * 0.1
      );
    });
  };

  const addEmblemIn = (tl, at) => {
    tl.fromTo(
      bgRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.45, ease: "power2.out" },
      at
    );
    tl.fromTo(
      emblemRef.current,
      { opacity: 0, y: 26, filter: "blur(6px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.45, ease: "power2.out" },
      at
    );
    tl.fromTo(
      underlineRef.current,
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: 0.6, ease: "power1.inOut" },
      at + 0.15
    );
  };

  const addEmblemOut = (tl, at) => {
    tl.to(
      emblemRef.current,
      { opacity: 0, y: -22, filter: "blur(5px)", duration: 0.35, ease: "power2.in" },
      at
    );
    tl.to(bgRef.current, { opacity: 0, duration: 0.35, ease: "power2.in" }, at);
  };

  const { contextSafe } = useGSAP(
    () => {
      // Intro: the page loads already under the ink, then the tide pulls away
      tlRef.current?.kill();
      proxies.current.forEach((p, i) => {
        p.top = COVER;
        setWave(i, COVER);
      });
      overlayRef.current.style.pointerEvents = "auto";
      gsap.set(bgRef.current, { opacity: 1 });
      gsap.set(emblemRef.current, { opacity: 1, y: 0, filter: "blur(0px)" });

      const tl = gsap.timeline({
        onComplete: () => {
          overlayRef.current.style.pointerEvents = "none";
          parkBelow();
        },
      });
      tlRef.current = tl;

      tl.fromTo(
        underlineRef.current,
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 0.55, ease: "power1.inOut" },
        0.1
      );
      addEmblemOut(tl, 0.75);
      addReveal(tl, 0.85);
    },
    { scope: overlayRef }
  );

  useEffect(() => {
    if (location.pathname === displayLocation.pathname) return;

    const runTransition = contextSafe((nextLocation) => {
      tlRef.current?.kill();
      parkBelow();

      const tl = gsap.timeline({
        onStart: () => {
          overlayRef.current.style.pointerEvents = "auto";
        },
        onComplete: () => {
          overlayRef.current.style.pointerEvents = "none";
          parkBelow();
        },
      });
      tlRef.current = tl;

      addCover(tl, 0);
      addEmblemIn(tl, 0.55);
      tl.add(() => setDisplayLocation(nextLocation), 1.1); // swap the route behind the ink
      addEmblemOut(tl, 1.5);
      addReveal(tl, 1.6);
    });

    runTransition(location);
  });

  return (
    <>
      {cloneElement(children, { location: displayLocation })}

      <div
        ref={overlayRef}
        className="fixed inset-0 z-100"
        style={{ pointerEvents: "none" }}
        aria-hidden="true"
      >
        {LAYERS.map((layer, i) => (
          <svg
            key={layer.color}
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path
              ref={(el) => (pathRefs.current[i] = el)}
              d={waveD(BELOW)}
              fill={layer.color}
            />
          </svg>
        ))}

        <div
          ref={bgRef}
          className="absolute inset-0 opacity-0"
          style={{
            backgroundImage: `url(${gateBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <div
          ref={emblemRef}
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-0"
        >
          <h2 className="text-[#DAA520] text-2xl md:text-5xl font-semibold tracking-[0.45em] indent-[0.45em]">
            NOTANDAS
          </h2>
          <p className="text-[#DAA520]/80 text-sm md:text-base font-light tracking-[0.7em] indent-[0.7em]">
            REALTY
          </p>
          <svg
            viewBox="0 0 120 20"
            className="w-24 md:w-32 text-[#DAA520] mt-1"
            fill="none"
          >
            <path
              ref={underlineRef}
              pathLength="1"
              d="M4 12 Q 14 4 24 12 T 44 12 T 64 12 T 84 12 T 104 12"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
            />
          </svg>
        </div>
      </div>
    </>
  );
};

export default PageTransition;
