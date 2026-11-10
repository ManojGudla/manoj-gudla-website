import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DraftFlag } from "@/components/site/blocks";
import { CopyLink } from "@/components/site/CopyLink";
import { PricingBadge } from "@/components/site/ResourceLibrary";
import { InstagramIcon, YouTubeIcon } from "@/components/ui/icons";
import { getSiteContent } from "@/lib/data/content";
import { formatDate, paragraphs, platformLabel, youtubeId } from "@/lib/format";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const { packs } = await getSiteContent();
  return packs.filter((p) => p.status === "published").map((p) => ({ code: p.code }));
}

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  const { packs } = await getSiteContent();
  const p = packs.find((x) => x.code === code);
  if (!p) return { title: "Resources not found" };
  return {
    title: p.title,
    description: (p.intro || `Every tool and link from my ${platformLabel[p.platform]} video, in one place.`).slice(0, 160),
    alternates: { canonical: `/r/${p.code}` },
    openGraph: { url: `/r/${p.code}`, title: p.title },
  };
}

export default async function PackPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { packs, packItems, resources, profile } = await getSiteContent();
  const pack = packs.find((p) => p.code === code.toLowerCase());
  if (!pack) notFound();

  const items = packItems
    .filter((i) => i.pack_id === pack.id)
    .map((i) => ({ ...i, r: resources.find((r) => r.id === i.resource_id) }))
    .filter((i) => i.r);
  const yt = pack.platform === "youtube" && pack.video_url ? youtubeId(pack.video_url) : null;

  return (
    <article className="container pack">
      <header className="pack__head">
        <p className="meta">
          <Link href="/resources" className="text-link">
            Resources
          </Link>{" "}
          · from my {platformLabel[pack.platform]} {pack.platform === "youtube" ? "video" : "post"}
          {pack.published_on ? `, ${formatDate(pack.published_on, { day: "numeric", month: "short", year: "numeric" })}` : ""}{" "}
          <DraftFlag status={pack.status} />
        </p>
        <h1 data-reveal>{pack.title}</h1>
        {pack.intro &&
          paragraphs(pack.intro).map((p, i) => (
            <p key={i} className="lead" style={{ maxWidth: "52ch" }}>
              {p}
            </p>
          ))}
        <div className="section-foot" style={{ marginTop: "1.5rem" }}>
          {pack.video_url && !yt && (
            <a href={pack.video_url} className="btn btn--sm" target="_blank" rel="noopener noreferrer">
              {pack.platform === "instagram" ? <InstagramIcon /> : null} Watch the {pack.platform === "youtube" ? "video" : "post"}
            </a>
          )}
          <CopyLink path={`/r/${pack.code}`} title={pack.title} />
        </div>
      </header>

      {yt && (
        <div className="pack__video">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${yt}`}
            title={pack.title}
            loading="lazy"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      )}

      <section aria-labelledby="pack-list-h" className="pack__list">
        <h2 id="pack-list-h" className="sub-h">
          {items.length} resource{items.length === 1 ? "" : "s"} in this video
        </h2>
        {items.length === 0 ? (
          <p className="empty">The links for this video are being added. Check back soon.</p>
        ) : (
          <ol className="pack-items" role="list">
            {items.map(({ id, note, r }, i) => (
              <li key={id}>
                <a href={r!.url} target="_blank" rel="noopener noreferrer" className="pack-item">
                  <span className="pack-item__n" aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="pack-item__body">
                    <span className="pack-item__name">{r!.name}</span>
                    <span className="pack-item__desc">{note || r!.description}</span>
                  </span>
                  <span className="pack-item__side">
                    <PricingBadge pricing={r!.pricing} />
                    <span className="pack-item__open">Open</span>
                  </span>
                  <span className="sr-only"> (opens {r!.name} in a new tab)</span>
                </a>
              </li>
            ))}
          </ol>
        )}
      </section>

      <aside className="pack__follow" aria-label="Follow for more">
        <div>
          <h2>Want the next one?</h2>
          <p className="muted">New videos come with new resource packs.</p>
        </div>
        <div className="section-foot" style={{ marginTop: 0 }}>
          {profile.youtube_url && (
            <a className="btn btn--sm" href={profile.youtube_url} target="_blank" rel="me noopener noreferrer">
              <YouTubeIcon /> Subscribe
            </a>
          )}
          {profile.instagram_url && (
            <a className="btn btn--sm btn--ghost" href={profile.instagram_url} target="_blank" rel="me noopener noreferrer">
              <InstagramIcon /> Follow
            </a>
          )}
          <Link className="btn btn--sm btn--ghost" href="/resources">
            All free resources
          </Link>
        </div>
      </aside>
    </article>
  );
}
