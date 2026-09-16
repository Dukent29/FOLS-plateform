import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const user = await requireApiUser();
  if (user instanceof NextResponse) return user;
  const form = await request.formData();
  const action = String(form.get("action") ?? "");

  if (action === "rates") {
    const services = await db.service.findMany({ select: { id: true } });
    for (const service of services) {
      const raw = Number(form.get(`rate_${service.id}`));
      if (Number.isFinite(raw) && raw >= 0) await db.service.update({ where: { id: service.id }, data: { defaultHourlyRateCents: Math.round(raw * 100) } });
    }
  } else if (action === "legal") {
    for (const key of ["company_name", "siren", "siret", "address", "cnaps_authorization", "legal_notice"]) {
      const value = String(form.get(key) ?? "").trim();
      await db.appSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
    }
  } else return new NextResponse("Invalid settings action", { status: 422 });

  return NextResponse.redirect(new URL("/admin/settings", request.url), 303);
}
