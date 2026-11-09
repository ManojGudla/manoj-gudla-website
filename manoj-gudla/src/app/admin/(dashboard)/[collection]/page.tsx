import Link from "next/link";
import { notFound } from "next/navigation";
import { getCollection } from "@/lib/admin/collections";
import { moveItem, setItemStatus } from "@/lib/admin/actions/content";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { createSessionClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function display(v: unknown): string {
  if (v === null || v === undefined || v === "") return "";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (typeof v === "number") return v.toLocaleString("en-IN");
  return String(v).replace(/_/g, " ");
}

export default async function CollectionList({
  params,
  searchParams,
}: {
  params: Promise<{ collection: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  await requireAdmin();
  const { collection } = await params;
  const sp = await searchParams;
  const col = getCollection(collection);
  if (!col) notFound();

  const db = await createSessionClient();
  const { data, error } = await db.from(col.table).select("*").order("sort_order").order("created_at");
  const rows = (data ?? []) as Record<string, unknown>[];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{col.plural}</h1>
          <p>{col.description}</p>
        </div>
        <Link href={`/admin/${col.key}/new`} className="btn btn--sm">
          Add {col.singular}
        </Link>
      </div>

      {"deleted" in sp && (
        <p className="notice notice--success" role="status" style={{ marginBottom: "1rem" }}>
          Deleted. The website is updated.
        </p>
      )}
      {error && <p className="notice notice--error">The list couldn&apos;t be loaded: {error.message}</p>}

      <section className="panel">
        {rows.length === 0 ? (
          <div className="empty-state">
            <p>No {col.plural.toLowerCase()} yet.</p>
            <Link href={`/admin/${col.key}/new`} className="btn btn--sm">
              Add the first {col.singular}
            </Link>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th scope="col">{col.fields.find((f) => f.name === col.titleField)?.label ?? "Title"}</th>
                <th scope="col">Status</th>
                <th scope="col">Updated</th>
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const id = String(r.id);
                const title = display(r[col.titleField]) || `Untitled ${col.singular}`;
                const meta = (col.metaFields ?? [])
                  .map((m) => {
                    const f = col.fields.find((x) => x.name === m);
                    const label = f?.type === "select" ? f.options.find((o) => o.value === r[m])?.label : undefined;
                    return label ?? display(r[m]);
                  })
                  .filter(Boolean)
                  .join(", ");
                const published = r.status === "published";
                return (
                  <tr key={id}>
                    <td className="title-cell">
                      <Link href={`/admin/${col.key}/${id}`}>{title}</Link>
                      {meta && <span className="sub">{meta}</span>}
                    </td>
                    <td data-label="Status">
                      <span className={`pill pill--${published ? "published" : "draft"}`}>{published ? "Published" : "Draft"}</span>
                    </td>
                    <td data-label="Updated" className="muted" style={{ fontSize: "var(--fs-meta)" }}>
                      {formatDate(String(r.updated_at), { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td>
                      <div className="row-actions">
                        <form action={moveItem}>
                          <input type="hidden" name="_collection" value={col.key} />
                          <input type="hidden" name="_id" value={id} />
                          <input type="hidden" name="dir" value="up" />
                          <button className="icon-action" disabled={i === 0} aria-label={`Move ${title} up`}>
                            ↑
                          </button>
                        </form>
                        <form action={moveItem}>
                          <input type="hidden" name="_collection" value={col.key} />
                          <input type="hidden" name="_id" value={id} />
                          <input type="hidden" name="dir" value="down" />
                          <button className="icon-action" disabled={i === rows.length - 1} aria-label={`Move ${title} down`}>
                            ↓
                          </button>
                        </form>
                        <form action={setItemStatus}>
                          <input type="hidden" name="_collection" value={col.key} />
                          <input type="hidden" name="_id" value={id} />
                          <input type="hidden" name="status" value={published ? "draft" : "published"} />
                          <button className="btn btn--sm btn--ghost">{published ? "Unpublish" : "Publish"}</button>
                        </form>
                        {col.previewPath && (
                          <a className="btn btn--sm btn--ghost" href={`/api/preview?path=${encodeURIComponent(col.previewPath(r))}`} target="_blank">
                            Preview
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
