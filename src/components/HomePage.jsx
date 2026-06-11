import notanMap from "../assets/notan_map.png"
import nuthandasLogo from "../assets/nuthandasReality.svg"
import NuthandasLogoAnimated from "./NuthandasLogoAnimated"
import AnimatedPlane from "./AnimatedPlane"

const HomePage = () => {

  return (
    <div
      className="w-full h-screen bg-black text-white bg-cover bg-no-repeat"
      style={{ 
        backgroundImage: `url(${notanMap})`,
        backgroundPosition: `center calc(100% + 40px)` // Adjust the 50px or 0% (top) / 100% (bottom) to your exact needs
      }}
    >
      <div className="p-3 ml-15">
        <NuthandasLogoAnimated 
          className="w-48 md:w-74 h-70 transition-all duration-500 hover:scale-105 hover:drop-shadow-[0_0_15px_rgba(218,165,32,0.7)] cursor-pointer"
        />
      </div>
   
   <div className="absolute bottom-[50%] right-27 ">
    <div className="w-36 h-16 ml-15 mb-15">
      <AnimatedPlane />
    </div>
     <h1 className="text-2xl capitalize font-semibold text-[#4E5157] font-serif ">
      CSM-International Airport
     </h1>
   </div>

      
    </div>
  )
}

export default HomePage
