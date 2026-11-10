import Link from "next/link";
import { Photo } from "@/components/site/Photo";
import { DEFAULT_PROJECT_COVERS } from "@/content/defaults";
import { PlayIcon } from "@/components/ui/icons";
import { devStatusLabel, platformLabel, statValue, formatDate, youtubeId } from "@/lib/format";
import type { Achievement, CreatorContent, CreatorStat, Project, ResolvedMedia, SiteContent, VisionItem } from "@/lib/types";
import { resolveMediaFrom } from "./resolve";

/**
 * The dark band every inner page opens with: fine grid that lights up under
 * the pointer, a large outlined watermark word and a path-style kicker.
 */
export function PageHero({
  mark,
  children,
  className = "",
  after,
}: {
  mark?: string;
  children: React.ReactNode;
  className?: string;
  after?: React.ReactNode;
}) {
  return (
    <section className="stage pagehero" data-stage>
      <div className="stage-glow" aria-hidden />
      {mark && (
        <span className="pagehero__mark" aria-hidden>
          {mark}
        </span>
      )}
      <div className={`container page-intro ${className}`}>{children}</div>
      {after}
    </section>
  );
}

export function Kicker({ path }: { path: string }) {
  const label = path.replace(/-/g, " ");
  return (
    <p className="kicker" data-reveal>
      <span className="kicker__bar" aria-hidden />
      <span className="kicker__path">{label.charAt(0).toUpperCase() + label.slice(1)}</span>
    </p>
  );
}

export function PageIntro({
  title,
  lead,
  children,
  path,
  mark,
  after,
  media,
}: {
  title: string;
  lead?: string;
  children?: React.ReactNode;
  path?: string;
  mark?: string;
  after?: React.ReactNode;
  media?: ResolvedMedia | null;
}) {
  const text = (
    <>
      {path && <Kicker path={path} />}
      <h1 data-reveal>{title}</h1>
      {lead && (
        <p className="lead" data-reveal style={{ ["--rd" as string]: "120ms" }}>
          {lead}
        </p>
      )}
      {children}
    </>
  );
  if (!media) {
    return (
      <PageHero mark={mark} after={after}>
        {text}
      </PageHero>
    );
  }
  return (
    <PageHero mark={mark} after={after} className="page-intro--split">
      <div>{text}</div>
      <div className="page-intro__media framed" data-reveal>
        <Photo media={media} label={title} priority sizes="(min-width: 900px) 360px, 90vw" />
      </div>
    </PageHero>
  );
}

export function SectionHead({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="split__head">
      <h2 className="section-title" data-reveal>
        {title}
      </h2>
      {sub && <p className="section-sub">{sub}</p>}
      {children}
    </div>
  );
}

export function DraftFlag({ status }: { status: string }) {
  if (status !== "draft") return null;
  return <span className="draft-flag">Draft</span>;
}

export function StatusChip({ status }: { status: Project["dev_status"] }) {
  return (
    <span className="chip">
      <span className={`status-dot ${status === "live" ? "status-dot--live" : ""}`} aria-hidden />
      {devStatusLabel[status]}
    </span>
  );
}

export function FeatureProject({ project, content }: { project: Project; content: SiteContent }) {
  const cover = resolveMediaFrom(content, project.cover_media_id) ?? DEFAULT_PROJECT_COVERS[project.slug] ?? null;
  return (
    <Link href={`/projects/${project.slug}`} className="feature" data-tilt>
      <ProjectWindow project={project} cover={cover} />
      <div className="feature__body">
        <StatusChip status={project.dev_status} /> <DraftFlag status={project.status} />
        <h3 className="feature__title">{project.title}</h3>
        <p>{project.tagline || project.summary}</p>
        {project.technologies.length > 0 && (
          <ul className="chips" role="list" style={{ marginTop: "1.25rem" }}>
            {project.technologies.slice(0, 5).map((t) => (
              <li key={t} className="chip">
                {t}
              </li>
            ))}
          </ul>
        )}
        <span className="feature__more">Read the project story</span>
      </div>
    </Link>
  );
}

/**
 * Stand-in visual until a screenshot is uploaded (Dashboard → Projects → Cover):
 * a browser window with the site's address and its first features.
 */
export function ProjectWindow({ project, cover, priority = false }: { project: Project; cover?: ResolvedMedia | null; priority?: boolean }) {
  let host = "";
  try {
    host = project.live_url ? new URL(project.live_url).host.replace(/^www\./, "") : "";
  } catch {
    host = "";
  }
  return (
    <div className="pwin">
      <div className="pwin__bar" aria-hidden>
        <span />
        <span />
        <span />
        {host && <span className="pwin__url">{host}</span>}
      </div>
      {cover ? (
        <div className="pwin__shot">
          <Photo media={cover} label={`${project.title} screenshot`} priority={priority} sizes="(min-width: 900px) 640px, 100vw" />
        </div>
      ) : (
        <div className="pwin__body" aria-hidden>
          <span className="pwin__title">{project.title}</span>
          <ul role="list">
            {project.features.slice(0, 4).map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function ProjectCard({ project, content }: { project: Project; content: SiteContent }) {
  const cover = resolveMediaFrom(content, project.cover_media_id) ?? DEFAULT_PROJECT_COVERS[project.slug] ?? null;
  return (
    <Link href={`/projects/${project.slug}`} className="project-card" data-tilt>
      {cover && <Photo media={cover} label="Project screenshot" sizes="(min-width: 760px) 50vw, 100vw" />}
      <div>
        <StatusChip status={project.dev_status} /> <DraftFlag status={project.status} />
        <h3 style={{ marginTop: "0.6rem" }}>{project.title}</h3>
        <p className="muted" style={{ marginTop: "0.4rem" }}>
          {project.summary || project.tagline}
        </p>
      </div>
    </Link>
  );
}

export function StatList({ stats }: { stats: CreatorStat[] }) {
  if (stats.length === 0) return null;
  return (
    <div className="stats">
      {stats.map((s) => (
        <div className="stat" key={s.id}>
          <div className="stat__value">{statValue(s)}</div>
          <div className="stat__label">
            {s.label} <DraftFlag status={s.status} />
          </div>
          <div className="stat__note">
            {s.verification === "verified"
              ? `Verified ${formatDate(s.verified_on, { day: "numeric", month: "short", year: "numeric" })}`
              : "Self-reported"}
            {s.last_updated ? `, updated ${formatDate(s.last_updated)}` : ""}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ContentCard({ item, content }: { item: CreatorContent; content: SiteContent }) {
  const uploaded: ResolvedMedia | null = resolveMediaFrom(content, item.thumbnail_media_id);
  const yt = item.platform === "youtube" ? youtubeId(item.url) : null;
  const thumb: ResolvedMedia | null =
    uploaded ?? (yt ? { id: yt, url: `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`, alt: "", width: 480, height: 360, mime: "image/jpeg" } : null);
  const portrait = item.platform === "instagram";
  const pack = item.resource_pack_id ? content.packs.find((p) => p.id === item.resource_pack_id) : undefined;
  return (
    <div className={`content-card ${portrait ? "content-card--portrait" : ""}`}>
      <a href={item.url} target="_blank" rel="noopener noreferrer" className="content-card__link">
        <div style={{ position: "relative" }}>
          <Photo
            media={thumb ? { ...thumb, alt: thumb.alt || `Thumbnail: ${item.title}` } : null}
            label={`${platformLabel[item.platform]} thumbnail`}
            sizes="(min-width: 1000px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
          {item.platform === "youtube" && (
            <span className="play" aria-hidden>
              <span>
                <PlayIcon />
              </span>
            </span>
          )}
        </div>
        <p className="meta" style={{ marginTop: "0.75rem" }}>
          {platformLabel[item.platform]}
          {item.published_on ? `, ${formatDate(item.published_on)}` : ""} <DraftFlag status={item.status} />
        </p>
        <h3 style={{ marginTop: "0.3rem" }}>{item.title}</h3>
        {item.description && (
          <p className="muted" style={{ marginTop: "0.35rem", fontSize: "var(--fs-small)" }}>
            {item.description}
          </p>
        )}
        <span className="sr-only"> (opens {platformLabel[item.platform]} in a new tab)</span>
      </a>
      {pack && (
        <Link href={`/r/${pack.code}`} className="tile__link">
          Resources from this {item.platform === "youtube" ? "video" : "post"}
        </Link>
      )}
    </div>
  );
}

const kindLabel: Record<Achievement["kind"], string> = {
  highlight: "Personal highlight",
  award: "Award",
  certification: "Certification",
  recognition: "Recognition",
  hackathon: "Hackathon",
  mentoring: "Mentoring",
  milestone: "Milestone",
};

export { kindLabel };

export function Highlights({ items }: { items: Achievement[] }) {
  if (items.length === 0) return null;
  return (
    <div className="highlights">
      {items.map((a, i) => (
        <article className="highlight" key={a.id} data-reveal style={{ ["--rd" as string]: `${i * 120}ms` }}>
          <p className="kind">
            {kindLabel[a.kind]} <DraftFlag status={a.status} />
          </p>
          <div>
            <h3>{a.title}</h3>
            {a.focus && <p className="focus">{a.focus}</p>}
          </div>
        </article>
      ))}
    </div>
  );
}

const HORIZONS = ["Now", "Next", "Long term"];

/** Groups vision items into time horizons; anything else goes under "Ongoing". */
export function Horizons({ items }: { items: VisionItem[] }) {
  const groups = new Map<string, VisionItem[]>();
  for (const v of items) {
    const key = HORIZONS.includes(v.horizon) ? v.horizon : "Ongoing";
    groups.set(key, [...(groups.get(key) ?? []), v]);
  }
  const order = ["Now", "Ongoing", "Next", "Long term"].filter((k) => groups.has(k));
  return (
    <div className="horizons">
      {order.map((h) => (
        <section className="horizon" key={h} aria-label={h}>
          <h3>{h}</h3>
          <ul role="list">
            {groups.get(h)!.map((v) => (
              <li key={v.id}>
                <h4>
                  {v.title} <DraftFlag status={v.status} />
                </h4>
                {v.description && <p>{v.description}</p>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/** "Digital Creator | Technology & Lifestyle" → main title + quieter subtitle. */
export function SplitTitle({ text }: { text: string }) {
  const [main, ...rest] = text.split("|").map((t) => t.trim());
  return (
    <>
      {main}
      {rest.length > 0 && <span className="title-sub">{rest.join(" · ")}</span>}
    </>
  );
}
