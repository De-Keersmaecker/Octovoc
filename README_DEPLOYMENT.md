# Octovoc Deployment Guide

## Railway Deployment

### Backend Deployment

1. **Database**: Railway PostgreSQL
2. **Environment Variables** nodig op Railway:
   - `DATABASE_URL` - (wordt automatisch gezet door Railway PostgreSQL)
   - `SECRET_KEY` - Flask secret key (genereer een veilige random string)
   - `JWT_SECRET_KEY` - JWT signing key (genereer een veilige random string)
   - `ADMIN_EMAIL` - Admin email voor eerste login
   - `ADMIN_PASSWORD` - Admin wachtwoord
   - `FLASK_ENV=production`

3. **Post-deployment commands**:
   ```bash
   flask db upgrade
   python setup_initial_data.py  # Als je initial data hebt
   ```

### Frontend Deployment

1. **Environment Variables** nodig:
   - `VITE_API_URL` - URL van je backend API (bijv. https://octovoc-backend.railway.app)

2. **Build Command**: `npm run build`
3. **Start Command**: `npm run preview` (of gebruik een static file server zoals nginx)

### Monorepo Setup

Je kunt beide als aparte Railway services deployen:
- Backend service: root directory = `/backend`
- Frontend service: root directory = `/frontend`

## Security Checklist

- [ ] Verander DEFAULT admin wachtwoorden in config.py
- [ ] Genereer sterke SECRET_KEY en JWT_SECRET_KEY
- [ ] Zet FLASK_ENV=production
- [ ] GitHub wachtwoord veranderen (je hebt het gedeeld in deze sessie!)
- [ ] Gebruik environment variables voor alle secrets

## Database Migrations

Na deployment op Railway:
```bash
railway run flask db upgrade
```

Of via Railway CLI:
```bash
railway run --service backend flask db upgrade
```
