export function QuoteStatusForm({ quoteId, leadId, current }: { quoteId: string; leadId?: string | null; current: string }) {
  return <form action={`/api/admin/quotes/${quoteId}/status`} method="post" className="quote-status-form">
    <input type="hidden" name="leadId" value={leadId ?? ""}/>
    <select name="status" defaultValue={current}>
      <option value="DRAFT">Brouillon</option>
      <option value="SENT">Envoyé</option>
      <option value="ACCEPTED">Accepté</option>
      <option value="REFUSED">Refusé</option>
      <option value="EXPIRED">Expiré</option>
    </select>
    <button className="btn btn-dark btn-small">OK</button>
  </form>;
}
