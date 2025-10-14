import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function ExercisePage({ user }) {
  const { moduleId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [currentWord, setCurrentWord] = useState(null)
  const [batteryWords, setBatteryWords] = useState([])
  const [phase, setPhase] = useState(1)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [batteryProgress, setBatteryProgress] = useState(null)
  const [moduleName, setModuleName] = useState('')
  const [progressHistory, setProgressHistory] = useState([])
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [questionQueue, setQuestionQueue] = useState([])
  const [batteryOrder, setBatteryOrder] = useState([])
  const [currentBatteryIndex, setCurrentBatteryIndex] = useState(0)

  useEffect(() => {
    startModule()
  }, [])

  const startModule = async () => {
    try {
      const progressRes = await api.post(`/student/module/${moduleId}/start`)
      const progress = progressRes.data

      // Get module details
      const modulesRes = await api.get('/student/modules')
      const module = modulesRes.data.find(m => m.id === parseInt(moduleId))
      if (module) {
        setModuleName(module.name)
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
      setFeedback(null)
      setAnswer('')
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

      // Update progress history
      const history = progressHistory.slice()
      const firstEmptyIndex = history.findIndex(item => item === null)
      if (firstEmptyIndex !== -1) {
        history[firstEmptyIndex] = res.data.is_correct ? 'correct' : 'incorrect'
        setProgressHistory(history)
      }

      // Handle anonymous mode
      if (res.data.anonymous || isAnonymous) {
        setTimeout(() => {
          handleAnonymousProgress(res.data.is_correct)
        }, currentPhase === 3 ? 800 : 1500)
      } else {
        // Authenticated mode
        setBatteryProgress(res.data.battery_progress)

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
          } else if (res.data.next_word) {
            setCurrentWord(res.data.next_word)
            setAnswer('')
            setFeedback(null)
          } else {
            console.error('Unexpected state', res.data)
            navigate('/')
          }
        }, currentPhase === 3 ? 800 : 1500)
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
      } else {
        // Battery complete
        const nextBatteryIndex = currentBatteryIndex + 1
        if (nextBatteryIndex < batteryOrder.length) {
          setCurrentBatteryIndex(nextBatteryIndex)
          startBattery(batteryOrder[nextBatteryIndex], true)
        } else {
          // All batteries done - for anonymous users, just go back home
          alert('Module voltooid! log in om je voortgang op te slaan.')
          navigate('/')
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

  const handleTextSubmit = (e) => {
    e.preventDefault()
  }

  const handleTextInput = (e) => {
    const value = e.target.value
    setAnswer(value)

    if (!feedback && currentWord && value.length > 0) {
      if (value === currentWord.word) {
        handleAnswer(value)
      } else if (value.length >= 3) {
        const distance = levenshteinDistance(value, currentWord.word)
        if (distance > 2 && value.length >= currentWord.word.length) {
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
    return <div className="loading">Laden...</div>
  }

  if (!currentWord) {
    return <div className="loading">Geen vragen beschikbaar</div>
  }

  const renderSentence = () => {
    const match = currentWord.example_sentence.match(/\*([^*]+)\*/)
    if (!match) return currentWord.example_sentence

    const wordInSentence = match[1]

    if (phase === 1) {
      return currentWord.example_sentence.replace(`*${wordInSentence}*`, `<span class="underline">${wordInSentence}</span>`)
    } else {
      return currentWord.example_sentence.replace(`*${wordInSentence}*`, '_________')
    }
  }

  return (
    <div className="container">
      <header className="exercise-header">
        <div className="header-title">Octovoc</div>
        <div className="user-info">
          {user ? (
            <>
              {user.email}<br />
              {user.classroom_name || 'Geen klas'}
            </>
          ) : (
            <>
              Gast<br />
              <small>Log in om voortgang op te slaan</small>
            </>
          )}
        </div>
      </header>

      <div className="module-progress-container">
        <div className="module-title">{moduleName}</div>
        <div className="progress-bar">
          {progressHistory.map((status, idx) => (
            <div key={idx} className={`progress-block ${status === 'correct' ? 'correct' : status === 'incorrect' ? 'incorrect' : 'empty'}`}>
              {status === 'correct' ? 'V' : status === 'incorrect' ? 'X' : ''}
            </div>
          ))}
        </div>
      </div>

      <div className="sentence" dangerouslySetInnerHTML={{ __html: renderSentence() }} />

      {phase === 3 ? (
        <form onSubmit={handleTextSubmit} className={`text-input-container ${feedback?.is_correct ? 'correct-input' : feedback ? 'incorrect-input' : ''}`}>
          <input
            type="text"
            value={feedback && !feedback.is_correct ? feedback.correct_answer : answer}
            onChange={handleTextInput}
            disabled={feedback !== null}
            autoFocus
            placeholder="Typ het woord..."
          />
        </form>
      ) : (
        <ul className="answers-list">
          {phase === 1 && batteryWords.map((word) => {
            const isCorrectAnswer = word.meaning === currentWord.meaning
            const wasClicked = feedback !== null
            let className = 'answer-option'

            if (wasClicked && isCorrectAnswer) {
              className += ' correct-answer'
            } else if (wasClicked && !feedback.is_correct && word.meaning === answer) {
              className += ' incorrect-answer'
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
            const wasClicked = feedback !== null
            let className = 'answer-option'

            if (wasClicked && isCorrectAnswer) {
              className += ' correct-answer'
            } else if (wasClicked && !feedback.is_correct && word.word === answer) {
              className += ' incorrect-answer'
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
  )
}
