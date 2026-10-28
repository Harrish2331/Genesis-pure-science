import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Logo } from "@/components/brand/Logo";
import { LoginForm } from "@/components/admin/LoginForm";
import { authConfig, currentAdmin } from "@/lib/auth/session";

export const metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await currentAdmin()) redirect("/admin");
  const cfg = authConfig();

  return (
    <main className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-mist via-white to-mint px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/" aria-label="Genesis Pure Lifesciences — website">
            <Logo height={130} priority />
          </Link>
        </div>
        <div className="rounded-[1.5rem] bg-white p-7 shadow-[var(--shadow-ring),var(--shadow-soft)] md:p-9">
          <h1 className="font-display text-2xl font-semibold text-ink">Content dashboard</h1>
          <p className="mt-1.5 text-sm text-muted">Authorised Genesis staff only.</p>
          <div className="grad-rule my-6 opacity-60" />
          {cfg.ok ? (
            <Suspense>
              <LoginForm />
            </Suspense>
          ) : (
            <div className="rounded-xl bg-warn-bg p-4 text-sm text-warn">
              <p className="font-semibold">Sign-in is not configured on this server.</p>
              <p className="mt-1">Set these server environment variables, then redeploy:</p>
              <ul className="mt-2 list-disc pl-5 font-mono text-xs">
                {cfg.missing.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
              <p className="mt-2">See docs/ADMIN-GUIDE.md.</p>
            </div>
          )}
        </div>
        <p className="mt-6 text-center text-xs text-muted">
          <Link href="/" className="hover:text-action">
            ← Back to the website
          </Link>
        </p>
      </div>
    </main>
  );
}
