"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/auth";
import { createSessionClient } from "@/lib/supabase/server";
import { dbErrorMessage } from "./shared";

const UUID = /^[0-9a-f-]{36}$/i;
const STATUSES = ["new", "read", "responded", "archived"];
const CATEGORIES = ["career", "partnership", "brand", "project", "general"];

export async function updateEnquiry(fd: FormData): Promise<void> {
  await assertAdmin();
  const id = String(fd.get("id") ?? "");
  if (!UUID.test(id)) throw new Error("Invalid request");
  const patch: Record<string, string> = {};
  const status = fd.get("status");
  const category = fd.get("category");
  const notes = fd.get("admin_notes");
  if (status !== null) {
    if (!STATUSES.includes(String(status))) throw new Error("Invalid status");
    patch.status = String(status);
  }
  if (category !== null) {
    if (!CATEGORIES.includes(String(category))) throw new Error("Invalid category");
    patch.category = String(category);
  }
  if (notes !== null) patch.admin_notes = String(notes).trim().slice(0, 2000);
  const db = await createSessionClient();
  const { error } = await db.from("enquiries").update(patch).eq("id", id);
  if (error) throw new Error(dbErrorMessage(error));
  revalidatePath("/admin", "layout");
}

export async function deleteEnquiry(fd: FormData): Promise<void> {
  await assertAdmin();
  const id = String(fd.get("id") ?? "");
  if (!UUID.test(id)) throw new Error("Invalid request");
  const db = await createSessionClient();
  const { error } = await db.from("enquiries").delete().eq("id", id);
  if (error) throw new Error(dbErrorMessage(error));
  revalidatePath("/admin", "layout");
  redirect("/admin/enquiries?deleted=1");
}
