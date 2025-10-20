import { useState, useEffect } from 'react'
import api from '../../services/api'

const ModuleProgressFooter = ({ moduleId, user, masteredWordsOverride, totalWordsOverride }) => {
  const [progressData, setProgressData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!moduleId) return

    // If override values are provided, use them directly
    if (masteredWordsOverride !== undefined && totalWordsOverride !== undefined) {
      const percentage = totalWordsOverride > 0 ? (masteredWordsOverride / totalWordsOverride * 100) : 0
      setProgressData({
        totalWords: totalWordsOverride,
        masteredWords: masteredWordsOverride,
        percentage
      })
      setLoading(false)
      return
    }

    const fetchModuleProgress = async () => {
      try {
        // Get all modules to find this specific one
        const response = await api.get('/student/modules')
        const module = response.data.find(m => m.id === parseInt(moduleId))

        if (module) {
          // Calculate mastered words
          // For now, use completion_percentage as a proxy
          // Later we can add a specific "mastered_words" field
          const totalWords = module.word_count || 0
          const masteredWords = Math.round(totalWords * (module.completion_percentage || 0) / 100)

          setProgressData({
            totalWords,
            masteredWords,
            percentage: module.completion_percentage || 0
          })
        }
      } catch (err) {
        console.error('Error fetching module progress:', err)
      } finally {
        setLoading(false)
      }
    }

    // Only fetch for logged in users
    if (user) {
      fetchModuleProgress()
    } else {
      setLoading(false)
    }
  }, [moduleId, user, masteredWordsOverride, totalWordsOverride])

  if (loading || !progressData) {
    return null
  }

  return (
    <footer style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      width: '100%',
      backgroundColor: '#000',
      borderTop: '1px solid #fff',
      padding: '12px 20px',
      zIndex: 100
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        <div style={{
          fontSize: 'clamp(11px, 0.9vw, 13px)',
          color: '#fff',
          marginBottom: '6px',
          textAlign: 'center',
          fontFamily: '"Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif',
          letterSpacing: '0.02em'
        }}>
          {progressData.masteredWords} van {progressData.totalWords} woorden onder de knie
        </div>
        <div style={{
          width: '100%',
          height: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progressData.percentage}%`,
            height: '100%',
            backgroundColor: '#4caf50',
            transition: 'width 0.5s ease-out'
          }} />
        </div>
      </div>
    </footer>
  )
}

export default ModuleProgressFooter
