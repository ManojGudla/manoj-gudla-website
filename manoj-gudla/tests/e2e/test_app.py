"""
End-to-end browser tests for the website and the admin dashboard.
Run through tests/e2e/run.sh, which prepares the database and servers.
"""
import io
import json
import os
import re
import sys
import time
import urllib.request

from PIL import Image
from playwright.sync_api import sync_playwright, expect

BASE = "http://localhost:3200"
ADMIN = ("admin@test.local", "correct horse battery staple")
VISITOR = ("visitor@test.local", "visitor password 123")
SHOTS = os.environ.get("SHOTS_DIR", "/var/tmp/e2e-shots")
os.makedirs(SHOTS, exist_ok=True)

results = []


def check(name, fn):
    t = time.time()
    try:
        fn()
        results.append({"test": name, "ok": True, "ms": int((time.time() - t) * 1000)})
        print(f"  PASS  {name}")
    except Exception as e:  # noqa: BLE001
        results.append({"test": name, "ok": False, "error": str(e).splitlines()[0][:300]})
        print(f"  FAIL  {name}\n        {str(e).splitlines()[0][:300]}")


def make_photo_with_gps(path):
    """A 3000×2000 JPEG carrying EXIF GPS data, to prove uploads strip it."""
    img = Image.new("RGB", (3000, 2000), (40, 60, 200))
    exif = Image.Exif()
    exif[0x8825] = {1: "N", 2: (17.0, 23.0, 0.0), 3: "E", 4: (78.0, 29.0, 0.0)}  # GPS IFD
    exif[0x010F] = "TestCamera"
    img.save(path, "JPEG", quality=90, exif=exif.tobytes())


def login(page, email, password):
    page.goto(f"{BASE}/admin/login")
    page.fill("#email", email)
    page.fill("#password", password)
    page.click("button:has-text('Sign in')")


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path="/usr/bin/google-chrome")
        ctx = browser.new_context(viewport={"width": 1366, "height": 900})
        page = ctx.new_page()
        console_errors = []
        page.on("pageerror", lambda e: console_errors.append(str(e)))

        # ---------------- Public website ----------------
        def public_pages():
            for path, text in [
                ("/", "Kumar"),
                ("/about", "Meet Manoj Kumar Gudla"),
                ("/journey", "Tata Consultancy Services"),
                ("/resources", "Free resources"),
                ("/creator", "Digital Creator"),
                ("/achievements", "Independent Technology Initiative"),
                ("/beyond", "Beyond work"),
                ("/vision", "Vision & ambitions"),
                ("/contact", "Let"),
            ]:
                r = page.goto(BASE + path)
                assert r.status == 200, f"{path} returned {r.status}"
                expect(page.locator("main")).to_contain_text(text)
        check("All public pages render from the database (HTTP 200)", public_pages)

        def no_drafts_public():
            page.goto(f"{BASE}/journey")
            body = page.locator("main").inner_text()
            assert "HMI" not in body and "Adhoc" not in body, "draft internships leaked onto the public page"
            page.goto(f"{BASE}/creator")
            assert "YouTube subscribers" not in page.locator("main").inner_text(), "draft creator stats leaked"
        check("Draft content is not shown publicly", no_drafts_public)

        def gis_absent():
            for path in ["/", "/journey", "/about", "/achievements", "/vision", "/resources", "/creator"]:
                page.goto(BASE + path)
                body = page.locator("body").inner_text()
                assert "GIS" not in body, path
                assert "GeoIntel" not in body, f"GeoIntel on {path}"
            r = page.goto(BASE + "/projects/manowj-geointel")
            assert r.status == 404, r.status
            r = page.goto(BASE + "/projects")
            assert r.status == 404, f"empty Projects page should be hidden ({r.status})"
            r = page.goto(BASE + "/work-with-me")
            assert r.status == 404, f"Work with me should be hidden until a service is published ({r.status})"
        check("No GIS or GeoIntel anywhere; empty pages stay hidden", gis_absent)

        def unknown_404():
            r = page.goto(f"{BASE}/projects/does-not-exist")
            assert r.status == 404, r.status
            r = page.goto(f"{BASE}/nope")
            assert r.status == 404, r.status
        check("Unknown pages return 404", unknown_404)

        def seo():
            page.goto(BASE + "/")
            assert "Manoj Kumar Gudla" in page.title()
            og = page.locator('meta[property="og:title"]').get_attribute("content")
            assert og, "missing og:title"
            canon = page.locator('link[rel="canonical"]').get_attribute("href")
            assert canon and canon.startswith(BASE), canon
            ld = json.loads(page.locator('script[type="application/ld+json"]').first.inner_text())
            assert ld["@type"] == "Person" and ld["name"] == "Manoj Kumar Gudla"
            sm = urllib.request.urlopen(BASE + "/sitemap.xml").read().decode()
            assert "/resources" in sm and BASE in sm and "/projects" not in sm
            rb = urllib.request.urlopen(BASE + "/robots.txt").read().decode()
            assert "Disallow: /admin" in rb
            og_img = urllib.request.urlopen(BASE + "/opengraph-image")
            assert og_img.headers["content-type"] == "image/png"
            # Every page title is unique
            titles = set()
            for path in ["/", "/about", "/journey", "/resources", "/creator", "/contact"]:
                page.goto(BASE + path)
                titles.add(page.title())
            assert len(titles) == 6, titles
        check("SEO: titles, canonical, Open Graph, JSON-LD, sitemap, robots", seo)

        def headers():
            r = urllib.request.urlopen(BASE + "/")
            h = r.headers
            assert "frame-ancestors 'none'" in h["content-security-policy"]
            assert h["x-content-type-options"] == "nosniff"
            assert "x-powered-by" not in {k.lower() for k in h.keys()}
        check("Security headers present", headers)

        def theme():
            page.goto(BASE + "/")
            page.evaluate("localStorage.removeItem('theme')")
            page.reload()
            before = page.get_attribute("html", "data-theme")
            page.wait_for_load_state("networkidle")
            page.click("button[aria-label*='theme']")
            # The switch runs inside a view transition, so it lands a moment after the click.
            page.wait_for_function("b => document.documentElement.getAttribute('data-theme') !== b", arg=before)
            after = page.get_attribute("html", "data-theme")
            assert before != after, (before, after)
            page.reload()
            assert page.get_attribute("html", "data-theme") == after, "theme choice not remembered"
            page.evaluate("localStorage.removeItem('theme')")
        check("Theme switcher toggles and is remembered", theme)

        def mobile_menu():
            m = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
            mp = m.new_page()
            mp.goto(BASE + "/")
            mp.click("button[aria-controls='menu-sheet']")
            expect(mp.locator("#menu-sheet")).to_be_visible()
            mp.keyboard.press("Escape")
            expect(mp.locator("#menu-sheet")).to_have_count(0)
            mp.click("button[aria-controls='menu-sheet']")
            mp.click("#menu-sheet >> text=Journey")
            mp.wait_for_url("**/journey")
            overflow = mp.evaluate("document.documentElement.scrollWidth > window.innerWidth + 1")
            assert not overflow, "horizontal overflow on mobile"
            mp.screenshot(path=f"{SHOTS}/mobile-journey.png", full_page=True)
            m.close()
        check("Mobile menu opens, closes with Escape, navigates; no horizontal scroll", mobile_menu)

        def links():
            page.goto(BASE + "/")
            hrefs = set(page.eval_on_selector_all("a[href^='/']", "els => els.map(e => e.getAttribute('href'))"))
            bad = []
            for h in sorted(hrefs):
                if h.startswith("/api/"):
                    continue
                try:
                    code = urllib.request.urlopen(BASE + h).status
                except urllib.error.HTTPError as e:  # type: ignore[attr-defined]
                    code = e.code
                if code != 200:
                    bad.append((h, code))
            assert not bad, bad
        check("Internal links on the homepage all resolve", links)

        # ---------------- Contact form ----------------
        def contact_validation():
            page.goto(BASE + "/contact")
            page.fill("#full_name", "A")
            page.fill("#email", "not-an-email")
            page.fill("#subject", "Hi")
            page.fill("#message", "short")
            time.sleep(2.7)
            page.click("button:has-text('Send message')")
            expect(page.locator(".notice[role=alert]")).to_contain_text("highlighted")
            expect(page.locator("#email-err")).to_be_visible()
            expect(page.locator("#message-err")).to_be_visible()
        check("Contact form: server validation shows field errors", contact_validation)

        def contact_too_fast():
            page.goto(BASE + "/contact")
            page.fill("#full_name", "Fast Bot")
            page.fill("#email", "bot@example.com")
            page.fill("#subject", "Hello there")
            page.fill("#message", "This message is long enough to pass validation.")
            page.click("button:has-text('Send message')")
            expect(page.locator(".notice[role=alert]")).to_contain_text("could not be sent")
        check("Contact form: instant (bot-speed) submissions are rejected", contact_too_fast)

        def contact_ok():
            page.goto(BASE + "/contact?topic=brand")
            assert page.is_checked("input[value=brand]")
            page.fill("#full_name", "Priya Sharma")
            page.fill("#email", "priya@example.com")
            page.fill("#organisation", "Acme Labs")
            page.fill("#subject", "Brand collaboration")
            page.fill("#message", "Hi Manoj, we'd love to work with you on a video about our AI tool.")
            time.sleep(2.7)
            page.click("button:has-text('Send message')")
            expect(page.locator(".notice[role=status]")).to_contain_text("has been received")
        check("Contact form: valid message is stored and confirmed", contact_ok)

        def contact_csrf():
            req = urllib.request.Request(
                BASE + "/api/contact",
                data=json.dumps({"full_name": "X"}).encode(),
                headers={"content-type": "application/json", "origin": "https://evil.example"},
                method="POST",
            )
            try:
                urllib.request.urlopen(req)
                raise AssertionError("cross-site POST accepted")
            except urllib.error.HTTPError as e:  # type: ignore[attr-defined]
                assert e.code == 403, e.code
        check("Contact API rejects cross-site (CSRF) requests", contact_csrf)

        # ---------------- Admin auth ----------------
        def admin_protected():
            page.goto(BASE + "/admin")
            page.wait_for_url("**/admin/login")
            page.goto(BASE + "/admin/projects")
            page.wait_for_url("**/admin/login")
        check("Admin routes redirect signed-out visitors to login", admin_protected)

        def wrong_password():
            login(page, ADMIN[0], "wrong password")
            expect(page.locator(".notice[role=alert]")).to_contain_text("incorrect")
        check("Wrong password is refused", wrong_password)

        def non_admin():
            login(page, *VISITOR)
            expect(page.locator(".notice[role=alert]")).to_contain_text("doesn't have access")
            page.goto(BASE + "/admin")
            page.wait_for_url("**/admin/login")
        check("Signed-in non-admin users are refused", non_admin)

        def admin_login():
            login(page, *ADMIN)
            page.wait_for_url(BASE + "/admin")
            expect(page.locator("h1")).to_have_text("Overview")
            kpi = page.locator(".kpi", has_text="Published resources").first.locator("strong").inner_text()
            assert kpi == "37", kpi
            page.screenshot(path=f"{SHOTS}/admin-overview.png", full_page=True)
        check("Admin signs in; overview shows real database counts", admin_login)

        # ---------------- Content editing ----------------
        def edit_resource():
            page.goto(BASE + "/admin/resources")
            page.click(".title-cell >> text=ChatGPT")
            page.fill("#f-description", "My everyday AI assistant for drafts and debugging.")
            page.click("button:has-text('Update')")
            expect(page.locator(".form-status")).to_contain_text("Saved")
            page.goto(BASE + "/resources?q=chatgpt")
            expect(page.locator(".res-card")).to_have_count(1)
            expect(page.locator(".res-card")).to_contain_text("My everyday AI assistant")
        check("Editing a resource updates the public page immediately", edit_resource)

        def validation():
            page.goto(BASE + "/admin/projects/new")
            page.fill("#f-title", "Bad")
            page.fill("#f-slug", "Bad Slug!")
            page.fill("#f-live_url", "http://insecure.example")
            page.click("button:has-text('Save as draft')")
            expect(page.locator("#f-slug-err")).to_be_visible()
            expect(page.locator("#f-live_url-err")).to_contain_text("https://")
        check("Admin form validates slugs and URLs on the server", validation)

        def create_publish():
            page.goto(BASE + "/admin/projects/new")
            page.fill("#f-title", "Test Product")
            page.fill("#f-slug", "test-product")
            page.fill("#f-summary", "A product made during testing.")
            page.click("button:has-text('Save as draft')")
            page.wait_for_url(re.compile(r".*/admin/projects/[0-9a-f-]{36}\?created=1"))
            r = page.goto(BASE + "/projects/test-product")
            assert r.status == 404, f"draft visible publicly ({r.status}) cookies={[c['name'] for c in ctx.cookies()]} h1={page.locator('h1').first.inner_text()!r}"
            # Preview shows the draft to the admin only
            page.goto(BASE + "/api/preview?path=/projects/test-product")
            expect(page.locator(".preview-bar")).to_be_visible()
            expect(page.locator("main")).to_contain_text("Test Product")
            page.goto(BASE + "/api/preview?disable=1")
            # Publish from the list
            page.goto(BASE + "/admin/projects")
            row = page.locator("tr", has_text="Test Product")
            row.locator("button:has-text('Publish')").click()
            expect(row.locator(".pill")).to_have_text("Published")
            r = page.goto(BASE + "/projects/test-product")
            assert r.status == 200, r.status
        check("Draft → preview → publish workflow", create_publish)

        def reorder():
            page.goto(BASE + "/admin/resources")
            first = page.locator("tbody tr").first.locator(".title-cell a").inner_text()
            second = page.locator("tbody tr").nth(1).locator(".title-cell a").inner_text()
            page.locator("tbody tr").nth(1).locator("button[aria-label$=' up']").click()
            page.wait_for_timeout(800)
            page.reload()
            now_first = page.locator("tbody tr").first.locator(".title-cell a").inner_text()
            assert now_first == second and now_first != first, (first, second, now_first)
            page.goto(BASE + "/resources")
            assert page.locator(".res-card__name").first.inner_text() == second
        check("Reordering changes the order on the site", reorder)

        def delete_project():
            page.goto(BASE + "/admin/projects")
            page.click("text=Test Product")
            page.click("button:has-text('Delete project')")
            page.click("dialog[open] button:has-text('Delete permanently')")
            page.wait_for_url("**/admin/projects?deleted=1")
            r = page.goto(BASE + "/projects/test-product")
            assert r.status == 404, r.status
        check("Delete with confirmation removes the project from the site", delete_project)

        def stats():
            page.goto(BASE + "/admin/creator-stats")
            page.click("text=YouTube subscribers")
            page.select_option("#f-verification", "verified")
            page.fill("#f-verified_on", "")
            page.click("button:has-text('Publish')")
            expect(page.locator("#f-verified_on-err")).to_be_visible()
            page.select_option("#f-verification", "self_reported")
            page.click("button:has-text('Publish')")
            expect(page.locator(".form-status")).to_contain_text("Published")
            page.goto(BASE + "/creator")
            assert page.locator(".stat").count() > 0, "no stats on /creator: " + page.locator("main").inner_text()[:300]
            expect(page.locator(".stat")).to_contain_text("10K")
            expect(page.locator(".stat")).to_contain_text("Self-reported")
        check("Creator stats: verification rule enforced; published stat shows as self-reported", stats)

        def proficiency():
            page.goto(BASE + "/admin/skills")
            page.click("text=Python")
            page.select_option("#f-proficiency", "proficient")
            page.click("button:has-text('Update')")
            expect(page.locator(".form-status")).to_contain_text("Saved")
            page.goto(BASE + "/journey")
            assert "Proficient" not in page.locator("main").inner_text(), "unapproved proficiency shown"
            page.goto(BASE + "/admin/skills")
            page.click("text=Python")
            page.check("#f-proficiency_approved")
            page.click("button:has-text('Update')")
            expect(page.locator(".form-status")).to_contain_text("Saved")
            page.goto(BASE + "/journey")
            expect(page.locator("main")).to_contain_text("Proficient")
        check("Skill proficiency only appears after approval", proficiency)

        # ---------------- Media ----------------
        photo = "/var/tmp/e2e-photo.jpg"
        make_photo_with_gps(photo)

        def upload():
            page.goto(BASE + "/admin/media")
            page.select_option("#up-cat", "profile")
            page.fill("#up-alt", "Portrait of Manoj")
            page.set_input_files(".panel input[type=file]", photo)
            expect(page.locator(".media-card").first).to_contain_text("e2e-photo.jpg", timeout=20000)
            url = page.locator(".media-card img").first.get_attribute("src")
            data = urllib.request.urlopen(url).read()
            im = Image.open(io.BytesIO(data))
            assert im.format == "WEBP", im.format
            assert max(im.size) <= 2400, im.size
            assert not im.getexif().get(0x8825), "GPS data survived upload"
        check("Upload: image resized to ≤2400px, converted to WebP, GPS metadata removed", upload)

        def bad_upload():
            fake = "/var/tmp/e2e-fake.jpg"
            with open(fake, "wb") as f:
                f.write(b"<script>alert(1)</script>" * 20)
            page.goto(BASE + "/admin/media")
            page.set_input_files(".panel input[type=file]", fake)
            expect(page.locator(".dropzone [role=alert]")).to_be_visible(timeout=15000)
        check("Upload: a non-image disguised as .jpg is rejected", bad_upload)

        def portrait():
            page.goto(BASE + "/admin/profile")
            page.click("text=Portrait photograph (homepage) >> xpath=.. >> button:has-text('Choose or upload')")
            page.locator("dialog[open] .media-card").first.click()
            page.click("button:has-text('Save changes')")
            expect(page.locator(".form-status")).to_contain_text("saved")
            page.goto(BASE + "/")
            img = page.locator(".hero2__portrait img")
            expect(img).to_have_attribute("alt", "Portrait of Manoj")
            page.screenshot(path=f"{SHOTS}/home-with-portrait.png")
        check("Profile photo chosen in admin appears on the homepage", portrait)

        # ---------------- Enquiries ----------------
        def enquiries():
            page.goto(BASE + "/admin/enquiries")
            row = page.locator("tr.unread", has_text="Priya Sharma")
            expect(row).to_have_count(1)
            row.locator("a").click()
            expect(page.locator(".message-body")).to_contain_text("love to work with you")
            page.click("button:has-text('Responded')")
            page.goto(BASE + "/admin/enquiries?status=responded")
            expect(page.locator("tr", has_text="Priya Sharma")).to_have_count(1)
            page.click("text=Priya Sharma")
            page.click("button:has-text('Delete enquiry')")
            page.click("dialog[open] button:has-text('Delete permanently')")
            page.wait_for_url("**/admin/enquiries?deleted=1")
            page.goto(BASE + "/admin/enquiries?status=all")
            expect(page.locator("tr", has_text="Priya Sharma")).to_have_count(0)
        check("Enquiries: new → read on open → responded → deleted", enquiries)

        def resource_pack_flow():
            page.goto(BASE + "/admin/resource-packs/new")
            page.fill("#f-title", "5 AI tools I use every day")
            page.fill("#f-code", "ai-tools")
            page.fill("#f-keyword", "AI")
            page.fill("#f-video_url", "https://www.youtube.com/watch?v=dQw4w9WgXcQ")
            page.select_option("#f-platform", "youtube")
            page.click("button:has-text('Save as draft')")
            page.wait_for_url(re.compile(r".*/admin/resource-packs/[0-9a-f-]{36}\?created=1"))
            pack_url = page.url.split("?")[0]
            # add from library
            page.select_option("#add-resource", label="Claude")
            page.fill("#add-note", "What I used to write the script")
            page.click("button:has-text('Add to pack')")
            expect(page.locator(".notice--success")).to_contain_text("Added")
            # quick-add a brand-new resource
            page.fill("#new-name", "Perplexity")
            page.fill("#new-url", "https://www.perplexity.ai/")
            page.select_option("#new-price", "freemium")
            page.click("button:has-text('Add to pack')")
            expect(page.locator("#items-h")).to_contain_text("(2)")
            expect(page.locator(".panel", has=page.locator("#items-h"))).to_contain_text("Perplexity")
            expect(page.locator(".panel", has=page.locator("#items-h"))).not_to_contain_text("Deleted resource")
            # bad quick-add shows an inline error, not a crash
            page.fill("#new-name", "Broken")
            page.fill("#new-url", "http://insecure.example")
            page.click("button:has-text('Add to pack')")
            expect(page.locator(".notice--error")).to_contain_text("https://")
            # draft pack is not public
            r = page.goto(BASE + "/r/ai-tools")
            assert r.status == 404, f"draft pack public ({r.status})"
            page.goto(pack_url)
            page.click("button:has-text('Publish')")
            expect(page.locator(".form-status")).to_contain_text("Published")
            r = page.goto(BASE + "/r/ai-tools")
            assert r.status == 200, r.status
            expect(page.locator(".pack-item")).to_have_count(2)
            expect(page.locator(".pack-item").first).to_contain_text("What I used to write the script")
            expect(page.locator(".pack__video iframe")).to_have_attribute("src", re.compile("youtube-nocookie.com/embed/dQw4w9WgXcQ"))
            page.goto(BASE + "/resources")
            expect(page.locator(".pack-card")).to_contain_text("5 AI tools I use every day")
            page.goto(BASE + "/resources?q=perplexity")
            expect(page.locator(".res-card")).to_have_count(1)
        check("Resource pack: create, add from library, quick-add, publish, /r/ai-tools works", resource_pack_flow)

        def video_links_pack():
            page.goto(BASE + "/admin/creator-content/new")
            page.fill("#f-title", "5 AI tools I use every day")
            page.fill("#f-url", "https://www.youtube.com/watch?v=dQw4w9WgXcQ")
            page.select_option("#f-resource_pack_id", label="5 AI tools I use every day")
            page.click("button:has-text('Publish')")
            page.wait_for_url(re.compile(r".*created=1"))
            page.goto(BASE + "/creator")
            page.click("text=Resources from this video")
            page.wait_for_url("**/r/ai-tools")
            page.goto(BASE + "/")
            expect(page.locator(".now")).to_contain_text("5 AI tools I use every day")
            expect(page.locator(".t-video")).to_contain_text("Resources from this video")
        check("A video linked to a pack shows 'Resources from this video' (creator page + homepage)", video_links_pack)

        def services_flow():
            page.goto(BASE + "/admin/services")
            row = page.locator("tr", has_text="Brand collaborations")
            row.locator("button:has-text('Publish')").click()
            expect(row.locator(".pill")).to_have_text("Published")
            r = page.goto(BASE + "/work-with-me")
            assert r.status == 200, r.status
            expect(page.locator("main")).to_contain_text("Brand collaborations")
            expect(page.locator("nav.nav")).to_contain_text("Work with me")
            page.click("text=Start a conversation")
            page.wait_for_url("**/contact?topic=brand")
            assert page.is_checked("input[value=brand]")
        check("Work with me appears only after a service is published, and links to the right enquiry type", services_flow)

        def command_menu():
            page.goto(BASE + "/", wait_until="networkidle")
            page.keyboard.press("Control+k")
            expect(page.locator("dialog.cmdk")).to_be_visible()
            page.keyboard.type("journey")
            page.keyboard.press("Enter")
            page.wait_for_url("**/journey")
            page.goto(BASE + "/")
            page.click(".t-cmd")
            expect(page.locator("dialog.cmdk")).to_be_visible()
            page.keyboard.type("ai tools")
            expect(page.locator(".cmdk__item").first).to_contain_text("5 AI tools I use every day")
            page.keyboard.press("Escape")
            expect(page.locator("dialog.cmdk")).not_to_be_visible()
        check("Ctrl+K menu opens from keyboard and tile, searches content, navigates", command_menu)

        def settings():
            page.goto(BASE + "/admin/settings")
            page.fill("#f-seo_title", "Manoj Kumar Gudla — Builder & Creator")
            page.click("button:has-text('Save changes')")
            expect(page.locator(".form-status")).to_contain_text("saved")
            page.goto(BASE + "/")
            assert page.title() == "Manoj Kumar Gudla — Builder & Creator", page.title()
        check("Settings: SEO title change reaches the public site", settings)

        def admin_mobile():
            m = browser.new_context(viewport={"width": 390, "height": 844}, storage_state=ctx.storage_state())
            mp = m.new_page()
            mp.goto(BASE + "/admin/enquiries?status=all")
            mp.click("button[aria-controls='admin-mobile-nav']")
            mp.click("#admin-mobile-nav >> text=Projects")
            mp.wait_for_url("**/admin/projects")
            overflow = mp.evaluate("document.documentElement.scrollWidth > window.innerWidth + 1")
            assert not overflow, "admin overflows on mobile"
            mp.screenshot(path=f"{SHOTS}/admin-mobile-projects.png", full_page=True)
            m.close()
        check("Admin works on a phone-sized screen (menu, no overflow)", admin_mobile)

        def logout():
            page.goto(BASE + "/admin")
            page.click(".sidebar button:has-text('Sign out')")
            page.wait_for_url("**/admin/login?signed-out=1")
            page.goto(BASE + "/admin/profile")
            page.wait_for_url("**/admin/login")
        check("Sign out ends the session", logout)

        def preview_requires_admin():
            page.goto(BASE + "/api/preview?path=/")
            page.wait_for_url("**/admin/login")
        check("Preview mode cannot be enabled without signing in", preview_requires_admin)

        check("No uncaught JavaScript errors during the run", lambda: (_ for _ in ()).throw(AssertionError(console_errors[:3])) if console_errors else None)

        browser.close()

    passed = sum(r["ok"] for r in results)
    print(f"\n{passed}/{len(results)} end-to-end tests passed")
    with open(os.environ.get("E2E_REPORT", "/var/tmp/e2e-report.json"), "w") as f:
        json.dump(results, f, indent=2)
    sys.exit(0 if passed == len(results) else 1)


if __name__ == "__main__":
    main()
