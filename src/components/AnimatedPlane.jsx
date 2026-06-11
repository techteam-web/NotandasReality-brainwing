import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

const AnimatedPlane = ({ className }) => {
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

      // 3. Draw a swooping trail behind the plane
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
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Decorative Flight Trail */}
      <svg
        className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-[110%] w-[300px] h-[200px] -z-10 pointer-events-none"
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

      {/* Plane SVG */}
      <svg
        ref={planeRef}
        fill="#292929" /* Gold to match the logo style */
        width="100%"
        height="100%"
        viewBox="-4.16 -4.16 40.32 40.32"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_0_8px_rgba(218,165,32,0.5)]"
      >
        <path d="M29.028,3l-.017-.015L29,2.972a2.118,2.118,0,0,0-2.993,0l-7.187,7.186L14.67,9.291l2.122-2.123a.354.354,0,0,0-.5-.5l-2.45,2.45-4.12-.861L11.777,6.2a.354.354,0,0,0-.5-.5L8.893,8.082,5.613,7.4a2.909,2.909,0,0,0-2.67.8L1.635,9.5a.354.354,0,0,0,.108.575L13.671,15.3,9.217,19.757,4.475,20.3a1.342,1.342,0,0,0-1.046.747l-.777,1.88a.359.359,0,0,0,.024.319.354.354,0,0,0,.271.169l3.805.36a1.956,1.956,0,0,0,.5.913.223.223,0,0,0,.027.026l.016.018a1.984,1.984,0,0,0,.925.514l.36,3.805a.354.354,0,0,0,.169.271.359.359,0,0,0,.319.024l1.907-.789a1.334,1.334,0,0,0,.72-1.034l.545-4.742L16.7,18.329l5.229,11.928a.356.356,0,0,0,.259.206.368.368,0,0,0,.066.006.354.354,0,0,0,.25-.1l1.308-1.308a2.918,2.918,0,0,0,.8-2.67l-.686-3.28L26.3,20.724a.354.354,0,0,0-.5-.5l-2.055,2.056-.861-4.12,2.45-2.45a.354.354,0,0,0-.5-.5L22.709,17.33l-.867-4.146L29.028,6A2.117,2.117,0,0,0,29.028,3Zm-.5,2.492-7.321,7.322a.354.354,0,0,0-.1.323l2.8,13.391a2.212,2.212,0,0,1-.6,2.024l-.941.942L17.137,17.57a.351.351,0,0,0-.259-.206.3.3,0,0,0-.066-.007.358.358,0,0,0-.25.1l-4.908,4.908a.359.359,0,0,0-.1.21l-.559,4.865a.621.621,0,0,1-.313.472l-1.438.594L8.9,24.919a.353.353,0,0,0-.3-.317,1.4,1.4,0,0,1-.781-.35q-.017-.021-.033-.039a.335.335,0,0,0-.04-.033A1.389,1.389,0,0,1,7.4,23.4a.353.353,0,0,0-.317-.3l-3.591-.34.582-1.411a.627.627,0,0,1,.484-.34l4.865-.559a.359.359,0,0,0,.21-.1l4.908-4.908a.355.355,0,0,0-.109-.575L2.5,9.634l.942-.941a2.216,2.216,0,0,1,2.024-.6l13.391,2.8a.348.348,0,0,0,.323-.1L26.5,3.473a1.411,1.411,0,0,1,1.97-.021.325.325,0,0,0,.074.074A1.41,1.41,0,0,1,28.527,5.5Z"/>
      </svg>
    </div>
  );
};

export default AnimatedPlane;