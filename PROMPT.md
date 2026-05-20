# TAMBAHREJO CUP — Vibe Coding Brief

Football tournament management web app for **TAMBAHREJO CUP BY ZAY.AGENCY**.
Two surfaces: public Guest view and authenticated Admin view.
Self-hosted on a VPS, fronted by Cloudflare Tunnel.

---

## 1. Tech Stack

**Framework**
- Next.js 15 (App Router, React Server Components)
- TypeScript, strict mode
- Static rendering / ISR for all guest pages, revalidate on admin write
- Server Actions for admin mutations

**Database & ORM**
- MySQL 8 (localhost on VPS)
- `mysql2` driver
- Drizzle ORM with `drizzle-kit` migrations
- Connection via `127.0.0.1:3306` or unix socket

**Auth**
- Auth.js (NextAuth v5) credentials provider
- Single admin role, bcrypt-hashed password seeded from `.env`
- Middleware protects `/admin/*`

**UI**
- Tailwind CSS v4
- shadcn/ui ONLY inside `/admin/*` (Dialog, Form, Table, Select)
- Guest pages: hand-rolled components, zero JS where possible
- `next/image` with AVIF, explicit `sizes`, blur placeholder
- Inter font via `next/font` (self-hosted, no external request)
- `tabular-nums` for all scores and times

**Validation**
- Zod schemas shared between server actions and forms

**Media handling**
- Photos: stored under `/var/app/uploads`, served via a Next.js route handler with `Cache-Control: public, max-age=31536000, immutable`
- Videos: paste YouTube / external URL only, never host
- Image processing on upload via `sharp` (resize to max 1600px, convert to AVIF + JPEG fallback)

**Process & deploy**
- `pnpm` package manager
- `pnpm build && pnpm start` under `systemd`
- Logs via `journalctl`

---

## 2. Visual System (anti-AI-look)

- No gradients. No glassmorphism. No purple-pink accents.
- Reference aesthetic: LiveScore, FBref, BBC Sport — editorial, dense, confident.
- Light: bg `#ffffff`, text `#0a0a0a`, border `#e5e5e5`
- Dark: bg `#0a0a0a`, text `#fafafa`, border `#262626`
- Single brand color: deep green `#15803d` (pick one, no secondary brand)
- Status colors: yellow `#eab308` (kuning), red `#dc2626` (merah/LIVE)
- Corners: 4px radius. Borders: 1px solid. Shadows: only on modals.
- LIVE badge: small red dot + text "LIVE", no pulse animation.
- Typography: Inter, 16px base, tight tracking on numerals.

---

## 3. Data Model (Drizzle, MySQL)

```
Tournament      id, name, season, logoUrl
Team            id, name, origin, managerName, logoUrl, teamPhotoUrl
Player          id, teamId, name, jerseyNumber, position
Referee         id, name, role enum(CENTER, LINESMAN)
Match           id, round enum(GROUP_W1, GROUP_W2, R16, QF, SF, FINAL),
                groupName?, homeTeamId, awayTeamId, kickoffAt, venue,
                status enum(SCHEDULED, LIVE, FINISHED, POSTPONED),
                homeScore?, awayScore?,
                centerRefereeId, linesman1Id, linesman2Id,
                motmPlayerId?, highlightVideoUrl?
MatchPhoto      id, matchId, url, caption
GoalEvent       id, matchId, playerId, teamId, minute, type enum(GOAL, OWN_GOAL, PENALTY)
CardEvent       id, matchId, playerId, teamId, minute, type enum(YELLOW, RED)
AdminUser       id, username, passwordHash
```

Indexes: `Match(kickoffAt)`, `Match(status)`, `GoalEvent(playerId)`, `CardEvent(playerId)`.

---

## 4. Routes

**Guest (no auth, ISR + Cloudflare cache)**
- `/` Hero, next match countdown, latest results strip, top 3 scorers
- `/jadwal` Fixtures grouped by round and date, filter by round
- `/hasil` Finished matches, newest first
- `/pertandingan/[id]` Scoreboard, events timeline, MOTM, referees, photos, video
- `/klasemen` Group standings (Pld W D L GF GA GD Pts)
- `/bracket` SVG knockout bracket R16 → Final
- `/tim` Team list with logo + origin
- `/tim/[id]` Manager, full squad, played matches
- `/statistik` Top scorers, card receivers, MOTM list

**Admin (auth required)**
- `/admin/login`
- `/admin` Dashboard counters
- `/admin/teams` CRUD teams + nested players
- `/admin/referees` CRUD referees
- `/admin/matches` List + create matches, assign referees, set kickoff
- `/admin/matches/[id]` Score input, event log entry, MOTM, photo upload, video URL
- `/admin/bracket` Set R16 / QF / SF / Final pairings

---

## 5. Performance Targets

- Lighthouse Performance ≥ 95 on `/`, `/jadwal`, `/hasil`, `/pertandingan/[id]`
- LCP < 1.5s on simulated 3G
- TTFB < 200ms from Cloudflare edge after first warm
- Total JS on guest list pages ≤ 30KB gzipped
- Zero layout shift on score updates

Techniques:
- RSC for everything guest-facing, no client components except small islands
- `export const revalidate = 60` on guest pages
- `revalidatePath()` + Cloudflare cache purge after admin writes
- Streaming responses where useful
- No animation libraries
- Self-host fonts, no Google Fonts request

---

## 6. Deployment (VPS + Cloudflare Tunnel)

**VPS setup**
- Ubuntu 22.04 LTS, 1 vCPU / 2GB RAM is enough
- Node.js 20 LTS via `nvm` or NodeSource
- MySQL 8 from official apt repo
- `pnpm` global
- App lives at `/var/app/tambahrejo-cup`
- Uploads at `/var/app/uploads`

**systemd unit** (`/etc/systemd/system/tambahrejo.service`)

```ini
[Unit]
Description=Tambahrejo Cup Web
After=network.target mysql.service

[Service]
Type=simple
User=app
WorkingDirectory=/var/app/tambahrejo-cup
EnvironmentFile=/var/app/tambahrejo-cup/.env.production
ExecStart=/usr/bin/pnpm start
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

**Cloudflare Tunnel**
- Install `cloudflared`, authenticate, create tunnel `tambahrejo-cup`
- Route `tambahrejocup.example.com` → `http://localhost:3000`
- Run `cloudflared` as a systemd service

**Cloudflare cache rules**
- Path matches `/jadwal`, `/hasil`, `/klasemen`, `/tim*`, `/statistik`, `/pertandingan/*`
  → Cache eligibility: Eligible, Edge TTL: 60 seconds, Browser TTL: 30 seconds
- Path matches `/uploads/*`
  → Edge TTL: 1 month, Browser TTL: 1 week
- Path matches `/admin/*` and `/api/*`
  → Bypass cache
- After admin write, server action calls Cloudflare Purge API for affected paths

**Backups**
- Cron `0 2 * * *` runs `mysqldump` to `/var/backups/tambahrejo-YYYYMMDD.sql.gz`
- Cron `0 3 * * *` rsyncs `/var/app/uploads` and `/var/backups` to off-site (R2 or Drive)
- Keep 14 daily backups

**Env vars** (`.env.production`)

```env
DATABASE_URL=mysql://app:password@127.0.0.1:3306/tambahrejo
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://tambahrejocup.example.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=...
UPLOAD_DIR=/var/app/uploads
CLOUDFLARE_ZONE_ID=...
CLOUDFLARE_API_TOKEN=...
```

---

## 7. Vibe Coding Prompt (paste this to your agent)

```
Build a production web app: TAMBAHREJO CUP BY ZAY.AGENCY — football tournament 
management. Two surfaces: public Guest view (Bahasa Indonesia UI) and authenticated 
Admin view. Self-hosted on a VPS behind Cloudflare Tunnel.

NON-NEGOTIABLES
- Performance first. Lighthouse Performance >= 95 on guest pages. LCP < 1.5s on 3G.
- Anti-AI visual: NO gradients, NO glassmorphism, NO purple-pink. Editorial sports-news 
  aesthetic like LiveScore, FBref, BBC Sport. Solid colors, sharp 1px borders, 4px 
  radius, generous whitespace, dense data tables, tabular numerals.
- Mobile-first. Indonesian UI labels, English code identifiers.

TECH STACK
- Next.js 15 App Router, TypeScript strict, React Server Components
- MySQL 8 on localhost via mysql2 driver, Drizzle ORM, drizzle-kit migrations
- Auth.js v5 credentials, single admin from env-seeded bcrypt hash, middleware on /admin
- Tailwind CSS v4. shadcn/ui ONLY inside /admin (Dialog, Form, Table, Select)
- Guest pages: hand-rolled, RSC, near-zero client JS
- next/image AVIF, self-hosted Inter via next/font, no Google Fonts request
- Zod for validation
- sharp for upload resize, write to /var/app/uploads, serve via route handler with 
  immutable cache headers
- Server Actions for admin mutations, revalidatePath after each write, plus call 
  Cloudflare Purge API for affected paths

COLOR SYSTEM
- Light: bg #ffffff, text #0a0a0a, border #e5e5e5
- Dark: bg #0a0a0a, text #fafafa, border #262626
- Brand: #15803d (deep green) — single color, no secondary brand
- Yellow card #eab308, red card / LIVE #dc2626

DATA MODEL (Drizzle, MySQL)
Tournament(id, name default "TAMBAHREJO CUP BY ZAY.AGENCY", season, logoUrl)
Team(id, name, origin, managerName, logoUrl, teamPhotoUrl)
Player(id, teamId, name, jerseyNumber, position)
Referee(id, name, role: CENTER|LINESMAN)
Match(id, round: GROUP_W1|GROUP_W2|R16|QF|SF|FINAL, groupName?, homeTeamId, awayTeamId,
      kickoffAt, venue, status: SCHEDULED|LIVE|FINISHED|POSTPONED, homeScore?, awayScore?,
      centerRefereeId, linesman1Id, linesman2Id, motmPlayerId?, highlightVideoUrl?)
MatchPhoto(id, matchId, url, caption)
GoalEvent(id, matchId, playerId, teamId, minute, type: GOAL|OWN_GOAL|PENALTY)
CardEvent(id, matchId, playerId, teamId, minute, type: YELLOW|RED)
AdminUser(id, username, passwordHash)
Indexes: Match.kickoffAt, Match.status, GoalEvent.playerId, CardEvent.playerId.

GUEST ROUTES
/             hero, next match countdown, latest results strip, top 3 scorers
/jadwal       fixtures grouped by round and date, filter by round
/hasil        finished matches newest first
/pertandingan/[id]  scoreboard, vertical events timeline (minute rail, goal/card 
              icons), MOTM hero card, referees, photo gallery, embedded video iframe
/klasemen     group standings Pld W D L GF GA GD Pts
/bracket      SVG knockout bracket R16 -> Final
/tim          team list with logo + origin
/tim/[id]     team detail: manager, full squad with jersey numbers, played matches
/statistik    top scorers (tie-break by fewer minutes), card receivers, MOTM list

ADMIN ROUTES (auth required)
/admin/login
/admin                  dashboard counters
/admin/teams            CRUD teams + nested players
/admin/referees         CRUD referees
/admin/matches          list + create matches, assign 3 referees, set kickoff
/admin/matches/[id]     score input, event entry (minute + type + player picker scoped 
                        to the two squads), MOTM picker, photo upload, video URL field
/admin/bracket          form to set R16/QF/SF/Final pairings

UX DETAILS
- Fixtures row: [Time] [HomeLogo Home] [Score or "vs"] [Away AwayLogo] [Status badge]
- Sticky date headers grouping matches by day
- Match timeline: minute on the left rail, goal icon, yellow/red card icons, scorer 
  name + jersey number + team
- Admin event entry form is single, fast, keyboard friendly: minute number input, 
  event type radio, player select scoped to home + away squads only, submit
- Optimistic updates in admin, revalidatePath('/pertandingan/[id]','/statistik','/hasil')

DEPLOYMENT
- Self-hosted on Ubuntu VPS, exposed via Cloudflare Tunnel
- pnpm build && pnpm start under systemd unit "tambahrejo.service"
- MySQL on 127.0.0.1:3306
- Provide Cloudflare cache rules: 60s edge TTL on guest paths, 1 month on /uploads/*, 
  bypass on /admin/* and /api/*
- After admin write, server action calls Cloudflare Purge API using 
  CLOUDFLARE_ZONE_ID and CLOUDFLARE_API_TOKEN env vars
- Daily mysqldump cron, rsync uploads off-site

DELIVERABLES
1. Working repo, `pnpm dev` runs against local MySQL
2. Drizzle schema + migrations + seed script: 8 sample teams with players, 
   one full week of group fixtures, one finished match with goals/cards/MOTM/photos 
   to demo the detail page
3. README with: VPS setup steps, MySQL setup, env vars, systemd unit, cloudflared 
   tunnel config, Cloudflare cache rules, backup cron
4. "TAMBAHREJO CUP BY ZAY.AGENCY" visible in header and footer

DO NOT
- No chatbot, no AI features, no "smart" suggestions
- No framer-motion or page transition libraries
- No external font CDN, no Google Analytics, no third-party trackers
- Do not over-engineer auth, single admin role is the spec
- Do not add features I did not request

START ORDER
1. Scaffold Next.js + Tailwind + Drizzle + Auth.js
2. Define Drizzle schema, generate migration, write seed script. Show me the schema 
   before generating UI.
3. Build /jadwal first (highest traffic), then /pertandingan/[id], then admin match 
   editor, then the rest.
```
