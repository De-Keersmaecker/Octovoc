import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import './LoginPage.css'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const response = await api.post('/auth/forgot-password', { email })
      setMessage(response.data.message)
      setEmail('')
    } catch (err) {
      setError(err.response?.data?.error || 'fout opgetreden')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="stage" aria-label="octovoc wachtwoord vergeten">
      <section className="inner">
        <h1 className="title">Octovoc</h1>

        <div className="underline" aria-hidden="true"></div>

        {message && (
          <div className="error-msg" style={{ background: 'rgba(0, 255, 0, 0.15)', borderColor: 'rgba(0, 255, 0, 0.4)' }}>
            {message}
          </div>
        )}

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email"
            required
            disabled={loading}
            className="input-field"
          />

          <button type="submit" className="btn submit-btn" disabled={loading}>
            {loading ? 'versturen...' : 'reset link versturen'}
          </button>
        </form>

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
