# Octovoc - Quick Start Guide

## Snelle Installatie (Automatisch)

### Vereisten
- PostgreSQL geïnstalleerd en draaiend
- Python 3.9+
- Node.js 18+

### Stappen

1. **Maak de PostgreSQL database:**
```bash
createdb octovoc
```

2. **Run het setup script:**
```bash
chmod +x setup.sh
./setup.sh
```

3. **Start de backend:**
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python run.py
```

4. **Start de frontend (in een nieuwe terminal):**
```bash
cd frontend
npm run dev
```

5. **Open de applicatie:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Admin Login

- Email: `info@katern.be`
- Wachtwoord: `Warempelwachtwoord007`

## Eerste Module Uploaden

1. Log in als admin
2. Maak een Excel bestand (.xlsx) met de volgende kolommen:
   - Kolom A: Woord
   - Kolom B: Betekenis
   - Kolom C: Voorbeeldzin (met *woord*)

Voorbeeld rij:
```
aangezien | omdat | *Aangezien* het regent, blijven we binnen.
```

3. Upload via de admin interface
4. Vink "Gratis module" aan om deze beschikbaar te maken voor iedereen

## Test Workflow

### Als Student:
1. Registreer een nieuw account (zonder code)
2. Je ziet alleen gratis modules
3. Start een module om te oefenen
4. Doorloop de 3 fasen

### Als Leerkracht:
1. Genereer een lerarencode via admin panel
2. Registreer met deze code
3. Bekijk je klassen en leerlingen

### Als Admin:
1. Upload modules
2. Genereer klas- en lerarencodes
3. Beheer gebruikers en content

## Veelvoorkomende Problemen

### Database connectie fout
```bash
# Controleer of PostgreSQL draait
sudo service postgresql status

# Start PostgreSQL
sudo service postgresql start
```

### Port 5000 is al in gebruik
```bash
# Wijzig de port in backend/run.py
app.run(debug=True, host='0.0.0.0', port=5001)
```

### Module upload geeft validatie errors
- Controleer of alle kolommen ingevuld zijn
- Zorg dat het woord in de zin staat als `*woord*`
- Gebruik alleen .xlsx formaat (geen .xls)

## Volgende Stappen

- Lees de volledige README.md voor gedetailleerde info
- Bekijk example_module.md voor Excel format details
- Configureer je .env bestand voor productie
