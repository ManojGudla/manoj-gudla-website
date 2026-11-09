import Link from "next/link";
import { FeatureProject, ContentCard, SplitTitle, StatList } from "@/components/site/blocks";
import { HeroScene } from "@/components/site/HeroScene";
import { Photo } from "@/components/site/Photo";
import { SocialLinks } from "@/components/site/SocialLinks";
import { resolveMediaFrom } from "@/components/site/resolve";
import { getSiteContent } from "@/lib/data/content";
import { siteUrl } from "@/lib/env";
import { dateRange } from "@/lib/format";

export const revalidate = 300;

function Letters({ text, offset = 0 }: { text: string; offset?: number }) {
  return (
    <>
      {Array.from(text).map((c, i) => (
        <span key={i} className="ch" style={{ ["--i" as string]: i + offset }}>
          {c === " " ? " " : c}
        </span>
      ))}
    </>
  );
}

export default async function HomePage() {
  const content = await getSiteContent();
  const { profile, experience, education, projects, creatorContent, creatorStats, certifications } = content;

  // Two lines: everything but the surname, then the surname.
  const nameParts = profile.full_name.trim().split(/\s+/);
  const first = nameParts[0];
  const lineOne = nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : nameParts[0];
  const rest = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
  const portrait = resolveMediaFrom(content, profile.photo_media_id);
  const current = experience.find((e) => e.is_current) ?? experience[0];
  const topEducation = education[0];
  const featured = projects.filter((p) => p.is_featured);
  const showcase = featured.length ? featured : projects.slice(0, 1);
  const featuredContent = (creatorContent.filter((c) => c.is_featured).length
    ? creatorContent.filter((c) => c.is_featured)
    : creatorContent
  ).slice(0, 3);
  const initials = (nameParts[0][0] ?? "") + (nameParts.length > 1 ? nameParts[nameParts.length - 1][0] : "");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.full_name,
    url: siteUrl,
    jobTitle: profile.roles[0] || undefined,
    description: profile.short_bio || undefined,
    email: profile.email ? `mailto:${profile.email}` : undefined,
    worksFor: current ? { "@type": "Organization", name: current.organisation } : undefined,
    alumniOf: education.filter((e) => e.institution).map((e) => ({ "@type": "CollegeOrUniversity", name: e.institution })),
    sameAs: [profile.linkedin_url, profile.instagram_url, profile.youtube_url, profile.github_url].filter(Boolean),
    image: portrait?.url,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      {/* 1. Hero */}
      <section className="hero" aria-labelledby="hero-name">
        <div className="container">
          <div className="hero__grid">
            <div>
              <h1 className="hero__name" id="hero-name" aria-label={profile.full_name}>
                <span className="line" aria-hidden>
                  <Letters text={lineOne} />
                </span>
                {rest && (
                  <span className="line" aria-hidden>
                    <Letters text={rest} offset={lineOne.length} />
                  </span>
                )}
              </h1>
              <p className="hero__tagline fade-up" style={{ ["--d" as string]: "380ms" }}>
                {profile.tagline}
              </p>
              <ul className="hero__roles fade-up" style={{ ["--d" as string]: "460ms" }}>
                {profile.roles.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
              {profile.hero_intro && (
                <p className="hero__intro fade-up" style={{ ["--d" as string]: "520ms" }}>
                  {profile.hero_intro}
                </p>
              )}
              <div className="hero__actions fade-up" style={{ ["--d" as string]: "580ms" }}>
                <Link href="/projects" className="btn">
                  Explore my work
                </Link>
                <Link href="/contact" className="btn btn--ghost">
                  Let&apos;s connect
                </Link>
              </div>
              <div className="hero__socials fade-up" style={{ ["--d" as string]: "640ms" }}>
                <SocialLinks profile={profile} />
              </div>
            </div>

            <div className="hero__visual fade-up" style={{ ["--d" as string]: "150ms" }}>
              <HeroScene />
              <div className="hero__portrait" data-parallax="0.06">
                <Photo
                  media={portrait}
                  label="Portrait photograph"
                  mark={initials}
                  priority
                  sizes="(min-width: 960px) 380px, 90vw"
                />
              </div>
            </div>
          </div>

          <nav className="paths" aria-label="Find what you came for">
            <Link href="/journey">
              <span className="who">Hiring or recruiting</span>
              <span className="where">Experience &amp; résumé</span>
            </Link>
            <Link href="/projects">
              <span className="who">Partners and clients</span>
              <span className="where">Projects &amp; products</span>
            </Link>
            <Link href="/creator">
              <span className="who">Brands and creators</span>
              <span className="where">Creator hub</span>
            </Link>
            <Link href="/about">
              <span className="who">Friends, family, everyone</span>
              <span className="where">The person behind it</span>
            </Link>
          </nav>
        </div>
      </section>

      {/* 2. About introduction */}
      <section className="section" aria-labelledby="about-h">
        <div className="container split">
          <div className="split__head">
            <h2 className="section-title" id="about-h" data-reveal>
              Meet {first}
            </h2>
          </div>
          <div>
            <p className="statement" data-reveal>
              {profile.short_bio}
            </p>
            <div className="section-foot">
              <Link href="/about" className="btn btn--ghost">
                More about me
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Professional highlights — derived only from real entries */}
      <section className="section section--band" aria-labelledby="pro-h">
        <div className="container split">
          <div className="split__head">
            <h2 className="section-title" id="pro-h" data-reveal>
              Where I am today
            </h2>
            {profile.professional_intro && <p className="section-sub">{profile.professional_intro}</p>}
          </div>
          <div>
            <dl className="facts">
              {current && (
                <div>
                  <dt>{current.is_current ? "Currently at" : "Most recently"}</dt>
                  <dd>
                    {current.organisation}
                    <small>
                      {[current.role_title, dateRange(current.start_label, current.end_label, current.is_current)]
                        .filter(Boolean)
                        .join(", ")}
                    </small>
                  </dd>
                </div>
              )}
              {profile.experience_summary && (
                <div>
                  <dt>Professional experience</dt>
                  <dd>{profile.experience_summary}</dd>
                </div>
              )}
              {topEducation && (
                <div>
                  <dt>Education</dt>
                  <dd>
                    {topEducation.qualification.replace(/\s*\(.*\)$/, "")}
                    <small>
                      {[topEducation.institution, topEducation.progress === "pursuing" ? "In progress" : "Completed"]
                        .filter(Boolean)
                        .join(", ")}
                    </small>
                  </dd>
                </div>
              )}
              {certifications.length > 0 && (
                <div>
                  <dt>Certifications</dt>
                  <dd>
                    {certifications.length} completed
                    <small>{certifications.map((c) => c.title).join(", ")}</small>
                  </dd>
                </div>
              )}
            </dl>
            <div className="section-foot">
              <Link href="/journey" className="btn btn--ghost">
                See the full journey
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Featured projects */}
      {showcase.length > 0 && (
        <section className="section" aria-labelledby="work-h">
          <div className="container">
            <h2 className="section-title" id="work-h" data-reveal style={{ marginBottom: "2.5rem" }}>
              What I&apos;m building
            </h2>
            <div style={{ display: "grid", gap: "1.5rem" }}>
              {showcase.map((p) => (
                <FeatureProject key={p.id} project={p} content={content} />
              ))}
            </div>
            {projects.length > showcase.length && (
              <div className="section-foot">
                <Link href="/projects" className="btn btn--ghost">
                  All projects
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 5. Creator showcase */}
      <section className="section section--band" aria-labelledby="creator-h">
        <div className="container">
          <div className="split" style={{ marginBottom: "2.5rem" }}>
            <div className="split__head">
              <h2 className="section-title" id="creator-h" data-reveal>
                <SplitTitle text={profile.creator_title || "Creator"} />
              </h2>
            </div>
            <div>
              <p className="prose" style={{ fontSize: "1.15rem" }}>
                {profile.creator_intro}
              </p>
              <div className="section-foot">
                <Link href="/creator" className="btn">
                  Visit the creator hub
                </Link>
              </div>
            </div>
          </div>
          <StatList stats={creatorStats.slice(0, 3)} />
          {featuredContent.length > 0 && (
            <div className="content-grid" style={{ marginTop: "2.5rem" }}>
              {featuredContent.map((c) => (
                <ContentCard key={c.id} item={c} content={content} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. Contact */}
      <section className="section" aria-labelledby="cta-h">
        <div className="container cta">
          <h2 id="cta-h" data-reveal>
            Have an idea, a role or a collaboration in mind?
          </h2>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link href="/contact" className="btn btn--accent">
              Let&apos;s connect
            </Link>
            {profile.email && (
              <a href={`mailto:${profile.email}`} className="btn btn--ghost">
                Email me
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
