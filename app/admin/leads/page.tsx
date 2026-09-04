import Link from "next/link";
import { db } from "@/lib/db";
import { StatusBadge } from "@/components/StatusBadge";
import { dateFr } from "@/lib/format";

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const params = await searchParams;
  const status = params.status;
  const q = params.q?.trim();
  const valid = ["NEW", "QUALIFICATION", "QUOTE_TO_PREPARE", "QUOTE_SENT", "WON", "LOST"];
  const leads = await db.lead.findMany({
    where: {
      ...(status && valid.includes(status) ? { status: status as never } : {}),
      ...(q ? { OR: [{ reference: { contains: q, mode: "insensitive" } }, { company: { name: { contains: q, mode: "insensitive" } } }, { contact: { email: { contains: q, mode: "insensitive" } } }] } : {}),
    },
    include: { company: true, contact: true }, orderBy: { createdAt: "desc" },
  });

  return <><header className="admin-header"><div><span className="eyebrow">CRM</span><h1>Prospects</h1><p>{leads.length} demande(s) dans cette vue</p></div></header><form className="filters"><input name="q" defaultValue={q} placeholder="Entreprise, email, référence…" /><select name="status" defaultValue={status ?? ""}><option value="">Tous les statuts</option><option value="NEW">Nouveau</option><option value="QUALIFICATION">À qualifier</option><option value="QUOTE_TO_PREPARE">Devis à préparer</option><option value="QUOTE_SENT">Devis envoyé</option><option value="WON">Gagné</option><option value="LOST">Perdu</option></select><button className="btn btn-dark btn-small">Filtrer</button></form><section className="panel"><div className="table-wrap"><table><thead><tr><th>Prospect</th><th>Besoin</th><th>Lieu</th><th>Urgence</th><th>Statut</th><th>Création</th></tr></thead><tbody>{leads.map(lead => <tr key={lead.id}><td><Link href={`/admin/leads/${lead.id}`}><strong>{lead.company?.name ?? "Particulier"}</strong></Link><small>{lead.contact.firstName} {lead.contact.lastName} · {lead.contact.email}</small></td><td>{lead.serviceLabel}</td><td>{lead.city}</td><td>{lead.urgency}</td><td><StatusBadge status={lead.status} /></td><td>{dateFr(lead.createdAt)}</td></tr>)}</tbody></table>{!leads.length && <div className="empty big">Aucun prospect ne correspond aux filtres.</div>}</div></section></>;
}
