import { db } from "@/lib/db";
import { dateFr } from "@/lib/format";

export default async function ClientsPage() {
  const clients = await db.company.findMany({ where: { leads: { some: { status: "WON" } } }, include: { contacts: true, leads: { where: { status: "WON" } }, quotes: true, missions: true }, orderBy: { name: "asc" } });
  return <><header className="admin-header"><div><span className="eyebrow">Portefeuille</span><h1>Clients</h1><p>Les entreprises ayant au moins une opportunité gagnée.</p></div></header><section className="client-grid">{clients.map(c => <article className="client-card" key={c.id}><span>Client</span><h2>{c.name}</h2><p>{c.city ?? "Ville non renseignée"}</p><div><strong>{c.contacts[0]?.email ?? "—"}</strong><small>{c.contacts[0]?.phone ?? "—"}</small></div><footer><span>{c.missions.length} mission(s)</span><span>Depuis {dateFr(c.createdAt)}</span></footer></article>)}{!clients.length && <div className="empty big panel">Aucun client gagné pour le moment.</div>}</section></>;
}
