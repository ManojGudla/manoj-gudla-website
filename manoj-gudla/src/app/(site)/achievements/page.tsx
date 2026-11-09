import type { Metadata } from "next";
import { DraftFlag, Highlights, kindLabel, PageIntro } from "@/components/site/blocks";
import { resolveMediaFrom } from "@/components/site/resolve";
import { getSiteContent } from "@/lib/data/content";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Achievements & recognition",
  description: "Personal highlights, certifications and milestones.",
  alternates: { canonical: "/achievements" },
  openGraph: { url: "/achievements" },
};

export default async function AchievementsPage() {
  const content = await getSiteContent();
  const { achievements, certifications } = content;
  const highlights = achievements.filter((a) => a.kind === "highlight");
  const recognition = achievements.filter((a) => a.kind !== "highlight");

  return (
    <>
      <PageIntro
        title="Achievements & recognition"
        lead="Milestones I'm proud of so far. Personal highlights are marked as such; external recognition is listed separately."
      />

      {highlights.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }} aria-labelledby="hl-h">
          <div className="container">
            <h2 className="sr-only" id="hl-h">
              Personal highlights
            </h2>
            <Highlights items={highlights} />
          </div>
        </section>
      )}

      {recognition.length > 0 && (
        <section className="section" aria-labelledby="rec-h">
          <div className="container split">
            <div className="split__head">
              <h2 className="section-title" id="rec-h" data-reveal>
                Recognition &amp; milestones
              </h2>
            </div>
            <ul className="rows" role="list">
              {recognition.map((a) => {
                const proof = resolveMediaFrom(content, a.media_id);
                return (
                  <li key={a.id} style={{ display: "grid", gap: "0.35rem" }}>
                    <span className="meta">
                      {kindLabel[a.kind]}
                      {a.date_label ? `, ${a.date_label}` : ""} <DraftFlag status={a.status} />
                    </span>
                    <span className="title">{a.title}</span>
                    {a.issuer && <span className="muted">{a.issuer}</span>}
                    {a.description && <p className="muted">{a.description}</p>}
                    <span className="meta">
                      {a.link_url && (
                        <a className="text-link" href={a.link_url} target="_blank" rel="noopener noreferrer">
                          Learn more
                        </a>
                      )}{" "}
                      {proof && (
                        <a className="text-link" href={proof.url} target="_blank" rel="noopener">
                          View certificate
                        </a>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {certifications.length > 0 && (
        <section className="section section--band" aria-labelledby="certs-h">
          <div className="container split">
            <div className="split__head">
              <h2 className="section-title" id="certs-h" data-reveal>
                Certifications
              </h2>
            </div>
            <ul className="rows" role="list">
              {certifications.map((c) => (
                <li key={c.id}>
                  <span className="title">
                    {c.title} <DraftFlag status={c.status} />
                  </span>
                  <span className="meta">{[c.issuer, c.issued_label].filter(Boolean).join(", ")}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
