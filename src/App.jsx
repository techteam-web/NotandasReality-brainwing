import { Routes, Route } from "react-router"
import HomePage from "./components/HomePage"
import NotFoundPage from "./components/NotFoundPage"
import BuildingPage from "./components/Building/BuildingPage"
import PageTransition from "./components/Transitions/PageTransition"
import FullscreenGate from "./components/FullscreenGate"

const App = () => {
  return (
    <FullscreenGate>
      <PageTransition>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects/:id" element={<BuildingPage />} />
          <Route path="*" element={<NotFoundPage />} />
          {/* future pages added here automatically get the ink-tide transition */}
        </Routes>
      </PageTransition>
     <img
        src="/Brainwing-logo.webp"
        alt="Brainwing logo"
        className="fixed top-18 left-3 w-9 z-50 pointer-events-none opacity-70
          sm:top-20 sm:left-4 sm:w-10
          md:top-auto md:bottom-6 md:left-auto md:right-5 md:w-14 md:opacity-80
          lg:right-6 lg:w-46
          xl:right-7 xl:w-50"
      />
    </FullscreenGate>
  )
}

export default App
