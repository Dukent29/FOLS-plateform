import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendCommercialEmail } from "@/lib/mail";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireApiUser();
  if (user instanceof NextResponse) return user;
  const { id } = await params;
  const form = await request.formData();
  const subject = String(form.get("subject") ?? "").trim();
  const message = String(form.get("message") ?? "").trim();
  if (!subject || !message) return new NextResponse("Missing email content", { status: 422 });

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
  return NextResponse.redirect(new URL(`/admin/leads/${id}`, request.url), 303);
}
