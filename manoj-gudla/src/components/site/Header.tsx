"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";
import { openCommandMenu } from "./CommandMenu";
import { CONTACT, MORE, type NavItem } from "./nav";
import { ThemeToggle } from "./ThemeToggle";

export function Header({ name, nav }: { name: string; nav: NavItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  const [first, ...rest] = name.split(" ");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the menu on navigation.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const btn = menuBtn.current;
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      btn?.focus();
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="site-header" data-scrolled={scrolled}>
      <div className="container site-header__inner">
        <Link href="/" className="wordmark" aria-label={`${name} — home`}>
          {first} {rest.join(" ")}
          <span aria-hidden>.</span>
        </Link>

        <nav className="nav" aria-label="Main">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? "page" : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <button type="button" className="search-btn" onClick={openCommandMenu}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <span className="txt">Search</span>
            <span className="kbd" aria-hidden>
              Ctrl K
            </span>
          </button>
          <Link href={CONTACT.href} className="btn btn--sm header-cta">
            Let&apos;s connect
          </Link>
          <ThemeToggle />
          <button
            ref={menuBtn}
            type="button"
            className="icon-btn menu-btn"
            aria-expanded={open}
            aria-controls="menu-sheet"
            onClick={() => setOpen(true)}
          >
            <MenuIcon />
            <span className="sr-only">Open menu</span>
          </button>
        </div>
      </div>

      {open && (
        <div id="menu-sheet" className="menu-sheet" role="dialog" aria-modal="true" aria-label="Site menu">
          <div className="container">
            <div className="menu-sheet__top">
              <Link href="/" className="wordmark">
                {name}
                <span aria-hidden>.</span>
              </Link>
              <button ref={closeBtn} type="button" className="icon-btn" onClick={() => setOpen(false)}>
                <CloseIcon />
                <span className="sr-only">Close menu</span>
              </button>
            </div>
            <nav className="menu-list" aria-label="Main">
              {[{ href: "/", label: "Home", hint: "Start here" }, ...nav, CONTACT].map((item) => (
                <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined}>
                  <strong>{item.label}</strong>
                  <span>{item.hint}</span>
                </Link>
              ))}
            </nav>
            <ul className="socials" role="list" style={{ paddingBottom: "2rem" }}>
              {MORE.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
