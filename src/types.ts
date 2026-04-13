export interface Client {
  id: string
  name: string
  email: string
  phone: string
  notes: string
  createdAt: string
}

export interface PackageOption {
  id: string
  name: string
  description: string
  price: number
  includes: string[]
  category: 'wedding' | 'pregnancy' | 'kids' | 'portrait' | 'other'
}

export interface Shoot {
  id: string
  clientId: string
  packageId: string
  date: string
  time: string
  location: string
  status: 'gepland' | 'bevestigd' | 'afgerond' | 'geannuleerd'
  notes: string
}

export interface Task {
  id: string
  shootId?: string
  title: string
  dueDate: string
  completed: boolean
}

export interface PortfolioItem {
  id: string
  clientId?: string
  packageId?: string
  title: string
  description: string
  imageUrl: string
  date: string
}

export type LeadStatus = 'nieuw' | 'benaderd' | 'in-gesprek' | 'geboekt' | 'afgewezen'

export interface Lead {
  id: string
  name: string
  email: string
  phone: string
  interest: string
  source: string
  status: LeadStatus
  notes: string
  createdAt: string
}

export type NetworkCategory = 'makeup' | 'stylist' | 'videograaf' | 'locatie' | 'bloemen' | 'catering' | 'dj-muziek' | 'overig'

export interface NetworkContact {
  id: string
  name: string
  category: NetworkCategory
  email: string
  phone: string
  website: string
  notes: string
  rating: number
  createdAt: string
}

export type ProjectStatus = 'geboekt' | 'shoot' | 'nabewerking' | 'opgeleverd' | 'lopend' | 'afgerond' | 'on-hold'

export interface ProjectNote {
  id: string
  text: string
  createdAt: string
}

export interface PackListItem {
  id: string
  name: string
  checked: boolean
}

export interface Project {
  id: string
  title: string
  description: string
  type: 'shoot' | 'standalone'
  status: ProjectStatus
  clientId?: string
  shootId?: string
  packageId?: string
  notes: ProjectNote[]
  packList: PackListItem[]
  taskIds: string[]
  deadline?: string
  createdAt: string
}

export interface Note {
  id: string
  title: string
  content: string
  color: 'gold' | 'blue' | 'green' | 'red' | 'purple' | 'gray'
  pinned: boolean
  createdAt: string
  updatedAt: string
}

export type InvoiceStatus = 'concept' | 'verstuurd' | 'betaald' | 'te-laat' | 'geannuleerd'

export interface InvoiceLine {
  description: string
  amount: number
}

export interface Invoice {
  id: string
  invoiceNumber: string
  clientId: string
  projectId?: string
  lines: InvoiceLine[]
  total: number
  status: InvoiceStatus
  issueDate: string
  dueDate: string
  paidDate?: string
  notes: string
  createdAt: string
}

export interface CheatsheetTip {
  id: string
  title: string
  value: string
}

export interface CheatsheetCategory {
  id: string
  name: string
  icon: string
  tips: CheatsheetTip[]
}

export interface PackPresetCategory {
  id: string
  name: string
  items: string[]
}

export interface StoreState {
  clients: Client[]
  packages: PackageOption[]
  shoots: Shoot[]
  tasks: Task[]
  portfolio: PortfolioItem[]
  projects: Project[]
  leads: Lead[]
  network: NetworkContact[]
  packPresets: PackPresetCategory[]
  notes: Note[]
  invoices: Invoice[]
  cheatsheets: CheatsheetCategory[]
}
