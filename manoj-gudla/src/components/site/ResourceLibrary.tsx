"use client";
import { useMemo, useState } from "react";
import type { Pricing, Resource } from "@/lib/types";

const PRICING: Record<Pricing, string> = { free: "Free", freemium: "Free + paid plans", paid: "Paid" };

export function PricingBadge({ pricing }: { pricing: Pricing }) {
  return <span className={`price price--${pricing}`}>{PRICING[pricing]}</span>;
}

/** Searchable, filterable list. Works from the URL (?q=…&c=…) so links can be shared. */
export function ResourceLibrary({ resources, initialQuery, initialCategory }: { resources: Resource[]; initialQuery: string; initialCategory: string }) {
  const categories = useMemo(() => Array.from(new Set(resources.map((r) => r.category))), [resources]);
  const [q, setQ] = useState(initialQuery);
  const [cat, setCat] = useState(categories.includes(initialCategory) ? initialCategory : "");
  const [freeOnly, setFreeOnly] = useState(false);

  const shown = useMemo(() => {
    const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return resources.filter((r) => {
      if (cat && r.category !== cat) return false;
      if (freeOnly && r.pricing !== "free") return false;
      const hay = `${r.name} ${r.description} ${r.category} ${r.tag}`.toLowerCase();
      return words.every((w) => hay.includes(w));
    });
  }, [resources, q, cat, freeOnly]);

  function sync(nextQ: string, nextCat: string) {
    const params = new URLSearchParams();
    if (nextQ.trim()) params.set("q", nextQ.trim());
    if (nextCat) params.set("c", nextCat);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `/resources?${qs}` : "/resources");
  }

  return (
    <div className="lib">
      <div className="lib__controls">
        <div className="lib__search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <label htmlFor="lib-q" className="sr-only">
            Search resources
          </label>
          <input
            id="lib-q"
            type="search"
            value={q}
            placeholder="Search tools, courses and links"
            onChange={(e) => {
              setQ(e.target.value);
              sync(e.target.value, cat);
            }}
          />
        </div>
        <label className="check">
          <input type="checkbox" checked={freeOnly} onChange={(e) => setFreeOnly(e.target.checked)} />
          Free only
        </label>
      </div>

      <div className="lib__cats" role="group" aria-label="Filter by topic">
        {["", ...categories].map((c) => (
          <button
            key={c || "all"}
            type="button"
            aria-pressed={cat === c}
            onClick={() => {
              setCat(c);
              sync(q, c);
            }}
          >
            {c || "All topics"}
            <span>{c ? resources.filter((r) => r.category === c).length : resources.length}</span>
          </button>
        ))}
      </div>

      <p className="lib__count" role="status" aria-live="polite">
        {shown.length === resources.length ? `${shown.length} resources` : `${shown.length} of ${resources.length} resources`}
      </p>

      {shown.length === 0 ? (
        <div className="empty">
          Nothing matches that yet.{" "}
          <button
            type="button"
            className="text-link"
            style={{ background: "none", border: 0, padding: 0, cursor: "pointer", font: "inherit" }}
            onClick={() => {
              setQ("");
              setCat("");
              setFreeOnly(false);
              sync("", "");
            }}
          >
            Clear the filters
          </button>
        </div>
      ) : (
        <ul className="res-grid" role="list">
          {shown.map((r) => (
            <li key={r.id}>
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="res-card">
                <span className="res-card__top">
                  <span className="res-card__cat">{r.category}</span>
                  {r.tag && <span className="chip chip--accent">{r.tag}</span>}
                </span>
                <span className="res-card__name">{r.name}</span>
                <span className="res-card__desc">{r.description}</span>
                <span className="res-card__foot">
                  <PricingBadge pricing={r.pricing} />
                  <span className="res-card__host">{new URL(r.url).hostname.replace(/^www\./, "")}</span>
                </span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
