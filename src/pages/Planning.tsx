import { useState } from 'react'
import { Plus, Check, Circle, Clock, X, Trash2 } from 'lucide-react'
import type { useStore } from '../store'

interface Props {
  store: ReturnType<typeof useStore>
}

export function Planning({ store }: Props) {
  const { tasks, shoots } = store
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', dueDate: '', shootId: '' })
  const [filter, setFilter] = useState<'all' | 'open' | 'done'>('all')

  const today = new Date().toISOString().slice(0, 10)

  const filtered = tasks
    .filter(t => {
      if (filter === 'open') return !t.completed
      if (filter === 'done') return t.completed
      return true
    })
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      return a.dueDate.localeCompare(b.dueDate)
    })

  const openNew = () => {
    setForm({ title: '', dueDate: today, shootId: '' })
    setShowModal(true)
  }

  const save = () => {
    if (!form.title.trim()) return
    store.addTask({
      title: form.title,
      dueDate: form.dueDate,
      shootId: form.shootId || undefined,
      completed: false,
    })
    setShowModal(false)
  }

  const overdueTasks = tasks.filter(t => !t.completed && t.dueDate < today)
  const todayTasks = tasks.filter(t => !t.completed && t.dueDate === today)
  const completedCount = tasks.filter(t => t.completed).length

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Planning</h1>
          <p className="page-subtitle">Beheer je taken en deadlines</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openNew}>
          <Plus size={16} /> Nieuwe taak
        </button>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="stat-value" style={{ color: overdueTasks.length > 0 ? '#f87171' : 'var(--cream)' }}>
            {overdueTasks.length}
          </div>
          <div className="stat-label">Te laat</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="stat-value" style={{ color: 'var(--gold-lighter)' }}>{todayTasks.length}</div>
          <div className="stat-label">Vandaag</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="stat-value" style={{ color: '#4ade80' }}>{completedCount}</div>
          <div className="stat-label">Afgerond</div>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[
          { key: 'all' as const, label: 'Alles' },
          { key: 'open' as const, label: 'Open' },
          { key: 'done' as const, label: 'Afgerond' },
        ].map(f => (
          <button
            key={f.key}
            className={`btn btn-sm ${filter === f.key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state"><p>Geen taken gevonden</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filtered.map(task => {
              const isOverdue = !task.completed && task.dueDate < today
              const shoot = task.shootId ? shoots.find(s => s.id === task.shootId) : null
              const client = shoot ? store.getClient(shoot.clientId) : null
              return (
                <div
                  key={task.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.875rem 1rem',
                    borderBottom: '1px solid rgba(42,42,38,0.5)',
                    opacity: task.completed ? 0.5 : 1,
                    transition: 'opacity 300ms',
                  }}
                >
                  <button
                    onClick={() => store.toggleTask(task.id)}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      border: `2px solid ${task.completed ? 'var(--gold)' : 'var(--black-border)'}`,
                      background: task.completed ? 'var(--gold)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      cursor: 'pointer',
                      transition: 'all 200ms',
                    }}
                  >
                    {task.completed && <Check size={12} color="var(--cream)" />}
                  </button>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '0.875rem',
                      color: task.completed ? 'var(--text-muted)' : 'var(--cream)',
                      textDecoration: task.completed ? 'line-through' : 'none',
                    }}>
                      {task.title}
                    </div>
                    {client && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        Shoot: {client.name}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: isOverdue ? '#f87171' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} />
                      {new Date(task.dueDate).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                    </span>
                    <button className="table-btn" onClick={() => store.deleteTask(task.id)} style={{ color: 'var(--text-muted)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="modal-title">Nieuwe taak</h2>
              <button className="table-btn" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="form-group">
              <label className="form-label">Titel</label>
              <input type="text" className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Wat moet er gedaan worden?" />
            </div>
            <div className="form-group">
              <label className="form-label">Deadline</label>
              <input type="date" className="form-input" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Gekoppelde shoot (optioneel)</label>
              <select className="form-select" value={form.shootId} onChange={e => setForm({ ...form, shootId: e.target.value })}>
                <option value="">Geen</option>
                {shoots.filter(s => s.status !== 'geannuleerd').map(s => {
                  const client = store.getClient(s.clientId)
                  return <option key={s.id} value={s.id}>{client?.name} — {new Date(s.date).toLocaleDateString('nl-NL')}</option>
                })}
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuleren</button>
              <button className="btn btn-primary btn-sm" onClick={save}>Toevoegen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
