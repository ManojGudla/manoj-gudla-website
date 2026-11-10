import Link from "next/link";
import { COLLECTIONS } from "@/lib/admin/collections";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { createSessionClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Overview() {
  await requireAdmin();
  const db = await createSessionClient();
  const count = (table: string, filter?: [string, string]) => {
    let q = db.from(table).select("id", { count: "exact", head: true });
    if (filter) q = q.eq(filter[0], filter[1]);
    return q.then((r) => r.count ?? 0);
  };

  const [projects, published, drafts, creator, achievements, enquiries, newEnq, profile, packs, resourceCount] = await Promise.all([
    count("projects"),
    count("projects", ["status", "published"]),
    count("projects", ["status", "draft"]),
    count("creator_content"),
    count("achievements", ["status", "published"]),
    count("enquiries"),
    count("enquiries", ["status", "new"]),
    db.from("profile").select("photo_media_id, resume_media_id").eq("id", 1).single(),
    count("resource_packs", ["status", "published"]),
    count("resources", ["status", "published"]),
  ]);

  // Recent updates across every collection (real timestamps from the database).
  const recentLists = await Promise.all(
    COLLECTIONS.map(async (c) => {
      const { data } = await db.from(c.table).select(`id, status, updated_at, ${c.titleField}`).order("updated_at", { ascending: false }).limit(4);
      return (data ?? []).map((r) => {
        const row = r as unknown as Record<string, unknown>;
        return {
          href: `/admin/${c.key}/${row.id}`,
          title: String(row[c.titleField] || `Untitled ${c.singular}`),
          type: c.plural,
          status: String(row.status),
          updated_at: String(row.updated_at),
        };
      });
    }),
  );
  const recent = recentLists.flat().sort((a, b) => b.updated_at.localeCompare(a.updated_at)).slice(0, 8);

  const draftCounts = await Promise.all(
    COLLECTIONS.map(async (c) => ({ c, n: await count(c.table, ["status", "draft"]) })),
  );
  const todo: { text: string; href: string }[] = [];
  if (newEnq) todo.push({ text: `${newEnq} new ${newEnq === 1 ? "enquiry" : "enquiries"} to read`, href: "/admin/enquiries" });
  if (!profile.data?.photo_media_id) todo.push({ text: "Add your portrait photograph", href: "/admin/profile" });
  if (!profile.data?.resume_media_id) todo.push({ text: "Upload your résumé PDF", href: "/admin/profile" });
  for (const { c, n } of draftCounts) if (n) todo.push({ text: `${c.plural}: ${n} ${n === 1 ? "draft" : "drafts"} waiting for review`, href: `/admin/${c.key}` });

  const kpis = [
    { label: "Projects", value: projects, href: "/admin/projects" },
    { label: "Published projects", value: published, href: "/admin/projects" },
    { label: "Draft projects", value: drafts, href: "/admin/projects" },
    { label: "Creator content", value: creator, href: "/admin/creator-content" },
    { label: "Live resource packs", value: packs, href: "/admin/resource-packs" },
    { label: "Published resources", value: resourceCount, href: "/admin/resources" },
    { label: "Published achievements", value: achievements, href: "/admin/achievements" },
    { label: "Enquiries", value: enquiries, href: "/admin/enquiries" },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Overview</h1>
          <p>Everything here reads directly from your database.</p>
        </div>
        <div className="actions">
          <a className="btn btn--sm btn--ghost" href="/api/preview?path=/">
            Preview site with drafts
          </a>
          <Link className="btn btn--sm" href="/admin/resource-packs/new">
            New resource pack
          </Link>
        </div>
      </div>

      <div className="kpis">
        {kpis.map((k) => (
          <Link key={k.label} href={k.href} className="kpi">
            <span>{k.label}</span>
            <strong>{k.value}</strong>
          </Link>
        ))}
      </div>

      <div className="grid-2">
        <section className="panel" aria-labelledby="todo-h">
          <div className="panel__head">
            <h2 id="todo-h">Needs attention</h2>
          </div>
          {todo.length ? (
            <table className="table">
              <tbody>
                {todo.map((t) => (
                  <tr key={t.text}>
                    <td className="title-cell">
                      <Link href={t.href}>{t.text}</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="empty-state">Nothing waiting. Everything is published and up to date.</p>
          )}
        </section>

        <section className="panel" aria-labelledby="recent-h">
          <div className="panel__head">
            <h2 id="recent-h">Recent content updates</h2>
          </div>
          {recent.length ? (
            <table className="table">
              <tbody>
                {recent.map((r) => (
                  <tr key={r.href}>
                    <td className="title-cell">
                      <Link href={r.href}>{r.title}</Link>
                      <span className="sub">
                        {r.type}, {formatDate(r.updated_at, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span className={`pill pill--${r.status}`}>{r.status === "published" ? "Published" : "Draft"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="empty-state">No content yet.</p>
          )}
        </section>
      </div>
    </>
  );
}
