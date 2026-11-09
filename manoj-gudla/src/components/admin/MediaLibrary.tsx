"use client";
import { useActionState, useMemo, useRef, useState } from "react";
import { deleteMedia, updateMedia, type MediaItem } from "@/lib/admin/actions/media";
import { initialState } from "@/lib/admin/state";
import type { MediaCategory } from "@/lib/types";
import { CATEGORY_OPTIONS, Uploader } from "./Uploader";

function size(bytes: number) {
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function Editor({ item, onClose, onReplaced, onDeleted }: { item: MediaItem; onClose: () => void; onReplaced: (m: MediaItem) => void; onDeleted: (id: string) => void }) {
  const [state, action, pending] = useActionState(updateMedia, initialState);
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const isPdf = item.mime_type === "application/pdf";
  return (
    <div className="panel" style={{ marginBottom: "1.25rem" }}>
      <div className="panel__head">
        <h2>{item.file_name}</h2>
        <button className="btn btn--sm btn--ghost" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="panel__body grid-2">
        <div>
          {isPdf ? (
            <a className="btn btn--sm btn--ghost" href={item.url} target="_blank" rel="noopener">
              Open PDF
            </a>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.url} alt={item.alt_text} style={{ width: "100%", borderRadius: 8, border: "1px solid var(--line)" }} />
          )}
          <p className="muted" style={{ fontSize: "var(--fs-meta)", marginTop: "0.5rem" }}>
            {item.width && item.height ? `${item.width} × ${item.height}, ` : ""}
            {size(item.size_bytes)}
          </p>
        </div>
        <div style={{ display: "grid", gap: "1.25rem", alignContent: "start" }}>
          <form action={action} style={{ display: "grid", gap: "1rem" }}>
            <input type="hidden" name="id" value={item.id} />
            {!isPdf && (
              <div className="field">
                <label htmlFor="alt">Alt text</label>
                <textarea id="alt" name="alt_text" className="textarea" rows={3} maxLength={300} defaultValue={item.alt_text} />
                <span className="hint">Describe what&apos;s in the image for people using screen readers and for search engines.</span>
                {state.errors?.alt_text && <span className="error">{state.errors.alt_text}</span>}
              </div>
            )}
            {isPdf && <input type="hidden" name="alt_text" value={item.alt_text} />}
            <div className="field">
              <label htmlFor="cat">Category</label>
              <select id="cat" name="category" className="select" defaultValue={item.category}>
                {CATEGORY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="actions">
              <button className="btn btn--sm" disabled={pending}>
                {pending ? "Saving…" : "Save details"}
              </button>
              {state.message && (
                <span className="form-status" data-ok={state.ok} role="status">
                  {state.message}
                </span>
              )}
            </div>
          </form>

          <div className="field">
            <span className="label">Replace file</span>
            <span className="hint">Everywhere this file is used updates automatically.</span>
            <Uploader replaceId={item.id} accept={isPdf ? "pdf" : "image"} defaultCategory={item.category} compact onDone={onReplaced} />
          </div>

          <div>
            {!confirm ? (
              <button className="btn btn--sm btn--danger" onClick={() => setConfirm(true)}>
                Delete file
              </button>
            ) : (
              <div className="notice notice--error" role="alertdialog" aria-label="Confirm delete">
                <p style={{ marginBottom: "0.75rem" }}>
                  Delete this file permanently? Anywhere it&apos;s used will show a placeholder instead, and gallery entries using it are removed.
                </p>
                <div className="actions">
                  <button className="btn btn--sm btn--ghost" onClick={() => setConfirm(false)} autoFocus>
                    Cancel
                  </button>
                  <button
                    className="btn btn--sm btn--danger"
                    disabled={deleting}
                    onClick={async () => {
                      setDeleting(true);
                      const fd = new FormData();
                      fd.set("id", item.id);
                      try {
                        await deleteMedia(fd);
                        onDeleted(item.id);
                      } finally {
                        setDeleting(false);
                      }
                    }}
                  >
                    {deleting ? "Deleting…" : "Delete permanently"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MediaLibrary({ initial }: { initial: MediaItem[] }) {
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState<MediaCategory | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const visible = useMemo(() => (filter === "all" ? items : items.filter((i) => i.category === filter)), [items, filter]);
  const open = items.find((i) => i.id === openId);

  return (
    <>
      <section className="panel" style={{ marginBottom: "1.25rem" }}>
        <div className="panel__head">
          <h2>Upload</h2>
        </div>
        <div className="panel__body">
          <Uploader onDone={(m) => setItems((prev) => [m, ...prev])} />
        </div>
      </section>

      <div ref={editorRef}>
        {open && (
          <Editor
            key={open.id + open.url}
            item={open}
            onClose={() => setOpenId(null)}
            onReplaced={(m) => setItems((prev) => prev.map((p) => (p.id === m.id ? m : p)))}
            onDeleted={(id) => {
              setItems((prev) => prev.filter((p) => p.id !== id));
              setOpenId(null);
            }}
          />
        )}
      </div>

      <div className="tabs" role="group" aria-label="Filter by category">
        {[{ value: "all", label: "All" }, ...CATEGORY_OPTIONS].map((o) => (
          <a
            key={o.value}
            href="#"
            aria-current={filter === o.value ? "page" : undefined}
            onClick={(e) => {
              e.preventDefault();
              setFilter(o.value as MediaCategory | "all");
            }}
          >
            {o.label}
          </a>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="panel empty-state">No files here yet. Upload one above.</p>
      ) : (
        <div className="media-grid">
          {visible.map((m) => (
            <button
              key={m.id}
              type="button"
              className="media-card"
              aria-pressed={openId === m.id}
              onClick={() => {
                setOpenId(m.id);
                editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              <span className="media-thumb">
                {m.mime_type === "application/pdf" ? (
                  "PDF"
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.url} alt="" loading="lazy" />
                )}
              </span>
              <span className="name">{m.file_name}</span>
              <span className="meta">
                {CATEGORY_OPTIONS.find((o) => o.value === m.category)?.label}
                {!m.alt_text && m.mime_type !== "application/pdf" ? ", needs alt text" : ""}
              </span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}
