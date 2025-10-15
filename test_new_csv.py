#!/usr/bin/env python3
"""
Test the new CSV to identify issues
"""
import csv
import io

csv_data = """anticiperen;vooruitlopen op iets wat gaat gebeuren;De schaker wist te *anticiperen* op de zetten van zijn tegenstander en won zo de partij.
doorlichten;grondig onderzoeken;Een extern bureau werd ingehuurd om de financiële situatie van het bedrijf volledig te *doorlichten*.
inventariseren;een lijst maken van alle aanwezige zaken;We moeten de volledige voorraad in het magazijn *inventariseren* voor de jaarlijkse balans.
propageren;iets sterk aanprijzen en verspreiden;De politieke partij begon haar nieuwe ideeën actief te *propageren* via sociale media.
attenderen;iemands aandacht vestigen op iets;Ik wil u erop *attenderen* dat de deadline voor het project morgen verstrijkt.
suggereren;voorzichtig een voorstel doen;Mag ik *suggereren* dat we een korte pauze nemen voordat we verdergaan met de vergadering?
pretenderen;doen alsof;Hij probeerde te *pretenderen* dat hij alles wist, maar viel al snel door de mand.
distantiëren;afstand nemen van iets;De politicus probeerde zich te *distantiëren* van de extreme uitspraken van zijn partijgenoot.
claimen;opeisen;De gedupeerden besloten de schade te *claimen* bij de verantwoordelijke partij voor het ongeval.
engageren;zich inzetten voor;Ze besloot zich te *engageren* als vrijwilliger bij de lokale voedselbank voor de armen.
destabiliseren;uit evenwicht brengen;De plotselinge staatsgreep dreigde de hele regio te *destabiliseren* en tot oorlog te leiden.
infiltreren;heimelijk binnendringen;De undercoveragent moest *infiltreren* in de criminele bende om bewijs te verzamelen.
simuleren;doen alsof, nabootsen;Tijdens de training moesten de piloten een noodlanding *simuleren* in een geavanceerde vluchtsimulator.
degraderen;in rang verlagen;Na zijn grove fout werd de officier gestraft en moest hij *degraderen* tot een lagere rang.
escaleren;stapsgewijs ernstiger worden;Het kleine conflict dreigde te *escaleren* tot een grootschalige vechtpartij tussen de groepen.
provoceren;uitdagen, uitlokken;Hij probeerde de tegenstander te *provoceren* met beledigende opmerkingen tijdens de wedstrijd.
accommoderen;aanpassen, huisvesten;Het hotel kon de grote groep toeristen zonder problemen *accommoderen* in ruime kamers.
sensibiliseren;bewust maken van een probleem;De campagne moest de bevolking *sensibiliseren* voor de gevaren van rijden onder invloed.
bestendigen;laten voortduren;De dictator probeerde zijn macht te *bestendigen* door de oppositie hardhandig te onderdrukken.
faciliteren;vergemakkelijken;De overheid probeerde de oprichting van nieuwe bedrijven te *faciliteren* met subsidies.
cultiveren;ontwikkelen, beschaven;Hij probeerde zijn talenkennis te *cultiveren* door elke dag een buitenlandse krant te lezen.
innoveren;vernieuwen;Een bedrijf moet voortdurend *innoveren* om de concurrentie voor te kunnen blijven.
consolideren;vastzetten, versterken;Na de snelle groei moest het bedrijf zijn marktpositie *consolideren* om stabiel te blijven.
conformeren;zich aanpassen aan;Hij weigerde zich te *conformeren* aan de ongeschreven regels van de groep.
delegeren;taken overdragen aan iemand anders;Een goede manager moet kunnen *delegeren* en zijn medewerkers vertrouwen durven te geven.
continueren;voortzetten;Na de pauze besloten we de vergadering te *continueren* met het volgende agendapunt.
legitimeren;rechtvaardigen;De regering probeerde de militaire inval te *legitimeren* door te wijzen op het gevaar.
intensiveren;heviger maken;De politie besloot de zoektocht naar de vermiste persoon te *intensiveren* door meer middelen in te zetten.
initiëren;starten, het initiatief nemen;Zij besloot een project te *initiëren* om de buurt groener en leefbaarder te maken.
normaliseren;terugbrengen naar een normale toestand;Na de overstroming duurde het maanden om de situatie in het gebied te *normaliseren*.
genereren;voortbrengen, creëren;De zonnepanelen op het dak *genereren* genoeg elektriciteit voor het hele huishouden.
bekrachtigen;officieel bevestigen;De koning moet de nieuwe wet nog *bekrachtigen* met zijn handtekening.
opteren;een keuze maken voor;Gezien de omstandigheden besloot hij te *opteren* voor de veiligste oplossing.
honoreren;een verzoek inwilligen;De directie besloot het verzoek van het personeel om flexibele werkuren te *honoreren*.
profileren;zichzelf een bepaald imago aanmeten;De politicus probeerde zich te *profileren* als een man van het volk.
integreren;zich aanpassen en deel gaan uitmaken van;Het was voor hem moeilijk om te *integreren* in de nieuwe cultuur van het land.
fungeren;een bepaalde functie vervullen;Tijdens de afwezigheid van de directeur zal zijn adjunct *fungeren* als zijn vervanger.
ambiëren;iets nastreven;Zij is een zeer ambitieuze werknemer die de functie van manager duidelijk wil *ambiëren*.
kwalificeren;zich plaatsen voor;De atleet wist zich te *kwalificeren* voor de finale van de honderd meter sprint.
recreëren;ontspannen, vrijetijd besteden;In het park kun je wandelen, sporten en op verschillende manieren *recreëren*.
recupereren;herstellen;Na de zware operatie had hij enkele weken nodig om volledig te *recupereren*.
reduceren;verminderen;We moeten proberen ons energieverbruik te *reduceren* om het milieu te sparen.
refereren;verwijzen naar;In zijn toespraak zal hij *refereren* aan de resultaten van het recente onderzoek.
verkassen;verhuizen;Na jaren in de stad te hebben gewoond, besloot de familie te *verkassen* naar het platteland.
verloochenen;niet willen kennen, ontkennen;Hij besloot zijn afkomst niet te *verloochenen* en was trots op waar hij vandaan kwam.
vergewissen;zich ervan overtuigen;Voordat hij vertrok, wilde hij zich ervan *vergewissen* dat alle deuren goed gesloten waren.
verzuimen;nalaten, niet doen;Hij had verzuimd zijn facturen te betalen en kreeg een aanmaning.
stagnatie;stilstand;De economische *stagnatie* zorgde voor een hoge werkloosheid en weinig groei.
modificatie;aanpassing, wijziging;Na de testfase werd een kleine *modificatie* aan het ontwerp van het product gedaan.
convergentie;het naar elkaar toegroeien;De *convergentie* van de twee culturen leidde tot een unieke nieuwe samenleving.
consolidatie;versterking, vastzetten;Na de overname volgde een periode van *consolidatie* om het nieuwe bedrijf te stabiliseren.
adaptatie;aanpassing;De *adaptatie* aan het nieuwe klimaat was voor de planten en dieren een langzaam proces.
transitie;overgang;De *transitie* van fossiele brandstoffen naar duurzame energie is een grote maatschappelijke uitdaging.
progressie;vooruitgang;De patiënt boekte een duidelijke *progressie* in zijn herstel na de operatie.
expansie;uitbreiding;De *expansie* van het bedrijf naar Azië was een belangrijke stap in hun groeistrategie.
innovatie;vernieuwen;Constante *innovatie* is noodzakelijk voor een technologiebedrijf om te kunnen overleven in de markt.
regulering;het opstellen van regels;Strikte *regulering* is nodig om de veiligheid in de voedselindustrie te kunnen garanderen.
implementatie;invoering, tenuitvoerlegging;De *implementatie* van de nieuwe software op kantoor verliep niet zonder problemen.
reductie;vermindering;Door de uitverkoop kregen klanten een *reductie* van vijftig procent op alle artikelen.
revisie;herziening, grondige inspectie;De motor van de oude auto had een complete *revisie* nodig voordat hij weer kon rijden.
vereffening;afrekening, het afhandelen van financiële zaken;De *vereffening* van de erfenis duurde maanden vanwege de complexe financiële situatie.
transmissie;overbrenging;De *transmissie* van het virus gebeurt voornamelijk via kleine druppeltjes in de lucht."""

# Simulate the improved delimiter detection
csv_file = io.StringIO(csv_data)
sample = csv_data[:1024]

# Only allow common delimiters (comma, semicolon, tab, pipe)
valid_delimiters = [',', ';', '\t', '|']

try:
    detected = csv.Sniffer().sniff(sample, delimiters=',;\t|').delimiter
    print(f"✓ Sniffer detected: '{detected}'")
    if detected in valid_delimiters:
        delimiter = detected
        print(f"✓ Delimiter is valid")
    else:
        raise ValueError("Invalid delimiter detected")
except Exception as e:
    print(f"✗ Sniffer failed: {e}")
    if ';' in sample and sample.count(';') > sample.count(','):
        delimiter = ';'
        print(f"✓ Fallback to semicolon")
    else:
        delimiter = ','
        print(f"✓ Fallback to comma")

# Test parsing
csv_file.seek(0)
reader = csv.reader(csv_file, delimiter=delimiter)

print(f"\nUsing delimiter: '{delimiter}'")
print("\nChecking all rows...")
errors = []
total_rows = 0

for idx, row in enumerate(reader, start=1):
    total_rows += 1

    if not row or not any(row):
        errors.append(f"Row {idx}: Empty row")
        continue

    if len(row) < 3:
        errors.append(f"Row {idx}: Only {len(row)} columns (need 3)")
        print(f"  ✗ Row {idx}: {row}")
        continue

    word = row[0].strip() if row[0] else ""
    meaning = row[1].strip() if row[1] else ""
    example = row[2].strip() if row[2] else ""

    if not word:
        errors.append(f"Row {idx}: Word is empty")
    if not meaning:
        errors.append(f"Row {idx}: Meaning is empty")
    if not example:
        errors.append(f"Row {idx}: Example is empty")

    asterisk_count = example.count('*')
    if asterisk_count < 2:
        errors.append(f"Row {idx} ({word}): Example has only {asterisk_count} asterisks (need 2)")
        print(f"  ✗ Row {idx} ({word}): asterisks={asterisk_count}")
        print(f"     Example: '{example}'")

print(f"\n{'='*60}")
print(f"Total rows: {total_rows}")
if errors:
    print(f"❌ Found {len(errors)} errors:")
    for error in errors[:10]:  # Show first 10 errors
        print(f"  - {error}")
    if len(errors) > 10:
        print(f"  ... and {len(errors) - 10} more errors")
else:
    print("✓ All rows are valid!")
