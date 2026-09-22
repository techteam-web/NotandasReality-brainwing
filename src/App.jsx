import { Routes, Route } from "react-router";
import HomePage from "./components/HomePage";
import NotFoundPage from "./components/NotFoundPage";
import BuildingPage from "./components/Building/BuildingPage";
import PageTransition from "./components/Transitions/PageTransition";
import FullscreenGate from "./components/FullscreenGate";
import DesignStage from "./components/DesignStage";

const App = () => {
  return (
    <FullscreenGate>
      {/* One 1920×1080 composition, scaled to the window — see DesignStage.
          It wraps PageTransition so the project mark on the ink wave scales
          with the page it is covering. The gate itself stays outside: it is a
          prompt on the browser, not part of the composition. */}
      <DesignStage>
        <PageTransition>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/projects/:id" element={<BuildingPage />} />
            <Route path="*" element={<NotFoundPage />} />
            {/* future pages added here automatically get the ink-tide transition */}
          </Routes>
        </PageTransition>
      </DesignStage>
    </FullscreenGate>
  );
};

export default App;
