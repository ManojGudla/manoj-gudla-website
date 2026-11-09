import Link from "next/link";
import { notFound } from "next/navigation";
import { AddScreenshot } from "@/components/admin/AddScreenshot";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { ItemForm } from "@/components/admin/ItemForm";
import { getCollection } from "@/lib/admin/collections";
import { deleteItem, moveProjectImage, removeProjectImage, saveItem, updateProjectImage } from "@/lib/admin/actions/content";
import { selectedMediaFor } from "@/lib/admin/media-map";
import { requireAdmin } from "@/lib/auth";
import { mediaPublicUrl } from "@/lib/media-url";
import { createSessionClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f-]{36}$/i;

/** Sensible defaults for a brand-new item. */
function defaults(table: string): Record<string, unknown> {
  const today = new Date().toISOString().slice(0, 10);
  const base: Record<string, Record<string, unknown>> = {
    projects: { dev_status: "in_development" },
    creator_content: { platform: "youtube", category: "technology" },
    creator_stats: { platform: "youtube", verification: "self_reported", last_updated: today },
    skills: { category: "programming" },
    education: { progress: "completed" },
    achievements: { kind: "milestone" },
    gallery_items: { category: "lifestyle" },
    vision_items: { area: "technologies", horizon: "Next" },
  };
  return base[table] ?? {};
}

export default async function EditItem({
  params,
  searchParams,
}: {
  params: Promise<{ collection: string; id: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  await requireAdmin();
  const { collection, id } = await params;
  const sp = await searchParams;
  const col = getCollection(collection);
  if (!col) notFound();
  const isNew = id === "new";
  if (!isNew && !UUID.test(id)) notFound();

  const db = await createSessionClient();
  let row: Record<string, unknown> = defaults(col.table);
  if (!isNew) {
    const { data } = await db.from(col.table).select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    row = data;
  }
  const media = await selectedMediaFor(db, col.fields, row);

  let screenshots: { id: string; caption: string; url: string; file_name: string }[] = [];
  if (col.table === "projects" && !isNew) {
    const { data } = await db
      .from("project_images")
      .select("id, caption, media_assets(storage_path, file_name)")
      .eq("project_id", id)
      .order("sort_order")
      .order("created_at");
    screenshots = (data ?? []).map((s) => {
      const m = s.media_assets as unknown as { storage_path: string; file_name: string } | null;
      return { id: s.id, caption: s.caption, url: m ? mediaPublicUrl(m.storage_path) : "", file_name: m?.file_name ?? "" };
    });
  }

  const title = isNew ? `New ${col.singular}` : String(row[col.titleField] || `Untitled ${col.singular}`);
  const status = (row.status as "draft" | "published" | undefined) ?? "draft";

  return (
    <>
      <div className="page-head">
        <div>
          <p className="crumbs">
            <Link href={`/admin/${col.key}`}>{col.plural}</Link>
          </p>
          <h1>{title}</h1>
        </div>
        {!isNew && col.previewPath && (
          <div className="actions">
            <a className="btn btn--sm btn--ghost" href={`/api/preview?path=${encodeURIComponent(col.previewPath(row))}`} target="_blank">
              Preview on site
            </a>
          </div>
        )}
      </div>

      {"created" in sp && (
        <p className="notice notice--success" role="status" style={{ marginBottom: "1rem" }}>
          Created. {status === "published" ? "It is live on the website." : "It is saved as a draft — publish it when it's ready."}
        </p>
      )}

      <ItemForm
        action={saveItem}
        fields={col.fields}
        values={row}
        media={media}
        hidden={{ _collection: col.key, ...(isNew ? {} : { _id: id }) }}
        status={status}
        isNew={isNew}
      />

      {col.table === "projects" && !isNew && (
        <section className="panel" style={{ marginTop: "1.25rem" }} aria-labelledby="shots-h">
          <div className="panel__head">
            <div>
              <h2 id="shots-h">Screenshots</h2>
              <p>Shown in order on the project page. Changes save immediately.</p>
            </div>
          </div>
          <div className="panel__body" style={{ display: "grid", gap: "1rem" }}>
            {screenshots.length === 0 && <p className="muted">No screenshots yet.</p>}
            {screenshots.map((s, i) => (
              <div key={s.id} className="media-field" style={{ borderStyle: "solid" }}>
                <span className="media-thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {s.url && <img src={s.url} alt="" />}
                </span>
                <form action={updateProjectImage} className="actions" style={{ flex: "1 1 260px" }}>
                  <input type="hidden" name="id" value={s.id} />
                  <label className="sr-only" htmlFor={`cap-${s.id}`}>
                    Caption
                  </label>
                  <input id={`cap-${s.id}`} name="caption" className="input" defaultValue={s.caption} placeholder="Caption (optional)" maxLength={300} style={{ flex: 1 }} />
                  <button className="btn btn--sm btn--ghost">Save caption</button>
                </form>
                <div className="actions">
                  {(["up", "down"] as const).map((dir) => (
                    <form key={dir} action={moveProjectImage}>
                      <input type="hidden" name="id" value={s.id} />
                      <input type="hidden" name="project_id" value={id} />
                      <input type="hidden" name="dir" value={dir} />
                      <button
                        className="icon-action"
                        disabled={dir === "up" ? i === 0 : i === screenshots.length - 1}
                        aria-label={`Move screenshot ${dir}`}
                      >
                        {dir === "up" ? "↑" : "↓"}
                      </button>
                    </form>
                  ))}
                  <form action={removeProjectImage}>
                    <input type="hidden" name="id" value={s.id} />
                    <button className="btn btn--sm btn--danger">Remove</button>
                  </form>
                </div>
              </div>
            ))}
            <AddScreenshot projectId={id} />
          </div>
        </section>
      )}

      {!isNew && (
        <section className="panel" style={{ marginTop: "1.25rem" }} aria-labelledby="danger-h">
          <div className="panel__head">
            <div>
              <h2 id="danger-h">Delete this {col.singular}</h2>
              <p>This removes it from the website and the database. It cannot be undone — unpublish instead if you might want it back.</p>
            </div>
            <ConfirmSubmit
              action={deleteItem}
              fields={{ _collection: col.key, _id: id }}
              label={`Delete ${col.singular}`}
              title={`Delete “${title}”?`}
              body="This permanently deletes it. Uploaded images stay in the media library."
              confirmLabel="Delete permanently"
            />
          </div>
        </section>
      )}
    </>
  );
}
