import { Route, Routes } from 'react-router'
import LabelsPage from './pages/LabelsPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LabelsPage />} />
    </Routes>
  )
}

export default App
