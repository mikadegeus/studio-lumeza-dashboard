import { useState } from 'react'
import { Plus, Pin, Trash2, X, Search, Edit2, ArrowLeft } from 'lucide-react'
import type { useStore } from '../store'
import type { Note } from '../types'
import './Notities.css'

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
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [showNewModal, setShowNewModal] = useState(false)
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

  const selectedNote = notes.find(n => n.id === selectedId) ?? null
  const selectedColor = selectedNote ? getColor(selectedNote.color) : null

  const openNew = () => {
    setForm({ title: '', content: '', color: 'gold', pinned: false })
    setShowNewModal(true)
  }

  const saveNew = () => {
    if (!form.title.trim() && !form.content.trim()) return
    store.addNote(form)
    setShowNewModal(false)
  }

  const startEdit = () => {
    if (!selectedNote) return
    setForm({ title: selectedNote.title, content: selectedNote.content, color: selectedNote.color, pinned: selectedNote.pinned })
    setEditing(true)
  }

  const saveEdit = () => {
    if (selectedNote) {
      store.updateNote(selectedNote.id, form)
    }
    setEditing(false)
  }

  const cancelEdit = () => setEditing(false)

  const deleteNote = () => {
    if (selectedNote) {
      store.deleteNote(selectedNote.id)
      setSelectedId(null)
      setEditing(false)
    }
  }

  return (
    <div className="notities-layout">
      {/* ─── Left: List ─── */}
      <div className={`notities-list ${selectedId ? 'has-selection' : ''}`}>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">Notities</h1>
            <p className="page-subtitle">{notes.length} notitie{notes.length !== 1 ? 's' : ''}</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={openNew}>
            <Plus size={16} /> Nieuw
          </button>
        </div>

        <div style={{ marginBottom: '1rem', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Zoek..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="notities-items">
          {filtered.length === 0 && (
            <div className="empty-state"><p>{search ? 'Geen notities gevonden' : 'Nog geen notities'}</p></div>
          )}
          {filtered.map(note => {
            const c = getColor(note.color)
            const isActive = note.id === selectedId
            return (
              <div
                key={note.id}
                onClick={() => { setSelectedId(note.id); setEditing(false) }}
                className={`notitie-item ${isActive ? 'active' : ''}`}
                style={{ borderLeftColor: c.text }}
              >
                <div className="notitie-item-header">
                  <span className="notitie-item-title">{note.title || 'Zonder titel'}</span>
                  {note.pinned && <Pin size={11} style={{ color: c.text, flexShrink: 0 }} />}
                </div>
                <p className="notitie-item-preview">{note.content}</p>
                <span className="notitie-item-date">
                  {new Date(note.updatedAt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── Right: Detail ─── */}
      <div className={`notities-detail ${selectedId ? 'visible' : ''}`}>
        {!selectedNote ? (
          <div className="notities-detail-empty">
            <p style={{ color: 'var(--text-muted)' }}>Selecteer een notitie om te lezen</p>
          </div>
        ) : editing ? (
          /* ── Edit mode ── */
          <div className="notities-detail-content">
            <div className="notities-detail-toolbar">
              <button className="btn btn-secondary" onClick={cancelEdit} style={{ fontSize: '0.8125rem' }}>
                Annuleren
              </button>
              <div style={{ flex: 1 }} />
              <button className="btn btn-primary btn-sm" onClick={saveEdit}>Opslaan</button>
            </div>
            <input
              type="text"
              className="form-input"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Titel"
              style={{ fontSize: '1.25rem', fontWeight: 600, border: 'none', background: 'transparent', padding: '0', marginBottom: '1rem', color: 'var(--cream)' }}
            />
            <textarea
              className="form-textarea"
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              placeholder="Schrijf je notitie..."
              style={{ flex: 1, minHeight: 300, lineHeight: 1.8, fontSize: '0.9375rem', border: 'none', background: 'transparent', padding: 0, resize: 'none' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--black-border)' }}>
              <span className="form-label" style={{ margin: 0 }}>Kleur</span>
              <div style={{ display: 'flex', gap: '0.375rem' }}>
                {COLORS.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setForm({ ...form, color: c.value })}
                    style={{
                      width: 24, height: 24, borderRadius: 6,
                      background: c.bg,
                      border: `2px solid ${form.color === c.value ? c.text : 'transparent'}`,
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </div>
              <div style={{ flex: 1 }} />
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.pinned} onChange={e => setForm({ ...form, pinned: e.target.checked })} style={{ accentColor: 'var(--gold)' }} />
                <Pin size={12} /> Pin
              </label>
            </div>
          </div>
        ) : (
          /* ── Read mode ── */
          <div className="notities-detail-content">
            <div className="notities-detail-toolbar">
              <button className="btn btn-secondary notities-back-btn" onClick={() => setSelectedId(null)} style={{ fontSize: '0.8125rem' }}>
                <ArrowLeft size={14} /> Terug
              </button>
              <div style={{ flex: 1 }} />
              <button className="table-btn" onClick={() => store.togglePinNote(selectedNote.id)} title={selectedNote.pinned ? 'Losmaken' : 'Vastpinnen'}>
                <Pin size={16} style={{ color: selectedNote.pinned ? 'var(--gold-lighter)' : 'var(--text-muted)' }} />
              </button>
              <button className="table-btn" onClick={startEdit} title="Bewerken">
                <Edit2 size={16} style={{ color: 'var(--text-secondary)' }} />
              </button>
              <button className="table-btn" onClick={deleteNote} title="Verwijderen">
                <Trash2 size={16} style={{ color: '#f87171' }} />
              </button>
            </div>
            <div
              className="notities-reader"
              style={{ borderLeftColor: selectedColor?.text }}
            >
              {selectedNote.title && (
                <h2 className="notities-reader-title">{selectedNote.title}</h2>
              )}
              <div className="notities-reader-meta">
                {new Date(selectedNote.updatedAt).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              <div className="notities-reader-body">
                {selectedNote.content}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── New note modal ─── */}
      {showNewModal && (
        <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="modal-title">Nieuwe notitie</h2>
              <button className="table-btn" onClick={() => setShowNewModal(false)}><X size={18} /></button>
            </div>
            <div className="form-group">
              <label className="form-label">Titel</label>
              <input type="text" className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Titel" />
            </div>
            <div className="form-group">
              <label className="form-label">Inhoud</label>
              <textarea className="form-textarea" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Schrijf je notitie..." style={{ minHeight: 160, lineHeight: 1.7 }} />
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
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {form.color === c.value && <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.text }} />}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <input type="checkbox" checked={form.pinned} onChange={e => setForm({ ...form, pinned: e.target.checked })} style={{ accentColor: 'var(--gold)' }} />
                <Pin size={14} /> Vastpinnen bovenaan
              </label>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowNewModal(false)}>Annuleren</button>
              <button className="btn btn-primary btn-sm" onClick={saveNew}>Aanmaken</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
