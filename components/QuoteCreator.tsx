"use client";
import { useMemo, useState } from "react";

export function QuoteCreator({ leadId, companyId, contactId, serviceId, serviceLabel, defaultRate = 30 }: { leadId: string; companyId?: string | null; contactId: string; serviceId?: string | null; serviceLabel: string; defaultRate?: number }) {
  const [hours, setHours] = useState(8);
  const [quantity, setQuantity] = useState(1);
  const [rate, setRate] = useState(defaultRate);
  const [surcharge, setSurcharge] = useState(0);
  const subtotal = useMemo(() => Math.round(hours * quantity * rate * 100 + surcharge * 100), [hours, quantity, rate, surcharge]);
  const tax = Math.round(subtotal * .2); const total = subtotal + tax;
  const eur = (c: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(c / 100);

  return <form action="/api/admin/quotes" method="post" className="quote-builder"><input type="hidden" name="leadId" value={leadId}/><input type="hidden" name="companyId" value={companyId ?? ""}/><input type="hidden" name="contactId" value={contactId}/><input type="hidden" name="serviceId" value={serviceId ?? ""}/><label>Description<input name="description" defaultValue={serviceLabel} required /></label><div className="form-grid three"><label>Nb. agents<input name="quantity" type="number" min="1" value={quantity} onChange={e => setQuantity(Number(e.target.value))} /></label><label>Heures / agent<input name="hours" type="number" min="0.5" step="0.5" value={hours} onChange={e => setHours(Number(e.target.value))} /></label><label>Tarif horaire HT (€)<input name="unitPrice" type="number" min="0" step="0.01" value={rate} onChange={e => setRate(Number(e.target.value))} /></label><label>Majoration / frais HT (€)<input name="surcharge" type="number" min="0" step="0.01" value={surcharge} onChange={e => setSurcharge(Number(e.target.value))} /></label><label>Validité<input name="validDays" type="number" min="1" defaultValue="30" /></label></div><div className="quote-total"><span>Sous-total <strong>{eur(subtotal)}</strong></span><span>TVA 20% <strong>{eur(tax)}</strong></span><span className="grand">Total TTC <strong>{eur(total)}</strong></span></div><button className="btn btn-dark">Créer le devis brouillon</button><p className="helper">Les tarifs affichés ici sont des valeurs de saisie, pas des tarifs officiels FOLS.</p></form>;
}
