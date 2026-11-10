"use client";
import { useState } from "react";

/** Copies the page address — or opens the phone's share sheet when available. */
export function CopyLink({ path, title }: { path: string; title: string }) {
  const [done, setDone] = useState<"" | "copied" | "failed">("");
  async function share() {
    const url = `${window.location.origin}${path}`;
    const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
    try {
      if (nav.share && window.matchMedia("(pointer: coarse)").matches) {
        await nav.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setDone("copied");
    } catch {
      setDone("failed");
    }
    window.setTimeout(() => setDone(""), 2500);
  }
  return (
    <button type="button" className="btn btn--ghost btn--sm" onClick={share}>
      <span aria-live="polite">{done === "copied" ? "Link copied" : done === "failed" ? "Copy failed — use the address bar" : "Share this page"}</span>
    </button>
  );
}
