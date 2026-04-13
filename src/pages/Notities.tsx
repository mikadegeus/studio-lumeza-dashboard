import { useState } from 'react'
import { Plus, Pin, Trash2, X, Search } from 'lucide-react'
import type { useStore } from '../store'
import type { Note } from '../types'

interface Props {
  store: ReturnType<typeof useStore>
}

const COLORS: { value: Note['color']; label: string; bg: string; border: string; text: string }[] = [
  { value: 'gold', label: 'Goud', bg: 'rgba(139,122,46,0.1)', border: 'rgba(139,122,46,0.3)', text: 'var(--gold-lighter)' },
  { value: 'blue', label: 'Blauw', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.25)', text: '#60a5fa' },
  { value: 'green', label: 'Groen', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.25)', text: '#4ade80' },
  { value: 'red', label: 'Rood', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', text: '#f87171' },
  { value: 'purple', label: 'Paars', bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.25)', text: '#c084fc' },
  { value: 'gray', label: 'Grijs', bg: 'rgba(156,163,175,0.06)', border: 'rgba(156,163,175,0.2)', text: '#9ca3af' },
]

function getColor(color: Note['color']) {
  return COLORS.find(c => c.value === color) ?? COLORS[0]
}

export function Notities({ store }: Props) {
  const notes: Note[] = store.notes || []
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Note | null>(null)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({
    title: '',
    content: '',
    color: 'gold' as Note['color'],
    pinned: false,
  })

  const sorted = [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    return b.updatedAt.localeCompare(a.updatedAt)
  })

  const filtered = sorted.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  )

  const openNew = () => {
    setEditing(null)
    setForm({ title: '', content: '', color: 'gold', pinned: false })
    setShowModal(true)
  }

  const openEdit = (note: Note) => {
    setEditing(note)
    setForm({ title: note.title, content: note.content, color: note.color, pinned: note.pinned })
    setShowModal(true)
  }

  const save = () => {
    if (!form.title.trim() && !form.content.trim()) return
    if (editing) {
      store.updateNote(editing.id, form)
    } else {
      store.addNote(form)
    }
    setShowModal(false)
  }

  const remove = () => {
    if (editing) {
      store.deleteNote(editing.id)
      setShowModal(false)
    }
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Notities</h1>
          <p className="page-subtitle">{notes.length} notitie{notes.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openNew}>
          <Plus size={16} /> Nieuwe notitie
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '1.25rem', position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          className="form-input"
          style={{ paddingLeft: '2.5rem' }}
          placeholder="Zoek in notities..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Notes grid */}
      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding: '3rem 2rem' }}>
            <p>{search ? 'Geen notities gevonden' : 'Nog geen notities. Maak je eerste notitie!'}</p>
          </div>
        </div>
      ) : (
        <div className="grid-notes">
          {filtered.map(note => {
            const c = getColor(note.color)
            return (
              <div
                key={note.id}
                onClick={() => openEdit(note)}
                style={{
                  background: c.bg,
                  border: `1px solid ${c.border}`,
                  borderRadius: 12,
                  padding: '1.25rem',
                  cursor: 'pointer',
                  transition: 'transform 200ms var(--ease-out-expo), box-shadow 200ms',
                  position: 'relative',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                {note.pinned && (
                  <Pin size={13} style={{ position: 'absolute', top: 10, right: 10, color: c.text, opacity: 0.6 }} />
                )}
                {note.title && (
                  <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--cream)', marginBottom: '0.5rem', paddingRight: note.pinned ? '1.5rem' : 0 }}>
                    {note.title}
                  </h3>
                )}
                {note.content && (
                  <p style={{
                    fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    display: '-webkit-box', WebkitLineClamp: 6, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {note.content}
                  </p>
                )}
                <div style={{ marginTop: '0.75rem', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  {new Date(note.updatedAt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="modal-title">{editing ? 'Notitie bewerken' : 'Nieuwe notitie'}</h2>
              <button className="table-btn" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>

            <div className="form-group">
              <label className="form-label">Titel</label>
              <input
                type="text"
                className="form-input"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Titel van de notitie"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Inhoud</label>
              <textarea
                className="form-textarea"
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                placeholder="Schrijf je notitie..."
                style={{ minHeight: 160, lineHeight: 1.6 }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Kleur</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {COLORS.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setForm({ ...form, color: c.value })}
                    style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: c.bg,
                      border: `2px solid ${form.color === c.value ? c.text : c.border}`,
                      cursor: 'pointer',
                      transition: 'border-color 150ms',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {form.color === c.value && (
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.text }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                fontSize: '0.8125rem', color: 'var(--text-secondary)',
              }}>
                <input
                  type="checkbox"
                  checked={form.pinned}
                  onChange={e => setForm({ ...form, pinned: e.target.checked })}
                  style={{ accentColor: 'var(--gold)' }}
                />
                <Pin size={14} /> Vastpinnen bovenaan
              </label>
            </div>

            <div className="modal-actions">
              {editing && (
                <button className="btn btn-danger btn-sm" onClick={remove}>
                  <Trash2 size={14} /> Verwijderen
                </button>
              )}
              <div style={{ flex: 1 }} />
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuleren</button>
              <button className="btn btn-primary btn-sm" onClick={save}>Opslaan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
