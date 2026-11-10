"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * One observer for the whole page: reveals [data-reveal] elements as they
 * scroll in, applies gentle parallax to [data-parallax], and pointer tilt to
 * [data-tilt]. Everything is skipped when the visitor prefers reduced motion.
 */
export function Motion() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const reveal = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)"));
    if (reduce || !("IntersectionObserver" in window)) {
      reveal.forEach((el) => el.classList.add("is-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    reveal.forEach((el) => io.observe(el));

    // Parallax — transform only, throttled to animation frames.
    const para = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const vh = window.innerHeight;
        for (const el of para) {
          const r = el.getBoundingClientRect();
          if (r.bottom < 0 || r.top > vh) continue;
          const speed = Number(el.dataset.parallax) || 0.08;
          const offset = (r.top + r.height / 2 - vh / 2) * -speed;
          el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
        }
      });
    };
    if (para.length) {
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    // Tilt — pointer devices only.
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const tilts = fine ? Array.from(document.querySelectorAll<HTMLElement>("[data-tilt]")) : [];
    const handlers = tilts.map((el) => {
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty("--ry", `${(x * 4).toFixed(2)}deg`);
        el.style.setProperty("--rx", `${(-y * 4).toFixed(2)}deg`);
      };
      const leave = () => {
        el.style.setProperty("--ry", "0deg");
        el.style.setProperty("--rx", "0deg");
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      return () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
      };
    });

    // Spotlight that follows the pointer on bento tiles.
    const tiles = fine ? Array.from(document.querySelectorAll<HTMLElement>(".tile")) : [];
    const spot = tiles.map((el) => {
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      };
      el.addEventListener("pointermove", move);
      return () => el.removeEventListener("pointermove", move);
    });

    return () => {
      spot.forEach((off) => off());
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      handlers.forEach((off) => off());
    };
  }, [pathname]);

  return null;
}
