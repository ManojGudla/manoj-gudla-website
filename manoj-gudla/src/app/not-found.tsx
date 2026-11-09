import Link from "next/link";
import "@/styles/site.css";

export default function NotFound() {
  return (
    <main id="main" className="container page-intro" style={{ minHeight: "70vh" }}>
      <h1>This page doesn&apos;t exist.</h1>
      <p className="lead">The link may be old, or the page may have moved.</p>
      <div className="section-foot">
        <Link href="/" className="btn">
          Go to the homepage
        </Link>
        <Link href="/contact" className="btn btn--ghost">
          Contact me
        </Link>
      </div>
    </main>
  );
}
