import { PublicFooter } from "@/components/PublicFooter";
import { PublicHeader } from "@/components/PublicHeader";
import { LeadForm } from "@/components/LeadForm";
import { db } from "@/lib/db";

export default async function QuoteRequestPage() {
  const services = await db.service.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } });
  return <><PublicHeader /><main className="quote-page"><div className="container quote-layout"><aside><span className="eyebrow">Contactez-nous</span><h1>Obtenez un devis sur mesure.</h1><p>FOLS Security Group vous répond pour tout besoin de sécurité de personnes et de biens, pour votre domicile, entreprise, salon ou événement.</p><div className="step-hint"><strong>Nos métiers</strong><span>APS</span><span>Événementiel & salon</span><span>Agent cynophile</span><span>Intervention sur alarme</span><span>Sécurité incendie</span></div></aside><LeadForm services={services} /></div></main><PublicFooter /></>;
}
