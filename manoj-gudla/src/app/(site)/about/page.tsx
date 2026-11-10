import type { Metadata } from "next";
import Link from "next/link";
import { Photo } from "@/components/site/Photo";
import { resolveMediaFrom } from "@/components/site/resolve";
import { DEFAULT_PORTRAIT } from "@/content/defaults";
import { getSiteContent } from "@/lib/data/content";
import { paragraphs } from "@/lib/format";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getSiteContent();
  return {
    title: "About",
    description: profile.short_bio.slice(0, 160),
    alternates: { canonical: "/about" },
    openGraph: { url: "/about", title: `About ${profile.full_name}` },
  };
}

export default async function AboutPage() {
  const content = await getSiteContent();
  const { profile, interests } = content;
  const lines = paragraphs(profile.biography);
  const [opening, ...restLines] = lines;
  const photo = resolveMediaFrom(content, profile.about_photo_media_id ?? profile.photo_media_id) ?? DEFAULT_PORTRAIT;
  const first = profile.full_name.split(" ")[0];

  return (
    <>
      <section className={`container page-intro ${photo ? "page-intro--split" : ""}`}>
        <div>
          <h1 data-reveal>Meet {profile.full_name}.</h1>
          {opening && (
            <p className="lead" data-reveal style={{ ["--rd" as string]: "120ms" }}>
              {opening}
            </p>
          )}
        </div>
        {photo && (
          <div className="page-intro__media" data-reveal data-parallax="0.05">
            <Photo media={photo} label={`Photograph of ${first}`} priority sizes="(min-width: 900px) 360px, 90vw" />
          </div>
        )}
      </section>

      <section className="section" aria-labelledby="story-h">
        <div className="container split">
          <div className="split__head">
            <h2 className="section-title" id="story-h" data-reveal>
              In my own words
            </h2>
          </div>
          <ol className="about-lines" role="list">
            {restLines.map((l, i) => (
              <li key={i} data-reveal>
                {l}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {profile.philosophy && (
        <section className="section section--band" aria-label="Personal philosophy">
          <div className="container">
            <blockquote className="philosophy" data-reveal>
              {profile.philosophy.replace(/^["“]|["”]$/g, "")}
            </blockquote>
          </div>
        </section>
      )}

      {interests.length > 0 && (
        <section className="section" aria-labelledby="loves-h">
          <div className="container split">
            <div className="split__head">
              <h2 className="section-title" id="loves-h" data-reveal>
                What I care about
              </h2>
            </div>
            <div>
              <ul className="interests" role="list">
                {interests.map((i) => (
                  <li key={i.id}>
                    <h3>{i.title}</h3>
                    <p>{i.description}</p>
                  </li>
                ))}
              </ul>
              <div className="section-foot">
                <Link href="/journey" className="btn">
                  My professional journey
                </Link>
                <Link href="/beyond" className="btn btn--ghost">
                  Life beyond work
                </Link>
                <Link href="/vision" className="btn btn--ghost">
                  Where I&apos;m heading
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
