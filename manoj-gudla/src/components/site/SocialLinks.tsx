import { GitHubIcon, InstagramIcon, LinkedInIcon, MailIcon, YouTubeIcon } from "@/components/ui/icons";
import type { Profile } from "@/lib/types";

export function SocialLinks({ profile, email = false }: { profile: Profile; email?: boolean }) {
  const links = [
    { href: profile.linkedin_url, label: "LinkedIn", Icon: LinkedInIcon },
    { href: profile.instagram_url, label: "Instagram", Icon: InstagramIcon },
    { href: profile.youtube_url, label: "YouTube", Icon: YouTubeIcon },
    { href: profile.github_url, label: "GitHub", Icon: GitHubIcon },
  ].filter((l) => l.href);

  return (
    <ul className="socials" role="list">
      {links.map(({ href, label, Icon }) => (
        <li key={label}>
          <a href={href} target="_blank" rel="me noopener noreferrer">
            <Icon />
            {label}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </li>
      ))}
      {email && profile.email && (
        <li>
          <a href={`mailto:${profile.email}`}>
            <MailIcon />
            {profile.email}
          </a>
        </li>
      )}
    </ul>
  );
}
