import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { BUILDINGS } from "./buildingsData";
import BuildingMarker from "./BuildingMarker";

/**
 * Places a glowing pointer for every building from buildingsData.js
 * onto the map and pops them in one by one; hovering a pointer pops
 * up its building (see BuildingMarker).
 */
const BuildingsLayer = () => {
  const layerRef = useRef(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".bldg-pop",
        { scale: 0, opacity: 0, transformOrigin: "50% 50%" },
        {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: "back.out(2)",
          stagger: 0.12,
          delay: 1.6,
        }
      );

      // gentle infinite up/down drift once each pointer has popped in
      // gsap.to(".bldg-pop", {
      //   y: -5,
      //   duration: 2.6,
      //   ease: "sine.inOut",
      //   repeat: -1,
      //   yoyo: true,
      //   delay: 2.8,
      //   stagger: {
      //     each: 0.3,
      //     from: "random",
      //   },
      // });
    },
    { scope: layerRef }
  );

  return (
    <div ref={layerRef} className="absolute inset-0 pointer-events-none">
      {BUILDINGS.map((building) => (
        <BuildingMarker key={building.id} building={building} />
      ))}
    </div>
  );
};

export default BuildingsLayer;
