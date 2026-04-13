import { Calendar, Users, Package, TrendingUp, Clock, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { useStore } from '../store'

interface Props {
  store: ReturnType<typeof useStore>
}

export function Overzicht({ store }: Props) {
  const navigate = useNavigate()
  const { clients, packages, shoots, tasks } = store

  const upcomingShoots = shoots
    .filter(s => s.status !== 'geannuleerd' && s.status !== 'afgerond' && s.date >= new Date().toISOString().slice(0, 10))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5)

  const pendingTasks = tasks.filter(t => !t.completed).slice(0, 5)
  const totalRevenue = shoots
    .filter(s => s.status === 'afgerond' || s.status === 'bevestigd')
    .reduce((sum, s) => {
      const pkg = store.getPackage(s.packageId)
      return sum + (pkg?.price ?? 0)
    }, 0)

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Overzicht</h1>
        <p className="page-subtitle">Welkom terug bij Studio Lumeza</p>
      </div>

      {/* Stats Grid */}
      <div className="grid-stats">
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard/klanten')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--gold-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-lighter)' }}>
              <Users size={18} />
            </div>
          </div>
          <div className="stat-value">{clients.length}</div>
          <div className="stat-label">Klanten</div>
        </div>

        <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard/agenda')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
              <Calendar size={18} />
            </div>
          </div>
          <div className="stat-value">{shoots.filter(s => s.status !== 'geannuleerd').length}</div>
          <div className="stat-label">Shoots</div>
        </div>

        <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard/pakketten')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4ade80' }}>
              <Package size={18} />
            </div>
          </div>
          <div className="stat-value">{packages.length}</div>
          <div className="stat-label">Pakketten</div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--gold-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-lighter)' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="stat-value">&euro;{totalRevenue.toLocaleString('nl-NL')}</div>
          <div className="stat-label">Verwachte omzet</div>
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid-2col">
        {/* Upcoming shoots */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Komende shoots</span>
            <button className="btn btn-sm btn-secondary" onClick={() => navigate('/dashboard/agenda')}>
              Alles bekijken
            </button>
          </div>
          {upcomingShoots.length === 0 ? (
            <div className="empty-state">
              <Calendar size={32} strokeWidth={1} />
              <p>Geen komende shoots</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {upcomingShoots.map(shoot => {
                const client = store.getClient(shoot.clientId)
                const pkg = store.getPackage(shoot.packageId)
                return (
                  <div key={shoot.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: 8, background: 'rgba(255,255,255,0.02)' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--cream)', marginBottom: '0.125rem' }}>
                        {client?.name ?? 'Onbekend'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {pkg?.name} &middot; {shoot.location}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--gold-lighter)' }}>
                        {new Date(shoot.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{shoot.time}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Tasks */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Open taken</span>
            <button className="btn btn-sm btn-secondary" onClick={() => navigate('/dashboard/planning')}>
              Alles bekijken
            </button>
          </div>
          {pendingTasks.length === 0 ? (
            <div className="empty-state">
              <CheckCircle2 size={32} strokeWidth={1} />
              <p>Alles afgerond!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {pendingTasks.map(task => (
                <div
                  key={task.id}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: 8, background: 'rgba(255,255,255,0.02)', cursor: 'pointer' }}
                  onClick={() => store.toggleTask(task.id)}
                >
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--black-border)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--cream)' }}>{task.title}</div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <Clock size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                    {new Date(task.dueDate).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
