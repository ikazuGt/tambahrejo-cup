# TAMBAHREJO CUP

Football tournament management web app — sistem gugur (knockout) untuk **TAMBAHREJO CUP BY ZAY.AGENCY**.

- Public guest view: jadwal, hasil, bracket, tim, statistik, detail pertandingan, profil pemain
- Admin view: kelola tim/pemain/wasit, bracket interaktif (klik untuk edit), auto-advance pemenang, livestream URL
- Live broadcast section di beranda dengan score auto-refresh tiap 30s
- Bottom navigation untuk mobile

## Stack

Next.js 15 App Router (RSC) · TypeScript · Postgres + Drizzle ORM · Auth.js v5 · Tailwind CSS v4

## Local development

You need **Postgres**. Easiest options:

1. **Neon free tier** (recommended) — sign up at https://neon.tech, copy your connection string
2. Local Postgres via Docker: `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:17`

```bash
pnpm install

# Copy env and set DATABASE_URL to your Postgres connection string
cp .env.example .env
# Edit .env: set DATABASE_URL, AUTH_SECRET

pnpm db:migrate
pnpm db:seed     # 16 teams, players, sample R16 matches

pnpm dev
```

Default admin login: `admin` / `admin123` (override via env vars).

## Deploy to production

See **[DEPLOY.md](./DEPLOY.md)** for step-by-step Vercel + Neon deployment.

Total: 20 minutes, free tier, URL = `tambahrejo-cup.vercel.app`.
