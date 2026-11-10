import type { Metadata } from "next";
import Link from "next/link";
import { ContentCard, Kicker, PageHero, SplitTitle, StatList } from "@/components/site/blocks";
import { DEFAULT_CREATOR_PHOTO } from "@/content/defaults";
import { TopicIcon } from "@/components/site/TopicIcon";
import { Photo } from "@/components/site/Photo";
import { resolveMediaFrom } from "@/components/site/resolve";
import { InstagramIcon, LinkedInIcon, YouTubeIcon } from "@/components/ui/icons";
import { getSiteContent } from "@/lib/data/content";
import type { ContentCategory, CreatorContent, SiteContent } from "@/lib/types";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Creator hub",
  description: "Videos, reels and brand collaborations: technology, AI and lifestyle content by Manoj Kumar Gudla.",
  alternates: { canonical: "/creator" },
  openGraph: { url: "/creator" },
};

const CATEGORIES: { key: ContentCategory; title: string; text: string }[] = [
  { key: "technology", title: "Technology", text: "New tools, devices and platforms, explained simply and tested for real." },
  { key: "ai", title: "AI and emerging tech", text: "Hands-on looks at AI tools and what they actually change." },
  { key: "lifestyle", title: "Lifestyle", text: "The routines, places and moments around building things." },
];

function Showcase({ title, id, items, content, emptyText, href, cta }: {
  title: string;
  id: string;
  items: CreatorContent[];
  content: SiteContent;
  emptyText: string;
  href: string;
  cta: string;
}) {
  return (
    <section className="section" aria-labelledby={id}>
      <div className="container">
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "end", gap: "1rem", marginBottom: "2rem" }}>
          <h2 className="section-title" id={id} data-reveal>
            {title}
          </h2>
          {href && (
            <a href={href} className="btn btn--ghost btn--sm" target="_blank" rel="noopener noreferrer">
              {cta}
            </a>
          )}
        </div>
        {items.length > 0 ? (
          <div className="content-grid">
            {items.map((c) => (
              <ContentCard key={c.id} item={c} content={content} />
            ))}
          </div>
        ) : (
          <p className="empty">{emptyText}</p>
        )}
      </div>
    </section>
  );
}

export default async function CreatorPage() {
  const content = await getSiteContent();
  const { profile, creatorContent, creatorStats } = content;
  const photo = resolveMediaFrom(content, profile.creator_photo_media_id) ?? DEFAULT_CREATOR_PHOTO;
  const featured = creatorContent.filter((c) => c.is_featured);
  const youtube = creatorContent.filter((c) => c.platform === "youtube");
  const instagram = creatorContent.filter((c) => c.platform === "instagram");

  return (
    <>
      <PageHero mark="Create" className="page-intro--split">
        <div>
          <Kicker path="creator" />
          <h1 data-reveal><SplitTitle text={profile.creator_title || "Creator hub"} /></h1>
          <p className="lead" data-reveal style={{ ["--rd" as string]: "120ms", maxWidth: "44ch" }}>
            {profile.creator_intro}
          </p>
          {(profile.youtube_url || profile.instagram_url) && (
            <ul className="platforms platforms--row" role="list" data-reveal style={{ ["--rd" as string]: "200ms" }}>
              {profile.youtube_url && (
                <li>
                  <a className="platform platform--yt" href={profile.youtube_url} target="_blank" rel="me noopener noreferrer">
                    <span className="platform__icon">
                      <YouTubeIcon />
                    </span>
                    <span className="platform__name">YouTube</span>
                    <span className="platform__what">Tech, AI and lifestyle videos</span>
                    <span className="platform__go">Watch the channel</span>
                  </a>
                </li>
              )}
              {profile.instagram_url && (
                <li>
                  <a className="platform platform--ig" href={profile.instagram_url} target="_blank" rel="me noopener noreferrer">
                    <span className="platform__icon">
                      <InstagramIcon />
                    </span>
                    <span className="platform__name">Instagram</span>
                    <span className="platform__what">Reels and quick tips</span>
                    <span className="platform__go">See the reels</span>
                  </a>
                </li>
              )}
            </ul>
          )}
        </div>
        <div className="page-intro__media framed" data-reveal>
          <Photo media={photo} label="Creator photograph" priority sizes="(min-width: 900px) 360px, 90vw" />
        </div>
      </PageHero>

      {creatorStats.length > 0 && (
        <section className="section section--band" aria-labelledby="reach-h">
          <div className="container">
            <h2 className="section-title" id="reach-h" data-reveal style={{ marginBottom: "2rem" }}>
              Audience
            </h2>
            <StatList stats={creatorStats} />
            <p className="privacy" style={{ marginTop: "1.5rem" }}>
              Figures are self-reported unless marked as verified, and show the date they were last updated.
            </p>
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <Showcase title="Featured" id="feat-h" items={featured} content={content} emptyText="" href="" cta="" />
      )}

      {youtube.length > 0 && <Showcase
        title="Latest videos"
        id="yt-h"
        items={youtube}
        content={content}
        emptyText="Videos will be featured here soon. Meanwhile, the full channel is on YouTube."
        href={profile.youtube_url}
        cta="Open the YouTube channel"
      />}

      {instagram.length > 0 && <Showcase
        title="Reels and posts"
        id="ig-h"
        items={instagram}
        content={content}
        emptyText="Reels will be featured here soon. Meanwhile, everything is on Instagram."
        href={profile.instagram_url}
        cta="Open Instagram"
      />}

      <section className="section section--band" aria-labelledby="topics-h">
        <div className="container split">
          <div className="split__head">
            <h2 className="section-title" id="topics-h" data-reveal>
              What I create
            </h2>
          </div>
          <ul className="interests" role="list">
            {CATEGORIES.map((c) => (
              <li key={c.key} className="spot">
                <TopicIcon topic={c.key === "technology" ? "tech" : c.key} />
                <h3>{c.title}</h3>
                <p>{c.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="kit-h">
        <div className="container">
          <div className="split" style={{ marginBottom: "3rem" }}>
            <div className="split__head">
              <h2 className="section-title" id="kit-h" data-reveal>
                Media kit
              </h2>
            </div>
            <p className="prose">
              Working with a brand works best when the fit is real. Here&apos;s what to expect, and what helps me say yes
              quickly. Ask for current audience figures and recent examples and I&apos;ll share them with dates.
            </p>
          </div>
          <div className="kit kit--steps">
            <div>
              <h3>Formats</h3>
              <p>YouTube videos, Instagram reels and posts, and LinkedIn write-ups for professional audiences.</p>
            </div>
            <div>
              <h3>Good fits</h3>
              <p>Technology products, AI tools, learning platforms, and lifestyle brands that suit a tech-curious audience.</p>
            </div>
            <div>
              <h3>Send in your brief</h3>
              <p>Your product, the goal of the campaign, timelines, deliverables and budget range.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--stage stage" data-stage aria-labelledby="collab-h">
        <div className="stage-glow" aria-hidden />
        <div className="container cta">
          <h2 id="collab-h">Got a product my audience would find useful? Let&apos;s talk.</h2>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link href="/contact?topic=brand" className="btn btn--accent">
              Propose a collaboration
            </Link>
            {profile.linkedin_url && (
              <a className="btn btn--ghost" href={profile.linkedin_url} target="_blank" rel="me noopener noreferrer">
                <LinkedInIcon /> LinkedIn
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

