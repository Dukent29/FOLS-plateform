import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirectToPath } from "@/lib/redirect";
import { formText } from "@/lib/input-validation";
import { isSafeId, rejectCrossSiteRequest } from "@/lib/request-security";

const allowed = ["DRAFT", "SENT", "ACCEPTED", "REFUSED", "EXPIRED"] as const;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireApiUser();
  if (user instanceof NextResponse) return user;
  const crossSiteResponse = rejectCrossSiteRequest(request);
  if (crossSiteResponse) return crossSiteResponse;
  const { id } = await params;
  if (!isSafeId(id)) return new NextResponse("Invalid quote", { status: 422 });
  const form = await request.formData();
  const status = formText(form, "status", 32) ?? "";
  if (!allowed.includes(status as typeof allowed[number])) return new NextResponse("Invalid status", { status: 422 });

  const quote = await db.quote.update({ where: { id }, data: { status: status as typeof allowed[number] } });
  const leadId = quote.leadId;
  if (leadId) {
    const leadStatus = status === "SENT" ? "QUOTE_SENT" : status === "ACCEPTED" ? "WON" : status === "REFUSED" ? "LOST" : undefined;
    await db.communication.create({ data: { leadId, type: "SYSTEM", content: `Devis ${quote.reference} : ${status}.`, createdBy: user.name } });
    if (leadStatus) await db.lead.update({ where: { id: leadId }, data: { status: leadStatus } });
  }
  return redirectToPath(leadId ? `/admin/leads/${leadId}` : "/admin/quotes");
}
