"use client";
import { useState } from "react";

/** Copies a short piece of text (e.g. the email address) and confirms it. */
export function CopyText({ text, label = "Copy" }: { text: string; label?: string }) {
  const [state, setState] = useState<"" | "ok" | "fail">("");
  return (
    <button
      type="button"
      className="btn btn--ghost btn--sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setState("ok");
        } catch {
          setState("fail");
        }
        window.setTimeout(() => setState(""), 2200);
      }}
    >
      <span aria-live="polite">{state === "ok" ? "Copied" : state === "fail" ? "Select and copy it" : label}</span>
    </button>
  );
}
