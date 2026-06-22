import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import shipSvg from "../../assets/svgs/ship-cruiser-passenger-svgrepo-com.svg";
import beachImg from "../../assets/beach_1.png";
import palmTreeImg from "../../assets/tree_1.png";
import forestImg from "../../assets/tree_2.png";
import seaLinkImg from "../../assets/Bandra_sea_link_.png";

/* ----------------------------- SVG artwork ----------------------------- */

// Hand-sketched sailboat (stroke-based, drawn in with GSAP)
const SailBoat = ({ className }) => (
  <svg viewBox="0 0 400 400" className={className} xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="currentColor" strokeWidth="6.8" strokeLinecap="round" strokeLinejoin="round">
      <path className="ms-draw" d="M220.834 34C192.114 112.977 165.587 197.056 118.632 267.644C115.859 271.81 93.6893 300.065 95.4753 303.649C96.2613 305.225 123.514 294.565 126.614 294.049C154.085 289.458 186.625 295.479 212.847 302.048" />
      <path className="ms-draw" d="M222.183 39.3965C239.934 129.776 222.953 221.733 222.953 311.903" />
      <path className="ms-draw" d="M242.742 110.896C255.726 179.101 247.963 245.97 228.928 311.902" />
      <path className="ms-draw" d="M242.418 118.99C271.634 175.716 300.427 242.775 300.427 307.856" />
      <path className="ms-draw" d="M232.975 304.762C255.403 299.129 272.032 304.198 290.983 315.949" />
      <path className="ms-draw" d="M94.0234 334.836C165.065 328.376 237.876 339.889 305.823 317.299" />
      <path className="ms-draw" d="M308.521 324.043C306.065 331.934 302.677 338.96 297.729 345.628" />
      <path className="ms-draw" d="M92 340.232C92 346.078 92 351.924 92 357.77" />
      <path className="ms-draw" opacity="0.5" d="M98.0703 362.076C100.77 360.199 105.672 356.48 109.115 356.48C116.875 356.48 123.729 367.371 132.055 363.943C136.409 362.147 138.728 355.572 143.95 354.613C152.751 353.006 185.23 367.346 188.98 364.877C194.745 361.077 228.782 356.48 248.173 363.943C255.862 366.902 291.77 349.948 297.728 351.817" />
      <path className="ms-draw" d="M137.193 319.762C142.107 295.621 208.692 296.057 208.692 325.393" />
    </g>
  </svg>
);

// A single scribbled gull — one quick "m" stroke plus a faint pencil overdraw
const DoodleBird = ({ transform, glide = false }) => (
  <g className="ms-bird" transform={transform}>
    {glide ? (
      <>
        <path d="M0 11 Q9 4 16 12 Q20 15 24 12 Q31 4 40 9" />
        <path d="M3 12 Q10 7 15 13" opacity="0.4" strokeWidth="3" />
      </>
    ) : (
      <>
        <path d="M1 16 Q8 3 15 10 Q19 14 23 11 Q28 2 38 8" />
        <path d="M25 11 Q30 5 36 10" opacity="0.4" strokeWidth="3" />
      </>
    )}
  </g>
);

// Doodle-sketched flock — loose scribble gulls drifting in a ragged V
const Flock = ({ className }) => (
  <svg viewBox="0 0 220 150" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
      <DoodleBird transform="translate(8 56) scale(1.15)" />
      <DoodleBird transform="translate(64 22) scale(0.9) rotate(-8)" glide />
      <DoodleBird transform="translate(76 88) scale(0.95) rotate(6)" />
      <DoodleBird transform="translate(122 8) scale(0.7) rotate(-5)" />
      <DoodleBird transform="translate(134 58) scale(0.78)" glide />
      <DoodleBird transform="translate(154 112) scale(0.62) rotate(9)" glide />
      <DoodleBird transform="translate(186 36) scale(0.52) rotate(-10)" />
      {/* tiny motion squiggles trailing the flock */}
      <path d="M204 70 q6 -2 10 1" opacity="0.3" strokeWidth="3" />
      <path d="M196 96 q5 2 9 0" opacity="0.3" strokeWidth="3" />
    </g>
  </svg>
);

// Two hand-scribbled gulls hovering near the coast
const Gulls = ({ className }) => (
  <svg viewBox="0 0 120 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 34 Q20 14 36 26 Q41 30 46 27 Q58 12 76 22" />
      <path d="M10 36 Q21 22 33 29" opacity="0.4" strokeWidth="2.4" />
      <path d="M58 56 Q68 44 78 51 Q82 54 86 52 Q94 42 106 48" strokeWidth="2.6" />
    </g>
  </svg>
);

// Hand-drawn wave squiggle for the open sea
const Wave = ({ className }) => (
  <svg viewBox="0 0 120 20" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      className="ms-wave-path"
      d="M4 12 Q 14 4 24 12 T 44 12 T 64 12 T 84 12 T 104 12"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

/* ------------------------------- The scene ------------------------------ */

const MapScene = () => {
  const rootRef = useRef(null);

  useGSAP(
    () => {
      // 1. "Sketch" the boat in, stroke by stroke, like ink being drawn
      const sketchPaths = gsap.utils.toArray(".ms-draw, .ms-wave-path");
      sketchPaths.forEach((p) => {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      });
      gsap.to(".ms-draw", {
        strokeDashoffset: 0,
        duration: 1.8,
        ease: "power1.inOut",
        stagger: 0.18,
        delay: 0.8,
      });
      gsap.to(".ms-wave-path", {
        strokeDashoffset: 0,
        duration: 2.2,
        ease: "power1.inOut",
        stagger: 0.4,
        delay: 1.4,
      });

      // 2. Sailboat bobs gently on the swell once it is drawn
      gsap.to(".ms-boat", {
        y: -8,
        rotation: 3,
        duration: 2.8,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: 3,
      });

      // 3. Cruise ship steams slowly across the Arabian Sea while bobbing
      gsap.fromTo(
        ".ms-ship",
        { opacity: 0, x: -30 },
        { opacity: 0.85, x: 0, duration: 2, ease: "power2.out", delay: 1.5 }
      );
      gsap.to(".ms-ship", {
        x: 60,
        duration: 28,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: 3.5,
      });
      gsap.to(".ms-ship", {
        y: -5,
        rotation: 1.2,
        duration: 3.4,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });

      // 4. Flock of birds journeys from the land out over the sea, again and again
      const flockTl = gsap.timeline({ repeat: -1, repeatDelay: 5, delay: 2 });
      flockTl
        .set(".ms-flock", { x: "10vw", y: 0 })
        .to(".ms-flock", { opacity: 0.75, duration: 2, ease: "none" }, 0)
        .to(".ms-flock", { x: "-30vw", y: "3vh", duration: 24, ease: "none" }, 0)
        .to(".ms-flock", { opacity: 0, duration: 2.5 }, 21);
      // each scribbled bird flaps on its own beat
      gsap.to(".ms-bird", {
        scaleY: 0.7,
        transformOrigin: "50% 50%",
        duration: 0.5,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        stagger: { each: 0.13, from: "random" },
      });

      // 5. Gulls hover near the coastline
      gsap.fromTo(
        ".ms-gulls",
        { opacity: 0, y: 10 },
        { opacity: 0.7, y: 0, duration: 2, ease: "power2.out", delay: 2.5 }
      );
      gsap.to(".ms-gulls", {
        y: -10,
        x: 14,
        duration: 4,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: 4,
      });

      // 6. Palms and trees grow up from the ground, then sway in the breeze
      gsap.fromTo(
        ".ms-grow",
        { scale: 0, opacity: 0, transformOrigin: "50% 100%" },
        {
          scale: 1,
          opacity: 0.8,
          duration: 1.4,
          ease: "back.out(1.7)",
          stagger: 0.3,
          delay: 1.2,
        }
      );
      gsap.to(".ms-sway", {
        rotation: 2,
        transformOrigin: "50% 100%",
        duration: 3.2,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        stagger: 0.5,
        delay: 2.8,
      });

      // 7. Open-sea waves drift sideways forever
      // gsap.to(".ms-wave", {
      //   x: 12,
      //   duration: 4,
      //   repeat: -1,
      //   ease: "sine.inOut",
      //   stagger: 0.6,
      //   delay: 3,
      // });
    },
    { scope: rootRef }
  );

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* ---------------- Sea side (Arabian Sea, left of the coastline) ---------------- */}

      <div className="ms-boat absolute top-[10%] left-[20%] w-20 md:w-28 text-[#41526e] opacity-90 drop-shadow-[0_2px_4px_rgba(59,83,130,0.25)]">
        <SailBoat className="w-full h-auto" />
      </div>
      <div className="ms-boat absolute top-[70%] left-[7%] w-20 md:w-28 text-[#41526e] opacity-90 drop-shadow-[0_2px_4px_rgba(59,83,130,0.25)]">
        <SailBoat className="w-full h-auto" />
      </div>

      <div className="ms-ship absolute top-[58%] left-[22%] w-20 md:w-28 opacity-0">
        <img src={shipSvg} alt="" className="w-full h-auto opacity-80" />
      </div>

      {/* drifting hand-drawn swells scattered over the open water */}
      <div className="ms-wave absolute top-[26%] left-[24%] w-20 text-[#5b77a8] opacity-60">
        <Wave className="w-full h-auto" />
      </div>
      <div className="ms-wave absolute top-[16%] left-[32%] w-20 text-[#5b77a8] opacity-60">
        <Wave className="w-full h-auto" />
      </div>
      <div className="ms-wave absolute top-[42%] left-[4%] w-16 text-[#5b77a8] opacity-50">
        <Wave className="w-full h-auto" />
      </div>
      <div className="ms-wave absolute top-[68%] left-[31%] w-24 text-[#5b77a8] opacity-60">
        <Wave className="w-full h-auto" />
      </div>
      <div className="ms-wave absolute top-[88%] left-[15%] w-20 text-[#5b77a8] opacity-50">
        <Wave className="w-full h-auto" />
      </div>
      <div className="ms-wave absolute top-[95%] left-[25%] w-20 text-[#5b77a8] opacity-50">
        <Wave className="w-full h-auto" />
      </div>
      <div className="ms-wave absolute top-[38%] left-[10%] w-20 text-[#5b77a8] opacity-50">
        <Wave className="w-full h-auto" />
      </div>
      <div className="ms-wave absolute top-[48%] left-[10%] w-20 text-[#5b77a8] opacity-50">
        <Wave className="w-full h-auto" />
      </div>

      {/* ---------------- Sky ---------------- */}

      <div className="ms-flock absolute top-[6%] left-[52%] w-14 md:w-20 text-[#4E5157] opacity-0">
        <Flock className="w-full h-auto" />
      </div>
      <div className="ms-flock absolute top-[88%] left-[22%] w-14 md:w-20 text-[#4E5157] opacity-0">
        <Flock className="w-full h-auto" />
      </div>

      <div className="ms-gulls absolute top-[30%] left-[28%] w-10 md:w-14 text-[#41526e] opacity-0">
        <Gulls className="w-full h-auto" />
      </div>
      <div className="ms-gulls absolute top-[50%] left-[28%] w-10 md:w-14 text-[#41526e] opacity-0">
        <Gulls className="w-full h-auto" />
      </div>
      <div className="ms-gulls absolute top-[10%] left-[15%] w-10 md:w-14 text-[#41526e] opacity-0">
        <Gulls className="w-full h-auto" />
      </div>

      {/* ---------------- Land side (right of the coastline) ---------------- */}

      {/* Juhu beach scene, right on the shoreline */}
      <div className="ms-grow absolute top-[14%] left-[37%] w-28 md:w-40">
        <img src={beachImg} alt="" className="w-full h-auto mix-blend-multiply" />
      </div>

      {/* coastal palms further down the shoreline */}
      <div className="ms-grow ms-sway absolute top-[5%] left-[73%] w-12 md:w-16">
        <img src={palmTreeImg} alt="" className="w-full h-auto mix-blend-multiply" />
      </div>
      <div className="ms-grow ms-sway absolute top-[6%] left-[41%] w-12 md:w-16">
        <img src={palmTreeImg} alt="" className="w-full h-auto mix-blend-multiply" />
      </div>
      <div className="ms-grow ms-sway absolute top-[60%] left-[43%] w-12 md:w-16">
        <img src={palmTreeImg} alt="" className="w-full h-auto mix-blend-multiply" />
      </div>

      {/* inland green pocket below Vile Parle */}
      <div className="ms-grow ms-sway absolute top-[11%] left-[86%] w-20 md:w-28">
        <img src={forestImg} alt="" className="w-full h-auto mix-blend-multiply" />
      </div>
      <div className="ms-grow ms-sway absolute top-[81%] left-[86%] w-20 md:w-28">
        <img src={forestImg} alt="" className="w-full h-auto mix-blend-multiply" />
      </div>
      <div className="ms-grow ms-sway absolute top-[71%] left-[73%] w-20 md:w-28">
        <img src={forestImg} alt="" className="w-full h-auto mix-blend-multiply" />
      </div>

      {/* Bandra greens near the southern coast */}
      <div className="ms-grow ms-sway absolute top-[82%] left-[56%] w-16 md:w-20">
        <img src={forestImg} alt="" className="w-full h-auto mix-blend-multiply" />
      </div>
      <div className="ms-grow ms-sway absolute top-[92%] left-[66%] w-16 md:w-20">
        <img src={forestImg} alt="" className="w-full h-auto mix-blend-multiply" />
      </div>

      {/* Bandra–Worli Sea Link reaching out over the water */}
      <div className="ms-grow absolute top-[80%] left-[36%] w-40 md:w-56">
        <img src={seaLinkImg} alt="" className="w-full h-auto mix-blend-multiply" />
      </div>
    </div>
  );
};

export default MapScene;
