import { Route, Routes } from 'react-router'
import LabelDetailPage from './pages/LabelDetailPage'
import LabelsPage from './pages/LabelsPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LabelsPage />} />
      <Route path="/labels/:id" element={<LabelDetailPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
