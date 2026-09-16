import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirectToPath } from "@/lib/redirect";
import { formText } from "@/lib/input-validation";
import { isSafeId, rejectCrossSiteRequest } from "@/lib/request-security";

const allowed = ["NEW", "QUALIFICATION", "QUOTE_TO_PREPARE", "QUOTE_SENT", "WON", "LOST"] as const;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireApiUser();
  if (user instanceof NextResponse) return user;
  const crossSiteResponse = rejectCrossSiteRequest(request);
  if (crossSiteResponse) return crossSiteResponse;
  const { id } = await params;
  if (!isSafeId(id)) return new NextResponse("Invalid lead", { status: 422 });
  const form = await request.formData();
  const status = formText(form, "status", 32) ?? "";
  if (!allowed.includes(status as typeof allowed[number])) return new NextResponse("Invalid status", { status: 422 });
  await db.lead.update({ where: { id }, data: { status: status as typeof allowed[number], communications: { create: { type: "SYSTEM", content: `Statut changé vers ${status}.`, createdBy: user.name } } } });
  return redirectToPath(`/admin/leads/${id}`);
}
