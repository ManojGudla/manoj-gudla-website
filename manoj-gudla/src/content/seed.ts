/**
 * Initial content.
 *
 * This file is the single source for the starting content. It is used:
 *  1. by `npm run db:seed-sql`, which turns it into supabase/seed.sql, and
 *  2. as a read-only fallback when the site runs without a database
 *     (local preview before Supabase is configured).
 *
 * After the database is seeded, edit content in the admin dashboard —
 * not here. Everything below is truthful to the brief: no invented
 * metrics, awards, dates or responsibilities. Unknown values are empty
 * strings, which the site shows as nothing (public) or "to add" (admin).
 */
import type {
  Achievement,
  Certification,
  CreatorContent,
  CreatorStat,
  Education,
  Experience,
  GalleryItem,
  Interest,
  Profile,
  Project,
  ProjectImage,
  SiteSettings,
  Skill,
  VisionItem,
} from "@/lib/types";

const T = "2026-11-09T00:00:00.000Z";
const ts = { created_at: T, updated_at: T };

/** Stable, valid v4-shaped UUIDs so seed SQL and fallback content match. */
const id = (group: number, n: number) =>
  `00000000-0000-4000-8${group.toString(16).padStart(3, "0")}-${n.toString(16).padStart(12, "0")}`;

export const seedProfile: Profile = {
  id: 1,
  ...ts,
  full_name: "Manoj Kumar Gudla",
  headline:
    "Technology Professional | AI & Innovation Enthusiast | Digital Creator | Entrepreneurial Builder",
  roles: ["Technology Professional", "AI & Innovation Enthusiast", "Digital Creator"],
  tagline: "Think Beyond Limits. Build What Matters.",
  hero_intro:
    "Exploring technology, creating digital experiences, sharing ideas and building opportunities for tomorrow.",
  short_bio:
    "I'm Manoj Kumar Gudla, a technology-driven professional, content creator and entrepreneurial builder. I enjoy exploring new technologies, creating digital experiences, sharing ideas and turning opportunities into meaningful work.",
  biography: [
    "A curious mind, creative thinker and ambitious builder.",
    "I'm passionate about technology, emerging AI tools, content creation and entrepreneurship.",
    "I enjoy experimenting with ideas, developing new skills, connecting with people and exploring opportunities.",
    "Beyond my professional journey, I enjoy creating YouTube videos and Instagram reels, exploring business ideas and discovering new technologies.",
  ].join("\n\n"),
  professional_intro:
    "I'm a technology professional at Tata Consultancy Services (TCS), currently contributing to an AI and machine learning project. Alongside my role, I build independent products, create content and keep learning the tools that are shaping what comes next.",
  career_direction:
    "I'm working towards AI and technology innovation roles — where curiosity, problem-solving and building things people actually use come together.",
  philosophy: "I believe in thinking big, taking action and learning along the way.",
  location: "Hyderabad, India",
  show_location: false,
  email: "manowj.tech@gmail.com",
  linkedin_url: "https://linkedin.com/in/manojkumar946",
  instagram_url: "https://www.instagram.com/manowj_official/",
  youtube_url: "https://www.youtube.com/@maNOWj_Official",
  github_url: "https://github.com/ManojGudla",
  creator_title: "Digital Creator | Technology & Lifestyle",
  creator_intro:
    "I create YouTube videos and Instagram reels about technology, AI and emerging tools — and the lifestyle around building things. The aim is simple: make new technology feel approachable, useful and a little more exciting.",
  experience_summary: "2+ years",
  photo_media_id: null,
  about_photo_media_id: null,
  creator_photo_media_id: null,
  resume_media_id: null,
};

export const seedSettings: SiteSettings = {
  id: 1,
  ...ts,
  site_title: "Manoj Kumar Gudla",
  tagline: "Think Beyond Limits. Build What Matters.",
  seo_title: "Manoj Kumar Gudla — Technology Professional, Digital Creator & Builder",
  meta_description:
    "Manoj Kumar Gudla is a technology professional, AI & innovation enthusiast, digital creator and entrepreneurial builder. Explore his work, projects, content and ways to connect.",
  default_theme: "system",
  footer_text: "Think Beyond Limits. Build What Matters.",
  contact_email: "manowj.tech@gmail.com",
  og_media_id: null,
};

export const seedExperience: Experience[] = [
  {
    id: id(1, 1),
    ...ts,
    organisation: "Tata Consultancy Services (TCS)",
    role_title: "Assistant System Engineer",
    employment_type: "Full-time",
    location: "Hyderabad, India",
    start_label: "Jun 2024",
    end_label: "",
    is_current: true,
    summary: "Currently contributing to an AI & ML project.",
    responsibilities: [],
    sort_order: 10,
    status: "published",
  },
  {
    id: id(1, 2),
    ...ts,
    organisation: "HMI, Srikakulam",
    role_title: "Python Developer Intern",
    employment_type: "Internship",
    location: "Srikakulam, India",
    start_label: "Mar 2024",
    end_label: "May 2024",
    is_current: false,
    summary: "",
    responsibilities: [],
    sort_order: 20,
    status: "draft",
  },
  {
    id: id(1, 3),
    ...ts,
    organisation: "Adhoc Network Tech Company",
    role_title: "Java Full-Stack Developer Intern",
    employment_type: "Internship",
    location: "Visakhapatnam, India",
    start_label: "Oct 2023",
    end_label: "Dec 2023",
    is_current: false,
    summary: "",
    responsibilities: [],
    sort_order: 30,
    status: "draft",
  },
];

export const seedEducation: Education[] = [
  {
    id: id(2, 1),
    ...ts,
    qualification: "Master of Computer Applications (MCA)",
    field: "Data Science",
    institution: "Vignan University",
    start_label: "",
    end_label: "",
    progress: "completed",
    notes: "",
    sort_order: 10,
    status: "published",
  },
  {
    id: id(2, 2),
    ...ts,
    qualification: "Bachelor of Computer Applications (BCA)",
    field: "",
    institution: "Aditya Degree College, Srikakulam",
    start_label: "",
    end_label: "2024",
    progress: "completed",
    notes: "",
    sort_order: 20,
    status: "published",
  },
];

const skill = (
  n: number,
  name: string,
  category: Skill["category"],
): Skill => ({
  id: id(3, n),
  ...ts,
  name,
  category,
  proficiency: null,
  proficiency_approved: false,
  sort_order: n * 10,
  status: "published",
});

export const seedSkills: Skill[] = [
  skill(1, "Python", "programming"),
  skill(2, "Java", "programming"),
  skill(3, "SQL", "programming"),
  skill(4, "Software development", "development"),
  skill(5, "Web technologies", "development"),
  skill(6, "Artificial intelligence", "ai_analytics"),
  skill(7, "Emerging technologies", "ai_analytics"),
  skill(8, "Data analytics", "ai_analytics"),
  skill(9, "Power BI", "ai_analytics"),
  skill(10, "Problem-solving", "strengths"),
  skill(11, "Innovation", "strengths"),
  skill(12, "Communication", "strengths"),
  skill(13, "Mentoring", "strengths"),
  skill(14, "Collaboration", "strengths"),
];

export const seedCertifications: Certification[] = [
  ["Python Full Stack", "Udemy"],
  ["AI Foundation", "upGrad"],
  ["Pearson MePro English", "Pearson"],
].map(([title, issuer], i) => ({
  id: id(4, i + 1),
  ...ts,
  title,
  issuer,
  issued_label: "",
  credential_url: "",
  media_id: null,
  sort_order: (i + 1) * 10,
  status: "published" as const,
}));

export const seedProjects: Project[] = [
  {
    id: id(5, 1),
    ...ts,
    slug: "manowj-geointel",
    title: "maNOWj GeoIntel",
    tagline:
      "An independent technology venture focused on creating an AI-powered location and property intelligence experience.",
    summary:
      "A free, map-based web app that answers questions about any place — with the source and date shown alongside every answer.",
    overview:
      "maNOWj GeoIntel is an independent product I design and build. You pick a place on the map and ask about it: what's nearby, how to get there, what the weather and air are like, how many people live there. Instead of hiding where answers come from, every answer shows its source and its date — and where a source has no figure, the app says so rather than estimating.",
    purpose:
      "Location information is scattered across many open data sources and is often presented without context. GeoIntel brings those sources together in one place and keeps them honest by showing provenance, so people can trust what they're looking at and decide for themselves.",
    dev_status: "live",
    features: [
      "Counts of hospitals, schools, shops, ATMs and other places within a chosen radius",
      "Directions with live turn-by-turn navigation",
      "Weather, air quality and rain radar",
      "Population, area and density, with the census year shown",
      "Satellite view or 3D buildings, with the imagery date shown",
      "Distance and area measurement",
      "maNOWj Daily — a daily game of guessing locations from satellite views",
    ],
    technologies: [
      "Next.js",
      "Vercel",
      "OpenStreetMap",
      "Overpass",
      "Nominatim",
      "OSRM",
      "Open-Meteo",
      "Wikidata",
    ],
    roadmap: [],
    live_url: "https://www.manowj.com/",
    repo_url: "https://github.com/ManojGudla",
    cover_media_id: null,
    is_featured: true,
    sort_order: 10,
    status: "published",
  },
];

export const seedProjectImages: ProjectImage[] = [];

/** No video/post URLs were supplied yet — add them from the admin dashboard. */
export const seedCreatorContent: CreatorContent[] = [];

/**
 * Figures supplied in the brief. Stored as SELF-REPORTED and kept as DRAFT
 * so they are not public until Manoj confirms them in the admin dashboard.
 */
export const seedCreatorStats: CreatorStat[] = [
  {
    id: id(6, 1),
    ...ts,
    platform: "youtube",
    label: "YouTube subscribers",
    value: 10000,
    value_suffix: "",
    verification: "self_reported",
    verified_on: null,
    last_updated: "2026-11-09",
    source_note: "Supplied by Manoj. Not independently verified.",
    sort_order: 10,
    status: "draft",
  },
  {
    id: id(6, 2),
    ...ts,
    platform: "instagram",
    label: "Instagram followers",
    value: 10000,
    value_suffix: "",
    verification: "self_reported",
    verified_on: null,
    last_updated: "2026-11-09",
    source_note: "Supplied by Manoj. Not independently verified.",
    sort_order: 20,
    status: "draft",
  },
  {
    id: id(6, 3),
    ...ts,
    platform: "youtube",
    label: "Typical video views",
    value: 50000,
    value_suffix: "+",
    verification: "self_reported",
    verified_on: null,
    last_updated: "2026-11-09",
    source_note: "Supplied by Manoj. Not independently verified.",
    sort_order: 30,
    status: "draft",
  },
];

export const seedAchievements: Achievement[] = [
  {
    id: id(7, 1),
    ...ts,
    kind: "highlight",
    title: "Independent Technology Initiative",
    focus: "Product building, innovation and entrepreneurial exploration.",
    description:
      "Designing and building maNOWj GeoIntel independently — from idea to a live product.",
    issuer: "",
    date_label: "",
    link_url: "",
    media_id: null,
    sort_order: 10,
    status: "published",
  },
  {
    id: id(7, 2),
    ...ts,
    kind: "highlight",
    title: "Digital Creator & Brand Builder",
    focus: "Content creation, storytelling and personal brand development.",
    description:
      "Creating YouTube videos and Instagram reels on technology, AI and lifestyle, and building the maNOWj brand.",
    issuer: "",
    date_label: "",
    link_url: "",
    media_id: null,
    sort_order: 20,
    status: "published",
  },
];

export const seedGallery: GalleryItem[] = [];

export const seedInterests: Interest[] = [
  ["Technology exploration", "Trying new tools, devices and platforms early — and figuring out what they're actually good for."],
  ["AI experimentation", "Testing emerging AI tools hands-on, building small experiments and learning what works in practice."],
  ["Content creation", "Turning ideas into YouTube videos and Instagram reels that make technology approachable."],
  ["Entrepreneurship", "Exploring business ideas, building products and learning how good ideas become real ventures."],
  ["Networking", "Meeting builders, creators and professionals — and learning from how they think."],
  ["Learning & experimentation", "Picking up new skills by doing: small projects, quick prototypes and plenty of iteration."],
].map(([title, description], i) => ({
  id: id(8, i + 1),
  ...ts,
  title,
  description,
  sort_order: (i + 1) * 10,
  status: "published" as const,
}));

export const seedVision: VisionItem[] = (
  [
    ["technologies", "AI & machine learning", "Going deeper into AI and ML — from emerging tools to the fundamentals behind them.", "Now"],
    ["products", "Grow maNOWj GeoIntel", "Keep developing the location intelligence product into something people rely on.", "Ongoing"],
    ["business", "Digital services for businesses", "Helping businesses use technology and digital media to reach more people.", "Next"],
    ["skills", "Data analytics & full-stack building", "Sharpening analytics, Power BI and modern web development skills.", "Ongoing"],
    ["opportunities", "AI & technology innovation roles", "Working where curiosity, problem-solving and real-world impact meet.", "Next"],
    ["ambitions", "A recognisable personal brand", "Connecting technology, innovation, creativity, business and entrepreneurship under one identity.", "Long term"],
  ] as const
).map(([area, title, description, horizon], i) => ({
  id: id(9, i + 1),
  ...ts,
  area,
  title,
  description,
  horizon,
  sort_order: (i + 1) * 10,
  status: "published" as const,
}));
