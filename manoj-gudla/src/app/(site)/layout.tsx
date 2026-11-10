import { CommandMenu, type CommandItem } from "@/components/site/CommandMenu";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Motion } from "@/components/site/Motion";
import { StageGlow } from "@/components/site/StageGlow";
import { PreviewBar } from "@/components/site/PreviewBar";
import { CONTACT, MORE, mainNav } from "@/components/site/nav";
import { getSiteContent } from "@/lib/data/content";
import { platformLabel } from "@/lib/format";
import "@/styles/site.css";
import "@/styles/home.css";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { profile, settings, preview, projects, services, packs, resources, creatorContent } = await getSiteContent();
  const nav = mainNav({ hasProjects: projects.length > 0, hasServices: services.length > 0 });

  // Everything the Ctrl/⌘ + K menu can jump to — built from real content only.
  const commands: CommandItem[] = [
    { id: "p-home", label: "Home", group: "Pages", href: "/" },
    ...[...nav, ...MORE, CONTACT].map((n) => ({ id: `p-${n.href}`, label: n.label, hint: n.hint, group: "Pages", href: n.href })),
    ...packs.map((p) => ({
      id: `k-${p.id}`,
      label: p.title,
      hint: `/r/${p.code}`,
      group: "From my videos",
      href: `/r/${p.code}`,
      keywords: `${p.keyword} ${p.code}`,
    })),
    ...creatorContent.map((c) => ({
      id: `v-${c.id}`,
      label: c.title,
      hint: platformLabel[c.platform],
      group: "Videos",
      href: c.url,
      external: true,
    })),
    ...projects.map((p) => ({ id: `j-${p.id}`, label: p.title, hint: p.summary, group: "Projects", href: `/projects/${p.slug}` })),
    ...resources.map((r) => ({
      id: `r-${r.id}`,
      label: r.name,
      hint: r.category,
      group: "Resources",
      href: r.url,
      external: true,
      keywords: r.description,
    })),
    ...[
      [profile.youtube_url, "YouTube channel"],
      [profile.instagram_url, "Instagram"],
      [profile.linkedin_url, "LinkedIn"],
      [profile.github_url, "GitHub"],
    ]
      .filter(([url]) => url)
      .map(([url, label]) => ({ id: `s-${label}`, label, group: "Elsewhere", href: url, external: true })),
  ];

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      {preview && <PreviewBar />}
      <Header name={profile.full_name} nav={nav} />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <Footer profile={profile} settings={settings} nav={nav} />
      <CommandMenu items={commands} />
      <Motion />
      <StageGlow />
    </>
  );
}
