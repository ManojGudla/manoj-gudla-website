import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { enquiryCategoryLabel, formatDate } from "@/lib/format";
import { createSessionClient } from "@/lib/supabase/server";
import type { Enquiry, EnquiryStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const TABS: { value: EnquiryStatus | "inbox" | "all"; label: string }[] = [
  { value: "inbox", label: "Inbox" },
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "responded", label: "Responded" },
  { value: "archived", label: "Archived" },
  { value: "all", label: "All" },
];

const STATUS_LABEL: Record<EnquiryStatus, string> = { new: "New", read: "Read", responded: "Responded", archived: "Archived" };

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  await requireAdmin();
  const sp = await searchParams;
  const tab = TABS.some((t) => t.value === sp.status) ? sp.status : "inbox";
  const db = await createSessionClient();
  let q = db
    .from("enquiries")
    .select("id, full_name, email, organisation, category, subject, status, created_at")
    .order("created_at", { ascending: false })
    .limit(300);
  if (tab === "inbox") q = q.neq("status", "archived");
  else if (tab !== "all") q = q.eq("status", tab);
  const { data, error } = await q;
  const rows = (data ?? []) as Pick<Enquiry, "id" | "full_name" | "email" | "organisation" | "category" | "subject" | "status" | "created_at">[];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Enquiries</h1>
          <p>Messages from the contact form. These are private and never shown on the website.</p>
        </div>
      </div>
      {"deleted" in sp && (
        <p className="notice notice--success" role="status" style={{ marginBottom: "1rem" }}>
          Enquiry deleted.
        </p>
      )}
      <nav className="tabs" aria-label="Filter enquiries">
        {TABS.map((t) => (
          <Link key={t.value} href={`/admin/enquiries?status=${t.value}`} aria-current={tab === t.value ? "page" : undefined}>
            {t.label}
          </Link>
        ))}
      </nav>
      {error && <p className="notice notice--error">Enquiries couldn&apos;t be loaded.</p>}
      <section className="panel">
        {rows.length === 0 ? (
          <p className="empty-state">No enquiries here. New messages from the contact form will appear in the inbox.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th scope="col">From</th>
                <th scope="col">Subject</th>
                <th scope="col">Type</th>
                <th scope="col">Received</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id} className={e.status === "new" ? "unread" : undefined}>
                  <td className="title-cell">
                    <Link href={`/admin/enquiries/${e.id}`}>{e.full_name}</Link>
                    <span className="sub">{[e.email, e.organisation].filter(Boolean).join(", ")}</span>
                  </td>
                  <td data-label="Subject">{e.subject}</td>
                  <td data-label="Type" className="muted">
                    {enquiryCategoryLabel[e.category]}
                  </td>
                  <td data-label="Received" className="muted" style={{ fontSize: "var(--fs-meta)", whiteSpace: "nowrap" }}>
                    {formatDate(e.created_at, { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td data-label="Status">
                    <span className={`pill ${e.status === "new" ? "pill--new" : ""}`}>{STATUS_LABEL[e.status]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
