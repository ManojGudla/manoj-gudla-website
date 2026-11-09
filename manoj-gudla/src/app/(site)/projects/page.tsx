import type { Metadata } from "next";
import Link from "next/link";
import { FeatureProject, PageIntro, ProjectCard } from "@/components/site/blocks";
import { getSiteContent } from "@/lib/data/content";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Projects & innovation",
  description: "Independent products, experiments and ventures by Manoj Kumar Gudla.",
  alternates: { canonical: "/projects" },
  openGraph: { url: "/projects" },
};

export default async function ProjectsPage() {
  const content = await getSiteContent();
  const featured = content.projects.filter((p) => p.is_featured);
  const others = content.projects.filter((p) => !p.is_featured);

  return (
    <>
      <PageIntro
        title="Projects & innovation"
        lead="Products and ideas I design, build and keep improving — independently, end to end."
      />
      <section className="section" style={{ paddingTop: 0 }} aria-label="Projects">
        <div className="container" style={{ display: "grid", gap: "3rem" }}>
          {content.projects.length === 0 && <p className="empty">Projects will appear here once they are published.</p>}
          {featured.map((p) => (
            <FeatureProject key={p.id} project={p} content={content} />
          ))}
          {others.length > 0 && (
            <div className="project-list">
              {others.map((p) => (
                <ProjectCard key={p.id} project={p} content={content} />
              ))}
            </div>
          )}
        </div>
      </section>
      <section className="section section--band">
        <div className="container cta">
          <h2>Want to build something together?</h2>
          <Link href="/contact" className="btn btn--accent">
            Start a project conversation
          </Link>
        </div>
      </section>
    </>
  );
}
