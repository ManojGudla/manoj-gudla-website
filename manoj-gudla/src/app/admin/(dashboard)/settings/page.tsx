import { ItemForm } from "@/components/admin/ItemForm";
import { saveSettings } from "@/lib/admin/actions/singletons";
import { selectedMediaFor } from "@/lib/admin/media-map";
import { settingsFields, socialFields } from "@/lib/admin/singletons";
import { requireAdmin } from "@/lib/auth";
import { siteUrl } from "@/lib/env";
import { createSessionClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireAdmin();
  const db = await createSessionClient();
  const [{ data: s }, { data: p }] = await Promise.all([
    db.from("site_settings").select("*").eq("id", 1).single(),
    db.from("profile").select("linkedin_url, instagram_url, youtube_url, github_url").eq("id", 1).single(),
  ]);
  const row = { ...(s ?? {}), ...(p ?? {}) } as Record<string, unknown>;
  const fields = [...settingsFields, ...socialFields];
  const media = await selectedMediaFor(db, fields, row);
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Settings</h1>
          <p>
            Search, sharing and site-wide options. The website address is set by the <code>NEXT_PUBLIC_SITE_URL</code> setting in your
            hosting — currently <strong>{siteUrl}</strong>.
          </p>
        </div>
      </div>
      <ItemForm action={saveSettings} fields={fields} values={row} media={media} />
    </>
  );
}
