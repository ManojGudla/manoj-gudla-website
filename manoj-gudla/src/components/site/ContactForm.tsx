"use client";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { enquiryCategoryLabel } from "@/lib/format";
import { ENQUIRY_CATEGORIES, type FieldErrors } from "@/lib/validation/categories";

type State =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "error"; message: string; fields?: FieldErrors };

declare global {
  interface Window {
    turnstile?: { reset: (el?: string | HTMLElement) => void };
  }
}

export function ContactForm({ initialTopic, turnstileSiteKey, email }: { initialTopic?: string; turnstileSiteKey: string; email: string }) {
  const [state, setState] = useState<State>({ kind: "idle" });
  const startedAt = useRef<number>(0);
  const statusRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const topic = ENQUIRY_CATEGORIES.includes(initialTopic as never) ? initialTopic : undefined;

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (state.kind === "sent" || state.kind === "error") statusRef.current?.focus();
  }, [state]);

  const fields = state.kind === "error" ? state.fields ?? {} : {};

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fd.get("full_name"),
          email: fd.get("email"),
          organisation: fd.get("organisation") ?? "",
          category: fd.get("category") ?? "",
          subject: fd.get("subject"),
          message: fd.get("message"),
          website: fd.get("website") ?? "",
          started_at: startedAt.current,
          turnstile_token: fd.get("cf-turnstile-response") ?? "",
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; fields?: FieldErrors };
      // Only report success when the server confirms the message was stored.
      if (res.ok && json.ok === true) {
        setState({ kind: "sent" });
        formRef.current?.reset();
      } else {
        setState({ kind: "error", message: json.error ?? "Your message was not sent. Please try again.", fields: json.fields });
        window.turnstile?.reset();
      }
    } catch {
      setState({ kind: "error", message: "Your message was not sent — the connection failed. Check your internet and try again." });
    }
  }

  if (state.kind === "sent") {
    return (
      <div ref={statusRef} tabIndex={-1} className="notice notice--success" role="status" style={{ padding: "1.5rem" }}>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", color: "var(--ink)", marginBottom: "0.5rem" }}>
          Thank you — your message has been received.
        </p>
        <p style={{ color: "var(--ink-2)" }}>I read every message and will reply to the email address you gave.</p>
        <button type="button" className="btn btn--ghost btn--sm" style={{ marginTop: "1rem" }} onClick={() => setState({ kind: "idle" })}>
          Send another message
        </button>
      </div>
    );
  }

  const err = (name: keyof FieldErrors) =>
    fields[name] ? (
      <span className="error" id={`${name}-err`}>
        {fields[name]}
      </span>
    ) : null;
  const aria = (name: keyof FieldErrors) =>
    fields[name] ? { "aria-invalid": true as const, "aria-describedby": `${name}-err` } : {};

  return (
    <form ref={formRef} className="form" onSubmit={onSubmit} noValidate>
      {turnstileSiteKey && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />}

      <fieldset className="category-pills" {...aria("category")}>
        <legend>What is this about?</legend>
        {ENQUIRY_CATEGORIES.map((c) => (
          <label key={c}>
            <input type="radio" name="category" value={c} defaultChecked={c === (topic ?? "general")} required />
            <span>{enquiryCategoryLabel[c]}</span>
          </label>
        ))}
        {err("category")}
      </fieldset>

      <div className="form-row">
        <div className="field">
          <label htmlFor="full_name">Full name</label>
          <input id="full_name" name="full_name" className="input" autoComplete="name" required maxLength={120} {...aria("full_name")} />
          {err("full_name")}
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" className="input" autoComplete="email" required maxLength={254} {...aria("email")} />
          {err("email")}
        </div>
      </div>

      <div className="field">
        <label htmlFor="organisation">
          Company or organisation <span className="muted">(optional)</span>
        </label>
        <input id="organisation" name="organisation" className="input" autoComplete="organization" maxLength={160} {...aria("organisation")} />
        {err("organisation")}
      </div>

      <div className="field">
        <label htmlFor="subject">Subject</label>
        <input id="subject" name="subject" className="input" required maxLength={200} {...aria("subject")} />
        {err("subject")}
      </div>

      <div className="field">
        <label htmlFor="message">Message</label>
        <textarea id="message" name="message" className="textarea" rows={7} required minLength={20} maxLength={5000} {...aria("message")} />
        {err("message")}
      </div>

      {/* Honeypot — hidden from people, tempting to bots */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {turnstileSiteKey && <div className="cf-turnstile" data-sitekey={turnstileSiteKey} data-theme="auto" />}

      {state.kind === "error" && (
        <div ref={statusRef} tabIndex={-1} className="notice notice--error" role="alert">
          {state.message}
          {email && (
            <>
              {" "}
              You can also email <a className="text-link" href={`mailto:${email}`}>{email}</a>.
            </>
          )}
        </div>
      )}

      <p className="privacy">
        Your details are used only to reply to you. They are stored securely, never shown publicly, never shared or sold, and you
        can ask for them to be deleted at any time by emailing me.
      </p>

      <div>
        <button type="submit" className="btn btn--accent" disabled={state.kind === "sending"} aria-busy={state.kind === "sending"}>
          {state.kind === "sending" ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
