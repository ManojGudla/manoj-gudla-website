"use client";
import { MoonIcon, SunIcon } from "@/components/ui/icons";

type DocWithVT = Document & { startViewTransition?: (cb: () => void) => unknown };

export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    const apply = () => {
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("theme", next);
      } catch {
        /* storage blocked — theme still applies for this visit */
      }
    };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const doc = document as DocWithVT;
    if (!reduce && doc.startViewTransition) {
      doc.startViewTransition(apply);
    } else if (!reduce) {
      root.classList.add("theme-transition");
      apply();
      window.setTimeout(() => root.classList.remove("theme-transition"), 500);
    } else {
      apply();
    }
  }

  return (
    <button type="button" className="icon-btn theme-toggle" onClick={toggle} aria-label="Switch between light and dark theme">
      <SunIcon />
      <MoonIcon />
    </button>
  );
}
