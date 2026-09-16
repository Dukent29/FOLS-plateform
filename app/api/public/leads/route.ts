import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leadReference } from "@/lib/format";
import { isEmail, isIsoDate, isTime, objectText } from "@/lib/input-validation";
import { consumeRateLimit } from "@/lib/rate-limit";
import {
  readLimitedJson,
  rejectCrossSiteRequest,
  requestClientKey,
  RequestBodyError,
} from "@/lib/request-security";

export async function POST(request: Request) {
  const crossSiteResponse = rejectCrossSiteRequest(request);
  if (crossSiteResponse) return crossSiteResponse;

  const rateLimit = consumeRateLimit(`public-lead:${requestClientKey(request)}`, 5, 15 * 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  let parsedBody: unknown;
  try {
    parsedBody = await readLimitedJson(request);
  } catch (error) {
    if (error instanceof RequestBodyError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }

  if (!parsedBody || typeof parsedBody !== "object" || Array.isArray(parsedBody)) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const body = parsedBody as Record<string, unknown>;

  const honeypot = objectText(body, "website", 200);
  if (honeypot) return NextResponse.json({ ok: true, reference: "REQUEST_RECEIVED" }, { status: 201 });

  const companyName = objectText(body, "company", 120);
  const contactName = objectText(body, "contactName", 120);
  const rawEmail = objectText(body, "email", 254);
  const email = rawEmail?.toLowerCase() ?? null;
  const phone = objectText(body, "phone", 32);
  const city = objectText(body, "city", 120);
  const description = objectText(body, "description", 4_000);
  const consent = objectText(body, "consent", 8);

  if (!companyName || !contactName || !email || !isEmail(email) || !phone || !city || !description || consent !== "yes") {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 422 });
  }

  const serviceId = objectText(body, "serviceId", 64);
  if (serviceId === null) return NextResponse.json({ error: "Invalid service" }, { status: 422 });
  const service = serviceId && serviceId !== "other"
    ? await db.service.findFirst({ where: { id: serviceId, active: true } })
    : null;
  if (serviceId && serviceId !== "other" && !service) {
    return NextResponse.json({ error: "Invalid service" }, { status: 422 });
  }

  const desiredStartText = objectText(body, "desiredStart", 10);
  if (desiredStartText === null || (desiredStartText && !isIsoDate(desiredStartText))) {
    return NextResponse.json({ error: "Invalid date" }, { status: 422 });
  }
  const desiredStart = desiredStartText ? new Date(`${desiredStartText}T12:00:00`) : null;

  const startTime = objectText(body, "startTime", 5);
  const endTime = objectText(body, "endTime", 5);
  if (startTime === null || endTime === null || (startTime && !isTime(startTime)) || (endTime && !isTime(endTime))) {
    return NextResponse.json({ error: "Invalid time" }, { status: 422 });
  }
  const timeRange = startTime && endTime ? `${startTime} → ${endTime}` : startTime || endTime || null;

  const guardCountText = objectText(body, "guardCount", 4);
  const guardCountRaw = guardCountText ? Number(guardCountText) : null;
  const guardCount = guardCountRaw !== null && Number.isInteger(guardCountRaw) && guardCountRaw >= 1 && guardCountRaw <= 500
    ? guardCountRaw
    : null;
  if (guardCountText && guardCount === null) {
    return NextResponse.json({ error: "Invalid guard count" }, { status: 422 });
  }

  const siteType = objectText(body, "siteType", 120);
  const duration = objectText(body, "duration", 120);
  const urgency = objectText(body, "urgency", 16);
  if (siteType === null || duration === null || !urgency || !["URGENT", "SOON", "NORMAL"].includes(urgency)) {
    return NextResponse.json({ error: "Invalid fields" }, { status: 422 });
  }

  const company = await db.company.findFirst({ where: { name: { equals: companyName, mode: "insensitive" } } })
    ?? await db.company.create({ data: { name: companyName, city } });
  const [firstName, ...rest] = contactName.split(/\s+/);
  const contact = await db.contact.findFirst({ where: { companyId: company.id, email: { equals: email, mode: "insensitive" } } })
    ?? await db.contact.create({ data: { companyId: company.id, firstName, lastName: rest.join(" ") || null, email, phone } });

  const lead = await db.lead.create({
    data: {
      reference: leadReference(), companyId: company.id, contactId: contact.id,
      serviceId: service?.id ?? null, serviceLabel: service?.name ?? "Besoin à définir",
      siteType: siteType || null, city, desiredStart,
      timeRange, duration: duration || null,
      guardCount, urgency, description,
      communications: { create: { type: "SYSTEM", content: "Demande créée depuis le site public." } },
    },
  });

  return NextResponse.json({ ok: true, reference: lead.reference }, { status: 201 });
}
