import { NextResponse, type NextRequest } from "next/server";
import { enquiryCategoryLabel } from "@/lib/format";
import { clientIp, hashIp, rateLimit, sameOrigin } from "@/lib/rate-limit";
import { createServiceClient } from "@/lib/supabase/server";
import { contactSchema, type FieldErrors } from "@/lib/validation/contact";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIN_FILL_MS = 2500;
const MAX_AGE_MS = 1000 * 60 * 60 * 12;

function fail(status: number, error: string, fields?: FieldErrors) {
  return NextResponse.json({ ok: false, error, fields }, { status });
}

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // not configured — other protections still apply
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
      signal: AbortSignal.timeout(5000),
    });
    const json = (await res.json()) as { success?: boolean };
    return json.success === true;
  } catch {
    return false;
  }
}

async function notifyByEmail(e: { full_name: string; email: string; organisation: string; category: string; subject: string; message: string }) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.ENQUIRY_NOTIFY_TO;
  if (!key || !to) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.ENQUIRY_NOTIFY_FROM || "Website <onboarding@resend.dev>",
        to: [to],
        reply_to: e.email,
        subject: `New enquiry: ${e.subject}`,
        text: [
          `${enquiryCategoryLabel[e.category as keyof typeof enquiryCategoryLabel] ?? e.category}`,
          `From: ${e.full_name} <${e.email}>${e.organisation ? `, ${e.organisation}` : ""}`,
          "",
          e.message,
          "",
          "Reply directly to this email, or manage it in the admin dashboard.",
        ].join("\n"),
      }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // The enquiry is already saved; an email failure must not fail the request.
  }
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req.headers)) return fail(403, "This form can only be sent from the website.");

  const len = Number(req.headers.get("content-length") ?? 0);
  if (len > 20_000) return fail(413, "That message is too long.");

  const ip = clientIp(req.headers);
  if (!rateLimit(`contact:${ip}`, 5, 10 * 60 * 1000)) {
    return fail(429, "You've sent several messages in a short time. Please wait a few minutes, or email me directly.");
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail(400, "The form data could not be read. Please try again.");
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const fields: FieldErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof FieldErrors;
      if (key && !fields[key]) fields[key] = issue.message;
    }
    return fail(422, "Please check the highlighted fields.", fields);
  }
  const data = parsed.data;

  // Spam checks — honeypot and fill time.
  const age = Date.now() - data.started_at;
  if (data.website || age < MIN_FILL_MS || age > MAX_AGE_MS) {
    return fail(400, "Your message could not be sent. Please reload the page and try again.");
  }
  if (!(await verifyTurnstile(data.turnstile_token, ip))) {
    return fail(400, "Please complete the spam check and try again.");
  }

  const db = createServiceClient();
  if (!db) {
    return fail(503, "The contact form isn't connected yet. Please email me directly instead.");
  }

  const { error } = await db.rpc("submit_enquiry", {
    p_full_name: data.full_name,
    p_email: data.email,
    p_organisation: data.organisation,
    p_category: data.category,
    p_subject: data.subject,
    p_message: data.message,
    p_ip_hash: await hashIp(ip),
    p_user_agent: (req.headers.get("user-agent") ?? "").slice(0, 400),
  });

  if (error) {
    if (error.code === "P0429") {
      return fail(429, "You've sent several messages recently. Please wait a while, or email me directly.");
    }
    console.error("submit_enquiry failed", error.code, error.message);
    return fail(500, "Your message was not sent because of a server problem. Please try again, or email me directly.");
  }

  await notifyByEmail(data);
  return NextResponse.json({ ok: true });
}
