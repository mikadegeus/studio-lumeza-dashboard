import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
import './Login.css'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch {
      setError('E-mailadres of wachtwoord klopt niet')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <img src="/logo-lumeza.jpg" alt="Studio Lumeza" className="login-logo" />
        <h1 className="login-title">Studio Lumeza</h1>
        <p className="login-subtitle">Inloggen op je dashboard</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">E-mailadres</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="jouw@email.nl"
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Wachtwoord</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? 'Bezig...' : 'Inloggen'}
          </button>
        </form>
      </div>
    </div>
  )
}
