import type { Field } from "./collections";

export const profileFields: Field[] = [
  { name: "full_name", label: "Full name", type: "text", max: 120, required: true },
  { name: "experience_summary", label: "Experience summary", type: "text", max: 200, hint: "e.g. 2+ years — confirm against your résumé." },
  { name: "headline", label: "Headline", type: "text", max: 200, wide: true, hint: "Full professional positioning line." },
  { name: "roles", label: "Hero roles", type: "list", maxItems: 5, itemMax: 60, wide: true, hint: "One per line — shown under the tagline on the homepage." },
  { name: "tagline", label: "Tagline", type: "text", max: 200, wide: true },
  { name: "hero_intro", label: "Hero introduction", type: "textarea", max: 400, rows: 2, wide: true },
  { name: "short_bio", label: "Short biography", type: "textarea", max: 800, rows: 4, wide: true, hint: "Used on the homepage and in search results." },
  { name: "biography", label: "About page biography", type: "textarea", max: 6000, rows: 10, wide: true, hint: "Separate paragraphs with a blank line. The first paragraph becomes the About page introduction." },
  { name: "professional_intro", label: "Professional introduction", type: "textarea", max: 2000, rows: 4, wide: true },
  { name: "career_direction", label: "Career direction", type: "textarea", max: 2000, rows: 3, wide: true },
  { name: "philosophy", label: "Personal philosophy", type: "text", max: 400, wide: true },
  { name: "now_building", label: "Now — building", type: "text", max: 120, hint: "Homepage “Now” strip. Leave empty to hide a line." },
  { name: "now_learning", label: "Now — learning", type: "text", max: 120 },
  { name: "now_creating", label: "Now — creating", type: "text", max: 120 },
  { name: "services_intro", label: "“Work with me” introduction", type: "textarea", max: 800, rows: 3, wide: true },
  { name: "creator_title", label: "Creator title", type: "text", max: 200, wide: true, hint: "Use | to add a subtitle, e.g. Digital Creator | Technology & Lifestyle" },
  { name: "creator_intro", label: "Creator introduction", type: "textarea", max: 2000, rows: 4, wide: true },
  { name: "location", label: "Location", type: "text", max: 120 },
  { name: "show_location", label: "Show my location publicly", type: "boolean" },
  { name: "email", label: "Public email", type: "text", max: 254 },
  { name: "photo_media_id", label: "Portrait photograph (homepage)", type: "media", category: "profile", wide: true },
  { name: "about_photo_media_id", label: "About page photograph", type: "media", category: "profile", wide: true },
  { name: "creator_photo_media_id", label: "Creator hub photograph", type: "media", category: "profile", wide: true },
  { name: "resume_media_id", label: "Résumé (PDF)", type: "media", category: "document", accept: "pdf", wide: true },
];

export const socialFields: Field[] = [
  { name: "linkedin_url", label: "LinkedIn", type: "url" },
  { name: "instagram_url", label: "Instagram", type: "url" },
  { name: "youtube_url", label: "YouTube", type: "url" },
  { name: "github_url", label: "GitHub", type: "url" },
];

export const settingsFields: Field[] = [
  { name: "site_title", label: "Website title", type: "text", max: 120, required: true },
  { name: "tagline", label: "Website tagline", type: "text", max: 200 },
  { name: "seo_title", label: "Search engine title", type: "text", max: 120, wide: true, hint: "Shown in Google results and browser tabs on the homepage. Aim for under 60 characters." },
  { name: "meta_description", label: "Meta description", type: "textarea", max: 320, rows: 3, wide: true, hint: "Shown under the title in search results. Aim for 140–160 characters." },
  {
    name: "default_theme",
    label: "Default theme",
    type: "select",
    options: [
      { value: "system", label: "Follow the visitor's device" },
      { value: "light", label: "Premium Light" },
      { value: "dark", label: "Premium Dark" },
    ],
    hint: "Visitors can still switch; their choice is remembered.",
  },
  { name: "contact_email", label: "Contact email", type: "text", max: 254 },
  { name: "footer_text", label: "Footer text", type: "text", max: 400, wide: true },
  { name: "og_media_id", label: "Social sharing image", type: "media", category: "banner", wide: true, hint: "Shown when the site is shared on LinkedIn, WhatsApp, Facebook and X. Best at 1200 × 630. Leave empty to use the generated image." },
];

export const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
