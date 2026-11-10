"""
Accessibility (axe-core), layout and screenshot pass over every public page,
in light and dark themes, on desktop and phone sizes. Admin pages are scanned
too when ADMIN_EMAIL/ADMIN_PASSWORD are set.
"""
import json, os, sys
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE", "http://localhost:3200")
OUT = os.environ.get("SHOTS_DIR", "/var/tmp/qa-shots")
os.makedirs(OUT, exist_ok=True)
AXE = open(os.path.join(os.path.dirname(__file__), "../../node_modules/axe-core/axe.min.js")).read()
PAGES = ["/", "/about", "/journey", "/resources", "/creator", "/achievements", "/beyond", "/vision", "/contact"]
ADMIN_PAGES = ["/admin", "/admin/resource-packs", "/admin/resource-packs/00000000-0000-4000-800b-000000000001", "/admin/resources", "/admin/profile", "/admin/media", "/admin/enquiries", "/admin/settings"]

report = {"axe": [], "overflow": []}

def scan(page, label):
    page.add_script_tag(content=AXE)
    res = page.evaluate("async () => (await axe.run(document, {resultTypes:['violations']})).violations.map(v => ({id:v.id, impact:v.impact, help:v.help, nodes:v.nodes.length, sample:v.nodes[0]?.target}))")
    for v in res:
        if v["impact"] in ("serious", "critical"):
            report["axe"].append({"page": label, **v})

with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome")
    for theme in ("light", "dark"):
        for w, h, tag in ((1440, 900, "desk"), (390, 844, "mob")):
            ctx = b.new_context(viewport={"width": w, "height": h}, color_scheme=theme)
            pg = ctx.new_page()
            for path in PAGES:
                pg.goto(BASE + path, wait_until="networkidle")
                pg.evaluate("document.querySelectorAll('[data-reveal]').forEach(e=>e.classList.add('is-in'))")
                pg.wait_for_timeout(1300)
                if pg.evaluate("document.documentElement.scrollWidth > window.innerWidth + 1"):
                    report["overflow"].append(f"{path} {tag} {theme}")
                scan(pg, f"{path} [{tag}/{theme}]")
                name = (path.strip("/").replace("/", "_") or "home")
                pg.screenshot(path=f"{OUT}/{name}-{tag}-{theme}.png", full_page=True)
            ctx.close()
    if os.environ.get("ADMIN_EMAIL"):
        ctx = b.new_context(viewport={"width": 1366, "height": 900})
        pg = ctx.new_page()
        pg.goto(BASE + "/admin/login"); pg.fill("#email", os.environ["ADMIN_EMAIL"]); pg.fill("#password", os.environ["ADMIN_PASSWORD"])
        pg.click("button:has-text('Sign in')"); pg.wait_for_url(BASE + "/admin")
        for path in ADMIN_PAGES:
            pg.goto(BASE + path, wait_until="networkidle")
            scan(pg, f"{path} [admin]")
            pg.screenshot(path=f"{OUT}/admin{path.replace('/', '_')}.png", full_page=True)
        ctx.close()
    b.close()

uniq = {}
for v in report["axe"]:
    uniq.setdefault(v["id"], []).append(v["page"])
print(json.dumps({"axe_serious_or_critical": {k: {"help": next(x["help"] for x in report["axe"] if x["id"] == k), "pages": len(p), "first": p[0], "sample": next(x["sample"] for x in report["axe"] if x["id"] == k)} for k, p in uniq.items()}, "overflow": report["overflow"]}, indent=2))
json.dump(report, open(os.environ.get("QA_REPORT", "/var/tmp/qa-report.json"), "w"), indent=2)
sys.exit(1 if report["axe"] or report["overflow"] else 0)
