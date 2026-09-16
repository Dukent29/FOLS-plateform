import { SignOutButton, UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { AuthPage } from "@/components/AuthPage";
import { getCurrentUser } from "@/lib/auth";

export default async function AccessDeniedPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role) redirect("/admin");
  return (
    <AuthPage>
      <section className="login-card">
        <UserButton />
        <div>
          <h1>Accès réservé.</h1>
          <p>Bonjour {user.name}. Votre compte est connecté, mais l’accès au back-office n’a pas encore été autorisé.</p>
          <p>Contactez un administrateur FOLS pour obtenir votre accès.</p>
        </div>
        <SignOutButton redirectUrl="/sign-in"><button className="btn btn-dark">Changer de compte</button></SignOutButton>
      </section>
    </AuthPage>
  );
}
