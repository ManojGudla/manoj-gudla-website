"use server";

import { redirect } from "next/navigation";
import { assertAdmin } from "@/lib/auth";
import { createSessionClient } from "@/lib/supabase/server";
import { getCollection } from "../collections";
import { parseFields } from "../parse";
import { resolveRelations } from "../relations";
import { dbErrorMessage, refreshSite, type ActionState } from "./shared";

const UUID = /^[0-9a-f-]{36}$/i;

function duplicateErrors(error: { code?: string } | null, data: Record<string, unknown>): Record<string, string> | undefined {
  if (error?.code !== "23505") return undefined;
  if ("slug" in data) return { slug: "Another project already uses this web address." };
  if ("code" in data) return { code: "Another resource pack already uses this code." };
  return undefined;
}

/**
 * Create or update an item in any collection.
 * The submit button's value decides the publication status:
 *   "save" keeps it, "publish" publishes, "draft" moves it to draft.
 */
export async function saveItem(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await assertAdmin();
  const col = getCollection(String(fd.get("_collection")));
  if (!col) return { ok: false, message: "Unknown content type.", at: Date.now() };

  const id = String(fd.get("_id") ?? "");
  if (id && !UUID.test(id)) return { ok: false, message: "Invalid item.", at: Date.now() };
  const intent = String(fd.get("_intent") ?? "save");

  const db = await createSessionClient();
  const fields = await resolveRelations(db, col.fields);
  const { data, errors } = parseFields(fields, fd);
  if (col.table === "creator_stats" && data.verification === "verified" && !data.verified_on) {
    errors.verified_on = "Add the date you verified this figure.";
  }
  if (col.table === "resource_packs" && typeof data.code === "string" && data.code.length > 40) {
    errors.code = "Keep the code to 40 characters or fewer — it's meant to be easy to type.";
  }
  if (Object.keys(errors).length) {
    return { ok: false, message: "Please fix the highlighted fields.", errors, at: Date.now() };
  }

  if (intent === "publish") data.status = "published";
  if (intent === "draft") data.status = "draft";

  if (id) {
    const { error } = await db.from(col.table).update(data).eq("id", id);
    if (error) {
      return { ok: false, message: dbErrorMessage(error), errors: duplicateErrors(error, data), at: Date.now() };
    }
    refreshSite();
    const verb = intent === "publish" ? "Published" : intent === "draft" ? "Moved to draft" : "Saved";
    return { ok: true, message: `${verb}. The website is updated.`, at: Date.now() };
  }

  // New item: goes to the end of the list, draft unless published now.
  const { data: last } = await db.from(col.table).select("sort_order").order("sort_order", { ascending: false }).limit(1);
  data.sort_order = ((last?.[0]?.sort_order as number | undefined) ?? 0) + 10;
  if (!data.status) data.status = "draft";
  const { data: created, error } = await db.from(col.table).insert(data).select("id").single();
  if (error || !created) {
    return { ok: false, message: dbErrorMessage(error), errors: duplicateErrors(error, data), at: Date.now() };
  }
  refreshSite();
  redirect(`/admin/${col.key}/${created.id}?created=1`);
}

export async function deleteItem(fd: FormData): Promise<void> {
  await assertAdmin();
  const col = getCollection(String(fd.get("_collection")));
  const id = String(fd.get("_id") ?? "");
  if (!col || !UUID.test(id)) throw new Error("Invalid request");
  const db = await createSessionClient();
  const { error } = await db.from(col.table).delete().eq("id", id);
  if (error) throw new Error(dbErrorMessage(error));
  refreshSite();
  redirect(`/admin/${col.key}?deleted=1`);
}

export async function setItemStatus(fd: FormData): Promise<void> {
  await assertAdmin();
  const col = getCollection(String(fd.get("_collection")));
  const id = String(fd.get("_id") ?? "");
  const status = String(fd.get("status"));
  if (!col || !UUID.test(id) || !["draft", "published"].includes(status)) throw new Error("Invalid request");
  const db = await createSessionClient();
  const { error } = await db.from(col.table).update({ status }).eq("id", id);
  if (error) throw new Error(dbErrorMessage(error));
  refreshSite();
}

export async function moveItem(fd: FormData): Promise<void> {
  await assertAdmin();
  const col = getCollection(String(fd.get("_collection")));
  const id = String(fd.get("_id") ?? "");
  const dir = String(fd.get("dir"));
  if (!col || !UUID.test(id) || !["up", "down"].includes(dir)) throw new Error("Invalid request");
  const db = await createSessionClient();
  const { data: rows, error } = await db.from(col.table).select("id, sort_order").order("sort_order").order("created_at");
  if (error || !rows) throw new Error(dbErrorMessage(error));
  const i = rows.findIndex((r) => r.id === id);
  const j = dir === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= rows.length) return;
  const { error: swapErr } = await db.rpc("swap_sort_order", { p_table: col.table, p_a: rows[i].id, p_b: rows[j].id });
  if (swapErr) throw new Error(dbErrorMessage(swapErr));
  refreshSite();
}

/* ---------- Project screenshots ---------- */

export async function addProjectImage(fd: FormData): Promise<void> {
  await assertAdmin();
  const projectId = String(fd.get("project_id") ?? "");
  const mediaId = String(fd.get("media_id") ?? "");
  if (!UUID.test(projectId) || !UUID.test(mediaId)) throw new Error("Invalid request");
  const db = await createSessionClient();
  const { data: last } = await db
    .from("project_images")
    .select("sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: false })
    .limit(1);
  const { error } = await db.from("project_images").insert({
    project_id: projectId,
    media_id: mediaId,
    sort_order: ((last?.[0]?.sort_order as number | undefined) ?? 0) + 10,
  });
  if (error && error.code !== "23505") throw new Error(dbErrorMessage(error));
  refreshSite();
}

export async function updateProjectImage(fd: FormData): Promise<void> {
  await assertAdmin();
  const id = String(fd.get("id") ?? "");
  const caption = String(fd.get("caption") ?? "").trim().slice(0, 300);
  if (!UUID.test(id)) throw new Error("Invalid request");
  const db = await createSessionClient();
  const { error } = await db.from("project_images").update({ caption }).eq("id", id);
  if (error) throw new Error(dbErrorMessage(error));
  refreshSite();
}

export async function removeProjectImage(fd: FormData): Promise<void> {
  await assertAdmin();
  const id = String(fd.get("id") ?? "");
  if (!UUID.test(id)) throw new Error("Invalid request");
  const db = await createSessionClient();
  const { error } = await db.from("project_images").delete().eq("id", id);
  if (error) throw new Error(dbErrorMessage(error));
  refreshSite();
}

export async function moveProjectImage(fd: FormData): Promise<void> {
  await assertAdmin();
  const id = String(fd.get("id") ?? "");
  const projectId = String(fd.get("project_id") ?? "");
  const dir = String(fd.get("dir"));
  if (!UUID.test(id) || !UUID.test(projectId)) throw new Error("Invalid request");
  const db = await createSessionClient();
  const { data: rows } = await db.from("project_images").select("id").eq("project_id", projectId).order("sort_order").order("created_at");
  if (!rows) return;
  const i = rows.findIndex((r) => r.id === id);
  const j = dir === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= rows.length) return;
  const { error } = await db.rpc("swap_sort_order", { p_table: "project_images", p_a: rows[i].id, p_b: rows[j].id });
  if (error) throw new Error(dbErrorMessage(error));
  refreshSite();
}

/* ---------- Resource pack items ---------- */

export async function addPackItem(fd: FormData): Promise<void> {
  await assertAdmin();
  const packId = String(fd.get("pack_id") ?? "");
  if (!UUID.test(packId)) throw new Error("Invalid request");
  const db = await createSessionClient();

  let resourceId = String(fd.get("resource_id") ?? "");
  const newName = String(fd.get("new_name") ?? "").trim().slice(0, 120);
  const newUrl = String(fd.get("new_url") ?? "").trim();
  const note = String(fd.get("note") ?? "").trim().slice(0, 300);

  if (newName || newUrl) {
    // Quick-add: create the resource in the library first.
    if (!newName || !/^https:\/\/[^\s]+$/i.test(newUrl) || newUrl.length > 500) {
      redirect(`/admin/resource-packs/${packId}?item_error=new#items-h`);
    }
    const category = String(fd.get("new_category") ?? "").trim().slice(0, 60) || "AI Tools";
    const pricing = ["free", "freemium", "paid"].includes(String(fd.get("new_pricing"))) ? String(fd.get("new_pricing")) : "free";
    const { data: last } = await db.from("resources").select("sort_order").order("sort_order", { ascending: false }).limit(1);
    const { data: created, error } = await db
      .from("resources")
      .insert({
        name: newName,
        url: newUrl,
        category,
        pricing,
        status: "published",
        sort_order: ((last?.[0]?.sort_order as number | undefined) ?? 0) + 10,
      })
      .select("id")
      .single();
    if (error || !created) redirect(`/admin/resource-packs/${packId}?item_error=save#items-h`);
    resourceId = created.id;
  }

  if (!UUID.test(resourceId)) redirect(`/admin/resource-packs/${packId}?item_error=choose#items-h`);
  const { data: lastItem } = await db
    .from("resource_pack_items")
    .select("sort_order")
    .eq("pack_id", packId)
    .order("sort_order", { ascending: false })
    .limit(1);
  const { error } = await db.from("resource_pack_items").insert({
    pack_id: packId,
    resource_id: resourceId,
    note,
    sort_order: ((lastItem?.[0]?.sort_order as number | undefined) ?? 0) + 10,
  });
  if (error && error.code !== "23505") redirect(`/admin/resource-packs/${packId}?item_error=save#items-h`);
  refreshSite();
  redirect(`/admin/resource-packs/${packId}?item_added=1#items-h`);
}

export async function updatePackItem(fd: FormData): Promise<void> {
  await assertAdmin();
  const id = String(fd.get("id") ?? "");
  if (!UUID.test(id)) throw new Error("Invalid request");
  const db = await createSessionClient();
  const { error } = await db
    .from("resource_pack_items")
    .update({ note: String(fd.get("note") ?? "").trim().slice(0, 300) })
    .eq("id", id);
  if (error) throw new Error(dbErrorMessage(error));
  refreshSite();
}

export async function removePackItem(fd: FormData): Promise<void> {
  await assertAdmin();
  const id = String(fd.get("id") ?? "");
  if (!UUID.test(id)) throw new Error("Invalid request");
  const db = await createSessionClient();
  const { error } = await db.from("resource_pack_items").delete().eq("id", id);
  if (error) throw new Error(dbErrorMessage(error));
  refreshSite();
}

export async function movePackItem(fd: FormData): Promise<void> {
  await assertAdmin();
  const id = String(fd.get("id") ?? "");
  const packId = String(fd.get("pack_id") ?? "");
  const dir = String(fd.get("dir"));
  if (!UUID.test(id) || !UUID.test(packId)) throw new Error("Invalid request");
  const db = await createSessionClient();
  const { data: rows } = await db.from("resource_pack_items").select("id").eq("pack_id", packId).order("sort_order").order("created_at");
  if (!rows) return;
  const i = rows.findIndex((r) => r.id === id);
  const j = dir === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= rows.length) return;
  const { error } = await db.rpc("swap_sort_order", { p_table: "resource_pack_items", p_a: rows[i].id, p_b: rows[j].id });
  if (error) throw new Error(dbErrorMessage(error));
  refreshSite();
}
