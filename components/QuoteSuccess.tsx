"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import styles from "./QuoteSuccess.module.css";

export function QuoteSuccess({ reference, onNewRequest }: { reference: string; onNewRequest: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    headingRef.current?.scrollIntoView({ behavior: "instant", block: "nearest" });
  }, []);

  return (
    <section className={styles.card} aria-labelledby="quote-success-title">
      <div className={styles.emblem} aria-hidden="true">
        <span className={styles.halo} />
        <svg viewBox="0 0 120 120" fill="none">
          <path className={styles.shield} pathLength="1" d="M60 14 94 28v28c0 25-20 42-34 49-14-7-34-24-34-49V28Z" />
          <path className={styles.check} pathLength="1" d="m43 59 12 12 23-27" />
        </svg>
        <span className={styles.spark} />
        <span className={styles.spark} />
        <span className={styles.spark} />
        <span className={styles.spark} />
      </div>
      <span className={styles.kicker}>Bien reçu. On prend le relais.</span>
      <h2 id="quote-success-title" ref={headingRef} tabIndex={-1}>Votre demande<br />est entre de bonnes mains.</h2>
      <p className={styles.copy}>Merci pour votre confiance. Notre équipe prendra contact avec vous pour préciser votre besoin et préparer une proposition adaptée.</p>
      <div className={styles.receipt}>
        <span>Votre référence à conserver</span>
        <strong>{reference}</strong>
        <span className={styles.receiptStatus}><span aria-hidden="true">✓</span> Demande enregistrée</span>
      </div>
      <div className={styles.actions}>
        <Link href="/" className={styles.primary}>
          Retour à l’accueil
          <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 12h16m-6-6 6 6-6 6" /></svg>
        </Link>
        <button type="button" onClick={onNewRequest}>Faire une autre demande</button>
      </div>
    </section>
  );
}
