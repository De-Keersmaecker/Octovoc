import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import ModuleProgressFooter from '../components/common/ModuleProgressFooter'

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
    return <div className="loading">Laden...</div>
  }

  if (!practicing) {
    return (
      <div className="container">
        <header className="exercise-header">
          <div className="header-title">Octovoc</div>
          <div className="user-info">
            {user.email}<br />
            Klas 4B
          </div>
        </header>

        <div style={{ marginBottom: '20px' }}>
          <button onClick={() => navigate('/')} className="btn">
            ← terug naar dashboard
          </button>
        </div>

        <h2>mijn moeilijke woorden</h2>

        {difficultWords.length === 0 ? (
          <p>Je hebt momenteel geen moeilijke woorden. Goed bezig!</p>
        ) : (
          <>
            <p style={{ marginBottom: '20px' }}>
              Je hebt {difficultWords.length} {difficultWords.length === 1 ? 'woord' : 'woorden'} om te oefenen.
            </p>

            <button onClick={startPractice} className="btn btn-primary" style={{ marginBottom: '20px' }}>
              start oefenen
            </button>

            <table className="progress-table">
              <thead>
                <tr>
                  <th>Woord</th>
                  <th>Betekenis</th>
                  <th>Voorbeeldzin</th>
                  <th>Actie</th>
                </tr>
              </thead>
              <tbody>
                {difficultWords.map((dw) => (
                  <tr key={dw.id}>
                    <td><strong>{dw.word.word}</strong></td>
                    <td>{dw.word.meaning}</td>
                    <td style={{ fontSize: '14px', fontStyle: 'italic' }}>
                      {dw.word.example_sentence.replace(/\*/g, '')}
                    </td>
                    <td>
                      <button
                        onClick={() => removeWord(dw.word_id)}
                        className="btn"
                        style={{
                          padding: '4px 8px',
                          fontSize: '14px',
                          backgroundColor: '#f44336',
                          borderColor: '#f44336',
                          color: '#ffffff'
                        }}
                      >
                        verwijder
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    )
  }

  // Practice mode
  const currentWord = difficultWords[currentWordIndex].word

  return (
    <div className="container">
      <header className="exercise-header">
        <div className="header-title">Octovoc</div>
        <div className="user-info">
          {user.email}<br />
          Klas 4B
        </div>
      </header>

      <div className="module-progress-container">
        <div className="module-title">moeilijke woorden - oefenen</div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          Nog {difficultWords.length} {difficultWords.length === 1 ? 'woord' : 'woorden'}
        </div>
      </div>

      <div className="sentence" dangerouslySetInnerHTML={{ __html: renderSentence(currentWord) }} />

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
  )
}
