# Voorbeeld Module Excel Formaat

## Format

Om een module te uploaden via het admin panel, maak een Excel bestand (.xlsx) aan met de volgende structuur:

### Kolommen:
- **Kolom A**: Woord
- **Kolom B**: Betekenis
- **Kolom C**: Voorbeeldzin (met het woord gemarkeerd tussen asterisken)

### Voorbeeld Excel Inhoud:

| Woord | Betekenis | Voorbeeldzin |
|-------|-----------|--------------|
| aangezien | omdat | *Aangezien* het regent, blijven we binnen. |
| derhalve | daarom | Hij had hard gestudeerd; *derhalve* slaagde hij met vlag en wimpel. |
| evenwel | echter | Het was koud; *evenwel* gingen we naar buiten. |
| alhoewel | hoewel | *Alhoewel* hij moe was, bleef hij werken. |
| terwijl | tijdens | *Terwijl* zij studeerde, luisterde ze naar muziek. |

## Validatieregels:

1. Alle drie kolommen moeten ingevuld zijn
2. Het woord moet in de voorbeeldzin voorkomen tussen asterisken: `*woord*`
3. De schrijfwijze moet exact overeenkomen (hoofdletters/kleine letters)
4. Lege rijen worden genegeerd

## Batterij Algoritme:

Het systeem verdeelt de woorden automatisch in batterijen:
- **23 woorden** → 3 batterijen van 5 + 2 batterijen van 4
- **18 woorden** → 3 batterijen van 5 + 1 batterij van 3
- **15 woorden** → 3 batterijen van 5
- **8 woorden** → 1 batterij van 5 + 1 batterij van 3
- **7 woorden** → 1 batterij van 4 + 1 batterij van 3

## Tips:

- Zorg voor duidelijke, contextuele voorbeeldzinnen
- Betekenissen moeten kort en bondig zijn
- Vermijd dubbele betekenissen binnen dezelfde batterij
- Test de module eerst als gratis module voordat je hem publiceert
