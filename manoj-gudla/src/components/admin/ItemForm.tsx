"use client";
import { useActionState, useEffect, useRef } from "react";
import type { Field } from "@/lib/admin/collections";
import { initialState, type ActionState } from "@/lib/admin/state";
import { FieldInput } from "./FieldInput";
import type { SelectedMedia } from "./MediaPicker";

/**
 * Generic edit form. Buttons send `_intent` so one form can save, publish or
 * move an item to draft. Validation happens on the server; field errors come
 * back and are shown next to each field.
 */
export function ItemForm({
  action,
  fields,
  values,
  media,
  hidden,
  status,
  isNew,
}: {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  fields: Field[];
  values: Record<string, unknown>;
  media: Record<string, SelectedMedia | null>;
  hidden?: Record<string, string>;
  /** Omit for content without publication status (profile, settings). */
  status?: "draft" | "published";
  isNew?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const statusRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (state.at && !state.ok) {
      const first = document.querySelector<HTMLElement>("[aria-invalid='true']");
      (first ?? statusRef.current)?.focus();
    }
  }, [state]);

  return (
    <form action={formAction} noValidate>
      {Object.entries(hidden ?? {}).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <div className="panel">
        <div className="panel__body form-grid">
          {fields.map((f) => (
            <FieldInput key={f.name} field={f} value={values[f.name]} error={state.errors?.[f.name]} media={media[f.name]} />
          ))}
        </div>
      </div>

      <div className="form-bar">
        <p ref={statusRef} tabIndex={-1} className="form-status" data-ok={state.at ? state.ok : undefined} role="status" aria-live="polite">
          {pending ? "Saving…" : state.message ?? (status ? (status === "published" ? "Published — visible on the website." : "Draft — not visible on the website.") : "")}
        </p>
        <div className="actions">
          {status === undefined ? (
            <button className="btn btn--sm" name="_intent" value="save" disabled={pending}>
              Save changes
            </button>
          ) : isNew ? (
            <>
              <button className="btn btn--sm btn--ghost" name="_intent" value="draft" disabled={pending}>
                Save as draft
              </button>
              <button className="btn btn--sm" name="_intent" value="publish" disabled={pending}>
                Publish
              </button>
            </>
          ) : status === "published" ? (
            <>
              <button className="btn btn--sm btn--ghost" name="_intent" value="draft" disabled={pending}>
                Unpublish
              </button>
              <button className="btn btn--sm" name="_intent" value="save" disabled={pending}>
                Update
              </button>
            </>
          ) : (
            <>
              <button className="btn btn--sm btn--ghost" name="_intent" value="save" disabled={pending}>
                Save draft
              </button>
              <button className="btn btn--sm" name="_intent" value="publish" disabled={pending}>
                Publish
              </button>
            </>
          )}
        </div>
      </div>
    </form>
  );
}
