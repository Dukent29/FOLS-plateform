import Link from "next/link";
import { SignOutButton, UserButton } from "@clerk/nextjs";
import { AdminSnackbar } from "./AdminSnackbar";

const links = [
  ["/admin", "Vue d’ensemble"], ["/admin/leads", "Prospects"], ["/admin/clients", "Clients"],
  ["/admin/quotes", "Devis"], ["/admin/planning", "Planning"], ["/admin/settings", "Réglages"],
];

export function AdminShell({ children, userName }: { children: React.ReactNode; userName: string }) {
  return <div className="admin-shell"><aside className="sidebar"><Link href="/admin" className="brand sidebar-brand"><span className="brand-mark">F</span><span><strong>FOLS</strong><small>Control</small></span></Link><nav>{links.map(([href, label]) => <Link href={href} key={href}>{label}</Link>)}</nav><div className="sidebar-bottom"><small>Connecté</small><strong>{userName}</strong><UserButton /><SignOutButton redirectUrl="/sign-in"><button className="logout-button">Déconnexion</button></SignOutButton></div></aside><div className="admin-main">{children}</div><AdminSnackbar /></div>;
}
