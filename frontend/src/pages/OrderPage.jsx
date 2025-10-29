import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import './LoginPage.css'

export default function OrderPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
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
        phone: '',
        schoolName: '',
        numClassrooms: '',
        numStudents: '',
        numTeacherAccounts: ''
      })
    } catch (err) {
      setError(err.response?.data?.error || 'fout opgetreden')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <main className="stage" aria-label="octovoc bestelling">
        <section className="inner">
          <h1 className="title">Octovoc</h1>

          <div className="underline" aria-hidden="true"></div>

          <div className="error-msg" style={{ background: 'rgba(0, 255, 0, 0.15)', borderColor: 'rgba(0, 255, 0, 0.4)', marginTop: '30px' }}>
            bestelling ontvangen! we nemen binnen de 3 werkdagen contact met je op.
          </div>

          <button onClick={() => navigate('/')} className="btn back-btn" style={{ marginTop: '30px' }}>
            ← terug
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="stage" aria-label="octovoc bestellen">
      <section className="inner">
        <h1 className="title">Octovoc</h1>

        <div className="underline" aria-hidden="true"></div>

        <div style={{
          margin: '30px auto 20px auto',
          fontFamily: '"Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif',
          fontSize: 'clamp(15px, 1.3vw, 17px)',
          lineHeight: '1.4',
          letterSpacing: '0.02em',
          color: '#fff',
          maxWidth: '500px'
        }}>
          <div style={{ marginBottom: '10px' }}>€0,95 per leerling per schooljaar</div>
          <div style={{ opacity: 0.85, fontSize: 'clamp(13px, 1.1vw, 15px)' }}>
            inclusief voortgangsopvolging | onbeperkt oefenen | lerarenaccounts
          </div>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="naam"
            required
            className="input-field"
          />

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="email"
            required
            className="input-field"
          />

          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="telefoonnummer (optioneel - vermeld indien je graag telefonisch info krijgt)"
            className="input-field"
          />

          <input
            type="text"
            name="schoolName"
            value={formData.schoolName}
            onChange={handleChange}
            placeholder="school"
            required
            className="input-field"
          />

          <input
            type="number"
            name="numClassrooms"
            value={formData.numClassrooms}
            onChange={handleChange}
            placeholder="aantal klassen"
            min="1"
            required
            className="input-field"
          />

          <input
            type="number"
            name="numStudents"
            value={formData.numStudents}
            onChange={handleChange}
            placeholder="aantal leerlingen"
            min="1"
            required
            className="input-field"
          />

          <input
            type="number"
            name="numTeacherAccounts"
            value={formData.numTeacherAccounts}
            onChange={handleChange}
            placeholder="aantal lerarenaccounts"
            min="1"
            required
            className="input-field"
          />

          <button type="submit" className="btn submit-btn" disabled={loading}>
            {loading ? 'verzenden...' : 'info en offerte aanvragen'}
          </button>
        </form>

        <button
          className="btn back-btn"
          type="button"
          onClick={() => navigate('/')}
        >
          ← terug
        </button>
      </section>
    </main>
  )
}
