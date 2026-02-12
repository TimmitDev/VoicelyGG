# VoicelyGG Username Claims

Next.js + Tailwind project met:
- publieke pagina om usernames te claimen met e-mail
- opslag in een online Postgres database (Vercel/Neon via `DATABASE_URL`)
- admin portal (`/admin`) om alle claims te bekijken

## 1. Installatie

```bash
npm install
```

Kopieer daarna environment variables:

```bash
cp .env.example .env.local
# PowerShell:
Copy-Item .env.example .env.local
```

Vul minimaal in:
- `DATABASE_URL` (of `POSTGRES_URL`)
- optioneel: `ADMIN_SECRET` om `/admin` af te schermen

## 2. Vercel Database koppelen

1. Maak een project op Vercel.
2. Voeg een Postgres/Neon database integration toe in Vercel.
3. Trek de environment variables lokaal binnen:
   ```bash
   vercel env pull .env.local
   ```

## 3. Runnen

```bash
npm run dev
```

Open:
- `http://localhost:3000` voor claim pagina
- `http://localhost:3000/admin` voor admin portal

Als `ADMIN_SECRET` is ingesteld:
- `http://localhost:3000/admin?key=jouw_admin_secret`

## Hoe het werkt

- Claims worden opgeslagen in tabel `username_claims`.
- `username` is uniek (kan maar 1 keer geclaimd worden).
- De tabel wordt automatisch aangemaakt bij de eerste request.
