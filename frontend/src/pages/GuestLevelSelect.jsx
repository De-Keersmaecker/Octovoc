import { useNavigate } from 'react-router-dom'

export default function GuestLevelSelect() {
  const navigate = useNavigate()

  const handleLevelSelect = (level) => {
    // Sla niveau op in session (niet localStorage, zodat refresh = reset)
    sessionStorage.setItem('guestLevel', level)
    sessionStorage.setItem('userType', 'guest')

    // Navigate naar dashboard
    navigate('/dashboard')
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
        marginBottom: '40px',
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
        marginBottom: '40px',
        textAlign: 'center',
        padding: '20px'
      }}>
        Welk niveau wil je oefenen?
      </div>

      {/* Level grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
        maxWidth: '500px',
        padding: '0 20px',
        marginBottom: '40px'
      }}>
        {[1, 2, 3, 4, 5, 6].map(level => (
          <button
            key={level}
            onClick={() => handleLevelSelect(level)}
            style={{
              backgroundColor: '#fff',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              padding: '40px',
              fontSize: '36px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 6px rgba(255,255,255,0.1)',
              aspectRatio: '1'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.1)'
              e.target.style.boxShadow = '0 6px 12px rgba(255,255,255,0.2)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)'
              e.target.style.boxShadow = '0 4px 6px rgba(255,255,255,0.1)'
            }}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Info text */}
      <div style={{
        backgroundColor: '#000',
        color: '#fff',
        fontSize: '16px',
        textAlign: 'center',
        padding: '20px',
        maxWidth: '600px',
        lineHeight: '1.6'
      }}>
        <p style={{ marginBottom: '15px' }}>
          Gasten kunnen alleen <strong>gratis modules</strong> oefenen.
        </p>
        <p style={{ marginBottom: '15px' }}>
          Geen voortgang wordt opgeslagen.
        </p>
        <p>
          Wil je klasaccounts met voortgangsopvolging?<br />
          <a
            href="/bestellen"
            style={{
              color: '#4a9eff',
              textDecoration: 'underline',
              fontWeight: '600'
            }}
          >
            Bestel hier vanaf €1,90 per leerling
          </a>
        </p>
      </div>
    </div>
  )
}
