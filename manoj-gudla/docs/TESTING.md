# Testing report

Run on 9 November 2026 against the final code. Every number below comes from an actual run; nothing is estimated.

## Summary

| Check | Result |
| --- | --- |
| Production build (`next build`) | Passes |
| Type check (`tsc --noEmit`, strict mode) | 0 errors |
| Lint (`eslint`, Next.js core-web-vitals rules) | 0 problems |
| Database access-control tests | **41 / 41 pass** |
| End-to-end browser tests | **33 / 33 pass** |
| Accessibility (axe-core, 40 public page variants + 7 dashboard pages) | **0 serious or critical issues** |
| Horizontal overflow at phone width (390 px) | None, on every page |
| Lighthouse — desktop (home / journey) | Performance 99 / 100 · Accessibility 100 · Best practices 100 · SEO 100 |
| Lighthouse — mobile, simulated slow 4G (home / journey) | Performance 89 / 88 · Accessibility 100 · Best practices 100 · SEO 100 |
| Layout shift (CLS) | 0 on all audited pages |
| Production dependency vulnerabilities (`npm audit --omit=dev`) | 0 |

## What "tested" means here — read this

There was no internet access to a real Supabase project during development, so:

- **Database tests** ran the real migration files on a real **PostgreSQL 16** server, with a small stand-in for Supabase's `auth` and `storage` schemas (`tests/db/supabase-stub.sql`). Row-Level Security was exercised as the real `anon`, `authenticated` and `service_role` roles.
- **End-to-end tests** ran the real production build in Google Chrome against a **test-only stand-in** for Supabase's Auth, REST and Storage services (`tests/e2e/fake-supabase.mjs`), backed by that same PostgreSQL database. This exercises all of this app's code — sessions, cookies, server-side admin checks, uploads, RLS — but it is not Supabase itself.

**After you connect your real Supabase project, do this 5-minute check** (it covers the one thing that couldn't be tested here — the real services):

1. Sign in at `/admin` with your admin account. Sign in with a wrong password — it should be refused.
2. Edit your tagline in Profile → Save → refresh the homepage; the change shows.
3. Upload a photo in Media library; it appears in the grid and on the page you attach it to.
4. Send yourself a message from `/contact`; it appears under Enquiries.
5. Sign out; `/admin` sends you to the login page.

## Database tests (`scripts/test-db.sh`) — 41 checks

Visitors (anon): see only published projects, experience and stats; can't see draft project screenshots; can't read enquiries or admin users; can't insert enquiries directly or call the enquiry function; updates and deletes have no effect; can't upload files; can read the public media bucket but not the private incoming bucket.

Signed-in non-admins: not treated as admin; can't see drafts or enquiries; can't create projects; **can't add themselves to `admin_users`**; deletes and reorders have no effect.

Server (service role): enquiry function accepts valid messages; **6th message from the same visitor within an hour is refused**; invalid email and unknown category rejected by the database.

Admins: see drafts and enquiries; create, update, publish, reorder and delete; upload to both buckets. Constraints reject non-https links, malformed project addresses and "verified" figures without a verification date. `updated_at` refreshes on every change.

## End-to-end tests (`tests/e2e/run.sh`) — 33 checks

Public site: all nine pages render from the database; drafts are never shown publicly; no "GIS" text anywhere; unknown pages return 404; unique titles, canonical links, Open Graph tags, Person structured data, sitemap and robots.txt; security headers; theme switch toggles and is remembered; mobile menu opens, closes with Escape and navigates; every internal homepage link resolves; no JavaScript errors.

Contact form: field errors from server validation; bot-speed submissions rejected; valid message stored and confirmed **only after the server confirms**; cross-site (CSRF) posts rejected.

Dashboard: signed-out visitors redirected to login; wrong password refused; non-admin accounts refused; overview counts come from the database; edits appear on the public page immediately; slug and https validation; draft → preview → publish; reorder; delete with confirmation; audience-stat verification rule; skill levels hidden until approved; uploads resized to ≤ 2400 px, converted to WebP and **stripped of GPS data**; a fake ".jpg" containing script text is rejected; profile photo appears on the homepage; enquiry new → read → responded → deleted; SEO title change reaches the site; dashboard usable at phone width; sign-out ends the session; preview can't be enabled without signing in.

## Bugs found by testing and fixed

1. **Dashboard links silently switched on preview mode.** Next.js prefetches visible links, and prefetching the "Preview" link turned preview on in the background, so the admin saw drafts on the public site without asking. Fixed: preview links no longer prefetch, and the preview endpoint ignores prefetch requests.
2. **Missing pages returned status 200 instead of 404** because a loading screen started streaming the page before the "not found" decision. Removed that loading screen; 404s are now real 404s (better for Google).
3. Date fields could lose their value when the database returned a full timestamp; dates are now normalised before display.
4. A patched version of PostCSS is pinned (Next.js 15 bundles an older one with published advisories).

## Not covered

- Real Supabase services, Vercel hosting and your real domain — see the 5-minute check above.
- Cloudflare Turnstile and Resend email are optional and only activate when their keys are set; with no keys they are skipped, which was the tested path.
- Lighthouse mobile scores are lab measurements on a local server; real-world numbers depend on hosting region and the visitor's network.
- Safari and Firefox were not run automatically (Chrome only). The code uses standard features; `:has()` (used for one cosmetic fade) is supported in all current browsers.
