import Link from "next/link";
import "@/styles/site.css";

export default function NotFound() {
  return (
    <main id="main" className="stage pagehero notfound">
      <span className="pagehero__mark" aria-hidden>
        404
      </span>
      <div className="container page-intro">
        <p className="kicker">
          <span className="kicker__bar" aria-hidden />
          <span>Page not found</span>
        </p>
        <h1>This page doesn&apos;t exist.</h1>
        <p className="lead">The link may be old, or the page may have moved. These might help:</p>
        <ul className="notfound__links" role="list">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/resources">Free resources</Link>
          </li>
          <li>
            <Link href="/journey">Journey</Link>
          </li>
          <li>
            <Link href="/contact">Contact</Link>
          </li>
        </ul>
      </div>
    </main>
  );
}
