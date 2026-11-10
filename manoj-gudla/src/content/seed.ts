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
  Resource,
  ResourcePack,
  ResourcePackItem,
  Service,
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
    "I'm working towards AI and technology innovation roles, where curiosity, problem-solving and building things people actually use come together.",
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
    "I create YouTube videos and Instagram reels about technology, AI and emerging tools, and the lifestyle around building things. The aim is simple: make new technology feel approachable, useful and a little more exciting.",
  experience_summary: "2+ years",
  now_building: "",
  now_learning: "AI & machine learning",
  now_creating: "Tech videos on YouTube & Instagram",
  services_intro:
    "I help brands reach a tech-curious audience and help businesses use technology better. If one of these fits what you need, tell me about it.",
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
  seo_title: "Manoj Kumar Gudla | Technology Professional, Digital Creator & Builder",
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

/** No projects yet — add them from the admin dashboard. */
export const seedProjects: Project[] = [
  {
    id: id(5, 1),
    ...ts,
    slug: "manowj-geointel",
    title: "maNOWj GeoIntel",
    tagline: "A free map-based web app that answers questions about any place, with the source and date shown next to every answer.",
    summary: "A free map-based web app that answers questions about any place, with the source and date shown next to every answer.",
    overview:
      "maNOWj GeoIntel is an independent product I design and build. You pick a place on the map and ask about it: what's nearby, how to get there, what the weather and air are like, how many people live there. Every answer shows where it came from and how recent it is. If a source has no figure, the app says so instead of guessing.",
    purpose:
      "Information about places is spread across many open data sources and is often shown without context. GeoIntel brings those sources together in one place and shows where each answer comes from, so people can trust what they see and decide for themselves.",
    dev_status: "live",
    features: [
      "Counts of hospitals, schools, shops, ATMs and other places within a chosen radius",
      "Directions with live turn-by-turn navigation",
      "Weather, air quality and rain radar",
      "Population, area and density, with the census year shown",
      "Satellite view or 3D buildings, with the imagery date shown",
      "Distance and area measurement",
      "maNOWj Daily, a daily game of guessing locations from satellite views",
    ],
    technologies: ["Next.js", "Vercel", "OpenStreetMap", "Overpass", "Nominatim", "OSRM", "Open-Meteo", "Wikidata"],
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
      "Designing and building independent products, from first idea to launch.",
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
  ["Technology exploration", "Trying new tools, devices and platforms early and figuring out what they're actually good for."],
  ["AI experimentation", "Testing emerging AI tools hands-on, building small experiments and learning what works in practice."],
  ["Content creation", "Turning ideas into YouTube videos and Instagram reels that make technology approachable."],
  ["Entrepreneurship", "Exploring business ideas, building products and learning how good ideas become real ventures."],
  ["Networking", "Meeting builders, creators and professionals and learning from how they think."],
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
    ["technologies", "AI & machine learning", "Going deeper into AI and ML, from emerging tools to the fundamentals behind them.", "Now"],
    ["products", "Build useful AI-powered tools", "Turning ideas into simple products that solve everyday problems.", "Next"],
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

const res = (
  n: number,
  name: string,
  category: string,
  description: string,
  url: string,
  pricing: Resource["pricing"] = "free",
  tag = "",
): Resource => ({
  id: id(10, n),
  ...ts,
  name,
  category,
  description,
  url,
  pricing,
  tag,
  sort_order: n * 10,
  status: "published",
});

/** Imported from the earlier manowj-resource-hub project. All links are official sites. */
export const seedResources: Resource[] = [
  res(1, "ChatGPT", "AI Tools", "Brainstorm, learn, write and solve problems with an AI assistant.", "https://chatgpt.com/", "freemium", "Popular"),
  res(2, "Google Gemini", "AI Tools", "Google's AI assistant for ideas, learning and everyday tasks.", "https://gemini.google.com/", "freemium"),
  res(3, "Claude", "AI Tools", "An AI assistant for writing, analysis, coding and learning.", "https://claude.ai/", "freemium"),
  res(4, "Hugging Face", "AI Tools", "Explore open machine learning models, datasets and demos.", "https://huggingface.co/", "freemium"),
  res(5, "roadmap.sh", "Career & Interviews", "Visual roadmaps for developer and technology careers.", "https://roadmap.sh/", "free", "Start here"),
  res(6, "GitHub Skills", "Career & Interviews", "Learn GitHub through short, practical exercises.", "https://skills.github.com/"),
  res(7, "LeetCode", "Coding Practice", "Practise coding and prepare for technical interviews.", "https://leetcode.com/", "freemium"),
  res(8, "HackerRank", "Coding Practice", "Build programming skills with practical challenges.", "https://www.hackerrank.com/"),
  res(9, "Exercism", "Coding Practice", "Practise programming with exercises and mentoring.", "https://exercism.org/"),
  res(10, "Codewars", "Coding Practice", "Sharpen coding skills through community-made challenges.", "https://www.codewars.com/"),
  res(11, "NPTEL", "MCA & Study", "Courses from Indian institutes across technical subjects.", "https://nptel.ac.in/"),
  res(12, "MIT OpenCourseWare", "MCA & Study", "Course materials shared by MIT.", "https://ocw.mit.edu/"),
  res(13, "CS50 by Harvard", "MCA & Study", "A well-known introduction to computer science and programming.", "https://cs50.harvard.edu/"),
  res(14, "freeCodeCamp", "Free Learning", "Learn coding through free lessons and projects.", "https://www.freecodecamp.org/"),
  res(15, "Khan Academy", "Free Learning", "Free learning across maths, computing and more.", "https://www.khanacademy.org/"),
  res(16, "Python Documentation", "Free Learning", "The official Python documentation and tutorial.", "https://docs.python.org/3/"),
  res(17, "SQLBolt", "Data & Analytics", "Learn SQL basics through interactive lessons.", "https://sqlbolt.com/"),
  res(18, "Kaggle", "Data & Analytics", "Datasets, notebooks, competitions and data science learning.", "https://www.kaggle.com/"),
  res(19, "Power BI Learning", "Data & Analytics", "Microsoft training for reports, dashboards and data analysis.", "https://learn.microsoft.com/en-us/training/powerplatform/power-bi/"),
  res(20, "pandas Documentation", "Data & Analytics", "Python tools for working with tabular data.", "https://pandas.pydata.org/docs/"),
  res(21, "Tableau Training", "Data & Analytics", "Training resources for data visualisation.", "https://www.tableau.com/learn/training", "freemium"),
  res(22, "MDN Web Docs", "Web Development", "Reference guides and tutorials for web technologies.", "https://developer.mozilla.org/"),
  res(23, "React", "Web Development", "Learn React from its official documentation.", "https://react.dev/"),
  res(24, "Angular", "Web Development", "The official Angular framework documentation.", "https://angular.dev/"),
  res(25, "Node.js", "Web Development", "JavaScript on the server with Node.js.", "https://nodejs.org/"),
  res(26, "GitHub Explore", "Projects & Code", "Discover open-source projects and developer communities.", "https://github.com/explore/"),
  res(27, "Visual Studio Code", "Developer Toolkit", "A popular code editor with extensions and debugging tools.", "https://code.visualstudio.com/"),
  res(28, "Git", "Developer Toolkit", "Learn and download the version control system.", "https://git-scm.com/"),
  res(29, "Postman", "Developer Toolkit", "Build, test and document APIs.", "https://www.postman.com/", "freemium"),
  res(30, "Microsoft Learn", "Cloud & DevOps", "Learn Microsoft technologies with guided modules and paths.", "https://learn.microsoft.com/"),
  res(31, "AWS Skill Builder", "Cloud & DevOps", "Cloud learning paths and digital training from AWS.", "https://skillbuilder.aws/", "freemium"),
  res(32, "Google Cloud Training", "Cloud & DevOps", "Build cloud knowledge with Google Cloud training.", "https://cloud.google.com/learn/training", "freemium"),
  res(33, "Kubernetes Docs", "Cloud & DevOps", "Official documentation for Kubernetes concepts and tasks.", "https://kubernetes.io/docs/"),
  res(34, "YouTube Creators", "Creator Resources", "Official guidance and inspiration for YouTube creators.", "https://www.youtube.com/creators/"),
  res(35, "Instagram Creators", "Creator Resources", "Official updates, tips and resources for Instagram creators.", "https://creators.instagram.com/"),
  res(36, "Canva Design School", "Creator Resources", "Learn design skills and improve your visuals.", "https://www.canva.com/designschool/"),
  res(37, "CapCut", "Creator Resources", "Video editing tools for short-form content.", "https://www.capcut.com/", "freemium"),
];

/**
 * One example pack, kept as a DRAFT so Manoj decides whether to publish it.
 * Real packs are created per video from the dashboard.
 */
export const seedPacks: ResourcePack[] = [
  {
    id: id(11, 1),
    ...ts,
    code: "starter-kit",
    title: "Free starter kit for learning tech",
    intro: "The free tools and courses I'd start with if I were learning tech from zero today.",
    keyword: "START",
    video_url: "",
    platform: "instagram",
    published_on: null,
    sort_order: 10,
    status: "draft",
  },
];

export const seedPackItems: ResourcePackItem[] = [5, 13, 14, 16, 17, 7, 1].map((n, i) => ({
  id: id(12, i + 1),
  ...ts,
  pack_id: id(11, 1),
  resource_id: id(10, n),
  note: "",
  sort_order: (i + 1) * 10,
}));

/** Offers on the "Work with me" page — DRAFTS until Manoj confirms the details. */
export const seedServices: Service[] = [
  {
    id: id(13, 1),
    ...ts,
    title: "Brand collaborations",
    summary: "Videos and reels that introduce your product to a tech-curious audience, made in my own style.",
    for_whom: "Tech products, AI tools, learning platforms and lifestyle brands",
    deliverables: ["YouTube video or integration", "Instagram reel", "Resource-pack link for viewers"],
    enquiry_type: "brand",
    sort_order: 10,
    status: "draft",
  },
  {
    id: id(13, 2),
    ...ts,
    title: "Websites for businesses",
    summary: "A clean, fast website that you can update yourself.",
    for_whom: "Small businesses, creators and local brands",
    deliverables: ["Design and build", "Contact form", "Help going live"],
    enquiry_type: "project",
    sort_order: 20,
    status: "draft",
  },
  {
    id: id(13, 3),
    ...ts,
    title: "Social media content",
    summary: "Posts and short videos that make your business look as good online as it is in person.",
    for_whom: "Local businesses and restaurants",
    deliverables: ["Post designs", "Short videos", "Content plan"],
    enquiry_type: "project",
    sort_order: 30,
    status: "draft",
  },
];
