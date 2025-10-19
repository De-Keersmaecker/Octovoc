import { useNavigate } from 'react-router-dom'
import './GuestLevelSelect.css'

export default function GuestLevelSelect() {
  const navigate = useNavigate()

  const handleLevelSelect = (level) => {
    sessionStorage.setItem('guestLevel', level)
    sessionStorage.setItem('userType', 'guest')
    navigate('/dashboard')
  }

  const levels = [
    { num: 1, age: '12/13 jaar' },
    { num: 2, age: '13/14 jaar' },
    { num: 3, age: '14/15 jaar' },
    { num: 4, age: '15/16 jaar' },
    { num: 5, age: '16/17 jaar' },
    { num: 6, age: '17+ jaar' }
  ]

  return (
    <main className="stage" aria-label="octovoc gast niveau">
      <section className="inner">
        <h1 className="title">Octovoc</h1>

        <div className="subtitle-text">kies je niveau</div>

        <div className="underline" aria-hidden="true"></div>

        <div className="level-grid" aria-label="kies niveau">
          {levels.map(level => (
            <button
              key={level.num}
              className="level-btn"
              type="button"
              onClick={() => handleLevelSelect(level.num)}
            >
              <div className="level-num">{level.num}</div>
              <div className="level-age">{level.age}</div>
            </button>
          ))}
        </div>

        <div className="info-text">
          Met een gast-login kan je alle modules gebruiken om te oefenen, maar wordt jouw voortgang niet bijgehouden. <a href="/bestellen" className="info-link">Bestel een licentie</a> als je de vorderingen systematisch wil opvolgen. Lees meer over <a href="/methodologie" className="info-link">de methodologie achter Octovoc</a>.
        </div>

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
