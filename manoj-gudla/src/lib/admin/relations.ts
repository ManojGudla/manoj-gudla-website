import "server-only";
import type { Field } from "./collections";

type Db = Awaited<ReturnType<typeof import("@/lib/supabase/server").createSessionClient>>;

/**
 * Turns "relation" fields into selects whose options are the current rows of
 * the related table (as seen by the signed-in admin, drafts included).
 */
export async function resolveRelations(db: Db, fields: Field[]): Promise<Field[]> {
  return Promise.all(
    fields.map(async (f) => {
      if (f.type !== "relation") return f;
      const { data } = await db.from(f.table).select(`id, ${f.labelField}, status`).order("sort_order").order("created_at");
      const rows = (data ?? []) as unknown as Record<string, string>[];
      return {
        name: f.name,
        label: f.label,
        hint: f.hint,
        wide: f.wide,
        type: "select" as const,
        nullable: true,
        options: rows.map((r) => ({
          value: r.id,
          label: `${r[f.labelField]}${r.status === "draft" ? " (draft)" : ""}`,
        })),
        emptyLabel: f.emptyLabel,
      } as Field;
    }),
  );
}
