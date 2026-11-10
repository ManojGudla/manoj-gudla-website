"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface CommandItem {
  id: string;
  label: string;
  hint?: string;
  group: string;
  href: string;
  external?: boolean;
  keywords?: string;
}

export const OPEN_COMMAND_EVENT = "open-command-menu";

export function openCommandMenu() {
  window.dispatchEvent(new Event(OPEN_COMMAND_EVENT));
}

/**
 * Ctrl/⌘ + K menu: jump to any page, resource pack or resource.
 * Keyboard: ↑ ↓ to move, Enter to open, Esc to close.
 */
export function CommandMenu({ items }: { items: CommandItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.filter((i) => i.group !== "Resources").slice(0, 40);
    const words = q.split(/\s+/);
    return items
      .map((i) => {
        const hay = `${i.label} ${i.hint ?? ""} ${i.keywords ?? ""} ${i.group}`.toLowerCase();
        if (!words.every((w) => hay.includes(w))) return null;
        const score = i.label.toLowerCase().startsWith(q) ? 0 : i.label.toLowerCase().includes(q) ? 1 : 2;
        return { i, score };
      })
      .filter((x): x is { i: CommandItem; score: number } => x !== null)
      .sort((a, b) => a.score - b.score)
      .slice(0, 40)
      .map((x) => x.i);
  }, [items, query]);

  const show = useCallback(() => {
    setQuery("");
    setActive(0);
    setOpen(true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) setOpen(false);
        else show();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_COMMAND_EVENT, show);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_COMMAND_EVENT, show);
    };
  }, [open, show]);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      requestAnimationFrame(() => input.current?.focus());
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function go(item: CommandItem) {
    setOpen(false);
    if (item.external) window.open(item.href, "_blank", "noopener,noreferrer");
    else router.push(item.href);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      go(results[active]);
    }
  }

  let lastGroup = "";
  return (
    <dialog
      ref={dialog}
      className="cmdk"
      aria-label="Search the site"
      onClose={() => setOpen(false)}
      onClick={(e) => {
        if (e.target === dialog.current) setOpen(false);
      }}
    >
      <div className="cmdk__box">
        <div className="cmdk__input">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            ref={input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search pages, resources, videos…"
            aria-label="Search"
            role="combobox"
            aria-expanded="true"
            aria-controls="cmdk-list"
            aria-activedescendant={results[active] ? `cmdk-${results[active].id}` : undefined}
            autoComplete="off"
            spellCheck={false}
          />
          <kbd>Esc</kbd>
        </div>
        <ul ref={list} id="cmdk-list" role="listbox" className="cmdk__list">
          {results.length === 0 && <li className="cmdk__empty">No matches. Try another word.</li>}
          {results.map((item, i) => {
            const head = item.group !== lastGroup ? item.group : null;
            lastGroup = item.group;
            return (
              <li key={item.id} role="presentation">
                {head && <div className="cmdk__group">{head}</div>}
                <div
                  id={`cmdk-${item.id}`}
                  role="option"
                  aria-selected={i === active}
                  data-index={i}
                  className="cmdk__item"
                  onMouseMove={() => setActive(i)}
                  onClick={() => go(item)}
                >
                  <span className="cmdk__label">{item.label}</span>
                  {item.hint && <span className="cmdk__hint">{item.hint}</span>}
                  {item.external && <span className="cmdk__ext">Opens site</span>}
                </div>
              </li>
            );
          })}
        </ul>
        <div className="cmdk__foot">
          <span>
            <kbd>↑</kbd> <kbd>↓</kbd> to move
          </span>
          <span>
            <kbd>Enter</kbd> to open
          </span>
        </div>
      </div>
    </dialog>
  );
}

/** Any button that opens the menu (header search, homepage tile). */
export function CommandTrigger({ className, children, label }: { className?: string; children: React.ReactNode; label?: string }) {
  return (
    <button type="button" className={className} onClick={openCommandMenu} aria-label={label}>
      {children}
    </button>
  );
}
