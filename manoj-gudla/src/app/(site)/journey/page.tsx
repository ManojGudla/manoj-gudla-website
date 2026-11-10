import type { Metadata } from "next";
import Link from "next/link";
import { DraftFlag, PageIntro } from "@/components/site/blocks";
import { Marquee } from "@/components/site/Marquee";
import { TopicIcon } from "@/components/site/TopicIcon";
import { resolveMediaFrom } from "@/components/site/resolve";
import { DownloadIcon } from "@/components/ui/icons";
import { getSiteContent } from "@/lib/data/content";
import { dateRange } from "@/lib/format";
import type { Skill, SkillCategory } from "@/lib/types";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Professional journey",
  description: "Experience, education, skills, certifications and career direction — with résumé download.",
  alternates: { canonical: "/journey" },
  openGraph: { url: "/journey" },
};

const GROUPS: { key: SkillCategory; label: string; icon: string }[] = [
  { key: "programming", label: "Programming", icon: "code" },
  { key: "development", label: "Development", icon: "software" },
  { key: "ai_analytics", label: "AI and analytics", icon: "ai" },
  { key: "strengths", label: "Professional strengths", icon: "people" },
];

const LEVEL: Record<NonNullable<Skill["proficiency"]>, string> = {
  learning: "Learning",
  working: "Working knowledge",
  proficient: "Proficient",
  advanced: "Advanced",
};

export default async function JourneyPage() {
  const content = await getSiteContent();
  const { profile, experience, education, skills, certifications } = content;
  const resume = resolveMediaFrom(content, profile.resume_media_id);
  const contributions = experience.flatMap((e) => e.responsibilities.map((r) => ({ r, org: e.organisation })));

  return (
    <>
      <PageIntro
        path="journey"
        mark="Journey"
        title="Professional journey"
        lead={profile.professional_intro}
        after={<Marquee items={skills.map((s) => s.name)} />}
      >
        <div className="section-foot" style={{ marginTop: "2rem" }}>
          {resume ? (
            <a href={resume.url} className="btn" download target="_blank" rel="noopener">
              <DownloadIcon /> Download résumé (PDF)
            </a>
          ) : (
            <Link href="/contact?topic=career" className="btn">
              Request my résumé
            </Link>
          )}
          <Link href="/contact" className="btn btn--ghost">
            Discuss an opportunity
          </Link>
        </div>
      </PageIntro>

      {experience.length > 0 && (
        <section className="section" aria-labelledby="exp-h">
          <div className="container split">
            <div className="split__head">
              <h2 className="section-title" id="exp-h" data-reveal>
                Experience
              </h2>
              {profile.experience_summary && <p className="section-sub">{profile.experience_summary} in the industry.</p>}
            </div>
            <ol className="timeline" role="list">
              {experience.map((e) => (
                <li key={e.id} className="spot">
                  <div className="when">
                    {dateRange(e.start_label, e.end_label, e.is_current)}
                    {e.is_current && (
                      <div className="badge-current">
                        <span className="status-dot status-dot--live" aria-hidden /> Current
                      </div>
                    )}
                  </div>
                  <div>
                    <h3>
                      {e.role_title || e.organisation} <DraftFlag status={e.status} />
                    </h3>
                    {e.role_title && (
                      <p className="org">
                        {[e.organisation, e.employment_type, e.location].filter(Boolean).join(", ")}
                      </p>
                    )}
                    {e.summary && <p className="summary">{e.summary}</p>}
                    {e.responsibilities.length > 0 && (
                      <ul className="ticks">
                        {e.responsibilities.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {education.length > 0 && (
        <section className="section" aria-labelledby="edu-h">
          <div className="container split">
            <div className="split__head">
              <h2 className="section-title" id="edu-h" data-reveal>
                Education
              </h2>
            </div>
            <ol className="timeline" role="list">
              {education.map((e) => (
                <li key={e.id} className="spot">
                  <div className="when">
                    {dateRange(e.start_label, e.end_label, false) || (e.progress === "pursuing" ? "In progress" : "Completed")}
                  </div>
                  <div>
                    <h3>
                      {e.qualification} <DraftFlag status={e.status} />
                    </h3>
                    <p className="org">{[e.field, e.institution].filter(Boolean).join(", ")}</p>
                    {e.notes && <p className="summary">{e.notes}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {skills.length > 0 && (
        <section className="section section--band" aria-labelledby="skills-h">
          <div className="container split">
            <div className="split__head">
              <h2 className="section-title" id="skills-h" data-reveal>
                Capabilities
              </h2>
              <p className="section-sub">The tools and strengths I work with.</p>
            </div>
            <div className="skill-groups">
              {GROUPS.map((g) => {
                const list = skills.filter((s) => s.category === g.key);
                if (!list.length) return null;
                return (
                  <div className="skill-group spot" key={g.key}>
                    <h3>
                      <TopicIcon topic={g.icon} /> {g.label}
                    </h3>
                    <ul className="chips" role="list">
                      {list.map((s) => (
                        <li key={s.id} className="chip">
                          {s.name}
                          {/* Proficiency only appears once Manoj has approved it */}
                          {s.proficiency && s.proficiency_approved && <span className="level">, {LEVEL[s.proficiency]}</span>}
                          <DraftFlag status={s.status} />
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {certifications.length > 0 && (
        <section className="section" aria-labelledby="cert-h">
          <div className="container split">
            <div className="split__head">
              <h2 className="section-title" id="cert-h" data-reveal>
                Certifications
              </h2>
              <p className="section-sub">
                <Link href="/achievements" className="text-link">
                  See achievements and milestones
                </Link>
              </p>
            </div>
            <ul className="certs" role="list">
              {certifications.map((c) => {
                const proof = resolveMediaFrom(content, c.media_id);
                return (
                  <li key={c.id} className="spot">
                    <span className="certs__mono" aria-hidden>
                      {(c.issuer || c.title).trim().charAt(0).toUpperCase()}
                    </span>
                    <span className="title">
                      {c.title} <DraftFlag status={c.status} />
                    </span>
                    <span className="meta">
                      {[c.issuer, c.issued_label].filter(Boolean).join(", ")}
                      {c.credential_url && (
                        <>
                          {" "}
                          <a className="text-link" href={c.credential_url} target="_blank" rel="noopener noreferrer">
                            Verify credential
                          </a>
                        </>
                      )}
                      {proof && (
                        <>
                          {" "}
                          <a className="text-link" href={proof.url} target="_blank" rel="noopener">
                            View certificate
                          </a>
                        </>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {contributions.length > 0 && (
        <section className="section" aria-labelledby="contrib-h">
          <div className="container split">
            <div className="split__head">
              <h2 className="section-title" id="contrib-h" data-reveal>
                Contributions
              </h2>
            </div>
            <ul className="ticks">
              {contributions.map(({ r, org }) => (
                <li key={org + r}>{r}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {profile.career_direction && (
        <section className="section section--stage stage" data-stage aria-labelledby="dir-h">
          <div className="stage-glow" aria-hidden />
          <div className="container split">
            <div className="split__head">
              <h2 className="section-title" id="dir-h" data-reveal>
                Career direction
              </h2>
            </div>
            <div>
              <p className="statement" data-reveal>
                {profile.career_direction}
              </p>
              <div className="section-foot">
                <Link href="/contact" className="btn btn--accent">
                  Talk about a role
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
