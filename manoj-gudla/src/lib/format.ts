import type { CreatorStat, DevStatus, EnquiryCategory, Platform, VisionArea } from "@/lib/types";

export const devStatusLabel: Record<DevStatus, string> = {
  idea: "Idea stage",
  in_development: "In development",
  live: "Live",
  paused: "Paused",
  archived: "Archived",
};

export const platformLabel: Record<Platform, string> = {
  youtube: "YouTube",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  other: "Other",
};

export const enquiryCategoryLabel: Record<EnquiryCategory, string> = {
  career: "Career opportunity",
  partnership: "Business partnership",
  brand: "Brand collaboration",
  project: "Project enquiry",
  general: "General conversation",
};

export const visionAreaLabel: Record<VisionArea, string> = {
  technologies: "Technologies to explore",
  products: "Products to build",
  business: "Business ideas",
  skills: "Skills to master",
  opportunities: "Opportunities ahead",
  ambitions: "Long-term ambitions",
};

/** 10000 → "10K", 1250000 → "1.3M". */
export function compactNumber(n: number): string {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

export function statValue(s: CreatorStat): string {
  return compactNumber(s.value) + (s.value_suffix ?? "");
}

export function formatDate(iso: string | null | undefined, opts: Intl.DateTimeFormatOptions = { month: "short", year: "numeric" }): string {
  if (!iso) return "";
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", { ...opts, timeZone: "UTC" }).format(d);
}

export function dateRange(start: string, end: string, current: boolean): string {
  const to = current ? "Present" : end;
  if (start && to) return `${start} – ${to}`;
  return start || to || "";
}

/** Extracts a YouTube video ID from the common URL shapes. */
export function youtubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1).split("/")[0] || null;
    if (u.hostname.endsWith("youtube.com")) {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      const m = u.pathname.match(/^\/(shorts|embed|live)\/([\w-]{6,})/);
      if (m) return m[2];
    }
  } catch {
    /* not a URL */
  }
  return null;
}

export function paragraphs(text: string): string[] {
  return text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}
