"use client";
import { useActionState } from "react";
import { signIn } from "@/lib/admin/actions/auth";
import { initialState } from "@/lib/admin/state";

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, initialState);
  return (
    <form action={action} className="form" style={{ gap: "1rem" }}>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" className="input" autoComplete="username" required autoFocus />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" className="input" autoComplete="current-password" required />
      </div>
      {state.message && (
        <p className="notice notice--error" role="alert">
          {state.message}
        </p>
      )}
      <button className="btn" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
