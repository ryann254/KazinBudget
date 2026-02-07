import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import { lazy, Suspense } from 'react'

const Design1Bauhaus = lazy(() => import('./designs/design1-bauhaus'))
const Design2Terminal = lazy(() => import('./designs/design2-terminal'))
const Design3Glass = lazy(() => import('./designs/design3-glass'))
const Design4Ankara = lazy(() => import('./designs/design4-ankara'))
const Design5Brutalist = lazy(() => import('./designs/design5-brutalist'))

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Loading design...</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/design-1/*" element={<Design1Bauhaus />} />
        <Route path="/design-2/*" element={<Design2Terminal />} />
        <Route path="/design-3/*" element={<Design3Glass />} />
        <Route path="/design-4/*" element={<Design4Ankara />} />
        <Route path="/design-5/*" element={<Design5Brutalist />} />
      </Routes>
    </Suspense>
  )
}

export default App
