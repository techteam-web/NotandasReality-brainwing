import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { BUILDINGS } from "./buildingsData";
import BuildingMarker from "./BuildingMarker";

/**
 * Places every building from buildingsData.js onto the map and
 * pops them up from the ground one by one, like the trees in MapScene.
 */
const BuildingsLayer = () => {
  const layerRef = useRef(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".bldg-pop",
        { scale: 0, opacity: 0, transformOrigin: "50% 100%" },
        {
          scale: 1,
          opacity: 1,
          duration: 1,
          ease: "back.out(1.6)",
          stagger: 0.12,
          delay: 1.6,
        }
      );

      // gentle infinite up/down float once each building has popped in
      gsap.to(".bldg-pop", {
        y: -10,
        duration: 2.4,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 2.8,
        stagger: {
          each: 0.3,
          from: "random",
        },
      });
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
