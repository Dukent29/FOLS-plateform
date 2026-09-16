import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "Use the account menu to sign out." }, { status: 410 });
}
