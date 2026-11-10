/** Site map — the header and mobile menu get the visible items from the server. */
export interface NavItem {
  href: string;
  label: string;
  hint: string;
}

export const CORE: NavItem[] = [
  { href: "/about", label: "About", hint: "Who I am and what drives me" },
  { href: "/journey", label: "Journey", hint: "Experience, education, skills and résumé" },
  { href: "/creator", label: "Creator", hint: "Videos, reels and brand collaborations" },
  { href: "/resources", label: "Resources", hint: "Free tools and links from my videos" },
];

export const PROJECTS: NavItem = { href: "/projects", label: "Projects", hint: "Products and ideas I'm building" };
export const SERVICES: NavItem = { href: "/work-with-me", label: "Work with me", hint: "Collaborations and services" };

/** Secondary pages — linked from About, Journey, the footer and the menu. */
export const MORE: NavItem[] = [
  { href: "/achievements", label: "Achievements", hint: "Highlights, certifications and milestones" },
  { href: "/beyond", label: "Beyond work", hint: "Interests and the human side" },
  { href: "/vision", label: "Vision", hint: "Where I'm heading next" },
];

export const CONTACT: NavItem = { href: "/contact", label: "Contact", hint: "Opportunities, partnerships and conversations" };

/** Main navigation for the current content: optional pages appear only when they have something to show. */
export function mainNav(opts: { hasProjects: boolean; hasServices: boolean }): NavItem[] {
  return [...CORE, ...(opts.hasServices ? [SERVICES] : []), ...(opts.hasProjects ? [PROJECTS] : [])];
}
