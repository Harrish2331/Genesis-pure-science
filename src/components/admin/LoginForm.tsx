"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { FormMessage } from "./kit";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(params.get("expired") ? "Your session expired. Please sign in again." : null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return setError("Enter your email address and password.");
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Sign-in failed.");
        setBusy(false);
        return;
      }
      const next = params.get("next");
      router.replace(next && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
      router.refresh();
    } catch {
      setError("Could not reach the server.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
      {error ? <FormMessage kind="error">{error}</FormMessage> : null}
      <div>
        <label htmlFor="email" className="field-label">
          Email address
        </label>
        <input id="email" type="email" autoComplete="username" className="field" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="password" className="field-label">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className="field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="btn btn-primary w-full" disabled={busy}>
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
