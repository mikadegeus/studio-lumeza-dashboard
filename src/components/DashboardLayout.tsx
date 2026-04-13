import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  Calendar,
  Users,
  Package,
  Clock,
  FolderOpen,
  Star,
  Receipt,
  StickyNote,
  BookOpen,
  Settings,
  ArrowLeft,
  Menu,
  X,
} from 'lucide-react'
import './DashboardLayout.css'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overzicht', end: true },
  { to: '/dashboard/agenda', icon: Calendar, label: 'Agenda' },
  { to: '/dashboard/klanten', icon: Users, label: 'Contacten' },
  { to: '/dashboard/pakketten', icon: Package, label: 'Pakketten' },
  { to: '/dashboard/projecten', icon: FolderOpen, label: 'Projecten' },
  { to: '/dashboard/planning', icon: Clock, label: 'Planning' },
  { to: '/dashboard/facturen', icon: Receipt, label: 'Facturen' },
  { to: '/dashboard/portfolio', icon: Star, label: 'Portfolio' },
  { to: '/dashboard/notities', icon: StickyNote, label: 'Notities' },
  { to: '/dashboard/cheatsheet', icon: BookOpen, label: 'Cheatsheet' },
  { to: '/dashboard/instellingen', icon: Settings, label: 'Instellingen' },
]

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeMobile = () => setMobileOpen(false)

  return (
    <div className="dash">
      {/* Mobile header */}
      <header className="dash-mobile-header">
        <button className="dash-mobile-toggle" onClick={() => setMobileOpen(true)}>
          <Menu size={22} />
        </button>
        <img src="/logo-lumeza.jpg" alt="Studio Lumeza" className="dash-logo" />
        <span className="dash-brand">Studio Lumeza</span>
      </header>

      {/* Overlay */}
      {mobileOpen && <div className="dash-overlay" onClick={closeMobile} />}

      {/* Sidebar */}
      <aside className={`dash-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="dash-sidebar-top">
          <img src="/logo-lumeza.jpg" alt="Studio Lumeza" className="dash-logo" />
          <span className="dash-brand">Studio Lumeza</span>
          <button className="dash-mobile-close" onClick={closeMobile}>
            <X size={20} />
          </button>
        </div>
        <nav className="dash-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={closeMobile}
              className={({ isActive }) =>
                `dash-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <item.icon size={18} strokeWidth={1.5} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="dash-sidebar-bottom">
          <NavLink to="/welkom" className="dash-nav-item dash-back" onClick={closeMobile}>
            <ArrowLeft size={18} strokeWidth={1.5} />
            <span>Terug naar home</span>
          </NavLink>
        </div>
      </aside>

      <main className="dash-main">
        <Outlet />
      </main>
    </div>
  )
}
