import { useState } from 'react'
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react'
import type { useStore } from '../store'
import type { PackageOption } from '../types'

interface Props {
  store: ReturnType<typeof useStore>
}

const CATEGORY_LABELS: Record<PackageOption['category'], string> = {
  wedding: 'Bruiloft',
  pregnancy: 'Zwangerschap',
  kids: 'Kids',
  portrait: 'Portret',
  other: 'Overig',
}

const CATEGORY_COLORS: Record<PackageOption['category'], string> = {
  wedding: 'badge-gold',
  pregnancy: 'badge-green',
  kids: 'badge-blue',
  portrait: 'badge-gray',
  other: 'badge-gray',
}

export function Pakketten({ store }: Props) {
  const { packages } = store
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<PackageOption | null>(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: 0,
    includes: [''],
    category: 'other' as PackageOption['category'],
  })

  const openNew = () => {
    setEditing(null)
    setForm({ name: '', description: '', price: 0, includes: [''], category: 'other' })
    setShowModal(true)
  }

  const openEdit = (pkg: PackageOption) => {
    setEditing(pkg)
    setForm({
      name: pkg.name,
      description: pkg.description,
      price: pkg.price,
      includes: pkg.includes.length > 0 ? [...pkg.includes] : [''],
      category: pkg.category,
    })
    setShowModal(true)
  }

  const save = () => {
    if (!form.name.trim()) return
    const cleanIncludes = form.includes.filter(i => i.trim() !== '')
    if (editing) {
      store.updatePackage(editing.id, { ...form, includes: cleanIncludes })
    } else {
      store.addPackage({ ...form, includes: cleanIncludes })
    }
    setShowModal(false)
  }

  const remove = () => {
    if (editing) {
      store.deletePackage(editing.id)
      setShowModal(false)
    }
  }

  const addInclude = () => setForm({ ...form, includes: [...form.includes, ''] })
  const updateInclude = (index: number, value: string) => {
    const updated = [...form.includes]
    updated[index] = value
    setForm({ ...form, includes: updated })
  }
  const removeInclude = (index: number) => {
    setForm({ ...form, includes: form.includes.filter((_, i) => i !== index) })
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Pakketten</h1>
          <p className="page-subtitle">Beheer je fotografie-pakketten en prijzen</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openNew}>
          <Plus size={16} /> Nieuw pakket
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {packages.map(pkg => (
          <div key={pkg.id} className="card" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }} onClick={() => openEdit(pkg)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <span className={`badge ${CATEGORY_COLORS[pkg.category]}`} style={{ marginBottom: '0.5rem', display: 'inline-block' }}>{CATEGORY_LABELS[pkg.category]}</span>
                <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--cream)' }}>{pkg.name}</div>
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--gold-lighter)' }}>
                &euro;{pkg.price}
              </div>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{pkg.description}</p>
            <div style={{ flex: 1 }}>
              {pkg.includes.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', padding: '0.25rem 0' }}>
                  <Check size={14} color="var(--gold-lighter)" /> {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {packages.length === 0 && (
        <div className="empty-state"><p>Nog geen pakketten. Maak je eerste pakket aan!</p></div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="modal-title">{editing ? 'Pakket bewerken' : 'Nieuw pakket'}</h2>
              <button className="table-btn" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="form-group">
              <label className="form-label">Naam</label>
              <input type="text" className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Bijv. Bruiloft Premium" />
            </div>
            <div className="form-group">
              <label className="form-label">Categorie</label>
              <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value as PackageOption['category'] })}>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Prijs (&euro;)</label>
              <input type="number" className="form-input" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} min={0} step={25} />
            </div>
            <div className="form-group">
              <label className="form-label">Beschrijving</label>
              <textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Korte beschrijving van het pakket" />
            </div>
            <div className="form-group">
              <label className="form-label">Wat is inbegrepen</label>
              {form.includes.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input type="text" className="form-input" value={item} onChange={e => updateInclude(i, e.target.value)} placeholder="Bijv. 4 uur fotografie" />
                  {form.includes.length > 1 && (
                    <button className="btn btn-danger btn-sm" style={{ flexShrink: 0 }} onClick={() => removeInclude(i)}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
              <button className="btn btn-secondary" onClick={addInclude} style={{ fontSize: '0.75rem' }}>
                <Plus size={14} /> Item toevoegen
              </button>
            </div>
            <div className="modal-actions">
              {editing && (
                <button className="btn btn-danger btn-sm" onClick={remove}>Verwijderen</button>
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
