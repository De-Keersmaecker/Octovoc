import { useState, useEffect } from 'react'
import api from '../../services/api'

const ModuleProgressFooter = ({ moduleId, user }) => {
  const [progressData, setProgressData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!moduleId) return

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
  }, [moduleId, user])

  if (loading || !progressData) {
    return null
  }

  return (
    <footer style={{
      width: '100%',
      maxWidth: '800px',
      margin: '-40px auto 40px auto',
      padding: '0 10px'
    }}>
      <div style={{
        width: '100%',
        backgroundColor: '#f0f0f0',
        border: '2px solid #ccc',
        borderRadius: '4px',
        padding: '8px',
        boxSizing: 'border-box'
      }}>
        <div style={{
          fontSize: '11px',
          color: '#666',
          marginBottom: '4px',
          textAlign: 'center'
        }}>
          {progressData.masteredWords} van {progressData.totalWords} woorden onder de knie
        </div>
        <div style={{
          width: '100%',
          height: '12px',
          backgroundColor: '#e0e0e0',
          borderRadius: '6px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progressData.percentage}%`,
            height: '100%',
            backgroundColor: '#000',
            transition: 'width 0.5s ease-out'
          }} />
        </div>
      </div>
    </footer>
  )
}

export default ModuleProgressFooter
