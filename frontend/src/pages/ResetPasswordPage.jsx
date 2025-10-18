import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../services/api'
import './LoginPage.css'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setError('geen geldig reset token')
    }
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('wachtwoord moet minimaal 6 karakters bevatten')
      return
    }

    if (password !== confirmPassword) {
      setError('wachtwoorden komen niet overeen')
      return
    }

    setLoading(true)

    try {
      await api.post(`/auth/reset-password/${token}`, { password })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.error || 'reset mislukt')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="stage" aria-label="octovoc wachtwoord resetten">
      <section className="inner">
        <h1 className="title">Octovoc</h1>

        <div className="underline" aria-hidden="true"></div>

        {success && (
          <div className="error-msg" style={{ background: 'rgba(0, 255, 0, 0.15)', borderColor: 'rgba(0, 255, 0, 0.4)' }}>
            wachtwoord gereset! je wordt doorgestuurd...
          </div>
        )}

        {error && <div className="error-msg">{error}</div>}

        {!token ? (
          <button
            onClick={() => navigate('/forgot-password')}
            className="btn submit-btn"
            style={{ marginTop: '20px' }}
          >
            nieuwe reset link aanvragen
          </button>
        ) : (
          !success && (
            <form onSubmit={handleSubmit} className="login-form">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="nieuw wachtwoord"
                required
                disabled={loading}
                minLength={6}
                className="input-field"
              />

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="bevestig wachtwoord"
                required
                disabled={loading}
                minLength={6}
                className="input-field"
              />

              <button type="submit" className="btn submit-btn" disabled={loading}>
                {loading ? 'resetten...' : 'wachtwoord resetten'}
              </button>
            </form>
          )
        )}

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
