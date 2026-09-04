import Link from "next/link";

export function PublicHeader() {
  return (
    <header className="public-header">
      <div className="container public-nav">
        <Link className="brand" href="/">
          <span className="brand-mark">F</span>
          <span><strong>FOLS</strong><small>Security Group</small></span>
        </Link>
        <nav className="nav-links" aria-label="Navigation principale">
          <Link href="/#solutions">Solutions</Link>
          <Link href="/#secteurs">Secteurs</Link>
          <Link href="/#apropos">À propos</Link>
          <Link href="/demande-devis" className="btn btn-small">Demander un devis</Link>
        </nav>
      </div>
    </header>
  );
}
