"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { createSessionClient } from "@/lib/supabase/server";
import type { ActionState } from "../state";

export async function signIn(_prev: ActionState, fd: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured) return { ok: false, message: "The database isn't connected yet. See the setup guide.", at: Date.now() };

  const ip = clientIp(await headers());
  if (!rateLimit(`login:${ip}`, 8, 15 * 60 * 1000)) {
    return { ok: false, message: "Too many sign-in attempts. Wait 15 minutes and try again.", at: Date.now() };
  }

  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  if (!email || !password) return { ok: false, message: "Enter your email and password.", at: Date.now() };

  const db = await createSessionClient();
  const { data, error } = await db.auth.signInWithPassword({ email, password });
  // Same message for unknown email and wrong password — doesn't reveal which accounts exist.
  if (error || !data.user) return { ok: false, message: "Email or password is incorrect.", at: Date.now() };

  const { data: admin } = await db.from("admin_users").select("role").eq("user_id", data.user.id).maybeSingle();
  if (!admin) {
    await db.auth.signOut();
    return { ok: false, message: "This account doesn't have access to the dashboard.", at: Date.now() };
  }
  redirect("/admin");
}

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured) {
    const db = await createSessionClient();
    await db.auth.signOut();
  }
  redirect("/admin/login?signed-out=1");
}
