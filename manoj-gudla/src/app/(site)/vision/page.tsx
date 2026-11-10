import type { Metadata } from "next";
import Link from "next/link";
import { Horizons, PageIntro } from "@/components/site/blocks";
import { getSiteContent } from "@/lib/data/content";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Vision & ambitions",
  description: "The technologies, products, skills and ventures Manoj Kumar Gudla is working towards.",
  alternates: { canonical: "/vision" },
  openGraph: { url: "/vision" },
};

export default async function VisionPage() {
  const { vision } = await getSiteContent();

  return (
    <>
      <PageIntro
        path="vision"
        mark="Next"
        title="Vision & ambitions"
        lead="Build a recognisable personal brand that connects technology, innovation, creativity, business and entrepreneurship."
      >
        <p className="goal-note" style={{ marginTop: "1.75rem" }}>
          Everything on this page is a goal or a plan, not a finished achievement.
        </p>
      </PageIntro>

      {vision.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }} aria-labelledby="hz-h">
          <div className="container">
            <h2 className="sr-only" id="hz-h">
              By time horizon
            </h2>
            <Horizons items={vision} />
          </div>
        </section>
      )}

      <section className="section">
        <div className="container cta">
          <h2>Building in the same direction?</h2>
          <Link href="/contact?topic=partnership" className="btn btn--accent">
            Let&apos;s talk
          </Link>
        </div>
      </section>
    </>
  );
}
