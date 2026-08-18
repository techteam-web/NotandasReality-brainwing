import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { BUILDINGS } from "./buildingsData";
import BuildingMarker from "./BuildingMarker";

/**
 * Places a glowing pointer for every building from buildingsData.js
 * onto the map and pops them in one by one; hovering a pointer pops
 * up its building (see BuildingMarker).
 *
 * `box` is where the map artwork actually landed and `u` how big it was drawn
 * (see lib/coverBox) — both are handed down so every pointer sits on its own
 * corner of the map and is sized against the map, not against the window.
 */
const BuildingsLayer = ({ box, u }) => {
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
        },
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
    { scope: layerRef },
  );

  return (
    <div ref={layerRef} className="pointer-events-none absolute inset-0">
      {BUILDINGS.map((building) => (
        <BuildingMarker key={building.id} building={building} box={box} u={u} />
      ))}
    </div>
  );
};

export default BuildingsLayer;
