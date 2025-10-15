#!/usr/bin/env python3
"""
Test full CSV to find problematic rows
"""
import csv
import io

csv_data = """moralistisch;geneigd om anderen de les te lezen over goed en kwaad;Zijn *moralistisch* betoog over de jeugd van tegenwoordig irriteerde veel van zijn jongere toehoorders.
secularisme;de overtuiging dat religie en staat gescheiden moeten zijn;Het *secularisme* is een belangrijk principe in veel westerse democratieën voor een neutrale overheid.
esthetica;de leer van de schoonheid en de kunst;In de les *esthetica* bestudeerden we hoe opvattingen over schoonheid door de eeuwen heen zijn veranderd.
pragmaticus;iemand die praktisch en doelgericht handelt;Als een echte *pragmaticus* zocht hij naar de meest efficiënte oplossing voor het complexe probleem.
positivisme;filosofische stroming die uitgaat van feiten en wetenschap;Het *positivisme* stelt dat alleen kennis die gebaseerd is op waarneming als wetenschappelijk kan worden beschouwd.
onethisch;in strijd met de morele principes;Het werd als *onethisch* beschouwd dat het bedrijf proeven uitvoerde op weerloze dieren.
moraliteit;het geheel van opvattingen over goed en kwaad;De discussie over euthanasie raakt aan diepe vragen over onze collectieve *moraliteit* en menselijkheid.
relativisme;de opvatting dat waarheid en moraal relatief zijn;Het cultureel *relativisme* stelt dat we andere culturen niet mogen beoordelen met onze eigen normen.
pluralisme;het naast elkaar bestaan van verschillende overtuigingen;Politiek *pluralisme* betekent dat er ruimte is voor diverse partijen met uiteenlopende ideologische standpunten.
immoreel;in strijd met de heersende moraal;Het werd als diep *immoreel* gezien dat hij zijn belofte aan zijn zieke vriend had gebroken.
materialisme;de overtuiging dat alleen de materie bestaat;Het *materialisme* als levenshouding hecht veel waarde aan bezit en financiële welvaart boven geestelijke zaken.
atheïsme;de overtuiging dat er geen God of goden bestaan;Het *atheïsme* is de afwezigheid van geloof in een hogere macht die het universum bestuurt.
moralist;iemand die de moraal streng handhaaft;Als een echte *moralist* had hij altijd een oordeel klaar over het gedrag van andere mensen.
dualisme;de leer die uitgaat van twee tegengestelde principes;Het *dualisme* van Descartes scheidt de denkende geest van het materiële, stoffelijke lichaam.
marxisme;de socialistische leer van Karl Marx;Het *marxisme* analyseert de samenleving als een strijd tussen de arbeidersklasse en de heersende klasse.
wijsbegeerte;filosofie;Tijdens zijn studie *wijsbegeerte* leerde hij kritisch na te denken over fundamentele vragen van het leven.
nihilisme;de ontkenning van het bestaan van waarden of waarheid;Het *nihilisme* kan leiden tot een gevoel van zinloosheid omdat het geen enkel doel erkent.
wijsgeer;een filosoof of denker;De oude *wijsgeer* bracht zijn dagen door met het overdenken van de grote mysteries van het leven.
ideoloog;een aanhanger of ontwerper van een ideologie;Als *ideoloog* van de partij was hij verantwoordelijk voor het formuleren van de kernprincipes.
humanistisch;uitgaand van de waarde van de mens;Een *humanistisch* wereldbeeld stelt de menselijke waardigheid en vrijheid centraal in het denken en handelen.
esthetiek;de filosofie van de schoonheid en kunst;De *esthetiek* van het gebouw werd alom geprezen door architecten en kunstcritici.
atheïst;iemand die niet in een god gelooft;Als overtuigd *atheïst* zag hij geen enkele reden om aan te nemen dat er een god bestaat.
dogmatisch;vasthoudend aan een leer zonder kritiek;Zijn *dogmatisch* standpunt maakte een open en constructieve discussie over het onderwerp vrijwel onmogelijk.
individualisme;de opvatting dat het individu boven de gemeenschap gaat;Het moderne westerse *individualisme* benadrukt persoonlijke vrijheid en de ontwikkeling van het eigen ik.
humanist;iemand die uitgaat van de menselijke waardigheid;Als *humanist* geloofde zij in de kracht van de mens om de wereld te verbeteren.
utopisch;een onbereikbaar ideaalbeeld schetsend;Het plan voor een wereld zonder oorlogen en armoede wordt vaak als *utopisch* en onrealistisch beschouwd.
hedonisme;de leer dat genot het hoogste levensdoel is;Het *hedonisme* stelt dat het streven naar plezier en het vermijden van pijn de mens drijft.
humanisme;levensbeschouwing die de mens centraal stelt;Het *humanisme* legt de nadruk op rede, ethiek en rechtvaardigheid zonder een goddelijke openbaring.
cynisme;een houding van bijtend wantrouwen;Zijn *cynisme* maakte het moeilijk voor hem om de goede bedoelingen van andere mensen te vertrouwen.
utopie;een onbereikbaar ideaal van een perfecte samenleving;Het boek beschrijft een *utopie* waarin iedereen gelijk is en in perfecte harmonie samenleeft.
pragmatisme;filosofische stroming die uitgaat van de praktijk;Het *pragmatisme* beoordeelt ideeën op basis van hun praktische nut en hun concrete gevolgen.
doctrine;een vaststaande leer of verzameling van leerstellingen;De partij week geen centimeter af van haar strenge ideologische *doctrine* tijdens de campagne.
paradox;een uitspraak die een schijnbare tegenstrijdigheid bevat;Het is een *paradox* dat je soms moet loslaten wat je het liefste wilt behouden.
pragmatisch;praktisch en gericht op het nut;Hij koos voor een *pragmatisch* aanpak en zocht naar de snelste, meest werkbare oplossing.
realisme;de opvatting die uitgaat van de werkelijkheid;Het *realisme* in de kunst streeft ernaar de wereld zo waarheidsgetrouw mogelijk weer te geven.
scepsis;een houding van twijfel;Hij bekeek de buitengewone beweringen van de politicus met een gezonde dosis *scepsis* en kritiek.
dogma;een vaststaande, onbetwistbare leerstelling;Het is een *dogma* in hun geloof dat de ziel na de dood verder leeft.
ethiek;de leer van goed en kwaad handelen;De commissie *ethiek* onderzoekt of de wetenschapper zich aan de morele regels heeft gehouden.
esthetisch;wat de schoonheid betreft;Vanuit een *esthetisch* oogpunt was het schilderij een meesterwerk van kleur en compositie.
ideologie;het geheel van ideeën van een bepaalde stroming;De politieke *ideologie* van de partij is gebaseerd op de principes van vrijheid en gelijkheid.
ideologisch;vanuit een ideologie;De twee partijen stonden lijnrecht tegenover elkaar vanwege hun diepe *ideologisch* meningsverschillen.
ethisch;moreel juist, in overeenstemming met de ethiek;De arts stond voor een *ethisch* dilemma bij de behandeling van de terminale patiënt.
moraal;de heersende opvattingen over goed en kwaad;Het verhaal van de film had een duidelijke *moraal* over de gevaren van hebzucht.
idealisme;het streven naar een ideaal;Zijn jeugdig *idealisme* dreef hem ertoe zich in te zetten voor een betere wereld."""

# Parse CSV
csv_file = io.StringIO(csv_data)
sample = csv_data[:1024]

delimiter = csv.Sniffer().sniff(sample).delimiter
csv_file.seek(0)
reader = csv.reader(csv_file, delimiter=delimiter)

print("Checking all rows...")
errors = []

for idx, row in enumerate(reader, start=1):
    if not row or not any(row):
        errors.append(f"Row {idx}: Empty row")
        continue

    if len(row) < 3:
        errors.append(f"Row {idx}: Only {len(row)} columns (need 3)")
        print(f"  Row {idx}: {row}")
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
        print(f"  Row {idx} ({word}): '{example[:80]}'")

if errors:
    print(f"\n❌ Found {len(errors)} errors:")
    for error in errors:
        print(f"  - {error}")
else:
    print("\n✓ All rows are valid!")
