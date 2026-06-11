import notanMap from "../assets/notan_map.png"
import NuthandasLogoAnimated from "./SvgAnimations/NuthandasLogoAnimated"
import AnimatedPlane from "./SvgAnimations/AnimatedPlane"
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
        backgroundPosition: `center calc(100% + 40px)` // Adjust the 50px or 0% (top) / 100% (bottom) to your exact needs
      }}
    >
      <MapScene />
      <BuildingsLayer />

      <div className="p-3 ml-28">
        <NuthandasLogoAnimated 
          className="w-48 md:w-74 h-70 transition-all duration-500 hover:scale-105 hover:drop-shadow-[0_0_15px_rgba(218,165,32,0.7)] cursor-pointer"
        />
      </div>
   
   <div className="absolute bottom-[50%] right-27 ">

    <div className="w-36 h-16 ml-15 mb-15">
      <AnimatedPlane />
    </div>

     <h1 className="text-2xl capitalize font-semibold text-[#4E5157] font-serif italic ">
      CSM-International Airport
     </h1>

   </div>


    <div className="absolute top-[50%] left-[9%] -rotate-90">
      <h1 className="text-2xl tracking-[28px] capitalize font-semibold text-[#3b5382] font-serif italic " ref={seaWordRef}>
        Arabian Sea
      </h1>
    </div>


      
    </div>
  )
}

export default HomePage
