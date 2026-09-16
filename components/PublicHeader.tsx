"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./PublicHeader.module.css";

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 16);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header className={styles.header} data-scrolled={scrolled} onKeyDown={(event) => {
      if (event.key === "Escape" && open) { setOpen(false); toggle.current?.focus(); }
    }}>
      <a href="#main-content" className={styles.skip}>Aller au contenu</a>
      <div className={styles.inner}>
        <Link className={styles.brand} href="/" onClick={() => setOpen(false)} aria-label="FOLS Security Group — Accueil">
          <span className={styles.mark}>F<span /></span>
          <span><strong>FOLS</strong><small>SECURITY GROUP</small></span>
        </Link>
        <button ref={toggle} className={styles.toggle} type="button" aria-expanded={open} aria-controls="public-navigation"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"} onClick={() => setOpen(!open)}>
          <span /><span />
        </button>
        <nav id="public-navigation" className={styles.nav} data-open={open} aria-label="Navigation principale">
          <Link href="/#solutions" onClick={() => setOpen(false)}>Nos expertises</Link>
          <Link href="/#secteurs" onClick={() => setOpen(false)}>Votre secteur</Link>
          <Link href="/#apropos" onClick={() => setOpen(false)}>L’esprit FOLS</Link>
          <Link className={styles.contact} href="/demande-devis" onClick={() => setOpen(false)}>Parlons de votre projet <span aria-hidden="true">↗</span></Link>
        </nav>
      </div>
    </header>
  );
}
