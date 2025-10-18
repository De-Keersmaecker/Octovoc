import { useNavigate } from 'react-router-dom'
import './LoginPage.css'

export default function PrivacyPage() {
  const navigate = useNavigate()

  return (
    <main className="stage" aria-label="octovoc privacy" style={{ minHeight: '100vh' }}>
      <section className="inner" style={{ maxWidth: '800px', paddingBlock: '60px' }}>
        <h1 className="title">Octovoc</h1>

        <div className="underline" aria-hidden="true"></div>

        <div style={{
          fontFamily: '"Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif',
          fontSize: 'clamp(13px, 1.1vw, 15px)',
          lineHeight: '1.8',
          letterSpacing: '0.02em',
          color: '#fff',
          marginTop: '30px',
          textAlign: 'left'
        }}>
          <p style={{ marginTop: 0, marginBottom: '30px', fontSize: 'clamp(15px, 1.3vw, 17px)' }}>
            <strong>privacyverklaring</strong>
          </p>

          <p>
            <strong>1. wie zijn wij?</strong> Octovoc is een educatief platform voor het leren van vocabulaire, ontwikkeld door KATERN, Brabançonnestraat 73, e-mail: info@katern.be.
          </p>

          <p>
            <strong>2. welke gegevens verwerken wij?</strong> Wanneer je een account aanmaakt op Octovoc, verwerken wij je e-mailadres (om je account te identificeren en om in te kunnen loggen), je wachtwoord (versleuteld opgeslagen om toegang tot je account te beveiligen), je leervoortgang (informatie over welke modules je hebt gestart, je scores, moeilijke woorden, en voltooiingspercentages), en optioneel je klascode (als je deel uitmaakt van een klas, wordt je gekoppeld aan die klas).
          </p>

          <p>
            <strong>3. waarom verwerken wij deze gegevens?</strong> Wij verwerken je persoonsgegevens om je te laten inloggen op het platform, om je leervoortgang bij te houden en gepersonaliseerde oefeningen aan te bieden, om leraren inzicht te geven in de voortgang van hun leerlingen (alleen als je via een klascode bent aangemeld), en om inactieve accounts na 24 maanden automatisch te verwijderen.
          </p>

          <p>
            <strong>4. cookies en lokale opslag.</strong> Octovoc gebruikt geen cookies. In plaats daarvan maken wij gebruik van localStorage, een technologie die informatie lokaal in je browser opslaat. In localStorage bewaren wij je inlogtoken (om ingelogd te blijven), basisinformatie over je account (e-mail, rol, klasnaam), en je acceptatie van deze privacyverklaring. Deze informatie blijft op je eigen apparaat en wordt niet gedeeld met derden.
          </p>

          <p>
            <strong>5. beveiliging.</strong> Wij nemen de beveiliging van je gegevens serieus. Alle communicatie tussen je browser en onze server verloopt via HTTPS (versleuteld). Wachtwoorden worden nooit in leesbare vorm opgeslagen, maar versleuteld met moderne encryptie (bcrypt). Toegang tot de database is strikt beveiligd en beperkt.
          </p>

          <p>
            <strong>6. delen van gegevens.</strong> Wij delen je gegevens niet met derden. De enige personen die toegang hebben tot je gegevens zijn jijzelf (via je account), je leraar (als je via een klascode bent aangemeld, alleen om je voortgang te kunnen volgen), en beheerders van het platform (enkel voor technisch onderhoud).
          </p>

          <p>
            <strong>7. bewaartermijn.</strong> Wij bewaren je gegevens zolang je account actief is. Accounts die 24 maanden niet worden gebruikt, worden automatisch verwijderd. Je ontvangt hier geen voorafgaande herinnering voor. Je kan op elk moment je account laten verwijderen door contact met ons op te nemen.
          </p>

          <p>
            <strong>8. je rechten.</strong> Je hebt recht op inzage (je kan opvragen welke gegevens wij van jou verwerken), recht op correctie (je kan onjuiste gegevens laten corrigeren), recht op verwijdering (je kan je account en alle bijbehorende gegevens laten verwijderen), recht op dataportabiliteit (je kan een kopie van je gegevens opvragen), en recht van bezwaar (je kan bezwaar maken tegen de verwerking van je gegevens). Om gebruik te maken van deze rechten, neem contact met ons op via info@katern.be.
          </p>

          <p>
            <strong>9. wijzigingen in deze privacyverklaring.</strong> Wij kunnen deze privacyverklaring van tijd tot tijd aanpassen. Eventuele wijzigingen worden op deze pagina gepubliceerd. Wij raden je aan deze privacyverklaring regelmatig te raadplegen.
          </p>

          <p>
            <strong>10. klachten.</strong> Als je niet tevreden bent over hoe wij met je gegevens omgaan, kan je contact met ons opnemen. Je hebt ook het recht om een klacht in te dienen bij de Belgische Gegevensbeschermingsautoriteit: Drukpersstraat 35, 1000 Brussel, tel: +32 (0)2 274 48 00, e-mail: contact@apd-gba.be, website: www.gegevensbeschermingsautoriteit.be.
          </p>

          <p style={{ marginBottom: '30px' }}>
            <strong>11. contact.</strong> Voor vragen over deze privacyverklaring of over de verwerking van je persoonsgegevens, kan je contact met ons opnemen: KATERN, Brabançonnestraat 73, e-mail: info@katern.be.
          </p>
        </div>

        <button onClick={() => navigate('/')} className="btn back-btn">
          ← terug
        </button>
      </section>
    </main>
  )
}
