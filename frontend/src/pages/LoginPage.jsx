import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import { setToken, setUser } from '../utils/auth'

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
      const { access_token, user } = response.data

      setToken(access_token)
      setUser(user)
      setAppUser(user)

      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login mislukt')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <header className="exercise-header">
        <div className="header-title">Octovoc</div>
      </header>

      <h2>Inloggen</h2>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Wachtwoord</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Laden...' : 'Inloggen'}
        </button>
      </form>

      <p style={{ marginTop: '20px' }}>
        Nog geen account? <Link to="/register">Registreer hier</Link>
      </p>
    </div>
  )
}
