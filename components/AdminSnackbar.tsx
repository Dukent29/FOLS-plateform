"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Notice = { message: string; tone: "success" | "error" };
const STORAGE_KEY = "fols-admin-snackbar";

function successMessage(action: string) {
  if (action.includes("/settings")) return "Réglages enregistrés";
  if (action.includes("/missions")) return "Mission ajoutée au planning";
  if (action.includes("/quotes") && action.includes("/status")) return "Statut du devis mis à jour";
  if (action.includes("/quotes")) return "Devis brouillon créé";
  if (action.includes("/notes")) return "Note ajoutée à l’historique";
  if (action.includes("/email")) return "Email envoyé";
  if (action.includes("/status")) return "Statut mis à jour";
  return "Action enregistrée";
}

export function AdminSnackbar() {
  const router = useRouter();
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    const savedNotice = sessionStorage.getItem(STORAGE_KEY);
    let restoreTimeout: number | undefined;
    if (savedNotice) {
      sessionStorage.removeItem(STORAGE_KEY);
      restoreTimeout = window.setTimeout(() => setNotice(JSON.parse(savedNotice) as Notice), 0);
    }

    async function handleSubmit(event: SubmitEvent) {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      const action = new URL(form.action, window.location.origin);
      if (action.origin !== window.location.origin || !action.pathname.startsWith("/api/admin/")) return;
      event.preventDefault();
      try {
        const response = await fetch(`${action.pathname}${action.search}`, { method: form.method || "POST", body: new FormData(form) });
        if (!response.ok) throw new Error(await response.text());
        const destination = new URL(response.url, window.location.origin);
        if (destination.origin !== window.location.origin) throw new Error("Cross-origin redirect blocked");
        setNotice({ message: successMessage(action.pathname), tone: "success" });
        router.push(`${destination.pathname}${destination.search}${destination.hash}`);
        router.refresh();
      } catch {
        setNotice({ message: "L’action n’a pas pu être enregistrée. Réessayez.", tone: "error" });
      }
    }

    document.addEventListener("submit", handleSubmit, true);
    return () => {
      if (restoreTimeout) window.clearTimeout(restoreTimeout);
      document.removeEventListener("submit", handleSubmit, true);
    };
  }, [router]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 4500);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  if (!notice) return null;
  return <div className={`admin-snackbar ${notice.tone}`} role="status" aria-live="polite"><span className="admin-snackbar-icon" aria-hidden="true">{notice.tone === "success" ? "✓" : "!"}</span><span>{notice.message}</span><button type="button" aria-label="Fermer la notification" onClick={() => setNotice(null)}>×</button></div>;
}
