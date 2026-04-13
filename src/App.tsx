import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LandingPage } from './components/LandingPage'
import { DashboardLayout } from './components/DashboardLayout'
import { Overzicht } from './pages/Overzicht'
import { Agenda } from './pages/Agenda'
import { Klanten } from './pages/Klanten'
import { Pakketten } from './pages/Pakketten'
import { Planning } from './pages/Planning'
import { Portfolio } from './pages/Portfolio'
import { Projecten } from './pages/Projecten'
import { Cheatsheet } from './pages/Cheatsheet'
import { Facturen } from './pages/Facturen'
import { Notities } from './pages/Notities'
import { Instellingen } from './pages/Instellingen'
import { useStore } from './store'
import './App.css'

function App() {
  const store = useStore()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/welkom" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Overzicht store={store} />} />
          <Route path="agenda" element={<Agenda store={store} />} />
          <Route path="klanten" element={<Klanten store={store} />} />
          <Route path="pakketten" element={<Pakketten store={store} />} />
          <Route path="planning" element={<Planning store={store} />} />
          <Route path="projecten" element={<Projecten store={store} />} />
          <Route path="facturen" element={<Facturen store={store} />} />
          <Route path="portfolio" element={<Portfolio store={store} />} />
          <Route path="notities" element={<Notities store={store} />} />
          <Route path="cheatsheet" element={<Cheatsheet store={store} />} />
          <Route path="instellingen" element={<Instellingen store={store} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
