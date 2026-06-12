import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import shipSvg from "../../assets/svgs/ship-cruiser-passenger-svgrepo-com.svg";

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

// Palm island with its own little water line (fill-based)
const PalmIsland = ({ className }) => (
  <svg viewBox="0 0 32 32" className={className} xmlns="http://www.w3.org/2000/svg">
    <g fill="currentColor">
      <path d="M1.9,15.542a3.352,3.352,0,0,0,3.015,2.4h.022a6.284,6.284,0,0,0,2.387,1.731.345.345,0,0,0,.147.032.354.354,0,0,0,.345-.434c-.284-1.226-.8-4.73.229-5.66l0,0c.051.045,5.033,4.507,4.752,9.912a5.041,5.041,0,0,0-.482.378,4.817,4.817,0,0,0-5.166,2.724.355.355,0,0,0,.168.472.353.353,0,0,0,.472-.167,4.1,4.1,0,0,1,4.569-2.3.357.357,0,0,0,.341-.108,3.675,3.675,0,0,1,.687-.543l0,0a7.056,7.056,0,0,1,5.243-.749c4.639.993,5.694,3.652,5.7,3.679A.354.354,0,0,0,25,26.662c-.045-.123-1.17-3.045-6.227-4.128a10.5,10.5,0,0,0-1.413-.172.334.334,0,0,0,.019-.094c0-7.907,2.873-11.337,3.6-12.076,3.588,1.769,1.7,6.419,1.62,6.62a.354.354,0,0,0,.535.424c2.066-1.508,3.274-3.017,3.634-4.5a1.412,1.412,0,0,0,.183.025,2.261,2.261,0,0,0,1.742-1.075,3.482,3.482,0,0,0,.086-4A4.9,4.9,0,0,0,23,5.938a4.921,4.921,0,0,0-5.171-4.292,3.523,3.523,0,0,0-3.61,2.518.257.257,0,0,0,0,.048,3.2,3.2,0,0,0-.316.126,3.289,3.289,0,0,0-1.673,2.54,3.81,3.81,0,0,0-2.293-.045,5.891,5.891,0,0,0-3.1,2.839,3.214,3.214,0,0,0-4.21-.379c-1.529,1.231-.815,3.852-.785,3.963a.35.35,0,0,0,.109.159A3.667,3.667,0,0,0,1.9,15.542Zm14.773,6.726a.363.363,0,0,0,.02.1,7.362,7.362,0,0,0-3.179.734c.013-4.96-3.839-8.923-4.788-9.819,2.808-.887,5.076,2.941,5.1,2.982a.355.355,0,0,0,.66-.153,9.1,9.1,0,0,0-.066-2.047.34.34,0,0,0,.291-.161c.028-.048,2.721-4.543,5.542-3.978C19.206,11.085,16.674,14.674,16.674,22.268Zm-2.456-17.3c1.984-.99,5.448.935,5.483.955a.354.354,0,0,0,.348-.617c-.132-.075-2.807-1.558-5.033-1.287a2.816,2.816,0,0,1,2.807-1.67,4.25,4.25,0,0,1,4.524,4.084.355.355,0,0,0,.506.311A4.283,4.283,0,0,1,28.2,8.091a2.744,2.744,0,0,1-.081,3.185,1.488,1.488,0,0,1-1.242.757c0-.1.022-.2.02-.292a4.971,4.971,0,0,0-2.582-3.935.354.354,0,1,0-.5.5,1.2,1.2,0,0,0,.136.1,4.3,4.3,0,0,1,2.239,3.346c.026,1.344-.844,2.761-2.589,4.222.428-1.755.745-5.114-2.538-6.542-2.793-1.213-5.4,1.857-6.462,3.352-.3-2.016-.007-3.447.864-4.259,1.386-1.29,3.857-.608,3.882-.6a.355.355,0,0,0,.2-.682c-.118-.033-2.877-.8-4.558.763a3.224,3.224,0,0,0-.388.436,3.814,3.814,0,0,0-1.022-.962,6.064,6.064,0,0,0-.677-.35A2.684,2.684,0,0,1,14.218,4.973ZM3.066,9.846c1.713-1.367,3.53.571,3.606.654a.354.354,0,0,0,.586-.1A5.652,5.652,0,0,1,10.146,7.51a3.608,3.608,0,0,1,3.05.573A3.224,3.224,0,0,1,14.2,9.13a6.352,6.352,0,0,0-.366,3.18,3.526,3.526,0,0,0-.865-1.021c-1.823-1.436-4.529-.6-4.643-.56a.355.355,0,0,0-.23.445.352.352,0,0,0,.445.23c.024-.008,2.458-.764,3.989.441a3.961,3.961,0,0,1,1.27,3.124c-1.251-1.6-3.479-3.351-5.887-2.125-1.638.834-1.22,4.3-.937,5.866a3.537,3.537,0,0,1-2.02-2.359C4.672,14.636,6.367,13,6.384,12.988a.354.354,0,0,0-.487-.515c-.082.077-1.984,1.9-1.638,3.991a3.1,3.1,0,0,0,.2.67A2.458,2.458,0,0,1,2.59,15.375a2.714,2.714,0,0,1,.271-2.229A4.014,4.014,0,0,1,5.3,11.717a.354.354,0,0,0-.108-.7,4.825,4.825,0,0,0-2.764,1.549A2.971,2.971,0,0,1,3.066,9.846Z" />
      <path className="ms-palm-wave" d="M30,29.646A3.665,3.665,0,0,1,26.866,27.5a.26.26,0,0,0-.029-.042.343.343,0,0,0-.047-.066,95.131,95.131,0,0,0-.109-.075h-.007a.313.313,0,0,0-.044-.01.348.348,0,0,0-.228.012h0c-.008,0-.013.011-.021.015a.249.249,0,0,0-.128.121.285.285,0,0,0-.034.049,3.651,3.651,0,0,1-3.1,2.147A3.667,3.667,0,0,1,19.979,27.5a.491.491,0,0,0-.789,0,3.651,3.651,0,0,1-3.1,2.147A3.665,3.665,0,0,1,12.953,27.5a.3.3,0,0,0-.029-.041.288.288,0,0,0-.047-.067.39.39,0,0,0-.059-.041.339.339,0,0,0-.05-.034l-.007,0c-.014,0-.029,0-.044-.009a.351.351,0,0,0-.229.012h0c-.008,0-.012.01-.02.014a.366.366,0,0,0-.09.063.392.392,0,0,0-.039.058.293.293,0,0,0-.034.05,3.651,3.651,0,0,1-3.1,2.147A3.665,3.665,0,0,1,6.066,27.5a.348.348,0,0,0-.411-.193.349.349,0,0,0-.418.2,3.648,3.648,0,0,1-3.1,2.147.354.354,0,1,0,0,.708,4.141,4.141,0,0,0,3.521-2.135A4.2,4.2,0,0,0,9.2,30.354a4.088,4.088,0,0,0,3.433-1.995,4.143,4.143,0,0,0,3.454,1.995,4.127,4.127,0,0,0,3.5-2.1,4.184,4.184,0,0,0,3.524,2.1,4.088,4.088,0,0,0,3.433-1.995A4.143,4.143,0,0,0,30,30.354a.354.354,0,1,0,0-.708Z" />
    </g>
  </svg>
);

// Pine / deciduous trees for the inland side (fill-based)
const Trees = ({ className }) => (
  <svg viewBox="0 0 32 32" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      fill="currentColor"
      d="M30.115,21.505c-1.6-.574-3.551-2.592-4.466-3.613a6.15,6.15,0,0,0,3.179-1.433.353.353,0,0,0-.16-.61c-1.646-.357-3.369-2.506-4.095-3.505a7,7,0,0,0,3.013-1.326.354.354,0,0,0-.135-.622c-3.779-.932-5.277-6.182-5.292-6.235a.354.354,0,0,0-.019-.039.318.318,0,0,0-.031-.061.4.4,0,0,0-.046-.054.363.363,0,0,0-.047-.041.339.339,0,0,0-.066-.033c-.014,0-.024-.015-.038-.019s-.016,0-.024,0a.355.355,0,0,0-.066,0,.29.29,0,0,0-.078,0,.148.148,0,0,0-.021,0c-.013,0-.022.013-.035.017a.378.378,0,0,0-.069.036.293.293,0,0,0-.046.04.3.3,0,0,0-.047.053.368.368,0,0,0-.031.063.269.269,0,0,0-.019.038c-.013.045-1.225,4.292-4.222,5.824A6.177,6.177,0,0,0,17.4,8.74a5.906,5.906,0,0,0-5.666-6.107A5.711,5.711,0,0,0,6.269,7.156,5.677,5.677,0,0,0,1.65,12.977a5.91,5.91,0,0,0,3.307,5.451,5.015,5.015,0,0,0,4.89,4.4,4.3,4.3,0,0,0,.623-.054v4.084a46.7,46.7,0,0,0-7.232,1.813.355.355,0,0,0,.113.691.338.338,0,0,0,.112-.019c15.585-5.231,25.708-.075,25.808-.022A.355.355,0,0,0,29.6,28.7a23.964,23.964,0,0,0-6.378-1.891V23.84a21.922,21.922,0,0,0,6.918-1.679.354.354,0,0,0-.027-.656ZM12.92,18.6v7.924c-.568.06-1.15.137-1.741.225V11.915c1.149-.395,2.85-1.53,2.443-3.562a.354.354,0,1,0-.7.139,2.357,2.357,0,0,1-1.593,2.59,4.508,4.508,0,0,0-1.306-4.2.354.354,0,1,0-.459.539,3.892,3.892,0,0,1,.918,4.125.377.377,0,0,0-.01.088c0,.008-.007.014-.007.022V15.27A4.6,4.6,0,0,1,6.5,12.591a.354.354,0,0,0-.649.284,5.392,5.392,0,0,0,4.612,3.111h.006V22.06a3.681,3.681,0,0,1-.623.064,4.321,4.321,0,0,1-4.211-3.98.354.354,0,0,0-.223-.293,5.164,5.164,0,0,1-3.054-4.874A4.927,4.927,0,0,1,6.584,7.836a.354.354,0,0,0,.32-.282,5.036,5.036,0,0,1,4.828-4.212,5.2,5.2,0,0,1,4.957,5.4,5.737,5.737,0,0,1-.319,1.852.355.355,0,0,0,.228.45A5.306,5.306,0,0,1,20.161,16.2a5.2,5.2,0,0,1-4.957,5.4,4.393,4.393,0,0,1-1.575-.314V18.926a4.3,4.3,0,0,0,3.862-3.245.354.354,0,0,0-.7-.126,3.589,3.589,0,0,1-3.545,2.7A.355.355,0,0,0,12.92,18.6Zm7.241,7.821a38.46,38.46,0,0,0-6.532.036V22.018A5.066,5.066,0,0,0,15.2,22.3c.155,0,.306-.012.458-.025a11.791,11.791,0,0,0,4.5,1.484Zm2.354.27c-.522-.078-1.072-.147-1.645-.206V23.832c.4.031.8.051,1.2.051.15,0,.3-.007.445-.011ZM16.767,22.06a6.065,6.065,0,0,0,4.1-5.865,6.06,6.06,0,0,0-3.375-5.54c2.414-1.186,3.75-3.855,4.322-5.315.6,1.546,2.057,4.456,4.744,5.514a5.165,5.165,0,0,1-2.629.816.316.316,0,0,0-.32.179.356.356,0,0,0,.01.367c.09.14,2.041,3.148,4.218,4.1a4.418,4.418,0,0,1-2.933.849.345.345,0,0,0-.36.174.354.354,0,0,0,.033.4A19.779,19.779,0,0,0,29.1,21.814C27.092,22.557,21.426,24.27,16.767,22.06Z"
    />
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

      // 7. The palm island's own little water line laps back and forth
      gsap.to(".ms-palm-wave", {
        x: 1.2,
        duration: 2.4,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: 3,
      });

      // 8. Open-sea waves drift sideways forever
      gsap.to(".ms-wave", {
        x: 12,
        duration: 4,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        stagger: 0.6,
        delay: 3,
      });
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
      <div className="ms-wave absolute top-[42%] left-[4%] w-16 text-[#5b77a8] opacity-50">
        <Wave className="w-full h-auto" />
      </div>
      <div className="ms-wave absolute top-[68%] left-[31%] w-24 text-[#5b77a8] opacity-60">
        <Wave className="w-full h-auto" />
      </div>
      <div className="ms-wave absolute top-[88%] left-[10%] w-20 text-[#5b77a8] opacity-50">
        <Wave className="w-full h-auto" />
      </div>
      <div className="ms-wave absolute top-[88%] left-[10%] w-20 text-[#5b77a8] opacity-50">
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

      {/* ---------------- Land side (right of the coastline) ---------------- */}

      {/* Juhu beach palms, right on the shoreline */}
      <div className="ms-grow ms-sway absolute top-[24%] left-[42%] w-12 md:w-16 text-[#5c6657]">
        <PalmIsland className="w-full h-auto" />
      </div>
      <div className="ms-grow ms-sway absolute top-[84%] left-[36%] w-12 md:w-16 text-[#5c6657]">
        <PalmIsland className="w-full h-auto" />
      </div>

      {/* inland green pocket below Vile Parle */}
      <div className="ms-grow ms-sway absolute top-[60%] left-[66%] w-10 md:w-14 text-[#5c6657]">
        <Trees className="w-full h-auto" />
      </div>

      {/* Bandra greens near the southern coast */}
      <div className="ms-grow ms-sway absolute top-[84%] left-[55%] w-9 md:w-12 text-[#5c6657]">
        <Trees className="w-full h-auto" />
      </div>
    </div>
  );
};

export default MapScene;
