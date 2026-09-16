import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendCommercialEmail } from "@/lib/mail";
import { redirectToPath } from "@/lib/redirect";
import { formText } from "@/lib/input-validation";
import { isSafeId, rejectCrossSiteRequest } from "@/lib/request-security";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireApiUser();
  if (user instanceof NextResponse) return user;
  const crossSiteResponse = rejectCrossSiteRequest(request);
  if (crossSiteResponse) return crossSiteResponse;
  const { id } = await params;
  if (!isSafeId(id)) return new NextResponse("Invalid lead", { status: 422 });
  const form = await request.formData();
  const subject = formText(form, "subject", 200);
  const message = formText(form, "message", 10_000);
  if (!subject || !message || /[\r\n]/.test(subject)) {
    return new NextResponse("Missing or invalid email content", { status: 422 });
  }

  const lead = await db.lead.findUnique({ where: { id }, include: { contact: true } });
  if (!lead) return new NextResponse("Lead not found", { status: 404 });

  try {
    await sendCommercialEmail({ to: lead.contact.email, subject, text: message });
  } catch (error) {
    if (error instanceof Error && error.message === "SMTP_NOT_CONFIGURED") {
      return new NextResponse("SMTP is not configured. Add SMTP_HOST/USER/PASS to .env.", { status: 503 });
    }
    throw error;
  }

  await db.communication.create({
    data: { leadId: id, type: "EMAIL", content: `Email envoyé — ${subject}\n\n${message}`, createdBy: user.name },
  });
  return redirectToPath(`/admin/leads/${id}`);
}
