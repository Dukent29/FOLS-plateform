import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { db } from "@/lib/db";

const allowed = ["NEW", "QUALIFICATION", "QUOTE_TO_PREPARE", "QUOTE_SENT", "WON", "LOST"] as const;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireApiUser();
  if (user instanceof NextResponse) return user;
  const { id } = await params;
  const form = await request.formData();
  const status = String(form.get("status") ?? "");
  if (!allowed.includes(status as typeof allowed[number])) return new NextResponse("Invalid status", { status: 422 });
  await db.lead.update({ where: { id }, data: { status: status as typeof allowed[number], communications: { create: { type: "SYSTEM", content: `Statut changé vers ${status}.`, createdBy: user.name } } } });
  return NextResponse.redirect(new URL(`/admin/leads/${id}`, request.url), 303);
}
