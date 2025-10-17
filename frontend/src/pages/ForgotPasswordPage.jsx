import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

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
        <h2>Wachtwoord Vergeten</h2>

        <p style={{ marginBottom: '24px', color: '#666' }}>
          Voer je e-mailadres in en we sturen je een link om je wachtwoord te resetten.
        </p>

        {message && (
          <div style={{
            padding: '12px',
            backgroundColor: '#c8e6c9',
            border: '1px solid #4caf50',
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            {message}
          </div>
        )}

        {error && (
          <div className="error" style={{ marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">E-mailadres</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="jouw@email.com"
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? 'Versturen...' : 'Reset Link Versturen'}
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

        <div style={{
          marginTop: '24px',
          padding: '12px',
          backgroundColor: '#f5f5f5',
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          <strong>Let op:</strong> De reset link is 1 uur geldig. Als je geen email ontvangt,
          controleer dan je spam folder.
        </div>
      </div>
    </div>
  )
}
