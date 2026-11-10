import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DraftFlag } from "@/components/site/blocks";
import { getSiteContent } from "@/lib/data/content";
import { enquiryCategoryLabel } from "@/lib/format";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Work with me",
  description: "Brand collaborations and digital services — what I offer and how to start.",
  alternates: { canonical: "/work-with-me" },
  openGraph: { url: "/work-with-me" },
};

export default async function WorkWithMePage() {
  const { services, profile } = await getSiteContent();
  // The page only exists once at least one service is published.
  if (services.length === 0) notFound();

  return (
    <>
      <section className="container page-intro">
        <h1 data-reveal>Work with me</h1>
        {profile.services_intro && (
          <p className="lead" data-reveal style={{ ["--rd" as string]: "120ms", maxWidth: "48ch" }}>
            {profile.services_intro}
          </p>
        )}
      </section>

      <section className="container" style={{ paddingBottom: "var(--section)" }} aria-label="Services">
        <ul className="svc-grid" role="list">
          {services.map((s, i) => (
            <li key={s.id} className="tile svc" data-reveal style={{ ["--rd" as string]: `${i * 90}ms` }}>
              <h2 className="tile__title">
                {s.title} <DraftFlag status={s.status} />
              </h2>
              {s.summary && <p>{s.summary}</p>}
              {s.for_whom && (
                <p className="svc__for">
                  <span className="muted">For </span>
                  {s.for_whom}
                </p>
              )}
              {s.deliverables.length > 0 && (
                <ul className="ticks">
                  {s.deliverables.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              )}
              <div className="tile__foot">
                <Link href={`/contact?topic=${s.enquiry_type}`} className="btn btn--sm">
                  Start a conversation
                </Link>
                <span className="muted" style={{ fontSize: "var(--fs-meta)" }}>
                  {enquiryCategoryLabel[s.enquiry_type]}
                </span>
              </div>
            </li>
          ))}
        </ul>

        <div className="how">
          <h2 className="sub-h">How it works</h2>
          <ol className="steps" role="list">
            <li>
              <strong>Tell me what you need</strong>
              <span>A few lines through the contact form are enough to start.</span>
            </li>
            <li>
              <strong>We agree the plan</strong>
              <span>Scope, timeline and price, in writing, before any work starts.</span>
            </li>
            <li>
              <strong>I deliver</strong>
              <span>With check-ins along the way, so there are no surprises.</span>
            </li>
          </ol>
        </div>
      </section>
    </>
  );
}
