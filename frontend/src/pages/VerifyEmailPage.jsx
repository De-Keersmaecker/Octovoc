import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../services/api'
import { setToken, setUser } from '../utils/auth'
import './LoginPage.css'

export default function VerifyEmailPage({ setUser: setAppUser }) {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('verifying') // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('')
  const [resendEmail, setResendEmail] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token')

      if (!token) {
        setStatus('error')
        setMessage('Geen geldige activatielink.')
        return
      }

      try {
        const response = await api.post(`/auth/verify/${token}`)
        setStatus('success')
        setMessage(response.data.message || 'Email succesvol geverifieerd!')

        // Auto-login: store token and user
        if (response.data.token && response.data.user) {
          setToken(response.data.token)
          setUser(response.data.user)
          if (setAppUser) {
            setAppUser(response.data.user)
          }

          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            navigate('/dashboard')
          }, 2000)
        }
      } catch (err) {
        setStatus('error')
        setMessage(err.response?.data?.error || 'Verificatie mislukt. De link is mogelijk verlopen.')
      }
    }

    verifyEmail()
  }, [searchParams, navigate, setAppUser])

  const handleResendEmail = async (e) => {
    e.preventDefault()
    setResendLoading(true)
    setResendSuccess(false)

    try {
      await api.post('/auth/resend-verification', { email: resendEmail })
      setResendSuccess(true)
    } catch (err) {
      setMessage(err.response?.data?.error || 'Kon geen nieuwe activatiemail versturen.')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <main className="stage" aria-label="octovoc email verificatie">
      <section className="inner">
        <h1 className="title">Octovoc</h1>

        <div className="underline" aria-hidden="true"></div>

        {status === 'verifying' && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            fontFamily: '"Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif',
            fontSize: 'clamp(14px, 1.2vw, 16px)',
            letterSpacing: '0.02em'
          }}>
            email verifiëren...
          </div>
        )}

        {status === 'success' && (
          <>
            <div className="error-msg" style={{
              background: 'rgba(76, 175, 80, 0.2)',
              borderColor: '#4caf50',
              color: '#4caf50',
              marginBottom: '20px'
            }}>
              {message}
            </div>
            <p style={{
              textAlign: 'center',
              fontFamily: '"Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif',
              fontSize: 'clamp(13px, 1.1vw, 15px)',
              letterSpacing: '0.02em',
              opacity: 0.7
            }}>
              je wordt doorgestuurd naar de login pagina...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="error-msg" style={{ marginBottom: '20px' }}>
              {message}
            </div>

            {message.includes('verlopen') && !resendSuccess && (
              <form onSubmit={handleResendEmail} className="login-form" style={{ marginTop: '30px' }}>
                <p style={{
                  textAlign: 'center',
                  fontFamily: '"Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif',
                  fontSize: 'clamp(13px, 1.1vw, 15px)',
                  letterSpacing: '0.02em',
                  marginBottom: '20px'
                }}>
                  voer je email in om een nieuwe activatielink te ontvangen:
                </p>
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="email"
                  required
                  className="input-field"
                />
                <button type="submit" className="btn submit-btn" disabled={resendLoading}>
                  {resendLoading ? 'laden...' : 'verstuur nieuwe link'}
                </button>
              </form>
            )}

            {resendSuccess && (
              <div className="error-msg" style={{
                background: 'rgba(76, 175, 80, 0.2)',
                borderColor: '#4caf50',
                color: '#4caf50',
                marginTop: '20px'
              }}>
                Nieuwe activatielink verstuurd! Check je inbox.
              </div>
            )}

            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'center',
              marginTop: '30px'
            }}>
              <button
                onClick={() => navigate('/register')}
                className="btn submit-btn"
              >
                opnieuw registreren
              </button>
              <button
                onClick={() => navigate('/login')}
                className="btn submit-btn"
                style={{ background: 'transparent' }}
              >
                naar login
              </button>
            </div>
          </>
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
