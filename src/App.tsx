import { Routes, Route, Navigate } from 'react-router-dom'

import { Layout } from '@/components/Layout'
import Home from '@/pages/Home/Home'
import TrumpWordMap from '@/pages/TrumpWordMap/TrumpWordMap'
import Settings from '@/pages/Settings/Settings'

function App() {
  return (
    <Routes>
      {/* All routes with sidebar layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/trump-word-map" element={<TrumpWordMap />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
