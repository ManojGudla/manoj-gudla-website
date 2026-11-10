import { Kicker, PageHero } from "@/components/site/blocks";
import type { Metadata } from "next";
import { ContactForm } from "@/components/site/ContactForm";
import { CopyText } from "@/components/site/CopyText";
import { SocialLinks } from "@/components/site/SocialLinks";
import { getSiteContent } from "@/lib/data/content";
import { turnstileSiteKey } from "@/lib/env";

export const metadata: Metadata = {
  title: "Contact & collaborations",
  description: "Career opportunities, partnerships, brand collaborations, projects or just a conversation — get in touch with Manoj Kumar Gudla.",
  alternates: { canonical: "/contact" },
  openGraph: { url: "/contact" },
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  const { topic } = await searchParams;
  const { profile, settings } = await getSiteContent();
  const email = settings.contact_email || profile.email;

  return (
    <>
    <PageHero mark="Say hi">
      <Kicker path="contact" />
      <h1 data-reveal>Let&apos;s connect.</h1>
      <p className="lead" data-reveal style={{ ["--rd" as string]: "120ms" }}>
        Roles, partnerships, brand collaborations, project ideas — or simply a good conversation. Tell me what you have in mind.
      </p>
    </PageHero>
    <section className="container section">
      <div className="contact-grid">
        <div>
          {email && (
            <div>
              <p className="meta" style={{ marginBottom: "0.5rem" }}>
                Prefer email?
              </p>
              <a className="contact-email" href={`mailto:${email}`}>
                {email}
              </a>
              <div style={{ marginTop: "0.9rem" }}>
                <CopyText text={email} label="Copy email address" />
              </div>
            </div>
          )}
          <div style={{ marginTop: "2rem" }}>
            <SocialLinks profile={profile} />
          </div>
          {profile.show_location && profile.location && (
            <p className="meta" style={{ marginTop: "1.5rem" }}>
              Based in {profile.location}
            </p>
          )}
        </div>
        <div>
          <ContactForm initialTopic={topic} turnstileSiteKey={turnstileSiteKey} email={email} />
        </div>
      </div>
    </section>
    </>
  );
}
