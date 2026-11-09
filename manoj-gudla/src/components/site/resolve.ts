import type { ResolvedMedia, SiteContent } from "@/lib/types";

export function resolveMediaFrom(content: SiteContent, id: string | null | undefined): ResolvedMedia | null {
  if (!id) return null;
  return content.media[id] ?? null;
}
