import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { dateFr, euros } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { QuoteStatusForm } from "@/components/QuoteStatusForm";
import { PrintButton } from "@/components/PrintButton";

export default async function QuoteDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quote = await db.quote.findUnique({ where: { id }, include: { company: true, contact: true, items: true, lead: true } });
  if (!quote) notFound();
  const settingsRows = await db.appSetting.findMany();
  const settings = Object.fromEntries(settingsRows.map(s => [s.key, s.value]));

  return <><header className="admin-header no-print"><div><span className="eyebrow">{quote.reference}</span><h1>Devis</h1></div><div className="header-actions"><QuoteStatusForm quoteId={quote.id} leadId={quote.leadId} current={quote.status}/><PrintButton/></div></header><article className="quote-document"><header><div><strong>{settings.company_name ?? "FOLS SECURITY GROUP"}</strong><span>{settings.address}</span><span>SIREN {settings.siren}</span></div><div><span>DEVIS</span><strong>{quote.reference}</strong><small>Créé le {dateFr(quote.createdAt)}</small><small>Valide jusqu’au {dateFr(quote.validUntil)}</small></div></header><section className="quote-parties"><div><span>Prestataire</span><strong>{settings.company_name}</strong><p>{settings.address}</p></div><div><span>Client</span><strong>{quote.company?.name ?? `${quote.contact.firstName} ${quote.contact.lastName ?? ""}`}</strong><p>{quote.contact.email}<br/>{quote.contact.phone}</p></div></section><table className="quote-lines"><thead><tr><th>Description</th><th>Qté</th><th>Heures</th><th>Prix/h HT</th><th>Frais</th><th>Total HT</th></tr></thead><tbody>{quote.items.map(item => <tr key={item.id}><td>{item.description}</td><td>{item.quantity}</td><td>{String(item.hours)}</td><td>{euros(item.unitPriceCents)}</td><td>{euros(item.surchargeCents)}</td><td>{euros(item.lineTotalCents)}</td></tr>)}</tbody></table><section className="quote-summary"><div><span>Sous-total HT</span><strong>{euros(quote.subtotalCents)}</strong></div><div><span>TVA 20%</span><strong>{euros(quote.taxCents)}</strong></div><div className="grand"><span>Total TTC</span><strong>{euros(quote.totalCents)}</strong></div></section><footer><StatusBadge status={quote.status} kind="quote"/><p>{settings.legal_notice}</p><p className="legal-warning">Autorisation CNAPS : {settings.cnaps_authorization}</p></footer></article></>;
}
