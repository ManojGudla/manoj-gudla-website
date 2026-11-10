"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Lights the background grid of every dark band ([data-stage]) under the
 * pointer. Pointer devices only; off for reduced motion.
 */
export function StageGlow() {
  const pathname = usePathname();
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    const stages = Array.from(document.querySelectorAll<HTMLElement>("[data-stage]"));
    const offs = stages.map((el) => {
      let raf = 0;
      let x = 0;
      let y = 0;
      const move = (e: PointerEvent) => {
        x = e.clientX;
        y = e.clientY;
        el.classList.add("is-live");
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          const r = el.getBoundingClientRect();
          el.style.setProperty("--gx", `${x - r.left}px`);
          el.style.setProperty("--gy", `${y - r.top}px`);
        });
      };
      const leave = () => el.classList.remove("is-live");
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      return () => {
        cancelAnimationFrame(raf);
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
      };
    });
    return () => offs.forEach((off) => off());
  }, [pathname]);
  return null;
}
