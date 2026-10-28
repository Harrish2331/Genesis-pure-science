"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en-IN">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0, color: "#14212b" }}>
        <main style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 28, marginBottom: 12 }}>Something went wrong</h1>
          <p style={{ color: "#3b4955", marginBottom: 24 }}>Please try again in a moment.</p>
          <button
            type="button"
            onClick={reset}
            style={{ background: "#0a6cb0", color: "#fff", border: 0, borderRadius: 999, padding: "12px 22px", fontWeight: 600, cursor: "pointer" }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
