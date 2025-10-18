import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function OrderPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    schoolName: '',
    numClassrooms: '',
    numStudents: '',
    numTeacherAccounts: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.post('/order/submit', formData)
      setSuccess(true)
      setFormData({
        name: '',
        email: '',
        schoolName: '',
        numClassrooms: '',
        numStudents: '',
        numTeacherAccounts: ''
      })
    } catch (err) {
      setError(err.response?.data?.error || 'Er is een fout opgetreden. Probeer het later opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="container">
        <header className="exercise-header">
          <div className="header-title">Octovoc</div>
        </header>

        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <h2 style={{ color: '#4caf50', marginBottom: '20px' }}>Bestelling ontvangen!</h2>
          <p style={{ fontSize: '18px', lineHeight: '1.6', marginBottom: '30px' }}>
            Bedankt voor je interesse in Octovoc! We nemen binnen de 3 werkdagen contact met je op
            voor een offerte en bevestiging van je bestelling.
          </p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Terug naar home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <header className="exercise-header">
        <div className="header-title">Octovoc</div>
      </header>

      <h2>Bestelformulier Klasaccounts</h2>

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <h3 style={{ marginTop: 0 }}>Prijs</h3>
          <p style={{ fontSize: '18px', margin: '10px 0' }}>
            <strong>€1,90</strong> per leerling per schooljaar
          </p>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: 0 }}>
            Inclusief voortgangsopvolging, onbeperkte oefenmogelijkheden en lerarenaccounts
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#ffebee',
            color: '#c62828',
            padding: '15px',
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Naam besteller *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Jan Janssen"
              required
            />
          </div>

          <div className="form-group">
            <label>E-mailadres *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="jan@school.be"
              required
            />
          </div>

          <div className="form-group">
            <label>Naam van de school *</label>
            <input
              type="text"
              name="schoolName"
              value={formData.schoolName}
              onChange={handleChange}
              placeholder="De Basisschool"
              required
            />
          </div>

          <div className="form-group">
            <label>Aantal klassen *</label>
            <input
              type="number"
              name="numClassrooms"
              value={formData.numClassrooms}
              onChange={handleChange}
              placeholder="6"
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label>Totaal aantal leerlingen *</label>
            <input
              type="number"
              name="numStudents"
              value={formData.numStudents}
              onChange={handleChange}
              placeholder="150"
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label>Aantal lerarenaccounts *</label>
            <input
              type="number"
              name="numTeacherAccounts"
              value={formData.numTeacherAccounts}
              onChange={handleChange}
              placeholder="10"
              min="1"
              required
            />
          </div>

          <div style={{
            backgroundColor: '#e3f2fd',
            padding: '15px',
            borderRadius: '4px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            <strong>Let op:</strong> Binnen de 3 werkdagen wordt er contact met je opgenomen
            voor een offerte en bevestiging van de bestelling.
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '12px', fontSize: '16px' }}
          >
            {loading ? 'Verzenden...' : 'Bestelling verzenden'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn"
            style={{ width: '100%', padding: '12px', fontSize: '16px', marginTop: '10px' }}
          >
            Annuleren
          </button>
        </form>
      </div>
    </div>
  )
}
