import { useState } from 'react'
import { Plus, Trash2, X, Edit2 } from 'lucide-react'
import type { useStore } from '../store'
import type { CheatsheetCategory } from '../types'
import './Cheatsheet.css'

interface Props {
  store: ReturnType<typeof useStore>
}

export function Cheatsheet({ store }: Props) {
  const sheets: CheatsheetCategory[] = store.cheatsheets || []
  const [activeId, setActiveId] = useState<string | null>(sheets[0]?.id ?? null)
  const [editMode, setEditMode] = useState(false)
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatIcon, setNewCatIcon] = useState('📷')
  const [newTipCatId, setNewTipCatId] = useState<string | null>(null)
  const [newTipTitle, setNewTipTitle] = useState('')
  const [newTipValue, setNewTipValue] = useState('')

  const activeSheet = sheets.find(s => s.id === activeId) ?? null

  const addCategory = () => {
    if (!newCatName.trim()) return
    store.addCheatsheetCategory(newCatName.trim(), newCatIcon)
    setNewCatName('')
    setNewCatIcon('📷')
    setShowNewCategory(false)
  }

  const addTip = () => {
    if (!newTipCatId || !newTipTitle.trim()) return
    store.addCheatsheetTip(newTipCatId, newTipTitle.trim(), newTipValue.trim())
    setNewTipTitle('')
    setNewTipValue('')
    setNewTipCatId(null)
  }

  return (
    <div className="cheatsheet-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Cheatsheet</h1>
          <p className="page-subtitle">Camera-instellingen per type shoot</p>
        </div>
        <button
          className={`btn btn-sm ${editMode ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setEditMode(!editMode)}
        >
          <Edit2 size={14} /> {editMode ? 'Klaar' : 'Bewerken'}
        </button>
      </div>

      {/* Category tabs */}
      <div className="cs-tabs">
        {sheets.map(sheet => (
          <button
            key={sheet.id}
            className={`cs-tab ${activeId === sheet.id ? 'active' : ''}`}
            onClick={() => setActiveId(sheet.id)}
          >
            <span className="cs-tab-icon">{sheet.icon}</span>
            <span className="cs-tab-label">{sheet.name}</span>
          </button>
        ))}
        {editMode && (
          <button className="cs-tab cs-tab-add" onClick={() => setShowNewCategory(true)}>
            <Plus size={16} />
          </button>
        )}
      </div>

      {/* Active sheet content */}
      {activeSheet && (
        <div className="cs-content">
          <div className="cs-sheet-header">
            <span className="cs-sheet-icon">{activeSheet.icon}</span>
            <h2 className="cs-sheet-title">{activeSheet.name}</h2>
            {editMode && (
              <button
                className="btn btn-danger btn-sm"
                onClick={() => { store.deleteCheatsheetCategory(activeSheet.id); setActiveId(sheets.find(s => s.id !== activeSheet.id)?.id ?? null) }}
                style={{ marginLeft: 'auto' }}
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>

          <div className="cs-tips">
            {activeSheet.tips.map(tip => (
              <div key={tip.id} className="cs-tip">
                <div className="cs-tip-label">{tip.title}</div>
                <div className="cs-tip-value">{tip.value}</div>
                {editMode && (
                  <button
                    className="cs-tip-delete"
                    onClick={() => store.deleteCheatsheetTip(activeSheet.id, tip.id)}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add tip (edit mode) */}
          {editMode && (
            <div className="cs-add-tip">
              {newTipCatId === activeSheet.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={newTipTitle}
                    onChange={e => setNewTipTitle(e.target.value)}
                    placeholder="Label (bijv. Diafragma, Sluitertijd)"
                    style={{ fontSize: '0.875rem' }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    value={newTipValue}
                    onChange={e => setNewTipValue(e.target.value)}
                    placeholder="Waarde (bijv. f/2.8 voor portret)"
                    style={{ fontSize: '0.875rem' }}
                    onKeyDown={e => e.key === 'Enter' && addTip()}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-primary btn-sm" onClick={addTip}><Plus size={14} /> Toevoegen</button>
                    <button className="btn btn-secondary" onClick={() => setNewTipCatId(null)} style={{ fontSize: '0.8125rem' }}>Annuleren</button>
                  </div>
                </div>
              ) : (
                <button
                  className="btn btn-secondary"
                  onClick={() => setNewTipCatId(activeSheet.id)}
                  style={{ width: '100%', justifyContent: 'center', fontSize: '0.8125rem' }}
                >
                  <Plus size={14} /> Item toevoegen
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {sheets.length === 0 && (
        <div className="card">
          <div className="empty-state" style={{ padding: '3rem' }}>
            <p>Nog geen cheatsheets. Klik op "Bewerken" om te beginnen!</p>
          </div>
        </div>
      )}

      {/* New category modal */}
      {showNewCategory && (
        <div className="modal-overlay" onClick={() => setShowNewCategory(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="modal-title">Nieuwe categorie</h2>
              <button className="table-btn" onClick={() => setShowNewCategory(false)}><X size={18} /></button>
            </div>
            <div className="form-group">
              <label className="form-label">Icoon</label>
              <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                {['📷', '👤', '💒', '🤰', '👶', '🌅', '🌙', '🎂', '🏠', '🎓', '💼', '🐾', '🎄', '🌸', '⚡'].map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setNewCatIcon(emoji)}
                    style={{
                      width: 40, height: 40, borderRadius: 8, fontSize: '1.25rem',
                      border: `2px solid ${newCatIcon === emoji ? 'var(--gold)' : 'var(--black-border)'}`,
                      background: newCatIcon === emoji ? 'var(--gold-muted)' : 'transparent',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Naam</label>
              <input
                type="text"
                className="form-input"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                placeholder="Bijv. Product, Evenement, Dieren..."
                onKeyDown={e => e.key === 'Enter' && addCategory()}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowNewCategory(false)}>Annuleren</button>
              <button className="btn btn-primary btn-sm" onClick={addCategory}>Aanmaken</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
