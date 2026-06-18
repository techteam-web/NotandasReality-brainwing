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

      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 md:top-8 md:left-8 lg:top-10 lg:left-10 xl:top-12 xl:left-12 2xl:top-16 2xl:left-16 z-20">
        <NuthandasLogoAnimated 
          className="w-40 sm:w-48 md:w-56 lg:w-64 xl:w-72 2xl:w-80 3xl:w-96 h-auto transition-all duration-500 hover:scale-105 hover:drop-shadow-[0_0_15px_rgba(218,165,32,0.7)] cursor-pointer"
        />
      </div>
   
   <div className="absolute bottom-[40%] right-[10%] sm:bottom-[45%] sm:right-[15%] md:bottom-[50%] md:right-[20%] lg:right-[25%] xl:right-[30%]">

    <div className="w-24 h-12 mb-4 ml-4 sm:w-32 sm:h-16 sm:mb-8 sm:ml-8 md:w-36 md:mb-12 md:ml-12 lg:w-48 lg:mb-16 lg:ml-16">
      <AnimatedPlane />
    </div>

    <h1
     className="text-[10px] sm:text-xs md:text-sm lg:text-base xl:text-lg uppercase font-semibold text-[#7a7c80]"
     style={{ fontFamily: "'Times New Roman', Times, serif" }}
    >
      chhatrapati <br/>shivaji maharaj <br/>international airport
     </h1>

   </div>

   <h1
     className="text-[10px] sm:text-xs md:text-sm lg:text-base xl:text-lg uppercase font-semibold text-[#7a7c80] absolute top-[85%] left-[30%] sm:top-[90%] sm:left-[35%] md:top-[95%] md:left-[43%]"
     style={{ fontFamily: "'Times New Roman', Times, serif" }}
    >
      bandra worli <br/>sea link
     </h1>

    <div className="absolute top-[40%] left-[2%] sm:top-[45%] sm:left-[5%] md:top-[50%] md:left-[9%] -rotate-90">
      <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl tracking-[16px] sm:tracking-[20px] md:tracking-[28px] lg:tracking-[36px] capitalize font-semibold text-[#3b5382] font-Times-Roman flex whitespace-nowrap" ref={seaWordRef}>
        Arabian Sea
      </h1>
    </div>

    {/* static compass rose — map decoration */}
    <Compass className="absolute bottom-4 left-3 w-16 h-16 sm:w-20 sm:h-20 md:w-32 md:h-32 lg:w-48 lg:h-48 xl:w-56 xl:h-56 3xl:w-64 3xl:h-64 opacity-90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]" />



    </div>
  )
}

export default HomePage
