-- =====================================================================
-- Starting content. GENERATED from src/content/seed.ts — do not edit.
-- Run after the migrations. Safe to re-run: existing rows are kept.
-- =====================================================================

insert into public.profile (id, full_name, headline, roles, tagline, hero_intro, short_bio, biography, professional_intro, career_direction, philosophy, location, show_location, email, linkedin_url, instagram_url, youtube_url, github_url, creator_title, creator_intro, experience_summary, photo_media_id, about_photo_media_id, creator_photo_media_id, resume_media_id) values
  (1, 'Manoj Kumar Gudla', 'Technology Professional | AI & Innovation Enthusiast | Digital Creator | Entrepreneurial Builder', array['Technology Professional', 'AI & Innovation Enthusiast', 'Digital Creator']::text[], 'Think Beyond Limits. Build What Matters.', 'Exploring technology, creating digital experiences, sharing ideas and building opportunities for tomorrow.', 'I''m Manoj Kumar Gudla, a technology-driven professional, content creator and entrepreneurial builder. I enjoy exploring new technologies, creating digital experiences, sharing ideas and turning opportunities into meaningful work.', 'A curious mind, creative thinker and ambitious builder.

I''m passionate about technology, emerging AI tools, content creation and entrepreneurship.

I enjoy experimenting with ideas, developing new skills, connecting with people and exploring opportunities.

Beyond my professional journey, I enjoy creating YouTube videos and Instagram reels, exploring business ideas and discovering new technologies.', 'I''m a technology professional at Tata Consultancy Services (TCS), currently contributing to an AI and machine learning project. Alongside my role, I build independent products, create content and keep learning the tools that are shaping what comes next.', 'I''m working towards AI and technology innovation roles — where curiosity, problem-solving and building things people actually use come together.', 'I believe in thinking big, taking action and learning along the way.', 'Hyderabad, India', false, 'manowj.tech@gmail.com', 'https://linkedin.com/in/manojkumar946', 'https://www.instagram.com/manowj_official/', 'https://www.youtube.com/@maNOWj_Official', 'https://github.com/ManojGudla', 'Digital Creator | Technology & Lifestyle', 'I create YouTube videos and Instagram reels about technology, AI and emerging tools — and the lifestyle around building things. The aim is simple: make new technology feel approachable, useful and a little more exciting.', '2+ years', null, null, null, null)
on conflict do nothing;

insert into public.site_settings (id, site_title, tagline, seo_title, meta_description, default_theme, footer_text, contact_email, og_media_id) values
  (1, 'Manoj Kumar Gudla', 'Think Beyond Limits. Build What Matters.', 'Manoj Kumar Gudla — Technology Professional, Digital Creator & Builder', 'Manoj Kumar Gudla is a technology professional, AI & innovation enthusiast, digital creator and entrepreneurial builder. Explore his work, projects, content and ways to connect.', 'system', 'Think Beyond Limits. Build What Matters.', 'manowj.tech@gmail.com', null)
on conflict do nothing;

insert into public.experience (id, organisation, role_title, employment_type, location, start_label, end_label, is_current, summary, responsibilities, sort_order, status) values
  ('00000000-0000-4000-8001-000000000001', 'Tata Consultancy Services (TCS)', 'Assistant System Engineer', 'Full-time', 'Hyderabad, India', 'Jun 2024', '', true, 'Currently contributing to an AI & ML project.', '{}'::text[], 10, 'published'),
  ('00000000-0000-4000-8001-000000000002', 'HMI, Srikakulam', 'Python Developer Intern', 'Internship', 'Srikakulam, India', 'Mar 2024', 'May 2024', false, '', '{}'::text[], 20, 'draft'),
  ('00000000-0000-4000-8001-000000000003', 'Adhoc Network Tech Company', 'Java Full-Stack Developer Intern', 'Internship', 'Visakhapatnam, India', 'Oct 2023', 'Dec 2023', false, '', '{}'::text[], 30, 'draft')
on conflict do nothing;

insert into public.education (id, qualification, field, institution, start_label, end_label, progress, notes, sort_order, status) values
  ('00000000-0000-4000-8002-000000000001', 'Master of Computer Applications (MCA)', 'Data Science', 'Vignan University', '', '', 'completed', '', 10, 'published'),
  ('00000000-0000-4000-8002-000000000002', 'Bachelor of Computer Applications (BCA)', '', 'Aditya Degree College, Srikakulam', '', '2024', 'completed', '', 20, 'published')
on conflict do nothing;

insert into public.skills (id, name, category, proficiency, proficiency_approved, sort_order, status) values
  ('00000000-0000-4000-8003-000000000001', 'Python', 'programming', null, false, 10, 'published'),
  ('00000000-0000-4000-8003-000000000002', 'Java', 'programming', null, false, 20, 'published'),
  ('00000000-0000-4000-8003-000000000003', 'SQL', 'programming', null, false, 30, 'published'),
  ('00000000-0000-4000-8003-000000000004', 'Software development', 'development', null, false, 40, 'published'),
  ('00000000-0000-4000-8003-000000000005', 'Web technologies', 'development', null, false, 50, 'published'),
  ('00000000-0000-4000-8003-000000000006', 'Artificial intelligence', 'ai_analytics', null, false, 60, 'published'),
  ('00000000-0000-4000-8003-000000000007', 'Emerging technologies', 'ai_analytics', null, false, 70, 'published'),
  ('00000000-0000-4000-8003-000000000008', 'Data analytics', 'ai_analytics', null, false, 80, 'published'),
  ('00000000-0000-4000-8003-000000000009', 'Power BI', 'ai_analytics', null, false, 90, 'published'),
  ('00000000-0000-4000-8003-00000000000a', 'Problem-solving', 'strengths', null, false, 100, 'published'),
  ('00000000-0000-4000-8003-00000000000b', 'Innovation', 'strengths', null, false, 110, 'published'),
  ('00000000-0000-4000-8003-00000000000c', 'Communication', 'strengths', null, false, 120, 'published'),
  ('00000000-0000-4000-8003-00000000000d', 'Mentoring', 'strengths', null, false, 130, 'published'),
  ('00000000-0000-4000-8003-00000000000e', 'Collaboration', 'strengths', null, false, 140, 'published')
on conflict do nothing;

insert into public.certifications (id, title, issuer, issued_label, credential_url, media_id, sort_order, status) values
  ('00000000-0000-4000-8004-000000000001', 'Python Full Stack', 'Udemy', '', '', null, 10, 'published'),
  ('00000000-0000-4000-8004-000000000002', 'AI Foundation', 'upGrad', '', '', null, 20, 'published'),
  ('00000000-0000-4000-8004-000000000003', 'Pearson MePro English', 'Pearson', '', '', null, 30, 'published')
on conflict do nothing;

insert into public.projects (id, slug, title, tagline, summary, overview, purpose, dev_status, features, technologies, roadmap, live_url, repo_url, cover_media_id, is_featured, sort_order, status) values
  ('00000000-0000-4000-8005-000000000001', 'manowj-geointel', 'maNOWj GeoIntel', 'An independent technology venture focused on creating an AI-powered location and property intelligence experience.', 'A free, map-based web app that answers questions about any place — with the source and date shown alongside every answer.', 'maNOWj GeoIntel is an independent product I design and build. You pick a place on the map and ask about it: what''s nearby, how to get there, what the weather and air are like, how many people live there. Instead of hiding where answers come from, every answer shows its source and its date — and where a source has no figure, the app says so rather than estimating.', 'Location information is scattered across many open data sources and is often presented without context. GeoIntel brings those sources together in one place and keeps them honest by showing provenance, so people can trust what they''re looking at and decide for themselves.', 'live', array['Counts of hospitals, schools, shops, ATMs and other places within a chosen radius', 'Directions with live turn-by-turn navigation', 'Weather, air quality and rain radar', 'Population, area and density, with the census year shown', 'Satellite view or 3D buildings, with the imagery date shown', 'Distance and area measurement', 'maNOWj Daily — a daily game of guessing locations from satellite views']::text[], array['Next.js', 'Vercel', 'OpenStreetMap', 'Overpass', 'Nominatim', 'OSRM', 'Open-Meteo', 'Wikidata']::text[], '{}'::text[], 'https://www.manowj.com/', 'https://github.com/ManojGudla', null, true, 10, 'published')
on conflict do nothing;

-- creator_content: no starting rows

insert into public.creator_stats (id, platform, label, value, value_suffix, verification, verified_on, last_updated, source_note, sort_order, status) values
  ('00000000-0000-4000-8006-000000000001', 'youtube', 'YouTube subscribers', 10000, '', 'self_reported', null, '2026-11-09', 'Supplied by Manoj. Not independently verified.', 10, 'draft'),
  ('00000000-0000-4000-8006-000000000002', 'instagram', 'Instagram followers', 10000, '', 'self_reported', null, '2026-11-09', 'Supplied by Manoj. Not independently verified.', 20, 'draft'),
  ('00000000-0000-4000-8006-000000000003', 'youtube', 'Typical video views', 50000, '+', 'self_reported', null, '2026-11-09', 'Supplied by Manoj. Not independently verified.', 30, 'draft')
on conflict do nothing;

insert into public.achievements (id, kind, title, focus, description, issuer, date_label, link_url, media_id, sort_order, status) values
  ('00000000-0000-4000-8007-000000000001', 'highlight', 'Independent Technology Initiative', 'Product building, innovation and entrepreneurial exploration.', 'Designing and building maNOWj GeoIntel independently — from idea to a live product.', '', '', '', null, 10, 'published'),
  ('00000000-0000-4000-8007-000000000002', 'highlight', 'Digital Creator & Brand Builder', 'Content creation, storytelling and personal brand development.', 'Creating YouTube videos and Instagram reels on technology, AI and lifestyle, and building the maNOWj brand.', '', '', '', null, 20, 'published')
on conflict do nothing;

insert into public.interests (id, title, description, sort_order, status) values
  ('00000000-0000-4000-8008-000000000001', 'Technology exploration', 'Trying new tools, devices and platforms early — and figuring out what they''re actually good for.', 10, 'published'),
  ('00000000-0000-4000-8008-000000000002', 'AI experimentation', 'Testing emerging AI tools hands-on, building small experiments and learning what works in practice.', 20, 'published'),
  ('00000000-0000-4000-8008-000000000003', 'Content creation', 'Turning ideas into YouTube videos and Instagram reels that make technology approachable.', 30, 'published'),
  ('00000000-0000-4000-8008-000000000004', 'Entrepreneurship', 'Exploring business ideas, building products and learning how good ideas become real ventures.', 40, 'published'),
  ('00000000-0000-4000-8008-000000000005', 'Networking', 'Meeting builders, creators and professionals — and learning from how they think.', 50, 'published'),
  ('00000000-0000-4000-8008-000000000006', 'Learning & experimentation', 'Picking up new skills by doing: small projects, quick prototypes and plenty of iteration.', 60, 'published')
on conflict do nothing;

insert into public.vision_items (id, area, title, description, horizon, sort_order, status) values
  ('00000000-0000-4000-8009-000000000001', 'technologies', 'AI & machine learning', 'Going deeper into AI and ML — from emerging tools to the fundamentals behind them.', 'Now', 10, 'published'),
  ('00000000-0000-4000-8009-000000000002', 'products', 'Grow maNOWj GeoIntel', 'Keep developing the location intelligence product into something people rely on.', 'Ongoing', 20, 'published'),
  ('00000000-0000-4000-8009-000000000003', 'business', 'Digital services for businesses', 'Helping businesses use technology and digital media to reach more people.', 'Next', 30, 'published'),
  ('00000000-0000-4000-8009-000000000004', 'skills', 'Data analytics & full-stack building', 'Sharpening analytics, Power BI and modern web development skills.', 'Ongoing', 40, 'published'),
  ('00000000-0000-4000-8009-000000000005', 'opportunities', 'AI & technology innovation roles', 'Working where curiosity, problem-solving and real-world impact meet.', 'Next', 50, 'published'),
  ('00000000-0000-4000-8009-000000000006', 'ambitions', 'A recognisable personal brand', 'Connecting technology, innovation, creativity, business and entrepreneurship under one identity.', 'Long term', 60, 'published')
on conflict do nothing;
