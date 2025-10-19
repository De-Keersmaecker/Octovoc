import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import ModuleProgressFooter from '../components/common/ModuleProgressFooter'
import './Exercise.css'
import './Dashboard.css'

export default function DifficultWordsPage({ user }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [difficultWords, setDifficultWords] = useState([])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [practicing, setPracticing] = useState(false)
  const [attemptedWords, setAttemptedWords] = useState(new Set()) // Track which words have been attempted

  useEffect(() => {
    fetchDifficultWords()
  }, [])

  const fetchDifficultWords = async () => {
    try {
      const res = await api.get('/student/difficult-words')
      setDifficultWords(res.data)
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  const removeWord = async (wordId) => {
    if (!confirm('Weet je zeker dat je dit woord wilt verwijderen uit je moeilijke woorden?')) {
      return
    }

    try {
      await api.delete(`/student/difficult-words/${wordId}`)
      setDifficultWords(difficultWords.filter(dw => dw.word_id !== wordId))
    } catch (err) {
      console.error(err)
      alert('Fout bij verwijderen van woord')
    }
  }

  const startPractice = () => {
    if (difficultWords.length === 0) return
    setPracticing(true)
    setCurrentWordIndex(0)
    setAnswer('')
    setFeedback(null)
    setAttemptedWords(new Set()) // Reset attempted words for new session
  }

  const handleTextInput = (e) => {
    const value = e.target.value
    setAnswer(value)

    if (!feedback && difficultWords[currentWordIndex] && value.length > 0) {
      const currentWordData = difficultWords[currentWordIndex].word
      const currentWord = currentWordData.word
      const caseSensitive = currentWordData.case_sensitive || false

      // Check if answer is correct (respecting case sensitivity)
      const isCorrect = caseSensitive
        ? value === currentWord
        : value.toLowerCase() === currentWord.toLowerCase()

      if (isCorrect) {
        handleAnswer(value)
      } else if (value.length >= 3) {
        // Count mistakes: number of character positions that are wrong
        let mistakes = 0
        const userValue = caseSensitive ? value : value.toLowerCase()
        const correctWord = caseSensitive ? currentWord : currentWord.toLowerCase()
        const minLength = Math.min(userValue.length, correctWord.length)

        for (let i = 0; i < minLength; i++) {
          if (userValue[i] !== correctWord[i]) {
            mistakes++
          }
        }

        // If word lengths differ, count extra/missing characters as mistakes
        if (userValue.length !== correctWord.length) {
          mistakes += Math.abs(userValue.length - correctWord.length)
        }

        // Mark as incorrect after 3 mistakes (2 wrong, 3rd triggers submission)
        if (mistakes >= 3 && userValue.length >= correctWord.length) {
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

    const currentWordData = difficultWords[currentWordIndex].word
    const wordId = currentWordData.id
    const caseSensitive = currentWordData.case_sensitive || false
    const isCorrect = caseSensitive
      ? selectedAnswer === currentWordData.word
      : selectedAnswer.toLowerCase() === currentWordData.word.toLowerCase()
    const isFirstAttempt = !attemptedWords.has(wordId)

    // Mark this word as attempted
    setAttemptedWords(prev => new Set(prev).add(wordId))

    setFeedback({
      is_correct: isCorrect,
      correct_answer: currentWordData.word
    })

    setTimeout(() => {
      if (isCorrect && isFirstAttempt) {
        // Only remove if correct on FIRST attempt
        api.delete(`/student/difficult-words/${wordId}`)
          .catch(err => console.error(err))

        // Remove from local state
        const newDifficultWords = difficultWords.filter((_, idx) => idx !== currentWordIndex)
        setDifficultWords(newDifficultWords)

        if (newDifficultWords.length === 0) {
          // No more words
          setPracticing(false)
          navigate('/')
        } else if (currentWordIndex >= newDifficultWords.length) {
          // Was last word, go to first
          setCurrentWordIndex(0)
          setAnswer('')
          setFeedback(null)
        } else {
          // Move to next word (which is now at same index)
          setAnswer('')
          setFeedback(null)
        }
      } else {
        // If correct but NOT first attempt, or if incorrect: move to next word
        // The word stays in the list
        if (currentWordIndex + 1 < difficultWords.length) {
          setCurrentWordIndex(currentWordIndex + 1)
        } else {
          setCurrentWordIndex(0)
        }
        setAnswer('')
        setFeedback(null)
      }
    }, 800)
  }

  const handleTextSubmit = (e) => {
    e.preventDefault()
  }

  const renderSentence = (word) => {
    const match = word.example_sentence.match(/\*([^*]+)\*/)
    if (!match) return word.example_sentence

    const wordInSentence = match[1]

    // Detect inflection/conjugation suffix
    let suffix = ''
    const baseWord = word.word.toLowerCase()
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
    return word.example_sentence.replace(`*${wordInSentence}*`, blank)
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

  if (!practicing) {
    return (
      <div className="dashboard-stage">
        <header className="dashboard-header">
          <div className="dashboard-title">Octovoc</div>
          <div className="dashboard-user-info">
            {user.email}<br />
            {user.classroom_name || ''}
          </div>
        </header>

        <div className="dashboard-content">
          <div style={{
            fontFamily: 'Perpetua, Georgia, "Times New Roman", Times, serif',
            fontSize: 'clamp(24px, 3vw, 36px)',
            marginBottom: '30px'
          }}>
            moeilijke woorden
          </div>

          {difficultWords.length === 0 ? (
            <p style={{
              fontFamily: '"Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif',
              fontSize: 'clamp(14px, 1.2vw, 16px)',
              letterSpacing: '0.02em'
            }}>
              je hebt momenteel geen moeilijke woorden. goed bezig!
            </p>
          ) : (
            <>
              <p style={{
                fontFamily: '"Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif',
                fontSize: 'clamp(14px, 1.2vw, 16px)',
                letterSpacing: '0.02em',
                marginBottom: '20px'
              }}>
                je hebt {difficultWords.length} {difficultWords.length === 1 ? 'woord' : 'woorden'} om te oefenen
              </p>

              <button onClick={startPractice} className="dashboard-btn" style={{ marginBottom: '30px', padding: '12px 24px' }}>
                start oefenen
              </button>

              <ul className="module-list">
                {difficultWords.map((dw) => (
                  <li key={dw.id} className="module-item" style={{ cursor: 'default' }}>
                    <p className="module-info">
                      <strong>{dw.word.word}</strong>
                      <span className="module-details">
                        {' | '}
                        {dw.word.meaning}
                      </span>
                      <br />
                      <span style={{ opacity: 0.7, fontSize: 'clamp(12px, 1vw, 14px)', fontStyle: 'italic' }}>
                        {dw.word.example_sentence.replace(/\*/g, '')}
                      </span>
                    </p>
                    <button
                      onClick={() => removeWord(dw.word_id)}
                      className="dashboard-btn"
                      style={{
                        marginTop: '10px',
                        padding: '4px 12px',
                        fontSize: 'clamp(12px, 1vw, 14px)'
                      }}
                    >
                      verwijder
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          <button onClick={() => navigate('/')} className="dashboard-btn" style={{ marginTop: '30px' }}>
            ← terug naar dashboard
          </button>
        </div>
      </div>
    )
  }

  // Practice mode
  const currentWord = difficultWords[currentWordIndex].word

  return (
    <div className="exercise-stage">
      <header className="exercise-header">
        <div className="exercise-title">Octovoc</div>
        <div className="exercise-user">
          {user.email}<br />
          {user.classroom_name || ''}
        </div>
      </header>

      <div className="exercise-progress-bar">
        <div className="exercise-module-name">moeilijke woorden - oefenen</div>
        <div style={{ fontSize: 'clamp(12px, 1vw, 14px)', opacity: 0.85 }}>
          nog {difficultWords.length} {difficultWords.length === 1 ? 'woord' : 'woorden'}
        </div>
      </div>

      <div className="exercise-content">
        <div className="exercise-sentence" dangerouslySetInnerHTML={{ __html: renderSentence(currentWord) }} />

        <form onSubmit={handleTextSubmit} className="exercise-input-container">
          <input
            type="text"
            value={feedback && !feedback.is_correct ? feedback.correct_answer : answer}
            onChange={handleTextInput}
            disabled={feedback !== null}
            autoFocus
            placeholder="typ het woord..."
            className={`exercise-input ${feedback?.is_correct ? 'correct' : feedback ? 'incorrect' : ''}`}
          />
        </form>
      </div>
    </div>
  )
}
