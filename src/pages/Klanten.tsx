import { useState } from 'react'
import {
  Plus, Search, X, Mail, Phone, Users, UserPlus, Network,
  ArrowRightLeft, Star, Globe, Trash2,
} from 'lucide-react'
import type { useStore } from '../store'
import type { Client, Lead, LeadStatus, NetworkContact, NetworkCategory } from '../types'

interface Props {
  store: ReturnType<typeof useStore>
}

type Tab = 'klanten' | 'leads' | 'netwerk'

const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  nieuw: 'Nieuw',
  benaderd: 'Benaderd',
  'in-gesprek': 'In gesprek',
  geboekt: 'Geboekt',
  afgewezen: 'Afgewezen',
}

const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  nieuw: 'badge-blue',
  benaderd: 'badge-gold',
  'in-gesprek': 'badge-green',
  geboekt: 'badge-green',
  afgewezen: 'badge-red',
}

const NETWORK_LABELS: Record<NetworkCategory, string> = {
  makeup: 'Make-up artist',
  stylist: 'Stylist',
  videograaf: 'Videograaf',
  locatie: 'Locatie',
  bloemen: 'Bloemen',
  catering: 'Catering',
  'dj-muziek': 'DJ / Muziek',
  overig: 'Overig',
}

const NETWORK_COLORS: Record<NetworkCategory, string> = {
  makeup: 'badge-gold',
  stylist: 'badge-blue',
  videograaf: 'badge-green',
  locatie: 'badge-gold',
  bloemen: 'badge-green',
  catering: 'badge-red',
  'dj-muziek': 'badge-blue',
  overig: 'badge-gray',
}

export function Klanten({ store }: Props) {
  const { clients, shoots, leads, network } = store
  const [tab, setTab] = useState<Tab>('klanten')
  const [search, setSearch] = useState('')

  // Client modal
  const [showClientModal, setShowClientModal] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [clientForm, setClientForm] = useState({ name: '', email: '', phone: '', notes: '' })

  // Lead modal
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [leadForm, setLeadForm] = useState({ name: '', email: '', phone: '', interest: '', source: '', status: 'nieuw' as LeadStatus, notes: '' })

  // Network modal
  const [showNetworkModal, setShowNetworkModal] = useState(false)
  const [editingNetwork, setEditingNetwork] = useState<NetworkContact | null>(null)
  const [networkForm, setNetworkForm] = useState({ name: '', category: 'overig' as NetworkCategory, email: '', phone: '', website: '', notes: '', rating: 3 })

  // ─── Client handlers ───
  const openNewClient = () => {
    setEditingClient(null)
    setClientForm({ name: '', email: '', phone: '', notes: '' })
    setShowClientModal(true)
  }
  const openEditClient = (c: Client) => {
    setEditingClient(c)
    setClientForm({ name: c.name, email: c.email, phone: c.phone, notes: c.notes })
    setShowClientModal(true)
  }
  const saveClient = () => {
    if (!clientForm.name.trim()) return
    if (editingClient) store.updateClient(editingClient.id, clientForm)
    else store.addClient(clientForm)
    setShowClientModal(false)
  }
  const removeClient = () => { if (editingClient) { store.deleteClient(editingClient.id); setShowClientModal(false) } }

  // ─── Lead handlers ───
  const openNewLead = () => {
    setEditingLead(null)
    setLeadForm({ name: '', email: '', phone: '', interest: '', source: '', status: 'nieuw', notes: '' })
    setShowLeadModal(true)
  }
  const openEditLead = (l: Lead) => {
    setEditingLead(l)
    setLeadForm({ name: l.name, email: l.email, phone: l.phone, interest: l.interest, source: l.source, status: l.status, notes: l.notes })
    setShowLeadModal(true)
  }
  const saveLead = () => {
    if (!leadForm.name.trim()) return
    if (editingLead) store.updateLead(editingLead.id, leadForm)
    else store.addLead(leadForm)
    setShowLeadModal(false)
  }
  const removeLead = () => { if (editingLead) { store.deleteLead(editingLead.id); setShowLeadModal(false) } }
  const convertLead = () => {
    if (editingLead) {
      store.convertLeadToClient(editingLead.id)
      setShowLeadModal(false)
    }
  }

  // ─── Network handlers ───
  const openNewNetwork = () => {
    setEditingNetwork(null)
    setNetworkForm({ name: '', category: 'overig', email: '', phone: '', website: '', notes: '', rating: 3 })
    setShowNetworkModal(true)
  }
  const openEditNetwork = (n: NetworkContact) => {
    setEditingNetwork(n)
    setNetworkForm({ name: n.name, category: n.category, email: n.email, phone: n.phone, website: n.website, notes: n.notes, rating: n.rating })
    setShowNetworkModal(true)
  }
  const saveNetwork = () => {
    if (!networkForm.name.trim()) return
    if (editingNetwork) store.updateNetworkContact(editingNetwork.id, networkForm)
    else store.addNetworkContact(networkForm)
    setShowNetworkModal(false)
  }
  const removeNetwork = () => { if (editingNetwork) { store.deleteNetworkContact(editingNetwork.id); setShowNetworkModal(false) } }

  // ─── Filtering ───
  const searchLower = search.toLowerCase()
  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(searchLower) || c.email.toLowerCase().includes(searchLower))
  const filteredLeads = leads.filter(l => l.name.toLowerCase().includes(searchLower) || l.interest.toLowerCase().includes(searchLower))
  const filteredNetwork = network.filter(n => n.name.toLowerCase().includes(searchLower) || NETWORK_LABELS[n.category].toLowerCase().includes(searchLower))

  const getClientShoots = (clientId: string) => shoots.filter(s => s.clientId === clientId)

  const addBtnLabel = tab === 'klanten' ? 'Nieuwe klant' : tab === 'leads' ? 'Nieuwe lead' : 'Nieuw contact'
  const addBtnAction = tab === 'klanten' ? openNewClient : tab === 'leads' ? openNewLead : openNewNetwork

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Contacten</h1>
          <p className="page-subtitle">
            {clients.length} klant{clients.length !== 1 ? 'en' : ''} &middot; {leads.length} lead{leads.length !== 1 ? 's' : ''} &middot; {network.length} netwerk
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={addBtnAction}>
          <Plus size={16} /> {addBtnLabel}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {[
          { key: 'klanten' as Tab, label: 'Klanten', icon: Users, count: clients.length },
          { key: 'leads' as Tab, label: 'Leads', icon: UserPlus, count: leads.length },
          { key: 'netwerk' as Tab, label: 'Netwerk', icon: Network, count: network.length },
        ].map(t => (
          <button
            key={t.key}
            className={`btn btn-sm ${tab === t.key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setTab(t.key); setSearch('') }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
          >
            <t.icon size={14} /> {t.label}
            <span style={{
              marginLeft: 2, fontSize: '0.6875rem', padding: '1px 6px', borderRadius: 100,
              background: tab === t.key ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)',
            }}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: '1.25rem', position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          className="form-input"
          style={{ paddingLeft: '2.5rem' }}
          placeholder={tab === 'klanten' ? 'Zoek klanten...' : tab === 'leads' ? 'Zoek leads...' : 'Zoek in netwerk...'}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* ═══ KLANTEN TAB ═══ */}
      {tab === 'klanten' && (
        <div className="grid-cards">
          {filteredClients.map(client => {
            const clientShoots = getClientShoots(client.id)
            return (
              <div key={client.id} className="card" style={{ cursor: 'pointer' }} onClick={() => openEditClient(client)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--cream)', marginBottom: '0.25rem' }}>{client.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Klant sinds {new Date(client.createdAt).toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                  <span className="badge badge-gold">{clientShoots.length} shoot{clientShoots.length !== 1 ? 's' : ''}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {client.email && <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={13} /> {client.email}</div>}
                  {client.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={13} /> {client.phone}</div>}
                </div>
                {client.notes && (
                  <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: 6, background: 'rgba(255,255,255,0.02)', fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    {client.notes}
                  </div>
                )}
              </div>
            )
          })}
          {filteredClients.length === 0 && <div className="empty-state"><p>{search ? 'Geen klanten gevonden' : 'Nog geen klanten'}</p></div>}
        </div>
      )}

      {/* ═══ LEADS TAB ═══ */}
      {tab === 'leads' && (
        <div className="grid-cards">
          {filteredLeads.map(lead => (
            <div key={lead.id} className="card" style={{ cursor: 'pointer' }} onClick={() => openEditLead(lead)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--cream)', marginBottom: '0.25rem' }}>{lead.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Via {lead.source || 'onbekend'}</div>
                </div>
                <span className={`badge ${LEAD_STATUS_COLORS[lead.status]}`}>{LEAD_STATUS_LABELS[lead.status]}</span>
              </div>
              {lead.interest && (
                <div style={{ fontSize: '0.8125rem', color: 'var(--gold-lighter)', marginBottom: '0.5rem' }}>
                  Interesse: {lead.interest}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                {lead.email && <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={13} /> {lead.email}</div>}
                {lead.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={13} /> {lead.phone}</div>}
              </div>
              {lead.notes && (
                <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: 6, background: 'rgba(255,255,255,0.02)', fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  {lead.notes}
                </div>
              )}
            </div>
          ))}
          {filteredLeads.length === 0 && <div className="empty-state"><p>{search ? 'Geen leads gevonden' : 'Nog geen leads. Voeg potentiele klanten toe!'}</p></div>}
        </div>
      )}

      {/* ═══ NETWERK TAB ═══ */}
      {tab === 'netwerk' && (
        <div className="grid-cards">
          {filteredNetwork.map(contact => (
            <div key={contact.id} className="card" style={{ cursor: 'pointer' }} onClick={() => openEditNetwork(contact)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <span className={`badge ${NETWORK_COLORS[contact.category]}`} style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
                    {NETWORK_LABELS[contact.category]}
                  </span>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--cream)' }}>{contact.name}</div>
                </div>
                <div style={{ display: 'flex', gap: 2 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} fill={i < contact.rating ? 'var(--gold-lighter)' : 'none'} color={i < contact.rating ? 'var(--gold-lighter)' : 'var(--black-border)'} />
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                {contact.email && <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={13} /> {contact.email}</div>}
                {contact.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={13} /> {contact.phone}</div>}
                {contact.website && <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Globe size={13} /> {contact.website}</div>}
              </div>
              {contact.notes && (
                <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: 6, background: 'rgba(255,255,255,0.02)', fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  {contact.notes}
                </div>
              )}
            </div>
          ))}
          {filteredNetwork.length === 0 && <div className="empty-state"><p>{search ? 'Geen contacten gevonden' : 'Nog geen netwerkcontacten'}</p></div>}
        </div>
      )}

      {/* ═══ CLIENT MODAL ═══ */}
      {showClientModal && (
        <div className="modal-overlay" onClick={() => setShowClientModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="modal-title">{editingClient ? 'Klant bewerken' : 'Nieuwe klant'}</h2>
              <button className="table-btn" onClick={() => setShowClientModal(false)}><X size={18} /></button>
            </div>
            <div className="form-group">
              <label className="form-label">Naam</label>
              <input type="text" className="form-input" value={clientForm.name} onChange={e => setClientForm({ ...clientForm, name: e.target.value })} placeholder="Volledige naam" />
            </div>
            <div className="form-group">
              <label className="form-label">E-mail</label>
              <input type="email" className="form-input" value={clientForm.email} onChange={e => setClientForm({ ...clientForm, email: e.target.value })} placeholder="email@voorbeeld.nl" />
            </div>
            <div className="form-group">
              <label className="form-label">Telefoon</label>
              <input type="tel" className="form-input" value={clientForm.phone} onChange={e => setClientForm({ ...clientForm, phone: e.target.value })} placeholder="06-12345678" />
            </div>
            <div className="form-group">
              <label className="form-label">Notities</label>
              <textarea className="form-textarea" value={clientForm.notes} onChange={e => setClientForm({ ...clientForm, notes: e.target.value })} placeholder="Bijzonderheden, voorkeuren, etc." />
            </div>
            <div className="modal-actions">
              {editingClient && <button className="btn btn-danger btn-sm" onClick={removeClient}><Trash2 size={14} /> Verwijderen</button>}
              <div style={{ flex: 1 }} />
              <button className="btn btn-secondary" onClick={() => setShowClientModal(false)}>Annuleren</button>
              <button className="btn btn-primary btn-sm" onClick={saveClient}>Opslaan</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ LEAD MODAL ═══ */}
      {showLeadModal && (
        <div className="modal-overlay" onClick={() => setShowLeadModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="modal-title">{editingLead ? 'Lead bewerken' : 'Nieuwe lead'}</h2>
              <button className="table-btn" onClick={() => setShowLeadModal(false)}><X size={18} /></button>
            </div>
            <div className="form-group">
              <label className="form-label">Naam</label>
              <input type="text" className="form-input" value={leadForm.name} onChange={e => setLeadForm({ ...leadForm, name: e.target.value })} placeholder="Volledige naam" />
            </div>
            <div className="grid-form-2col">
              <div className="form-group">
                <label className="form-label">E-mail</label>
                <input type="email" className="form-input" value={leadForm.email} onChange={e => setLeadForm({ ...leadForm, email: e.target.value })} placeholder="email@voorbeeld.nl" />
              </div>
              <div className="form-group">
                <label className="form-label">Telefoon</label>
                <input type="tel" className="form-input" value={leadForm.phone} onChange={e => setLeadForm({ ...leadForm, phone: e.target.value })} placeholder="06-12345678" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Interesse</label>
              <input type="text" className="form-input" value={leadForm.interest} onChange={e => setLeadForm({ ...leadForm, interest: e.target.value })} placeholder="Bijv. Bruiloft, Zwangerschapsshoot" />
            </div>
            <div className="grid-form-2col">
              <div className="form-group">
                <label className="form-label">Bron</label>
                <input type="text" className="form-input" value={leadForm.source} onChange={e => setLeadForm({ ...leadForm, source: e.target.value })} placeholder="Instagram, website, mond-tot-mond" />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={leadForm.status} onChange={e => setLeadForm({ ...leadForm, status: e.target.value as LeadStatus })}>
                  {Object.entries(LEAD_STATUS_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notities</label>
              <textarea className="form-textarea" value={leadForm.notes} onChange={e => setLeadForm({ ...leadForm, notes: e.target.value })} placeholder="Extra info over deze lead..." />
            </div>
            <div className="modal-actions">
              {editingLead && (
                <>
                  <button className="btn btn-danger btn-sm" onClick={removeLead}><Trash2 size={14} /></button>
                  <button className="btn btn-sm" onClick={convertLead} style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80', padding: '0.5rem 1rem', borderRadius: 8, fontWeight: 500, fontSize: '0.8125rem' }}>
                    <ArrowRightLeft size={14} /> Maak klant
                  </button>
                </>
              )}
              <div style={{ flex: 1 }} />
              <button className="btn btn-secondary" onClick={() => setShowLeadModal(false)}>Annuleren</button>
              <button className="btn btn-primary btn-sm" onClick={saveLead}>Opslaan</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ NETWORK MODAL ═══ */}
      {showNetworkModal && (
        <div className="modal-overlay" onClick={() => setShowNetworkModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="modal-title">{editingNetwork ? 'Contact bewerken' : 'Nieuw netwerkcontact'}</h2>
              <button className="table-btn" onClick={() => setShowNetworkModal(false)}><X size={18} /></button>
            </div>
            <div className="form-group">
              <label className="form-label">Naam</label>
              <input type="text" className="form-input" value={networkForm.name} onChange={e => setNetworkForm({ ...networkForm, name: e.target.value })} placeholder="Naam of bedrijfsnaam" />
            </div>
            <div className="form-group">
              <label className="form-label">Categorie</label>
              <select className="form-select" value={networkForm.category} onChange={e => setNetworkForm({ ...networkForm, category: e.target.value as NetworkCategory })}>
                {Object.entries(NETWORK_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className="grid-form-2col">
              <div className="form-group">
                <label className="form-label">E-mail</label>
                <input type="email" className="form-input" value={networkForm.email} onChange={e => setNetworkForm({ ...networkForm, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Telefoon</label>
                <input type="tel" className="form-input" value={networkForm.phone} onChange={e => setNetworkForm({ ...networkForm, phone: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Website</label>
              <input type="text" className="form-input" value={networkForm.website} onChange={e => setNetworkForm({ ...networkForm, website: e.target.value })} placeholder="www.voorbeeld.nl" />
            </div>
            <div className="form-group">
              <label className="form-label">Beoordeling</label>
              <div style={{ display: 'flex', gap: 4 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setNetworkForm({ ...networkForm, rating: i + 1 })}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                  >
                    <Star size={22} fill={i < networkForm.rating ? 'var(--gold-lighter)' : 'none'} color={i < networkForm.rating ? 'var(--gold-lighter)' : 'var(--black-border)'} />
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notities</label>
              <textarea className="form-textarea" value={networkForm.notes} onChange={e => setNetworkForm({ ...networkForm, notes: e.target.value })} placeholder="Ervaringen, specialismen, etc." />
            </div>
            <div className="modal-actions">
              {editingNetwork && <button className="btn btn-danger btn-sm" onClick={removeNetwork}><Trash2 size={14} /> Verwijderen</button>}
              <div style={{ flex: 1 }} />
              <button className="btn btn-secondary" onClick={() => setShowNetworkModal(false)}>Annuleren</button>
              <button className="btn btn-primary btn-sm" onClick={saveNetwork}>Opslaan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
