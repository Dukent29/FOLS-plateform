import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(); const { id } = await params; const form = await request.formData(); const content = String(form.get("content") ?? "").trim();
  if (!content) return new NextResponse("Empty note", { status: 422 });
  await db.communication.create({ data: { leadId: id, type: "NOTE", content, createdBy: user.name } });
  return NextResponse.redirect(new URL(`/admin/leads/${id}`, request.url), 303);
}
