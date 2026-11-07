import { Route, Routes } from 'react-router'
import LabelDetailPage from './pages/LabelDetailPage'
import LabelsPage from './pages/LabelsPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LabelsPage />} />
      <Route path="/labels/:id" element={<LabelDetailPage />} />
    </Routes>
  )
}

export default App
