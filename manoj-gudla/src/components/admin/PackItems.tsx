import { addPackItem, movePackItem, removePackItem, updatePackItem } from "@/lib/admin/actions/content";
import { RESOURCE_CATEGORIES } from "@/lib/admin/collections";
import { createSessionClient } from "@/lib/supabase/server";

/** Server component: the list of resources inside one pack, with add / note / reorder / remove. */
const ITEM_ERRORS: Record<string, string> = {
  new: "To add a new resource, give it a name and a full link starting with https://",
  choose: "Choose a resource from the library, or fill in a new one.",
  save: "That resource couldn't be added. Try again.",
};

export async function PackItems({ packId, error, added }: { packId: string; error?: string; added?: boolean }) {
  const db = await createSessionClient();
  const [{ data: items }, { data: library }] = await Promise.all([
    db
      .from("resource_pack_items")
      .select("id, note, resource_id")
      .eq("pack_id", packId)
      .order("sort_order")
      .order("created_at"),
    db.from("resources").select("id, name, url, category, status").order("category").order("name"),
  ]);
  const byId = new Map((library ?? []).map((r) => [r.id, r]));
  const rows = (items ?? []).map((i) => ({ ...i, r: byId.get(i.resource_id) ?? null }));
  const used = new Set(rows.map((r) => r.resource_id));
  const available = (library ?? []).filter((r) => !used.has(r.id));
  const byCategory = new Map<string, typeof available>();
  for (const r of available) byCategory.set(r.category, [...(byCategory.get(r.category) ?? []), r]);

  return (
    <section className="panel" style={{ marginTop: "1.25rem" }} aria-labelledby="items-h">
      <div className="panel__head">
        <div>
          <h2 id="items-h">Resources in this pack ({rows.length})</h2>
          <p>Shown in this order on the pack page. Changes save immediately.</p>
        </div>
      </div>
      <div className="panel__body" style={{ display: "grid", gap: "0.75rem" }}>
        {error && ITEM_ERRORS[error] && (
          <p className="notice notice--error" role="alert">
            {ITEM_ERRORS[error]}
          </p>
        )}
        {added && !error && (
          <p className="notice notice--success" role="status">
            Added. The pack page is updated.
          </p>
        )}
        {rows.length === 0 && <p className="muted">No resources yet. Add the tools from your video below.</p>}
        {rows.map((it, i) => (
          <div key={it.id} className="media-field" style={{ borderStyle: "solid" }}>
            <div style={{ flex: "1 1 200px", minWidth: 0 }}>
              <strong style={{ display: "block" }}>
                {it.r?.name ?? "Deleted resource"}
                {it.r?.status === "draft" && <span className="pill pill--draft" style={{ marginLeft: "0.5rem" }}>Draft — hidden</span>}
              </strong>
              <span className="muted" style={{ fontSize: "var(--fs-meta)", wordBreak: "break-all" }}>
                {it.r?.url}
              </span>
            </div>
            <form action={updatePackItem} className="actions" style={{ flex: "2 1 280px" }}>
              <input type="hidden" name="id" value={it.id} />
              <label className="sr-only" htmlFor={`note-${it.id}`}>
                Note for {it.r?.name}
              </label>
              <input
                id={`note-${it.id}`}
                name="note"
                className="input"
                defaultValue={it.note}
                maxLength={300}
                placeholder="Why it's in this video (optional)"
                style={{ flex: 1 }}
              />
              <button className="btn btn--sm btn--ghost">Save note</button>
            </form>
            <div className="actions">
              {(["up", "down"] as const).map((dir) => (
                <form key={dir} action={movePackItem}>
                  <input type="hidden" name="id" value={it.id} />
                  <input type="hidden" name="pack_id" value={packId} />
                  <input type="hidden" name="dir" value={dir} />
                  <button
                    className="icon-action"
                    disabled={dir === "up" ? i === 0 : i === rows.length - 1}
                    aria-label={`Move ${it.r?.name ?? "resource"} ${dir}`}
                  >
                    {dir === "up" ? "↑" : "↓"}
                  </button>
                </form>
              ))}
              <form action={removePackItem}>
                <input type="hidden" name="id" value={it.id} />
                <button className="btn btn--sm btn--danger">Remove</button>
              </form>
            </div>
          </div>
        ))}

        <form action={addPackItem} className="dropzone" style={{ marginTop: "0.5rem" }}>
          <input type="hidden" name="pack_id" value={packId} />
          <h3>Add a resource</h3>
          <div className="form-grid">
            <div className="field wide">
              <label htmlFor="add-resource">From your library</label>
              <select id="add-resource" name="resource_id" className="select" defaultValue="">
                <option value="">Choose a resource…</option>
                {[...byCategory.entries()].map(([cat, list]) => (
                  <optgroup key={cat} label={cat}>
                    {list.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                        {r.status === "draft" ? " (draft)" : ""}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <p className="wide muted" style={{ fontSize: "var(--fs-small)" }}>
              Not in the library yet? Fill these in instead — it&apos;s added to the library and to this pack.
            </p>
            <div className="field">
              <label htmlFor="new-name">New resource name</label>
              <input id="new-name" name="new_name" className="input" maxLength={120} />
            </div>
            <div className="field">
              <label htmlFor="new-url">Link</label>
              <input id="new-url" name="new_url" className="input" type="url" placeholder="https://" />
            </div>
            <div className="field">
              <label htmlFor="new-cat">Topic</label>
              <input id="new-cat" name="new_category" className="input" list="new-cat-list" defaultValue="AI Tools" maxLength={60} />
              <datalist id="new-cat-list">
                {RESOURCE_CATEGORIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div className="field">
              <label htmlFor="new-price">Price</label>
              <select id="new-price" name="new_pricing" className="select" defaultValue="free">
                <option value="free">Free</option>
                <option value="freemium">Free + paid plans</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div className="field wide">
              <label htmlFor="add-note">Note (optional)</label>
              <input id="add-note" name="note" className="input" maxLength={300} placeholder="e.g. The one I used for the thumbnail" />
            </div>
          </div>
          <div>
            <button className="btn btn--sm">Add to pack</button>
          </div>
        </form>
      </div>
    </section>
  );
}
