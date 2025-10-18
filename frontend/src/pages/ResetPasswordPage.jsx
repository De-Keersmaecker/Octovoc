import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../services/api'

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
      setError('Geen geldig reset token gevonden')
    }
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Wachtwoord moet minimaal 6 karakters bevatten')
      return
    }

    if (password !== confirmPassword) {
      setError('Wachtwoorden komen niet overeen')
      return
    }

    setLoading(true)

    try {
      const response = await api.post(`/auth/reset-password/${token}`, { password })
      setSuccess(true)
      setError('')

      // Redirect to home after 3 seconds
      setTimeout(() => {
        navigate('/')
      }, 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Er is een fout opgetreden')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <header className="exercise-header">
        <div className="header-title">Octovoc</div>
      </header>

      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <h2>Nieuw wachtwoord instellen</h2>

        {success ? (
          <div style={{
            padding: '20px',
            backgroundColor: '#c8e6c9',
            border: '1px solid #4caf50',
            borderRadius: '4px',
            textAlign: 'center'
          }}>
            <p style={{ marginBottom: '10px', fontSize: '18px', fontWeight: '700' }}>
              ✓ Wachtwoord succesvol gereset!
            </p>
            <p style={{ marginBottom: '0', color: '#666' }}>
              Je wordt doorgestuurd naar de startpagina...
            </p>
          </div>
        ) : (
          <>
            {error && (
              <div className="error" style={{ marginBottom: '20px' }}>
                {error}
              </div>
            )}

            {!token ? (
              <div className="error">
                <p>Geen geldig reset token gevonden.</p>
                <button
                  onClick={() => navigate('/forgot-password')}
                  className="btn"
                  style={{ marginTop: '10px' }}
                >
                  Nieuwe reset link aanvragen
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="password">Nieuw wachtwoord</label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="Minimaal 6 karakters"
                    minLength={6}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Bevestig wachtwoord</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="Herhaal je wachtwoord"
                    minLength={6}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                    style={{ flex: 1 }}
                  >
                    {loading ? 'Bezig...' : 'Wachtwoord resetten'}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="btn"
                    disabled={loading}
                  >
                    Annuleren
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  )
}
