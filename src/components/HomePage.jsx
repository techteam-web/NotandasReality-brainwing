import notanMap from "../assets/notan_map.png"
import nuthandasLogo from "../assets/nuthandasReality.svg"
import NuthandasLogoAnimated from "./NuthandasLogoAnimated"

const HomePage = () => {

  return (
    <div
      className="w-full h-screen bg-black text-white bg-cover bg-no-repeat"
      style={{ 
        backgroundImage: `url(${notanMap})`,
        backgroundPosition: `center calc(100% + 40px)` // Adjust the 50px or 0% (top) / 100% (bottom) to your exact needs
      }}
    >
      <div className="p-5">
        <NuthandasLogoAnimated 
          className="w-48 md:w-64 h-70 transition-all duration-500 hover:scale-105 hover:drop-shadow-[0_0_15px_rgba(218,165,32,0.7)] cursor-pointer"
        />
      </div>


      
    </div>
  )
}

export default HomePage
