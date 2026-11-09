"use client";
import { useEffect, useRef, useState } from "react";
import { listMedia, type MediaItem } from "@/lib/admin/actions/media";
import type { MediaCategory } from "@/lib/types";
import { Uploader } from "./Uploader";

export interface SelectedMedia {
  id: string;
  url: string;
  file_name: string;
  mime_type: string;
}

function Thumb({ m }: { m: SelectedMedia | MediaItem | null }) {
  if (!m) return <span className="media-thumb">None</span>;
  if (m.mime_type === "application/pdf") return <span className="media-thumb">PDF</span>;
  return (
    <span className="media-thumb">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={m.url} alt="" loading="lazy" />
    </span>
  );
}

export function MediaPicker({
  name,
  label,
  initial,
  category,
  accept = "image",
  error,
  hint,
}: {
  name: string;
  label: string;
  initial: SelectedMedia | null;
  category: MediaCategory;
  accept?: "image" | "pdf";
  error?: string;
  hint?: string;
}) {
  const [selected, setSelected] = useState<SelectedMedia | null>(initial);
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"suggested" | "all">("suggested");
  const dialog = useRef<HTMLDialogElement>(null);

  async function open() {
    dialog.current?.showModal();
    if (!items) {
      try {
        setItems(await listMedia());
      } catch {
        setLoadError("The media library couldn't be loaded.");
      }
    }
  }

  useEffect(() => setSelected(initial), [initial]);

  const pdf = accept === "pdf";
  const visible = (items ?? []).filter((m) =>
    pdf ? m.mime_type === "application/pdf" : m.mime_type !== "application/pdf" && (filter === "all" || m.category === category),
  );

  return (
    <div className="field">
      <span className="label" id={`${name}-label`}>
        {label}
      </span>
      <input type="hidden" name={name} value={selected?.id ?? ""} />
      <div className="media-field" aria-labelledby={`${name}-label`}>
        <Thumb m={selected} />
        <div style={{ display: "grid", gap: "0.4rem", minWidth: 0 }}>
          <span style={{ fontSize: "var(--fs-small)", overflow: "hidden", textOverflow: "ellipsis" }}>
            {selected ? selected.file_name : pdf ? "No file chosen" : "No image chosen — a labelled placeholder is shown on the site."}
          </span>
          <div className="actions">
            <button type="button" className="btn btn--sm btn--ghost" onClick={open}>
              {selected ? "Change" : "Choose or upload"}
            </button>
            {selected && (
              <button type="button" className="btn btn--sm btn--ghost" onClick={() => setSelected(null)}>
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
      {hint && <span className="hint">{hint}</span>}
      {error && <span className="error">{error}</span>}

      <dialog ref={dialog} className="modal" aria-labelledby={`${name}-dlg`}>
        <div className="modal__head">
          <h2 id={`${name}-dlg`}>{label}</h2>
          <button type="button" className="btn btn--sm btn--ghost" onClick={() => dialog.current?.close()}>
            Close
          </button>
        </div>
        <div className="modal__body" style={{ display: "grid", gap: "1.25rem" }}>
          <Uploader
            defaultCategory={category}
            accept={pdf ? "pdf" : "image"}
            onDone={(item) => {
              setItems((prev) => [item, ...(prev ?? [])]);
              setSelected(item);
              dialog.current?.close();
            }}
          />
          {!pdf && (
            <div className="tabs" role="group" aria-label="Filter">
              <a href="#" aria-current={filter === "suggested" ? "page" : undefined} onClick={(e) => (e.preventDefault(), setFilter("suggested"))}>
                Suggested
              </a>
              <a href="#" aria-current={filter === "all" ? "page" : undefined} onClick={(e) => (e.preventDefault(), setFilter("all"))}>
                All images
              </a>
            </div>
          )}
          {loadError && <p className="notice notice--error">{loadError}</p>}
          {!items && !loadError && <p className="muted">Loading library…</p>}
          {items && visible.length === 0 && <p className="muted">Nothing here yet — upload a file above.</p>}
          <div className="media-grid">
            {visible.map((m) => (
              <button
                type="button"
                key={m.id}
                className="media-card"
                aria-pressed={selected?.id === m.id}
                onClick={() => {
                  setSelected(m);
                  dialog.current?.close();
                }}
              >
                <Thumb m={m} />
                <span className="name">{m.file_name}</span>
                <span className="meta">{m.alt_text ? "Has alt text" : "No alt text yet"}</span>
              </button>
            ))}
          </div>
        </div>
      </dialog>
    </div>
  );
}
