import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import QuoteModal from '../components/common/QuoteModal'
import ModuleProgressFooter from '../components/common/ModuleProgressFooter'

export default function FinalRoundPage({ user }) {
  const { moduleId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [currentWord, setCurrentWord] = useState(null)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [remaining, setRemaining] = useState(0)
  const [moduleName, setModuleName] = useState('')
  const [showQuote, setShowQuote] = useState(false)
  const [quote, setQuote] = useState(null)

  useEffect(() => {
    startFinalRound()
  }, [])

  const startFinalRound = async () => {
    try {
      // Get module details
      const modulesRes = await api.get('/student/modules')
      const module = modulesRes.data.find(m => m.id === parseInt(moduleId))
      if (module) {
        setModuleName(module.name)
      }

      const res = await api.post(`/student/module/${moduleId}/final-round/start`)

      if (res.data.completed) {
        // No words in final round, go to completion
        showCompletionQuote()
      } else {
        setCurrentWord(res.data.current_word)
        setRemaining(res.data.remaining)
        setLoading(false)
      }
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  const showCompletionQuote = async () => {
    try {
      const res = await api.post(`/student/module/${moduleId}/complete`)
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

  const handleTextInput = (e) => {
    const value = e.target.value
    setAnswer(value)

    // Only check if not already showing feedback
    if (!feedback && currentWord && value.length > 0) {
      // If exactly correct, submit immediately as correct
      if (value === currentWord.word) {
        handleAnswer(value)
      }
      // Check if user has typed enough to evaluate
      else if (value.length >= 3) {
        // Count mistakes: number of character positions that are wrong
        let mistakes = 0
        const minLength = Math.min(value.length, currentWord.word.length)

        for (let i = 0; i < minLength; i++) {
          if (value[i] !== currentWord.word[i]) {
            mistakes++
          }
        }

        // If word lengths differ, count extra/missing characters as mistakes
        if (value.length !== currentWord.word.length) {
          mistakes += Math.abs(value.length - currentWord.word.length)
        }

        // Mark as incorrect after 3 mistakes (2 wrong, 3rd triggers submission)
        if (mistakes >= 3 && value.length >= currentWord.word.length) {
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

  const handleAnswer = async (selectedAnswer) => {
    if (feedback) return

    try {
      const res = await api.post(`/student/module/${moduleId}/final-round/answer`, {
        word_id: currentWord.id,
        answer: selectedAnswer
      })

      setFeedback(res.data)

      setTimeout(() => {
        if (res.data.final_round_complete) {
          // Final round complete, show quote
          showCompletionQuote()
        } else {
          // Next question
          setCurrentWord(res.data.next_word)
          setRemaining(res.data.remaining)
          setAnswer('')
          setFeedback(null)
        }
      }, 800)
    } catch (err) {
      console.error(err)
    }
  }

  const handleTextSubmit = (e) => {
    e.preventDefault()
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

  return (
    <>
      <div className="container">
        <header className="exercise-header">
          <div className="header-title">Octovoc</div>
          <div className="user-info">
            {user.email}<br />
            Klas 4B
          </div>
        </header>

        <div className="module-progress-container">
          <div className="module-title">{moduleName} - eindronde</div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Nog {remaining} {remaining === 1 ? 'woord' : 'woorden'}
          </div>
        </div>

        <div className="sentence" dangerouslySetInnerHTML={{ __html: renderSentence() }} />

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
      </div>

      <ModuleProgressFooter moduleId={moduleId} user={user} />

      {showQuote && <QuoteModal quote={quote} onClose={() => navigate('/')} />}
    </>
  )
}
