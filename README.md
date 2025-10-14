# Octovoc - Vocabulaire Oefenapp

Een webapplicatie voor het oefenen van woordenschat met modules, batterijen en driefasensysteem.

## Features

- **Drie gebruikersrollen**: Student, Leerkracht, Administrator
- **Anonieme en geregistreerde modus**
- **Driefasensysteem** voor woordenschat oefening
- **Persoonlijke "moeilijke woorden" module**
- **Leerkracht dashboard** met voortgang tracking
- **Admin panel** voor content en gebruikersbeheer
- **Excel import/export** functionaliteit
- **GDPR compliant**

## Tech Stack

### Backend
- Flask (Python)
- PostgreSQL
- SQLAlchemy
- JWT Authentication
- openpyxl voor Excel import

### Frontend
- React 18
- Vite
- React Router
- TanStack Query
- Minimalistisch zwart-wit design

## Lokale Setup

### Vereisten
- Python 3.9+
- Node.js 18+
- PostgreSQL 14+

### Backend Setup

1. Navigeer naar backend directory:
```bash
cd backend
```

2. Maak een virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # Op Windows: venv\Scripts\activate
```

3. Installeer dependencies:
```bash
pip install -r requirements.txt
```

4. Maak een .env bestand (kopieer van .env.example):
```bash
cp .env.example .env
```

5. Start PostgreSQL en maak een database:
```bash
createdb octovoc
```

6. Initialiseer de database:
```bash
python init_db.py
```

7. Start de Flask server:
```bash
python run.py
```

De backend draait nu op `http://localhost:5000`

### Frontend Setup

1. Navigeer naar frontend directory:
```bash
cd frontend
```

2. Installeer dependencies:
```bash
npm install
```

3. Start de development server:
```bash
npm run dev
```

De frontend draait nu op `http://localhost:3000`

## Admin Login

Na het initialiseren van de database:

- Email: `info@katern.be`
- Wachtwoord: `Warempelwachtwoord007`

## Project Structuur

```
octovoc/
├── backend/
│   ├── app/
│   │   ├── models/         # Database modellen
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   └── utils/          # Helper functies
│   ├── migrations/         # Database migraties
│   ├── uploads/            # Geüploade bestanden
│   ├── config.py           # Configuratie
│   ├── run.py              # Entry point
│   └── init_db.py          # Database initialisatie
│
├── frontend/
│   ├── src/
│   │   ├── components/     # React componenten
│   │   ├── pages/          # Pagina componenten
│   │   ├── services/       # API calls
│   │   ├── utils/          # Helper functies
│   │   └── styles/         # CSS bestanden
│   ├── index.html
│   └── vite.config.js
│
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Registreer nieuwe gebruiker
- `POST /api/auth/login` - Login
- `POST /api/auth/verify/<token>` - Verifieer email
- `POST /api/auth/forgot-password` - Wachtwoord vergeten
- `POST /api/auth/reset-password/<token>` - Reset wachtwoord
- `POST /api/auth/add-class-code` - Voeg klascode toe
- `POST /api/auth/accept-gdpr` - Accepteer GDPR

### Student
- `GET /api/student/modules` - Haal modules op
- `POST /api/student/module/<id>/start` - Start module
- `POST /api/student/battery/<id>/start` - Start batterij
- `POST /api/student/question/answer` - Beantwoord vraag
- `GET /api/student/difficult-words` - Haal moeilijke woorden op

### Teacher
- `GET /api/teacher/classrooms` - Haal klassen op
- `GET /api/teacher/classroom/<id>/progress` - Klasvoortgang
- `GET /api/teacher/student/<id>/detail` - Student detail
- `GET /api/teacher/analytics/difficult-words` - Analyse moeilijke woorden

### Admin
- `POST /api/admin/module/upload` - Upload module (Excel)
- `POST /api/admin/codes/class/generate` - Genereer klascode
- `POST /api/admin/codes/teacher/generate` - Genereer lerarencode
- `GET /api/admin/analytics/difficult-words` - Globale analyse

## Excel Import Format

Voor het aanmaken van modules, gebruik een Excel bestand (.xlsx) met de volgende kolommen:

- **Kolom A**: Woord
- **Kolom B**: Betekenis
- **Kolom C**: Voorbeeldzin (met *woord* gemarkeerd)

Voorbeeld:
```
aangezien | omdat | *Aangezien* het regent, blijven we binnen.
derhalve | daarom | Hij had hard gestudeerd; *derhalve* slaagde hij.
```

## Deployment (Railway)

Voor deployment via Railway:

1. Maak een Railway project
2. Voeg PostgreSQL database toe
3. Deploy backend en frontend als aparte services
4. Stel environment variables in
5. Run database migraties

## Licentie

Proprietary - Alle rechten voorbehouden
