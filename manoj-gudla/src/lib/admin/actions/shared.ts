import "server-only";
import { revalidatePath } from "next/cache";

export type { ActionState } from "../state";

/** Every saved change goes live on the public website immediately. */
export function refreshSite() {
  revalidatePath("/", "layout");
}

export function dbErrorMessage(err: { code?: string; message?: string } | null): string {
  if (!err) return "Something went wrong.";
  if (err.code === "23505") return "That value is already used by another item.";
  if (err.code === "23514") return "One of the values isn't allowed. Check the highlighted rules and try again.";
  if (err.code === "42501" || /permission|policy/i.test(err.message ?? "")) return "You don't have permission to make this change.";
  return "The change could not be saved. Please try again.";
}
