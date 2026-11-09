"use server";

import { assertAdmin } from "@/lib/auth";
import { createSessionClient } from "@/lib/supabase/server";
import { parseFields } from "../parse";
import { EMAIL_RE, profileFields, settingsFields, socialFields } from "../singletons";
import { dbErrorMessage, refreshSite, type ActionState } from "./shared";

export async function saveProfile(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await assertAdmin();
  const { data, errors } = parseFields([...profileFields, ...socialFields], fd);
  if (data.email && !EMAIL_RE.test(String(data.email))) errors.email = "Enter a valid email address.";
  if (Object.keys(errors).length) return { ok: false, message: "Please fix the highlighted fields.", errors, at: Date.now() };
  const db = await createSessionClient();
  const { error } = await db.from("profile").update(data).eq("id", 1);
  if (error) return { ok: false, message: dbErrorMessage(error), at: Date.now() };
  refreshSite();
  return { ok: true, message: "Profile saved. The website is updated.", at: Date.now() };
}

export async function saveSettings(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await assertAdmin();
  const s = parseFields(settingsFields, fd);
  const social = parseFields(socialFields, fd);
  const errors = { ...s.errors, ...social.errors };
  if (s.data.contact_email && !EMAIL_RE.test(String(s.data.contact_email))) errors.contact_email = "Enter a valid email address.";
  if (Object.keys(errors).length) return { ok: false, message: "Please fix the highlighted fields.", errors, at: Date.now() };
  const db = await createSessionClient();
  const [a, b] = await Promise.all([
    db.from("site_settings").update(s.data).eq("id", 1),
    db.from("profile").update(social.data).eq("id", 1),
  ]);
  const error = a.error ?? b.error;
  if (error) return { ok: false, message: dbErrorMessage(error), at: Date.now() };
  refreshSite();
  return { ok: true, message: "Settings saved. The website is updated.", at: Date.now() };
}
