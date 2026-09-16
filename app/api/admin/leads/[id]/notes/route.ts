import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { db } from "@/lib/db";
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
  const content = formText(form, "content", 5_000);
  if (!content) return new NextResponse("Empty note", { status: 422 });
  await db.communication.create({ data: { leadId: id, type: "NOTE", content, createdBy: user.name } });
  return redirectToPath(`/admin/leads/${id}`);
}
