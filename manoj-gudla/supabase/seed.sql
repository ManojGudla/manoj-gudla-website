-- =====================================================================
-- Starting content. GENERATED from src/content/seed.ts — do not edit.
-- Run after the migrations. Safe to re-run: existing rows are kept.
-- =====================================================================

insert into public.profile (id, full_name, headline, roles, tagline, hero_intro, short_bio, biography, professional_intro, career_direction, philosophy, location, show_location, email, linkedin_url, instagram_url, youtube_url, github_url, creator_title, creator_intro, experience_summary, now_building, now_learning, now_creating, services_intro, photo_media_id, about_photo_media_id, creator_photo_media_id, resume_media_id) values
  (1, 'Manoj Kumar Gudla', 'Technology Professional | AI & Innovation Enthusiast | Digital Creator | Entrepreneurial Builder', array['Technology Professional', 'AI & Innovation Enthusiast', 'Digital Creator']::text[], 'Think Beyond Limits. Build What Matters.', 'Exploring technology, creating digital experiences, sharing ideas and building opportunities for tomorrow.', 'I''m Manoj Kumar Gudla, a technology-driven professional, content creator and entrepreneurial builder. I enjoy exploring new technologies, creating digital experiences, sharing ideas and turning opportunities into meaningful work.', 'A curious mind, creative thinker and ambitious builder.

I''m passionate about technology, emerging AI tools, content creation and entrepreneurship.

I enjoy experimenting with ideas, developing new skills, connecting with people and exploring opportunities.

Beyond my professional journey, I enjoy creating YouTube videos and Instagram reels, exploring business ideas and discovering new technologies.', 'I''m a technology professional at Tata Consultancy Services (TCS), currently contributing to an AI and machine learning project. Alongside my role, I build independent products, create content and keep learning the tools that are shaping what comes next.', 'I''m working towards AI and technology innovation roles, where curiosity, problem-solving and building things people actually use come together.', 'I believe in thinking big, taking action and learning along the way.', 'Hyderabad, India', false, 'manowj.tech@gmail.com', 'https://linkedin.com/in/manojkumar946', 'https://www.instagram.com/manowj_official/', 'https://www.youtube.com/@maNOWj_Official', 'https://github.com/ManojGudla', 'Digital Creator | Technology & Lifestyle', 'I create YouTube videos and Instagram reels about technology, AI and emerging tools, and the lifestyle around building things. The aim is simple: make new technology feel approachable, useful and a little more exciting.', '2+ years', '', 'AI & machine learning', 'Tech videos on YouTube & Instagram', 'I help brands reach a tech-curious audience and help businesses use technology better. If one of these fits what you need, tell me about it.', null, null, null, null)
on conflict do nothing;

insert into public.site_settings (id, site_title, tagline, seo_title, meta_description, default_theme, footer_text, contact_email, og_media_id) values
  (1, 'Manoj Kumar Gudla', 'Think Beyond Limits. Build What Matters.', 'Manoj Kumar Gudla | Technology Professional, Digital Creator & Builder', 'Manoj Kumar Gudla is a technology professional, AI & innovation enthusiast, digital creator and entrepreneurial builder. Explore his work, projects, content and ways to connect.', 'system', 'Think Beyond Limits. Build What Matters.', 'manowj.tech@gmail.com', null)
on conflict do nothing;

insert into public.experience (id, organisation, role_title, employment_type, location, start_label, end_label, is_current, summary, responsibilities, sort_order, status) values
  ('00000000-0000-4000-8001-000000000001', 'Tata Consultancy Services (TCS)', 'Assistant System Engineer', 'Full-time', 'Hyderabad, India', 'Jun 2024', '', true, 'Currently contributing to an AI & ML project.', '{}'::text[], 10, 'published'),
  ('00000000-0000-4000-8001-000000000002', 'HMI, Srikakulam', 'Python Developer Intern', 'Internship', 'Srikakulam, India', 'Mar 2024', 'May 2024', false, '', '{}'::text[], 20, 'draft'),
  ('00000000-0000-4000-8001-000000000003', 'Adhoc Network Tech Company', 'Java Full-Stack Developer Intern', 'Internship', 'Visakhapatnam, India', 'Oct 2023', 'Dec 2023', false, '', '{}'::text[], 30, 'draft')
on conflict do nothing;

insert into public.education (id, qualification, field, institution, start_label, end_label, progress, notes, sort_order, status) values
  ('00000000-0000-4000-8002-000000000001', 'Master of Computer Applications (MCA)', 'Data Science', 'Vignan University', '', '', 'completed', '', 10, 'published')
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
  ('00000000-0000-4000-8005-000000000001', 'manowj-geointel', 'maNOWj GeoIntel', 'A free map-based web app that answers questions about any place, with the source and date shown next to every answer.', 'A free map-based web app that answers questions about any place, with the source and date shown next to every answer.', 'maNOWj GeoIntel is an independent product I design and build. You pick a place on the map and ask about it: what''s nearby, how to get there, what the weather and air are like, how many people live there. Every answer shows where it came from and how recent it is. If a source has no figure, the app says so instead of guessing.', 'Information about places is spread across many open data sources and is often shown without context. GeoIntel brings those sources together in one place and shows where each answer comes from, so people can trust what they see and decide for themselves.', 'live', array['Counts of hospitals, schools, shops, ATMs and other places within a chosen radius', 'Directions with live turn-by-turn navigation', 'Weather, air quality and rain radar', 'Population, area and density, with the census year shown', 'Satellite view or 3D buildings, with the imagery date shown', 'Distance and area measurement', 'maNOWj Daily, a daily game of guessing locations from satellite views']::text[], array['Next.js', 'Vercel', 'OpenStreetMap', 'Overpass', 'Nominatim', 'OSRM', 'Open-Meteo', 'Wikidata']::text[], '{}'::text[], 'https://www.manowj.com/', 'https://github.com/ManojGudla', null, true, 10, 'published')
on conflict do nothing;

-- creator_content: no starting rows

insert into public.creator_stats (id, platform, label, value, value_suffix, verification, verified_on, last_updated, source_note, sort_order, status) values
  ('00000000-0000-4000-8006-000000000001', 'youtube', 'YouTube subscribers', 10000, '', 'self_reported', null, '2026-11-09', 'Supplied by Manoj. Not independently verified.', 10, 'draft'),
  ('00000000-0000-4000-8006-000000000002', 'instagram', 'Instagram followers', 10000, '', 'self_reported', null, '2026-11-09', 'Supplied by Manoj. Not independently verified.', 20, 'draft'),
  ('00000000-0000-4000-8006-000000000003', 'youtube', 'Typical video views', 50000, '+', 'self_reported', null, '2026-11-09', 'Supplied by Manoj. Not independently verified.', 30, 'draft')
on conflict do nothing;

insert into public.achievements (id, kind, title, focus, description, issuer, date_label, link_url, media_id, sort_order, status) values
  ('00000000-0000-4000-8007-000000000001', 'highlight', 'Independent Technology Initiative', 'Product building, innovation and entrepreneurial exploration.', 'Designing and building independent products, from first idea to launch.', '', '', '', null, 10, 'published'),
  ('00000000-0000-4000-8007-000000000002', 'highlight', 'Digital Creator & Brand Builder', 'Content creation, storytelling and personal brand development.', 'Creating YouTube videos and Instagram reels on technology, AI and lifestyle, and building the maNOWj brand.', '', '', '', null, 20, 'published')
on conflict do nothing;

insert into public.interests (id, title, description, sort_order, status) values
  ('00000000-0000-4000-8008-000000000001', 'Technology exploration', 'Trying new tools, devices and platforms early and figuring out what they''re actually good for.', 10, 'published'),
  ('00000000-0000-4000-8008-000000000002', 'AI experimentation', 'Testing emerging AI tools hands-on, building small experiments and learning what works in practice.', 20, 'published'),
  ('00000000-0000-4000-8008-000000000003', 'Content creation', 'Turning ideas into YouTube videos and Instagram reels that make technology approachable.', 30, 'published'),
  ('00000000-0000-4000-8008-000000000004', 'Entrepreneurship', 'Exploring business ideas, building products and learning how good ideas become real ventures.', 40, 'published'),
  ('00000000-0000-4000-8008-000000000005', 'Networking', 'Meeting builders, creators and professionals and learning from how they think.', 50, 'published'),
  ('00000000-0000-4000-8008-000000000006', 'Learning & experimentation', 'Picking up new skills by doing: small projects, quick prototypes and plenty of iteration.', 60, 'published')
on conflict do nothing;

insert into public.vision_items (id, area, title, description, horizon, sort_order, status) values
  ('00000000-0000-4000-8009-000000000001', 'technologies', 'AI & machine learning', 'Going deeper into AI and ML, from emerging tools to the fundamentals behind them.', 'Now', 10, 'published'),
  ('00000000-0000-4000-8009-000000000002', 'products', 'Build useful AI-powered tools', 'Turning ideas into simple products that solve everyday problems.', 'Next', 20, 'published'),
  ('00000000-0000-4000-8009-000000000003', 'business', 'Digital services for businesses', 'Helping businesses use technology and digital media to reach more people.', 'Next', 30, 'published'),
  ('00000000-0000-4000-8009-000000000004', 'skills', 'Data analytics & full-stack building', 'Sharpening analytics, Power BI and modern web development skills.', 'Ongoing', 40, 'published'),
  ('00000000-0000-4000-8009-000000000005', 'opportunities', 'AI & technology innovation roles', 'Working where curiosity, problem-solving and real-world impact meet.', 'Next', 50, 'published'),
  ('00000000-0000-4000-8009-000000000006', 'ambitions', 'A recognisable personal brand', 'Connecting technology, innovation, creativity, business and entrepreneurship under one identity.', 'Long term', 60, 'published')
on conflict do nothing;

insert into public.resources (id, name, category, description, url, pricing, tag, sort_order, status) values
  ('00000000-0000-4000-800a-000000000001', 'ChatGPT', 'AI Tools', 'Brainstorm, learn, write and solve problems with an AI assistant.', 'https://chatgpt.com/', 'freemium', 'Popular', 10, 'published'),
  ('00000000-0000-4000-800a-000000000002', 'Google Gemini', 'AI Tools', 'Google''s AI assistant for ideas, learning and everyday tasks.', 'https://gemini.google.com/', 'freemium', '', 20, 'published'),
  ('00000000-0000-4000-800a-000000000003', 'Claude', 'AI Tools', 'An AI assistant for writing, analysis, coding and learning.', 'https://claude.ai/', 'freemium', '', 30, 'published'),
  ('00000000-0000-4000-800a-000000000004', 'Hugging Face', 'AI Tools', 'Explore open machine learning models, datasets and demos.', 'https://huggingface.co/', 'freemium', '', 40, 'published'),
  ('00000000-0000-4000-800a-000000000005', 'roadmap.sh', 'Career & Interviews', 'Visual roadmaps for developer and technology careers.', 'https://roadmap.sh/', 'free', 'Start here', 50, 'published'),
  ('00000000-0000-4000-800a-000000000006', 'GitHub Skills', 'Career & Interviews', 'Learn GitHub through short, practical exercises.', 'https://skills.github.com/', 'free', '', 60, 'published'),
  ('00000000-0000-4000-800a-000000000007', 'LeetCode', 'Coding Practice', 'Practise coding and prepare for technical interviews.', 'https://leetcode.com/', 'freemium', '', 70, 'published'),
  ('00000000-0000-4000-800a-000000000008', 'HackerRank', 'Coding Practice', 'Build programming skills with practical challenges.', 'https://www.hackerrank.com/', 'free', '', 80, 'published'),
  ('00000000-0000-4000-800a-000000000009', 'Exercism', 'Coding Practice', 'Practise programming with exercises and mentoring.', 'https://exercism.org/', 'free', '', 90, 'published'),
  ('00000000-0000-4000-800a-00000000000a', 'Codewars', 'Coding Practice', 'Sharpen coding skills through community-made challenges.', 'https://www.codewars.com/', 'free', '', 100, 'published'),
  ('00000000-0000-4000-800a-00000000000b', 'NPTEL', 'MCA & Study', 'Courses from Indian institutes across technical subjects.', 'https://nptel.ac.in/', 'free', '', 110, 'published'),
  ('00000000-0000-4000-800a-00000000000c', 'MIT OpenCourseWare', 'MCA & Study', 'Course materials shared by MIT.', 'https://ocw.mit.edu/', 'free', '', 120, 'published'),
  ('00000000-0000-4000-800a-00000000000d', 'CS50 by Harvard', 'MCA & Study', 'A well-known introduction to computer science and programming.', 'https://cs50.harvard.edu/', 'free', '', 130, 'published'),
  ('00000000-0000-4000-800a-00000000000e', 'freeCodeCamp', 'Free Learning', 'Learn coding through free lessons and projects.', 'https://www.freecodecamp.org/', 'free', '', 140, 'published'),
  ('00000000-0000-4000-800a-00000000000f', 'Khan Academy', 'Free Learning', 'Free learning across maths, computing and more.', 'https://www.khanacademy.org/', 'free', '', 150, 'published'),
  ('00000000-0000-4000-800a-000000000010', 'Python Documentation', 'Free Learning', 'The official Python documentation and tutorial.', 'https://docs.python.org/3/', 'free', '', 160, 'published'),
  ('00000000-0000-4000-800a-000000000011', 'SQLBolt', 'Data & Analytics', 'Learn SQL basics through interactive lessons.', 'https://sqlbolt.com/', 'free', '', 170, 'published'),
  ('00000000-0000-4000-800a-000000000012', 'Kaggle', 'Data & Analytics', 'Datasets, notebooks, competitions and data science learning.', 'https://www.kaggle.com/', 'free', '', 180, 'published'),
  ('00000000-0000-4000-800a-000000000013', 'Power BI Learning', 'Data & Analytics', 'Microsoft training for reports, dashboards and data analysis.', 'https://learn.microsoft.com/en-us/training/powerplatform/power-bi/', 'free', '', 190, 'published'),
  ('00000000-0000-4000-800a-000000000014', 'pandas Documentation', 'Data & Analytics', 'Python tools for working with tabular data.', 'https://pandas.pydata.org/docs/', 'free', '', 200, 'published'),
  ('00000000-0000-4000-800a-000000000015', 'Tableau Training', 'Data & Analytics', 'Training resources for data visualisation.', 'https://www.tableau.com/learn/training', 'freemium', '', 210, 'published'),
  ('00000000-0000-4000-800a-000000000016', 'MDN Web Docs', 'Web Development', 'Reference guides and tutorials for web technologies.', 'https://developer.mozilla.org/', 'free', '', 220, 'published'),
  ('00000000-0000-4000-800a-000000000017', 'React', 'Web Development', 'Learn React from its official documentation.', 'https://react.dev/', 'free', '', 230, 'published'),
  ('00000000-0000-4000-800a-000000000018', 'Angular', 'Web Development', 'The official Angular framework documentation.', 'https://angular.dev/', 'free', '', 240, 'published'),
  ('00000000-0000-4000-800a-000000000019', 'Node.js', 'Web Development', 'JavaScript on the server with Node.js.', 'https://nodejs.org/', 'free', '', 250, 'published'),
  ('00000000-0000-4000-800a-00000000001a', 'GitHub Explore', 'Projects & Code', 'Discover open-source projects and developer communities.', 'https://github.com/explore/', 'free', '', 260, 'published'),
  ('00000000-0000-4000-800a-00000000001b', 'Visual Studio Code', 'Developer Toolkit', 'A popular code editor with extensions and debugging tools.', 'https://code.visualstudio.com/', 'free', '', 270, 'published'),
  ('00000000-0000-4000-800a-00000000001c', 'Git', 'Developer Toolkit', 'Learn and download the version control system.', 'https://git-scm.com/', 'free', '', 280, 'published'),
  ('00000000-0000-4000-800a-00000000001d', 'Postman', 'Developer Toolkit', 'Build, test and document APIs.', 'https://www.postman.com/', 'freemium', '', 290, 'published'),
  ('00000000-0000-4000-800a-00000000001e', 'Microsoft Learn', 'Cloud & DevOps', 'Learn Microsoft technologies with guided modules and paths.', 'https://learn.microsoft.com/', 'free', '', 300, 'published'),
  ('00000000-0000-4000-800a-00000000001f', 'AWS Skill Builder', 'Cloud & DevOps', 'Cloud learning paths and digital training from AWS.', 'https://skillbuilder.aws/', 'freemium', '', 310, 'published'),
  ('00000000-0000-4000-800a-000000000020', 'Google Cloud Training', 'Cloud & DevOps', 'Build cloud knowledge with Google Cloud training.', 'https://cloud.google.com/learn/training', 'freemium', '', 320, 'published'),
  ('00000000-0000-4000-800a-000000000021', 'Kubernetes Docs', 'Cloud & DevOps', 'Official documentation for Kubernetes concepts and tasks.', 'https://kubernetes.io/docs/', 'free', '', 330, 'published'),
  ('00000000-0000-4000-800a-000000000022', 'YouTube Creators', 'Creator Resources', 'Official guidance and inspiration for YouTube creators.', 'https://www.youtube.com/creators/', 'free', '', 340, 'published'),
  ('00000000-0000-4000-800a-000000000023', 'Instagram Creators', 'Creator Resources', 'Official updates, tips and resources for Instagram creators.', 'https://creators.instagram.com/', 'free', '', 350, 'published'),
  ('00000000-0000-4000-800a-000000000024', 'Canva Design School', 'Creator Resources', 'Learn design skills and improve your visuals.', 'https://www.canva.com/designschool/', 'free', '', 360, 'published'),
  ('00000000-0000-4000-800a-000000000025', 'CapCut', 'Creator Resources', 'Video editing tools for short-form content.', 'https://www.capcut.com/', 'freemium', '', 370, 'published')
on conflict do nothing;

insert into public.resource_packs (id, code, title, intro, keyword, video_url, platform, published_on, sort_order, status) values
  ('00000000-0000-4000-800b-000000000001', 'starter-kit', 'Free starter kit for learning tech', 'The free tools and courses I''d start with if I were learning tech from zero today.', 'START', '', 'instagram', null, 10, 'draft')
on conflict do nothing;

insert into public.resource_pack_items (id, pack_id, resource_id, note, sort_order) values
  ('00000000-0000-4000-800c-000000000001', '00000000-0000-4000-800b-000000000001', '00000000-0000-4000-800a-000000000005', '', 10),
  ('00000000-0000-4000-800c-000000000002', '00000000-0000-4000-800b-000000000001', '00000000-0000-4000-800a-00000000000d', '', 20),
  ('00000000-0000-4000-800c-000000000003', '00000000-0000-4000-800b-000000000001', '00000000-0000-4000-800a-00000000000e', '', 30),
  ('00000000-0000-4000-800c-000000000004', '00000000-0000-4000-800b-000000000001', '00000000-0000-4000-800a-000000000010', '', 40),
  ('00000000-0000-4000-800c-000000000005', '00000000-0000-4000-800b-000000000001', '00000000-0000-4000-800a-000000000011', '', 50),
  ('00000000-0000-4000-800c-000000000006', '00000000-0000-4000-800b-000000000001', '00000000-0000-4000-800a-000000000007', '', 60),
  ('00000000-0000-4000-800c-000000000007', '00000000-0000-4000-800b-000000000001', '00000000-0000-4000-800a-000000000001', '', 70)
on conflict do nothing;

insert into public.services (id, title, summary, for_whom, deliverables, enquiry_type, sort_order, status) values
  ('00000000-0000-4000-800d-000000000001', 'Brand collaborations', 'Videos and reels that introduce your product to a tech-curious audience, made in my own style.', 'Tech products, AI tools, learning platforms and lifestyle brands', array['YouTube video or integration', 'Instagram reel', 'Resource-pack link for viewers']::text[], 'brand', 10, 'draft'),
  ('00000000-0000-4000-800d-000000000002', 'Websites for businesses', 'A clean, fast website that you can update yourself.', 'Small businesses, creators and local brands', array['Design and build', 'Contact form', 'Help going live']::text[], 'project', 20, 'draft'),
  ('00000000-0000-4000-800d-000000000003', 'Social media content', 'Posts and short videos that make your business look as good online as it is in person.', 'Local businesses and restaurants', array['Post designs', 'Short videos', 'Content plan']::text[], 'project', 30, 'draft')
on conflict do nothing;
