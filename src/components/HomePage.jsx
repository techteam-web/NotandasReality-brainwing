import notanMap from "../assets/notan_map.png";
import NuthandasLogoAnimated from "./SvgAnimations/NuthandasLogoAnimated";
import AnimatedPlane from "./SvgAnimations/AnimatedPlane";
import MapScene from "./SvgAnimations/MapScene";
import BuildingsLayer from "./Buildings/BuildingsLayer";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import MiniCompass from "./SvgAnimations/MiniCompass";
import { uiScaleFor, useCoverBox } from "../lib/coverBox";

gsap.registerPlugin(useGSAP);

/** notan_map.png is 1920×1080, so a 1920-wide window draws it 1:1. */
const MAP_ASPECT = 1920 / 1080;

const serif = { fontFamily: "'Times New Roman', Times, serif" };

const HomePage = () => {
  const seaWordRef = useRef();

  // The map is bg-cover, so it crops as the window's ratio changes. Everything
  // printed on top of it — pointers, place names — hangs off this box and this
  // scale instead of off the window, so the whole map reads as one drawing at
  // any size. The stepped classes it replaced (`lg:text-[12px] lg:w-15 …`) left
  // the labels and pins swelling against the coastline on smaller screens.
  const box = useCoverBox(MAP_ASPECT);
  const u = uiScaleFor(box);
  const s = (px) => px * u; // artwork pixels → screen pixels

  /** Pin a map annotation to a point on the artwork. */
  const at = (xPct, yPct, anchor = "translate(-50%, -50%)") => ({
    left: box.x + (xPct / 100) * box.w,
    top: box.y + (yPct / 100) * box.h,
    transform: anchor,
  });

  useGSAP(() => {
    gsap.fromTo(
      seaWordRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 2, ease: "power2.out", delay: 3 },
    );
  });

  return (
    <div
      className="relative h-screen w-full overflow-hidden bg-black bg-cover bg-no-repeat text-white"
      style={{
        backgroundImage: `url(${notanMap})`,
        backgroundPosition: "center",
      }}
    >
      <MapScene box={box} u={u} />
      <BuildingsLayer box={box} u={u} />

      {/* brand mark — page chrome, so it stays in the window's corner, but it
          takes the map's scale like everything else */}
      <div
        className="pointer-events-none absolute top-0"
        style={{ left: s(40) }}
      >
        <NuthandasLogoAnimated
          className="transition-all duration-500"
          style={{ width: s(120), height: s(200) }}
        />
      </div>

      {/* the airport, off the east edge of the drawing */}
      <div
        className="pointer-events-none absolute"
        style={at(94.4, 50, "translate(-100%, -100%)")}
      >
        <div
          style={{
            height: s(64),
            width: s(144),
            marginLeft: s(60),
            marginBottom: s(60),
            opacity: 0.7,
          }}
        >
          <AnimatedPlane />
        </div>

        <h1
          className="font-semibold tracking-widest text-[#A7B0BE] uppercase"
          style={{ ...serif, fontSize: s(12) }}
        >
          chhatrapati <br />
          shivaji maharaj <br />
          international airport
        </h1>
      </div>

      {/* the sea link, where it meets the bottom of the drawing */}
      <h1
        className="pointer-events-none absolute font-semibold text-[#A7B0BE] uppercase opacity-75"
        style={{ ...at(43, 95, "none"), ...serif, fontSize: s(11) }}
      >
        bandra worli <br />
        sea link
      </h1>

      {/* the sea itself, set down the western margin like a chart legend */}
      <div
        className="pointer-events-none absolute"
        style={at(19.5, 51.5, "translate(-50%, -50%) rotate(-90deg)")}
      >
        <h1
          className="font-Times-Roman font-semibold text-[#3b5382] capitalize"
          style={{ fontSize: s(24), letterSpacing: s(28) }}
          ref={seaWordRef}
        >
          Arabian Sea
        </h1>
      </div>

      {/* compass rose — chrome again, pinned to the window's corner */}
      <MiniCompass
        backgroundFill="none"
        showMarker={false}
        className="pointer-events-none absolute drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
        style={{
          left: s(28),
          bottom: -s(40),
          width: s(140),
          height: s(216),
        }}
      />
    </div>
  );
};

export default HomePage;
