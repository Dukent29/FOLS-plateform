import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FOLS Security Group | Sécurité privée",
  description: "Solutions de sécurité privée adaptées aux entreprises, sites et événements.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body suppressHydrationWarning>
        <ClerkProvider
          dynamic
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          signInFallbackRedirectUrl="/admin"
          signUpFallbackRedirectUrl="/admin"
          afterSignOutUrl="/sign-in"
          appearance={{ variables: { colorPrimary: "#9b7740", borderRadius: "0.75rem" } }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
