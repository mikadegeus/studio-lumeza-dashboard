import { useState } from 'react'
import {
  Plus, X, FolderOpen, Camera, Briefcase,
  ChevronRight, MessageSquare, Trash2, Send, ClipboardList, Check,
} from 'lucide-react'
import type { useStore } from '../store'
import type { Project, ProjectStatus } from '../types'

interface Props {
  store: ReturnType<typeof useStore>
}

const SHOOT_STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: 'geboekt', label: 'Geboekt' },
  { value: 'shoot', label: 'Shoot' },
  { value: 'nabewerking', label: 'Nabewerking' },
  { value: 'opgeleverd', label: 'Opgeleverd' },
]

const STANDALONE_STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: 'lopend', label: 'Lopend' },
  { value: 'on-hold', label: 'On hold' },
  { value: 'afgerond', label: 'Afgerond' },
]

const STATUS_COLORS: Record<ProjectStatus, string> = {
  geboekt: '#60a5fa',
  shoot: '#fbbf24',
  nabewerking: '#c084fc',
  opgeleverd: '#4ade80',
  lopend: '#60a5fa',
  'on-hold': '#9ca3af',
  afgerond: '#4ade80',
}

function getStepIndex(status: ProjectStatus): number {
  return SHOOT_STATUSES.findIndex(s => s.value === status)
}

export function Projecten({ store }: Props) {
  const { projects, clients, shoots, packages, packPresets = [] } = store
  const [showModal, setShowModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [noteText, setNoteText] = useState('')
  const [packItemText, setPackItemText] = useState('')
  const [showPresets, setShowPresets] = useState(false)
  const [filter, setFilter] = useState<'all' | 'shoot' | 'standalone'>('all')
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'shoot' as Project['type'],
    status: 'geboekt' as ProjectStatus,
    clientId: '',
    shootId: '',
    packageId: '',
    deadline: '',
  })

  const filtered = projects.filter(p => {
    if (filter === 'shoot') return p.type === 'shoot'
    if (filter === 'standalone') return p.type === 'standalone'
    return true
  })

  const openNew = () => {
    setForm({
      title: '',
      description: '',
      type: 'shoot',
      status: 'geboekt',
      clientId: '',
      shootId: '',
      packageId: '',
      deadline: '',
    })
    setShowModal(true)
  }

  const save = () => {
    if (!form.title.trim()) return
    store.addProject({
      title: form.title,
      description: form.description,
      type: form.type,
      status: form.type === 'shoot' ? 'geboekt' : 'lopend',
      clientId: form.clientId || undefined,
      shootId: form.shootId || undefined,
      packageId: form.packageId || undefined,
      deadline: form.deadline || undefined,
    })
    setShowModal(false)
  }

  const addNote = () => {
    if (!noteText.trim() || !selectedProject) return
    store.addProjectNote(selectedProject.id, noteText)
    setNoteText('')
    // refresh selected project
    setSelectedProject(prev => {
      if (!prev) return null
      const updated = projects.find(p => p.id === prev.id)
      return updated ?? prev
    })
  }

  // Keep selectedProject in sync
  const activeProject = selectedProject
    ? projects.find(p => p.id === selectedProject.id) ?? null
    : null

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Projecten</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 'en' : ''}</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openNew}>
          <Plus size={16} /> Nieuw project
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[
          { key: 'all' as const, label: 'Alles', icon: FolderOpen },
          { key: 'shoot' as const, label: 'Shoots', icon: Camera },
          { key: 'standalone' as const, label: 'Projecten', icon: Briefcase },
        ].map(f => (
          <button
            key={f.key}
            className={`btn btn-sm ${filter === f.key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(f.key)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
          >
            <f.icon size={14} /> {f.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: activeProject ? '1fr 400px' : '1fr', gap: '1.5rem' }}>
        {/* Project list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.length === 0 ? (
            <div className="card">
              <div className="empty-state"><p>Geen projecten gevonden</p></div>
            </div>
          ) : (
            filtered.map(project => {
              const client = project.clientId ? store.getClient(project.clientId) : null
              const pkg = project.packageId ? store.getPackage(project.packageId) : null
              const isActive = activeProject?.id === project.id
              const statusColor = STATUS_COLORS[project.status]

              return (
                <div
                  key={project.id}
                  className="card"
                  onClick={() => setSelectedProject(project)}
                  style={{
                    cursor: 'pointer',
                    borderColor: isActive ? 'var(--gold)' : undefined,
                    transition: 'border-color 200ms',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: project.type === 'shoot' ? 'var(--gold-muted)' : 'rgba(59,130,246,0.12)',
                        color: project.type === 'shoot' ? 'var(--gold-lighter)' : '#60a5fa',
                      }}>
                        {project.type === 'shoot' ? <Camera size={18} /> : <Briefcase size={18} />}
                      </div>
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--cream)' }}>{project.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {client?.name}{client && pkg ? ' · ' : ''}{pkg?.name}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge" style={{
                        background: `${statusColor}20`,
                        color: statusColor,
                      }}>
                        {project.type === 'shoot'
                          ? SHOOT_STATUSES.find(s => s.value === project.status)?.label
                          : STANDALONE_STATUSES.find(s => s.value === project.status)?.label
                        }
                      </span>
                      <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </div>

                  {/* Shoot workflow progress bar */}
                  {project.type === 'shoot' && (
                    <div style={{ display: 'flex', gap: 3, marginTop: '0.5rem' }}>
                      {SHOOT_STATUSES.map((step, i) => {
                        const currentIndex = getStepIndex(project.status)
                        const isCompleted = i <= currentIndex
                        return (
                          <div
                            key={step.value}
                            style={{
                              flex: 1,
                              height: 4,
                              borderRadius: 2,
                              background: isCompleted ? STATUS_COLORS[step.value] : 'var(--black-border)',
                              transition: 'background 300ms',
                            }}
                          />
                        )
                      })}
                    </div>
                  )}

                  {project.description && (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
                      {project.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {project.deadline && (
                      <span>Deadline: {new Date(project.deadline).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}</span>
                    )}
                    {project.notes.length > 0 && (
                      <span>{project.notes.length} notitie{project.notes.length !== 1 ? 's' : ''}</span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Detail panel */}
        {activeProject && (
          <div className="card" style={{ alignSelf: 'start', position: 'sticky', top: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--cream)' }}>
                {activeProject.title}
              </h3>
              <button className="table-btn" onClick={() => setSelectedProject(null)}>
                <X size={18} />
              </button>
            </div>

            {/* Status changer */}
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={activeProject.status}
                onChange={e => store.updateProjectStatus(activeProject.id, e.target.value as ProjectStatus)}
              >
                {(activeProject.type === 'shoot' ? SHOOT_STATUSES : STANDALONE_STATUSES).map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Shoot workflow steps */}
            {activeProject.type === 'shoot' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ marginBottom: '0.75rem' }}>Workflow</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {SHOOT_STATUSES.map((step, i) => {
                    const currentIndex = getStepIndex(activeProject.status)
                    const isCompleted = i <= currentIndex
                    const isCurrent = i === currentIndex
                    return (
                      <div
                        key={step.value}
                        onClick={() => store.updateProjectStatus(activeProject.id, step.value)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.5rem 0.75rem',
                          borderRadius: 8,
                          background: isCurrent ? `${STATUS_COLORS[step.value]}15` : 'transparent',
                          border: isCurrent ? `1px solid ${STATUS_COLORS[step.value]}40` : '1px solid transparent',
                          cursor: 'pointer',
                          transition: 'all 200ms',
                        }}
                      >
                        <div style={{
                          width: 24, height: 24, borderRadius: '50%',
                          background: isCompleted ? STATUS_COLORS[step.value] : 'var(--black-border)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.6875rem', fontWeight: 700, color: isCompleted ? '#000' : 'var(--text-muted)',
                          transition: 'all 200ms',
                        }}>
                          {i + 1}
                        </div>
                        <span style={{
                          fontSize: '0.8125rem',
                          color: isCurrent ? STATUS_COLORS[step.value] : isCompleted ? 'var(--cream)' : 'var(--text-muted)',
                          fontWeight: isCurrent ? 600 : 400,
                        }}>
                          {step.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Info */}
            {activeProject.clientId && (
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                Klant: {store.getClient(activeProject.clientId)?.name}
              </div>
            )}
            {activeProject.packageId && (
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                Pakket: {store.getPackage(activeProject.packageId)?.name}
              </div>
            )}
            {activeProject.deadline && (
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Deadline: {new Date(activeProject.deadline).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            )}

            {/* Pack list */}
            <div style={{ borderTop: '1px solid var(--black-border)', paddingTop: '1rem', marginTop: '1rem' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <ClipboardList size={13} /> Paklijst
                </span>
                {(activeProject.packList || []).length > 0 && (
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    {(activeProject.packList || []).filter(i => i.checked).length}/{(activeProject.packList || []).length}
                  </span>
                )}
              </label>

              {(activeProject.packList || []).length === 0 && (
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontStyle: 'italic' }}>
                  Nog geen items
                </p>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.75rem' }}>
                {(activeProject.packList || []).map(item => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.625rem',
                      borderRadius: 6,
                      background: 'rgba(255,255,255,0.02)',
                      transition: 'opacity 200ms',
                      opacity: item.checked ? 0.5 : 1,
                    }}
                  >
                    <button
                      onClick={() => store.togglePackListItem(activeProject.id, item.id)}
                      style={{
                        width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                        border: `2px solid ${item.checked ? 'var(--gold)' : 'var(--black-border)'}`,
                        background: item.checked ? 'var(--gold)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'all 200ms',
                      }}
                    >
                      {item.checked && <Check size={12} color="var(--cream)" />}
                    </button>
                    <span style={{
                      flex: 1, fontSize: '0.8125rem',
                      color: item.checked ? 'var(--text-muted)' : 'var(--cream)',
                      textDecoration: item.checked ? 'line-through' : 'none',
                    }}>
                      {item.name}
                    </span>
                    <button
                      className="table-btn"
                      onClick={() => store.deletePackListItem(activeProject.id, item.id)}
                      style={{ color: 'var(--text-muted)', opacity: 0.5 }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  value={packItemText}
                  onChange={e => setPackItemText(e.target.value)}
                  placeholder="Item toevoegen..."
                  onKeyDown={e => {
                    if (e.key === 'Enter' && packItemText.trim()) {
                      store.addPackListItem(activeProject.id, packItemText.trim())
                      setPackItemText('')
                    }
                  }}
                  style={{ fontSize: '0.8125rem' }}
                />
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    if (packItemText.trim()) {
                      store.addPackListItem(activeProject.id, packItemText.trim())
                      setPackItemText('')
                    }
                  }}
                  style={{ flexShrink: 0 }}
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Preset picker toggle */}
              <button
                className="btn btn-secondary"
                onClick={() => setShowPresets(!showPresets)}
                style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', fontSize: '0.75rem' }}
              >
                <ClipboardList size={13} /> {showPresets ? 'Lijst verbergen' : 'Kies uit standaard items'}
              </button>

              {/* Preset items */}
              {showPresets && (
                <div style={{
                  marginTop: '0.5rem',
                  border: '1px solid var(--black-border)',
                  borderRadius: 10,
                  background: 'var(--black-soft)',
                  padding: '0.75rem',
                  maxHeight: 320,
                  overflowY: 'auto',
                }}>
                  {packPresets.map(category => {
                    const existingNames = (activeProject.packList || []).map(i => i.name)
                    return (
                      <div key={category.id} style={{ marginBottom: '0.75rem' }}>
                        <div style={{
                          fontSize: '0.6875rem', fontWeight: 600, color: 'var(--gold)',
                          letterSpacing: '0.05em', textTransform: 'uppercase',
                          marginBottom: '0.375rem',
                        }}>
                          {category.name}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                          {category.items.map(item => {
                            const alreadyAdded = existingNames.includes(item)
                            return (
                              <button
                                key={item}
                                onClick={() => {
                                  if (!alreadyAdded) store.addPackListItem(activeProject.id, item)
                                }}
                                disabled={alreadyAdded}
                                style={{
                                  fontSize: '0.75rem',
                                  padding: '0.25rem 0.625rem',
                                  borderRadius: 6,
                                  border: '1px solid',
                                  borderColor: alreadyAdded ? 'transparent' : 'var(--black-border)',
                                  background: alreadyAdded ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.03)',
                                  color: alreadyAdded ? '#4ade80' : 'var(--text-secondary)',
                                  cursor: alreadyAdded ? 'default' : 'pointer',
                                  transition: 'all 150ms',
                                  display: 'flex', alignItems: 'center', gap: '0.25rem',
                                }}
                              >
                                {alreadyAdded ? <Check size={11} /> : <Plus size={11} />}
                                {item}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Notes */}
            <div style={{ borderTop: '1px solid var(--black-border)', paddingTop: '1rem', marginTop: '1rem' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.75rem' }}>
                <MessageSquare size={13} /> Notities
              </label>

              {activeProject.notes.length === 0 && (
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontStyle: 'italic' }}>
                  Nog geen notities
                </p>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {activeProject.notes.map(note => (
                  <div key={note.id} style={{ padding: '0.625rem 0.75rem', borderRadius: 8, background: 'rgba(255,255,255,0.03)', fontSize: '0.8125rem' }}>
                    <div style={{ color: 'var(--cream)', marginBottom: '0.25rem' }}>{note.text}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        {new Date(note.createdAt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                      </span>
                      <button
                        className="table-btn"
                        onClick={() => store.deleteProjectNote(activeProject.id, note.id)}
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Schrijf een notitie..."
                  onKeyDown={e => e.key === 'Enter' && addNote()}
                  style={{ fontSize: '0.8125rem' }}
                />
                <button className="btn btn-primary btn-sm" onClick={addNote} style={{ flexShrink: 0 }}>
                  <Send size={14} />
                </button>
              </div>
            </div>

            {/* Delete */}
            <div style={{ borderTop: '1px solid var(--black-border)', paddingTop: '1rem', marginTop: '1rem' }}>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => { store.deleteProject(activeProject.id); setSelectedProject(null) }}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Trash2 size={14} /> Project verwijderen
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New project modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="modal-title">Nieuw project</h2>
              <button className="table-btn" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>

            {/* Type selector */}
            <div className="form-group">
              <label className="form-label">Type</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[
                  { value: 'shoot' as const, label: 'Shoot project', icon: Camera },
                  { value: 'standalone' as const, label: 'Los project', icon: Briefcase },
                ].map(t => (
                  <button
                    key={t.value}
                    className={`btn btn-sm ${form.type === t.value ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setForm({ ...form, type: t.value })}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <t.icon size={14} /> {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Titel</label>
              <input type="text" className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Bijv. Bruiloft Sophie & Mark" />
            </div>

            <div className="form-group">
              <label className="form-label">Beschrijving</label>
              <textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Korte beschrijving van het project" />
            </div>

            {form.type === 'shoot' && (
              <>
                <div className="form-group">
                  <label className="form-label">Klant</label>
                  <select className="form-select" value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })}>
                    <option value="">Selecteer klant...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Shoot</label>
                  <select className="form-select" value={form.shootId} onChange={e => setForm({ ...form, shootId: e.target.value })}>
                    <option value="">Selecteer shoot...</option>
                    {shoots.filter(s => s.status !== 'geannuleerd').map(s => {
                      const client = store.getClient(s.clientId)
                      return <option key={s.id} value={s.id}>{client?.name} — {new Date(s.date).toLocaleDateString('nl-NL')}</option>
                    })}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Pakket</label>
                  <select className="form-select" value={form.packageId} onChange={e => setForm({ ...form, packageId: e.target.value })}>
                    <option value="">Selecteer pakket...</option>
                    {packages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Deadline (optioneel)</label>
              <input type="date" className="form-input" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuleren</button>
              <button className="btn btn-primary btn-sm" onClick={save}>Aanmaken</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
