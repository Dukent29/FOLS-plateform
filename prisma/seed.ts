import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL missing");
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  const services = [
    ["APS", "aps", "Agents de prévention et de sécurité pour domiciles, entreprises et sites événementiels."],
    ["Événementiel & salon", "evenementiel-salon", "Sécurité des biens et des personnes lors de salons et événements."],
    ["Agent cynophile", "agent-cynophile", "Missions d’interception, de soutien et de protection des biens et des personnes."],
    ["Intervention sur alarme", "intervention-alarme", "Intervention de sécurité pour domiciles, entreprises et sites événementiels."],
    ["Sécurité incendie", "securite-incendie", "Agents SSIAP pour la sécurité incendie et l’assistance à la personne."],
  ] as const;
  await db.service.updateMany({ where: { slug: { in: ["surveillance-gardiennage", "controle-acces", "securite-evenementielle", "rondes-prevention", "sites-chantiers"] } }, data: { active: false } });
  for (const [name, slug, description] of services) await db.service.upsert({ where: { slug }, update: { name, description, active: true }, create: { name, slug, description, defaultHourlyRateCents: null } });

  const settings = {
    company_name: "FOLS SECURITY GROUP", siren: "888 385 721", siret: "888 385 721 00012",
    address: "9 rue du Commandant Letellier, 27000 Évreux", cnaps_authorization: "AUT-027-2119-11-24-20200757763",
    legal_notice: "L’autorisation d’exercer ne confère aucune prérogative de puissance publique à l’entreprise ou aux personnes qui en bénéficient. Article 612-14 du code de la sécurité intérieure.",
  };
  for (const [key, value] of Object.entries(settings)) await db.appSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
  console.log("Seed complete. Manage staff accounts and roles in Clerk.");
}

main().finally(() => db.$disconnect());
