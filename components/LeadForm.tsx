"use client";

import { FormEvent, useRef, useState } from "react";
import { DateTimePicker } from "./DateTimePicker";

export function LeadForm({ services }: { services: { id: string; name: string }[] }) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [step, setStep] = useState<1 | 2>(1);
  const [reference, setReference] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  function continueToNeed() {
    const contactFields = Array.from(formRef.current?.querySelectorAll<HTMLInputElement>("[data-contact-field]") ?? []);
    if (contactFields.every((field) => field.reportValidity())) setStep(2);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const startTime = String(data.startTime ?? "");
    const endTime = String(data.endTime ?? "");
    data.timeRange = startTime && endTime ? `${startTime} → ${endTime}` : startTime || endTime;

    const response = await fetch("/api/public/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) { setState("error"); return; }
    const result = await response.json();
    setReference(result.reference);
    setState("success");
    form.reset();
  }

  if (state === "success") return <div className="success-card"><span>Demande enregistrée</span><h2>Merci. Votre besoin est maintenant dans le back-office FOLS.</h2><p>Référence : <strong>{reference}</strong></p><button className="btn" onClick={() => { setStep(1); setState("idle"); }}>Nouvelle demande</button></div>;

  return <form className="lead-form" onSubmit={submit} ref={formRef}>
    <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="form-honeypot" />
    <div className="form-progress" aria-label={`Étape ${step} sur 2`}><span className={step === 1 ? "active" : "complete"}>01 <small>Contact</small></span><i/><span className={step === 2 ? "active" : ""}>02 <small>Besoin</small></span></div>
    <div className={`form-section ${step === 2 ? "is-collapsed" : ""}`}><span>01 · Contact</span><div className="form-grid two"><label>Société<input data-contact-field name="company" required placeholder="Ex. Normandie Logistique" /></label><label>Nom du contact<input data-contact-field name="contactName" required placeholder="Prénom Nom" /></label><label>Email<input data-contact-field name="email" type="email" required placeholder="contact@entreprise.fr" /></label><label>Téléphone<input data-contact-field name="phone" required placeholder="06 00 00 00 00" /></label></div>{step === 1 && <button className="btn btn-dark form-next" type="button" onClick={continueToNeed}>Continuer vers le besoin <span aria-hidden>→</span></button>}</div>
    {step === 2 && <div className="form-section form-needs"><span>02 · Besoin</span><div className="form-grid two"><label>Service<select name="serviceId" defaultValue="" required><option value="" disabled>Choisir</option>{services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}<option value="other">Autre / à définir</option></select></label><label>Type de site<input name="siteType" placeholder="Entrepôt, commerce, chantier…" /></label><label>Ville / lieu<input name="city" required placeholder="Évreux" /></label><label>Durée estimée<input name="duration" placeholder="3 nuits, 2 semaines…" /></label></div><div className="schedule-card"><div><strong>Dates & horaires</strong><p>Sélectionnez le jour puis l’heure de début.</p></div><DateTimePicker label="Heure de début" dateName="desiredStart" timeName="startTime" /><label className="end-time-field">Heure de fin<input name="endTime" type="time" /></label></div><div className="form-grid two"><label>Nombre d’agents estimé<input name="guardCount" type="number" min="1" placeholder="2" /></label><label>Urgence<select name="urgency" defaultValue="NORMAL"><option value="URGENT">Urgent (&lt; 72h)</option><option value="SOON">Sous 7 jours</option><option value="NORMAL">Planifiable</option></select></label></div><label>Description<textarea name="description" required rows={6} placeholder="Contexte, risques, accès, contraintes, horaires…" /></label><div className="form-actions"><button className="text-button" type="button" onClick={() => setStep(1)}>← Modifier le contact</button><button className="btn" disabled={state === "loading"}>{state === "loading" ? "Enregistrement…" : "Envoyer ma demande"}</button></div></div>}
    {step === 2 && <label className="consent"><input name="consent" value="yes" type="checkbox" required /> J’accepte que mes informations soient utilisées pour traiter cette demande commerciale.</label>}
    {state === "error" && <p className="form-error">Impossible d’enregistrer la demande. Vérifiez les champs et réessayez.</p>}
  </form>;
}
