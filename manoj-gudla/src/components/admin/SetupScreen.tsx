import Link from "next/link";
export function SetupScreen() {
  return (
    <main className="setup">
      <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "2.2rem" }}>Connect the database to use the dashboard</h1>
      <p className="muted" style={{ marginTop: "0.75rem" }}>
        The website is running on its starting content. The dashboard needs Supabase for sign-in, content and uploads. This takes about
        15 minutes, once.
      </p>
      <ol style={{ marginTop: "1.5rem" }}>
        <li>Create a free project at supabase.com.</li>
        <li>
          In its SQL editor, run <code>supabase/migrations/0001_schema.sql</code>, then <code>0002_storage.sql</code>, then{" "}
          <code>supabase/seed.sql</code>.
        </li>
        <li>
          Copy <code>.env.example</code> to <code>.env.local</code> and fill in the Supabase URL, anon key, service role key and a random{" "}
          <code>IP_HASH_SALT</code>.
        </li>
        <li>Create your admin user and grant it access — the exact steps are in <code>docs/SETUP.md</code>.</li>
        <li>Restart the site and sign in at /admin.</li>
      </ol>
      <p style={{ marginTop: "1.5rem" }}>
        <Link className="text-link" href="/">
          Back to the website
        </Link>
      </p>
    </main>
  );
}
