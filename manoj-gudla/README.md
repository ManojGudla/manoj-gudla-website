# Manoj Kumar Gudla — personal brand website + admin dashboard

A personal website (9 public pages) and a private dashboard at `/admin` for editing everything on it. Both read and write the same Supabase database, so a change saved in the dashboard is live on the website within seconds.

**Stack:** Next.js 15 (App Router) + TypeScript · Supabase (PostgreSQL database, Auth, Storage) · deployed on Vercel. No CSS framework, no UI kit. Three.js is used once, for the hero object on desktop.

## Start here

| You want to… | Read |
| --- | --- |
| Put the site online for the first time | [docs/SETUP.md](docs/SETUP.md) |
| Edit content, upload photos, answer enquiries | [docs/ADMIN-GUIDE.md](docs/ADMIN-GUIDE.md) |
| Connect your new domain | [docs/SETUP.md → Connect your domain](docs/SETUP.md#7-connect-your-domain) |
| See what was tested and how | [docs/TESTING.md](docs/TESTING.md) |

## Run it on your computer

```bash
npm install
cp .env.example .env.local      # then fill in the values (see docs/SETUP.md)
npm run dev                     # http://localhost:3000
```

Without Supabase values the public site still runs, using the starting content in `src/content/seed.ts`, and `/admin` shows setup instructions instead of a login.

## Pages

| Public | Path |
| --- | --- |
| Home | `/` |
| About | `/about` |
| Professional journey (experience, education, skills, résumé) | `/journey` |
| Projects and project detail pages | `/projects`, `/projects/<slug>` |
| Creator hub | `/creator` |
| Achievements and recognition | `/achievements` |
| Beyond work | `/beyond` |
| Vision and ambitions | `/vision` |
| Contact and collaborations | `/contact` |

The main menu shows About, Journey, Projects, Creator and Contact. Achievements, Beyond Work and Vision are linked from those pages and the footer.

Dashboard modules (all at `/admin`): Overview · Enquiries · Profile · Projects (with screenshots) · Achievements · Creator content · Audience statistics · Experience · Education · Skills · Certifications · Interests · Gallery · Vision & goals · Media library · Settings. Every content item has Draft / Preview / Publish / Unpublish / Update / Delete and can be reordered.

## How it fits together

```
src/
  app/(site)/        public pages (rendered from the database, refreshed on every save)
  app/admin/         dashboard pages — every one checks admin rights on the server
  app/api/contact    contact form endpoint (validation, spam checks, rate limits)
  app/api/preview    turns "preview drafts" on/off for signed-in admins
  components/site    public UI (header, hero 3D scene, blocks, contact form)
  components/admin   dashboard UI (forms, media picker, uploader, library)
  lib/data           one loader for all public content (+ draft preview)
  lib/admin          collection definitions, validation, server actions
  lib/supabase       database clients (visitor, admin session, server-only service)
  content/seed.ts    starting content — also generates supabase/seed.sql
supabase/
  migrations/        database tables, access rules (Row-Level Security), storage rules
  seed.sql           starting content (generated: npm run db:seed-sql)
tests/
  db/                access-control tests that run against PostgreSQL
  e2e/               browser tests for the site and dashboard
```

**Security in short:** passwords are handled by Supabase Auth (hashed, never seen by this code). Every dashboard page and every save re-checks that the signed-in user is listed in `admin_users`. Underneath that, the database itself refuses drafts and private enquiries to visitors (Row-Level Security), so even a bug in the app can't leak them. Uploads are type-checked by their bytes, resized, converted to WebP and stripped of location data. The contact form checks origin, a hidden honeypot field, fill time and rate limits (per visitor and in the database), with optional Cloudflare Turnstile.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run lint` / `npm run typecheck` | Code checks |
| `npm run db:seed-sql` | Regenerate `supabase/seed.sql` from `src/content/seed.ts` |
| `scripts/test-db.sh` | Database access-control tests (needs a local PostgreSQL) |
| `tests/e2e/run.sh` | Full browser test run (needs PostgreSQL, Chrome, Python Playwright) |

Fonts: Geist (SIL Open Font License) and Newsreader (SIL Open Font License), self-hosted from `src/app/fonts`.
