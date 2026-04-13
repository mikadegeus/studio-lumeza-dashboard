import {
  Calendar,
  Users,
  Package,
  Camera,
  ArrowRight,
  BarChart3,
  Clock,
  Star,
  ChevronDown,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import './LandingPage.css'

const features = [
  {
    icon: Calendar,
    title: 'Agenda',
    description:
      'Plan je shoots, bekijk je beschikbaarheid en beheer afspraken op één plek.',
  },
  {
    icon: Users,
    title: 'Klanten',
    description:
      'Houd al je klantgegevens bij, van contactinfo tot shoot-historie.',
  },
  {
    icon: Package,
    title: 'Pakketten',
    description:
      'Beheer je fotografie-pakketten, prijzen en wat er bij elke sessie inbegrepen is.',
  },
  {
    icon: BarChart3,
    title: 'Overzicht',
    description:
      'Bekijk je omzet, aantal shoots en groei in één helder dashboard.',
  },
  {
    icon: Clock,
    title: 'Planning',
    description:
      'Automatische herinneringen en workflow zodat je nooit een deadline mist.',
  },
  {
    icon: Star,
    title: 'Portfolio',
    description:
      'Koppel je beste werk aan klanten en pakketten voor een compleet overzicht.',
  },
]

export function LandingPage() {
  const navigate = useNavigate()
  const goToDashboard = () => navigate('/dashboard')

  return (
    <div className="landing">
      {/* Navigation */}
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-brand">
            <img src="/logo-lumeza.jpg" alt="Studio Lumeza" className="nav-logo" />
          </div>
          <div className="nav-links">
            <a href="#features">Functies</a>
            <a href="#workflow">Workflow</a>
            <button className="btn btn-primary btn-sm" onClick={goToDashboard}>
              Open Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-gradient" />
          <div className="hero-grain" />
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <Camera size={14} />
            <span>Voor fotografen, door een fotograaf</span>
          </div>
          <h1 className="hero-title">
            Jouw studio.
            <br />
            <span className="text-gold">Jouw overzicht.</span>
          </h1>
          <p className="hero-subtitle">
            Beheer je agenda, klanten en pakketten vanuit één elegant dashboard.
            Gebouwd voor Studio Lumeza.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={goToDashboard}>
              Ga naar Dashboard
              <ArrowRight size={18} />
            </button>
          </div>
          <a href="#features" className="scroll-indicator">
            <span>Ontdek meer</span>
            <ChevronDown size={16} />
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="features" id="features">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-label">Functies</span>
            <h2 className="section-title">
              Alles wat je nodig hebt,
              <br />
              <span className="text-gold">op één plek</span>
            </h2>
            <p className="section-desc">
              Van agendabeheer tot klantoverzichten — alles afgestemd op jouw
              manier van werken.
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature) => (
              <div key={feature.title} className="feature-card">
                <div className="feature-icon">
                  <feature.icon size={22} strokeWidth={1.5} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="workflow" id="workflow">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-label">Workflow</span>
            <h2 className="section-title">
              Van boeking
              <br />
              <span className="text-gold">tot oplevering</span>
            </h2>
          </div>
          <div className="workflow-steps">
            {[
              {
                step: '01',
                title: 'Boeking',
                desc: 'Klant kiest een pakket en datum via jouw overzicht.',
              },
              {
                step: '02',
                title: 'Voorbereiding',
                desc: 'Automatische herinneringen en checklists voor de shoot.',
              },
              {
                step: '03',
                title: 'Shoot',
                desc: 'Alle klantinfo en locatiedetails direct bij de hand.',
              },
              {
                step: '04',
                title: 'Oplevering',
                desc: 'Track de nabewerking en lever op — alles in het dashboard.',
              },
            ].map((item) => (
              <div key={item.step} className="workflow-step">
                <span className="workflow-number">{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="cta-inner">
          <div className="cta-glow" />
          <img src="/logo-lumeza.jpg" alt="Studio Lumeza" className="cta-logo" />
          <h2>Klaar om te beginnen?</h2>
          <p>Open je persoonlijke dashboard en neem controle over je studio.</p>
          <button className="btn btn-primary btn-lg" onClick={goToDashboard}>
            Open Dashboard
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <span className="footer-brand">Studio Lumeza</span>
          <span className="footer-copy">
            &copy; {new Date().getFullYear()} &middot; Lizza Britt Cabalt
          </span>
        </div>
      </footer>
    </div>
  )
}
