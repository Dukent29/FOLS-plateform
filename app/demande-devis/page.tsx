import { PublicFooter } from "@/components/PublicFooter";
import { PublicHeader } from "@/components/PublicHeader";
import { LeadForm } from "@/components/LeadForm";
import Aurora from "@/components/Aurora";

const services = [
  "APS",
  "Événementiel & salon",
  "Agent cynophile",
  "Intervention sur alarme",
  "Sécurité incendie",
].map((name) => ({ id: "other", name }));

export default function QuoteRequestPage() {
  return (
    <>
      <PublicHeader />
      <main id="main-content" className="quote-page">
        <div className="container quote-layout">
          <aside className="quote-aside">
            <div className="quote-aside-background">
              <Aurora colorStops={["#7cff67", "#B497CF", "#5227FF"]} blend={0.5} amplitude={1} speed={1} />
            </div>
            <div className="quote-aside-content">
              <span className="eyebrow">Contactez-nous</span>
              <h1>Obtenez un devis sur mesure.</h1>
              <p>FOLS Security Group vous répond pour tout besoin de sécurité de personnes et de biens, pour votre domicile, entreprise, salon ou événement.</p>
              <div className="step-hint">
                <strong>Nos métiers</strong>
                <span>APS</span>
                <span>Événementiel &amp; salon</span>
                <span>Agent cynophile</span>
                <span>Intervention sur alarme</span>
                <span>Sécurité incendie</span>
              </div>
            </div>
          </aside>
          <LeadForm services={services} />
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
