import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirectToPath } from "@/lib/redirect";
import { formNumber, formText } from "@/lib/input-validation";
import { rejectCrossSiteRequest } from "@/lib/request-security";

export async function POST(request: Request) {
  const user = await requireApiUser();
  if (user instanceof NextResponse) return user;
  const crossSiteResponse = rejectCrossSiteRequest(request);
  if (crossSiteResponse) return crossSiteResponse;
  const form = await request.formData();
  const action = formText(form, "action", 16) ?? "";

  if (action === "rates") {
    const services = await db.service.findMany({ select: { id: true } });
    for (const service of services) {
      const raw = formNumber(form, `rate_${service.id}`, { min: 0, max: 100_000 });
      if (raw !== null) await db.service.update({ where: { id: service.id }, data: { defaultHourlyRateCents: Math.round(raw * 100) } });
    }
  } else if (action === "legal") {
    for (const key of ["company_name", "siren", "siret", "address", "cnaps_authorization", "legal_notice"]) {
      const value = formText(form, key, key === "legal_notice" ? 10_000 : 500);
      if (value === null) return new NextResponse("Invalid settings value", { status: 422 });
      await db.appSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
    }
  } else return new NextResponse("Invalid settings action", { status: 422 });

  return redirectToPath("/admin/settings");
}
