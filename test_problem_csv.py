#!/usr/bin/env python3
"""
Test problematic CSV to find specific issues
"""
import csv
import io

csv_data = """inventiviteit;vindingrijkheid;Zijn *inventiviteit* kwam goed van pas bij het oplossen van het onverwachte technische probleem.
apathisch;lusteloos en onverschillig;Na het slechte nieuws reageerde hij *apathisch* en toonde hij geen enkele vorm van emotie.
assertiviteit;zelfverzekerd opkomen voor je eigen mening;Tijdens de cursus leerde ze hoe *assertiviteit* haar kon helpen om duidelijker grenzen te stellen.
punctualiteit;stiptheid;Zijn *punctualiteit* werd zeer gewaardeerd; hij was altijd precies op tijd voor elke afspraak.
empathisch;met inlevingsvermogen;Een goede therapeut moet *empathisch* zijn en de gevoelens van zijn cliënten kunnen begrijpen.
altruïsme;onbaatzuchtigheid;Zijn *altruïsme* bleek uit het feit dat hij anoniem grote sommen geld aan goede doelen schonk.
melancholiek;zwaarmoedig en droevig;De herfst maakt hem altijd een beetje *melancholiek* door de vallende bladeren en de donkere dagen.
rancuneus;haatdragend;Hij bleef jarenlang *rancuneus* tegenover zijn voormalige vriend die hem ooit had bedrogen.
opportunistisch;handelend naar de omstandigheden voor eigen voordeel;De politicus nam een *opportunistisch* standpunt in om zo meer kiezers voor zich te winnen.
getergd;geïrriteerd en gekweld;Met een *getergd* gezicht luisterde hij naar de valse beschuldigingen die tegen hem werden geuit.
sereniteit;kalmte en innerlijke rust;Midden in de chaos van de stad vond ze een moment van *sereniteit* in de stille tuin.
filantroop;iemand die goede dingen doet voor mensen;De rijke *filantroop* doneerde miljoenen aan de bouw van een nieuw ziekenhuis voor kinderen.
cynicus;iemand die niet gelooft in het goede van de mens;Als een echte *cynicus* geloofde hij dat iedereen uiteindelijk alleen maar voor zijn eigenbelang kiest.
patriottisch;vaderlandslievend;Tijdens het volkslied toonde hij zijn *patriottisch* gevoel door zijn hand op zijn hart te leggen.
hypocrisie;schijnheiligheid;De *hypocrisie* van de politicus was stuitend; hij predikte water maar dronk zelf wijn.
patriottisme;vaderlandsliefde;Zijn *patriottisme* kwam sterk tot uiting toen hij het nationale elftal luidkeels aanmoedigde.
kinky;seksueel extravagant of onconventioneel;Het feest had een *kinky* thema waarbij de gasten werden aangemoedigd zich gewaagd te kleden.
opportunisme;handelen naar de omstandigheden voor eigen voordeel;Het werd hem verweten dat hij uit puur *opportunisme* van politieke partij was veranderd.
gedecideerd;vastberaden;Met een *gedecideerd* gebaar maakte hij een einde aan de eindeloze en zinloze discussie.
charlatan;oplichter of bedrieger;De man die beweerde kanker te kunnen genezen met kruiden, bleek een gevaarlijke *charlatan* te zijn.
denigrerend;minachtend, kleinerend;Hij maakte een *denigrerend* opmerking over haar kleding, wat haar diep heeft gekwetst.
melancholisch;zwaarmoedig;De *melancholisch* klanken van de cello pasten perfect bij de sombere sfeer van de filmscène.
eendrachtig;samenwerkend in harmonie;Het team werkte *eendrachtig* samen om het project voor de gestelde deadline af te krijgen.
fanatisme;blinde, overdreven ijver;Het religieus *fanatisme* van de groepering leidde tot extreem en gevaarlijk gedrag.
gebiologeerd;extreem gefascineerd;Ze keek *gebiologeerd* naar de goochelaar die de meest onmogelijke trucs leek uit te voeren.
intolerantie;onverdraagzaamheid tegenover andersdenkenden;De toename van *intolerantie* in de samenleving is een zorgwekkende ontwikkeling voor de sociale vrede.
provocateur;iemand die bewust provoceert;Als bekende *provocateur* genoot hij ervan om met zijn uitspraken ophef te veroorzaken.
desillusie;teleurstelling;De *desillusie* was groot toen bleek dat de beloofde promotie niet doorging.
zelfgenoegzaam;erg tevreden met zichzelf;Met een *zelfgenoegzaam* glimlach nam hij de complimenten voor het werk van zijn team in ontvangst.
decadent;overdreven luxueus en verfijnd, in verval;De *decadent* levensstijl van de adel, met overdadige feesten, leidde tot hun ondergang.
assertief;zelfverzekerd en voor jezelf opkomend;Tijdens de vergadering durfde zij eindelijk *assertief* haar mening te geven tegenover haar baas.
introvert;naar binnen gekeerd;Als *introvert* persoon laadt hij zijn energie op door alleen te zijn in plaats van op feestjes.
pathetisch;zielig en deerniswekkend;Zijn poging om sympathie te wekken met overdreven tranen was ronduit *pathetisch* en ongeloofwaardig.
tergend;tergend langzaam of irritant;Het was een *tergend* geluid, alsof er nagels over een schoolbord werden gehaald.
hypocriet;schijnheilig;Het is *hypocriet* om te klagen over het milieu terwijl je zelf overal met de auto naartoe gaat.
weldadig;heilzaam en aangenaam;De warme zon op haar huid voelde *weldadig* aan na de lange en koude winter.
aversie;weerzin, afkeer;Sinds zijn jeugd heeft hij een diepe *aversie* tegen spruitjes en weigert hij ze te eten.
flamboyant;opvallend en extravagant;De kunstenaar stond bekend om zijn *flamboyant* kledingstijl en zijn uitbundige persoonlijkheid.
incompetent;onbekwaam;De nieuwe manager bleek volkomen *incompetent* en maakte de ene na de andere verkeerde beslissing.
sereen;kalm en vredig;De *sereen* sfeer in de Japanse tuin zorgde ervoor dat ik helemaal tot rust kwam.
opportunist;iemand die handelt voor eigen voordeel;Als een echte *opportunist* zag hij in de crisis een kans om goedkoop aandelen te kopen.
weemoedig;zacht, treurig verlangend;De oude foto's maakten haar *weemoedig* omdat ze terugdacht aan haar zorgeloze jeugd.
destructief;vernietigend;Zijn *destructief* gedrag zorgde ervoor dat hij al zijn vriendschappen in korte tijd verloos.
wroeging;spijt en schuldgevoel;Hij voelde diepe *wroeging* over de leugen die hij zijn beste vriend had verteld.
excentriek;vreemd en ongewoon;De oude dame stond in de buurt bekend om haar *excentriek* gedrag en haar opvallende hoeden.
secuur;nauwkeurig;De horlogemaker moest zeer *secuur* te werk gaan bij het repareren van het kleine uurwerk.
extase;toestand van grote opwinding en verrukking;De fans waren in *extase* toen hun favoriete band eindelijk het podium op kwam.
genius;genie, buitengewoon begaafd persoon;Mozart wordt beschouwd als een muzikaal *genius* die al op jonge leeftijd meesterwerken componeerde.
autoritair;bazig en geen tegenspraak duldend;De *autoritair* manager eiste absolute gehoorzaamheid van al zijn ondergeschikte medewerkers.
provocerend;uitdagend;Zij stelde een *provocerend* vraag om een levendige discussie op gang te brengen in de groep.
visionair;met een vernieuwende en inspirerende toekomstvisie;Steve Jobs wordt gezien als een *visionair* die de wereld van technologie voorgoed heeft veranderd.
sceptisch;geneigd tot twijfel;Hij bleef *sceptisch* over het plan, zelfs nadat hem alle voordelen waren uitgelegd.
geraffineerd;zeer verfijnd en subtiel;Het gerecht had een *geraffineerd* smaak door het gebruik van zeldzame kruiden en specerijen.
integer;eerlijk en betrouwbaar;Een rechter moet een *integer* persoon zijn die onpartijdig en rechtvaardig kan oordelen.
geestdrift;groot enthousiasme;Met veel *geestdrift* begon hij aan zijn nieuwe project, vol met ideeën en energie.
rancune;opgekropt haatgevoel;Hij koesterde al jaren een diepe *rancune* jegens de collega die hem had verraden.
verachting;diepe minachting;Hij keek met openlijke *verachting* naar de man die zijn hond zo slecht behandelde.
discretie;gevoel voor wat je wel en niet kunt zeggen;De arts behandelde de informatie over zijn patiënt met de grootste *discretie* en zorgvuldigheid.
nostalgisch;verlangend naar het verleden;De oude muziek maakte hem *nostalgisch* en deed hem denken aan zijn studententijd.
charismatisch;met een sterke, innemende persoonlijkheid;De *charismatisch* leider wist met zijn toespraken de menigte moeiteloos te inspireren en te boeien.
pretentie;de ingebeelde aanspraak op iets;Hij sprak met de *pretentie* van een expert, maar had eigenlijk weinig kennis van zaken.
cynisch;spottend en niet gelovend in het goede;Met een *cynisch* opmerking maakte hij duidelijk dat hij de goedbedoelde adviezen niet serieus nam.
ludiek;speels;De organisatie had een *ludiek* actie bedacht om op een vrolijke manier aandacht te vragen.
loyaliteit;trouw;Zijn *loyaliteit* aan het bedrijf was groot; hij werkte er al meer dan dertig jaar.
integriteit;eerlijkheid en betrouwbaarheid;De politicus moest aftreden omdat zijn *integriteit* in twijfel werd getrokken na het schandaal.
charisma;sterke persoonlijke uitstraling;Dankzij zijn *charisma* wist de verkoper zelfs de meest kritische klanten te overtuigen.
laconiek;heel rustig en doodkalm;Hij reageerde *laconiek* op het slechte nieuws, alsof het hem totaal niet deerde.
nostalgie;verlangen naar het verleden;Een golf van *nostalgie* overviel haar toen ze de geur van haar oma's appeltaart rook.
ironisch;spottend, waarbij het tegendeel wordt bedoeld;Het is *ironisch* dat de brandweerkazerne tot de grond toe is afgebrand."""

# Parse CSV
csv_file = io.StringIO(csv_data)
sample = csv_data[:1024]

try:
    delimiter = csv.Sniffer().sniff(sample).delimiter
    print(f"✓ Sniffer detected: '{delimiter}'")
except Exception as e:
    print(f"✗ Sniffer failed: {e}")
    if ';' in sample and sample.count(';') > sample.count(','):
        delimiter = ';'
        print(f"✓ Fallback to semicolon")
    else:
        delimiter = ','
        print(f"✓ Fallback to comma")

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
        print(f"  ✗ Row {idx}: {row[0] if len(row) > 0 else '(empty)'}")
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
        print(f"     Example: '{example[:80]}'")

print(f"\n{'='*60}")
print(f"Total rows: {total_rows}")
if errors:
    print(f"❌ Found {len(errors)} errors:")
    for error in errors:
        print(f"  - {error}")
else:
    print("✓ All rows are valid!")
