import Link from "next/link";

export function AuthPage({ children }: { children: React.ReactNode }) {
  return (
    <main className="login-page">
      <div style={{ display: "grid", gap: 24, justifyItems: "center", width: "100%" }}>
        <Link className="brand" href="/">
          <span className="brand-mark">F</span>
          <span><strong>FOLS</strong><small>Back-office</small></span>
        </Link>
        {children}
        <Link href="/" className="text-link">← Retour au site</Link>
      </div>
    </main>
  );
}
