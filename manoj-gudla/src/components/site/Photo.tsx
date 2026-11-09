import Image from "next/image";
import type { ResolvedMedia } from "@/lib/types";

/**
 * Renders an uploaded image, or an elegant labelled placeholder when the
 * image hasn't been added yet. Placeholders never imitate a real photo.
 */
export function Photo({
  media,
  label,
  mark,
  sizes = "(min-width: 1000px) 33vw, 100vw",
  priority = false,
  className = "",
  zoom = false,
}: {
  media: ResolvedMedia | null;
  label: string;
  mark?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  zoom?: boolean;
}) {
  if (!media) {
    return (
      <div className={`placeholder ${className}`} role="img" aria-label={`${label} (not added yet)`}>
        {mark && <span className="placeholder__mark" aria-hidden>{mark}</span>}
        {/* The label is for assistive tech only; missing photos are listed in the dashboard. */}
      </div>
    );
  }
  return (
    <div className={`frame ${zoom ? "frame--zoom" : ""} ${className}`}>
      <Image
        src={media.url}
        alt={media.alt || ""}
        fill
        sizes={sizes}
        priority={priority}
        style={{ objectFit: "cover" }}
      />
    </div>
  );
}
