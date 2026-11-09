import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Motion } from "@/components/site/Motion";
import { PreviewBar } from "@/components/site/PreviewBar";
import { getSiteContent } from "@/lib/data/content";
import "@/styles/site.css";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { profile, settings, preview } = await getSiteContent();
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      {preview && <PreviewBar />}
      <Header name={profile.full_name} />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <Footer profile={profile} settings={settings} />
      <Motion />
    </>
  );
}
