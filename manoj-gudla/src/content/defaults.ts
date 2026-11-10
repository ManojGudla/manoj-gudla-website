import type { ResolvedMedia } from "@/lib/types";

/**
 * Built-in portrait, used until a portrait is chosen in Dashboard → Profile.
 * Uploading a photo there replaces it everywhere — no code change needed.
 */
export const DEFAULT_PORTRAIT: ResolvedMedia = {
  id: "default-portrait",
  url: "/images/manoj-portrait.jpg",
  alt: "Manoj Kumar Gudla smiling, leaning on a glass railing",
  width: 960,
  height: 1200,
  mime: "image/jpeg",
};
