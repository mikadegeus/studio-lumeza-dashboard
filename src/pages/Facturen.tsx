import { useState } from 'react'
import { Plus, X, Search, Trash2 } from 'lucide-react'
import type { useStore } from '../store'
import type { Invoice, InvoiceStatus, InvoiceLine } from '../types'

interface Props {
  store: ReturnType<typeof useStore>
}

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  concept: 'Concept',
  verstuurd: 'Verstuurd',
  betaald: 'Betaald',
  'te-laat': 'Te laat',
  geannuleerd: 'Geannuleerd',
}

const STATUS_COLORS: Record<InvoiceStatus, string> = {
  concept: 'badge-gray',
  verstuurd: 'badge-blue',
  betaald: 'badge-green',
  'te-laat': 'badge-red',
  geannuleerd: 'badge-red',
}

export function Facturen({ store }: Props) {
  const invoices: Invoice[] = store.invoices || []
  const { clients, projects } = store
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Invoice | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | InvoiceStatus>('all')
  const [form, setForm] = useState({
    invoiceNumber: '',
    clientId: '',
    projectId: '',
    lines: [{ description: '', amount: 0 }] as InvoiceLine[],
    status: 'concept' as InvoiceStatus,
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: '',
    paidDate: '',
    notes: '',
  })

  const today = new Date().toISOString().slice(0, 10)

  // Auto-mark overdue
  const displayInvoices = invoices.map(inv => {
    if (inv.status === 'verstuurd' && inv.dueDate < today) {
      return { ...inv, status: 'te-laat' as InvoiceStatus }
    }
    return inv
  })

  const filtered = displayInvoices
    .filter(inv => {
      if (filterStatus !== 'all' && inv.status !== filterStatus) return false
      const client = store.getClient(inv.clientId)
      const searchLower = search.toLowerCase()
      return (
        inv.invoiceNumber.toLowerCase().includes(searchLower) ||
        (client?.name || '').toLowerCase().includes(searchLower)
      )
    })
    .sort((a, b) => b.issueDate.localeCompare(a.issueDate))

  // Stats
  const totalBetaald = displayInvoices.filter(i => i.status === 'betaald').reduce((s, i) => s + i.total, 0)
  const totalOpen = displayInvoices.filter(i => i.status === 'verstuurd' || i.status === 'te-laat').reduce((s, i) => s + i.total, 0)
  const aantalTeLaat = displayInvoices.filter(i => i.status === 'te-laat').length

  const nextInvoiceNumber = () => {
    const year = new Date().getFullYear()
    const existing = invoices.filter(i => i.invoiceNumber.includes(`${year}`))
    const num = existing.length + 1
    return `LUM-${year}-${String(num).padStart(3, '0')}`
  }

  const openNew = () => {
    setEditing(null)
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 30)
    setForm({
      invoiceNumber: nextInvoiceNumber(),
      clientId: '',
      projectId: '',
      lines: [{ description: '', amount: 0 }],
      status: 'concept',
      issueDate: today,
      dueDate: dueDate.toISOString().slice(0, 10),
      paidDate: '',
      notes: '',
    })
    setShowModal(true)
  }

  const openEdit = (inv: Invoice) => {
    setEditing(inv)
    setForm({
      invoiceNumber: inv.invoiceNumber,
      clientId: inv.clientId,
      projectId: inv.projectId || '',
      lines: [...inv.lines],
      status: inv.status,
      issueDate: inv.issueDate,
      dueDate: inv.dueDate,
      paidDate: inv.paidDate || '',
      notes: inv.notes,
    })
    setShowModal(true)
  }

  const save = () => {
    if (!form.clientId) return
    const cleanLines = form.lines.filter(l => l.description.trim() || l.amount > 0)
    const total = cleanLines.reduce((s, l) => s + l.amount, 0)
    const data = {
      invoiceNumber: form.invoiceNumber,
      clientId: form.clientId,
      projectId: form.projectId || undefined,
      lines: cleanLines,
      total,
      status: form.status,
      issueDate: form.issueDate,
      dueDate: form.dueDate,
      paidDate: form.status === 'betaald' ? (form.paidDate || today) : undefined,
      notes: form.notes,
    }
    if (editing) {
      store.updateInvoice(editing.id, data)
    } else {
      store.addInvoice(data as Omit<Invoice, 'id' | 'createdAt'>)
    }
    setShowModal(false)
  }

  const remove = () => {
    if (editing) { store.deleteInvoice(editing.id); setShowModal(false) }
  }

  const addLine = () => setForm({ ...form, lines: [...form.lines, { description: '', amount: 0 }] })
  const updateLine = (index: number, field: keyof InvoiceLine, value: string | number) => {
    const updated = [...form.lines]
    updated[index] = { ...updated[index], [field]: value }
    setForm({ ...form, lines: updated })
  }
  const removeLine = (index: number) => setForm({ ...form, lines: form.lines.filter((_, i) => i !== index) })

  const formTotal = form.lines.reduce((s, l) => s + (Number(l.amount) || 0), 0)

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Facturen</h1>
          <p className="page-subtitle">{invoices.length} factuur{invoices.length !== 1 ? 'en' : ''}</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openNew}>
          <Plus size={16} /> Nieuwe factuur
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="stat-value" style={{ color: '#4ade80' }}>&euro;{totalBetaald.toLocaleString('nl-NL')}</div>
          <div className="stat-label">Betaald</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="stat-value" style={{ color: 'var(--gold-lighter)' }}>&euro;{totalOpen.toLocaleString('nl-NL')}</div>
          <div className="stat-label">Openstaand</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="stat-value" style={{ color: aantalTeLaat > 0 ? '#f87171' : 'var(--cream)' }}>{aantalTeLaat}</div>
          <div className="stat-label">Te laat</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {[
          { key: 'all' as const, label: 'Alles' },
          { key: 'concept' as const, label: 'Concept' },
          { key: 'verstuurd' as const, label: 'Verstuurd' },
          { key: 'betaald' as const, label: 'Betaald' },
          { key: 'te-laat' as const, label: 'Te laat' },
        ].map(f => (
          <button
            key={f.key}
            className={`btn btn-sm ${filterStatus === f.key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterStatus(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: '1.25rem', position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input type="text" className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="Zoek op factuurnummer of klant..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Invoice list */}
      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state"><p>{search || filterStatus !== 'all' ? 'Geen facturen gevonden' : 'Nog geen facturen'}</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nummer</th>
                  <th>Klant</th>
                  <th>Bedrag</th>
                  <th>Datum</th>
                  <th>Vervaldatum</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(inv => {
                  const client = store.getClient(inv.clientId)
                  return (
                    <tr key={inv.id} style={{ cursor: 'pointer' }} onClick={() => openEdit(inv)}>
                      <td style={{ fontWeight: 600 }}>{inv.invoiceNumber}</td>
                      <td>{client?.name || '—'}</td>
                      <td style={{ color: 'var(--gold-lighter)', fontFamily: 'var(--font-serif)', fontSize: '1rem' }}>
                        &euro;{inv.total.toLocaleString('nl-NL')}
                      </td>
                      <td>{new Date(inv.issueDate).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}</td>
                      <td>{new Date(inv.dueDate).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}</td>
                      <td><span className={`badge ${STATUS_COLORS[inv.status]}`}>{STATUS_LABELS[inv.status]}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="modal-title">{editing ? 'Factuur bewerken' : 'Nieuwe factuur'}</h2>
              <button className="table-btn" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Factuurnummer</label>
                <input type="text" className="form-input" value={form.invoiceNumber} onChange={e => setForm({ ...form, invoiceNumber: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as InvoiceStatus })}>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Klant</label>
              <select className="form-select" value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })}>
                <option value="">Selecteer klant...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Project (optioneel)</label>
              <select className="form-select" value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })}>
                <option value="">Geen</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>

            {/* Lines */}
            <div className="form-group">
              <label className="form-label">Regels</label>
              {form.lines.map((line, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input type="text" className="form-input" value={line.description} onChange={e => updateLine(i, 'description', e.target.value)} placeholder="Omschrijving" style={{ flex: 2 }} />
                  <div style={{ position: 'relative', flex: 1 }}>
                    <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>&euro;</span>
                    <input type="number" className="form-input" value={line.amount || ''} onChange={e => updateLine(i, 'amount', Number(e.target.value))} style={{ paddingLeft: '1.75rem' }} min={0} step={25} />
                  </div>
                  {form.lines.length > 1 && (
                    <button className="btn btn-danger btn-sm" onClick={() => removeLine(i)} style={{ flexShrink: 0 }}><Trash2 size={14} /></button>
                  )}
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                <button className="btn btn-secondary" onClick={addLine} style={{ fontSize: '0.75rem' }}>
                  <Plus size={14} /> Regel toevoegen
                </button>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--gold-lighter)' }}>
                  Totaal: &euro;{formTotal.toLocaleString('nl-NL')}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Factuurdatum</label>
                <input type="date" className="form-input" value={form.issueDate} onChange={e => setForm({ ...form, issueDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Vervaldatum</label>
                <input type="date" className="form-input" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
              </div>
            </div>

            {form.status === 'betaald' && (
              <div className="form-group">
                <label className="form-label">Betaaldatum</label>
                <input type="date" className="form-input" value={form.paidDate} onChange={e => setForm({ ...form, paidDate: e.target.value })} />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Notities</label>
              <textarea className="form-textarea" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Extra info..." />
            </div>

            <div className="modal-actions">
              {editing && <button className="btn btn-danger btn-sm" onClick={remove}><Trash2 size={14} /> Verwijderen</button>}
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
