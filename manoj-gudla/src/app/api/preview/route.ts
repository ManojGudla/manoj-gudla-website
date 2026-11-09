import { draftMode } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getAdmin } from "@/lib/auth";

/**
 * /api/preview?path=/projects/x  → turns on preview (drafts visible) for admins
 * /api/preview?disable=1         → turns it off
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const dm = await draftMode();

  if (url.searchParams.has("disable")) {
    dm.disable();
    return NextResponse.redirect(new URL("/", url.origin));
  }

  // Ignore router prefetches — preview must only switch on from a real click.
  if (req.headers.get("next-router-prefetch") || req.headers.get("purpose") === "prefetch") {
    return new NextResponse(null, { status: 204 });
  }

  const admin = await getAdmin();
  if (!admin) return NextResponse.redirect(new URL("/admin/login", url.origin));

  const path = url.searchParams.get("path") ?? "/";
  // Only allow same-site relative paths (prevents open redirects).
  const safe = path.startsWith("/") && !path.startsWith("//") ? path : "/";
  dm.enable();
  return NextResponse.redirect(new URL(safe, url.origin));
}
