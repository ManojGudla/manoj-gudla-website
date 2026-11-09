/**
 * Admin content collections.
 *
 * Each collection describes one database table and the form used to edit it.
 * The generic list/edit pages and the server actions are driven entirely by
 * this config, so adding a field here (and a column in the migration) is all
 * it takes to make it editable.
 */
import type { MediaCategory } from "@/lib/types";

type Base = {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  /** Spans the full form width. */
  wide?: boolean;
};

export type Field =
  | (Base & { type: "text"; max: number; placeholder?: string })
  | (Base & { type: "textarea"; max: number; rows?: number; placeholder?: string })
  | (Base & { type: "url" })
  | (Base & { type: "slug" })
  | (Base & { type: "number" })
  | (Base & { type: "date" })
  | (Base & { type: "boolean" })
  | (Base & { type: "select"; options: { value: string; label: string }[]; nullable?: boolean })
  | (Base & { type: "list"; maxItems: number; itemMax: number })
  | (Base & { type: "media"; category: MediaCategory; accept?: "image" | "pdf" });

export interface Collection {
  /** URL segment under /admin */
  key: string;
  table: string;
  singular: string;
  plural: string;
  description: string;
  /** Field shown as the row title in lists */
  titleField: string;
  /** Extra fields shown as small text in lists */
  metaFields?: string[];
  fields: Field[];
  /** Public page where this content appears (for "Preview") */
  previewPath?: (row: Record<string, unknown>) => string;
  /** Group in the sidebar */
  group: string;
}

const PLATFORMS = [
  { value: "youtube", label: "YouTube" },
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "other", label: "Other" },
];

export const COLLECTIONS: Collection[] = [
  {
    key: "projects",
    table: "projects",
    singular: "project",
    plural: "Projects",
    group: "Work",
    description: "Products and ventures shown on the Projects page. Featured projects also appear on the homepage.",
    titleField: "title",
    metaFields: ["dev_status", "slug"],
    previewPath: (r) => `/projects/${r.slug}`,
    fields: [
      { name: "title", label: "Title", type: "text", max: 160, required: true },
      { name: "slug", label: "Web address", type: "slug", required: true, hint: "Lowercase words and hyphens, e.g. my-project → /projects/my-project" },
      { name: "tagline", label: "Tagline", type: "text", max: 240, wide: true, hint: "One sentence shown under the title." },
      { name: "summary", label: "Short summary", type: "textarea", max: 600, rows: 3, wide: true, hint: "Used on cards and in search results." },
      { name: "overview", label: "Overview", type: "textarea", max: 6000, rows: 8, wide: true, hint: "Separate paragraphs with a blank line." },
      { name: "purpose", label: "Why it exists", type: "textarea", max: 3000, rows: 5, wide: true },
      {
        name: "dev_status",
        label: "Development status",
        type: "select",
        options: [
          { value: "idea", label: "Idea stage" },
          { value: "in_development", label: "In development" },
          { value: "live", label: "Live" },
          { value: "paused", label: "Paused" },
          { value: "archived", label: "Archived" },
        ],
      },
      { name: "is_featured", label: "Feature on the homepage", type: "boolean" },
      { name: "features", label: "Key features", type: "list", maxItems: 30, itemMax: 300, wide: true, hint: "One per line." },
      { name: "technologies", label: "Technologies", type: "list", maxItems: 30, itemMax: 60, hint: "One per line." },
      { name: "roadmap", label: "Roadmap (planned, not released)", type: "list", maxItems: 20, itemMax: 300, hint: "One per line." },
      { name: "live_url", label: "Live website", type: "url" },
      { name: "repo_url", label: "GitHub repository", type: "url" },
      { name: "cover_media_id", label: "Cover screenshot", type: "media", category: "project", wide: true },
    ],
  },
  {
    key: "creator-content",
    table: "creator_content",
    singular: "video or post",
    plural: "Creator content",
    group: "Creator",
    description: "YouTube videos, Instagram reels and posts you want to showcase. Added manually by link — nothing is pulled automatically.",
    titleField: "title",
    metaFields: ["platform", "category"],
    previewPath: () => "/creator",
    fields: [
      { name: "title", label: "Title", type: "text", max: 200, required: true, wide: true },
      { name: "url", label: "Link to the video or post", type: "url", required: true, wide: true, hint: "YouTube links get an automatic thumbnail if you don't upload one." },
      { name: "platform", label: "Platform", type: "select", options: PLATFORMS },
      {
        name: "category",
        label: "Category",
        type: "select",
        options: [
          { value: "technology", label: "Technology" },
          { value: "ai", label: "AI and emerging technologies" },
          { value: "lifestyle", label: "Lifestyle" },
        ],
      },
      { name: "description", label: "Description", type: "textarea", max: 1000, rows: 3, wide: true },
      { name: "published_on", label: "Published on", type: "date" },
      { name: "is_featured", label: "Featured", type: "boolean", hint: "Featured items show on the homepage." },
      { name: "thumbnail_media_id", label: "Thumbnail", type: "media", category: "thumbnail", wide: true },
    ],
  },
  {
    key: "creator-stats",
    table: "creator_stats",
    singular: "statistic",
    plural: "Audience statistics",
    group: "Creator",
    description:
      "Subscriber, follower and view figures. Shown as self-reported unless you mark them verified with a date. Keep them current — brands check.",
    titleField: "label",
    metaFields: ["value", "verification", "last_updated"],
    previewPath: () => "/creator",
    fields: [
      { name: "label", label: "Label", type: "text", max: 80, required: true, hint: "e.g. YouTube subscribers" },
      { name: "platform", label: "Platform", type: "select", options: PLATFORMS },
      { name: "value", label: "Number", type: "number", required: true, hint: "Exact number, e.g. 10000 — shown as 10K." },
      { name: "value_suffix", label: "Suffix", type: "text", max: 4, hint: "Optional, e.g. +" },
      {
        name: "verification",
        label: "Verification",
        type: "select",
        options: [
          { value: "self_reported", label: "Self-reported" },
          { value: "verified", label: "Verified (I checked the platform analytics)" },
        ],
      },
      { name: "verified_on", label: "Verified on", type: "date", hint: "Required when marked verified." },
      { name: "last_updated", label: "Figure last updated", type: "date", required: true },
      { name: "source_note", label: "Source note (private)", type: "text", max: 300, wide: true },
    ],
  },
  {
    key: "experience",
    table: "experience",
    singular: "role",
    plural: "Experience",
    group: "Journey",
    description: "Employment and internships on the Journey page. Leave unknown dates empty rather than guessing.",
    titleField: "organisation",
    metaFields: ["role_title", "start_label"],
    previewPath: () => "/journey",
    fields: [
      { name: "organisation", label: "Organisation", type: "text", max: 160, required: true },
      { name: "role_title", label: "Role / designation", type: "text", max: 160 },
      { name: "employment_type", label: "Type", type: "text", max: 60, placeholder: "Full-time, Internship…" },
      { name: "location", label: "Location", type: "text", max: 120 },
      { name: "start_label", label: "Start", type: "text", max: 40, placeholder: "e.g. Jun 2024" },
      { name: "end_label", label: "End", type: "text", max: 40, placeholder: "Leave empty if current" },
      { name: "is_current", label: "I currently work here", type: "boolean" },
      { name: "summary", label: "Summary", type: "textarea", max: 2000, rows: 3, wide: true },
      {
        name: "responsibilities",
        label: "Responsibilities and contributions",
        type: "list",
        maxItems: 20,
        itemMax: 300,
        wide: true,
        hint: "One per line. Avoid confidential client or project details.",
      },
    ],
  },
  {
    key: "education",
    table: "education",
    singular: "qualification",
    plural: "Education",
    group: "Journey",
    description: "Degrees and courses on the Journey page.",
    titleField: "qualification",
    metaFields: ["institution", "progress"],
    previewPath: () => "/journey",
    fields: [
      { name: "qualification", label: "Qualification", type: "text", max: 200, required: true, wide: true },
      { name: "field", label: "Specialisation", type: "text", max: 160 },
      { name: "institution", label: "Institution", type: "text", max: 200 },
      { name: "start_label", label: "Start", type: "text", max: 40 },
      { name: "end_label", label: "End / year completed", type: "text", max: 40 },
      {
        name: "progress",
        label: "Progress",
        type: "select",
        options: [
          { value: "completed", label: "Completed" },
          { value: "pursuing", label: "Pursuing" },
        ],
      },
      { name: "notes", label: "Notes", type: "textarea", max: 1000, rows: 3, wide: true },
    ],
  },
  {
    key: "skills",
    table: "skills",
    singular: "skill",
    plural: "Skills",
    group: "Journey",
    description:
      "Capabilities grouped on the Journey page. A proficiency level only appears publicly after you tick “Show proficiency”.",
    titleField: "name",
    metaFields: ["category", "proficiency"],
    previewPath: () => "/journey",
    fields: [
      { name: "name", label: "Skill", type: "text", max: 80, required: true },
      {
        name: "category",
        label: "Group",
        type: "select",
        options: [
          { value: "programming", label: "Programming" },
          { value: "development", label: "Development" },
          { value: "ai_analytics", label: "AI and analytics" },
          { value: "strengths", label: "Professional strengths" },
        ],
      },
      {
        name: "proficiency",
        label: "Proficiency",
        type: "select",
        nullable: true,
        options: [
          { value: "learning", label: "Learning" },
          { value: "working", label: "Working knowledge" },
          { value: "proficient", label: "Proficient" },
          { value: "advanced", label: "Advanced" },
        ],
      },
      { name: "proficiency_approved", label: "Show proficiency publicly (I approve this level)", type: "boolean" },
    ],
  },
  {
    key: "certifications",
    table: "certifications",
    singular: "certification",
    plural: "Certifications",
    group: "Journey",
    description: "Certificates you have genuinely completed. Upload the certificate or link the credential so visitors can check it.",
    titleField: "title",
    metaFields: ["issuer", "issued_label"],
    previewPath: () => "/journey",
    fields: [
      { name: "title", label: "Certificate", type: "text", max: 200, required: true, wide: true },
      { name: "issuer", label: "Issued by", type: "text", max: 160 },
      { name: "issued_label", label: "Issued", type: "text", max: 40, placeholder: "e.g. Mar 2025" },
      { name: "credential_url", label: "Credential link", type: "url", wide: true },
      { name: "media_id", label: "Certificate image or PDF", type: "media", category: "certificate", wide: true },
    ],
  },
  {
    key: "achievements",
    table: "achievements",
    singular: "achievement",
    plural: "Achievements",
    group: "Work",
    description:
      "Personal highlights and genuine external recognition. Only add awards, hackathons and recognition that really happened — with proof where possible.",
    titleField: "title",
    metaFields: ["kind", "date_label"],
    previewPath: () => "/achievements",
    fields: [
      { name: "title", label: "Title", type: "text", max: 200, required: true, wide: true },
      {
        name: "kind",
        label: "Type",
        type: "select",
        options: [
          { value: "highlight", label: "Personal highlight" },
          { value: "award", label: "Award" },
          { value: "certification", label: "Certification" },
          { value: "recognition", label: "Recognition" },
          { value: "hackathon", label: "Hackathon participation" },
          { value: "mentoring", label: "Mentoring" },
          { value: "milestone", label: "Milestone" },
        ],
      },
      { name: "date_label", label: "Date", type: "text", max: 40, placeholder: "e.g. 2025" },
      { name: "issuer", label: "Given by / organisation", type: "text", max: 160 },
      { name: "focus", label: "Focus (one line)", type: "text", max: 300, wide: true },
      { name: "description", label: "Description", type: "textarea", max: 2000, rows: 4, wide: true },
      { name: "link_url", label: "Link", type: "url" },
      { name: "media_id", label: "Supporting image or certificate", type: "media", category: "certificate", wide: true },
    ],
  },
  {
    key: "interests",
    table: "interests",
    singular: "interest",
    plural: "Interests",
    group: "Pages",
    description: "Personal interests on the Beyond Work and About pages.",
    titleField: "title",
    previewPath: () => "/beyond",
    fields: [
      { name: "title", label: "Interest", type: "text", max: 120, required: true },
      { name: "description", label: "Description", type: "textarea", max: 600, rows: 3, wide: true },
    ],
  },
  {
    key: "gallery",
    table: "gallery_items",
    singular: "photo",
    plural: "Gallery",
    group: "Pages",
    description: "Lifestyle photographs for the Beyond Work page.",
    titleField: "caption",
    metaFields: ["category"],
    previewPath: () => "/beyond",
    fields: [
      { name: "media_id", label: "Photograph", type: "media", category: "lifestyle", required: true, wide: true },
      { name: "caption", label: "Caption", type: "text", max: 300, wide: true },
      {
        name: "category",
        label: "Category",
        type: "select",
        options: [
          { value: "lifestyle", label: "Lifestyle" },
          { value: "technology", label: "Technology" },
          { value: "creating", label: "Creating content" },
          { value: "events", label: "Events and networking" },
          { value: "travel", label: "Travel" },
        ],
      },
    ],
  },
  {
    key: "vision",
    table: "vision_items",
    singular: "goal",
    plural: "Vision & goals",
    group: "Pages",
    description: "Future goals on the Vision page. These are always labelled as goals, never as achievements.",
    titleField: "title",
    metaFields: ["area", "horizon"],
    previewPath: () => "/vision",
    fields: [
      { name: "title", label: "Goal", type: "text", max: 160, required: true, wide: true },
      {
        name: "area",
        label: "Area",
        type: "select",
        options: [
          { value: "technologies", label: "Technologies to explore" },
          { value: "products", label: "Products to build" },
          { value: "business", label: "Business ideas" },
          { value: "skills", label: "Skills to master" },
          { value: "opportunities", label: "Opportunities ahead" },
          { value: "ambitions", label: "Long-term ambitions" },
        ],
      },
      {
        name: "horizon",
        label: "Time horizon",
        type: "select",
        options: [
          { value: "Now", label: "Now" },
          { value: "Ongoing", label: "Ongoing" },
          { value: "Next", label: "Next" },
          { value: "Long term", label: "Long term" },
        ],
      },
      { name: "description", label: "Description", type: "textarea", max: 800, rows: 3, wide: true },
    ],
  },
];

export function getCollection(key: string): Collection | undefined {
  return COLLECTIONS.find((c) => c.key === key);
}

export function getCollectionByTable(table: string): Collection | undefined {
  return COLLECTIONS.find((c) => c.table === table);
}
