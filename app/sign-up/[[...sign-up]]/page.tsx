import { SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AuthPage } from "@/components/AuthPage";

export default async function SignUpPage() {
  const { userId } = await auth();
  if (userId) redirect("/admin");
  return <AuthPage><SignUp routing="path" path="/sign-up" signInUrl="/sign-in" fallbackRedirectUrl="/admin" /></AuthPage>;
}
