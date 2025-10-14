import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      await api.post('/auth/register', { email, password, code })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.error || 'Registratie mislukt')
    }
  }

  return (
    <div className="container">
      <header className="exercise-header">
        <div className="header-title">Octovoc</div>
      </header>

      <h2>Registreren</h2>

      {error && <div className="error">{error}</div>}
      {success && <div style={{padding: '10px', background: '#e0ffe0', border: '1px solid #00cc00', marginBottom: '16px'}}>Registratie geslaagd! Je wordt doorgestuurd...</div>}

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

        <div className="form-group">
          <label>Code (optioneel)</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="XXXX-YYYY"
          />
          <small>Vul je klas- of lerarencode in (optioneel)</small>
        </div>

        <button type="submit" className="btn btn-primary">
          Registreren
        </button>
      </form>

      <p style={{ marginTop: '20px' }}>
        Al een account? <Link to="/login">Log hier in</Link>
      </p>
    </div>
  )
}
