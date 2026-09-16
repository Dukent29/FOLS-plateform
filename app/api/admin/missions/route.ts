import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { missionReference } from "@/lib/format";
import { redirectToPath } from "@/lib/redirect";
import { formNumber, formText, isIsoDate, isTime } from "@/lib/input-validation";
import { isSafeId, rejectCrossSiteRequest } from "@/lib/request-security";

export async function POST(request: Request) {
  const user = await requireApiUser();
  if (user instanceof NextResponse) return user;
  const crossSiteResponse = rejectCrossSiteRequest(request);
  if (crossSiteResponse) return crossSiteResponse;
  const form = await request.formData();
  const title = formText(form, "title", 120); const location = formText(form, "location", 240); const serviceLabel = formText(form, "serviceLabel", 120);
  const startDate = formText(form, "startDate", 10) ?? ""; const startTime = formText(form, "startTime", 5) ?? "";
  const endDate = formText(form, "endDate", 10) ?? ""; const endTime = formText(form, "endTime", 5) ?? "";
  const startsAt = new Date(`${startDate}T${startTime}`); const endsAt = new Date(`${endDate}T${endTime}`);
  const requiredPersonnel = formNumber(form, "requiredPersonnel", { min: 1, max: 500, integer: true }); const quoteId = formText(form, "quoteId", 64) || null; const companyId = formText(form, "companyId", 64) || null;
  const instructions = formText(form, "instructions", 5_000);
  if (!title || !location || !serviceLabel || !isIsoDate(startDate) || !isIsoDate(endDate) || !isTime(startTime) || !isTime(endTime) || Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || endsAt <= startsAt || requiredPersonnel === null || instructions === null || (quoteId !== null && !isSafeId(quoteId)) || (companyId !== null && !isSafeId(companyId))) return new NextResponse("Invalid mission", { status: 422 });
  await db.mission.create({ data: { reference: missionReference(), quoteId, companyId, title, location, serviceLabel, startsAt, endsAt, requiredPersonnel, instructions: instructions || null } });
  return redirectToPath("/admin/planning");
}
