"use client";
import { useMemo, useState } from "react";
import type { Resource } from "@/lib/types";
import { PricingBadge } from "./ResourceLibrary";

/**
 * "Where should I start?" — pick a goal, get an ordered short list drawn from
 * the live resource library. Goals point at topics, not specific links, so
 * the path updates by itself when resources are added, removed or reordered
 * in the dashboard.
 */
const GOALS: { id: string; label: string; blurb: string; topics: string[] }[] = [
  {
    id: "job",
    label: "Land my first tech job",
    blurb: "Know the roadmap, practise the interview, show real work.",
    topics: ["Career & Interviews", "Coding Practice", "Projects & Code", "Developer Toolkit"],
  },
  {
    id: "ai",
    label: "Learn AI & machine learning",
    blurb: "Use the tools first, then learn the data skills underneath.",
    topics: ["AI Tools", "Data & Analytics", "Free Learning"],
  },
  {
    id: "code",
    label: "Start coding from zero",
    blurb: "Free foundations, then daily practice, then build for the web.",
    topics: ["Free Learning", "MCA & Study", "Coding Practice", "Web Development"],
  },
  {
    id: "data",
    label: "Get into data analytics",
    blurb: "SQL and Python first, then dashboards and real datasets.",
    topics: ["Data & Analytics", "Free Learning"],
  },
  {
    id: "cloud",
    label: "Learn cloud & DevOps",
    blurb: "One cloud platform properly, plus the tools engineers use daily.",
    topics: ["Cloud & DevOps", "Developer Toolkit"],
  },
  {
    id: "creator",
    label: "Grow as a creator",
    blurb: "Platform know-how, design and editing, with AI to move faster.",
    topics: ["Creator Resources", "AI Tools"],
  },
];

const MAX_STEPS = 6;

export function PathFinder({ resources }: { resources: Resource[] }) {
  const available = useMemo(() => GOALS.filter((g) => g.topics.some((t) => resources.some((r) => r.category === t))), [resources]);
  const [goal, setGoal] = useState<string | null>(null);
  const [freeFirst, setFreeFirst] = useState(true);

  const steps = useMemo(() => {
    const g = available.find((x) => x.id === goal);
    if (!g) return [];
    // Up to two per topic in the order set in the dashboard; then fill to MAX_STEPS.
    const perTopic = g.topics.map((t) => {
      const list = resources.filter((r) => r.category === t);
      return freeFirst ? [...list].sort((a, b) => Number(a.pricing !== "free") - Number(b.pricing !== "free")) : list;
    });
    const out: Resource[] = [];
    for (const list of perTopic) out.push(...list.slice(0, 2));
    for (const list of perTopic) for (const r of list.slice(2)) if (out.length < MAX_STEPS && !out.includes(r)) out.push(r);
    return out.slice(0, MAX_STEPS);
  }, [available, goal, resources, freeFirst]);

  if (available.length === 0) return null;
  const current = available.find((x) => x.id === goal);

  return (
    <section className="path" id="path" aria-labelledby="path-h">
      <div className="path__head">
        <h2 id="path-h">Not sure where to start?</h2>
        <p className="muted">Pick a goal and get a short, ordered list from the library.</p>
      </div>

      <div className="path__goals" role="radiogroup" aria-label="Your goal">
        {available.map((g) => (
          <button
            key={g.id}
            type="button"
            role="radio"
            aria-checked={goal === g.id}
            className="path__goal"
            onClick={() => setGoal(goal === g.id ? null : g.id)}
          >
            {g.label}
          </button>
        ))}
      </div>

      {current && (
        <div className="path__result" aria-live="polite">
          <div className="path__meta">
            <p>{current.blurb}</p>
            <label className="check">
              <input type="checkbox" checked={freeFirst} onChange={(e) => setFreeFirst(e.target.checked)} />
              Free resources first
            </label>
          </div>
          <ol className="path__steps" role="list">
            {steps.map((r, i) => (
              <li key={r.id} style={{ ["--i" as string]: i }}>
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="path__step">
                  <span className="path__n" aria-hidden>
                    {i + 1}
                  </span>
                  <span className="path__body">
                    <strong>{r.name}</strong>
                    <span>{r.description}</span>
                  </span>
                  <PricingBadge pricing={r.pricing} />
                  <span className="sr-only"> (opens {r.name} in a new tab)</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
