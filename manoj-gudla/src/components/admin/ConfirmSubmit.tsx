"use client";
import { useRef } from "react";
import { useFormStatus } from "react-dom";

function Inner({ label, className }: { label: string; className: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? "Working…" : label}
    </button>
  );
}

/**
 * A destructive action behind a confirmation dialog. The form posts to a
 * server action that re-checks admin rights before doing anything.
 */
export function ConfirmSubmit({
  action,
  fields,
  label,
  title,
  body,
  confirmLabel,
  buttonClass = "btn btn--sm btn--danger",
}: {
  action: (fd: FormData) => Promise<void>;
  fields: Record<string, string>;
  label: string;
  title: string;
  body: string;
  confirmLabel: string;
  buttonClass?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button type="button" className={buttonClass} onClick={() => dialog.current?.showModal()}>
        {label}
      </button>
      <dialog ref={dialog} className="modal modal--sm" aria-labelledby="confirm-title">
        <form action={action}>
          {Object.entries(fields).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
          <div className="modal__head">
            <h2 id="confirm-title">{title}</h2>
          </div>
          <div className="modal__body">
            <p>{body}</p>
          </div>
          <div className="modal__foot">
            <button type="button" className="btn btn--sm btn--ghost" onClick={() => dialog.current?.close()} autoFocus>
              Cancel
            </button>
            <Inner label={confirmLabel} className="btn btn--sm btn--danger" />
          </div>
        </form>
      </dialog>
    </>
  );
}
