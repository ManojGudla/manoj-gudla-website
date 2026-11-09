# Setup and deployment

Plain-English steps, in order. You need free accounts on **Supabase** (database, login and file storage) and **Vercel** (hosting), and the code on **GitHub**. Total time: about 30–45 minutes.

Abbreviations used here: **URL** = web address · **SQL** = the language databases use · **DNS** = the system that points a domain name at a server · **env var** (environment variable) = a setting the hosting gives the app, kept out of the code.

---

## 1. Create the Supabase project

1. Go to supabase.com → **New project**. Pick a region close to your visitors (e.g. Mumbai), set a strong database password and save it in your password manager.
2. Wait for the project to finish setting up.

## 2. Create the database

In Supabase → **SQL Editor** → **New query**, paste and **Run** each file below, one at a time, in this order:

1. `supabase/migrations/0001_schema.sql` — creates all tables and the access rules.
2. `supabase/migrations/0002_storage.sql` — creates the two file buckets (`media`, public; `incoming`, private) and their rules.
3. `supabase/seed.sql` — adds your starting content (profile, TCS role, education, skills, certifications, maNOWj GeoIntel, highlights, interests, vision).

Each should finish with "Success. No rows returned". Running `seed.sql` again later never overwrites what you've edited.

## 3. Turn off public sign-ups

The dashboard has no sign-up page, but Supabase should also refuse new accounts:

Supabase → **Authentication** → **Sign In / Providers** → **Email** → turn **off** "Allow new users to sign up". Keep "Confirm email" on.

## 4. Create your admin account

1. Supabase → **Authentication** → **Users** → **Add user** → **Create new user**. Enter your email and a long password (16+ characters). Tick **Auto Confirm User**.
2. SQL Editor → run this, with your email:

```sql
insert into public.admin_users (user_id, role)
select id, 'owner' from auth.users where email = 'manowj.tech@gmail.com';
```

Only accounts listed in `admin_users` can open the dashboard. There is no password stored anywhere in this code.

To remove someone's access later: `delete from public.admin_users where user_id = (select id from auth.users where email = '...');`

## 5. Collect your settings (env vars)

From Supabase → **Project Settings** → **API**:

| Setting | Where it comes from | Secret? |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL | No — the browser needs it |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` `public` key | No — safe by design; the database rules protect your data |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key | **Yes.** Only used on the server to store contact messages. Never paste it anywhere public |
| `IP_HASH_SALT` | Make one: `openssl rand -hex 32`, or any 40+ random characters | Yes |
| `NEXT_PUBLIC_SITE_URL` | Your site address, no trailing slash | No |

Optional:

| Setting | What it adds |
| --- | --- |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile spam check on the contact form (free: dash.cloudflare.com → Turnstile → Add site) |
| `RESEND_API_KEY` + `ENQUIRY_NOTIFY_TO` + `ENQUIRY_NOTIFY_FROM` | An email to you for each new enquiry (free tier at resend.com). Without it, enquiries still arrive in the dashboard |

For running on your own computer, copy `.env.example` to `.env.local` and fill these in.

## 6. Deploy on Vercel

1. Push this project to a **new** GitHub repository (keep it separate from GeoIntel).
2. vercel.com → **Add New** → **Project** → import that repository. Framework: Next.js (detected automatically).
3. Before clicking Deploy, open **Environment Variables** and add everything from step 5. For now set `NEXT_PUBLIC_SITE_URL` to the address Vercel gives you, e.g. `https://manoj-gudla.vercel.app`.
4. **Deploy.** When it finishes, open the site, then go to `/admin` and sign in.
5. In Supabase → **Authentication** → **URL Configuration**, set **Site URL** to the same address.

If the build fails with "Content query failed", the SQL in step 2 hasn't been run on this Supabase project.

## 7. Connect your domain

Do this after you buy the domain. Nothing in the code needs to change.

1. Vercel → your project → **Settings** → **Domains** → add `yourdomain.com` and `www.yourdomain.com`.
2. Vercel shows the DNS records to add. At your domain registrar (GoDaddy, Namecheap, Hostinger…), add exactly those records — usually an **A** record for `@` and a **CNAME** for `www`. They can take from a few minutes to a few hours to start working.
3. Vercel → **Settings** → **Environment Variables** → change `NEXT_PUBLIC_SITE_URL` to `https://yourdomain.com` → **Redeploy** (Deployments → ⋯ → Redeploy). This updates search-engine links, the sitemap and social-sharing previews.
4. Supabase → **Authentication** → **URL Configuration** → set **Site URL** to `https://yourdomain.com`.
5. Optional but recommended: Google Search Console → add the domain → submit `https://yourdomain.com/sitemap.xml`.

## 8. First things to do in the dashboard

See [ADMIN-GUIDE.md](ADMIN-GUIDE.md). The Overview page lists what's missing (portrait, résumé, drafts to review).

---

## Updating the code later

Push to GitHub — Vercel redeploys automatically. If a future change adds a database migration file, run it in the SQL Editor first.

## Backups

Supabase → **Database** → **Backups**. The free plan keeps daily backups for a limited time; for anything you can't lose (like enquiries), export occasionally from **Table Editor** → table → **Export to CSV**.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `/admin` shows "Connect the database" | The Supabase env vars are missing or wrong on Vercel. Fix them and redeploy |
| "This account doesn't have access" | Run the SQL in step 4 for that email |
| "Email or password is incorrect" | Reset the password in Supabase → Authentication → Users → ⋯ → Send password recovery |
| Contact form says it isn't connected | `SUPABASE_SERVICE_ROLE_KEY` is missing on Vercel |
| Uploaded images don't show on the site | Re-run `0002_storage.sql`; check `NEXT_PUBLIC_SUPABASE_URL` matches the project |
| A change doesn't appear on the site | Hard-refresh the page. Saves refresh the site immediately; anything else refreshes within 5 minutes |
