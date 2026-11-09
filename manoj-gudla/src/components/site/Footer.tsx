import Link from "next/link";
import type { Profile, SiteSettings } from "@/lib/types";
import { CONTACT, MORE, NAV } from "./nav";
import { SocialLinks } from "./SocialLinks";

export function Footer({ profile, settings }: { profile: Profile; settings: SiteSettings }) {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <p className="footer-tag">{settings.footer_text || profile.tagline}</p>
            <div style={{ marginTop: "1.5rem" }}>
              <SocialLinks profile={profile} />
            </div>
          </div>
          <nav aria-label="Footer">
            <ul className="footer-links" role="list">
              <li>
                <Link href="/">Home</Link>
              </li>
              {[...NAV, ...MORE, CONTACT].map((n) => (
                <li key={n.href}>
                  <Link href={n.href}>{n.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="footer-base">
          <span>
            © {year} {profile.full_name}
          </span>
          {settings.contact_email && <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a>}
        </div>
      </div>
    </footer>
  );
}
