import { supabaseUrl } from "@/lib/env";

export const MEDIA_BUCKET = "media";

/** Public URL of a file in the `media` storage bucket. */
export function mediaPublicUrl(path: string): string {
  const safe = path.split("/").map(encodeURIComponent).join("/");
  return `${supabaseUrl}/storage/v1/object/public/${MEDIA_BUCKET}/${safe}`;
}
