import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { listMedia } from "@/lib/admin/actions/media";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  await requireAdmin();
  const items = await listMedia();
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Media library</h1>
          <p>
            Every photo, screenshot, certificate and document on the site. Images are resized, converted to WebP and stripped of
            location data on upload.
          </p>
        </div>
      </div>
      <MediaLibrary initial={items} />
    </>
  );
}
