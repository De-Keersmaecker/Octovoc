import { useState, useEffect } from 'react'
import api from '../../services/api'
import { setUser as saveUser } from '../../utils/auth'

export default function GDPRNotification({ user, setUser }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true)
    }, 10000) // Show after 10 seconds

    return () => clearTimeout(timer)
  }, [])

  const handleAccept = async () => {
    try {
      await api.post('/auth/accept-gdpr')
      const updatedUser = { ...user, gdpr_accepted: true }
      saveUser(updatedUser)
      setUser(updatedUser)
      setVisible(false)
    } catch (err) {
      console.error('Error accepting GDPR:', err)
    }
  }

  if (!visible || user.gdpr_accepted) {
    return null
  }

  return (
    <div className="gdpr-modal">
      <h3>Privacy en Gegevensverwerking</h3>
      <p style={{ marginTop: '12px', lineHeight: '1.6' }}>
        Octovoc verwerkt je persoonlijke gegevens (email, voortgang) om de service te kunnen leveren.
        Je gegevens worden niet gedeeld met derden. Accounts die 2 jaar inactief zijn worden automatisch verwijderd.
      </p>
      <button onClick={handleAccept} className="btn btn-primary" style={{ marginTop: '16px' }}>
        Akkoord
      </button>
    </div>
  )
}
