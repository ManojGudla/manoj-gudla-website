import { ogSize, renderShareImage } from "@/lib/og";

export const alt = "Manoj Kumar Gudla, personal website";
export const size = ogSize;
export const contentType = "image/png";
export const revalidate = 3600;

export default function Image() {
  return renderShareImage();
}
