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
          background: "#0b0c10",
          backgroundImage:
            "radial-gradient(circle at 85% 10%, rgba(139,149,255,0.30), transparent 45%), linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 60px 60px, 60px 60px",
          color: "#f4f2ee",
          padding: "64px 72px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, paddingRight: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24, color: "#a3a8bb" }}>
            <div style={{ width: 28, height: 3, borderRadius: 3, background: "#8b95ff" }} />
            Personal website
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 92, fontWeight: 700, lineHeight: 1, letterSpacing: -3 }}>{lineOne}</div>
            <div style={{ fontSize: 92, fontWeight: 700, lineHeight: 1.05, letterSpacing: -3, color: "#9a9db0" }}>{last}</div>
            <div style={{ marginTop: 26, fontSize: 34, color: "#d9dae3" }}>{tagline}</div>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {roles.map((r) => (
              <div
                key={r}
                style={{
                  display: "flex",
                  padding: "8px 18px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.18)",
                  fontSize: 22,
                  color: "#d9dae3",
                }}
              >
                {r}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={OG_PORTRAIT}
            width={400}
            height={500}
            alt=""
            style={{ borderRadius: 24, objectFit: "cover", border: "1px solid rgba(255,255,255,0.15)" }}
          />
        </div>
      </div>
    ),
    ogSize,
  );
}
