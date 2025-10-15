import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function GDPRNotification() {
  const [visible, setVisible] = useState(false)
  const location = useLocation()

  useEffect(() => {
    // Don't show on privacy page
    if (location.pathname === '/privacy') {
      return
    }

    // Check if user has already accepted
    const hasAccepted = localStorage.getItem('gdpr_accepted')
    if (hasAccepted) {
      return
    }

    // Show after 15 seconds
    const timer = setTimeout(() => {
      setVisible(true)
    }, 15000)

    return () => clearTimeout(timer)
  }, [location.pathname])

  const handleAccept = () => {
    localStorage.setItem('gdpr_accepted', 'true')
    setVisible(false)
  }

  if (!visible) {
    return null
  }

  return (
    <div className="gdpr-modal">
      <h3>Privacy en Gegevensverwerking</h3>
      <div style={{
        marginTop: '12px',
        lineHeight: '1.6',
        maxHeight: '400px',
        overflowY: 'auto',
        fontSize: '14px'
      }}>
        <p>
          <strong>Cookies en lokale opslag</strong><br />
          Octovoc gebruikt geen cookies, maar maakt gebruik van <em>localStorage</em> om je inloggegevens
          en voortgang lokaal in je browser op te slaan. Deze informatie wordt niet gedeeld met derden
          en blijft op je eigen apparaat.
        </p>

        <p>
          <strong>Persoonsgegevens</strong><br />
          Wanneer je een account aanmaakt, verwerken we je e-mailadres en wachtwoord (versleuteld)
          om inloggen mogelijk te maken. Daarnaast slaan we je leervoortgang op om je resultaten
          bij te houden.
        </p>

        <p>
          <strong>Beveiliging</strong><br />
          Alle communicatie tussen je browser en onze server verloopt via HTTPS. Wachtwoorden worden
          versleuteld opgeslagen en zijn niet leesbaar voor ons.
        </p>

        <p>
          <strong>Accountbeheer</strong><br />
          Accounts die 24 maanden niet worden gebruikt, worden automatisch verwijderd.
          Je kan op elk moment je account laten verwijderen door contact met ons op te nemen.
        </p>

        <p>
          <strong>Geen gegevens delen</strong><br />
          We delen je gegevens niet met derden. Octovoc is een educatief platform zonder
          commerciële doeleinden.
        </p>

        <p>
          <strong>Je rechten</strong><br />
          Je hebt recht op inzage, correctie en verwijdering van je gegevens. Neem hiervoor
          contact met ons op.
        </p>

        <p style={{ marginTop: '16px', fontSize: '13px', color: '#666' }}>
          Voor meer informatie, zie onze volledige <a href="/privacy" style={{ color: '#0066cc' }}>Privacyverklaring</a>.
        </p>

        <p style={{ marginTop: '12px', fontSize: '13px', color: '#666' }}>
          <strong>Contact:</strong> KATERN | Brabançonnestraat 73 | <a href="mailto:info@katern.be" style={{ color: '#0066cc' }}>info@katern.be</a>
        </p>

        <p style={{ marginTop: '16px', fontSize: '13px', fontStyle: 'italic' }}>
          Door verder te gaan, ga je akkoord met het gebruik van localStorage voor het opslaan
          van je inloggegevens en voortgang, en met de verwerking van je gegevens zoals
          beschreven in deze kennisgeving.
        </p>
      </div>

      <button onClick={handleAccept} className="btn btn-primary" style={{ marginTop: '16px', width: '100%' }}>
        Akkoord
      </button>
    </div>
  )
}
