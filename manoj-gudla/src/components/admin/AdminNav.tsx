"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MenuIcon, CloseIcon } from "@/components/ui/icons";

export interface NavGroup {
  label: string;
  items: { href: string; label: string; count?: number }[];
}

function Links({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname();
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`));
  return (
    <>
      {groups.map((g) => (
        <div className="side-group" key={g.label}>
          {g.label && <p>{g.label}</p>}
          {g.items.map((i) => (
            <Link key={i.href} href={i.href} className="side-link" aria-current={active(i.href) ? "page" : undefined}>
              {i.label}
              {!!i.count && <span className="side-count" aria-label={`${i.count} new`}>{i.count}</span>}
            </Link>
          ))}
        </div>
      ))}
    </>
  );
}

export function Sidebar({ groups, footer }: { groups: NavGroup[]; footer: React.ReactNode }) {
  return (
    <aside className="sidebar" aria-label="Dashboard">
      <Link href="/admin" className="sidebar__brand">
        <strong>Dashboard</strong>
      </Link>
      <nav aria-label="Dashboard sections">
        <Links groups={groups} />
      </nav>
      <div className="sidebar__foot">{footer}</div>
    </aside>
  );
}

export function MobileNav({ groups, footer }: { groups: NavGroup[]; footer: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);
  return (
    <>
      <div className="topbar">
        <Link href="/admin" className="sidebar__brand" style={{ padding: 0 }}>
          <strong>Dashboard</strong>
        </Link>
        <button type="button" className="icon-btn" aria-expanded={open} aria-controls="admin-mobile-nav" onClick={() => setOpen((o) => !o)}>
          {open ? <CloseIcon /> : <MenuIcon />}
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        </button>
      </div>
      {open && (
        <nav id="admin-mobile-nav" className="mobile-nav" aria-label="Dashboard sections">
          <Links groups={groups} />
          <div className="sidebar__foot" style={{ marginTop: "1.5rem" }}>
            {footer}
          </div>
        </nav>
      )}
    </>
  );
}
