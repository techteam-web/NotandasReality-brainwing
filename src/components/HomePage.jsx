import notanMap from "../assets/notan_map.png";
import NuthandasLogoAnimated from "./SvgAnimations/NuthandasLogoAnimated";
import AnimatedPlane from "./SvgAnimations/AnimatedPlane";
import MapScene from "./SvgAnimations/MapScene";
import BuildingsLayer from "./Buildings/BuildingsLayer";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import MiniCompass from "./SvgAnimations/MiniCompass";
import { Chrome } from "./DesignStage";

gsap.registerPlugin(useGSAP);

const HomePage = () => {
  const seaWordRef = useRef();

  useGSAP(() => {
    gsap.fromTo(
      seaWordRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 2, ease: "power2.out", delay: 3 },
    );
  });

  return (
    /* The page: the chart, and nothing else. Upright it is centred on the
       brand's ground rather than cropped, because a map with a third of its
       width cut away is not a map — see the box below. */
    <div className="relative h-stage w-full overflow-hidden bg-[#dfe7ee] text-white portrait:flex portrait:flex-col portrait:items-center portrait:justify-center portrait:gap-[46px]">
      {/* The chart itself, and everything drawn on it.

          Across, it fills the picture layer: 1920×1080, the size the map is
          drawn at, so every pin, label, palm and boat sits where it was placed.

          Upright, it stays 1920×1080 and is SCALED instead. Cropping it to a
          portrait window would throw away well over half its width — Vile
          Parle and the airport go first — and re-sizing each of its
          twenty-odd drawings in percentages would have them drift apart from
          the coastline they are drawn against. Scaling the whole chart at once
          keeps the composition exactly as it is across, just smaller. The
          factor is fixed because the portrait canvas is: 820 ÷ 1920 (see
          DesignStage's PORTRAIT_W). Only the pins and their names are boosted
          back up, in BuildingMarker, since those are for reading and touching
          rather than part of the drawing. */}
      {/* A transform does not change layout, so the chart needs two boxes: this
          one is the size it ENDS UP (820 × 820/ar), which is what the column
          above measures and centres, and the one inside stays 1920×1080 and is
          scaled into it from the corner. */}
      <div className="relative h-full w-full portrait:h-[461.25px]! portrait:w-205! portrait:shrink-0">
      <div
        className="relative h-full w-full bg-cover bg-no-repeat portrait:h-270! portrait:w-480! portrait:origin-top-left portrait:scale-[0.4271]"
        style={{
          backgroundImage: `url(${notanMap})`,
          backgroundPosition: `center calc(100% + 0px)`, // Adjust the 50px or 0% (top) / 100% (bottom) to your exact needs
        }}
      >
      <MapScene />
      <BuildingsLayer />

      <div className="absolute right-27 bottom-[50%]">
        <div className="mb-15 ml-15 h-16 w-36 opacity-70 pointer-events-none">
          <AnimatedPlane />
        </div>

        <h1
          className="text-sm font-semibold text-[#A7B0BE] uppercase tracking-widest lg:text-[12px] pointer-events-none"
          style={{ fontFamily: "'Times New Roman', Times, serif" }}
        >
          chhatrapati <br />
          shivaji maharaj <br />
          international airport
        </h1>
      </div>

      <h1
        className="absolute top-[95%] left-[43%] text-sm font-semibold text-[#A7B0BE] uppercase lg:text-[11px] opacity-75 pointer-events-none"
        style={{ fontFamily: "'Times New Roman', Times, serif" }}
      >
        bandra worli <br />
        sea link
      </h1>

      <div className="absolute top-[50%] left-[8%] -rotate-90 lg:left-40">
        <h1
          className="font-Times-Roman text-2xl font-semibold tracking-[28px] text-[#3b5382] capitalize lg:block pointer-events-none"
          ref={seaWordRef}
        >
          Arabian Sea
        </h1>
      </div>
      </div>
      </div>

      {/* The brand mark and the compass are the two things here that are not
          drawn on the chart — everything else (pins, labels, the boat, the sea
          link, the palms) travels with it. Across, they are pinned to the
          screen's corners through `<Chrome>` so the picture's crop can never
          take them. Upright, `<Chrome>` is a no-op and they are simply the rows
          above and below the chart in the column: the same two things, still
          reading as a plate with a title and a compass rose, instead of
          stranded a quarter of a page from the map they belong to. */}
      <Chrome>
      <div className="absolute top-0 left-0 portrait:static! portrait:order-first! portrait:shrink-0">
        <NuthandasLogoAnimated className="relative h-50 w-48 transition-all duration-500 md:w-74 lg:left-10 lg:w-30 portrait:h-31! portrait:w-30! portrait:left-0! portrait:top-0! pointer-events-none" />
      </div>
      </Chrome>

      {/* static compass rose — map decoration */}
      {/* <Compass className="absolute bottom-4 left-3 h-20 w-20 opacity-90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] md:h-54 md:w-54 lg:-bottom-8 lg:left-3 lg:w-40" /> */}

      <Chrome>
      <MiniCompass
        backgroundFill="none"
        showMarker={false}
        className="absolute bottom-4 left-3 h-20 w-20 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] md:h-54 md:w-54 lg:-bottom-10 lg:left-7 lg:w-35 portrait:static! portrait:h-33! portrait:w-33! portrait:shrink-0!"
      />
      </Chrome>
    </div>
  );
};

export default HomePage;
