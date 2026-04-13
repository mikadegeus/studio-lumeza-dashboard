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
  Settings,
  ArrowLeft,
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
  { to: '/dashboard/instellingen', icon: Settings, label: 'Instellingen' },
]

export function DashboardLayout() {
  return (
    <div className="dash">
      <aside className="dash-sidebar">
        <div className="dash-sidebar-top">
          <img src="/logo-lumeza.jpg" alt="Studio Lumeza" className="dash-logo" />
          <span className="dash-brand">Studio Lumeza</span>
        </div>
        <nav className="dash-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
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
          <NavLink to="/" className="dash-nav-item dash-back">
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
