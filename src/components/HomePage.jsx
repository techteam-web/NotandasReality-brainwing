import notanMap from "../assets/notan_map.png"
import NuthandasLogoAnimated from "./SvgAnimations/NuthandasLogoAnimated"
import AnimatedPlane from "./SvgAnimations/AnimatedPlane"
import Compass from "./SvgAnimations/Compass"
import MapScene from "./SvgAnimations/MapScene"
import BuildingsLayer from "./Buildings/BuildingsLayer"
import { useRef } from "react";
import gsap from "gsap"
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP); 

const HomePage = () => {
  const seaWordRef = useRef();

  useGSAP(() => {
    gsap.fromTo(seaWordRef.current, 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 2, ease: "power2.out", delay: 3}
    );
  });

  return (
    <div
      className="relative w-full h-screen bg-black text-white bg-cover bg-no-repeat overflow-hidden"
      style={{
        backgroundImage: `url(${notanMap})`,
        backgroundPosition: `center calc(100% + 0px)` // Adjust the 50px or 0% (top) / 100% (bottom) to your exact needs
      }}
    >
      <MapScene />
      <BuildingsLayer />

      <div className="relative">
        <NuthandasLogoAnimated 
          className="w-48 md:w-74 h-50 transition-all duration-500 hover:scale-105 hover:drop-shadow-[0_0_15px_rgba(218,165,32,0.7)] cursor-pointer"
        />
      </div>
   
   <div className="absolute bottom-[50%] right-27 ">

    <div className="w-36 h-16 ml-15 mb-15">
      <AnimatedPlane />
    </div>

    <h1
     className="text-sm uppercase font-semibold text-[#7a7c80]"
     style={{ fontFamily: "'Times New Roman', Times, serif" }}
    >
      chhatrapati <br/>shivaji maharaj <br/>international airport
     </h1>

   </div>

   <h1
     className="text-sm uppercase font-semibold text-[#7a7c80] absolute top-[95%] left-[43%]"
     style={{ fontFamily: "'Times New Roman', Times, serif" }}
    >
      bandra worli <br/>sea link
     </h1>


    <div className="absolute top-[50%] left-[8%] -rotate-90">
      <h1 className="text-2xl tracking-[28px] capitalize font-semibold text-[#3b5382] font-Times-Roman  " ref={seaWordRef}>
        Arabian Sea
      </h1>
    </div>

    {/* static compass rose — map decoration */}
    <Compass className="absolute bottom-4 left-3 w-20 h-20 md:w-54 md:h-54 opacity-90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]" />



    </div>
  )
}

export default HomePage
