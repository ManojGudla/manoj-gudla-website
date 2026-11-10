import Link from "next/link";
import { MobileNav, Sidebar, type NavGroup } from "@/components/admin/AdminNav";
import { SetupScreen } from "@/components/admin/SetupScreen";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { COLLECTIONS } from "@/lib/admin/collections";
import { signOut } from "@/lib/admin/actions/auth";
import { requireAdmin } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { createSessionClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured) return <SetupScreen />;
  const admin = await requireAdmin();

  const db = await createSessionClient();
  const { count: newCount } = await db.from("enquiries").select("id", { count: "exact", head: true }).eq("status", "new");

  const byGroup = (g: string) => COLLECTIONS.filter((c) => c.group === g).map((c) => ({ href: `/admin/${c.key}`, label: c.plural }));
  const groups: NavGroup[] = [
    { label: "", items: [{ href: "/admin", label: "Overview" }, { href: "/admin/enquiries", label: "Enquiries", count: newCount ?? 0 }] },
    { label: "Content", items: [{ href: "/admin/profile", label: "Profile" }, ...byGroup("Work")] },
    { label: "Creator", items: byGroup("Creator") },
    { label: "Resources", items: byGroup("Resources") },
    { label: "Journey", items: byGroup("Journey") },
    { label: "Other pages", items: byGroup("Pages") },
    { label: "Site", items: [{ href: "/admin/media", label: "Media library" }, { href: "/admin/settings", label: "Settings" }] },
  ];

  const footer = (
    <>
      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>Signed in as {admin.email}</span>
      <div className="actions">
        <Link href="/" target="_blank" className="btn btn--sm btn--ghost">
          View site
        </Link>
        <form action={signOut}>
          <button className="btn btn--sm btn--ghost">Sign out</button>
        </form>
        <ThemeToggle />
      </div>
    </>
  );

  return (
    <div className="shell">
      <Sidebar groups={groups} footer={footer} />
      <div>
        <MobileNav groups={groups} footer={footer} />
        <main className="main" id="main">
          {children}
        </main>
      </div>
    </div>
  );
}
