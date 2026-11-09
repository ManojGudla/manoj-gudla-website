import Link from "next/link";
import { redirect } from "next/navigation";
import { SetupScreen } from "@/components/admin/SetupScreen";
import { getAdmin } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  if (!isSupabaseConfigured) return <SetupScreen />;
  if (await getAdmin()) redirect("/admin");
  const sp = await searchParams;
  return (
    <main className="auth">
      <div className="auth__card">
        <div>
          <h1>Sign in</h1>
          <p className="muted" style={{ marginTop: "0.35rem" }}>
            Manage the content of your website.
          </p>
        </div>
        {"signed-out" in sp && (
          <p className="notice" role="status">
            You have signed out.
          </p>
        )}
        <LoginForm />
        <Link href="/" className="text-link" style={{ fontSize: "var(--fs-small)" }}>
          Back to the website
        </Link>
      </div>
    </main>
  );
}
