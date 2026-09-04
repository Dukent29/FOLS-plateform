import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leadReference } from "@/lib/format";

function text(value: unknown) { return typeof value === "string" ? value.trim() : ""; }

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const companyName = text(body.company);
  const contactName = text(body.contactName);
  const email = text(body.email).toLowerCase();
  const phone = text(body.phone);
  const city = text(body.city);
  const description = text(body.description);
  const consent = text(body.consent);

  if (!companyName || !contactName || !email.includes("@") || !phone || !city || !description || consent !== "yes") {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 422 });
  }

  const serviceId = text(body.serviceId);
  const service = serviceId && serviceId !== "other" ? await db.service.findUnique({ where: { id: serviceId } }) : null;
  const desiredStart = text(body.desiredStart) ? new Date(`${text(body.desiredStart)}T12:00:00`) : null;
  const guardCountRaw = Number(text(body.guardCount));
  const guardCount = Number.isInteger(guardCountRaw) && guardCountRaw > 0 ? guardCountRaw : null;

  const company = await db.company.findFirst({ where: { name: { equals: companyName, mode: "insensitive" } } })
    ?? await db.company.create({ data: { name: companyName, city } });
  const [firstName, ...rest] = contactName.split(/\s+/);
  const contact = await db.contact.findFirst({ where: { companyId: company.id, email: { equals: email, mode: "insensitive" } } })
    ?? await db.contact.create({ data: { companyId: company.id, firstName, lastName: rest.join(" ") || null, email, phone } });

  const lead = await db.lead.create({
    data: {
      reference: leadReference(), companyId: company.id, contactId: contact.id,
      serviceId: service?.id ?? null, serviceLabel: service?.name ?? "Besoin à définir",
      siteType: text(body.siteType) || null, city, desiredStart,
      timeRange: text(body.timeRange) || null, duration: text(body.duration) || null,
      guardCount, urgency: text(body.urgency) || "NORMAL", description,
      communications: { create: { type: "SYSTEM", content: "Demande créée depuis le site public." } },
    },
  });

  return NextResponse.json({ ok: true, reference: lead.reference }, { status: 201 });
}
