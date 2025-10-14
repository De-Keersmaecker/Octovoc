import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { logout } from '../utils/auth'

export default function StudentDashboard({ user, setUser }) {
  const [modules, setModules] = useState([])
  const [difficultWords, setDifficultWords] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCodeInput, setShowCodeInput] = useState(false)
  const [code, setCode] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [shouldBlink, setShouldBlink] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchModules()
    if (user) {
      fetchDifficultWords()
      if (!user.class_code) {
        setShowCodeInput(true)
        setShouldBlink(true)
        // Stop blinking after 4 seconds
        setTimeout(() => setShouldBlink(false), 4000)
      }
    }
  }, [user])

  const fetchModules = async () => {
    try {
      const response = await api.get('/student/modules')
      setModules(response.data)
    } catch (err) {
      console.error('Error fetching modules:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchDifficultWords = async () => {
    try {
      const response = await api.get('/student/difficult-words')
      setDifficultWords(response.data)
    } catch (err) {
      console.error('Error fetching difficult words:', err)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const response = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      setUser(response.data.user)
      fetchModules()
    } catch (err) {
      alert(err.response?.data?.error || 'Login mislukt')
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      const response = await api.post('/auth/register', { email, password })
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      setUser(response.data.user)
      fetchModules()
    } catch (err) {
      alert(err.response?.data?.error || 'Registratie mislukt')
    }
  }

  const handleAddCode = async (codeValue) => {
    if (isValidating) return

    setIsValidating(true)
    try {
      const response = await api.post('/auth/add-class-code', { code: codeValue })
      // Update user with new class info from the response
      const updatedUser = {
        ...user,
        class_code: codeValue,
        classroom_id: response.data.user.classroom_id,
        classroom_name: response.data.user.classroom_name,
        school_name: response.data.user.school_name,
        school_code: response.data.user.school_code
      }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setShowCodeInput(false)
      setCode('')
      fetchModules()
    } catch (err) {
      alert(err.response?.data?.error || 'Ongeldige code')
      setCode('')
    } finally {
      setIsValidating(false)
    }
  }

  const handleCodeChange = (e) => {
    const value = e.target.value.toUpperCase()
    setCode(value)

    // Auto-validate when 9 characters are entered (XXXX-YYYY format)
    if (value.length === 9 && !isValidating) {
      handleAddCode(value)
    }
  }

  const startModule = async (moduleId, isFree) => {
    // Check if module is accessible
    if (!isFree && (!user || !user.class_code)) {
      alert('Deze module is alleen toegankelijk met een klascode. Log in en voeg een klascode toe.')
      return
    }

    // Only require login for non-free modules
    if (!user && !isFree) {
      alert('Log in om deze module te starten')
      return
    }

    try {
      if (user) {
        // Only call start API if user is logged in
        await api.post(`/student/module/${moduleId}/start`)
      }
      navigate(`/exercise/${moduleId}`)
    } catch (err) {
      alert(err.response?.data?.error || 'Fout bij starten module')
    }
  }

  if (loading) {
    return <div className="loading">Laden...</div>
  }

  return (
    <div className="container">
      <header className="exercise-header">
        <div className="header-title">Octovoc</div>
        {user ? (
          <div className="user-info">
            <div style={{ marginBottom: '8px' }}>
              {user.email}
              {user.classroom_name && (
                <>
                  <br />
                  {user.school_name && `${user.school_name} | `}{user.classroom_name}
                </>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {showCodeInput && (
                <input
                  type="text"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="KLAS-C0dE"
                  maxLength={9}
                  disabled={isValidating}
                  style={{
                    padding: '4px 8px',
                    fontSize: '14px',
                    width: '100px',
                    textTransform: 'uppercase',
                    animation: shouldBlink ? 'blink-red 0.5s ease-in-out 8' : 'none',
                    border: shouldBlink ? '2px solid red' : '1px solid #ccc'
                  }}
                />
              )}
              <button onClick={logout} className="btn" style={{ padding: '4px 12px' }}>
                uitloggen
              </button>
            </div>
          </div>
        ) : (
          <div className="user-info" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
            <form onSubmit={handleLogin} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail"
                required
                style={{ padding: '6px 10px', fontSize: '14px', width: '150px' }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Wachtwoord"
                required
                style={{ padding: '6px 10px', fontSize: '14px', width: '120px' }}
              />
              <button type="submit" className="btn" style={{ padding: '6px 12px', fontSize: '14px' }}>
                login
              </button>
              <button type="button" onClick={handleRegister} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '14px' }}>
                registreer
              </button>
            </form>
          </div>
        )}
      </header>

      {modules.length === 0 ? (
        <p>Geen modules beschikbaar.</p>
      ) : (
        <ul className="module-list">
          {user && difficultWords.length > 0 && (
            <li
              className="module-item"
              onClick={() => navigate('/difficult-words')}
              style={{ cursor: 'pointer' }}
            >
              <h3>oefenen op moeilijkste woorden</h3>
              <p>
                {difficultWords.length} {difficultWords.length === 1 ? 'woord' : 'woorden'} om te oefenen
              </p>
            </li>
          )}
          {modules.map((module) => {
            const isAccessible = module.is_free || (user && user.class_code)
            const isLocked = !isAccessible

            return (
              <li
                key={module.id}
                className="module-item"
                onClick={() => isAccessible && startModule(module.id, module.is_free)}
                style={{
                  opacity: isLocked ? 0.5 : 1,
                  backgroundColor: isLocked ? '#e0e0e0' : 'white',
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                  position: 'relative'
                }}
              >
                <h3>
                  {module.name}
                  {isLocked && <span style={{ marginLeft: '8px', fontSize: '14px' }}>🔒</span>}
                </h3>
                <p>
                  {module.difficulty && `${module.difficulty} | `}
                  {module.word_count} woorden
                  {module.progress && ` | ${Math.round(module.completion_percentage)}% voltooid`}
                  {isLocked && <><br /><span style={{ color: '#666', fontSize: '13px' }}>klascode vereist</span></>}
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
