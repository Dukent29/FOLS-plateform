import Link from "next/link";
import { db } from "@/lib/db";
import { StatusBadge } from "@/components/StatusBadge";
import { dateFr, dateTimeFr, euros } from "@/lib/format";

export default async function Dashboard() {
  const [newLeads, qualification, quotePrep, quoteSent, won, recentLeads, upcomingMissions, recentQuotes] = await Promise.all([
    db.lead.count({ where: { status: "NEW" } }), db.lead.count({ where: { status: "QUALIFICATION" } }),
    db.lead.count({ where: { status: "QUOTE_TO_PREPARE" } }), db.lead.count({ where: { status: "QUOTE_SENT" } }),
    db.lead.count({ where: { status: "WON" } }),
    db.lead.findMany({ take: 6, orderBy: { createdAt: "desc" }, include: { company: true, contact: true } }),
    db.mission.findMany({ take: 5, where: { startsAt: { gte: new Date() }, status: { in: ["PLANNED", "CONFIRMED"] } }, orderBy: { startsAt: "asc" }, include: { company: true } }),
    db.quote.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { company: true } }),
  ]);

  const kpis = [["Nouvelles demandes", newLeads], ["À qualifier", qualification], ["Devis à préparer", quotePrep], ["Devis envoyés", quoteSent], ["Gagnés", won]];
  return <><header className="admin-header"><div><span className="eyebrow">Centre de pilotage</span><h1>Vue d’ensemble</h1></div><Link href="/admin/leads" className="btn btn-dark">Voir les prospects</Link></header><section className="kpi-grid">{kpis.map(([label, value]) => <article className="kpi-card" key={label}><span>{label}</span><strong>{value}</strong></article>)}</section><div className="dashboard-grid"><section className="panel wide"><div className="panel-title"><div><span>Commercial</span><h2>Demandes récentes</h2></div><Link href="/admin/leads">Tout voir →</Link></div><div className="table-wrap"><table><thead><tr><th>Référence</th><th>Entreprise</th><th>Besoin</th><th>Statut</th><th>Reçue</th></tr></thead><tbody>{recentLeads.map(lead => <tr key={lead.id}><td><Link href={`/admin/leads/${lead.id}`}>{lead.reference}</Link></td><td><strong>{lead.company?.name ?? `${lead.contact.firstName} ${lead.contact.lastName ?? ""}`}</strong><small>{lead.city}</small></td><td>{lead.serviceLabel}</td><td><StatusBadge status={lead.status} /></td><td>{dateFr(lead.createdAt)}</td></tr>)}</tbody></table></div></section><section className="panel"><div className="panel-title"><div><span>Opérations</span><h2>Prochaines missions</h2></div></div><div className="stack-list">{upcomingMissions.length ? upcomingMissions.map(m => <div className="stack-item" key={m.id}><strong>{m.company?.name ?? m.title}</strong><span>{dateTimeFr(m.startsAt)}</span><small>{m.location}</small></div>) : <p className="empty">Aucune mission planifiée.</p>}</div></section><section className="panel"><div className="panel-title"><div><span>Devis</span><h2>Derniers devis</h2></div></div><div className="stack-list">{recentQuotes.length ? recentQuotes.map(q => <div className="stack-item" key={q.id}><strong>{q.company?.name ?? q.reference}</strong><span>{euros(q.totalCents)}</span><StatusBadge kind="quote" status={q.status} /></div>) : <p className="empty">Aucun devis pour le moment.</p>}</div></section></div></>;
}
