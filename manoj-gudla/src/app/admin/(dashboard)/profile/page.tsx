import { ItemForm } from "@/components/admin/ItemForm";
import { saveProfile } from "@/lib/admin/actions/singletons";
import { selectedMediaFor } from "@/lib/admin/media-map";
import { profileFields, socialFields } from "@/lib/admin/singletons";
import { requireAdmin } from "@/lib/auth";
import { createSessionClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  await requireAdmin();
  const db = await createSessionClient();
  const { data } = await db.from("profile").select("*").eq("id", 1).single();
  const row = (data ?? {}) as Record<string, unknown>;
  const fields = [...profileFields, ...socialFields];
  const media = await selectedMediaFor(db, fields, row);
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Profile</h1>
          <p>Your name, introductions, photographs, résumé and social links. Changes appear on the website as soon as you save.</p>
        </div>
      </div>
      <ItemForm action={saveProfile} fields={fields} values={row} media={media} />
    </>
  );
}
