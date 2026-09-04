import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { quoteReference } from "@/lib/format";

export async function POST(request: Request) {
  const user = await requireUser();
  const form = await request.formData();

  const leadId = String(form.get("leadId") ?? "") || null;
  const companyId = String(form.get("companyId") ?? "") || null;
  const contactId = String(form.get("contactId") ?? "");
  const serviceId = String(form.get("serviceId") ?? "") || null;
  const description = String(form.get("description") ?? "").trim();

  const quantity = Math.max(1, Number(form.get("quantity") ?? 1));
  const hours = Math.max(0.5, Number(form.get("hours") ?? 1));
  const unitPriceCents = Math.max(0, Math.round(Number(form.get("unitPrice") ?? 0) * 100));
  const surchargeCents = Math.max(0, Math.round(Number(form.get("surcharge") ?? 0) * 100));
  const validDays = Math.max(1, Number(form.get("validDays") ?? 30));

  if (!contactId || !description || !Number.isFinite(hours) || !Number.isFinite(quantity)) {
    return new NextResponse("Invalid quote", { status: 422 });
  }

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
          quantity: Math.round(quantity),
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

  return NextResponse.redirect(new URL(leadId ? `/admin/leads/${leadId}` : "/admin/quotes", request.url), 303);
}
