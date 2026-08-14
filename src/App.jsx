import { Routes, Route } from "react-router";
import HomePage from "./components/HomePage";
import NotFoundPage from "./components/NotFoundPage";
import BuildingPage from "./components/Building/BuildingPage";
import PageTransition from "./components/Transitions/PageTransition";
import CustomCursor from "./components/Transitions/CustomCursor";
import FullscreenGate from "./components/FullscreenGate";

const App = () => {
  return (
    <>
      {/* sits outside the gate so the reticle is up on the full-screen prompt too */}
      <CustomCursor />

      <FullscreenGate>
        <PageTransition>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/projects/:id" element={<BuildingPage />} />
            <Route path="*" element={<NotFoundPage />} />
            {/* future pages added here automatically get the ink-tide transition */}
          </Routes>
        </PageTransition>
      </FullscreenGate>
    </>
  );
};

export default App;
