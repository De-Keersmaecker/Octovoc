import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { logout } from '../utils/auth'
import './Dashboard.css'
import './Exercise.css'

export default function StudentDashboard({ user, setUser }) {
  const [modules, setModules] = useState([])
  const [difficultWords, setDifficultWords] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCodeInput, setShowCodeInput] = useState(false)
  const [code, setCode] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [shouldBlink, setShouldBlink] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState(1)
  const [allowedLevels, setAllowedLevels] = useState([1, 2, 3, 4, 5, 6])
  const navigate = useNavigate()

  // Track if initial setup is complete to prevent race conditions
  const isInitialized = useRef(false)
  const currentFetchLevel = useRef(null)

  // Check if user is guest
  const isGuest = sessionStorage.getItem('userType') === 'guest'
  const guestLevel = isGuest ? parseInt(sessionStorage.getItem('guestLevel')) : null

  // Define all callback functions BEFORE using them in useEffect
  const fetchAllowedLevels = useCallback(async () => {
    try {
      const response = await api.get('/student/allowed-levels')
      const levels = response.data.allowed_levels || [1, 2, 3, 4, 5, 6]
      setAllowedLevels(levels)
      return levels
    } catch (err) {
      console.error('Error fetching allowed levels:', err)
      const defaultLevels = [1, 2, 3, 4, 5, 6]
      setAllowedLevels(defaultLevels)
      return defaultLevels
    }
  }, [])

  const fetchModules = useCallback(async (level) => {
    // Prevent concurrent fetches for the same level
    if (currentFetchLevel.current === level) {
      return
    }

    try {
      currentFetchLevel.current = level

      const response = await api.get(`/student/modules?level=${level}`)
      let modulesData = response.data

      // If guest, only show free modules
      if (isGuest) {
        modulesData = modulesData.filter(module => module.is_free)
      }

      setModules(modulesData)
    } catch (err) {
      console.error('Error fetching modules:', err)
      setModules([]) // Clear modules on error
    } finally {
      currentFetchLevel.current = null
    }
  }, [isGuest])

  const fetchDifficultWords = useCallback(async () => {
    try {
      const response = await api.get('/student/difficult-words')
      setDifficultWords(response.data)
    } catch (err) {
      console.error('Error fetching difficult words:', err)
    }
  }, [])

  // Initialize on mount - fetch allowed levels and set initial level
  useEffect(() => {
    const initialize = async () => {
      setLoading(true)

      if (isGuest && guestLevel) {
        // Guest user - set level and allowed levels
        setSelectedLevel(guestLevel)
        setAllowedLevels([guestLevel])
        // Fetch modules for guest level
        await fetchModules(guestLevel)
      } else {
        // Logged in user - fetch allowed levels first
        const levels = await fetchAllowedLevels()

        // Determine initial level
        const initialLevel = levels.includes(selectedLevel) ? selectedLevel : levels[0]
        setSelectedLevel(initialLevel)

        // Fetch modules for initial level
        await fetchModules(initialLevel)

        // Fetch difficult words if logged in
        if (user && !isGuest) {
          fetchDifficultWords()
          if (!user.class_code) {
            setShowCodeInput(true)
            setShouldBlink(true)
            setTimeout(() => setShouldBlink(false), 4000)
          }
        }
      }

      isInitialized.current = true
      setLoading(false)
    }

    initialize()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  // Handle level changes after initialization
  useEffect(() => {
    if (!isInitialized.current) return // Skip during initialization

    // Fetch modules when user manually changes level
    if (allowedLevels.includes(selectedLevel)) {
      fetchModules(selectedLevel)
    }
  }, [selectedLevel, allowedLevels, fetchModules])

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

  const startModule = useCallback(async (moduleId, isFree) => {
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
  }, [user, navigate])

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

  // Memoize module list rendering to prevent unnecessary re-renders
  const moduleListItems = useMemo(() => {
    return modules.map((module) => {
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
    })
  }, [modules, isGuest, user, startModule])

  return (
    <div className="dashboard-stage">
      <a href="#main-content" className="skip-link">
        Spring naar modules
      </a>
      <header className="exercise-header" role="banner">
        <div className="exercise-title">Octovoc</div>
        {isGuest ? (
          <div className="exercise-user">
            gast
          </div>
        ) : user ? (
          <div className="exercise-user">
            {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email}
            {user.classroom_name && (
              <>
                <br />
                {user.school_name && `${user.school_name} | `}{user.classroom_name}
              </>
            )}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end', marginTop: '4px' }}>
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
          <div className="exercise-user" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button onClick={() => navigate('/login')} className="dashboard-btn">
              login
            </button>
            <button onClick={() => navigate('/register')} className="dashboard-btn">
              registreer
            </button>
          </div>
        )}
      </header>

      <div className="exercise-progress-bar">
        <div className="exercise-module-name">niveau {selectedLevel}</div>
        {isGuest ? (
          <button onClick={handleSwitchLevel} className="dashboard-btn">
            wissel niveau
          </button>
        ) : allowedLevels.length > 1 ? (
          <div style={{ display: 'flex', gap: '6px' }}>
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
                  style={{
                    minWidth: '30px',
                    padding: '4px 8px',
                    fontSize: 'clamp(12px, 1vw, 14px)'
                  }}
                >
                  {level}
                </button>
              )
            })}
          </div>
        ) : null}
      </div>

      <main id="main-content" className="dashboard-content" role="main">

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
            {moduleListItems}
          </ul>
        )}
      </main>
    </div>
  )
}
