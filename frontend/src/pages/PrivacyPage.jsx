import { useNavigate } from 'react-router-dom'

export default function PrivacyPage() {
  const navigate = useNavigate()

  return (
    <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <header className="exercise-header">
        <div className="header-title">Octovoc - Privacyverklaring</div>
        <button onClick={() => navigate('/')} className="btn">
          Terug naar home
        </button>
      </header>

      <div style={{
        backgroundColor: 'white',
        padding: '32px',
        borderRadius: '8px',
        marginTop: '24px',
        lineHeight: '1.8',
        fontSize: '16px'
      }}>
        <h1 style={{ marginTop: 0 }}>Privacyverklaring</h1>

        <p style={{ fontSize: '14px', color: '#666' }}>
          Laatst bijgewerkt: {new Date().toLocaleDateString('nl-BE', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <h2>1. Wie zijn wij?</h2>
        <p>
          Octovoc is een educatief platform voor het leren van vocabulaire, ontwikkeld door:
        </p>
        <p style={{ marginLeft: '20px' }}>
          <strong>KATERN</strong><br />
          Brabançonnestraat 73<br />
          E-mail: <a href="mailto:info@katern.be">info@katern.be</a>
        </p>

        <h2>2. Welke gegevens verwerken wij?</h2>
        <p>
          Wanneer je een account aanmaakt op Octovoc, verwerken wij de volgende persoonsgegevens:
        </p>
        <ul>
          <li><strong>E-mailadres:</strong> Om je account te identificeren en om in te kunnen loggen</li>
          <li><strong>Wachtwoord:</strong> Versleuteld opgeslagen om toegang tot je account te beveiligen</li>
          <li><strong>Leervoortgang:</strong> Informatie over welke modules je hebt gestart, je scores, moeilijke woorden, en voltooiingspercentages</li>
          <li><strong>Klascode (optioneel):</strong> Als je deel uitmaakt van een klas, wordt je gekoppeld aan die klas</li>
        </ul>

        <h2>3. Waarom verwerken wij deze gegevens?</h2>
        <p>
          Wij verwerken je persoonsgegevens voor de volgende doeleinden:
        </p>
        <ul>
          <li>Om je te laten inloggen op het platform</li>
          <li>Om je leervoortgang bij te houden en gepersonaliseerde oefeningen aan te bieden</li>
          <li>Om leraren inzicht te geven in de voortgang van hun leerlingen (alleen als je via een klascode bent aangemeld)</li>
          <li>Om inactieve accounts na 24 maanden automatisch te verwijderen</li>
        </ul>

        <h2>4. Cookies en lokale opslag</h2>
        <p>
          <strong>Octovoc gebruikt geen cookies.</strong> In plaats daarvan maken wij gebruik van <em>localStorage</em>,
          een technologie die informatie lokaal in je browser opslaat.
        </p>
        <p>
          In localStorage bewaren wij:
        </p>
        <ul>
          <li>Je inlogtoken (om ingelogd te blijven)</li>
          <li>Basisinformatie over je account (e-mail, rol, klasnaam)</li>
          <li>Je acceptatie van deze privacyverklaring</li>
        </ul>
        <p>
          Deze informatie blijft op je eigen apparaat en wordt niet gedeeld met derden.
        </p>

        <h2>5. Beveiliging</h2>
        <p>
          Wij nemen de beveiliging van je gegevens serieus:
        </p>
        <ul>
          <li>Alle communicatie tussen je browser en onze server verloopt via HTTPS (versleuteld)</li>
          <li>Wachtwoorden worden nooit in leesbare vorm opgeslagen, maar versleuteld met moderne encryptie (bcrypt)</li>
          <li>Toegang tot de database is strikt beveiligd en beperkt</li>
        </ul>

        <h2>6. Delen van gegevens</h2>
        <p>
          <strong>Wij delen je gegevens niet met derden.</strong> Octovoc is een educatief platform zonder
          commerciële doeleinden. De enige personen die toegang hebben tot je gegevens zijn:
        </p>
        <ul>
          <li>Jijzelf (via je account)</li>
          <li>Je leraar (als je via een klascode bent aangemeld) - alleen om je voortgang te kunnen volgen</li>
          <li>Beheerders van het platform (enkel voor technisch onderhoud)</li>
        </ul>

        <h2>7. Bewaartermijn</h2>
        <p>
          Wij bewaren je gegevens zolang je account actief is. <strong>Accounts die 24 maanden niet worden gebruikt,
          worden automatisch verwijderd.</strong> Je ontvangt hier geen voorafgaande herinnering voor.
        </p>
        <p>
          Je kan op elk moment je account laten verwijderen door contact met ons op te nemen.
        </p>

        <h2>8. Je rechten</h2>
        <p>
          Je hebt de volgende rechten met betrekking tot je persoonsgegevens:
        </p>
        <ul>
          <li><strong>Recht op inzage:</strong> Je kan opvragen welke gegevens wij van jou verwerken</li>
          <li><strong>Recht op correctie:</strong> Je kan onjuiste gegevens laten corrigeren</li>
          <li><strong>Recht op verwijdering:</strong> Je kan je account en alle bijbehorende gegevens laten verwijderen</li>
          <li><strong>Recht op dataportabiliteit:</strong> Je kan een kopie van je gegevens opvragen</li>
          <li><strong>Recht van bezwaar:</strong> Je kan bezwaar maken tegen de verwerking van je gegevens</li>
        </ul>
        <p>
          Om gebruik te maken van deze rechten, neem contact met ons op via <a href="mailto:info@katern.be">info@katern.be</a>.
        </p>

        <h2>9. Wijzigingen in deze privacyverklaring</h2>
        <p>
          Wij kunnen deze privacyverklaring van tijd tot tijd aanpassen. Eventuele wijzigingen worden op deze pagina
          gepubliceerd. Wij raden je aan deze privacyverklaring regelmatig te raadplegen.
        </p>

        <h2>10. Klachten</h2>
        <p>
          Als je niet tevreden bent over hoe wij met je gegevens omgaan, kan je contact met ons opnemen.
          Je hebt ook het recht om een klacht in te dienen bij de Belgische Gegevensbeschermingsautoriteit:
        </p>
        <p style={{ marginLeft: '20px' }}>
          Gegevensbeschermingsautoriteit<br />
          Drukpersstraat 35, 1000 Brussel<br />
          Tel: +32 (0)2 274 48 00<br />
          E-mail: contact@apd-gba.be<br />
          Website: <a href="https://www.gegevensbeschermingsautoriteit.be" target="_blank" rel="noopener noreferrer">www.gegevensbeschermingsautoriteit.be</a>
        </p>

        <h2>11. Contact</h2>
        <p>
          Voor vragen over deze privacyverklaring of over de verwerking van je persoonsgegevens, kan je contact met ons opnemen:
        </p>
        <p style={{ marginLeft: '20px' }}>
          <strong>KATERN</strong><br />
          Brabançonnestraat 73<br />
          E-mail: <a href="mailto:info@katern.be">info@katern.be</a>
        </p>

        <div style={{ marginTop: '48px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
            Deze privacyverklaring is opgesteld in overeenstemming met de Algemene Verordening Gegevensbescherming (AVG)
            en de Belgische wetgeving inzake gegevensbescherming.
          </p>
        </div>
      </div>
    </div>
  )
}
