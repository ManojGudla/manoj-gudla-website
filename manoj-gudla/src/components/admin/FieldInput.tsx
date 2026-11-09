"use client";
import { useState } from "react";
import type { Field } from "@/lib/admin/collections";
import { MediaPicker, type SelectedMedia } from "./MediaPicker";

function Counter({ value, max }: { value: string; max: number }) {
  return (
    <span className="char-count" data-over={value.length > max}>
      {value.length}/{max}
    </span>
  );
}

/** One form control, chosen by the field type from the collection config. */
export function FieldInput({
  field: f,
  value,
  error,
  media,
}: {
  field: Field;
  value: unknown;
  error?: string;
  media?: SelectedMedia | null;
}) {
  const id = `f-${f.name}`;
  const describedBy = [f.hint ? `${id}-hint` : "", error ? `${id}-err` : ""].filter(Boolean).join(" ") || undefined;
  const common = { id, name: f.name, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy };
  const [text, setText] = useState(
    f.type === "list" ? ((value as string[] | null) ?? []).join("\n") : value == null ? "" : String(value),
  );

  if (f.type === "media") {
    return (
      <div className={f.wide ? "wide" : undefined}>
        <MediaPicker name={f.name} label={f.label} initial={media ?? null} category={f.category} accept={f.accept === "pdf" ? "pdf" : "image"} error={error} hint={f.hint} />
      </div>
    );
  }

  if (f.type === "boolean") {
    return (
      <div className={`field ${f.wide ? "wide" : ""}`} style={{ alignContent: "end" }}>
        <label className="check" htmlFor={id}>
          <input type="checkbox" {...common} defaultChecked={value === true} />
          {f.label}
        </label>
        {f.hint && <span className="hint" id={`${id}-hint`}>{f.hint}</span>}
      </div>
    );
  }

  let control: React.ReactNode;
  switch (f.type) {
    case "textarea":
      control = <textarea className="textarea" rows={f.rows ?? 4} {...common} value={text} onChange={(e) => setText(e.target.value)} placeholder={f.placeholder} />;
      break;
    case "list":
      control = <textarea className="textarea" rows={Math.min(10, Math.max(3, text.split("\n").length + 1))} {...common} value={text} onChange={(e) => setText(e.target.value)} />;
      break;
    case "select":
      control = (
        <select className="select" {...common} defaultValue={value == null ? "" : String(value)}>
          {f.nullable && <option value="">Not set</option>}
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
      break;
    case "number":
      control = <input className="input" inputMode="numeric" {...common} defaultValue={value == null ? "" : String(value)} />;
      break;
    case "date":
      control = <input className="input" type="date" {...common} defaultValue={value == null ? "" : String(value).slice(0, 10)} />;
      break;
    case "url":
      control = <input className="input" type="url" inputMode="url" placeholder="https://" {...common} defaultValue={value == null ? "" : String(value)} />;
      break;
    case "slug":
      control = <input className="input" pattern="[a-z0-9]+(-[a-z0-9]+)*" spellCheck={false} {...common} defaultValue={value == null ? "" : String(value)} />;
      break;
    default:
      control = <input className="input" {...common} value={text} onChange={(e) => setText(e.target.value)} placeholder={"placeholder" in f ? f.placeholder : undefined} />;
  }

  return (
    <div className={`field ${f.wide ? "wide" : ""}`}>
      <label htmlFor={id}>
        {f.label}
        {f.required && <span aria-hidden style={{ color: "var(--danger)" }}> *</span>}
      </label>
      {control}
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
        <span>
          {f.hint && <span className="hint" id={`${id}-hint`}>{f.hint}</span>}
          {error && (
            <span className="error" id={`${id}-err`} style={{ display: "block" }}>
              {error}
            </span>
          )}
        </span>
        {(f.type === "text" || f.type === "textarea") && <Counter value={text} max={f.max} />}
      </div>
    </div>
  );
}
