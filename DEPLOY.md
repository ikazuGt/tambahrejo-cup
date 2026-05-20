# Deploy: Vercel + Neon Postgres

Total time: ~20 minutes. Cost: free.

## 1. Create Neon Postgres (3 min)

1. Go to https://neon.tech and sign up (use GitHub login)
2. Click **Create Project**
   - Project name: `tambahrejo-cup`
   - Region: **Singapore** (closest to Indonesia)
   - Postgres version: latest (17)
3. After creation, you'll see a **Connection String**. Copy the **pooled connection** that looks like:
   ```
   postgresql://neondb_owner:xxxxx@ep-xxxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Save this — you'll paste it as `DATABASE_URL` later.

## 2. Push your code to GitHub (5 min)

```bash
cd D:\Projects\football-project
git init
git add .
git commit -m "Initial commit: Tambahrejo Cup"
```

Create a new repo on GitHub named `tambahrejo-cup`, then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/tambahrejo-cup.git
git branch -M main
git push -u origin main
```

## 3. Deploy on Vercel (5 min)

1. Go to https://vercel.com and sign up (use GitHub login)
2. Click **Add New** → **Project**
3. Import your `tambahrejo-cup` GitHub repo
4. **Project name**: `tambahrejo-cup` (this becomes `tambahrejo-cup.vercel.app`)
5. **Framework Preset**: Next.js (auto-detected)
6. **Build Settings**: leave defaults
7. **Environment Variables** — add these:

| Name | Value |
| --- | --- |
| `DATABASE_URL` | (paste your Neon pooled connection string) |
| `AUTH_SECRET` | (generate: `openssl rand -base64 32` or use a long random string) |
| `NEXTAUTH_URL` | `https://tambahrejo-cup.vercel.app` |
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD` | (your strong password) |

8. Click **Deploy**

Vercel will build and deploy. First build takes ~2 minutes. You'll get a live URL: `https://tambahrejo-cup.vercel.app`.

## 4. Initialize the database (3 min)

After the first deploy succeeds, run the migrations and seed locally with the production DATABASE_URL:

```bash
# Set DATABASE_URL temporarily to your Neon URL
$env:DATABASE_URL="postgresql://neondb_owner:xxxxx@ep-xxxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
$env:ADMIN_USERNAME="admin"
$env:ADMIN_PASSWORD="your-password-here"

# Apply schema to Neon
pnpm db:migrate

# Seed sample data (16 teams, players, R16 matches)
pnpm db:seed
```

If you don't want sample data, just run `pnpm db:migrate` and skip the seed.

## 5. Visit your site

- Public site: https://tambahrejo-cup.vercel.app
- Admin login: https://tambahrejo-cup.vercel.app/admin/login

Use the `ADMIN_USERNAME` / `ADMIN_PASSWORD` you set in Vercel env vars.

## 6. Auto-deploy on git push

Every time you `git push` to main, Vercel auto-deploys the new version. Branches get preview URLs.

## Custom domain (optional)

If you buy a domain like `tambahrejocup.com`:

1. Go to your Vercel project → **Settings** → **Domains**
2. Add the domain
3. Vercel shows DNS records to add at your registrar
4. Update `NEXTAUTH_URL` env var to match the new domain
5. Redeploy

## Troubleshooting

- **Build fails with "DATABASE_URL not set"**: env var is missing in Vercel settings.
- **Login redirects in a loop**: `NEXTAUTH_URL` is wrong, must match the actual domain (with `https://`).
- **Database empty / 500 errors after deploy**: you forgot to run `pnpm db:migrate`. Run it locally with the production `DATABASE_URL`.
- **Slow first request**: Neon free tier sleeps after inactivity. First request wakes it up (~1 second cold start).

## Costs

- **Vercel Hobby**: free, unlimited deploys, 100 GB bandwidth/month
- **Neon Free Tier**: 0.5 GB storage, 191 compute hours/month (auto-sleeps when idle)

For tournament traffic (a few hundred users), this stays free indefinitely.
