import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { getSiteContent, resolveMedia } from "@/lib/data/content";
import { siteUrl } from "@/lib/env";
import "@/styles/tokens.css";
import "@/styles/base.css";

const geist = localFont({
  src: "./fonts/Geist-Variable.woff2",
  variable: "--font-geist",
  weight: "100 900",
  display: "swap",
});

const newsreader = localFont({
  src: [
    { path: "./fonts/Newsreader.woff2", style: "normal" },
    { path: "./fonts/Newsreader-Italic.woff2", style: "italic" },
  ],
  variable: "--font-newsreader",
  weight: "200 800",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent().catch(() => null);
  const s = content?.settings;
  const name = content?.profile.full_name ?? "Manoj Kumar Gudla";
  const title = s?.seo_title || name;
  const description = s?.meta_description || "";
  const og = content ? resolveMedia(content, s?.og_media_id) : null;

  return {
    metadataBase: new URL(siteUrl),
    title: { default: title, template: `%s — ${s?.site_title || name}` },
    description,
    applicationName: s?.site_title || name,
    authors: [{ name }],
    creator: name,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      siteName: s?.site_title || name,
      title,
      description,
      url: "/",
      locale: "en_IN",
      ...(og ? { images: [{ url: og.url, alt: og.alt || name }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(og ? { images: [og.url] } : {}),
    },
    robots: { index: true, follow: true },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f2ee" },
    { media: "(prefers-color-scheme: dark)", color: "#121214" },
  ],
  width: "device-width",
  initialScale: 1,
};

/** Runs before first paint so there is no flash of the wrong theme. */
const themeScript = `(function(){try{var d=document.documentElement;d.classList.add('js');var s=localStorage.getItem('theme');var t=(s==='light'||s==='dark')?s:(d.getAttribute('data-default-theme')||'system');if(t==='system'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}d.setAttribute('data-theme',t)}catch(e){}})();`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const content = await getSiteContent().catch(() => null);
  const defaultTheme = content?.settings.default_theme ?? "system";
  return (
    <html
      lang="en-IN"
      data-default-theme={defaultTheme}
      className={`${geist.variable} ${newsreader.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
