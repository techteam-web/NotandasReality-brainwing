import { Routes, Route } from "react-router"
import HomePage from "./components/HomePage"
import NotFoundPage from "./components/NotFoundPage"
import PageTransition from "./components/Transitions/PageTransition"

const App = () => {
  return (
    <PageTransition>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<NotFoundPage />} />
        {/* future pages added here automatically get the ink-tide transition */}
      </Routes>
    </PageTransition>
  )
}

export default App
