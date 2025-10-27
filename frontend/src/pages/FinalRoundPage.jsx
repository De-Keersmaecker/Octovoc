import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import YouTubeRewardModal from '../components/common/YouTubeRewardModal'
import ModuleProgressFooter from '../components/common/ModuleProgressFooter'
import './Exercise.css'

export default function FinalRoundPage({ user }) {
  const { moduleId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [currentWord, setCurrentWord] = useState(null)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [remaining, setRemaining] = useState(0)
  const [moduleName, setModuleName] = useState('')
  const [showVideo, setShowVideo] = useState(false)
  const [videoUrl, setVideoUrl] = useState(null)
  const [instantFeedback, setInstantFeedback] = useState(null) // Immediate visual feedback before API call

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
      if (res.data.quote && res.data.quote.video_url) {
        setVideoUrl(res.data.quote.video_url)
        setShowVideo(true)
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
        setInstantFeedback({ is_correct: true })
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
      setInstantFeedback(null) // Clear instant feedback once real feedback arrives

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
          setInstantFeedback(null)
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
      <div className="exercise-stage">
        <header className="exercise-header">
          <div className="exercise-title">Octovoc</div>
          <div className="exercise-user">
            {user.email}<br />
            {user.classroom_name || ''}
          </div>
        </header>

        <div className="exercise-progress-bar">
          <div className="exercise-module-name">{moduleName} - eindronde</div>
          <div style={{ fontSize: 'clamp(12px, 1vw, 14px)', opacity: 0.85 }}>
            nog {remaining} {remaining === 1 ? 'woord' : 'woorden'}
          </div>
        </div>

        <div className="exercise-content">
          <div className="exercise-sentence" dangerouslySetInnerHTML={{ __html: renderSentence() }} />

          <form onSubmit={handleTextSubmit} className="exercise-input-container">
            <input
              type="text"
              value={feedback && !feedback.is_correct ? feedback.correct_answer : answer}
              onChange={handleTextInput}
              disabled={feedback !== null}
              autoFocus
              placeholder="typ het woord..."
              className={`exercise-input ${
                instantFeedback?.is_correct || feedback?.is_correct ? 'correct' :
                feedback ? 'incorrect' : ''
              }`}
            />
          </form>
        </div>
      </div>

      <ModuleProgressFooter moduleId={moduleId} user={user} />

      {showVideo && <YouTubeRewardModal videoUrl={videoUrl} moduleName={moduleName} onClose={() => navigate('/')} />}
    </>
  )
}
