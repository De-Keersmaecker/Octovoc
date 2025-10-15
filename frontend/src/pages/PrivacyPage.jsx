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
        fontSize: '15px'
      }}>
        <p style={{ marginTop: 0, marginBottom: '8px' }}>
          <strong style={{ fontSize: '18px' }}>Privacyverklaring</strong>
        </p>

        <p style={{ fontSize: '13px', color: '#666', marginBottom: '24px' }}>
          Laatst bijgewerkt: {new Date().toLocaleDateString('nl-BE', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <p>
          <strong>1. Wie zijn wij?</strong> Octovoc is een educatief platform voor het leren van vocabulaire, ontwikkeld door KATERN, Brabançonnestraat 73, e-mail: info@katern.be.
        </p>

        <p>
          <strong>2. Welke gegevens verwerken wij?</strong> Wanneer je een account aanmaakt op Octovoc, verwerken wij je e-mailadres (om je account te identificeren en om in te kunnen loggen), je wachtwoord (versleuteld opgeslagen om toegang tot je account te beveiligen), je leervoortgang (informatie over welke modules je hebt gestart, je scores, moeilijke woorden, en voltooiingspercentages), en optioneel je klascode (als je deel uitmaakt van een klas, wordt je gekoppeld aan die klas).
        </p>

        <p>
          <strong>3. Waarom verwerken wij deze gegevens?</strong> Wij verwerken je persoonsgegevens om je te laten inloggen op het platform, om je leervoortgang bij te houden en gepersonaliseerde oefeningen aan te bieden, om leraren inzicht te geven in de voortgang van hun leerlingen (alleen als je via een klascode bent aangemeld), en om inactieve accounts na 24 maanden automatisch te verwijderen.
        </p>

        <p>
          <strong>4. Cookies en lokale opslag.</strong> Octovoc gebruikt geen cookies. In plaats daarvan maken wij gebruik van localStorage, een technologie die informatie lokaal in je browser opslaat. In localStorage bewaren wij je inlogtoken (om ingelogd te blijven), basisinformatie over je account (e-mail, rol, klasnaam), en je acceptatie van deze privacyverklaring. Deze informatie blijft op je eigen apparaat en wordt niet gedeeld met derden.
        </p>

        <p>
          <strong>5. Beveiliging.</strong> Wij nemen de beveiliging van je gegevens serieus. Alle communicatie tussen je browser en onze server verloopt via HTTPS (versleuteld). Wachtwoorden worden nooit in leesbare vorm opgeslagen, maar versleuteld met moderne encryptie (bcrypt). Toegang tot de database is strikt beveiligd en beperkt.
        </p>

        <p>
          <strong>6. Delen van gegevens.</strong> Wij delen je gegevens niet met derden. Octovoc is een educatief platform zonder commerciële doeleinden. De enige personen die toegang hebben tot je gegevens zijn jijzelf (via je account), je leraar (als je via een klascode bent aangemeld, alleen om je voortgang te kunnen volgen), en beheerders van het platform (enkel voor technisch onderhoud).
        </p>

        <p>
          <strong>7. Bewaartermijn.</strong> Wij bewaren je gegevens zolang je account actief is. Accounts die 24 maanden niet worden gebruikt, worden automatisch verwijderd. Je ontvangt hier geen voorafgaande herinnering voor. Je kan op elk moment je account laten verwijderen door contact met ons op te nemen.
        </p>

        <p>
          <strong>8. Je rechten.</strong> Je hebt recht op inzage (je kan opvragen welke gegevens wij van jou verwerken), recht op correctie (je kan onjuiste gegevens laten corrigeren), recht op verwijdering (je kan je account en alle bijbehorende gegevens laten verwijderen), recht op dataportabiliteit (je kan een kopie van je gegevens opvragen), en recht van bezwaar (je kan bezwaar maken tegen de verwerking van je gegevens). Om gebruik te maken van deze rechten, neem contact met ons op via info@katern.be.
        </p>

        <p>
          <strong>9. Wijzigingen in deze privacyverklaring.</strong> Wij kunnen deze privacyverklaring van tijd tot tijd aanpassen. Eventuele wijzigingen worden op deze pagina gepubliceerd. Wij raden je aan deze privacyverklaring regelmatig te raadplegen.
        </p>

        <p>
          <strong>10. Klachten.</strong> Als je niet tevreden bent over hoe wij met je gegevens omgaan, kan je contact met ons opnemen. Je hebt ook het recht om een klacht in te dienen bij de Belgische Gegevensbeschermingsautoriteit: Drukpersstraat 35, 1000 Brussel, tel: +32 (0)2 274 48 00, e-mail: contact@apd-gba.be, website: www.gegevensbeschermingsautoriteit.be.
        </p>

        <p>
          <strong>11. Contact.</strong> Voor vragen over deze privacyverklaring of over de verwerking van je persoonsgegevens, kan je contact met ons opnemen: KATERN, Brabançonnestraat 73, e-mail: info@katern.be.
        </p>

        <p style={{ marginTop: '32px', fontSize: '13px', color: '#666' }}>
          Deze privacyverklaring is opgesteld in overeenstemming met de Algemene Verordening Gegevensbescherming (AVG) en de Belgische wetgeving inzake gegevensbescherming.
        </p>
      </div>
    </div>
  )
}
