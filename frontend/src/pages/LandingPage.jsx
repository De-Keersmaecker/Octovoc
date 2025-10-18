import { useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import './LandingPage.css'

export default function LandingPage() {
  const navigate = useNavigate()
  const wrapRef = useRef(null)
  const elRef = useRef(null)

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
    const wrap = wrapRef.current
    const el = elRef.current
    if (!wrap || !el) return

    const toBlackInstant = () => {
      wrap.style.transition = 'none'
      wrap.style.color = '#000'
      void wrap.offsetWidth
    }

    const fadeToWhite = (duration) => {
      wrap.style.transition = `color ${duration}ms linear`
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          wrap.style.color = '#fff'
        })
      )
    }

    const fadeToBlack = (duration) => {
      wrap.style.transition = `color ${duration}ms linear`
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          wrap.style.color = '#000'
        })
      )
    }

    let idx = 0
    const show = (i) => {
      const text = sequence[i]
      const display = displayTimeFor(text)
      el.textContent = text
      toBlackInstant()
      fadeToWhite(FADE_IN)

      setTimeout(() => {
        fadeToBlack(FADE_OUT)
        const isLast = i === sequence.length - 1
        const pause = isLast ? LAST_PAUSE : PAUSE

        setTimeout(() => {
          idx = (i + 1) % sequence.length
          show(idx)
        }, FADE_OUT + pause)
      }, FADE_IN + display)
    }

    // Start the cycle
    show(idx)
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

        <div id="subwrap" className="subwrap" ref={wrapRef}>
          <div
            id="subtitle"
            className="subtitle"
            role="status"
            aria-live="polite"
            ref={elRef}
          ></div>
        </div>

        <div id="underline" className="underline" aria-hidden="true"></div>

        <div id="buttons" className="buttons" aria-label="kies een rol">
          <button
            className="btn"
            type="button"
            data-role="gast"
            onClick={() => handleRoleClick('gast')}
          >
            gast
          </button>
          <button
            className="btn"
            type="button"
            data-role="leerling"
            onClick={() => handleRoleClick('leerling')}
          >
            leerling
          </button>
          <button
            className="btn"
            type="button"
            data-role="leerkracht"
            onClick={() => handleRoleClick('leerkracht')}
          >
            leerkracht
          </button>
        </div>
      </section>
    </main>
  )
}
