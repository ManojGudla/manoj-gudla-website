/**
 * Generates supabase/seed.sql from src/content/seed.ts.
 * Usage: npm run db:seed-sql
 *
 * The output uses "on conflict do nothing", so running seed.sql again never
 * overwrites content you have edited in the admin dashboard.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import * as seed from "../src/content/seed";

type Row = Record<string, unknown>;

function lit(v: unknown): string {
  if (v === null || v === undefined) return "null";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return String(v);
  if (Array.isArray(v)) {
    if (v.length === 0) return "'{}'::text[]";
    return `array[${v.map((x) => lit(String(x))).join(", ")}]::text[]`;
  }
  return `'${String(v).replace(/'/g, "''")}'`;
}

function inserts(table: string, rows: Row[], omit: string[] = ["created_at", "updated_at"]): string {
  if (rows.length === 0) return `-- ${table}: no starting rows\n`;
  const cols = Object.keys(rows[0]).filter((c) => !omit.includes(c));
  const values = rows
    .map((r) => `  (${cols.map((c) => lit(r[c])).join(", ")})`)
    .join(",\n");
  return `insert into public.${table} (${cols.join(", ")}) values\n${values}\non conflict do nothing;\n`;
}

const out = [
  "-- =====================================================================",
  "-- Starting content. GENERATED from src/content/seed.ts — do not edit.",
  "-- Run after the migrations. Safe to re-run: existing rows are kept.",
  "-- =====================================================================",
  "",
  inserts("profile", [seed.seedProfile as unknown as Row]),
  inserts("site_settings", [seed.seedSettings as unknown as Row]),
  inserts("experience", seed.seedExperience as unknown as Row[]),
  inserts("education", seed.seedEducation as unknown as Row[]),
  inserts("skills", seed.seedSkills as unknown as Row[]),
  inserts("certifications", seed.seedCertifications as unknown as Row[]),
  inserts("projects", seed.seedProjects as unknown as Row[]),
  inserts("creator_content", seed.seedCreatorContent as unknown as Row[]),
  inserts("creator_stats", seed.seedCreatorStats as unknown as Row[]),
  inserts("achievements", seed.seedAchievements as unknown as Row[]),
  inserts("interests", seed.seedInterests as unknown as Row[]),
  inserts("vision_items", seed.seedVision as unknown as Row[]),
].join("\n");

const target = join(process.cwd(), "supabase", "seed.sql");
writeFileSync(target, out);
console.log(`Wrote ${target}`);
