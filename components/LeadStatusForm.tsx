export function LeadStatusForm({ id, current }: { id: string; current: string }) {
  return <form action={`/api/admin/leads/${id}/status`} method="post" className="inline-form"><select name="status" defaultValue={current}><option value="NEW">Nouveau</option><option value="QUALIFICATION">À qualifier</option><option value="QUOTE_TO_PREPARE">Devis à préparer</option><option value="QUOTE_SENT">Devis envoyé</option><option value="WON">Gagné</option><option value="LOST">Perdu</option></select><button className="btn btn-dark btn-small">Mettre à jour</button></form>;
}
