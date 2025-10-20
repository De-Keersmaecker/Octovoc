import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import { setToken, setUser } from '../utils/auth'
import './LoginPage.css'

export default function LoginPage({ setUser: setAppUser }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/auth/login', { email, password })
      const { token, user } = response.data

      setToken(token)
      setUser(user)
      setAppUser(user)

      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'login mislukt')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="stage" aria-label="octovoc login">
      <section className="inner">
        <h1 className="title">Octovoc</h1>

        <div className="underline" aria-hidden="true"></div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email"
            required
            className="input-field"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="wachtwoord"
            required
            className="input-field"
          />

          <button type="submit" className="btn submit-btn" disabled={loading}>
            {loading ? 'laden...' : 'login'}
          </button>
        </form>

        <div className="links">
          <Link to="/register" className="link">registreer</Link>
          <span className="link-separator">·</span>
          <Link to="/forgot-password" className="link">wachtwoord vergeten</Link>
        </div>

        <button
          className="btn back-btn"
          type="button"
          onClick={() => navigate('/')}
        >
          ← terug
        </button>
      </section>
    </main>
  )
}
