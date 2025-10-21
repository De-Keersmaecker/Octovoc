import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import { setToken, setUser } from '../utils/auth'
import './LoginPage.css'

export default function RegisterPage({ setUser: setAppUser }) {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleCodeChange = (e) => {
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')

    // Auto-format with dash: XXXX-XXXX
    if (value.length > 4) {
      value = value.slice(0, 4) + '-' + value.slice(4, 8)
    }

    setCode(value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Wachtwoorden komen niet overeen')
      return
    }

    // Validate password length
    if (password.length < 6) {
      setError('Wachtwoord moet minimaal 6 karakters bevatten')
      return
    }

    // Validate code format
    if (code.length !== 9 || !code.includes('-')) {
      setError('Code moet het formaat XXXX-XXXX hebben')
      return
    }

    setLoading(true)

    try {
      const response = await api.post('/auth/register', {
        email,
        first_name: firstName,
        last_name: lastName,
        password,
        code
      })

      const { token, user } = response.data

      // Set token and user in localStorage
      setToken(token)
      setUser(user)
      setAppUser(user)

      // Navigate to dashboard (user is already logged in)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Registratie mislukt')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="stage" aria-label="octovoc registreer">
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
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="voornaam"
            required
            className="input-field"
          />

          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="achternaam"
            required
            className="input-field"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="wachtwoord (min. 6 karakters)"
            required
            className="input-field"
          />

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="bevestig wachtwoord"
            required
            className="input-field"
          />

          <input
            type="text"
            value={code}
            onChange={handleCodeChange}
            placeholder="XXXX-XXXX (klas- of lerarencode)"
            required
            maxLength={9}
            className="input-field"
            style={{ textTransform: 'uppercase' }}
          />

          <button type="submit" className="btn submit-btn" disabled={loading}>
            {loading ? 'laden...' : 'registreer'}
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
