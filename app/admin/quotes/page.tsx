import { db } from "@/lib/db";
import { StatusBadge } from "@/components/StatusBadge";
import { dateFr, euros } from "@/lib/format";

export default async function QuotesPage() {
  const quotes = await db.quote.findMany({ include: { company: true, contact: true, items: true }, orderBy: { createdAt: "desc" } });
  const totalPipeline = quotes.filter(q => ["DRAFT", "SENT"].includes(q.status)).reduce((sum, q) => sum + q.totalCents, 0);
  return <><header className="admin-header"><div><span className="eyebrow">Commercial</span><h1>Devis</h1><p>Pipeline ouvert : {euros(totalPipeline)}</p></div></header><section className="panel"><div className="table-wrap"><table><thead><tr><th>Référence</th><th>Client</th><th>Montant TTC</th><th>Statut</th><th>Validité</th></tr></thead><tbody>{quotes.map(q => <tr key={q.id}><td><a href={`/admin/quotes/${q.id}`}><strong>{q.reference}</strong></a></td><td>{q.company?.name ?? `${q.contact.firstName} ${q.contact.lastName ?? ""}`}</td><td>{euros(q.totalCents)}</td><td><StatusBadge status={q.status} kind="quote"/></td><td>{dateFr(q.validUntil)}</td></tr>)}</tbody></table>{!quotes.length && <div className="empty big">Aucun devis créé.</div>}</div></section></>;
}
