/**
 * A small line icon chosen from the words in a title, so interests and topics
 * added in the dashboard get a fitting icon without any code change.
 */
const PATHS: { test: RegExp; d: string }[] = [
  { test: /\bai\b|intelligen|machine|automat/i, d: "M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2M9.5 12a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0" },
  { test: /content|video|reel|creat|youtube/i, d: "M4 6h16v12H4zM10 9.5v5l4-2.5z" },
  { test: /entrepreneur|business|startup|venture/i, d: "M5 19c1-4 3-7 7-9M14 4c3 0 6 3 6 6-3 4-7 6-10 6l-2-2c0-3 2-7 6-10zM15 9h.01" },
  { test: /network|people|communit|connect/i, d: "M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM16 11a3 3 0 1 0 0-6M2 20c0-3 3-5 6-5s6 2 6 5M16 15c3 0 6 2 6 5" },
  { test: /learn|study|experiment|course/i, d: "M3 6l9-3 9 3-9 3zM7 8v5c0 1.5 2.5 3 5 3s5-1.5 5-3V8M21 6v6" },
  { test: /lifestyle|travel|routine|moment|photo/i, d: "M4 8h3l2-3h6l2 3h3v11H4zM12 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" },
  { test: /tech|tool|device|platform|code|software/i, d: "M8 8l-4 4 4 4M16 8l4 4-4 4M13 6l-2 12" },
  { test: /fitness|sport|health/i, d: "M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12" },
  { test: /music|sound/i, d: "M9 18V6l10-2v12M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM19 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" },
  { test: /read|book|writ/i, d: "M4 5h6a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4zM20 5h-6a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h6z" },
];
const FALLBACK = "M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z";

export function TopicIcon({ topic }: { topic: string }) {
  const d = PATHS.find((p) => p.test.test(topic))?.d ?? FALLBACK;
  return (
    <span className="topic-icon" aria-hidden>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" focusable="false">
        <path d={d} />
      </svg>
    </span>
  );
}
