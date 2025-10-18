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
  const [selectedLevel, setSelectedLevel] = useState(1)
  const [allowedLevels, setAllowedLevels] = useState([1, 2, 3, 4, 5, 6])
  const navigate = useNavigate()

  useEffect(() => {
    fetchAllowedLevels()
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

  useEffect(() => {
    // When allowed levels change, ensure selected level is valid
    if (allowedLevels.length > 0 && !allowedLevels.includes(selectedLevel)) {
      setSelectedLevel(allowedLevels[0])
    }
  }, [allowedLevels, selectedLevel])

  useEffect(() => {
    // Fetch modules when selected level changes
    fetchModules()
  }, [selectedLevel])

  const fetchAllowedLevels = async () => {
    try {
      const response = await api.get('/student/allowed-levels')
      setAllowedLevels(response.data.allowed_levels || [1, 2, 3, 4, 5, 6])
    } catch (err) {
      console.error('Error fetching allowed levels:', err)
      setAllowedLevels([1, 2, 3, 4, 5, 6])
    }
  }

  const fetchModules = async () => {
    try {
      const response = await api.get(`/student/modules?level=${selectedLevel}`)
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
            <form onSubmit={handleLogin} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', justifyContent: 'flex-end' }}>
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
              <a
                href="/forgot-password"
                style={{
                  fontSize: '12px',
                  color: '#666',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  flexBasis: '100%',
                  textAlign: 'right'
                }}
              >
                wachtwoord vergeten?
              </a>
            </form>
          </div>
        )}
      </header>

      {/* Level tabs - black bar with white text */}
      <div style={{
        backgroundColor: '#000',
        padding: '12px 20px',
        display: 'flex',
        gap: '12px',
        overflowX: 'auto',
        marginBottom: '20px'
      }}>
        {[1, 2, 3, 4, 5, 6].map(level => {
          const isAllowed = allowedLevels.includes(level)
          const isSelected = selectedLevel === level

          return (
            <button
              key={level}
              onClick={() => isAllowed && setSelectedLevel(level)}
              disabled={!isAllowed}
              style={{
                backgroundColor: isSelected ? '#fff' : 'transparent',
                color: isSelected ? '#000' : '#fff',
                border: isSelected ? 'none' : '1px solid #fff',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: isAllowed ? 'pointer' : 'not-allowed',
                opacity: isAllowed ? 1 : 0.3,
                whiteSpace: 'nowrap',
                fontSize: '14px',
                fontWeight: isSelected ? 'bold' : 'normal',
                transition: 'all 0.2s'
              }}
            >
              {level}
            </button>
          )
        })}
      </div>

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
                  backgroundColor: 'white',
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                  position: 'relative'
                }}
              >
                <p style={{ margin: 0, fontSize: '16px', color: isLocked ? '#888' : 'inherit' }} className="module-info">
                  <strong>{module.name}</strong>
                  <span className="module-details">
                    {' | '}
                    <span className="module-word-count">{module.word_count} woorden</span>
                    {module.progress && <span className="module-progress"> | {Math.round(module.completion_percentage)}% voltooid</span>}
                    {isLocked && <span className="module-locked"> | klascode vereist</span>}
                  </span>
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
