import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "Password login has moved to /sign-in." }, { status: 410 });
}
