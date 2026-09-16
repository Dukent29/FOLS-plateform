import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AuthPage } from "@/components/AuthPage";

export default async function SignInPage() {
  const { userId } = await auth();
  if (userId) redirect("/admin");
  return <AuthPage><SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" fallbackRedirectUrl="/admin" /></AuthPage>;
}
