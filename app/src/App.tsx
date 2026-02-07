import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import { lazy, Suspense } from 'react'

const Design1Safari = lazy(() => import('./designs/design1-safari'))
const Design2NairobiNights = lazy(() => import('./designs/design2-nairobi-nights'))
const Design3SavannaClean = lazy(() => import('./designs/design3-savanna-clean'))
const Design4MaasaiBold = lazy(() => import('./designs/design4-maasai-bold'))
const Design5MatatuCulture = lazy(() => import('./designs/design5-matatu-culture'))

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
        <Route path="/design-1/*" element={<Design1Safari />} />
        <Route path="/design-2/*" element={<Design2NairobiNights />} />
        <Route path="/design-3/*" element={<Design3SavannaClean />} />
        <Route path="/design-4/*" element={<Design4MaasaiBold />} />
        <Route path="/design-5/*" element={<Design5MatatuCulture />} />
      </Routes>
    </Suspense>
  )
}

export default App
