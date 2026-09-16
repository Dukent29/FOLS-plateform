import { requireUser } from "@/lib/auth";
import { AdminShell } from "@/components/AdminShell";
import { UserButton } from "@clerk/nextjs";
import styles from "./layout.module.css";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return <AdminShell userName={user.name}><div className={styles.accountMenu}><UserButton /></div>{children}</AdminShell>;
}
