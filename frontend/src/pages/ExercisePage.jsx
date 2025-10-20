import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import ModuleProgressFooter from '../components/common/ModuleProgressFooter'
import QuoteModal from '../components/common/QuoteModal'
import './Exercise.css'

export default function ExercisePage({ user }) {
  const { moduleId } = useParams()
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [currentWord, setCurrentWord] = useState(null)
  const [batteryWords, setBatteryWords] = useState([])
  const [phase, setPhase] = useState(1)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [batteryProgress, setBatteryProgress] = useState(null)
  const [moduleName, setModuleName] = useState('')
  const [progressHistory, setProgressHistory] = useState([])
  const [progressWordMap, setProgressWordMap] = useState({})
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [questionQueue, setQuestionQueue] = useState([])
  const [batteryOrder, setBatteryOrder] = useState([])
  const [currentBatteryIndex, setCurrentBatteryIndex] = useState(0)
  const [showQuote, setShowQuote] = useState(false)
  const [quote, setQuote] = useState(null)
  const [totalWordsInModule, setTotalWordsInModule] = useState(0)
  const [masteredWords, setMasteredWords] = useState(0)
  const [baselineMasteredWords, setBaselineMasteredWords] = useState(0)
  const [caseSensitive, setCaseSensitive] = useState(false)

  useEffect(() => {
    startModule()
  }, [])

  // Auto-focus input in phase 3 when currentWord changes or feedback clears
  useEffect(() => {
    if (phase === 3 && inputRef.current && !feedback) {
      inputRef.current.focus()
    }
  }, [phase, currentWord, feedback])

  const startModule = async () => {
    try {
      const progressRes = await api.post(`/student/module/${moduleId}/start`)
      const progress = progressRes.data

      // Get module details
      const modulesRes = await api.get('/student/modules')
      const module = modulesRes.data.find(m => m.id === parseInt(moduleId))
      if (module) {
        setModuleName(module.name)
        setTotalWordsInModule(module.word_count || 0)
        setCaseSensitive(module.case_sensitive || false)
        // Calculate initial mastered words based on progress
        if (module.progress) {
          const completed = module.progress.completed_batteries ? module.progress.completed_batteries.length : 0
          const total = module.progress.battery_order ? module.progress.battery_order.length : 1
          setMasteredWords(Math.round((module.word_count || 0) * completed / total))
        }
      }

      // Check if anonymous
      if (progress.anonymous) {
        setIsAnonymous(true)
        setBatteryOrder(progress.battery_order)
        if (progress.current_battery_id) {
          startBattery(progress.current_battery_id, true)
        }
      } else {
        setIsAnonymous(false)
        if (progress.current_battery_id) {
          startBattery(progress.current_battery_id, false)
        } else if (progress.in_final_round && !progress.is_completed) {
          navigate(`/final-round/${moduleId}`)
        } else if (progress.is_completed) {
          navigate('/')
        } else {
          navigate('/')
        }
      }
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  const startBattery = async (batteryId, anonymous = false) => {
    try {
      const res = await api.post(`/student/battery/${batteryId}/start`)

      if (res.data.anonymous) {
        // Anonymous mode - manage progress locally
        setIsAnonymous(true)
        setCurrentWord(res.data.current_word)
        setBatteryWords(res.data.battery_words)
        setPhase(1)
        setQuestionQueue(res.data.battery_progress.current_question_queue)
        setBatteryProgress(res.data.battery_progress)
      } else {
        // Authenticated mode - server manages progress
        const currentPhase = res.data.battery_progress.current_phase
        setCurrentWord(res.data.current_word)
        setBatteryWords(res.data.battery_words)
        setPhase(currentPhase)
        setBatteryProgress(res.data.battery_progress)
      }

      // Initialize progress history
      const totalWords = res.data.battery_words.length
      setProgressHistory(Array(totalWords).fill(null))
      setProgressWordMap({})
      setFeedback(null)
      setAnswer('')

      // Set baseline mastered words when starting a new battery (for phase 3 tracking)
      const phaseNum = res.data.anonymous ? res.data.phase : res.data.battery_progress.current_phase
      if (phaseNum === 3) {
        setBaselineMasteredWords(masteredWords)
      }

      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  const handleAnswer = async (selectedAnswer) => {
    if (feedback) return // Already answered

    setAnswer(selectedAnswer)
    const currentPhase = isAnonymous ? phase : batteryProgress.current_phase

    try {
      const res = await api.post('/student/question/answer', {
        battery_progress_id: batteryProgress.id,
        word_id: currentWord.id,
        answer: selectedAnswer,
        phase: currentPhase
      })

      setFeedback(res.data)

      // Play feedback sound and haptic
      playFeedbackSound(res.data.is_correct)

      // Update progress history
      const history = progressHistory.slice()
      const wordMap = { ...progressWordMap}

      // Check if this word was already answered in this phase
      const existingIndex = wordMap[currentWord.id]
      const wasIncorrectBefore = existingIndex !== undefined && history[existingIndex] === 'incorrect'

      if (existingIndex !== undefined) {
        // Update existing entry
        history[existingIndex] = res.data.is_correct ? 'correct' : 'incorrect'
      } else {
        // Add new entry
        const firstEmptyIndex = history.findIndex(item => item === null)
        if (firstEmptyIndex !== -1) {
          history[firstEmptyIndex] = res.data.is_correct ? 'correct' : 'incorrect'
          wordMap[currentWord.id] = firstEmptyIndex
        }
      }
      setProgressHistory(history)
      setProgressWordMap(wordMap)

      // In phase 3, update mastered words counter for real-time progress
      if (currentPhase === 3) {
        // Count words that are correct in the current battery
        const correctCount = history.filter(status => status === 'correct').length
        // Update total: baseline (from completed batteries) + current battery correct words
        setMasteredWords(baselineMasteredWords + correctCount)
      }

      // Handle anonymous mode
      if (res.data.anonymous || isAnonymous) {
        // For phase 3 incorrect answers, show answer for 3 seconds
        const delay = currentPhase === 3 && !res.data.is_correct ? 3000 : (currentPhase === 3 ? 800 : 1500)
        setTimeout(() => {
          handleAnonymousProgress(res.data.is_correct)
        }, delay)
      } else {
        // Authenticated mode
        setBatteryProgress(res.data.battery_progress)

        // For phase 3 incorrect answers, show answer for 3 seconds
        const delay = currentPhase === 3 && !res.data.is_correct ? 3000 : (currentPhase === 3 ? 800 : 1500)
        setTimeout(() => {
          if (res.data.battery_complete) {
            startModule()
          } else if (res.data.phase_complete) {
            setPhase(res.data.battery_progress.current_phase)
            if (res.data.next_word) {
              setCurrentWord(res.data.next_word)
            }
            setAnswer('')
            setFeedback(null)
            const totalWords = batteryWords.length
            setProgressHistory(Array(totalWords).fill(null))
            setProgressWordMap({})
          } else if (res.data.next_word) {
            setCurrentWord(res.data.next_word)
            setAnswer('')
            setFeedback(null)
          } else {
            console.error('Unexpected state', res.data)
            navigate('/')
          }
        }, delay)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleAnonymousProgress = (isCorrect) => {
    let newQueue = [...questionQueue]

    if (isCorrect) {
      // Remove from queue
      newQueue.shift()
    } else {
      // Move to end
      const word = newQueue.shift()
      newQueue.push(word)
    }

    setQuestionQueue(newQueue)

    // Check if phase complete
    if (newQueue.length === 0) {
      if (phase < 3) {
        // Next phase
        setPhase(phase + 1)
        // Reset queue with all battery words
        const allWordIds = batteryWords.map(w => w.id)
        const shuffled = [...allWordIds].sort(() => Math.random() - 0.5)
        setQuestionQueue(shuffled)
        setCurrentWord(batteryWords.find(w => w.id === shuffled[0]))
        setProgressHistory(Array(batteryWords.length).fill(null))
        setProgressWordMap({})
      } else {
        // Battery complete
        const nextBatteryIndex = currentBatteryIndex + 1
        if (nextBatteryIndex < batteryOrder.length) {
          setCurrentBatteryIndex(nextBatteryIndex)
          startBattery(batteryOrder[nextBatteryIndex], true)
        } else {
          // All batteries done - for anonymous users, show quote
          showCompletionQuote()
        }
      }
      setAnswer('')
      setFeedback(null)
    } else {
      // Next question in same phase
      const nextWordId = newQueue[0]
      const nextWord = batteryWords.find(w => w.id === nextWordId)
      setCurrentWord(nextWord)
      setAnswer('')
      setFeedback(null)
    }
  }

  const showCompletionQuote = async () => {
    try {
      const res = await api.get('/student/quote/random')
      if (res.data.quote) {
        setQuote(res.data.quote)
        setShowQuote(true)
      } else {
        navigate('/')
      }
    } catch (err) {
      console.error(err)
      navigate('/')
    }
  }

  const playFeedbackSound = async (isCorrect) => {
    try {
      // Create or reuse audio context
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (!window.globalAudioContext) {
        window.globalAudioContext = new AudioContext()
      }
      const audioContext = window.globalAudioContext

      // Resume audio context if suspended (required by some browsers)
      if (audioContext.state === 'suspended') {
        await audioContext.resume()
      }

      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      if (isCorrect) {
        // Success sound: short pleasant tone
        oscillator.frequency.value = 800
        oscillator.type = 'sine'
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.15)

        // Single short vibration for correct answer
        if (navigator.vibrate) {
          navigator.vibrate(50)
        }
      } else {
        // Error sound: buzz
        oscillator.frequency.value = 200
        oscillator.type = 'sawtooth'
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.3)

        // Longer vibration for incorrect answer
        if (navigator.vibrate) {
          navigator.vibrate(200)
        }
      }
    } catch (error) {
      // Silently fail if audio doesn't work
      console.log('Audio playback not available:', error)

      // At least try vibration
      if (navigator.vibrate) {
        navigator.vibrate(isCorrect ? 50 : 200)
      }
    }
  }

  const handleTextSubmit = (e) => {
    e.preventDefault()
  }

  const handleTextInput = (e) => {
    const value = e.target.value
    setAnswer(value)

    if (!feedback && currentWord && value.length > 0) {
      // Check if answer is correct (respecting case sensitivity setting)
      const isCorrect = caseSensitive
        ? value === currentWord.word
        : value.toLowerCase() === currentWord.word.toLowerCase()

      if (isCorrect) {
        handleAnswer(value)
      } else {
        // Count mistakes: number of character positions that are wrong
        let mistakes = 0
        const userValue = caseSensitive ? value : value.toLowerCase()
        const correctWord = caseSensitive ? currentWord.word : currentWord.word.toLowerCase()

        // Compare each character position
        for (let i = 0; i < userValue.length; i++) {
          if (i >= correctWord.length || userValue[i] !== correctWord[i]) {
            mistakes++
          }
        }

        // Submit as incorrect immediately after 3 mistakes
        if (mistakes >= 3) {
          handleAnswer(value)
        }
      }
    }
  }

  const levenshteinDistance = (str1, str2) => {
    const matrix = []

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }

    return matrix[str2.length][str1.length]
  }

  if (loading) {
    return (
      <div className="exercise-stage">
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

  if (!currentWord) {
    return (
      <div className="exercise-stage">
        <div style={{
          textAlign: 'center',
          paddingTop: '100px',
          fontFamily: '"Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif',
          fontSize: 'clamp(14px, 1.2vw, 16px)',
          letterSpacing: '0.02em'
        }}>
          geen vragen beschikbaar
        </div>
      </div>
    )
  }

  const renderSentence = () => {
    const match = currentWord.example_sentence.match(/\*([^*]+)\*/)
    if (!match) return currentWord.example_sentence

    const wordInSentence = match[1]

    if (phase === 1) {
      return currentWord.example_sentence.replace(`*${wordInSentence}*`, `<span class="underline">${wordInSentence}</span>`)
    } else {
      // Detect inflection/conjugation suffix
      let suffix = ''
      const baseWord = currentWord.word.toLowerCase()
      const sentenceWord = wordInSentence.toLowerCase()

      // Check if the word in the sentence is inflected/conjugated
      if (baseWord !== sentenceWord) {
        // Check if baseWord is a prefix of sentenceWord
        if (sentenceWord.startsWith(baseWord)) {
          suffix = wordInSentence.substring(baseWord.length)
        }
        // Check for stem changes (e.g., 'run' -> 'running' where 'n' is doubled)
        else if (sentenceWord.length > baseWord.length) {
          // Find the common prefix
          let commonLength = 0
          for (let i = 0; i < Math.min(baseWord.length, sentenceWord.length); i++) {
            if (baseWord[i] === sentenceWord[i]) {
              commonLength++
            } else {
              break
            }
          }

          // If most of the word matches, extract the suffix from the sentence word
          if (commonLength >= baseWord.length - 1) {
            suffix = wordInSentence.substring(commonLength)
          }
        }
      }

      const blank = '_________' + suffix
      return currentWord.example_sentence.replace(`*${wordInSentence}*`, blank)
    }
  }

  return (
    <>
      <div className="exercise-stage">
        <header className="exercise-header">
          <div className="exercise-title">Octovoc</div>
          <div className="exercise-user">
            {user ? (
              <>
                {user.email}<br />
                {user.classroom_name || ''}
              </>
            ) : (
              <>
                gast<br />
                <span style={{ opacity: 0.7 }}>voortgang wordt niet opgeslagen</span>
              </>
            )}
          </div>
        </header>

        <div className="exercise-progress-bar">
          <div className="exercise-module-name">{moduleName}</div>
          <div className="progress-blocks">
            {progressHistory.map((status, idx) => (
              <div key={idx} className={`progress-block ${status === 'correct' ? 'correct' : status === 'incorrect' ? 'incorrect' : ''}`}>
                {status === 'correct' ? '✓' : status === 'incorrect' ? '✗' : ''}
              </div>
            ))}
          </div>
        </div>

        <div className="exercise-content">
          <div className="exercise-sentence" dangerouslySetInnerHTML={{ __html: renderSentence() }} />

          {phase === 3 ? (
            <form onSubmit={handleTextSubmit} className="exercise-input-container">
              <input
                ref={inputRef}
                type="text"
                value={feedback && !feedback.is_correct ? feedback.correct_answer : answer}
                onChange={handleTextInput}
                disabled={feedback !== null}
                autoFocus
                placeholder="typ het woord..."
                className={`exercise-input ${feedback?.is_correct ? 'correct' : feedback ? 'incorrect' : ''}`}
              />
            </form>
          ) : (
            <ul className="exercise-answers">
              {phase === 1 && batteryWords.map((word) => {
                const isCorrectAnswer = word.meaning === currentWord.meaning
                const hasAnswer = feedback !== null && answer !== ''
                const isClickedAnswer = word.meaning === answer
                let className = 'exercise-answer'

                if (hasAnswer && isCorrectAnswer) {
                  className += ' correct'
                } else if (hasAnswer && !feedback.is_correct && isClickedAnswer) {
                  className += ' incorrect'
                } else if (hasAnswer && !feedback.is_correct && !isCorrectAnswer) {
                  className += ' disabled'
                }

                return (
                  <li
                    key={word.id}
                    className={className}
                    onClick={() => !feedback && handleAnswer(word.meaning)}
                  >
                    {word.meaning}
                  </li>
                )
              })}

              {phase === 2 && batteryWords.map((word) => {
                const isCorrectAnswer = word.word === currentWord.word
                const hasAnswer = feedback !== null && answer !== ''
                const isClickedAnswer = word.word === answer
                let className = 'exercise-answer'

                if (hasAnswer && isCorrectAnswer) {
                  className += ' correct'
                } else if (hasAnswer && !feedback.is_correct && isClickedAnswer) {
                  className += ' incorrect'
                } else if (hasAnswer && !feedback.is_correct && !isCorrectAnswer) {
                  className += ' disabled'
                }

                return (
                  <li
                    key={word.id}
                    className={className}
                    onClick={() => !feedback && handleAnswer(word.word)}
                  >
                    {word.word}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      <ModuleProgressFooter
        moduleId={moduleId}
        user={user}
        masteredWordsOverride={phase === 3 ? masteredWords : undefined}
        totalWordsOverride={phase === 3 ? totalWordsInModule : undefined}
      />

      {showQuote && <QuoteModal quote={quote} onClose={() => navigate('/')} />}
    </>
  )
}
