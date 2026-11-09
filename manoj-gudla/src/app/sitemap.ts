import type { MetadataRoute } from "next";
import { CONTACT, MORE, NAV } from "@/components/site/nav";
import { getSiteContent } from "@/lib/data/content";
import { siteUrl } from "@/lib/env";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { projects, settings } = await getSiteContent();
  const now = new Date(settings.updated_at);
  const pages = ["/", ...NAV.map((n) => n.href), ...MORE.map((n) => n.href), CONTACT.href].map((path) => ({
    url: `${siteUrl}${path === "/" ? "" : path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: path === "/" ? 1 : 0.7,
  }));
  const projectPages = projects
    .filter((p) => p.status === "published")
    .map((p) => ({
      url: `${siteUrl}/projects/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  return [...pages, ...projectPages];
}
