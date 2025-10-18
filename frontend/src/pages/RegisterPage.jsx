import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import './LoginPage.css'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      await api.post('/auth/register', { email, password })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.error || 'registratie mislukt')
    }
  }

  return (
    <main className="stage" aria-label="octovoc registreer">
      <section className="inner">
        <h1 className="title">Octovoc</h1>

        <div className="underline" aria-hidden="true"></div>

        {error && <div className="error-msg">{error}</div>}
        {success && (
          <div className="error-msg" style={{ background: 'rgba(0, 255, 0, 0.15)', borderColor: 'rgba(0, 255, 0, 0.4)' }}>
            registratie geslaagd! je wordt doorgestuurd...
          </div>
        )}

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

          <button type="submit" className="btn submit-btn">
            registreer
          </button>
        </form>

        <div className="links">
          <Link to="/login" className="link">login</Link>
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
