import { ImageResponse } from "next/og";
import { getSiteContent } from "@/lib/data/content";
import { OG_PORTRAIT } from "@/lib/og-portrait";

export const ogSize = { width: 1200, height: 630 };

/**
 * The picture shown when the site link is shared (WhatsApp, LinkedIn, X…):
 * dark grid, name, roles and the portrait. Replaced automatically when a
 * sharing image is chosen in Dashboard → Settings.
 */
export async function renderShareImage() {
  const { profile } = await getSiteContent().catch(() => ({ profile: null }));
  const name = profile?.full_name ?? "Manoj Kumar Gudla";
  const tagline = profile?.tagline ?? "Think Beyond Limits. Build What Matters.";
  const roles = (profile?.roles ?? ["Technology Professional", "AI & Innovation Enthusiast", "Digital Creator"]).slice(0, 3);
  const [first, ...rest] = name.split(" ");
  const lineOne = [first, ...rest.slice(0, -1)].join(" ");
  const last = rest[rest.length - 1] ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0c10",
          backgroundImage:
            "radial-gradient(circle at 50% 0%, rgba(139,149,255,0.28), transparent 55%), linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 60px 60px, 60px 60px",
          color: "#f4f2ee",
        }}
      >
        {/* Everything important sits inside the middle 600px, so square crops (WhatsApp, iMessage) keep it. */}
        <div style={{ display: "flex", alignItems: "center", width: 600 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={OG_PORTRAIT}
            width={232}
            height={290}
            alt=""
            style={{ borderRadius: 20, objectFit: "cover", border: "1px solid rgba(255,255,255,0.18)" }}
          />
          <div style={{ display: "flex", flexDirection: "column", marginLeft: 36, width: 332 }}>
            <div style={{ width: 30, height: 3, borderRadius: 3, background: "#8b95ff", marginBottom: 20 }} />
            <div style={{ fontSize: 54, fontWeight: 700, lineHeight: 1.02, letterSpacing: -2 }}>{lineOne}</div>
            <div style={{ fontSize: 54, fontWeight: 700, lineHeight: 1.08, letterSpacing: -2, color: "#9a9db0" }}>{last}</div>
            <div style={{ marginTop: 18, fontSize: 22, lineHeight: 1.35, color: "#d9dae3" }}>{tagline}</div>
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10, width: 600, marginTop: 40 }}>
          {roles.map((r) => (
            <div
              key={r}
              style={{
                display: "flex",
                padding: "6px 16px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.18)",
                fontSize: 18,
                color: "#d9dae3",
              }}
            >
              {r}
            </div>
          ))}
        </div>
      </div>
    ),
    ogSize,
  );
}
