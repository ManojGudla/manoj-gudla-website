/**
 * Content models — mirror the tables in supabase/migrations/0001_schema.sql.
 * The public website and the admin dashboard both use these types.
 */

export type PublishStatus = "draft" | "published";

interface Timestamps {
  created_at: string;
  updated_at: string;
}

interface Publishable extends Timestamps {
  id: string;
  sort_order: number;
  status: PublishStatus;
}

export type MediaCategory =
  | "profile"
  | "lifestyle"
  | "project"
  | "certificate"
  | "thumbnail"
  | "banner"
  | "gallery"
  | "document";

export interface MediaAsset extends Timestamps {
  id: string;
  storage_path: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  alt_text: string;
  category: MediaCategory;
  created_by: string | null;
}

/** A media asset resolved to a public URL, ready to render. */
export interface ResolvedMedia {
  id: string;
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
  mime: string;
}

export interface Profile extends Timestamps {
  id: 1;
  full_name: string;
  headline: string;
  roles: string[];
  tagline: string;
  hero_intro: string;
  short_bio: string;
  biography: string;
  professional_intro: string;
  career_direction: string;
  philosophy: string;
  location: string;
  show_location: boolean;
  email: string;
  linkedin_url: string;
  instagram_url: string;
  youtube_url: string;
  github_url: string;
  creator_title: string;
  creator_intro: string;
  experience_summary: string;
  now_building: string;
  now_learning: string;
  now_creating: string;
  services_intro: string;
  photo_media_id: string | null;
  about_photo_media_id: string | null;
  creator_photo_media_id: string | null;
  resume_media_id: string | null;
}

export interface SiteSettings extends Timestamps {
  id: 1;
  site_title: string;
  tagline: string;
  seo_title: string;
  meta_description: string;
  default_theme: "system" | "light" | "dark";
  footer_text: string;
  contact_email: string;
  og_media_id: string | null;
}

export interface Experience extends Publishable {
  organisation: string;
  role_title: string;
  employment_type: string;
  location: string;
  start_label: string;
  end_label: string;
  is_current: boolean;
  summary: string;
  responsibilities: string[];
}

export interface Education extends Publishable {
  qualification: string;
  field: string;
  institution: string;
  start_label: string;
  end_label: string;
  progress: "completed" | "pursuing";
  notes: string;
}

export type SkillCategory = "programming" | "development" | "ai_analytics" | "strengths";
export type Proficiency = "learning" | "working" | "proficient" | "advanced";

export interface Skill extends Publishable {
  name: string;
  category: SkillCategory;
  proficiency: Proficiency | null;
  proficiency_approved: boolean;
}

export interface Certification extends Publishable {
  title: string;
  issuer: string;
  issued_label: string;
  credential_url: string;
  media_id: string | null;
}

export type DevStatus = "idea" | "in_development" | "live" | "paused" | "archived";

export interface Project extends Publishable {
  slug: string;
  title: string;
  tagline: string;
  summary: string;
  overview: string;
  purpose: string;
  dev_status: DevStatus;
  features: string[];
  technologies: string[];
  roadmap: string[];
  live_url: string;
  repo_url: string;
  cover_media_id: string | null;
  is_featured: boolean;
}

export interface ProjectImage extends Timestamps {
  id: string;
  project_id: string;
  media_id: string;
  caption: string;
  sort_order: number;
}

export type Platform = "youtube" | "instagram" | "linkedin" | "other";
export type ContentCategory = "technology" | "lifestyle" | "ai";

export interface CreatorContent extends Publishable {
  platform: Platform;
  url: string;
  title: string;
  description: string;
  category: ContentCategory;
  thumbnail_media_id: string | null;
  published_on: string | null;
  is_featured: boolean;
  resource_pack_id: string | null;
}

export interface CreatorStat extends Publishable {
  platform: Platform;
  label: string;
  value: number;
  value_suffix: string;
  verification: "self_reported" | "verified";
  verified_on: string | null;
  last_updated: string;
  source_note: string;
}

export type AchievementKind =
  | "highlight"
  | "award"
  | "certification"
  | "recognition"
  | "hackathon"
  | "mentoring"
  | "milestone";

export interface Achievement extends Publishable {
  kind: AchievementKind;
  title: string;
  focus: string;
  description: string;
  issuer: string;
  date_label: string;
  link_url: string;
  media_id: string | null;
}

export interface GalleryItem extends Publishable {
  media_id: string;
  caption: string;
  category: "lifestyle" | "technology" | "creating" | "events" | "travel";
}

export interface Interest extends Publishable {
  title: string;
  description: string;
}

export type VisionArea =
  | "technologies"
  | "products"
  | "business"
  | "skills"
  | "opportunities"
  | "ambitions";

export interface VisionItem extends Publishable {
  area: VisionArea;
  title: string;
  description: string;
  horizon: string;
}

export type EnquiryCategory = "career" | "partnership" | "brand" | "project" | "general";
export type EnquiryStatus = "new" | "read" | "responded" | "archived";

export interface Enquiry extends Timestamps {
  id: string;
  full_name: string;
  email: string;
  organisation: string;
  category: EnquiryCategory;
  subject: string;
  message: string;
  status: EnquiryStatus;
  admin_notes: string;
  ip_hash: string;
  user_agent: string;
}

export type Pricing = "free" | "freemium" | "paid";

export interface Resource extends Publishable {
  name: string;
  url: string;
  description: string;
  category: string;
  pricing: Pricing;
  tag: string;
}

export interface ResourcePack extends Publishable {
  code: string;
  title: string;
  intro: string;
  keyword: string;
  video_url: string;
  platform: Platform;
  published_on: string | null;
}

export interface ResourcePackItem extends Timestamps {
  id: string;
  pack_id: string;
  resource_id: string;
  note: string;
  sort_order: number;
}

export interface Service extends Publishable {
  title: string;
  summary: string;
  for_whom: string;
  deliverables: string[];
  enquiry_type: EnquiryCategory;
}

/** Everything the public site needs, loaded once per request/revalidation. */
export interface SiteContent {
  profile: Profile;
  settings: SiteSettings;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  certifications: Certification[];
  projects: Project[];
  projectImages: ProjectImage[];
  creatorContent: CreatorContent[];
  creatorStats: CreatorStat[];
  achievements: Achievement[];
  gallery: GalleryItem[];
  interests: Interest[];
  vision: VisionItem[];
  resources: Resource[];
  packs: ResourcePack[];
  packItems: ResourcePackItem[];
  services: Service[];
  media: Record<string, ResolvedMedia>;
  /** "database" when read from Supabase, "seed" when running without a database. */
  source: "database" | "seed";
  /** True when drafts are included (admin preview mode). */
  preview: boolean;
}
