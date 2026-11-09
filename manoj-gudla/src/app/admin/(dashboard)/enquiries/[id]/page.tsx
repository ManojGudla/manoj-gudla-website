import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { deleteEnquiry, updateEnquiry } from "@/lib/admin/actions/enquiries";
import { requireAdmin } from "@/lib/auth";
import { enquiryCategoryLabel, formatDate } from "@/lib/format";
import { createSessionClient } from "@/lib/supabase/server";
import type { Enquiry } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EnquiryPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const db = await createSessionClient();
  const { data } = await db.from("enquiries").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  let e = data as Enquiry;

  // Opening a new enquiry marks it as read.
  if (e.status === "new") {
    await db.from("enquiries").update({ status: "read" }).eq("id", id);
    e = { ...e, status: "read" };
  }

  const reply = `mailto:${encodeURIComponent(e.email)}?subject=${encodeURIComponent(`Re: ${e.subject}`)}`;
  const statusBtn = (status: Enquiry["status"], label: string) => (
    <form action={updateEnquiry}>
      <input type="hidden" name="id" value={e.id} />
      <input type="hidden" name="status" value={status} />
      <button className={`btn btn--sm ${e.status === status ? "" : "btn--ghost"}`} aria-pressed={e.status === status}>
        {label}
      </button>
    </form>
  );

  return (
    <>
      <div className="page-head">
        <div>
          <p className="crumbs">
            <Link href="/admin/enquiries">Enquiries</Link>
          </p>
          <h1>{e.subject}</h1>
        </div>
        <div className="actions">
          <a className="btn btn--sm" href={reply}>
            Reply by email
          </a>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: "start" }}>
        <section className="panel" aria-labelledby="msg-h">
          <div className="panel__head">
            <h2 id="msg-h">Message</h2>
          </div>
          <div className="panel__body">
            {/* Rendered as plain text — React escapes it, so no HTML from visitors can run. */}
            <p className="message-body">{e.message}</p>
          </div>
        </section>

        <div>
          <section className="panel" aria-labelledby="from-h">
            <div className="panel__head">
              <h2 id="from-h">Sender</h2>
            </div>
            <div className="panel__body">
              <dl className="dl">
                <dt>Name</dt>
                <dd>{e.full_name}</dd>
                <dt>Email</dt>
                <dd>
                  <a className="text-link" href={reply}>
                    {e.email}
                  </a>
                </dd>
                {e.organisation && (
                  <>
                    <dt>Organisation</dt>
                    <dd>{e.organisation}</dd>
                  </>
                )}
                <dt>Received</dt>
                <dd>{formatDate(e.created_at, { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })} UTC</dd>
              </dl>
            </div>
          </section>

          <section className="panel" aria-labelledby="manage-h">
            <div className="panel__head">
              <h2 id="manage-h">Manage</h2>
            </div>
            <div className="panel__body" style={{ display: "grid", gap: "1.25rem" }}>
              <div className="field">
                <span className="label">Status</span>
                <div className="actions">
                  {statusBtn("new", "New")}
                  {statusBtn("read", "Read")}
                  {statusBtn("responded", "Responded")}
                  {statusBtn("archived", "Archived")}
                </div>
              </div>
              <form action={updateEnquiry} className="field">
                <input type="hidden" name="id" value={e.id} />
                <label htmlFor="category">Type</label>
                <div className="actions">
                  <select id="category" name="category" className="select" defaultValue={e.category} style={{ width: "auto" }}>
                    {Object.entries(enquiryCategoryLabel).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                  <button className="btn btn--sm btn--ghost">Change type</button>
                </div>
              </form>
              <form action={updateEnquiry} className="field">
                <input type="hidden" name="id" value={e.id} />
                <label htmlFor="notes">Private notes</label>
                <textarea id="notes" name="admin_notes" className="textarea" rows={3} maxLength={2000} defaultValue={e.admin_notes} />
                <div>
                  <button className="btn btn--sm btn--ghost">Save notes</button>
                </div>
              </form>
              <ConfirmSubmit
                action={deleteEnquiry}
                fields={{ id: e.id }}
                label="Delete enquiry"
                title="Delete this enquiry?"
                body={`The message from ${e.full_name} will be permanently deleted. This cannot be undone.`}
                confirmLabel="Delete permanently"
              />
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
