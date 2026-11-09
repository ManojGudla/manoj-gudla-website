import "server-only";
import type { SelectedMedia } from "@/components/admin/MediaPicker";
import { mediaPublicUrl } from "@/lib/media-url";
import type { Field } from "./collections";

type Db = Awaited<ReturnType<typeof import("@/lib/supabase/server").createSessionClient>>;

/** Resolves the media fields of a record to previews for the picker. */
export async function selectedMediaFor(db: Db, fields: Field[], row: Record<string, unknown>) {
  const ids = fields.filter((f) => f.type === "media").map((f) => row[f.name]).filter((v): v is string => typeof v === "string");
  const out: Record<string, SelectedMedia | null> = {};
  if (!ids.length) return out;
  const { data } = await db.from("media_assets").select("id, storage_path, file_name, mime_type").in("id", ids);
  const byId = new Map((data ?? []).map((m) => [m.id, m]));
  for (const f of fields) {
    if (f.type !== "media") continue;
    const m = byId.get(row[f.name] as string);
    out[f.name] = m ? { id: m.id, url: mediaPublicUrl(m.storage_path), file_name: m.file_name, mime_type: m.mime_type } : null;
  }
  return out;
}
