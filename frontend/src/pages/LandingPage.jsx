import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function LandingPage() {
  const navigate = useNavigate()
  const [userType, setUserType] = useState(null) // 'teacher', 'student', 'guest'

  const handleChoice = (type) => {
    setUserType(type)

    if (type === 'guest') {
      // Voor gasten: naar niveau keuze
      navigate('/guest-level-select')
    } else if (type === 'teacher') {
      // Voor leerkrachten: naar login
      navigate('/login?type=teacher')
    } else if (type === 'student') {
      // Voor leerlingen: naar login
      navigate('/login?type=student')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '80px'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#000',
        color: '#fff',
        fontSize: '48px',
        fontWeight: 'bold',
        marginBottom: '60px',
        textAlign: 'center',
        padding: '20px'
      }}>
        Octovoc
      </div>

      {/* Question */}
      <div style={{
        backgroundColor: '#000',
        color: '#fff',
        fontSize: '28px',
        marginBottom: '50px',
        textAlign: 'center',
        padding: '20px'
      }}>
        Wie ben je?
      </div>

      {/* Buttons */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '25px',
        width: '100%',
        maxWidth: '400px',
        padding: '0 20px'
      }}>
        <button
          onClick={() => handleChoice('teacher')}
          style={{
            backgroundColor: '#fff',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            padding: '25px 40px',
            fontSize: '24px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 4px 6px rgba(255,255,255,0.1)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)'
            e.target.style.boxShadow = '0 6px 12px rgba(255,255,255,0.2)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)'
            e.target.style.boxShadow = '0 4px 6px rgba(255,255,255,0.1)'
          }}
        >
          👨‍🏫 Leerkracht
        </button>

        <button
          onClick={() => handleChoice('student')}
          style={{
            backgroundColor: '#fff',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            padding: '25px 40px',
            fontSize: '24px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 4px 6px rgba(255,255,255,0.1)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)'
            e.target.style.boxShadow = '0 6px 12px rgba(255,255,255,0.2)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)'
            e.target.style.boxShadow = '0 4px 6px rgba(255,255,255,0.1)'
          }}
        >
          👨‍🎓 Leerling
        </button>

        <button
          onClick={() => handleChoice('guest')}
          style={{
            backgroundColor: '#fff',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            padding: '25px 40px',
            fontSize: '24px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 4px 6px rgba(255,255,255,0.1)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)'
            e.target.style.boxShadow = '0 6px 12px rgba(255,255,255,0.2)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)'
            e.target.style.boxShadow = '0 4px 6px rgba(255,255,255,0.1)'
          }}
        >
          👤 Gast Oefenen
        </button>
      </div>
    </div>
  )
}
