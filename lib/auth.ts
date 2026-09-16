import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { getStaffRole } from "@/lib/staff-role";

export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) return null;
  const user = await currentUser();
  if (!user) return null;
  return {
    id: user.id,
    name: user.fullName || user.primaryEmailAddress?.emailAddress || "Équipe FOLS",
    role: getStaffRole(user.publicMetadata),
  };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (!user.role) redirect("/access-denied");
  return user;
}

export async function requireApiUser() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.role) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return user;
}
