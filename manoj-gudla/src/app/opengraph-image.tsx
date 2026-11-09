import { ImageResponse } from "next/og";
import { getSiteContent } from "@/lib/data/content";

export const alt = "Manoj Kumar Gudla";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 3600;

/**
 * Default social-sharing image (LinkedIn, WhatsApp, Facebook, X…).
 * Replaced automatically when a sharing image is chosen in Admin → Settings.
 */
export default async function OpenGraphImage() {
  const { profile } = await getSiteContent().catch(() => ({ profile: null }));
  const name = profile?.full_name ?? "Manoj Kumar Gudla";
  const tagline = profile?.tagline ?? "Think Beyond Limits. Build What Matters.";
  const roles = (profile?.roles ?? []).join("   ·   ");
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#141416",
          color: "#f4f2ee",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 26, color: "#aeb4ff", fontFamily: "sans-serif" }}>
          <div style={{ width: 14, height: 14, borderRadius: 14, background: "#5b66ff" }} />
          {roles}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 112, lineHeight: 1, letterSpacing: -4 }}>{name}</div>
          <div style={{ marginTop: 28, fontSize: 44, color: "#cbc8c1" }}>{tagline}</div>
        </div>
      </div>
    ),
    size,
  );
}
