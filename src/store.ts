import { useState, useEffect, useCallback } from 'react'
import type { StoreState, Client, PackageOption, Shoot, Task, PortfolioItem, Project, ProjectNote, ProjectStatus, Lead, NetworkContact, PackListItem, Note, Invoice } from './types'

const STORAGE_KEY = 'studio-lumeza-data'

const defaultPackages: PackageOption[] = [
  {
    id: 'pkg-1',
    name: 'Bruiloft Basis',
    description: 'Perfecte dekking van jullie grote dag',
    price: 1200,
    includes: ['4 uur fotografie', '150+ bewerkte foto\'s', 'Online galerij'],
    category: 'wedding',
  },
  {
    id: 'pkg-2',
    name: 'Bruiloft Premium',
    description: 'Volledige dag dekking met alle extras',
    price: 2200,
    includes: ['8 uur fotografie', '400+ bewerkte foto\'s', 'Online galerij', 'Fotoalbum', 'Engagement shoot'],
    category: 'wedding',
  },
  {
    id: 'pkg-3',
    name: 'Zwangerschap',
    description: 'Leg dit bijzondere moment vast',
    price: 350,
    includes: ['1 uur sessie', '20+ bewerkte foto\'s', 'Online galerij', '2 outfits'],
    category: 'pregnancy',
  },
  {
    id: 'pkg-4',
    name: 'Newborn / Kids',
    description: 'Schattige momentjes voor altijd',
    price: 300,
    includes: ['1.5 uur sessie', '25+ bewerkte foto\'s', 'Online galerij'],
    category: 'kids',
  },
  {
    id: 'pkg-5',
    name: 'Portret Sessie',
    description: 'Professionele portretfotografie',
    price: 250,
    includes: ['45 min sessie', '15+ bewerkte foto\'s', 'Online galerij'],
    category: 'portrait',
  },
]

const defaultState: StoreState = {
  clients: [
    { id: 'c-1', name: 'Sophie de Vries', email: 'sophie@email.nl', phone: '06-12345678', notes: 'Bruiloft in juni, locatie: Haarlem', createdAt: '2026-03-01' },
    { id: 'c-2', name: 'Emma Jansen', email: 'emma.j@email.nl', phone: '06-87654321', notes: 'Zwangerschapsshoot, 32 weken', createdAt: '2026-03-15' },
    { id: 'c-3', name: 'Lisa & Mark', email: 'lisa.mark@email.nl', phone: '06-11223344', notes: 'Newborn shoot gepland na geboorte', createdAt: '2026-04-01' },
  ],
  packages: defaultPackages,
  shoots: [
    { id: 's-1', clientId: 'c-1', packageId: 'pkg-2', date: '2026-06-15', time: '10:00', location: 'Landgoed Elswout, Haarlem', status: 'bevestigd', notes: 'Ceremonie om 14:00' },
    { id: 's-2', clientId: 'c-2', packageId: 'pkg-3', date: '2026-04-20', time: '14:00', location: 'Studio Lumeza', status: 'gepland', notes: 'Graag warme tinten' },
    { id: 's-3', clientId: 'c-3', packageId: 'pkg-4', date: '2026-05-10', time: '11:00', location: 'Bij klant thuis', status: 'gepland', notes: '' },
  ],
  tasks: [
    { id: 't-1', shootId: 's-1', title: 'Bruiloft locatie bezoeken', dueDate: '2026-05-01', completed: false },
    { id: 't-2', shootId: 's-2', title: 'Props klaarzetten zwangerschapsshoot', dueDate: '2026-04-19', completed: false },
    { id: 't-3', title: 'Website portfolio updaten', dueDate: '2026-04-15', completed: false },
    { id: 't-4', title: 'Factuur Sophie versturen', dueDate: '2026-04-12', completed: true },
  ],
  portfolio: [],
  projects: [
    {
      id: 'proj-1',
      title: 'Bruiloft Sophie & partner',
      description: 'Complete bruiloft fotografie op Landgoed Elswout',
      type: 'shoot',
      status: 'geboekt',
      clientId: 'c-1',
      shootId: 's-1',
      packageId: 'pkg-2',
      notes: [
        { id: 'n-1', text: 'Kleur palette: warm, romantisch', createdAt: '2026-03-05' },
      ],
      packList: [
        { id: 'pl-1', name: 'Camera body (2x)', checked: false },
        { id: 'pl-2', name: 'Lens 24-70mm', checked: false },
        { id: 'pl-3', name: 'Lens 85mm f/1.4', checked: false },
        { id: 'pl-4', name: 'Flitsers + triggers', checked: false },
        { id: 'pl-5', name: 'Extra batterijen', checked: false },
        { id: 'pl-6', name: 'Geheugenkaarten', checked: false },
        { id: 'pl-7', name: 'Reflector', checked: false },
        { id: 'pl-8', name: 'Statief', checked: true },
      ],
      taskIds: ['t-1'],
      deadline: '2026-07-01',
      createdAt: '2026-03-01',
    },
    {
      id: 'proj-2',
      title: 'Zwangerschapsshoot Emma',
      description: 'Studio sessie met warme tinten',
      type: 'shoot',
      status: 'geboekt',
      clientId: 'c-2',
      shootId: 's-2',
      packageId: 'pkg-3',
      notes: [],
      packList: [
        { id: 'pl-10', name: 'Camera body', checked: false },
        { id: 'pl-11', name: 'Lens 50mm f/1.2', checked: false },
        { id: 'pl-12', name: 'Softbox + studiolampen', checked: false },
        { id: 'pl-13', name: 'Props (sluiers, bloemen)', checked: false },
        { id: 'pl-14', name: 'Achtergrond doeken', checked: false },
      ],
      taskIds: ['t-2'],
      deadline: '2026-04-25',
      createdAt: '2026-03-15',
    },
    {
      id: 'proj-3',
      title: 'Mini-sessies Moederdag',
      description: 'Korte portret sessies als moederdag actie',
      type: 'standalone',
      status: 'lopend',
      notes: [
        { id: 'n-2', text: 'Social media campagne starten op 20 april', createdAt: '2026-04-05' },
      ],
      packList: [],
      taskIds: [],
      deadline: '2026-05-11',
      createdAt: '2026-04-01',
    },
  ],
  leads: [
    { id: 'l-1', name: 'Anna van Dijk', email: 'anna@email.nl', phone: '06-99887766', interest: 'Bruiloft september 2026', source: 'Instagram', status: 'nieuw', notes: 'Reactie op bruiloft-post', createdAt: '2026-04-08' },
    { id: 'l-2', name: 'Mila Bakker', email: 'mila.b@email.nl', phone: '06-55443322', interest: 'Zwangerschapsshoot', source: 'Mond-tot-mond', status: 'benaderd', notes: 'Doorverwezen door Emma Jansen', createdAt: '2026-04-05' },
  ],
  network: [
    { id: 'net-1', name: 'Jasmine Beauty', category: 'makeup', email: 'jasmine@beauty.nl', phone: '06-11112222', website: 'jasmine-beauty.nl', notes: 'Specialist in bruidsmakeup, erg fijn om mee te werken', rating: 5, createdAt: '2026-02-10' },
    { id: 'net-2', name: 'Floor Styling', category: 'stylist', email: 'info@floorstyling.nl', phone: '06-33334444', website: 'floorstyling.nl', notes: 'Doet ook zwangerschaps-styling', rating: 4, createdAt: '2026-03-01' },
    { id: 'net-3', name: 'Landgoed Elswout', category: 'locatie', email: 'info@elswout.nl', phone: '023-1234567', website: 'elswout.nl', notes: 'Prachtige buitenlocatie voor bruiloften', rating: 5, createdAt: '2026-01-15' },
  ],
  packPresets: [
    { id: 'cat-1', name: 'Camera & Body', items: ['Camera body (1x)', 'Camera body (2x)', 'Extra batterijen', 'Geheugenkaarten', 'Batterij oplader'] },
    { id: 'cat-2', name: 'Lenzen', items: ['Lens 24-70mm f/2.8', 'Lens 85mm f/1.4', 'Lens 50mm f/1.2', 'Lens 35mm f/1.4', 'Lens 70-200mm f/2.8', 'Macro lens'] },
    { id: 'cat-3', name: 'Belichting', items: ['Flitsers + triggers', 'Softbox', 'Studiolampen', 'Reflector', 'LED videolamp', 'Lichtstandaarden', "Paraplu's"] },
    { id: 'cat-4', name: 'Ondersteuning', items: ['Statief', 'Monopod', 'Gimbal / stabilizer'] },
    { id: 'cat-5', name: 'Props & Styling', items: ['Achtergrond doeken', 'Sluiers / tule', 'Bloemen (kunstmatig)', 'Kussens / dekens', 'Confetti / rookmachine', 'Fotolijsten'] },
    { id: 'cat-6', name: 'Overig', items: ['Laptop + kaartlezer', 'Visitekaartjes', 'Contracten / formulieren', 'Gaffer tape', 'Schoonmaakdoekjes (lens)', 'Paraplu (regen)', 'Snacks & water'] },
  ],
  notes: [
    { id: 'note-1', title: 'Ideeën voor mini-sessies', content: '- Moederdag thema met bloemen\n- Kerst mini-sessies in studio\n- Lente/pasen buiten shoots\n- Back-to-school sessies augustus', color: 'gold', pinned: true, createdAt: '2026-04-01', updatedAt: '2026-04-01' },
    { id: 'note-2', title: 'Social media planning', content: 'Elke week posten:\n- Maandag: behind the scenes\n- Woensdag: portfolio highlight\n- Vrijdag: tips of persoonlijk', color: 'blue', pinned: false, createdAt: '2026-03-20', updatedAt: '2026-03-20' },
    { id: 'note-3', title: 'Prijzen herzien Q3', content: 'Bruiloft basis omhoog naar €1350?\nZwangerschap blijft gelijk.\nNieuw pakket: couple shoot €200', color: 'purple', pinned: false, createdAt: '2026-04-05', updatedAt: '2026-04-05' },
  ],
  invoices: [
    { id: 'inv-1', invoiceNumber: 'LUM-2026-001', clientId: 'c-1', projectId: 'proj-1', lines: [{ description: 'Bruiloft Premium pakket', amount: 2200 }], total: 2200, status: 'verstuurd', issueDate: '2026-03-15', dueDate: '2026-04-15', notes: 'Aanbetaling 50% bij boeking', createdAt: '2026-03-15' },
    { id: 'inv-2', invoiceNumber: 'LUM-2026-002', clientId: 'c-2', projectId: 'proj-2', lines: [{ description: 'Zwangerschapsshoot pakket', amount: 350 }], total: 350, status: 'betaald', issueDate: '2026-03-20', dueDate: '2026-04-20', paidDate: '2026-03-25', notes: '', createdAt: '2026-03-20' },
    { id: 'inv-3', invoiceNumber: 'LUM-2026-003', clientId: 'c-3', lines: [{ description: 'Newborn / Kids pakket', amount: 300 }], total: 300, status: 'concept', issueDate: '2026-04-10', dueDate: '2026-05-10', notes: 'Wacht op bevestiging geboortedatum', createdAt: '2026-04-10' },
  ],
}

function loadState(): StoreState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // Merge with defaults to handle new fields
      return { ...defaultState, ...parsed }
    }
  } catch {
    // ignore parse errors
  }
  return defaultState
}

function saveState(state: StoreState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

export function useStore() {
  const [state, setState] = useState<StoreState>(loadState)

  useEffect(() => {
    saveState(state)
  }, [state])

  const update = useCallback((updater: (prev: StoreState) => StoreState) => {
    setState(prev => updater(prev))
  }, [])

  // Clients
  const addClient = useCallback((client: Omit<Client, 'id' | 'createdAt'>) => {
    update(s => ({ ...s, clients: [...s.clients, { ...client, id: generateId(), createdAt: new Date().toISOString().slice(0, 10) }] }))
  }, [update])

  const updateClient = useCallback((id: string, data: Partial<Client>) => {
    update(s => ({ ...s, clients: s.clients.map(c => c.id === id ? { ...c, ...data } : c) }))
  }, [update])

  const deleteClient = useCallback((id: string) => {
    update(s => ({ ...s, clients: s.clients.filter(c => c.id !== id) }))
  }, [update])

  // Packages
  const addPackage = useCallback((pkg: Omit<PackageOption, 'id'>) => {
    update(s => ({ ...s, packages: [...s.packages, { ...pkg, id: generateId() }] }))
  }, [update])

  const updatePackage = useCallback((id: string, data: Partial<PackageOption>) => {
    update(s => ({ ...s, packages: s.packages.map(p => p.id === id ? { ...p, ...data } : p) }))
  }, [update])

  const deletePackage = useCallback((id: string) => {
    update(s => ({ ...s, packages: s.packages.filter(p => p.id !== id) }))
  }, [update])

  // Shoots
  const addShoot = useCallback((shoot: Omit<Shoot, 'id'>) => {
    update(s => ({ ...s, shoots: [...s.shoots, { ...shoot, id: generateId() }] }))
  }, [update])

  const updateShoot = useCallback((id: string, data: Partial<Shoot>) => {
    update(s => ({ ...s, shoots: s.shoots.map(sh => sh.id === id ? { ...sh, ...data } : sh) }))
  }, [update])

  const deleteShoot = useCallback((id: string) => {
    update(s => ({ ...s, shoots: s.shoots.filter(sh => sh.id !== id) }))
  }, [update])

  // Tasks
  const addTask = useCallback((task: Omit<Task, 'id'>) => {
    update(s => ({ ...s, tasks: [...s.tasks, { ...task, id: generateId() }] }))
  }, [update])

  const toggleTask = useCallback((id: string) => {
    update(s => ({ ...s, tasks: s.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t) }))
  }, [update])

  const deleteTask = useCallback((id: string) => {
    update(s => ({ ...s, tasks: s.tasks.filter(t => t.id !== id) }))
  }, [update])

  // Portfolio
  const addPortfolioItem = useCallback((item: Omit<PortfolioItem, 'id'>) => {
    update(s => ({ ...s, portfolio: [...s.portfolio, { ...item, id: generateId() }] }))
  }, [update])

  const deletePortfolioItem = useCallback((id: string) => {
    update(s => ({ ...s, portfolio: s.portfolio.filter(p => p.id !== id) }))
  }, [update])

  // Projects
  const addProject = useCallback((project: Omit<Project, 'id' | 'createdAt' | 'notes' | 'packList' | 'taskIds'>) => {
    update(s => ({ ...s, projects: [...s.projects, { ...project, id: generateId(), createdAt: new Date().toISOString().slice(0, 10), notes: [], packList: [], taskIds: [] }] }))
  }, [update])

  const updateProject = useCallback((id: string, data: Partial<Project>) => {
    update(s => ({ ...s, projects: s.projects.map(p => p.id === id ? { ...p, ...data } : p) }))
  }, [update])

  const deleteProject = useCallback((id: string) => {
    update(s => ({ ...s, projects: s.projects.filter(p => p.id !== id) }))
  }, [update])

  const addProjectNote = useCallback((projectId: string, text: string) => {
    const note: ProjectNote = { id: generateId(), text, createdAt: new Date().toISOString().slice(0, 10) }
    update(s => ({
      ...s,
      projects: s.projects.map(p => p.id === projectId ? { ...p, notes: [...p.notes, note] } : p),
    }))
  }, [update])

  const deleteProjectNote = useCallback((projectId: string, noteId: string) => {
    update(s => ({
      ...s,
      projects: s.projects.map(p => p.id === projectId ? { ...p, notes: p.notes.filter(n => n.id !== noteId) } : p),
    }))
  }, [update])

  const updateProjectStatus = useCallback((id: string, status: ProjectStatus) => {
    update(s => ({ ...s, projects: s.projects.map(p => p.id === id ? { ...p, status } : p) }))
  }, [update])

  // Pack list
  const addPackListItem = useCallback((projectId: string, name: string) => {
    const item: PackListItem = { id: generateId(), name, checked: false }
    update(s => ({
      ...s,
      projects: s.projects.map(p => p.id === projectId ? { ...p, packList: [...(p.packList || []), item] } : p),
    }))
  }, [update])

  const togglePackListItem = useCallback((projectId: string, itemId: string) => {
    update(s => ({
      ...s,
      projects: s.projects.map(p => p.id === projectId ? {
        ...p,
        packList: (p.packList || []).map(i => i.id === itemId ? { ...i, checked: !i.checked } : i),
      } : p),
    }))
  }, [update])

  const deletePackListItem = useCallback((projectId: string, itemId: string) => {
    update(s => ({
      ...s,
      projects: s.projects.map(p => p.id === projectId ? { ...p, packList: (p.packList || []).filter(i => i.id !== itemId) } : p),
    }))
  }, [update])

  // Leads
  const addLead = useCallback((lead: Omit<Lead, 'id' | 'createdAt'>) => {
    update(s => ({ ...s, leads: [...s.leads, { ...lead, id: generateId(), createdAt: new Date().toISOString().slice(0, 10) }] }))
  }, [update])

  const updateLead = useCallback((id: string, data: Partial<Lead>) => {
    update(s => ({ ...s, leads: s.leads.map(l => l.id === id ? { ...l, ...data } : l) }))
  }, [update])

  const deleteLead = useCallback((id: string) => {
    update(s => ({ ...s, leads: s.leads.filter(l => l.id !== id) }))
  }, [update])

  const convertLeadToClient = useCallback((leadId: string) => {
    update(s => {
      const lead = s.leads.find(l => l.id === leadId)
      if (!lead) return s
      const newClient: Client = {
        id: generateId(),
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        notes: `Geconverteerd van lead. Interesse: ${lead.interest}. ${lead.notes}`,
        createdAt: new Date().toISOString().slice(0, 10),
      }
      return {
        ...s,
        clients: [...s.clients, newClient],
        leads: s.leads.filter(l => l.id !== leadId),
      }
    })
  }, [update])

  // Network
  const addNetworkContact = useCallback((contact: Omit<NetworkContact, 'id' | 'createdAt'>) => {
    update(s => ({ ...s, network: [...s.network, { ...contact, id: generateId(), createdAt: new Date().toISOString().slice(0, 10) }] }))
  }, [update])

  const updateNetworkContact = useCallback((id: string, data: Partial<NetworkContact>) => {
    update(s => ({ ...s, network: s.network.map(n => n.id === id ? { ...n, ...data } : n) }))
  }, [update])

  const deleteNetworkContact = useCallback((id: string) => {
    update(s => ({ ...s, network: s.network.filter(n => n.id !== id) }))
  }, [update])

  // Invoices
  const addInvoice = useCallback((invoice: Omit<Invoice, 'id' | 'createdAt'>) => {
    update(s => ({ ...s, invoices: [...(s.invoices || []), { ...invoice, id: generateId(), createdAt: new Date().toISOString().slice(0, 10) }] }))
  }, [update])

  const updateInvoice = useCallback((id: string, data: Partial<Invoice>) => {
    update(s => ({ ...s, invoices: (s.invoices || []).map(i => i.id === id ? { ...i, ...data } : i) }))
  }, [update])

  const deleteInvoice = useCallback((id: string) => {
    update(s => ({ ...s, invoices: (s.invoices || []).filter(i => i.id !== id) }))
  }, [update])

  // Notes
  const addNote = useCallback((note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString().slice(0, 10)
    update(s => ({ ...s, notes: [...(s.notes || []), { ...note, id: generateId(), createdAt: now, updatedAt: now }] }))
  }, [update])

  const updateNote = useCallback((id: string, data: Partial<Note>) => {
    update(s => ({ ...s, notes: (s.notes || []).map(n => n.id === id ? { ...n, ...data, updatedAt: new Date().toISOString().slice(0, 10) } : n) }))
  }, [update])

  const deleteNote = useCallback((id: string) => {
    update(s => ({ ...s, notes: (s.notes || []).filter(n => n.id !== id) }))
  }, [update])

  const togglePinNote = useCallback((id: string) => {
    update(s => ({ ...s, notes: (s.notes || []).map(n => n.id === id ? { ...n, pinned: !n.pinned } : n) }))
  }, [update])

  // Pack presets
  const addPresetCategory = useCallback((name: string) => {
    update(s => ({ ...s, packPresets: [...(s.packPresets || []), { id: generateId(), name, items: [] }] }))
  }, [update])

  const updatePresetCategory = useCallback((id: string, name: string) => {
    update(s => ({ ...s, packPresets: (s.packPresets || []).map(c => c.id === id ? { ...c, name } : c) }))
  }, [update])

  const deletePresetCategory = useCallback((id: string) => {
    update(s => ({ ...s, packPresets: (s.packPresets || []).filter(c => c.id !== id) }))
  }, [update])

  const addPresetItem = useCallback((categoryId: string, item: string) => {
    update(s => ({
      ...s,
      packPresets: (s.packPresets || []).map(c => c.id === categoryId ? { ...c, items: [...c.items, item] } : c),
    }))
  }, [update])

  const deletePresetItem = useCallback((categoryId: string, itemIndex: number) => {
    update(s => ({
      ...s,
      packPresets: (s.packPresets || []).map(c => c.id === categoryId ? { ...c, items: c.items.filter((_, i) => i !== itemIndex) } : c),
    }))
  }, [update])

  // Lookups
  const getClient = useCallback((id: string) => state.clients.find(c => c.id === id), [state.clients])
  const getPackage = useCallback((id: string) => state.packages.find(p => p.id === id), [state.packages])

  return {
    ...state,
    addClient, updateClient, deleteClient,
    addPackage, updatePackage, deletePackage,
    addShoot, updateShoot, deleteShoot,
    addTask, toggleTask, deleteTask,
    addPortfolioItem, deletePortfolioItem,
    addProject, updateProject, deleteProject,
    addProjectNote, deleteProjectNote, updateProjectStatus,
    addPackListItem, togglePackListItem, deletePackListItem,
    addLead, updateLead, deleteLead, convertLeadToClient,
    addNetworkContact, updateNetworkContact, deleteNetworkContact,
    addInvoice, updateInvoice, deleteInvoice,
    addNote, updateNote, deleteNote, togglePinNote,
    addPresetCategory, updatePresetCategory, deletePresetCategory,
    addPresetItem, deletePresetItem,
    getClient, getPackage,
  }
}
