import type { Metadata } from "next";
import Link from "next/link";
import { PathFinder } from "@/components/site/PathFinder";
import { ResourceLibrary } from "@/components/site/ResourceLibrary";
import { getSiteContent } from "@/lib/data/content";
import { formatDate, platformLabel } from "@/lib/format";

export const metadata: Metadata = {
  title: "Free resources",
  description: "Free tools, courses and links for learning technology, AI, coding and content creation — plus the resources from every video.",
  alternates: { canonical: "/resources" },
  openGraph: { url: "/resources", title: "Free resources" },
};

export default async function ResourcesPage({ searchParams }: { searchParams: Promise<{ q?: string; c?: string }> }) {
  const { q = "", c = "" } = await searchParams;
  const { resources, packs, packItems, profile } = await getSiteContent();

  return (
    <>
      <section className="container page-intro">
        <h1 data-reveal>Free resources</h1>
        <p className="lead" data-reveal style={{ ["--rd" as string]: "120ms", maxWidth: "46ch" }}>
          The tools, courses and links I recommend for learning tech, AI and content creation. Saw something in one of my videos? Its
          resources are below.
        </p>
      </section>

      {packs.length > 0 && (
        <section className="container" aria-labelledby="packs-h" style={{ paddingBottom: "clamp(2.5rem, 6vw, 4rem)" }}>
          <h2 id="packs-h" className="sub-h">
            From my videos
          </h2>
          <ul className="pack-grid" role="list">
            {packs.map((p) => (
              <li key={p.id}>
                <Link href={`/r/${p.code}`} className="pack-card">
                  <span className="pack-card__meta">
                    {platformLabel[p.platform]}
                    {p.published_on ? `, ${formatDate(p.published_on)}` : ""}
                  </span>
                  <span className="pack-card__title">{p.title}</span>
                  <span className="pack-card__foot">
                    <span>{packItems.filter((i) => i.pack_id === p.id).length} resources</span>
                    <span className="pack-card__code">/r/{p.code}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="container">
        <PathFinder resources={resources} />
      </div>

      <section className="container" aria-labelledby="lib-h" style={{ paddingBottom: "var(--section)" }}>
        <h2 id="lib-h" className="sub-h">
          The library
        </h2>
        {resources.length > 0 ? (
          <ResourceLibrary resources={resources} initialQuery={q} initialCategory={c} />
        ) : (
          <p className="empty">Resources are on their way.</p>
        )}
        {(profile.youtube_url || profile.instagram_url) && (
          <p className="privacy" style={{ marginTop: "2rem" }}>
            New resources come with new videos. Follow along on{" "}
            {profile.youtube_url && (
              <a className="text-link" href={profile.youtube_url} target="_blank" rel="me noopener noreferrer">
                YouTube
              </a>
            )}
            {profile.youtube_url && profile.instagram_url && " and "}
            {profile.instagram_url && (
              <a className="text-link" href={profile.instagram_url} target="_blank" rel="me noopener noreferrer">
                Instagram
              </a>
            )}
            .
          </p>
        )}
      </section>
    </>
  );
}
