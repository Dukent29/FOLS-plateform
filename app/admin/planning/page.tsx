import { db } from "@/lib/db";
import { dateTimeFr } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";

export default async function PlanningPage() {
  const missions = await db.mission.findMany({ include: { company: true }, orderBy: { startsAt: "asc" } });
  return <><header className="admin-header"><div><span className="eyebrow">Opérations</span><h1>Planning</h1><p>Liste opérationnelle des missions enregistrées.</p></div></header><section className="planning-list">{missions.length ? missions.map(m => <article className="mission-card" key={m.id}><div className="mission-date"><strong>{new Intl.DateTimeFormat("fr-FR", { day: "2-digit" }).format(m.startsAt)}</strong><span>{new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(m.startsAt)}</span></div><div className="mission-copy"><span>{m.reference}</span><h2>{m.title}</h2><p>{m.location} · {m.requiredPersonnel} personne(s)</p><small>{dateTimeFr(m.startsAt)} → {dateTimeFr(m.endsAt)}</small></div><StatusBadge status={m.status} kind="mission"/></article>) : <div className="empty big panel">Aucune mission planifiée.</div>}</section></>;
}
