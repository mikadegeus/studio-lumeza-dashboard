import { useState } from 'react'
import { Plus, X, Trash2, Image, ExternalLink } from 'lucide-react'
import type { useStore } from '../store'

interface Props {
  store: ReturnType<typeof useStore>
}

export function Portfolio({ store }: Props) {
  const { portfolio, clients, packages } = store
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    imageUrl: '',
    clientId: '',
    packageId: '',
    date: new Date().toISOString().slice(0, 10),
  })

  const openNew = () => {
    setForm({
      title: '',
      description: '',
      imageUrl: '',
      clientId: '',
      packageId: '',
      date: new Date().toISOString().slice(0, 10),
    })
    setShowModal(true)
  }

  const save = () => {
    if (!form.title.trim()) return
    store.addPortfolioItem({
      title: form.title,
      description: form.description,
      imageUrl: form.imageUrl,
      clientId: form.clientId || undefined,
      packageId: form.packageId || undefined,
      date: form.date,
    })
    setShowModal(false)
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Portfolio</h1>
          <p className="page-subtitle">Koppel je beste werk aan klanten en pakketten</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openNew}>
          <Plus size={16} /> Item toevoegen
        </button>
      </div>

      {portfolio.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding: '4rem 2rem' }}>
            <Image size={48} strokeWidth={1} style={{ color: 'var(--gold)', marginBottom: '1rem' }} />
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--cream)', marginBottom: '0.5rem' }}>
              Nog geen portfolio items
            </h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto 1.5rem' }}>
              Voeg je favoriete shoots toe en koppel ze aan klanten en pakketten voor een compleet overzicht.
            </p>
            <button className="btn btn-primary btn-sm" onClick={openNew}>
              <Plus size={16} /> Eerste item toevoegen
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {portfolio.map(item => {
            const client = item.clientId ? store.getClient(item.clientId) : null
            const pkg = item.packageId ? store.getPackage(item.packageId) : null
            return (
              <div key={item.id} className="card" style={{ overflow: 'hidden', padding: 0 }}>
                {item.imageUrl ? (
                  <div style={{ height: 200, background: 'var(--black-soft)', overflow: 'hidden' }}>
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  </div>
                ) : (
                  <div style={{ height: 200, background: 'var(--gold-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Image size={48} strokeWidth={1} color="var(--gold)" />
                  </div>
                )}
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', fontWeight: 600, color: 'var(--cream)' }}>{item.title}</h3>
                    <button
                      className="table-btn"
                      onClick={() => store.deletePortfolioItem(item.id)}
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {item.description && (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                      {item.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {client && <span className="badge badge-gold">{client.name}</span>}
                    {pkg && <span className="badge badge-blue">{pkg.name}</span>}
                    <span className="badge badge-gray">
                      {new Date(item.date).toLocaleDateString('nl-NL', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="modal-title">Portfolio item toevoegen</h2>
              <button className="table-btn" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="form-group">
              <label className="form-label">Titel</label>
              <input type="text" className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Bijv. Bruiloft Sophie & Mark" />
            </div>
            <div className="form-group">
              <label className="form-label">Beschrijving</label>
              <textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Korte beschrijving van de shoot" />
            </div>
            <div className="form-group">
              <label className="form-label">Afbeelding URL (optioneel)</label>
              <input type="url" className="form-input" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Klant (optioneel)</label>
                <select className="form-select" value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })}>
                  <option value="">Geen</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Pakket (optioneel)</label>
                <select className="form-select" value={form.packageId} onChange={e => setForm({ ...form, packageId: e.target.value })}>
                  <option value="">Geen</option>
                  {packages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Datum</label>
              <input type="date" className="form-input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
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
