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

/** Built-in photos for About and Creator, used until others are chosen in Dashboard → Profile. */
export const DEFAULT_ABOUT_PHOTO: ResolvedMedia = {
  id: "default-about",
  url: "/images/manoj-about.jpg",
  alt: "Manoj Kumar Gudla on his motorcycle outside T-Hub, Hyderabad, at night",
  width: 960,
  height: 1200,
  mime: "image/jpeg",
};

export const DEFAULT_CREATOR_PHOTO: ResolvedMedia = {
  id: "default-creator",
  url: "/images/manoj-creator.jpg",
  alt: "Manoj Kumar Gudla leaning on his motorcycle near T-Works, Hyderabad",
  width: 960,
  height: 1200,
  mime: "image/jpeg",
};

/** Shown on Beyond Work until photos are published in Dashboard → Gallery. */
export const DEFAULT_GALLERY: { id: string; caption: string; media: ResolvedMedia }[] = [
  {
    id: "moment-1",
    caption: "Evening ride, T-Works",
    media: { id: "moment-1", url: "/images/moments-1.jpg", alt: "Manoj leaning on his motorcycle at night near T-Works", width: 960, height: 1200, mime: "image/jpeg" },
  },
  {
    id: "moment-2",
    caption: "Outside T-Hub, Hyderabad",
    media: { id: "moment-2", url: "/images/moments-2.jpg", alt: "Manoj on his motorcycle in front of the T-Hub building", width: 960, height: 1200, mime: "image/jpeg" },
  },
  {
    id: "moment-3",
    caption: "Night ride",
    media: { id: "moment-3", url: "/images/moments-3.jpg", alt: "Manoj on his motorcycle at night, looking to the side", width: 960, height: 1200, mime: "image/jpeg" },
  },
];

export const DEFAULT_JOURNEY_PHOTO: ResolvedMedia = {
  id: "default-journey",
  url: "/images/manoj-work.jpg",
  alt: "Manoj Kumar Gudla at his desk with a laptop in the office",
  width: 960,
  height: 1200,
  mime: "image/jpeg",
};
