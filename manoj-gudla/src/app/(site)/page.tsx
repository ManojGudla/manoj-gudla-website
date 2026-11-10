import Image from "next/image";
import Link from "next/link";
import { CommandTrigger } from "@/components/site/CommandMenu";
import { HeroScene } from "@/components/site/HeroScene";
import { Photo } from "@/components/site/Photo";
import { SocialLinks } from "@/components/site/SocialLinks";
import { resolveMediaFrom } from "@/components/site/resolve";
import { PlayIcon } from "@/components/ui/icons";
import { getSiteContent } from "@/lib/data/content";
import { siteUrl } from "@/lib/env";
import { dateRange, platformLabel, statValue, youtubeId } from "@/lib/format";

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
  const { profile, experience, education, creatorContent, creatorStats, certifications, resources, packs, services } = content;

  const nameParts = profile.full_name.trim().split(/\s+/);
  const first = nameParts[0];
  const lineOne = nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : nameParts[0];
  const surname = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
  const initials = (nameParts[0][0] ?? "") + (nameParts.length > 1 ? nameParts[nameParts.length - 1][0] : "");
  const portrait = resolveMediaFrom(content, profile.photo_media_id);
  const current = experience.find((e) => e.is_current) ?? experience[0];

  // Latest video: newest by publish date, otherwise first featured / first in list.
  const latest =
    [...creatorContent].sort((a, b) => (b.published_on ?? "").localeCompare(a.published_on ?? ""))[0] ?? null;
  const latestYt = latest?.platform === "youtube" ? youtubeId(latest.url) : null;
  const latestThumb = latest
    ? resolveMediaFrom(content, latest.thumbnail_media_id)?.url ?? (latestYt ? `https://i.ytimg.com/vi/${latestYt}/hqdefault.jpg` : null)
    : null;
  const latestPack = latest?.resource_pack_id ? packs.find((p) => p.id === latest.resource_pack_id) : undefined;

  const categories = Array.from(new Set(resources.map((r) => r.category)));
  const nowItems = [
    profile.now_building && { k: "Building", v: profile.now_building },
    profile.now_learning && { k: "Learning", v: profile.now_learning },
    profile.now_creating && { k: "Creating", v: profile.now_creating },
  ].filter(Boolean) as { k: string; v: string }[];

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

  let n = 0; // stagger index for tile entrances

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      {/* ---------------- Hero (always a dark stage) ---------------- */}
      <section className="stage hero2" aria-labelledby="hero-name">
        <div className="container">
          <div className="hero2__grid">
            <div>
              <h1 className="hero__name" id="hero-name" aria-label={profile.full_name}>
                <span className="line" aria-hidden>
                  <Letters text={lineOne} />
                </span>
                {surname && (
                  <span className="line" aria-hidden>
                    <Letters text={surname} offset={lineOne.length} />
                  </span>
                )}
              </h1>
              <p className="hero2__tagline fade-up" style={{ ["--d" as string]: "380ms" }}>
                {profile.tagline}
              </p>
              <ul className="hero__roles fade-up" style={{ ["--d" as string]: "460ms" }}>
                {profile.roles.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
              {profile.hero_intro && (
                <p className="hero2__intro fade-up" style={{ ["--d" as string]: "520ms" }}>
                  {profile.hero_intro}
                </p>
              )}
              <div className="hero2__actions fade-up" style={{ ["--d" as string]: "580ms" }}>
                <Link href="/resources" className="btn">
                  Get free resources
                </Link>
                <Link href="/contact" className="btn btn--ghost">
                  Let&apos;s connect
                </Link>
              </div>
              <div className="hero__socials fade-up" style={{ ["--d" as string]: "640ms" }}>
                <SocialLinks profile={profile} />
              </div>
            </div>

            <div className="hero2__visual fade-up" style={{ ["--d" as string]: "150ms" }}>
              <HeroScene />
              <div className="hero2__portrait" data-parallax="0.05">
                <Photo media={portrait} label="Portrait photograph" mark={initials} priority sizes="(min-width: 960px) 420px, 80vw" />
                {current && (
                  <div className="hero2__plate">
                    <span className="pulse" aria-hidden />
                    <span>
                      <strong>{current.role_title || "Currently"}</strong> at {current.organisation.replace(/\s*\(.*\)$/, "")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {(nowItems.length > 0 || latest) && (
            <div className="now fade-up" style={{ ["--d" as string]: "760ms" }} role="group" aria-label="What I'm doing now">
              <div className="now__label">
                <span className="pulse" aria-hidden /> Now
              </div>
              {nowItems.map((i) => (
                <div key={i.k}>
                  <p className="now__k">{i.k}</p>
                  <p className="now__v">{i.v}</p>
                </div>
              ))}
              {latest && (
                <div>
                  <p className="now__k">Latest {latest.platform === "youtube" ? "video" : "post"}</p>
                  <p className="now__v">
                    <a href={latest.url} target="_blank" rel="noopener noreferrer">
                      {latest.title}
                    </a>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ---------------- Bento ---------------- */}
      <section className="bento-wrap" aria-labelledby="bento-h">
        <div className="container">
          <div className="bento-head">
            <h2 id="bento-h" data-reveal>
              Technology, content and ideas in one place.
            </h2>
          </div>

          <div className="bento">
            {/* About */}
            <article className="tile t-about" data-reveal style={{ ["--n" as string]: n++ }}>
              <p className="tile__label">About {first}</p>
              <p className="statement">{profile.short_bio}</p>
              <div className="t-about__foot">
                {profile.philosophy && <p className="muted">{profile.philosophy}</p>}
                <Link href="/about" className="tile__link">
                  More about me
                </Link>
              </div>
            </article>

            {/* Current role */}
            {current && (
              <article className="tile t-role" data-reveal style={{ ["--n" as string]: n++ }}>
                <p className="tile__label">
                  <span className="pulse" aria-hidden /> {current.is_current ? "Currently" : "Most recently"}
                </p>
                <h3 className="tile__title">{current.organisation}</h3>
                <p>
                  {[current.role_title, dateRange(current.start_label, current.end_label, current.is_current)].filter(Boolean).join(", ")}
                  {current.summary ? `. ${current.summary}` : ""}
                </p>
                <div className="tile__foot">
                  <Link href="/journey" className="tile__link tile__cover">
                    My journey
                  </Link>
                </div>
              </article>
            )}

            {/* Resources */}
            <article className="tile t-res" data-reveal style={{ ["--n" as string]: n++ }}>
              <p className="tile__label">Free resources</p>
              <div className="big-num">
                {resources.length}
                <small>
                  tools, courses and links across {categories.length} topics
                </small>
              </div>
              <form action="/resources" method="get" className="search-inline" role="search">
                <label htmlFor="res-q" className="sr-only">
                  Search resources
                </label>
                <input id="res-q" name="q" className="input" placeholder="Try “AI”, “SQL” or “interview”" />
                <button className="btn btn--sm" type="submit">
                  Search
                </button>
              </form>
            </article>

            {/* Latest video / creator */}
            <article className="tile t-video" data-reveal style={{ ["--n" as string]: n++ }}>
              <p className="tile__label">{latest ? `Latest on ${platformLabel[latest.platform]}` : "Creator"}</p>
              {latest ? (
                <>
                  <a href={latest.url} target="_blank" rel="noopener noreferrer" className="video-thumb" aria-label={`Watch: ${latest.title}`}>
                    {latestThumb && <Image src={latestThumb} alt="" fill sizes="(min-width: 1100px) 40vw, 100vw" />}
                    <span className="play" aria-hidden>
                      <span>
                        <PlayIcon />
                      </span>
                    </span>
                  </a>
                  <h3 className="tile__title">{latest.title}</h3>
                </>
              ) : (
                <h3 className="tile__title">Tech, AI and lifestyle videos on YouTube and Instagram.</h3>
              )}
              {creatorStats.length > 0 && (
                <div className="mini-stats">
                  {creatorStats.slice(0, 3).map((s) => (
                    <div key={s.id}>
                      <strong>{statValue(s)}</strong>
                      <span>{s.label}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="tile__foot">
                {latestPack && (
                  <Link href={`/r/${latestPack.code}`} className="btn btn--sm">
                    Resources from this video
                  </Link>
                )}
                {profile.youtube_url && (
                  <a href={profile.youtube_url} target="_blank" rel="me noopener noreferrer" className="btn btn--sm btn--ghost">
                    YouTube
                  </a>
                )}
                {profile.instagram_url && (
                  <a href={profile.instagram_url} target="_blank" rel="me noopener noreferrer" className="btn btn--sm btn--ghost">
                    Instagram
                  </a>
                )}
                <Link href="/creator" className="tile__link">
                  Creator hub
                </Link>
              </div>
            </article>

            {/* Education */}
            {(education.length > 0 || certifications.length > 0) && (
              <article className="tile t-edu" data-reveal style={{ ["--n" as string]: n++ }}>
                <p className="tile__label">Education</p>
                <ul className="edu-list">
                  {education.slice(0, 2).map((e) => (
                    <li key={e.id}>
                      <strong>{e.qualification.replace(/\s*\(.*\)$/, "")}</strong>
                      <span>
                        {[e.institution, e.progress === "pursuing" ? "In progress" : "Completed"].filter(Boolean).join(", ")}
                      </span>
                    </li>
                  ))}
                  {certifications.length > 0 && (
                    <li>
                      <strong>
                        {certifications.length} certification{certifications.length === 1 ? "" : "s"}
                      </strong>
                      <span>{certifications.map((c) => c.title).join(", ")}</span>
                    </li>
                  )}
                </ul>
              </article>
            )}

            {/* Ctrl + K */}
            <CommandTrigger className="tile t-cmd">
              <span className="tile__label">Explore</span>
              <span className="tile__title">Find anything in seconds.</span>
              <span className="tile__foot">
                <span className="keys" aria-hidden>
                  <kbd>Ctrl</kbd>
                  <kbd>K</kbd>
                </span>
                <span className="muted only-touch" style={{ fontSize: "var(--fs-meta)" }}>
                  Tap to search pages, videos and resources
                </span>
              </span>
            </CommandTrigger>

            {/* Call to action */}
            <article className="tile t-cta" data-reveal style={{ ["--n" as string]: n++ }}>
              <p className="tile__label">{services.length ? "Work with me" : "Let's talk"}</p>
              <h3 className="tile__title">Have an idea, a role or a collaboration in mind?</h3>
              <div className="tile__foot">
                <Link href="/contact" className="btn btn--sm">
                  Let&apos;s connect
                </Link>
                {services.length > 0 ? (
                  <Link href="/work-with-me" className="btn btn--sm btn--ghost">
                    See how we can work together
                  </Link>
                ) : (
                  profile.email && (
                    <a href={`mailto:${profile.email}`} className="btn btn--sm btn--ghost">
                      {profile.email}
                    </a>
                  )
                )}
              </div>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
