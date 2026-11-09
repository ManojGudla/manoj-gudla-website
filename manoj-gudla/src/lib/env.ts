/** Central place for environment configuration. */

function clean(url: string | undefined): string {
  return (url ?? "").trim().replace(/\/+$/, "");
}

export const siteUrl = clean(process.env.NEXT_PUBLIC_SITE_URL) || "http://localhost:3000";

export const supabaseUrl = clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
export const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

/** https everywhere, plus plain http for a local Supabase (`supabase start` runs on 127.0.0.1:54321). */
export function isValidSupabaseUrl(url: string): boolean {
  return /^https:\/\/.+/.test(url) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(url);
}

/** True when the public Supabase settings look real (not the example placeholders). */
export const isSupabaseConfigured =
  isValidSupabaseUrl(supabaseUrl) && !supabaseUrl.includes("YOUR-PROJECT-REF") && supabaseAnonKey.length > 20;

export const turnstileSiteKey = (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "").trim();
