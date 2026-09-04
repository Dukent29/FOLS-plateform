export function EmailComposer({ leadId, email, companyName }: { leadId: string; email: string; companyName: string }) {
  return <form action={`/api/admin/leads/${leadId}/email`} method="post" className="note-form">
    <label>Destinataire<input value={email} readOnly /></label>
    <label>Objet<input name="subject" required defaultValue={`Votre demande de sécurité — ${companyName}`} /></label>
    <label>Message<textarea name="message" rows={7} required defaultValue={`Bonjour,\n\nMerci pour votre demande auprès de FOLS Security Group. Nous avons bien pris connaissance de votre besoin.\n\nNous revenons vers vous afin de préciser les éléments nécessaires à la préparation de notre proposition.\n\nCordialement,\nFOLS Security Group`} /></label>
    <button className="btn btn-dark btn-small">Envoyer l’email</button>
    <p className="helper">Nécessite la configuration SMTP dans le fichier .env.</p>
  </form>;
}
