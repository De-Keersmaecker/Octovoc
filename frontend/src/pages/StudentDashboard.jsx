import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { logout } from '../utils/auth'
import './Dashboard.css'

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

  // Check if user is guest
  const isGuest = sessionStorage.getItem('userType') === 'guest'
  const guestLevel = isGuest ? parseInt(sessionStorage.getItem('guestLevel')) : null

  useEffect(() => {
    // If guest, set level to guestLevel
    if (isGuest && guestLevel) {
      setSelectedLevel(guestLevel)
      setAllowedLevels([guestLevel])
    } else {
      fetchAllowedLevels()
    }

    // Don't fetch modules here - let the selectedLevel useEffect handle it
    // This prevents a race condition where modules are fetched twice

    if (user && !isGuest) {
      fetchDifficultWords()
      if (!user.class_code) {
        setShowCodeInput(true)
        setShouldBlink(true)
        // Stop blinking after 4 seconds
        setTimeout(() => setShouldBlink(false), 4000)
      }
    }
  }, [user, isGuest, guestLevel])

  useEffect(() => {
    // When allowed levels change, ensure selected level is valid
    if (allowedLevels.length > 0 && !allowedLevels.includes(selectedLevel)) {
      const newLevel = allowedLevels[0]
      setSelectedLevel(newLevel)
      // Don't fetch here - let the next useEffect handle it
    } else if (allowedLevels.length > 0 && allowedLevels.includes(selectedLevel)) {
      // Level is valid, fetch modules
      fetchModules(selectedLevel)
    }
  }, [allowedLevels, selectedLevel])

  const fetchAllowedLevels = async () => {
    try {
      const response = await api.get('/student/allowed-levels')
      setAllowedLevels(response.data.allowed_levels || [1, 2, 3, 4, 5, 6])
    } catch (err) {
      console.error('Error fetching allowed levels:', err)
      setAllowedLevels([1, 2, 3, 4, 5, 6])
    }
  }

  const fetchModules = async (level = selectedLevel) => {
    try {
      setLoading(true)
      console.log(`Fetching modules for level ${level}`)
      const response = await api.get(`/student/modules?level=${level}`)
      let modulesData = response.data
      console.log(`Received ${modulesData.length} modules for level ${level}`, modulesData)

      // If guest, only show free modules
      if (isGuest) {
        modulesData = modulesData.filter(module => module.is_free)
        console.log(`After free filter: ${modulesData.length} modules`)
      }

      setModules(modulesData)
    } catch (err) {
      console.error('Error fetching modules:', err)
      setModules([]) // Clear modules on error
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
      fetchModules(selectedLevel)
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
      fetchModules(selectedLevel)
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
      fetchModules(selectedLevel)
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
    return (
      <div className="dashboard-stage">
        <div style={{
          textAlign: 'center',
          paddingTop: '100px',
          fontFamily: '"Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif',
          fontSize: 'clamp(14px, 1.2vw, 16px)',
          letterSpacing: '0.02em'
        }}>
          laden...
        </div>
      </div>
    )
  }

  const handleSwitchLevel = () => {
    sessionStorage.removeItem('guestLevel')
    sessionStorage.removeItem('userType')
    navigate('/guest-level-select')
  }

  return (
    <div className="dashboard-stage">
      <header className="dashboard-header" role="banner">
        <h1 className="dashboard-title">Octovoc</h1>
        {isGuest ? (
          <div className="dashboard-user-info">
            <div style={{ marginBottom: '8px' }}>
              gast - niveau {guestLevel}
            </div>
            <button onClick={handleSwitchLevel} className="dashboard-btn">
              wissel niveau
            </button>
          </div>
        ) : user ? (
          <div className="dashboard-user-info">
            <div style={{ marginBottom: '8px' }}>
              {user.email}
              {user.classroom_name && (
                <>
                  <br />
                  {user.school_name && `${user.school_name} | `}{user.classroom_name}
                </>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end' }}>
              {showCodeInput && (
                <input
                  type="text"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="KLAS-C0dE"
                  maxLength={9}
                  disabled={isValidating}
                  className={`dashboard-input ${shouldBlink ? 'blink' : ''}`}
                  style={{
                    width: '100px',
                    textTransform: 'uppercase'
                  }}
                />
              )}
              <button onClick={logout} className="dashboard-btn">
                uitloggen
              </button>
            </div>
          </div>
        ) : (
          <div className="dashboard-user-info" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', justifyContent: 'flex-end' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email"
                required
                className="dashboard-input"
                style={{ width: '150px' }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="wachtwoord"
                required
                className="dashboard-input"
                style={{ width: '120px' }}
              />
              <button type="submit" className="dashboard-btn">
                login
              </button>
              <button type="button" onClick={handleRegister} className="dashboard-btn">
                registreer
              </button>
              <a
                href="/forgot-password"
                style={{
                  fontSize: 'clamp(11px, 0.9vw, 12px)',
                  color: '#fff',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  flexBasis: '100%',
                  textAlign: 'right',
                  opacity: 0.7
                }}
              >
                wachtwoord vergeten?
              </a>
            </form>
          </div>
        )}
      </header>

      <main className="dashboard-content" role="main">
        {allowedLevels.length === 1 ? (
          <div style={{
            textAlign: 'center',
            fontFamily: '"Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif',
            fontSize: 'clamp(16px, 1.5vw, 20px)',
            letterSpacing: '0.03em',
            marginBottom: '30px',
            paddingBottom: '15px',
            borderBottom: '1px solid #fff'
          }}>
            niveau {selectedLevel}
          </div>
        ) : (
          <nav className="level-selector" role="navigation" aria-label="Niveau selectie">
            {[1, 2, 3, 4, 5, 6].map(level => {
              const isAllowed = allowedLevels.includes(level)
              const isSelected = selectedLevel === level

              return (
                <button
                  key={level}
                  onClick={() => isAllowed && setSelectedLevel(level)}
                  disabled={!isAllowed}
                  className={`level-btn-small ${isSelected ? 'active' : ''}`}
                  aria-label={`Niveau ${level}${isSelected ? ', geselecteerd' : ''}${!isAllowed ? ', niet beschikbaar' : ''}`}
                  aria-pressed={isSelected}
                >
                  {level}
                </button>
              )
            })}
          </nav>
        )}

        {modules.length === 0 ? (
          <p style={{
            textAlign: 'center',
            fontFamily: '"Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif',
            fontSize: 'clamp(13px, 1.1vw, 15px)',
            opacity: 0.7
          }}>
            geen modules beschikbaar
          </p>
        ) : (
          <ul className="module-list" role="list" aria-label="Beschikbare modules">
            {user && !isGuest && difficultWords.length > 0 && (
              <li
                className="module-item"
                onClick={() => navigate('/difficult-words')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/difficult-words'); } }}
                aria-label={`Oefenen op moeilijkste woorden, ${difficultWords.length} ${difficultWords.length === 1 ? 'woord' : 'woorden'}`}
              >
                <p className="module-info">
                  <strong>oefenen op moeilijkste woorden</strong>
                  <span className="module-details" aria-hidden="true">
                    {' | '}
                    {difficultWords.length} {difficultWords.length === 1 ? 'woord' : 'woorden'}
                  </span>
                </p>
              </li>
            )}
            {modules.map((module) => {
              const isAccessible = isGuest ? module.is_free : (module.is_free || (user && user.class_code))
              const isLocked = !isAccessible
              const progressText = module.progress && !isGuest ? `, ${Math.round(module.completion_percentage)}% voltooid` : ''
              const lockText = isLocked ? `, ${isGuest ? 'niet gratis' : 'klascode vereist'}` : ''

              return (
                <li
                  key={module.id}
                  className={`module-item ${isLocked ? 'locked' : ''}`}
                  onClick={() => isAccessible && startModule(module.id, module.is_free)}
                  role="button"
                  tabIndex={isAccessible ? 0 : -1}
                  onKeyDown={(e) => { if (isAccessible && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); startModule(module.id, module.is_free); } }}
                  aria-label={`${module.name}, ${module.word_count} woorden${progressText}${lockText}`}
                  aria-disabled={isLocked}
                >
                  <p className="module-info">
                    <strong>{module.name}</strong>
                    <span className="module-details" aria-hidden="true">
                      {' | '}
                      {module.word_count} woorden
                      {module.progress && !isGuest && ` | ${Math.round(module.completion_percentage)}% voltooid`}
                      {isLocked && <span className="module-locked"> | {isGuest ? 'niet gratis' : 'klascode vereist'}</span>}
                    </span>
                  </p>
                </li>
              )
            })}
          </ul>
        )}
      </main>
    </div>
  )
}
