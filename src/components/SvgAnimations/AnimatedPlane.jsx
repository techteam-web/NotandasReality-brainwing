import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import planeSvg from "../../assets/svgs/plane.svg";

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

      // 3. "Pencil in" removed because we use an external svg image
      // const sketchPaths = gsap.utils.toArray(".ap-sketch");
      // sketchPaths.forEach((p) => {
      //   const len = p.getTotalLength();
      //   gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      // });
      // gsap.to(".ap-sketch", {
      //   strokeDashoffset: 0,
      //   duration: 1.4,
      //   ease: "power1.inOut",
      //   stagger: 0.15,
      //   delay: 1,
      // });

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
          stroke="#4f5479" /* lighter stroke color */
          strokeWidth="0.5" /* thinner stroke */
          strokeLinecap="round"
          strokeDasharray="2 " /* subtler dash */
        />
      </svg>

      {/* External Plane SVG, climbing toward the upper right */}
      <img
        ref={planeRef}
        src={planeSvg}
        alt="Plane"
        className="w-full h-auto max-w-24 "
        style={{ transform: "rotate(-9deg)" }}
      />
    </div>
  );
};

export default AnimatedPlane;
