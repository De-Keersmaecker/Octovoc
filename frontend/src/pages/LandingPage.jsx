import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import './LandingPage.css'

export default function LandingPage() {
  const navigate = useNavigate()
  const [currentText, setCurrentText] = useState('')
  const [fadeState, setFadeState] = useState('black') // 'black', 'fading-in', 'white', 'fading-out'
  const indexRef = useRef(0)

  const sequence = [
    '4600 woorden',
    '800 woorden per jaar',
    '5 woorden per schooldag',
    'gebouwd op data en wetenschap',
    'ontworpen voor groei',
    'slim leren, duurzaam onthouden'
  ]

  const FADE_IN = 1100
  const FADE_OUT = 1000
  const PAUSE = 120
  const LAST_PAUSE = 180

  const displayTimeFor = (text) => {
    const base = 500
    const perChar = 40
    const t = base + text.length * perChar
    return Math.max(700, Math.min(1700, t))
  }

  useEffect(() => {
    const showText = (i) => {
      const text = sequence[i]
      const displayTime = displayTimeFor(text)
      const isLast = i === sequence.length - 1
      const pause = isLast ? LAST_PAUSE : PAUSE

      // Set text instantly while black
      setCurrentText(text)
      setFadeState('black')

      // Start fade in
      setTimeout(() => {
        setFadeState('fading-in')
        setTimeout(() => {
          setFadeState('white')

          // Start fade out after display time
          setTimeout(() => {
            setFadeState('fading-out')

            // Move to next after fade out
            setTimeout(() => {
              indexRef.current = (i + 1) % sequence.length
              showText(indexRef.current)
            }, FADE_OUT + pause)
          }, displayTime)
        }, 50) // Small delay for transition to kick in
      }, 50)
    }

    // Start the cycle
    showText(0)
  }, [])

  const handleRoleClick = (role) => {
    if (role === 'gast') {
      navigate('/guest-level-select')
    } else if (role === 'leerling') {
      navigate('/login?type=student')
    } else if (role === 'leerkracht') {
      navigate('/login?type=teacher')
    }
  }

  return (
    <main className="stage" aria-label="octovoc intro">
      <section className="inner">
        <div className="brand">
          <video
            className="octopus"
            src="/octoloci.mp4"
            autoPlay
            loop
            muted
            playsInline
          />
          <h1 id="title" className="title" aria-label="octovoc">
            Octovoc
          </h1>
        </div>

        <div
          id="subwrap"
          className="subwrap"
          style={{
            color: fadeState === 'black' ? '#000' : '#fff',
            transition: fadeState === 'fading-in' ? `color ${FADE_IN}ms linear` :
                       fadeState === 'fading-out' ? `color ${FADE_OUT}ms linear` :
                       'none'
          }}
        >
          <div id="subtitle" className="subtitle" role="status" aria-live="polite">
            {currentText}
          </div>
        </div>

        <div id="underline" className="underline" aria-hidden="true"></div>

        <div id="buttons" className="buttons" aria-label="kies een rol">
          <button
            className="btn"
            type="button"
            onClick={() => handleRoleClick('gast')}
          >
            gast
          </button>
          <button
            className="btn"
            type="button"
            onClick={() => handleRoleClick('leerling')}
          >
            leerling
          </button>
          <button
            className="btn"
            type="button"
            onClick={() => handleRoleClick('leerkracht')}
          >
            leerkracht
          </button>
        </div>
      </section>
    </main>
  )
}
