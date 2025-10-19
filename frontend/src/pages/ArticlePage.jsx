import { useNavigate } from 'react-router-dom'
import './LoginPage.css'

export default function ArticlePage() {
  const navigate = useNavigate()

  return (
    <main className="stage" aria-label="octovoc methodologie" style={{ minHeight: '100vh' }}>
      <section className="inner" style={{ maxWidth: '900px', paddingBlock: '60px' }}>
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
            <strong>slimme woordselectie, slimme didactiek</strong>
          </p>

          <h2 style={{
            fontFamily: 'Perpetua, Georgia, "Times New Roman", Times, serif',
            fontSize: 'clamp(20px, 2vw, 28px)',
            fontWeight: 400,
            marginTop: '40px',
            marginBottom: '20px'
          }}>
            A. De nood aan een slimme woordenlijst en duidelijke didactiek
          </h2>

          <p>
            Het woordenschatonderwijs in Vlaanderen en Nederland mist een doordachte aanpak.
          </p>

          <p>
            In Vlaanderen is het onderwijs zo ingericht dat de door de overheid opgelegde doelstellingen heel breed geformuleerd worden en heel weinig concrete doelen inhouden: lezen en schrijven staan centraal volgens het leerplan, maar hoeveel teksten leerlingen dan moeten lezen of hoeveel teksten ze minimaal moeten schrijven, wordt zelfs niet gesuggereerd. Heel wat handboekreeksen die het leven van de leerkracht niet te complex willen maken, laten leerlingen in het totaal vaak slechts enkele alinea's schrijven en hooguit een korte tekst of twee schematiseren.
          </p>

          <p>
            In diezelfde leerplannen wordt ook het belang van een brede woordenschat en schooltaalwoorden aangestipt, maar er worden specifieke woorden of woordenlijsten als standaard benoemd. Ook door de overheid gesubsidieerde partnerinstituten die rond taal werken of lerarenopleidingen ontplooiden in het verleden geen of weinig impactvolle initiatieven in die richting. De meeste ontwikkeling blijven anekdotisch of vooral gericht op het aanreiken van tekst zelf (rijketeksten.org). Orient, een app van de UCLL, mee ontwikkeld door Bruno Vandamme is een zeldzame en populaire uitzondering.
          </p>

          <p>
            Het onderwijsveld wacht al jaren op een slim samengestelde woordenlijst om de woordenschat van leerlingen systematisch uit te breiden. Tot nu toe was het samenstellen van dergelijke lijsten vaak nattevingerwerk, gebaseerd op de intuïtie van auteurs en lesgevers. Octovoc verenigt echter 3 wetenschappelijke datastromen om zo tot een slimme selectie te komen. Die doordachte selectie wordt vervolgens via de Octovoc-app in het brein verankerd met een didactische methode die retrieval practice met spacing combineert.
          </p>

          <p>
            Voor het uitwerken van de woordlijsten was de eerste stap het combineren van twee krachtige, maar voorheen mogelijk nooit in een productieve context gecombineerde, datasets. Enerzijds wordt gebruikgemaakt van psycholinguïstische data over de Age of Acquisition (AoA), ofwel de gemiddelde leeftijd waarop een woord wordt geleerd (Brysbaert et al., 2014). Dit maakt het mogelijk om woorden te identificeren die een leerling van een bepaalde leeftijd waarschijnlijk nog niet kent.
          </p>

          <p>
            Anderzijds worden corpuslinguïstische frequentielijsten gebruikt, die aangeven hoe vaak een woord in de Nederlandse taal voorkomt (zie bv. Hazenberg & Hulstijn, 1996). Een hoge frequentie is een indicator voor het nut van een woord; Omdat er sowieso te veel woorden te leren zijn is het rendabeler om een woord te leren dat je wellicht vaker zult tegenkomen.
          </p>

          <p>
            Door deze twee filters te combineren, ontstaat een unieke selectie: woorden met een hoge AoA (nog onbekend) én een hoge frequentie (zeer nuttig).
          </p>

          <p>
            Tegelijk leert een leerling concrete woorden als 'fiets' of 'tafel' vaak vanzelf via de context of een afbeelding. De echte uitdaging voor tekstbegrip op school ligt bij abstracte woorden zoals 'principe', 'analyse' of 'consequentie'. Deze woorden vereisen vaak expliciete instructie (Sadoski & Lawrence, 2023).
          </p>

          <p>
            Daarom werd een extra filter toegepast die vertrekt van de abstractiegraad van de woorden. De data hiervoor zijn afkomstig uit dezelfde grootschalige studie als de AoA-ratings (Brysbaert et al., 2014). Door te filteren op een hogere abstractiegraad, worden de lijsten verder toegespitst op de woorden waar het onderwijs de grootste meerwaarde kan bieden en waar de nood voor het begrijpen van complexe teksten het hoogst is.
          </p>

          <p>
            Een te lange, willekeurige lijst met woorden is cognitief inefficiënt. Daarom werd per niveau gekozen voor de 800 meest frequente woorden. Die afbakening is pittig, maar haalbaar op een schooljaar. De ervaring leert dat leerlingen voor het aanleren van nieuwe woorden met de gebruikte methode makkelijk 50 minuten geconcentreerd kunnen werken en ook gedreven zijn om de nieuwe woorden met deze laagdrempelige methode te leren.
          </p>

          <p>
            Het menselijk brein onthoudt nieuwe informatie beter wanneer deze georganiseerd is in een logisch netwerk van betekenissen, het zogenaamde mentale lexicon (Aitchison, 2012). De laatste stap was daarom het ordenen van de gefilterde woorden in semantische velden: clusters van woorden die thematisch bij elkaar horen, zoals 'rechtspraak' of 'emoties'.
          </p>

          <p>
            Om deze omvangrijke taak objectief en efficiënt uit te voeren, werd artificiële intelligentie (AI) ingezet. Door de analyse van de context waarin woorden in miljoenen teksten voorkomen, kan AI wiskundig bepalen welke woorden semantisch aan elkaar verwant zijn en deze automatisch groeperen. Deze door de computer gegenereerde clusters werden vervolgens nog menselijk uitgefilterd.
          </p>

          <p>
            Deze methodologie markeert dus een doorbraak in de ontwikkeling van een slimme woordenschatselectie door psycholinguïstische data (AoA, abstractiegraad) te verenigen met corpuslinguïstische data (frequentie) en deze te structureren met behulp van AI. Hierdoor ontstaan voor het eerst woordenlijsten die niet gebaseerd zijn op intuïtie, maar op een transparant en wetenschappelijk fundament.
          </p>

          <h2 style={{
            fontFamily: 'Perpetua, Georgia, "Times New Roman", Times, serif',
            fontSize: 'clamp(20px, 2vw, 28px)',
            fontWeight: 400,
            marginTop: '40px',
            marginBottom: '20px'
          }}>
            De didactiek
          </h2>

          <p>
            De app introduceert nieuwe woordenschat via een zorgvuldig gestructureerd, drieledig proces dat de gebruiker begeleidt van ontdekking naar beheersing. In de eerste fase wordt een nieuw woord gepresenteerd binnen een betekenisvolle contextzin. De gebruiker wordt hier niet verondersteld het woord al te kennen; in plaats daarvan wordt hij aangemoedigd om de betekenis af te leiden door beredeneerd te gokken uit een beperkte lijst van vijf mogelijke definities. Dit zorgt voor een laagdrempelige, maar cognitief actieve eerste kennismaking. Zodra de juiste betekenis is gekoppeld, vordert de gebruiker naar fase twee. Hier wordt dezelfde contextzin getoond, maar nu is het doelwoord weggelaten. De taak is om het juiste woord te selecteren uit de oorspronkelijke vijf woorden, wat de moeilijkheidsgraad verhoogt van herkenning naar actieve herinnering. De laatste fase vereist de hoogste cognitieve inspanning: de gebruiker moet het woord nu zelfstandig en correct intypen in de zin, zonder hulp van keuzemogelijkheden.
          </p>

          <p>
            Deze gefaseerde methodologie is diep geworteld in gevestigde cognitieve principes. De progressie van de drie fasen is een schoolvoorbeeld van retrieval practice (het ophaaleffect), waarbij de cognitieve inspanning systematisch wordt opgevoerd. Fase één (het kiezen van de betekenis) is een vorm van herkenning (recognition), terwijl fase twee en drie overgaan op steeds moeilijkere vormen van herinnering (recall) (Roediger & Butler, 2011). De laatste, generatieve fase, waarbij de gebruiker het woord zelf produceert, is bewezen het meest effectief voor het creëren van een duurzaam geheugenspoor (Karpicke & Blunt, 2011). Dit proces sluit ook aan bij Hebbiaans leren: door de connectie tussen een woord, zijn context en zijn betekenis herhaaldelijk en in toenemende intensiteit te activeren, worden de onderliggende neurale paden versterkt ("neurons that fire together, wire together") (Hebb, 1949). De oplopende moeilijkheidsgraad is bovendien een doelbewuste toepassing van desirable difficulty (wenselijke moeilijkheidsgraad), die diepere verwerking stimuleert en leidt tot robuustere kennis dan passieve herhaling (Bjork & Bjork, 2020).
          </p>

          <p>
            Ten slotte integreert de app een gepersonaliseerde vorm van het spacing effect (gespreide herhaling) via de "moeilijke woorden"-batterij. Woorden die in de meest uitdagende fase foutief worden beantwoord, worden hierin geplaatst om later opnieuw te worden aangeboden. Deze strategie zorgt ervoor dat de herhaling van de lastigste woorden gespreid wordt in de tijd, wat significant effectiever is voor langetermijnretentie dan het onmiddellijk opnieuw oefenen (Goossens et al., 2012). Door deze woorden op een later, optimaal moment opnieuw aan te bieden, wordt de vergeetcurve doorbroken precies op het punt dat de herinnering dreigt te vervagen, wat het geheugen versterkt (Cepeda et al., 2006). De voorwaarde dat een woord pas uit deze pool verdwijnt na een correcte eerste poging, garandeert dat het woord daadwerkelijk is verankerd en niet slechts tijdelijk is onthouden.
          </p>

          <h2 style={{
            fontFamily: 'Perpetua, Georgia, "Times New Roman", Times, serif',
            fontSize: 'clamp(18px, 1.8vw, 24px)',
            fontWeight: 400,
            marginTop: '40px',
            marginBottom: '15px'
          }}>
            Bibliografie woordenlijst
          </h2>

          <div style={{ fontSize: 'clamp(12px, 1vw, 14px)', lineHeight: '1.8' }}>
            <p style={{ marginBottom: '12px' }}>
              Aitchison, J. (2012). <em>Words in the mind: An introduction to the mental lexicon</em> (4th ed.). John Wiley & Sons.
            </p>
            <p style={{ marginBottom: '12px' }}>
              Brysbaert, M., Stevens, M., De Deyne, S., Voorspoels, W., & Storms, G. (2014). Norms of age of acquisition and concreteness for 30,000 Dutch words. <em>Acta Psychologica, 150</em>, 80-84.
            </p>
            <p style={{ marginBottom: '12px' }}>
              Garlock, V. M., Walley, A. C., & Metsala, J. L. (2001). Age-of-acquisition, word frequency, and neighborhood density effects on spoken word recognition by children and adults. <em>Journal of Memory and Language, 45</em>(3), 468-492.
            </p>
            <p style={{ marginBottom: '12px' }}>
              Hazenberg, S., & Hulstijn, J. H. (1996). Defining a minimal receptive second-language vocabulary for non-native university students: an empirical investigation. <em>Applied Linguistics, 17</em>(2), 145-163.
            </p>
            <p style={{ marginBottom: '12px' }}>
              Sadoski, M., & Lawrence, B. (2023). Abstract Vocabulary Development: Embodied Theory and Practice. <em>Educational Psychology Review</em>.
            </p>
          </div>

          <h2 style={{
            fontFamily: 'Perpetua, Georgia, "Times New Roman", Times, serif',
            fontSize: 'clamp(18px, 1.8vw, 24px)',
            fontWeight: 400,
            marginTop: '30px',
            marginBottom: '15px'
          }}>
            Bibliografie didactiek
          </h2>

          <div style={{ fontSize: 'clamp(12px, 1vw, 14px)', lineHeight: '1.8', marginBottom: '40px' }}>
            <p style={{ marginBottom: '12px' }}>
              Bjork, R. A., & Bjork, E. L. (2020). Desirable difficulties in theory and practice. <em>Journal of Applied Research in Memory and Cognition, 9</em>(4), 475-479.
            </p>
            <p style={{ marginBottom: '12px' }}>
              Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. <em>Psychological Bulletin, 132</em>(3), 354–380.
            </p>
            <p style={{ marginBottom: '12px' }}>
              Goossens, N., Camp, G., Verkoeijen, P., Tabbers, H., & Zwaan, R. (2012). Spreading the words: A spacing effect in vocabulary learning. <em>Journal of Cognitive Psychology, 24</em>(8), 965-971.
            </p>
            <p style={{ marginBottom: '12px' }}>
              Hebb, D. O. (1949). <em>The Organization of Behavior: A Neuropsychological Theory</em>. John Wiley & Sons.
            </p>
            <p style={{ marginBottom: '12px' }}>
              Karpicke, J. D., & Blunt, J. R. (2011). Retrieval practice produces more learning than elaborative studying with concept mapping. <em>Science, 331</em>(6018), 772–775.
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
