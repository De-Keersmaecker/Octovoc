Finale Functionele Specificaties: Octovoc Webapplicatie
Documentversie: 2.0
Datum: 12 oktober 2025

1.0 Projectoverzicht
Octovoc is een webapplicatie ontworpen om leerlingen op een effectieve manier woordenschat te laten oefenen. De applicatie is opgebouwd rond modules die woorden in 'batterijen' groeperen en deze ondervragen via een driefasensysteem. De app bedient drie gebruikersrollen: de Leerling (die oefent), de Leerkracht (die de voortgang monitort) en de Administrator (die de content en gebruikers beheert).

2.0 Algemene & Technische Specificaties
2.1 Platform: De applicatie is een webapplicatie, toegankelijk via moderne webbrowsers.

2.2 Gebruikersinterface: De applicatie maakt gebruik van tooltips om de functie van knoppen en interface-elementen te verduidelijken.

2.3 Gebruikersmodi:

Anonieme modus: Iedereen kan de app gebruiken zonder account. Er is een beperkt aantal gratis modules beschikbaar. De voortgang wordt lokaal in de browser opgeslagen. Deze data gaat verloren bij het wissen van de browsercache.

Geregistreerde modus: Gebruikers activeren alle modules door in te loggen met een e-mailadres en een klascode. Voortgang wordt centraal op een server opgeslagen.

2.4 Synchronisatie: Bij de eerste login van een gebruiker met een klascode, wordt de eventuele lokale (anonieme) voortgang gesynchroniseerd en samengevoegd met het nieuwe online account. Bij conflicten wordt het scenario gekozen dat de meeste voortgang voor de gebruiker bewaart.

2.5 Accountbeheer:

Gebruikers registreren zich met een e-mailadres en ontvangen een activatiemail.

Een "wachtwoord vergeten" functionaliteit is aanwezig.

Het e-mailadres van een account kan niet door de gebruiker gewijzigd worden.

2.6 Offline Gebruik: De applicatie vereist een actieve internetverbinding en heeft geen offline functionaliteit.

2.7 GDPR & Privacy:

Bij het gebruik van de app verschijnt na 10 seconden eenmalig een GDPR-conforme melding die de dataverwerking toelicht.

Accounts die 2 jaar inactief zijn, worden automatisch en permanent gewist.

3.0 De Leerling-ervaring (Oefenflow)
3.1 Modules & Batterijen:

Woorden zijn gegroepeerd in modules, die op hun beurt zijn gecategoriseerd op moeilijkheidsgraad.

Een module wordt opgedeeld in 'batterijen'. Het algoritme streeft naar batterijen van 5 woorden. Het restant wordt verdeeld over batterijen van 4 en, indien nodig, 3 woorden. (Voorbeeld: een module met 23 woorden wordt verdeeld in 3 batterijen van 5 en 2 batterijen van 4).

De volgorde waarin de batterijen binnen een module worden aangeboden, is voor elke gebruiker willekeurig.

3.2 De Drie Fases (per batterij):

Fase 1: Betekenis Herkennen (Meerkeuze)

De leerling ziet een woord onderlijnd in een voorbeeldzin.

De leerling kiest de juiste betekenis uit een lijst. De opties bestaan uit de betekenissen van alle woorden in de huidige batterij.

Indien woorden in een batterij een identieke betekenis hebben, wordt de dubbele betekenis uit de keuzelijst verwijderd.

Fase 2: Woord Herkennen (Meerkeuze)

De leerling ziet de voorbeeldzin waarin het te oefenen woord ontbreekt.

De leerling kiest het juiste woord uit een lijst die alle woorden van de huidige batterij bevat.

Fase 3: Woord Invoeren (Tekstinput)

De leerling ziet de voorbeeldzin en moet het ontbrekende woord zelf intypen in een invulveld.

Validatie: De invoer is strikt en dus hoofdletter- en accentgevoelig.

Foutdetectie: Het juiste antwoord wordt automatisch getoond zodra het aantal foute letters dat de gebruiker heeft ingetypt de 2 overschrijdt.

Feedback bij fouten: Bij een fout antwoord dat enkel verschilt op vlak van hoofdletters/accenten, toont de feedback expliciet dat daar de fout zat.

3.3 Vraag-cyclus en Feedback:

Een fase is pas voltooid als alle vragen correct zijn beantwoord. Fout beantwoorde vragen keren terug aan het einde van de huidige fase en worden opnieuw gesteld.

Na elk antwoord wordt de interface gedurende 4 seconden bevroren:

Het juiste antwoord licht groen op.

Eventuele foute antwoorden van de gebruiker lichten rood op.

De voortgang binnen een batterij wordt na elk antwoord opgeslagen.

3.4 Eindronde:

Nadat alle batterijen van een module zijn voltooid, volgt een eindronde.

Deze ronde bestaat uit alle vragen uit Fase 3 die gedurende de module minstens één keer fout zijn beantwoord.

Foute antwoorden in de eindronde worden cyclisch herhaald totdat de leerling ze allemaal correct beantwoordt.

3.5 Module Voltooid:

Na het succesvol afronden van de eindronde verschijnt gedurende 4 seconden een quote (beheerd door de administrator).

De leerling keert daarna terug naar het module-overzicht.

3.6 Speciale Module: 'Oefenen op moeilijke woorden'

Elke leerling heeft een persoonlijke oefenmodule genaamd "Oefenen op moeilijke woorden".

Zichtbaarheid: Deze module is verborgen voor nieuwe leerlingen. Ze verschijnt bovenaan in het module-overzicht zodra er minstens één woord in zit. Een tooltip legt de functie van deze module uit.

Inhoud: Een woord wordt automatisch aan deze module toegevoegd als de leerling het woord fout beantwoordt in de eindronde van een reguliere module.

Werking: De oefening volgt dezelfde structuur als reguliere modules (batterijen, 3 fasen, eindronde).

Voortgang: Deze module heeft geen voltooiingspercentage en kan onbeperkt herhaald worden.

Beheer door de leerling: De leerling kan de lijst met woorden in deze module bekijken en woorden manueel verwijderen. Een verwijderd woord kan opnieuw worden toegevoegd als het later weer fout wordt beantwoord in een eindronde.

4.0 De Leerkracht-ervaring (Dashboard)
4.1 Klassenoverzicht: De leerkracht ziet een overzicht van zijn/haar klassen en kan doorklikken voor details.

4.2 Progressietabel: Per klas wordt een tabel getoond met de volgende kolommen: Leerling, Module, Score, Aantal Pogingen, Datum Voltooiing, en Gespendeerde Tijd.

4.3 Detailweergave & Analyse:

De leerkracht kan doorklikken op een resultaat voor een gedetailleerd rapport per leerling.

Er is een analyse-tool die een gerangschikte lijst toont van de meest fout beantwoorde woorden per klas of voor alle klassen van de leerkracht. Deze data kan gefilterd worden op periode.

4.4 Leerlingbeheer:

Een leerkracht kan een leerling uit een klas verwijderen (verbreekt de koppeling) of verplaatsen naar een andere klas.

Leerkrachten kunnen geen leerlingen manueel toevoegen.

4.5 Export: De data kan geëxporteerd worden naar Excel (.xlsx) en PDF. Zowel de overzichtstabel als een volledig, gedetailleerd rapport per individuele leerling zijn als export mogelijk.

5.0 De Administrator-ervaring (Beheerpaneel)
5.1 Modulebeheer:

Creatie: Modules worden aangemaakt door een Excel-bestand (.xlsx) te uploaden (Kolom A: Woord, B: Betekenis, C: Voorbeeldzin met *woord*).

Aanpassen: Bestaande modules kunnen aangepast worden. Leerlingen die al bezig zijn, maken de module af met de oude content.

Categoriseren: Modules worden bij creatie toegewezen aan een moeilijkheidsgraad.

5.2 Gebruikers- & Klasbeheer:

Codes Genereren: De admin genereert klascodes (XXXX-YYYY) voor leerkrachten.

Codebeheer: De admin kan codes deactiveren (gebruikers vallen terug op gratis versie) of wissen.

5.3 E-mail Notificaties:

De admin kan de tekst van de instructiemail voor leerkrachten aanpassen met placeholders (bv. {leerkracht_naam}).

5.4 Analyse: De admin heeft toegang tot de "meest fout beantwoorde woorden" analyse over alle gebruikers.

5.5 Quote-beheer: De admin beheert de quotes die na het voltooien van een module verschijnen.