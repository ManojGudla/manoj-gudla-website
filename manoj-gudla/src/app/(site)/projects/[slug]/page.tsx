import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DraftFlag, StatusChip } from "@/components/site/blocks";
import { Photo } from "@/components/site/Photo";
import { resolveMediaFrom } from "@/components/site/resolve";
import { ExternalIcon, GitHubIcon } from "@/components/ui/icons";
import { getSiteContent } from "@/lib/data/content";
import { paragraphs } from "@/lib/format";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const { projects } = await getSiteContent();
  return projects.filter((p) => p.status === "published").map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const content = await getSiteContent();
  const p = content.projects.find((x) => x.slug === slug);
  if (!p) return { title: "Project not found" };
  const cover = resolveMediaFrom(content, p.cover_media_id);
  return {
    title: p.title,
    description: (p.summary || p.tagline).slice(0, 160),
    alternates: { canonical: `/projects/${p.slug}` },
    openGraph: {
      url: `/projects/${p.slug}`,
      title: p.title,
      description: p.summary || p.tagline,
      ...(cover ? { images: [{ url: cover.url, alt: cover.alt }] } : {}),
    },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = await getSiteContent();
  const project = content.projects.find((p) => p.slug === slug);
  if (!project) notFound();

  const cover = resolveMediaFrom(content, project.cover_media_id);
  const shots = content.projectImages
    .filter((i) => i.project_id === project.id)
    .map((i) => ({ ...i, media: resolveMediaFrom(content, i.media_id) }))
    .filter((i) => i.media);
  const others = content.projects.filter((p) => p.id !== project.id).slice(0, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary || project.tagline,
    url: project.live_url || undefined,
    creator: { "@type": "Person", name: content.profile.full_name },
    keywords: project.technologies.join(", ") || undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <article>
        <header className="container detail-hero">
          <p className="meta">
            <Link href="/projects" className="text-link">
              Projects
            </Link>
          </p>
          <h1 data-reveal>
            {project.title} <DraftFlag status={project.status} />
          </h1>
          <p className="lead" style={{ maxWidth: "46ch" }}>
            {project.tagline}
          </p>
          <div className="section-foot" style={{ marginTop: "2rem" }}>
            {project.live_url && (
              <a href={project.live_url} className="btn" target="_blank" rel="noopener noreferrer">
                <ExternalIcon /> Visit the live site
              </a>
            )}
            {project.repo_url && (
              <a href={project.repo_url} className="btn btn--ghost" target="_blank" rel="noopener noreferrer">
                <GitHubIcon /> GitHub
              </a>
            )}
          </div>
          {cover && (
            <div className="detail-cover" data-parallax="0.04">
              <Photo media={cover} label="Project cover screenshot" priority sizes="(min-width: 1240px) 1240px, 100vw" />
            </div>
          )}
        </header>

        <div className="container section detail-grid">
          <div>
            {project.overview && (
              <section className="detail-block" aria-labelledby="ov-h">
                <h2 id="ov-h">Overview</h2>
                <div className="prose">
                  {paragraphs(project.overview).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </section>
            )}
            {project.purpose && (
              <section className="detail-block" aria-labelledby="pu-h">
                <h2 id="pu-h">Why it exists</h2>
                <div className="prose">
                  {paragraphs(project.purpose).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </section>
            )}
            {project.features.length > 0 && (
              <section className="detail-block" aria-labelledby="fe-h">
                <h2 id="fe-h">Key features</h2>
                <ul className="ticks">
                  {project.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </section>
            )}
            {shots.length > 0 && (
              <section className="detail-block" aria-labelledby="sh-h">
                <h2 id="sh-h">Screenshots</h2>
                <div className="shots">
                  {shots.map((s) => (
                    <figure key={s.id}>
                      <Photo media={s.media} label="" sizes="(min-width: 700px) 40vw, 100vw" zoom />
                      {s.caption && <figcaption>{s.caption}</figcaption>}
                    </figure>
                  ))}
                </div>
              </section>
            )}
            {project.roadmap.length > 0 && (
              <section className="detail-block" aria-labelledby="rm-h">
                <h2 id="rm-h">What&apos;s next</h2>
                <p className="goal-note" style={{ marginBottom: "1rem" }}>
                  Planned work — not yet released.
                </p>
                <ul className="ticks">
                  {project.roadmap.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="detail-aside" aria-label="Project details">
            <div>
              <h2>Status</h2>
              <StatusChip status={project.dev_status} />
            </div>
            {project.technologies.length > 0 && (
              <div>
                <h2>Technologies and data</h2>
                <ul className="chips" role="list">
                  {project.technologies.map((t) => (
                    <li key={t} className="chip">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {(project.live_url || project.repo_url) && (
              <div>
                <h2>Links</h2>
                <ul className="ticks">
                  {project.live_url && (
                    <li>
                      <a className="text-link" href={project.live_url} target="_blank" rel="noopener noreferrer">
                        {project.live_url.replace(/^https:\/\/(www\.)?/, "").replace(/\/$/, "")}
                      </a>
                    </li>
                  )}
                  {project.repo_url && (
                    <li>
                      <a className="text-link" href={project.repo_url} target="_blank" rel="noopener noreferrer">
                        {project.repo_url.replace(/^https:\/\//, "")}
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            )}
            <div>
              <h2>Built by</h2>
              <p>{content.profile.full_name}, independently.</p>
            </div>
          </aside>
        </div>
      </article>

      <section className="section section--band">
        <div className="container cta">
          <h2>Curious about this project?</h2>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link href="/contact" className="btn btn--accent">
              Get in touch
            </Link>
            {others.length > 0 ? (
              <Link href={`/projects/${others[0].slug}`} className="btn btn--ghost">
                Next: {others[0].title}
              </Link>
            ) : (
              <Link href="/projects" className="btn btn--ghost">
                All projects
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
