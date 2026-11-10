import Link from "next/link";
export function PreviewBar() {
  return (
    <div className="preview-bar" role="status">
      <span>Preview mode: you are seeing drafts as well as published content.</span>
      <a href="/api/preview?disable=1">Exit preview</a>
      <Link href="/admin">Back to dashboard</Link>
    </div>
  );
}
