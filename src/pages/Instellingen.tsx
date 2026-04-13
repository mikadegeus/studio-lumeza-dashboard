import { useState } from 'react'
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react'
import type { useStore } from '../store'

interface Props {
  store: ReturnType<typeof useStore>
}

export function Instellingen({ store }: Props) {
  const { packPresets = [] } = store
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newItemTexts, setNewItemTexts] = useState<Record<string, string>>({})
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingCategoryName, setEditingCategoryName] = useState('')

  const addCategory = () => {
    if (!newCategoryName.trim()) return
    store.addPresetCategory(newCategoryName.trim())
    setNewCategoryName('')
  }

  const startEditCategory = (id: string, name: string) => {
    setEditingCategoryId(id)
    setEditingCategoryName(name)
  }

  const saveEditCategory = () => {
    if (editingCategoryId && editingCategoryName.trim()) {
      store.updatePresetCategory(editingCategoryId, editingCategoryName.trim())
    }
    setEditingCategoryId(null)
  }

  const addItem = (categoryId: string) => {
    const text = newItemTexts[categoryId]?.trim()
    if (!text) return
    store.addPresetItem(categoryId, text)
    setNewItemTexts({ ...newItemTexts, [categoryId]: '' })
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Instellingen</h1>
        <p className="page-subtitle">Beheer je standaard paklijst-items</p>
      </div>

      {/* Pack presets */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <span className="card-title">Standaard paklijst items</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Deze items kun je snel toevoegen aan projecten
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {packPresets.map(category => (
            <div
              key={category.id}
              style={{
                border: '1px solid var(--black-border)',
                borderRadius: 10,
                padding: '1rem',
                background: 'rgba(255,255,255,0.01)',
              }}
            >
              {/* Category header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                {editingCategoryId === category.id ? (
                  <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
                    <input
                      type="text"
                      className="form-input"
                      value={editingCategoryName}
                      onChange={e => setEditingCategoryName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && saveEditCategory()}
                      autoFocus
                      style={{ fontSize: '0.875rem' }}
                    />
                    <button className="btn btn-primary btn-sm" onClick={saveEditCategory} style={{ flexShrink: 0 }}>
                      <Check size={14} />
                    </button>
                    <button className="btn btn-secondary" onClick={() => setEditingCategoryId(null)} style={{ flexShrink: 0, padding: '0.5rem' }}>
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span style={{
                      fontSize: '0.8125rem', fontWeight: 600, color: 'var(--gold)',
                      letterSpacing: '0.04em', textTransform: 'uppercase',
                    }}>
                      {category.name}
                    </span>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button
                        className="table-btn"
                        onClick={() => startEditCategory(category.id, category.name)}
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        className="table-btn"
                        onClick={() => store.deletePresetCategory(category.id)}
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Items */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.75rem' }}>
                {category.items.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      fontSize: '0.8125rem',
                      padding: '0.375rem 0.625rem',
                      borderRadius: 6,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--black-border)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {item}
                    <button
                      onClick={() => store.deletePresetItem(category.id, index)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)', padding: 0, display: 'flex',
                        opacity: 0.5, transition: 'opacity 150ms',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {category.items.length === 0 && (
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    Nog geen items in deze categorie
                  </span>
                )}
              </div>

              {/* Add item input */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  value={newItemTexts[category.id] || ''}
                  onChange={e => setNewItemTexts({ ...newItemTexts, [category.id]: e.target.value })}
                  placeholder="Nieuw item toevoegen..."
                  onKeyDown={e => e.key === 'Enter' && addItem(category.id)}
                  style={{ fontSize: '0.8125rem' }}
                />
                <button className="btn btn-primary btn-sm" onClick={() => addItem(category.id)} style={{ flexShrink: 0 }}>
                  <Plus size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add category */}
        <div style={{ marginTop: '1.25rem', padding: '1rem', border: '2px dashed var(--black-border)', borderRadius: 10 }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Nieuwe categorie toevoegen
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="form-input"
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
              placeholder="Bijv. Audio, Transport, Persoonlijk..."
              onKeyDown={e => e.key === 'Enter' && addCategory()}
              style={{ fontSize: '0.8125rem' }}
            />
            <button className="btn btn-primary btn-sm" onClick={addCategory} style={{ flexShrink: 0 }}>
              <Plus size={14} /> Toevoegen
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
