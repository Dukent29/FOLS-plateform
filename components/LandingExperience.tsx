"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import GradientWaves from "./GradientWaves";
import styles from "./LandingExperience.module.css";

type IconName = "shield" | "people" | "dog" | "alarm" | "fire" | "arrow" | "check";

function Icon({ name, className }: { name: IconName; className?: string }) {
  const paths: Record<IconName, React.ReactNode> = {
    shield: <><path d="M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6Z" /><path d="m8 12 3 3 5-6" /></>,
    people: <><circle cx="9" cy="8" r="3" /><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 4v3" /></>,
    dog: <><path d="m5 21 1-7-3-4 4-1 2-6 4 4h4l4 5-3 3h-6l-1 6M9 3l1 6M12 15l4 6" /><circle cx="16" cy="10" r=".5" /></>,
    alarm: <><path d="M5 17h14l-2-3V9a5 5 0 0 0-10 0v5ZM9 21h6M3 4 1 7M21 4l2 3" /></>,
    fire: <path d="M13 2c2 6-5 7-3 11 2 1 3-1 4-4 3 3 5 5 5 8a7 7 0 0 1-14 0c0-5 6-8 8-15Z" />,
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    check: <path d="m5 12 4 4L19 6" />,
  };
  return <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

const services: { name: string; short: string; icon: IconName; title: string; description: string; features: string[] }[] = [
  { name: "Prévention & sécurité", short: "APS", icon: "shield", title: "Une présence qui fait la différence.", description: "Protéger vos personnes, vos locaux et vos activités commence par une présence attentive. Nos agents de prévention et de sécurité s’adaptent aux particularités de votre site.", features: ["Surveillance des personnes et des biens", "Vigilance sur les accès", "Consignes adaptées à votre environnement"] },
  { name: "Événementiel & salons", short: "ÉVÉNEMENTIEL", icon: "people", title: "Votre événement. Leur sérénité.", description: "Un salon, une réception ou un événement : nous vous accompagnons pour que l’accueil du public et la protection des lieux s’intègrent naturellement à votre organisation.", features: ["Accueil et orientation du public", "Gestion des accès et des flux", "Coordination avec votre organisation"] },
  { name: "Agent cynophile", short: "CYNOPHILE", icon: "dog", title: "Un binôme, une vigilance renforcée.", description: "Le conducteur et son chien forment une équipe complémentaire pour les missions de surveillance, de dissuasion et de protection adaptées à votre site.", features: ["Présence dissuasive sur site", "Surveillance des espaces extérieurs", "Missions définies selon vos contraintes"] },
  { name: "Intervention sur alarme", short: "INTERVENTION", icon: "alarm", title: "Anticiper pour mieux intervenir.", description: "Préparez la réponse à une alarme avec un dispositif défini selon votre domicile, votre entreprise ou votre site. Les modalités d’intervention se construisent avec vous.", features: ["Prise en compte des consignes du site", "Organisation de la réponse à une alarme", "Protection des personnes et des biens"] },
  { name: "Sécurité incendie", short: "SSIAP", icon: "fire", title: "Prévenir les risques. Protéger les personnes.", description: "Nos agents SSIAP assurent des missions de sécurité incendie et d’assistance à la personne, en tenant compte des spécificités de votre établissement.", features: ["Personnel formé SSIAP", "Prévention du risque incendie", "Assistance à la personne"] },
];

const contexts = [
  { name: "Entreprise", title: "Vos activités, en toute sérénité.", copy: "Des accès aux espaces de travail, une présence adaptée à votre quotidien.", points: ["Accès au site", "Surveillance", "Prévention"] },
  { name: "Événement", title: "L’accueil aussi se protège.", copy: "Un dispositif pensé autour de vos visiteurs, de vos équipes et de vos espaces.", points: ["Accueil du public", "Gestion des flux", "Protection du site"] },
  { name: "Domicile", title: "Votre tranquillité a sa place.", copy: "Parlons de vos besoins de présence et de protection, ponctuels ou réguliers.", points: ["Accès à la propriété", "Présence sur site", "Alarme"] },
];

const sectors = [
  { title: "Entreprises & locaux professionnels", description: "Bureaux, commerces et sites d’activité : définissons une présence compatible avec vos horaires, vos accès et vos équipes.", tags: ["Prévention & sécurité", "Intervention sur alarme"] },
  { title: "Événements & salons", description: "De l’installation à l’accueil du public, construisons ensemble une organisation qui accompagne les temps forts de votre événement.", tags: ["Événementiel", "Gestion des accès"] },
  { title: "Domiciles & propriétés", description: "Un besoin ponctuel ou régulier ? Nous étudions votre environnement et vos attentes pour vous proposer une protection adaptée.", tags: ["Surveillance", "Intervention sur alarme"] },
  { title: "Établissements recevant du public", description: "La sécurité des visiteurs et des équipes demande une attention particulière. Échangeons sur vos besoins de prévention et de sécurité incendie.", tags: ["Agents SSIAP", "Prévention & sécurité"] },
];

const questions = [
  ["Comment obtenir un devis ?", "Utilisez notre formulaire pour préciser votre site, les dates envisagées et votre besoin. Ces informations permettent à notre équipe d’étudier votre demande et de préparer une proposition adaptée."],
  ["Je ne sais pas quel service choisir. Que faire ?", "Vous n’avez pas besoin de connaître le nom du métier. Décrivez simplement votre situation dans le formulaire en choisissant « Autre / à définir », ou contactez-nous par téléphone pour en parler."],
  ["Puis-je demander une prestation ponctuelle ?", "Oui. Présentez-nous votre besoin ponctuel ou régulier, avec les dates et horaires souhaités. La prestation sera étudiée selon vos contraintes et les disponibilités de l’équipe."],
  ["Comment vous joindre ?", "Vous pouvez nous contacter au 07 88 13 26 45, au 04 42 07 13 49 ou par email à contact@folssecuritygroup.fr. Notre équipe est à votre écoute 7j/7 et 24h/24."],
];

export function LandingExperience() {
  const [context, setContext] = useState(0);
  const [motionPaused, setMotionPaused] = useState(false);
  const [service, setService] = useState(0);
  const [sector, setSector] = useState<number | null>(0);
  const root = useRef<HTMLElement>(null);
  const selected = services[service];
  const scenario = contexts[context];

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches || !window.IntersectionObserver) return;
    const animations: Animation[] = [];
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        if (!preference.matches) animations.push(entry.target.animate(
          [{ opacity: 0, transform: "translateY(22px)" }, { opacity: 1, transform: "translateY(0)" }],
          { duration: 650, easing: "cubic-bezier(.16,1,.3,1)" },
        ));
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.12 });
    root.current?.querySelectorAll("[data-reveal]").forEach((node) => observer.observe(node));
    const onPreferenceChange = () => { if (preference.matches) animations.forEach((animation) => animation.finish()); };
    preference.addEventListener("change", onPreferenceChange);
    return () => { observer.disconnect(); preference.removeEventListener("change", onPreferenceChange); animations.forEach((animation) => animation.cancel()); };
  }, []);

  return (
    <main id="main-content" ref={root} className={styles.page}>
      <section className={styles.hero} aria-labelledby="hero-title">
        <GradientWaves className={styles.heroWaves} horizonColor="#211346" waveColor="#7554ef" crestColor="#f0ebff" speed={0.42} amplitude={2.45} waveScale={0.6} waveRatio={0.9} swell={35} turbulence={20} tilt={1.11} zoom={1} height={5.5} fogDepth={19} detail="medium" brightness={1} opacity={0.9} mouseInteraction parallaxStrength={0.42} grain grainIntensity={0.04} />
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}><span className={styles.dot} /> LA SÉCURITÉ, UNE QUESTION DE CONFIANCE</div>
            <h1 id="hero-title">Vous avancez.<br />Nous <span>veillons.</span></h1>
            <p>Vos équipes. Vos espaces. Vos événements.<br />Une présence humaine et des solutions sur mesure pour protéger ce qui compte pour vous.</p>
            <div className={styles.actions}>
              <Link href="/demande-devis" className={styles.primary}>Parlons de votre sécurité <Icon name="arrow" /></Link>
              <a href="#solutions" className={styles.secondary}>Explorer nos expertises <span aria-hidden="true">↓</span></a>
            </div>
            <div className={styles.heroNote}><Icon name="shield" /><span>Professionnalisme. Intégrité. Discrétion.</span></div>
          </div>

          <div className={styles.scene} data-motion-paused={motionPaused}>
            <div className={styles.sceneTop}>
              <span>UNE PROTECTION SUR MESURE</span>
              <div className={styles.sceneControls}>
                <Icon name="shield" />
                <button type="button" className={styles.motionToggle} aria-pressed={motionPaused}
                  aria-label={motionPaused ? "Reprendre l’animation" : "Mettre l’animation en pause"}
                  title={motionPaused ? "Reprendre l’animation" : "Mettre l’animation en pause"}
                  onClick={() => setMotionPaused((paused) => !paused)}>
                  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    {motionPaused ? <path d="m7 4 9 6-9 6Z" /> : <path d="M5 4h3v12H5zm7 0h3v12h-3z" />}
                  </svg>
                </button>
              </div>
            </div>
            <div className={styles.contextSwitch} role="group" aria-label="Explorer un type de site">
              {contexts.map((item, index) => <button key={item.name} type="button" aria-pressed={context === index} aria-controls="site-scenario" onClick={() => setContext(index)}>{item.name}</button>)}
            </div>
            <div className={styles.sceneArt} aria-hidden="true">
              <svg viewBox="0 0 520 345" fill="none" className={styles.building}>
                <defs>
                  <linearGradient id="fols-roof" x1="180" y1="65" x2="360" y2="205" gradientUnits="userSpaceOnUse"><stop stopColor="#b1a8fc" /><stop offset="1" stopColor="#6553c7" /></linearGradient>
                  <linearGradient id="fols-wall" x1="300" y1="155" x2="300" y2="300" gradientUnits="userSpaceOnUse"><stop stopColor="#6553b1" /><stop offset="1" stopColor="#302750" /></linearGradient>
                </defs>
                <path d="m40 223 215-114 221 118-213 115Z" fill="#8070dc" fillOpacity=".07" stroke="#9c8ef0" strokeOpacity=".18" />
                <path className={styles.roadFlow} d="m64 223 192-101 196 104-190 100Z" pathLength="880" stroke="#b7a6ff" strokeOpacity=".6" strokeDasharray="4 7" strokeLinecap="round" />
                <path d="m105 220 152-80 153 83-150 80Z" fill="#24203e" stroke="#71648f" />
                <path d="M148 142v91l109 60v-98Z" fill="#393050" stroke="#8e7dbc" />
                <path d="m257 195 116-64v99l-116 63Z" fill="url(#fols-wall)" stroke="#9784d0" />
                <path d="m148 142 115-62 110 51-116 64Z" fill="url(#fols-roof)" stroke="#c2b6ff" />
                <path d="m177 139 85-44 78 37-84 47Z" stroke="#c6b8ff" strokeOpacity=".65" />
                <path d="m200 126 79 39m-51-54 79 38" stroke="#c6b8ff" strokeOpacity=".45" />
                <path d="m167 170 20 11v32l-20-11Zm38 20 21 12v31l-21-11Z" fill="#bab1ea" fillOpacity=".27" stroke="#a596cb" />
                <path d="m274 207 28-15v57l-28 15Z" fill="#b1a0ff" fillOpacity=".35" stroke="#c0afff" />
                <path d="m315 184 16-9v28l-16 9Zm26-15 16-9v28l-16 9Z" fill="#b1a0ff" fillOpacity=".3" stroke="#a090cf" />
                <path d="m289 256 1 35 66 35M121 259l-39-21m325-26 40-22" stroke="#a99af8" strokeOpacity=".7" strokeDasharray="3 5" />
                <circle className={styles.beaconHalo} cx="290" cy="291" r="15" fill="#ad8bff" />
                <circle className={styles.beaconRing} cx="290" cy="291" r="14" stroke="#bca5ff" strokeWidth="1" />
                <circle cx="290" cy="291" r="14" stroke="#ae9cfb" strokeOpacity=".3" />
                <circle className={styles.beaconCore} cx="290" cy="291" r="7" fill="#e6ddff" />
                <path d="M112 188v-43m-10-5 20-10v13l-20 10Z" stroke="#b3a4e5" fill="#312843" />
                <path d="M397 191v-49m-9-10 18-10v19l-18 10Z" fill="#a295d4" stroke="#b3a4e5" />
                <path d="m82 238 10-5m348-43 10-5" stroke="#d3c7ff" strokeWidth="3" />
              </svg>
              <span className={styles.mapLabelOne}><i />{scenario.points[0]}</span>
              <span className={styles.mapLabelTwo}><i />{scenario.points[1]}</span>
              <span className={styles.mapLabelThree}><Icon name="shield" />{scenario.points[2]}</span>
            </div>
            <div className={styles.scenario} id="site-scenario" aria-live="polite" aria-atomic="true">
              <div key={scenario.name}><strong>{scenario.title}</strong><p>{scenario.copy}</p></div>
              <span className={styles.example}>ILLUSTRATION DE NOS MISSIONS</span>
            </div>
          </div>
        </div>
        <div className={styles.heroBottom}><span>LA VIGILANCE AU QUOTIDIEN</span><a href="#solutions">Découvrez l’approche FOLS <span aria-hidden="true">↓</span></a></div>
      </section>

      <section className={styles.trust} aria-label="Les engagements FOLS">
        <div><strong>24<span>h/24</span></strong><p>Une équipe à votre écoute</p></div>
        <div><strong>7<span>j/7</span></strong><p>La sécurité au quotidien</p></div>
        <div><strong>5<span>expertises</span></strong><p>Une réponse adaptée à chaque besoin</p></div>
        <div><Icon name="shield" /><p>Des agents formés.<br /><b>Un engagement humain.</b></p></div>
      </section>

      <section id="solutions" className={styles.solutions} aria-labelledby="solutions-title">
        <div className={styles.container}>
          <div className={styles.sectionHeading} data-reveal>
            <div><span className={styles.kicker}>01 / NOS EXPERTISES</span><h2 id="solutions-title">Chaque besoin mérite<br />sa <em>protection.</em></h2></div>
            <p>Du quotidien aux moments exceptionnels, découvrez les métiers qui donnent du sens à notre engagement.</p>
          </div>
          <div className={styles.serviceExplorer} data-reveal>
            <div className={styles.serviceList} role="group" aria-label="Choisir une expertise">
              {services.map((item, index) => <button key={item.name} type="button" aria-pressed={service === index} aria-controls="service-detail" onClick={() => setService(index)}><span className={styles.serviceNumber}>0{index + 1}</span><Icon name={item.icon} /><span>{item.name}</span><span className={styles.serviceArrow} aria-hidden="true">↗</span></button>)}
            </div>
            <div className={styles.serviceDetail} id="service-detail" aria-live="polite" aria-atomic="true">
              <div key={selected.short} className={styles.detailContent}>
                <div className={styles.detailTop}><span className={styles.serviceBadge}><Icon name={selected.icon} /></span><span>FOLS / {selected.short}</span><span>0{service + 1}</span></div>
                <h3>{selected.title}</h3><p>{selected.description}</p>
                <ul>{selected.features.map((feature) => <li key={feature}><Icon name="check" />{feature}</li>)}</ul>
                <Link href="/demande-devis" className={styles.darkLink}>Étudier mon besoin <Icon name="arrow" /></Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="secteurs" className={styles.sectors} aria-labelledby="sectors-title">
        <div className={`${styles.container} ${styles.sectorGrid}`}>
          <div className={styles.sectorIntro} data-reveal><span className={styles.kicker}>02 / VOTRE ENVIRONNEMENT</span><h2 id="sectors-title">Votre réalité.<br /><em>Notre terrain.</em></h2><p>Un lieu n’est jamais tout à fait comme un autre. Nous prenons le temps de comprendre le vôtre.</p><a href="tel:+33788132645" className={styles.phoneLink}>Échangeons de vive voix <span>07 88 13 26 45 ↗</span></a></div>
          <div className={styles.sectorList} data-reveal>{sectors.map((item, index) => <article className={styles.sectorItem} data-open={sector === index} key={item.title}>
            <h3><button type="button" aria-expanded={sector === index} aria-controls={`sector-panel-${index}`} onClick={() => setSector(sector === index ? null : index)}><span>0{index + 1}</span>{item.title}<span className={styles.plus} aria-hidden="true">{sector === index ? "−" : "+"}</span></button></h3>
            <div id={`sector-panel-${index}`} hidden={sector !== index} className={styles.sectorPanel}><p>{item.description}</p><div className={styles.tags}>{item.tags.map(tag => <span key={tag}>{tag}</span>)}</div><Link href="/demande-devis">Parlons de ce projet <span aria-hidden="true">↗</span></Link></div>
          </article>)}</div>
        </div>
      </section>

      <section id="apropos" className={styles.about} aria-labelledby="about-title">
        <div className={styles.container}>
          <div className={styles.aboutIntro} data-reveal><span className={styles.kicker}>03 / L’ESPRIT FOLS</span><h2 id="about-title">La sécurité est un métier.<br />La confiance, <em>un engagement.</em></h2><p>Au-delà d’une prestation, nous construisons une relation. Avec le sérieux, l’écoute et la discrétion que votre sécurité exige.</p></div>
          <div className={styles.values} data-reveal>
            <article><span>01 — ÉCOUTER</span><h3>Comprendre avant d’agir.</h3><p>Vos contraintes, votre environnement et vos attentes guident notre proposition.</p></article>
            <article><span>02 — PRÉPARER</span><h3>Le bon dispositif.</h3><p>Des missions définies et des agents compétents, préparés à leur environnement.</p></article>
            <article><span>03 — ACCOMPAGNER</span><h3>La confiance dans la durée.</h3><p>Une relation de proximité, fondée sur le dialogue et le professionnalisme.</p></article>
          </div>
          <div className={styles.signature}><span className={styles.signatureMark}>FOLS<span>Security Group</span></span><p>Professionnalisme · Expérience · Intégrité · Discrétion</p></div>
        </div>
      </section>

      <section className={styles.faq} aria-labelledby="faq-title">
        <div className={`${styles.container} ${styles.faqGrid}`}>
          <div data-reveal><span className={styles.kicker}>POUR Y VOIR PLUS CLAIR</span><h2 id="faq-title">Faisons le point.</h2><p>Les premières réponses à vos questions.</p></div>
          <div data-reveal>{questions.map(([question, answer]) => <details className={styles.question} key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div>
        </div>
      </section>

      <section className={styles.contactSection} aria-labelledby="contact-title">
        <div className={`${styles.container} ${styles.contactCard}`} data-reveal>
          <div><span className={styles.kicker}>LE PREMIER PAS, C’EST UN ÉCHANGE.</span><h2 id="contact-title">Et si on parlait<br />de votre <em>tranquillité ?</em></h2><p>Décrivez-nous votre projet. Construisons ensemble la réponse adaptée.</p></div>
          <div className={styles.contactActions}><Link href="/demande-devis" className={styles.primary}>Demander un devis <Icon name="arrow" /></Link><a href="tel:+33788132645">Ou appelez-nous au <strong>07 88 13 26 45</strong></a><span>À votre écoute · 7j/7 et 24h/24</span></div>
        </div>
      </section>
    </main>
  );
}
