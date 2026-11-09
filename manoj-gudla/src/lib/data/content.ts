import "server-only";
import { draftMode } from "next/headers";
import { cache } from "react";
import * as seed from "@/content/seed";
import { getAdmin } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { mediaPublicUrl } from "@/lib/media-url";
import { createPublicClient, createSessionClient } from "@/lib/supabase/server";
import type { MediaAsset, ResolvedMedia, SiteContent } from "@/lib/types";

/** Tables the public site reads, with how each is ordered. */
const LISTS = [
  ["experience", "experience"],
  ["education", "education"],
  ["skills", "skills"],
  ["certifications", "certifications"],
  ["projects", "projects"],
  ["creatorContent", "creator_content"],
  ["creatorStats", "creator_stats"],
  ["achievements", "achievements"],
  ["gallery", "gallery_items"],
  ["interests", "interests"],
  ["vision", "vision_items"],
] as const;

function seedContent(): SiteContent {
  const pub = <T extends { status: string }>(rows: T[]) => rows.filter((r) => r.status === "published");
  return {
    profile: seed.seedProfile,
    settings: seed.seedSettings,
    experience: pub(seed.seedExperience),
    education: pub(seed.seedEducation),
    skills: pub(seed.seedSkills),
    certifications: pub(seed.seedCertifications),
    projects: pub(seed.seedProjects),
    projectImages: seed.seedProjectImages,
    creatorContent: pub(seed.seedCreatorContent),
    creatorStats: pub(seed.seedCreatorStats),
    achievements: pub(seed.seedAchievements),
    gallery: pub(seed.seedGallery),
    interests: pub(seed.seedInterests),
    vision: pub(seed.seedVision),
    media: {},
    source: "seed",
    preview: false,
  };
}

/**
 * Loads all public content in parallel. In preview mode (admin only) drafts
 * are included; otherwise only published rows are requested — and RLS in
 * the database refuses drafts to anonymous visitors regardless.
 */
export const getSiteContent = cache(async (): Promise<SiteContent> => {
  if (!isSupabaseConfigured) return seedContent();

  // draftMode() is unavailable at build time (e.g. generateStaticParams) — treat as not previewing.
  let draft = false;
  try {
    draft = (await draftMode()).isEnabled;
  } catch {
    draft = false;
  }
  const preview = draft && (await getAdmin()) !== null;
  const db = preview ? await createSessionClient() : createPublicClient();

  const listQueries = LISTS.map(([, table]) => {
    let q = db.from(table).select("*").order("sort_order").order("created_at");
    if (!preview) q = q.eq("status", "published");
    return q;
  });

  const [profileRes, settingsRes, imagesRes, mediaRes, ...lists] = await Promise.all([
    db.from("profile").select("*").eq("id", 1).single(),
    db.from("site_settings").select("*").eq("id", 1).single(),
    db.from("project_images").select("*").order("sort_order"),
    db.from("media_assets").select("id, storage_path, alt_text, width, height, mime_type"),
    ...listQueries,
  ]);

  const failed = [profileRes, settingsRes, imagesRes, mediaRes, ...lists].find((r) => r.error);
  if (failed?.error) {
    // Throwing keeps the last successfully generated page live (ISR) instead
    // of publishing an empty or wrong page.
    throw new Error(`Content query failed: ${failed.error.message}`);
  }

  const media: Record<string, ResolvedMedia> = {};
  for (const m of (mediaRes.data ?? []) as Pick<
    MediaAsset,
    "id" | "storage_path" | "alt_text" | "width" | "height" | "mime_type"
  >[]) {
    media[m.id] = {
      id: m.id,
      url: mediaPublicUrl(m.storage_path),
      alt: m.alt_text,
      width: m.width,
      height: m.height,
      mime: m.mime_type,
    };
  }

  const out = {
    profile: profileRes.data,
    settings: settingsRes.data,
    projectImages: imagesRes.data ?? [],
    media,
    source: "database",
    preview,
  } as Record<string, unknown>;
  LISTS.forEach(([key], i) => {
    out[key] = lists[i].data ?? [];
  });
  return out as unknown as SiteContent;
});

export function resolveMedia(content: SiteContent, id: string | null | undefined): ResolvedMedia | null {
  if (!id) return null;
  return content.media[id] ?? null;
}
