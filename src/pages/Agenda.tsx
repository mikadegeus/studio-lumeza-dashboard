import { useState } from 'react'
import { Plus, ChevronLeft, ChevronRight, MapPin, Clock, X } from 'lucide-react'
import type { useStore } from '../store'
import type { Shoot } from '../types'

interface Props {
  store: ReturnType<typeof useStore>
}

const STATUS_COLORS: Record<Shoot['status'], string> = {
  gepland: 'badge-blue',
  bevestigd: 'badge-green',
  afgerond: 'badge-gold',
  geannuleerd: 'badge-red',
}

const STATUS_LABELS: Record<Shoot['status'], string> = {
  gepland: 'Gepland',
  bevestigd: 'Bevestigd',
  afgerond: 'Afgerond',
  geannuleerd: 'Geannuleerd',
}

export function Agenda({ store }: Props) {
  const { shoots, clients, packages } = store
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [showModal, setShowModal] = useState(false)
  const [editingShoot, setEditingShoot] = useState<Shoot | null>(null)
  const [form, setForm] = useState({
    clientId: '',
    packageId: '',
    date: '',
    time: '10:00',
    location: '',
    status: 'gepland' as Shoot['status'],
    notes: '',
  })

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7 // Monday = 0

  const calendarDays: (number | null)[] = []
  for (let i = 0; i < firstDayOfWeek; i++) calendarDays.push(null)
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d)

  const getShootsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return shoots.filter(s => s.date === dateStr && s.status !== 'geannuleerd')
  }

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1))

  const openNewShoot = (day?: number) => {
    setEditingShoot(null)
    setForm({
      clientId: clients[0]?.id ?? '',
      packageId: packages[0]?.id ?? '',
      date: day ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '',
      time: '10:00',
      location: '',
      status: 'gepland',
      notes: '',
    })
    setShowModal(true)
  }

  const openEditShoot = (shoot: Shoot) => {
    setEditingShoot(shoot)
    setForm({
      clientId: shoot.clientId,
      packageId: shoot.packageId,
      date: shoot.date,
      time: shoot.time,
      location: shoot.location,
      status: shoot.status,
      notes: shoot.notes,
    })
    setShowModal(true)
  }

  const saveShoot = () => {
    if (!form.clientId || !form.date) return
    if (editingShoot) {
      store.updateShoot(editingShoot.id, form)
    } else {
      store.addShoot(form)
    }
    setShowModal(false)
  }

  const deleteShoot = () => {
    if (editingShoot) {
      store.deleteShoot(editingShoot.id)
      setShowModal(false)
    }
  }

  // Upcoming list
  const upcoming = shoots
    .filter(s => s.status !== 'geannuleerd' && s.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Agenda</h1>
          <p className="page-subtitle">Plan en beheer al je shoots</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => openNewShoot()}>
          <Plus size={16} /> Nieuwe shoot
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
        {/* Calendar */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <button className="table-btn" onClick={prevMonth}><ChevronLeft size={18} /></button>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--cream)' }}>
              {currentMonth.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}
            </span>
            <button className="table-btn" onClick={nextMonth}><ChevronRight size={18} /></button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
            {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '0.6875rem', color: 'var(--text-muted)', padding: '0.5rem 0', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {calendarDays.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} />
              const dayShots = getShootsForDay(day)
              const isToday = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` === todayStr
              return (
                <div
                  key={day}
                  onClick={() => openNewShoot(day)}
                  style={{
                    minHeight: 72,
                    padding: '0.375rem',
                    borderRadius: 8,
                    border: isToday ? '1px solid var(--gold)' : '1px solid transparent',
                    background: dayShots.length > 0 ? 'var(--gold-muted)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    transition: 'background 200ms',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: isToday ? 'var(--gold-lighter)' : 'var(--text-secondary)', marginBottom: 4, fontWeight: isToday ? 600 : 400 }}>
                    {day}
                  </div>
                  {dayShots.map(s => {
                    const client = store.getClient(s.clientId)
                    return (
                      <div
                        key={s.id}
                        onClick={(e) => { e.stopPropagation(); openEditShoot(s) }}
                        style={{
                          fontSize: '0.625rem',
                          padding: '2px 4px',
                          borderRadius: 4,
                          background: 'rgba(139,122,46,0.25)',
                          color: 'var(--gold-lighter)',
                          marginBottom: 2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {s.time} {client?.name?.split(' ')[0]}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>

        {/* Upcoming sidebar */}
        <div className="card" style={{ alignSelf: 'start' }}>
          <div className="card-header">
            <span className="card-title">Komende shoots</span>
          </div>
          {upcoming.length === 0 ? (
            <div className="empty-state"><p>Geen komende shoots</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {upcoming.slice(0, 8).map(shoot => {
                const client = store.getClient(shoot.clientId)
                return (
                  <div
                    key={shoot.id}
                    onClick={() => openEditShoot(shoot)}
                    style={{ padding: '0.75rem', borderRadius: 8, background: 'rgba(255,255,255,0.02)', cursor: 'pointer', transition: 'background 200ms' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.875rem', color: 'var(--cream)' }}>{client?.name}</span>
                      <span className={`badge ${STATUS_COLORS[shoot.status]}`}>{STATUS_LABELS[shoot.status]}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span><Clock size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />{new Date(shoot.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })} {shoot.time}</span>
                      <span><MapPin size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />{shoot.location || '—'}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="modal-title">{editingShoot ? 'Shoot bewerken' : 'Nieuwe shoot'}</h2>
              <button className="table-btn" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="form-group">
              <label className="form-label">Klant</label>
              <select className="form-select" value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })}>
                <option value="">Selecteer klant...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Pakket</label>
              <select className="form-select" value={form.packageId} onChange={e => setForm({ ...form, packageId: e.target.value })}>
                <option value="">Selecteer pakket...</option>
                {packages.map(p => <option key={p.id} value={p.id}>{p.name} — &euro;{p.price}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Datum</label>
                <input type="date" className="form-input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Tijd</label>
                <input type="time" className="form-input" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Locatie</label>
              <input type="text" className="form-input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Studio, bij klant thuis, etc." />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Shoot['status'] })}>
                <option value="gepland">Gepland</option>
                <option value="bevestigd">Bevestigd</option>
                <option value="afgerond">Afgerond</option>
                <option value="geannuleerd">Geannuleerd</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Notities</label>
              <textarea className="form-textarea" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Extra informatie..." />
            </div>
            <div className="modal-actions">
              {editingShoot && (
                <button className="btn btn-danger btn-sm" onClick={deleteShoot}>Verwijderen</button>
              )}
              <div style={{ flex: 1 }} />
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuleren</button>
              <button className="btn btn-primary btn-sm" onClick={saveShoot}>Opslaan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
