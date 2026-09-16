import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { quoteReference } from "@/lib/format";
import { redirectToPath } from "@/lib/redirect";
import { formNumber, formText } from "@/lib/input-validation";
import { isSafeId, rejectCrossSiteRequest } from "@/lib/request-security";

export async function POST(request: Request) {
  const user = await requireApiUser();
  if (user instanceof NextResponse) return user;
  const crossSiteResponse = rejectCrossSiteRequest(request);
  if (crossSiteResponse) return crossSiteResponse;
  const form = await request.formData();

  const leadId = formText(form, "leadId", 64) || null;
  const companyId = formText(form, "companyId", 64) || null;
  const contactId = formText(form, "contactId", 64) ?? "";
  const serviceId = formText(form, "serviceId", 64) || null;
  const description = formText(form, "description", 1_000);

  const quantity = formNumber(form, "quantity", { min: 1, max: 500, integer: true });
  const hours = formNumber(form, "hours", { min: 0.5, max: 10_000 });
  const unitPrice = formNumber(form, "unitPrice", { min: 0, max: 100_000 });
  const surcharge = formNumber(form, "surcharge", { min: 0, max: 10_000_000 });
  const validDays = formNumber(form, "validDays", { min: 1, max: 365, integer: true });

  if (
    !contactId || !isSafeId(contactId) || !description || quantity === null || hours === null ||
    unitPrice === null || surcharge === null || validDays === null ||
    (leadId !== null && !isSafeId(leadId)) ||
    (companyId !== null && !isSafeId(companyId)) ||
    (serviceId !== null && !isSafeId(serviceId))
  ) {
    return new NextResponse("Invalid quote", { status: 422 });
  }

  const unitPriceCents = Math.round(unitPrice * 100);
  const surchargeCents = Math.round(surcharge * 100);

  const subtotalCents = Math.round(quantity * hours * unitPriceCents + surchargeCents);
  const taxCents = Math.round(subtotalCents * 0.2);
  const totalCents = subtotalCents + taxCents;

  const quote = await db.quote.create({
    data: {
      reference: quoteReference(),
      leadId,
      companyId,
      contactId,
      subtotalCents,
      taxCents,
      totalCents,
      validUntil: new Date(Date.now() + validDays * 86_400_000),
      items: {
        create: {
          serviceId,
          description,
          quantity,
          hours,
          unitPriceCents,
          surchargeCents,
          lineTotalCents: subtotalCents,
        },
      },
    },
  });

  if (leadId) {
    await db.lead.update({
      where: { id: leadId },
      data: {
        status: "QUOTE_TO_PREPARE",
        communications: {
          create: {
            type: "SYSTEM",
            content: `Devis ${quote.reference} créé par ${user.name}.`,
            createdBy: user.name,
          },
        },
      },
    });
  }

  return redirectToPath(leadId ? `/admin/leads/${leadId}` : "/admin/quotes");
}
