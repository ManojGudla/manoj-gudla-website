/** Site map — used by the header, the mobile menu, the footer and the sitemap. */
/** Main navigation — kept short on purpose. */
export const NAV = [
  { href: "/about", label: "About", hint: "Who I am and what drives me" },
  { href: "/journey", label: "Journey", hint: "Experience, education, skills and résumé" },
  { href: "/projects", label: "Projects", hint: "Products and ideas I'm building" },
  { href: "/creator", label: "Creator", hint: "Videos, reels and brand collaborations" },
] as const;

/** Secondary pages — linked from About, Journey and the footer. */
export const MORE = [
  { href: "/achievements", label: "Achievements", hint: "Highlights, certifications and milestones" },
  { href: "/beyond", label: "Beyond work", hint: "Interests and the human side" },
  { href: "/vision", label: "Vision", hint: "Where I'm heading next" },
] as const;

export const CONTACT = { href: "/contact", label: "Contact", hint: "Opportunities, partnerships and conversations" };
