import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/env";
import { createSessionClient } from "@/lib/supabase/server";

export interface AdminSession {
  userId: string;
  email: string;
  role: "owner" | "editor";
}

/**
 * Returns the signed-in admin, or null. Checks BOTH that the session is valid
 * (verified with Supabase Auth, not just read from the cookie) AND that the
 * user is listed in public.admin_users.
 */
export const getAdmin = cache(async (): Promise<AdminSession | null> => {
  if (!isSupabaseConfigured) return null;
  const supabase = await createSessionClient();
  const { data: userData, error } = await supabase.auth.getUser();
  if (error || !userData.user) return null;
  const { data: row } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", userData.user.id)
    .maybeSingle();
  if (!row) return null;
  return { userId: userData.user.id, email: userData.user.email ?? "", role: row.role };
});

/** Use at the top of every admin page and server action. */
export async function requireAdmin(): Promise<AdminSession> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

/** For server actions: throws instead of redirecting so callers get a clean error. */
export async function assertAdmin(): Promise<AdminSession> {
  const admin = await getAdmin();
  if (!admin) throw new Error("Not authorised");
  return admin;
}
