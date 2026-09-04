import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FOLS Security Group | Sécurité privée",
  description: "Solutions de sécurité privée adaptées aux entreprises, sites et événements.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
