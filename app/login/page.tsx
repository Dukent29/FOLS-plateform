import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await getCurrentUser();
  if (user) redirect("/admin");
  const params = await searchParams;

  return <main className="login-page"><div className="login-card"><Link className="brand" href="/"><span className="brand-mark">F</span><span><strong>FOLS</strong><small>Back-office</small></span></Link><div><span className="eyebrow">Accès sécurisé</span><h1>Piloter les opportunités.</h1><p>Connexion réservée à l’équipe FOLS.</p></div>{params.error && <div className="alert">Identifiants incorrects.</div>}<form action="/api/auth/login" method="post" className="login-form"><label>Email<input name="email" type="email" required autoComplete="email" /></label><label>Mot de passe<input name="password" type="password" required autoComplete="current-password" /></label><button className="btn">Se connecter</button></form><Link href="/" className="text-link">← Retour au site</Link></div></main>;
}
