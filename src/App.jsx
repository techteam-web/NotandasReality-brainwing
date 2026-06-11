import { Routes, Route } from "react-router"
import HomePage from "./components/HomePage"
import PageTransition from "./components/PageTransition"

const App = () => {
  return (
    <PageTransition>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* future pages added here automatically get the ink-tide transition */}
      </Routes>
    </PageTransition>
  )
}

export default App
