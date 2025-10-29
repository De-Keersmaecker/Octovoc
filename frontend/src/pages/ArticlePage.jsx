import { useNavigate } from 'react-router-dom'
import './LoginPage.css'

export default function ArticlePage() {
  const navigate = useNavigate()

  return (
    <main className="stage" aria-label="octovoc methodologie" style={{ minHeight: '100vh' }}>
      <section className="inner" style={{ maxWidth: '1050px', width: '70vw', paddingBlock: '60px' }}>
        <h1 className="title" style={{ marginBottom: '5px' }}>Octovoc</h1>
        <p style={{
          fontFamily: '"Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif',
          fontSize: 'clamp(15px, 1.3vw, 17px)',
          marginTop: '0px',
          marginBottom: '15px',
          textAlign: 'center',
          letterSpacing: '0.02em'
        }}>
          <strong>wetenschappelijke basis</strong>
        </p>

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

          <h2 style={{
            fontFamily: 'Perpetua, Georgia, "Times New Roman", Times, serif',
            fontSize: 'clamp(20px, 2vw, 28px)',
            fontWeight: 400,
            marginTop: '40px',
            marginBottom: '20px'
          }}>
            De dagelijkse drempel
          </h2>

          <p style={{ marginBottom: '20px' }}>
            Als leerkracht ervaar je wellicht dat leerlingen steeds vaker vastlopen op het begrijpen van alledaagse handboekteksten, niet omdat het onderwerp te complex is, maar omdat de taal een barrière vormt. Woorden als 'analyseren', 'essentieel' of 'enigszins' vormen dagelijkse drempels op weg naar schoolsucces. Een stabiele basiswoordenschat in het Nederlands is de sleutel tot diepgaand leren en maatschappelijke participatie, maar de weg daarnaartoe is in het Vlaamse onderwijs soms onduidelijk.
          </p>

          <p style={{ marginBottom: '20px' }}>
            De grondwettelijke 'vrijheid van onderwijs' geeft scholen en koepels de autonomie om de door de overheid breed geformuleerde eindtermen zelf te vertalen naar concrete leerplannen. Dit garandeert didactische diversiteit, maar leidt in de praktijk tot een gebrek aan stabiele houvast: leerplannen stellen groei in taalvaardigheid als doel voorop, maar vermelden nergens het aantal teksten dat daartoe moet worden geschreven of gelezen; leerplannen vermelden woordenschatuitbreiding als essentieel middel voor taalvaardigheid, maar leggen geen lijsten op.
          </p>

          <p style={{ marginBottom: '20px' }}>
            Een mooi initiatief zoals de rijke en populaire Orient-app van UCLL, die laatstejaarsleerlingen voorbereidt op de taaleisen van de universiteit of hogeschool, is een waardevolle remediërende tool, maar signaleert ook een dieperliggend probleem: de basis wordt niet altijd voldoende gelegd in het secundair onderwijs.
          </p>

          <p style={{ marginBottom: '20px' }}>
            Er is nood aan slimme woordenschatuitbreiding doorheen het secundair onderwijs.
          </p>

          <h2 style={{
            fontFamily: 'Perpetua, Georgia, "Times New Roman", Times, serif',
            fontSize: 'clamp(20px, 2vw, 28px)',
            fontWeight: 400,
            marginTop: '40px',
            marginBottom: '20px'
          }}>
            Voorbij intuïtie: een slimme selectie van woorden
          </h2>

          <p style={{ marginBottom: '20px' }}>
            Een effectieve aanpak begint bij de selectie van de juiste woorden. Traditioneel was deze keuze vaak afhankelijk van de expertise en intuïtie van handboekauteurs of leerkrachten. Een nieuwe, voor de Octovoc-applicatie ontwikkelde methodologie brengt hier verandering in door deze keuze te baseren op de slimme combinatie van 3 databronnen: (1) de leeftijd waarop een woord gemiddeld wordt aangeleerd, (2) de frequentie waarmee het woord voorkomt in onze taal en (3) de abstractheidsgraad van het woord.
          </p>

          <p style={{ marginBottom: '20px' }}>
            De aanpak werkt als een reeks van 3 slimme filters die samen die woorden selecteren die het nuttigst zijn om te leren omdat de kans het grootst is dat ze nog niet gekend zijn (filter 1), de kans het grootst is dat de leerling ze zal tegenkomen in teksten (filter 2) en de kans het grootst is dat ze niet zomaar afleidbaar zijn uit de context (filter 3).
          </p>

          <p style={{ marginBottom: '20px' }}>
            Voor de eerste filter gebruiken we psycholinguïstische data over de Age of Acquisition (AoA) – de gemiddelde leeftijd waarop een woord wordt geleerd. Deze data, afkomstig uit een grootschalige studie bij 30.000 Nederlandse woorden, helpen ons te voorspellen welke woorden een leerling van een bepaalde leeftijd waarschijnlijk nog niet kent (Brysbaert et al., 2014).
          </p>

          <p style={{ marginBottom: '20px' }}>
            Vervolgens filteren we deze woorden op basis van hun frequentie in de taal. Daarvoor worden corpuslinguïstische frequentielijsten gehanteerd zoals het Corpus Hedendaags Nederlands (Instituut voor de Nederlandse Taal) en SUBTLEX-NL (Keuleers, Brysbaert, & New, 2010). Een hoge frequentie suggereert dat een leerling het woord vaak zal tegenkomen, wat de investering in het leren ervan rendabel maakt.
          </p>

          <p style={{ marginBottom: '20px' }}>
            De grootste uitdaging voor tekstbegrip op school ligt niet bij concrete woorden zoals 'maquette', 'aula' of 'thuisbatterij'. Deze woorden worden vaak vanzelf opgepikt uit de context. De echte struikelblokken zijn de abstracte woorden die concepten en relaties beschrijven, zoals 'principe', 'analyse' of 'relatief'. Door te filteren op een hogere abstractiegraad, op basis van data uit dezelfde studie van Brysbaert et al. (2014), spitsen we de woordenlijsten toe op de woordenschat waar expliciete instructie de grootste meerwaarde biedt.
          </p>

          <p style={{ marginBottom: '20px' }}>
            Vervolgens wordt de geselecteerde woordenschat gestructureerd om de cognitieve verwerking te optimaliseren. Het menselijk brein slaat informatie efficiënter op wanneer deze georganiseerd is in een logisch netwerk, het zogenaamde mentale lexicon (Aitchison, 2012). Daarom worden de woorden met behulp van artificiële intelligentie (AI) geordend in semantische velden – clusters van thematisch verwante woorden. Per onderwijsniveau wordt een lijst van 500 tot 800 woorden geselecteerd, een volume dat ambitieus maar haalbaar is binnen een schooljaar.
          </p>

          <p style={{ marginBottom: '20px' }}>
            Het resultaat zijn woordenlijsten die niet gebaseerd zijn op intuïtie, maar op een combinatie van data die de kans maximaliseren dat het aanleren van de geselecteerde woorden nuttig en nodig is.
          </p>

          <p style={{ marginBottom: '20px' }}>
            Ook voor het genereren van de zinnen werd gebruikgemaakt van AI. Daarbij werd aan de AI gevraagd om voorbeeldzinnen te formuleren waarbij de betekenis van het woord te achterhalen is vanuit de context. Tegelijk bleek de 'human in the loop' nog altijd belangrijk en werden voorbeeldzinnen soms nog aangepast. Er werd daarbij dus niet gekozen voor reële voorbeeldzinnen, maar wel voor zinnen die een didactisch doel dienen: de leerlingen al enigszins intuïtief naar de betekenis toeleiden.
          </p>

          <h2 style={{
            fontFamily: 'Perpetua, Georgia, "Times New Roman", Times, serif',
            fontSize: 'clamp(20px, 2vw, 28px)',
            fontWeight: 400,
            marginTop: '40px',
            marginBottom: '20px'
          }}>
            Leren dat blijft hangen: retrieval en spacing
          </h2>

          <p style={{ marginBottom: '20px' }}>
            Een doordachte woordenlijst is slechts het begin. Om ervoor te zorgen dat de expliciete instructie ook zorgt voor een grotere kans op begrip wanneer het woord later effectief opduikt, steunt Octovoc op 3 bewezen principes uit de cognitieve wetenschap: retrieval practice, desirable difficulty en spacing.
          </p>

          <p style={{ marginBottom: '20px' }}>
            Belangrijk is dat de leerlingen actief aan de slag gaan. Passief woorden en definities lezen en herlezen is inefficiënt. De methodologie gebruikt daarom een drietrapsraket die de cognitieve inspanning systematisch opvoert en steunt op het 'zich herinneren' om zo de synaptische verbinding te verstevigen, een principe dat bekendstaat als retrieval practice (het testeffect) of zoals men in het basisonderwijs vaak zegt: "paadjes trekken".
          </p>

          <p style={{ marginBottom: '20px', paddingLeft: '20px' }}>
            <strong>Fase 1: Herkenning.</strong> De leerling ziet een nieuw woord in een zin en kiest de juiste betekenis uit vijf opties. Dit is een actieve, maar laagdrempelige eerste kennismaking.
          </p>

          <p style={{ marginBottom: '20px', paddingLeft: '20px' }}>
            <strong>Fase 2: Actieve herinnering.</strong> Dezelfde zin verschijnt, maar nu is het doelwoord weggelaten. De leerling moet het juiste woord selecteren. De moeilijkheidsgraad stijgt van passief herkennen naar actief herinneren.
          </p>

          <p style={{ marginBottom: '20px', paddingLeft: '20px' }}>
            <strong>Fase 3: Vrije productie.</strong> De leerling moet het woord zelfstandig en correct intypen in de zin, zonder hulp. Dit vereist de hoogste cognitieve inspanning omdat hier het woord opgeroepen moet worden.
          </p>

          <p style={{ marginBottom: '20px' }}>
            Onderzoek toont aan dat deze actieve vorm van informatie ophalen uit het geheugen leidt tot veel duurzamer leren dan passief lezen en herlezen (Roediger & Butler, 2011; Karpicke & Blunt, 2011).
          </p>

          <p style={{ marginBottom: '20px' }}>
            Leren is daarbij het meest effectief wanneer het moeite kost, maar niet zoveel dat het tot frustratie leidt. Dit principe heet desirable difficulty (wenselijke moeilijkheid) (Bjork & Bjork, 2020). De drieledige opbouw is een perfect voorbeeld: elke fase verhoogt de uitdaging op een behapbare manier. Daarbij wordt gewerkt met batterijen van telkens 5 woorden wat binnen het kortetermijngeheugen een haalbaar aantal is.
          </p>

          <p style={{ marginBottom: '20px' }}>
            Centraal staat natuurlijk ook het verlangen om ervoor te zorgen dat zoveel mogelijk woorden ook op langere termijn verankerd blijven. Ons brein vergeet informatie volgens een voorspelbare curve. De meest effectieve manier om deze curve te doorbreken is door informatie te herhalen op het moment dat we die bijna vergeten zijn. Dit heet het spacing effect (gespreide herhaling). Woorden die in de moeilijkste fase fout worden beantwoord, worden eerst onmiddellijk opnieuw aangeboden, maar komen ook in een aparte pool terecht waarmee ze later moeten worden herhaald. En ook bij die herhaling blijven de niet herinnerde vormen terugkeren. Deze gespreide herhaling focust op de retentie van de voor de leerling uitdagendste vormen om de aanpak binnen het tijdsbestek haalbaar te houden. De methodische inzet op spacing (waarbij onmiddellijk naar fase 3 gegaan wordt, zonder de woorden eerst terug in het kortetermijngeheugen te plaatsen) is significant effectiever voor langetermijnretentie dan het onmiddellijk opnieuw oefenen (Goossens et al., 2012).
          </p>

          <p style={{ marginBottom: '20px' }}>
            Tot slot: expliciete woordenschattraining kan en mag natuurlijk nooit een vervanging zijn voor een rijke, talige omgeving waarin leerlingen veelvuldig in aanraking komen met complexe en authentieke teksten. Impliciete woordenschatverwerving door middel van lezen, zoals gestimuleerd door initiatieven als Rijketeksten.org, blijft de hoeksteen van een diepgaande en flexibele taalbeheersing. Maar expliciete woordenschattraining is een waardevol complement op een curriculum dat rijk lezen centraal stelt. Het functioneert als een precisie-instrument: een gerichte interventie om de kennis van cruciale, hoogfrequente en voor de leeftijd uitdagende woorden te versnellen.
          </p>

          <p style={{ marginBottom: '20px' }}>
            De feedback van leerlingen in de eerste testfases is alvast veelbelovend: zij omschrijven het oefenen als 'leerrijk', 'nuttig' en zelfs 'rustgevend', wat suggereert dat een dergelijke gestructureerde aanpak motiverend kan werken. Expliciete woordenschattraining in het Nederlands op basis van slim geselecteerde woorden kan zo een krachtige pijler zijn van de lessen Nederlands, en ook een taalbeleid dat op zoek is naar makkelijk implementeerbare, effectieve acties met meetbaar resultaat.
          </p>

          <h2 style={{
            fontFamily: 'Perpetua, Georgia, "Times New Roman", Times, serif',
            fontSize: 'clamp(18px, 1.8vw, 24px)',
            fontWeight: 400,
            marginTop: '40px',
            marginBottom: '15px'
          }}>
            Bibliografie
          </h2>

          <div style={{ fontSize: 'clamp(12px, 1vw, 14px)', lineHeight: '1.8', marginBottom: '40px' }}>
            <p style={{ marginBottom: '12px' }}>
              Aitchison, J. (2012). <em>Words in the mind: An introduction to the mental lexicon</em> (4th ed.). John Wiley & Sons.
            </p>
            <p style={{ marginBottom: '12px' }}>
              Bjork, R. A., & Bjork, E. L. (2020). Desirable difficulties in theory and practice. <em>Journal of Applied Research in Memory and Cognition, 9</em>(4), 475-479. <a href="https://doi.org/10.1016/j.jarmac.2020.09.004" style={{ color: '#fff', textDecoration: 'underline' }}>https://doi.org/10.1016/j.jarmac.2020.09.004</a>
            </p>
            <p style={{ marginBottom: '12px' }}>
              Brysbaert, M., Stevens, M., De Deyne, S., Voorspoels, W., & Storms, G. (2014). Norms of age of acquisition and concreteness for 30,000 Dutch words. <em>Acta Psychologica, 150</em>, 80-84. <a href="https://doi.org/10.1016/j.actpsy.2014.04.010" style={{ color: '#fff', textDecoration: 'underline' }}>https://doi.org/10.1016/j.actpsy.2014.04.010</a>
            </p>
            <p style={{ marginBottom: '12px' }}>
              Goossens, N., Camp, G., Verkoeijen, P., Tabbers, H., & Zwaan, R. (2012). Spreading the words: A spacing effect in vocabulary learning. <em>Journal of Cognitive Psychology, 24</em>(8), 965-971. <a href="https://research.ou.nl/ws/portalfiles/portal/1015431/Goossens%20et%20al.%202012%20JCP.pdf" style={{ color: '#fff', textDecoration: 'underline' }}>https://research.ou.nl/ws/portalfiles/portal/1015431/Goossens%20et%20al.%202012%20JCP.pdf</a>
            </p>
            <p style={{ marginBottom: '12px' }}>
              Instituut voor de Nederlandse Taal. (z.d.). <em>Corpus Hedendaags Nederlands (CHN)</em>
            </p>
            <p style={{ marginBottom: '12px' }}>
              Karpicke, J. D., & Blunt, J. R. (2011). Retrieval practice produces more learning than elaborative studying with concept mapping. <em>Science, 331</em>(6018), 772–775. <a href="https://doi.org/10.1126/science.1199327" style={{ color: '#fff', textDecoration: 'underline' }}>https://doi.org/10.1126/science.1199327</a>
            </p>
            <p style={{ marginBottom: '12px' }}>
              Keuleers, E., Brysbaert, M., & New, B. (2010). SUBTLEX-NL: A new frequency measure for Dutch words based on film subtitles. <em>Behavior Research Methods, 42</em>(3), 643–650. <a href="https://doi.org/10.3758/BRM.42.3.643" style={{ color: '#fff', textDecoration: 'underline' }}>https://doi.org/10.3758/BRM.42.3.643</a>
            </p>
            <p style={{ marginBottom: '12px' }}>
              Roediger III, H. L., & Butler, A. C. (2011). The critical role of retrieval practice in long-term retention. <em>Trends in Cognitive Sciences, 15</em>(1), 20-27.
            </p>
          </div>
        </div>

        <button onClick={() => navigate(-1)} className="btn back-btn">
          ← terug
        </button>
      </section>
    </main>
  )
}
