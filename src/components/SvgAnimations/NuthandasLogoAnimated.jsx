import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

const NuthandasLogoAnimated = ({ className }) => {
  const svgRef = useRef(null);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      const paths = gsap.utils.toArray("path, text");

      paths.forEach((path) => {
        // Handle text elements differently or skip them for draw SVG
        if (path.tagName.toLowerCase() === "path") {
          const length = path.getTotalLength();
          gsap.set(path, {
            strokeDasharray: length,
            strokeDashoffset: length,
            fillOpacity: 0,
            stroke: "#04010f", 
            strokeWidth: 20, 
            fill: "#292929",  
          });

          gsap.to(path, {
            strokeDashoffset: 0,
            duration: 3,
            ease: "power2.inOut",
          });

          gsap.to(path, {
            fillOpacity: 1,
            duration: 2,
            delay: 3.2,
            ease: "power2.out",
          });
        // Let's fade in text softly after the logo is drawn
        } else if (path.tagName.toLowerCase() === "text") {
           gsap.set(path, { opacity: 0, fill: "#0a031f" });
           gsap.to(path, {
             opacity: 1,
             duration: 1.5,
             delay: 2,
             ease: "power2.out",
           });
        }
      });
    }, svgRef);

    return () => ctx.revert();
  }, []);

  return (
    <svg 
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 365 390"
      className={className} // Allows Hover effects from HomePage
    >
      <g transform="translate(0.000000,320.000000) scale(0.100000,-0.095000)" stroke="none">
        <path d="M1630 2530 c-55 -11 -123 -47 -179 -95 -74 -63 -91 -58 -91 23 0 61 -7 65 -109 65 -66 0 -96 -4 -106 -14 -12 -12 -14 -133 -15 -774 -1 -714 0 -760 16 -772 23 -17 53 -16 84 2 14 8 46 14 73 15 26 0 48 1 49 3 1 1 5 227 8 502 l6 500 25 65 c36 94 57 128 119 191 43 44 68 61 113 75 54 17 60 17 112 0 130 -41 187 -219 140 -439 -16 -79 -83 -221 -134 -289 -20 -26 -56 -75 -81 -108 -25 -33 -50 -66 -55 -73 -65 -78 -136 -240 -154 -352 -21 -138 -22 -161 -12 -242 19 -147 88 -271 200 -354 80 -60 124 -73 240 -67 77 4 106 10 147 31 62 31 131 100 160 159 28 56 54 164 54 223 0 55 -27 178 -48 220 -27 54 -101 133 -145 154 -61 29 -168 29 -217 0 -42 -26 -52 -38 -93 -114 -30 -56 -32 -66 -32 -160 1 -85 4 -105 23 -135 33 -54 76 -82 129 -83 61 0 94 32 101 102 5 59 -11 92 -57 116 -25 13 -28 18 -22 42 6 23 14 29 43 31 75 6 125 -75 115 -189 -8 -93 -70 -183 -133 -195 -68 -13 -124 4 -171 51 -24 24 -50 59 -57 77 -35 84 -26 316 14 405 55 119 66 141 94 183 16 25 55 79 86 120 84 111 147 206 155 232 4 13 16 42 26 64 10 23 30 90 45 150 22 91 25 123 21 194 -7 102 -31 216 -49 238 -8 10 -20 30 -28 47 -8 16 -41 55 -72 86 -48 47 -69 60 -127 78 -69 21 -145 25 -211 11z"/>
      </g>
      <text x="182.5" y="342" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-weight="700" font-size="48" letter-spacing="8">NOTANDAS</text>
      <text x="182.5" y="376" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-weight="300" font-size="34" letter-spacing="10">REALTY</text>
    </svg>
    
  );
};

export default NuthandasLogoAnimated;