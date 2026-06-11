import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

const AnimatedPlane = ({ className }) => {
  const containerRef = useRef(null);
  const planeRef = useRef(null);
  const pathRef = useRef(null);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      // 1. Creative Flight Path intro animation
      gsap.fromTo(
        planeRef.current,
        {
          x: -300,
          y: 200,
          scale: 0.2,
          rotation: -30,
          opacity: 0,
        },
        {
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
          opacity: 1,
          duration: 2.5,
          ease: "power3.out",
          delay: 0.5,
        }
      );

      // 2. Continuous slight hovering/floating effect after landing
      gsap.to(planeRef.current, {
        y: "-=10",
        x: "+=5",
        rotation: "+=2",
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 3, // start after the intro flight
      });

      // 3. "Pencil in" the plane, stroke by stroke, while it flies in
      const sketchPaths = gsap.utils.toArray(".ap-sketch");
      sketchPaths.forEach((p) => {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      });
      gsap.to(".ap-sketch", {
        strokeDashoffset: 0,
        duration: 1.4,
        ease: "power1.inOut",
        stagger: 0.15,
        delay: 1,
      });

      // 4. Draw a swooping trail behind the plane
      const strokeLength = pathRef.current.getTotalLength();
      gsap.set(pathRef.current, {
        strokeDasharray: strokeLength,
        strokeDashoffset: strokeLength,
        opacity: 0,
      });

      gsap.to(pathRef.current, {
        strokeDashoffset: 0,
        opacity: 0.6,
        duration: 2,
        ease: "power2.out",
        delay: 0.5,
      });

      // Fade out the trail slowly
      gsap.to(pathRef.current, {
        opacity: 0,
        duration: 2,
        delay: 3,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Decorative Flight Trail */}
      <svg
        className="absolute top-1/2 left-0 -translate-y-1/2 translate-x-[-110%] w-75 h-50 -z-10 pointer-events-none"
        viewBox="0 0 300 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          ref={pathRef}
          d="M -50 180 Q 150 150 280 100"
          stroke="#DAA520"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="4 4"
        />
      </svg>

      {/* Pencil-sketched plane, climbing toward the upper right */}
      <svg
        ref={planeRef}
        width="100%"
        height="100%"
        viewBox="0 0 120 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_0_8px_rgba(218,165,32,0.5)]"
      >
        <g
          transform="rotate(-8 60 40)"
          stroke="#292929"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* fuselage — one loose loop, left slightly open like a quick sketch */}
          <path
            className="ap-sketch"
            d="M14 44 C 30 33 64 27 90 31 C 99 32.5 106 36 104.5 40.5 C 102.5 46 80 51 52 52.5 C 36 53.3 18 51 13.5 46.5"
          />
          {/* faint pencil overdraw along the spine */}
          <path
            className="ap-sketch"
            d="M16 42 C 32 31.5 64 26 88 29.5"
            opacity="0.3"
            strokeWidth="1.8"
          />
          {/* tail fin */}
          <path className="ap-sketch" d="M21 41 Q13 29 12 23 Q12 20.5 15 22.5 Q23 29 32 35" />
          {/* rear stabilizer */}
          <path className="ap-sketch" d="M16 46 Q8 45 3 41" strokeWidth="2.2" />
          {/* near wing sweeping toward the viewer */}
          <path
            className="ap-sketch"
            d="M56 50 Q44 62 31 69 Q28 70.5 29.5 67.5 Q36 57 48 49.5"
          />
          {/* hatch shading on the wing */}
          <path
            className="ap-sketch"
            d="M38 63 l7 -6 M43 65 l7 -6 M48 66.5 l6 -5"
            opacity="0.35"
            strokeWidth="1.6"
          />
          {/* far wing hinted above */}
          <path
            className="ap-sketch"
            d="M60 30.5 Q68 22 76 18.5 Q78 17.7 76.8 20.5 Q72 27 65 31"
            opacity="0.55"
            strokeWidth="2"
          />
          {/* little doodle windows */}
          <path
            className="ap-sketch"
            d="M40 42.5 l4 -0.6 M49 41.5 l4 -0.6 M58 40.3 l4 -0.5 M67 39 l4 -0.5"
            opacity="0.5"
            strokeWidth="2"
          />
          {/* cockpit glint in the logo gold */}
          <path
            className="ap-sketch"
            d="M89 33.5 Q96 34.5 100 38"
            stroke="#DAA520"
            strokeWidth="2.2"
          />
          {/* speed swishes off the tail, in gold */}
          <path
            className="ap-sketch"
            d="M2 26 q6 -1 10 0 M0 36 q5 0 9 1 M3 54 q5 1 8 0"
            stroke="#DAA520"
            opacity="0.55"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
};

export default AnimatedPlane;
