import notanMap from "../assets/notan_map.png";
/* 2752×2064: the 1440×1080 middle of the chart, which is all a 4:3 window
   shows of it (see the `ipad` variant in index.css) */
import notanMapIpad from "../assets/notan_map-ipad.webp";
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
    /* On a phone the page's own ground is the chart too (`--map-bg`, cover):
       the chart below is fitted to keep every pin on screen, which on the
       widest phones leaves a sliver either side of it, and what shows there
       should be the sea on the left and the paper on the right — the chart's
       own edges — rather than a band of flat colour. */
    <div
      className="relative h-stage w-full overflow-hidden bg-[#dfe7ee] text-white portrait:flex portrait:flex-col portrait:items-center portrait:justify-center portrait:gap-[46px] phone:bg-(image:--map-bg) phone:bg-cover phone:bg-center"
      style={{ "--map-bg": `url(${notanMap})` }}
    >
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
      {/* On an iPad across the iPad cut replaces the chart, drawn into the
          middle 1440 — the `max()` covers the sliver more a 1366×1024 window
          shows — so every pin stays on its spot. Through a variable so only
          the one image for this shape is ever downloaded. */}
      <div
        /* A phone across is a far wider shape than the chart — 2.2:1 against
           16:9 — so the chart covers the width, as everywhere else, and the
           crop comes off the top and bottom. Centred, that crop cut the pin at
           92% of the map in half; fitting the height instead kept every pin
           but left a band of empty ground either side. Neither: the chart
           still fills the width, and slides UP so the crop falls where there
           is nothing — over the sea and fields above Juhu, below every name.

           The pins run from Notan DC's at 18% to Notan Crown's at 92%; with
           Crown's name under it and a little air, that is 162–1056 of the
           chart's 1080 design px — 894 tall, centred 69px below the chart's
           middle. So, from what is on screen (`--fit-y` is its share of the
           chart's height, `--crop-y` what is cut off each end; DesignStage):

             scale  min(1, fit-y × 1080/894) — only the widest phones, where
                    under 894px is on screen, give anything back, and at most
                    ~3% (the page behind is the chart too, so the sliver
                    either side reads as more of the same sea and paper);
             shift  69px × scale up, held within ±crop-y so the chart never
                    lets go of either edge — none where nothing is cropped.

           Move a pin past 18% or 92% and those two numbers move with it.

           Scaled and shifted rather than resized on purpose: every pin keeps
           its percentage of the same 1920×1080 box and lands on its own spot,
           and with no stage the variables fall back to 1 and 0px — no scale,
           no shift, the chart as it was — where a `calc()` that SIZED the box
           would go invalid, collapse it, and pile all ten pins in a corner. */
        className="relative h-full w-full origin-center bg-cover bg-no-repeat portrait:h-270! portrait:w-480! portrait:origin-top-left portrait:scale-[0.4271] ipad:bg-(image:--map-ipad)! ipad:bg-size-[max(1440px,calc(100%_-_2*var(--crop-x)))_auto]! ipad:bg-center! phone:scale-[min(1,calc(var(--fit-y,1)*1.2081))] phone:translate-y-[clamp(calc(-1*var(--crop-y,0px)),calc(-69px*min(1,calc(var(--fit-y,1)*1.2081))),var(--crop-y,0px))]"
        style={{
          backgroundImage: `url(${notanMap})`,
          "--map-ipad": `url(${notanMapIpad})`,
          backgroundPosition: `center calc(100% + 0px)`, // Adjust the 50px or 0% (top) / 100% (bottom) to your exact needs
        }}
      >
      <MapScene />
      <BuildingsLayer />

      {/* 108px in from the right is off screen at 4:3, which shows only up to
          240px in — so on an iPad across the label stands 264px in, still over
          the airport's runways. */}
      {/* The chart's own lettering is set for a 1920-wide plate and lands at
          five or six real pixels on a phone, so the phone's chart carries the
          coast and the pins and leaves the lettering off. */}
      <div className="absolute right-27 bottom-[50%] ipad:right-[264px]! phone:hidden">
        <div className="mb-15 ml-15 h-16 w-36 opacity-70 pointer-events-none">
          <AnimatedPlane />
        </div>

        <h1
          className="text-sm font-semibold text-[#A7B0BE] uppercase tracking-widest lg:text-[12px] phone:text-[12px] pointer-events-none"
          style={{ fontFamily: "'Times New Roman', Times, serif" }}
        >
          chhatrapati <br />
          shivaji maharaj <br />
          international airport
        </h1>
      </div>

      <h1
        className="absolute top-[95%] left-[43%] text-sm font-semibold text-[#A7B0BE] uppercase lg:text-[11px] phone:text-[11px] opacity-75 pointer-events-none phone:hidden"
        style={{ fontFamily: "'Times New Roman', Times, serif" }}
      >
        bandra worli <br />
        sea link
      </h1>

      <div className="absolute top-[50%] left-[8%] -rotate-90 lg:left-40 phone:left-40 phone:hidden">
        <h1
          className="font-Times-Roman text-2xl font-semibold tracking-[28px] text-[#3b5382] capitalize lg:block phone:block pointer-events-none"
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
        <NuthandasLogoAnimated className="relative h-50 w-48 transition-all duration-500 md:w-74 lg:left-10 phone:left-10 lg:w-30 phone:w-30 portrait:h-31! portrait:w-30! portrait:left-0! portrait:top-0! pointer-events-none" />
      </div>
      </Chrome>

      {/* static compass rose — map decoration */}
      {/* <Compass className="absolute bottom-4 left-3 h-20 w-20 opacity-90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] md:h-54 md:w-54 lg:-bottom-8 phone:-bottom-8 lg:left-3 phone:left-3 lg:w-40 phone:w-40" /> */}

      <Chrome>
      <MiniCompass
        backgroundFill="none"
        showMarker={false}
        className="absolute bottom-4 left-3 h-20 w-20 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] md:h-54 md:w-54 lg:-bottom-10 phone:-bottom-10 lg:left-7 phone:left-7 lg:w-35 phone:w-35 portrait:static! portrait:h-33! portrait:w-33! portrait:shrink-0! phone:hidden"
      />
      </Chrome>
    </div>
  );
};

export default HomePage;
