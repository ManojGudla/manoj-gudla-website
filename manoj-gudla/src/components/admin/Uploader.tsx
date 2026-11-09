"use client";
import { useRef, useState } from "react";
import { finalizeUpload, type MediaItem } from "@/lib/admin/actions/media";
import { getBrowserClient } from "@/lib/supabase/browser";
import type { MediaCategory } from "@/lib/types";

const CATEGORY_OPTIONS: { value: MediaCategory; label: string }[] = [
  { value: "profile", label: "Profile photograph" },
  { value: "lifestyle", label: "Lifestyle photograph" },
  { value: "project", label: "Project screenshot" },
  { value: "certificate", label: "Certificate" },
  { value: "thumbnail", label: "Thumbnail" },
  { value: "banner", label: "Banner / sharing image" },
  { value: "gallery", label: "Gallery image" },
  { value: "document", label: "Document (PDF)" },
];

export { CATEGORY_OPTIONS };

const ACCEPT_IMG = "image/jpeg,image/png,image/webp,image/avif";
const ACCEPT_PDF = "application/pdf";

/**
 * Uploads a file in two steps: (1) the browser sends the original to the
 * private "incoming" bucket using the admin's own session; (2) the server
 * validates, optimises and publishes it. Nothing is public until step 2.
 */
export function Uploader({
  defaultCategory = "gallery",
  accept = "any",
  replaceId,
  onDone,
  compact = false,
}: {
  defaultCategory?: MediaCategory;
  accept?: "image" | "pdf" | "any";
  replaceId?: string;
  onDone: (item: MediaItem) => void;
  compact?: boolean;
}) {
  const [category, setCategory] = useState<MediaCategory>(accept === "pdf" ? "document" : defaultCategory);
  const [alt, setAlt] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const acceptAttr = accept === "image" ? ACCEPT_IMG : accept === "pdf" ? ACCEPT_PDF : `${ACCEPT_IMG},${ACCEPT_PDF}`;

  async function handle(file: File) {
    setError(null);
    if (file.size > 20 * 1024 * 1024) return setError("That file is larger than 20 MB.");
    const ext = (file.name.split(".").pop() ?? "").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "bin";
    const path = `${crypto.randomUUID()}.${ext}`;
    try {
      setBusy("Uploading…");
      const sb = getBrowserClient();
      const { error: upErr } = await sb.storage.from("incoming").upload(path, file, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
      if (upErr) {
        setBusy(null);
        return setError(/mime|type/i.test(upErr.message) ? "That file type isn't allowed." : "Upload failed. Check your connection and try again.");
      }
      setBusy("Optimising…");
      const res = await finalizeUpload({ incomingPath: path, fileName: file.name, category, alt, replaceId });
      setBusy(null);
      if (!res.ok) return setError(res.message);
      setAlt("");
      if (input.current) input.current.value = "";
      onDone(res.item);
    } catch {
      setBusy(null);
      setError("Upload failed. Try again.");
    }
  }

  return (
    <div
      className="dropzone"
      data-drag={drag}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        const f = e.dataTransfer.files?.[0];
        if (f && !busy) void handle(f);
      }}
    >
      <div className="form-grid">
        {!replaceId && accept !== "pdf" && (
          <div className="field">
            <label htmlFor="up-cat">Category</label>
            <select id="up-cat" className="select" value={category} onChange={(e) => setCategory(e.target.value as MediaCategory)}>
              {CATEGORY_OPTIONS.filter((o) => (accept === "image" ? o.value !== "document" : true)).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        )}
        {accept !== "pdf" && (
          <div className="field">
            <label htmlFor="up-alt">Description for screen readers (alt text)</label>
            <input
              id="up-alt"
              className="input"
              value={alt}
              maxLength={300}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="e.g. Manoj speaking at a tech meetup"
            />
          </div>
        )}
      </div>
      <div className="actions">
        <label className="btn btn--sm" aria-disabled={!!busy}>
          {replaceId ? "Choose replacement file" : "Choose file"}
          <input
            ref={input}
            type="file"
            accept={acceptAttr}
            className="sr-only"
            disabled={!!busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handle(f);
            }}
          />
        </label>
        {!compact && <span className="muted" style={{ fontSize: "var(--fs-meta)" }}>or drag a file here. JPEG, PNG, WebP, AVIF{accept !== "image" ? " or PDF" : ""}, up to 20 MB. Photos are resized and location data is removed.</span>}
      </div>
      {busy && (
        <div role="status" aria-live="polite">
          <div className="progress">
            <span style={{ width: busy === "Uploading…" ? "45%" : "85%" }} />
          </div>
          <p className="muted" style={{ fontSize: "var(--fs-meta)", marginTop: "0.35rem" }}>
            {busy}
          </p>
        </div>
      )}
      {error && (
        <p className="field error" role="alert" style={{ color: "var(--danger)", fontSize: "var(--fs-small)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
