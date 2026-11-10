import type { Metadata } from "next";
import Image from "next/image";
import { DraftFlag, PageIntro } from "@/components/site/blocks";
import { DEFAULT_GALLERY } from "@/content/defaults";
import { TopicIcon } from "@/components/site/TopicIcon";
import { resolveMediaFrom } from "@/components/site/resolve";
import { getSiteContent } from "@/lib/data/content";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Beyond work",
  description: "Interests, experiments and everyday life: the human side of Manoj Kumar Gudla.",
  alternates: { canonical: "/beyond" },
  openGraph: { url: "/beyond" },
};

export default async function BeyondPage() {
  const content = await getSiteContent();
  const { interests, gallery } = content;
  const photos = gallery
    .map((g) => ({ ...g, media: resolveMediaFrom(content, g.media_id) }))
    .filter((g) => g.media);
  const shown = photos.length > 0 ? photos : DEFAULT_GALLERY.map((g) => ({ ...g, status: "published" as const }));

  return (
    <>
      <PageIntro
        path="beyond-work"
        mark="Curious"
        title="Beyond work"
        lead="The things I do when nobody's asking: exploring, experimenting, creating and meeting people."
      />

      {interests.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }} aria-labelledby="int-h">
          <div className="container split">
            <div className="split__head">
              <h2 className="section-title" id="int-h" data-reveal>
                What keeps me curious
              </h2>
            </div>
            <ul className="interests" role="list">
              {interests.map((i) => (
                <li key={i.id} className="spot">
                  <TopicIcon topic={`${i.title} ${i.description}`} />
                  <h3>
                    {i.title} <DraftFlag status={i.status} />
                  </h3>
                  <p>{i.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {shown.length > 0 && (
        <section className="section section--band" aria-labelledby="gal-h">
          <div className="container">
            <h2 className="section-title" id="gal-h" data-reveal style={{ marginBottom: "2.5rem" }}>
              Moments
            </h2>
            <div className="gallery">
              {shown.map((g) => (
                <figure key={g.id}>
                  <div className="frame frame--zoom">
                    <Image
                      src={g.media!.url}
                      alt={g.media!.alt || g.caption || ""}
                      width={g.media!.width ?? 1200}
                      height={g.media!.height ?? 900}
                      sizes="(min-width: 1000px) 33vw, (min-width: 600px) 50vw, 100vw"
                      style={{ width: "100%", height: "auto" }}
                    />
                  </div>
                  {(g.caption || g.status === "draft") && (
                    <figcaption>
                      {g.caption} <DraftFlag status={g.status} />
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
