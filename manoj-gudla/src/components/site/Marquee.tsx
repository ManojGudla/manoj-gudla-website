/** A slow, endless ticker of words. Decorative: the same words appear elsewhere on the page. */
export function Marquee({ items }: { items: string[] }) {
  if (items.length < 3) return null;
  const row = (
    <ul role="list">
      {items.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ul>
  );
  return (
    <div className="marquee" aria-hidden>
      <div className="marquee__track" style={{ ["--dur" as string]: `${Math.max(30, items.length * 4)}s` }}>
        {row}
        {row}
      </div>
    </div>
  );
}
