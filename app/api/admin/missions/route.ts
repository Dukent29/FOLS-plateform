import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { missionReference } from "@/lib/format";

export async function POST(request: Request) {
  await requireUser(); const form = await request.formData();
  const title = String(form.get("title") ?? "").trim(); const location = String(form.get("location") ?? "").trim(); const serviceLabel = String(form.get("serviceLabel") ?? "").trim();
  const startDate = String(form.get("startDate") ?? ""); const startTime = String(form.get("startTime") ?? "");
  const endDate = String(form.get("endDate") ?? ""); const endTime = String(form.get("endTime") ?? "");
  const startsAt = new Date(`${startDate}T${startTime}`); const endsAt = new Date(`${endDate}T${endTime}`);
  const requiredPersonnel = Math.max(1, Math.round(Number(form.get("requiredPersonnel") ?? 1))); const quoteId = String(form.get("quoteId") ?? "") || null; const companyId = String(form.get("companyId") ?? "") || null;
  if (!title || !location || !serviceLabel || Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || endsAt <= startsAt) return new NextResponse("Invalid mission", { status: 422 });
  await db.mission.create({ data: { reference: missionReference(), quoteId, companyId, title, location, serviceLabel, startsAt, endsAt, requiredPersonnel, instructions: String(form.get("instructions") ?? "").trim() || null } });
  return NextResponse.redirect(new URL("/admin/planning", request.url), 303);
}
