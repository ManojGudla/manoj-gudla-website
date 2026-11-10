"use client";
import { useEffect } from "react";

/**
 * The hero's signature moment (pointer devices only, off for reduced motion):
 *  - "Living type": each letter of the name gains weight as the pointer
 *    approaches, so the name responds to you like a material.
 *  - The background grid lights up under the pointer.
 *  - The portrait card tilts toward the pointer with a soft glare.
 * Everything is driven by CSS variables in one animation frame per move.
 */
export function HeroFx() {
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>("[data-hero]");
    if (!hero) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    const letters = Array.from(hero.querySelectorAll<HTMLElement>(".hero__name .ch"));
    const tilt = hero.querySelector<HTMLElement>(".hero2__tilt");
    let centres: { el: HTMLElement; x: number; y: number }[] = [];
    const measure = () => {
      centres = letters.map((el) => {
        const r = el.getBoundingClientRect();
        return { el, x: r.left + r.width / 2, y: r.top + r.height / 2 };
      });
    };

    let raf = 0;
    let px = -9999;
    let py = -9999;
    const RADIUS = 260;

    const paint = () => {
      raf = 0;
      const hr = hero.getBoundingClientRect();
      hero.style.setProperty("--gx", `${px - hr.left}px`);
      hero.style.setProperty("--gy", `${py - hr.top}px`);

      for (const c of centres) {
        const d = Math.hypot(px - c.x, py - c.y);
        const t = Math.max(0, 1 - d / RADIUS); // 1 = under the pointer, 0 = far
        const eased = t * t * (3 - 2 * t);
        c.el.style.fontWeight = String(Math.round(650 + 250 * eased));
        c.el.style.setProperty("--lift", `${(-0.04 * eased).toFixed(3)}em`);
      }

      if (tilt) {
        const r = tilt.getBoundingClientRect();
        const x = Math.max(-1, Math.min(1, (px - (r.left + r.width / 2)) / (r.width * 1.2)));
        const y = Math.max(-1, Math.min(1, (py - (r.top + r.height / 2)) / (r.height * 1.2)));
        tilt.style.setProperty("--ry", `${(x * 7).toFixed(2)}deg`);
        tilt.style.setProperty("--rx", `${(-y * 7).toFixed(2)}deg`);
        tilt.style.setProperty("--glx", `${((x + 1) * 50).toFixed(1)}%`);
        tilt.style.setProperty("--gly", `${((y + 1) * 50).toFixed(1)}%`);
      }
    };

    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      hero.classList.add("is-live");
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const onLeave = () => {
      hero.classList.remove("is-live");
      px = -9999;
      py = -9999;
      if (!raf) raf = requestAnimationFrame(paint);
      if (tilt) {
        tilt.style.setProperty("--ry", "0deg");
        tilt.style.setProperty("--rx", "0deg");
      }
    };

    // Measure after the entrance animation has placed the letters.
    const t0 = window.setTimeout(measure, 1400);
    const onResize = () => measure();
    const onScroll = () => measure();
    hero.addEventListener("pointermove", onMove);
    hero.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.clearTimeout(t0);
      cancelAnimationFrame(raf);
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      letters.forEach((el) => {
        el.style.fontWeight = "";
        el.style.removeProperty("--lift");
      });
    };
  }, []);

  return null;
}
