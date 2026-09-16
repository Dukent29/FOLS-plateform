import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { db } from "@/lib/db";

const allowed = ["DRAFT", "SENT", "ACCEPTED", "REFUSED", "EXPIRED"] as const;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireApiUser();
  if (user instanceof NextResponse) return user;
  const { id } = await params;
  const form = await request.formData();
  const status = String(form.get("status") ?? "");
  const leadId = String(form.get("leadId") ?? "") || null;
  if (!allowed.includes(status as typeof allowed[number])) return new NextResponse("Invalid status", { status: 422 });

  const quote = await db.quote.update({ where: { id }, data: { status: status as typeof allowed[number] } });
  if (leadId) {
    const leadStatus = status === "SENT" ? "QUOTE_SENT" : status === "ACCEPTED" ? "WON" : status === "REFUSED" ? "LOST" : undefined;
    await db.communication.create({ data: { leadId, type: "SYSTEM", content: `Devis ${quote.reference} : ${status}.`, createdBy: user.name } });
    if (leadStatus) await db.lead.update({ where: { id: leadId }, data: { status: leadStatus } });
  }
  return NextResponse.redirect(new URL(leadId ? `/admin/leads/${leadId}` : "/admin/quotes", request.url), 303);
}
