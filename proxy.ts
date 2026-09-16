import { clerkClient, clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getStaffRole } from "@/lib/staff-role";

const isAdminPage = createRouteMatcher(["/admin(.*)"]);
const isAdminApi = createRouteMatcher(["/api/admin(.*)"]);
const authorizedParties = process.env.CLERK_AUTHORIZED_PARTIES
  ?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export default clerkMiddleware(async (auth, request) => {
  if (!isAdminPage(request) && !isAdminApi(request)) return;
  const { userId, redirectToSignIn } = await auth();
  if (!userId) {
    if (isAdminApi(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return redirectToSignIn();
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  if (!getStaffRole(user.publicMetadata)) {
    if (isAdminApi(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return new NextResponse(null, { status: 307, headers: { Location: "/access-denied" } });
  }
}, {
  contentSecurityPolicy: { strict: true },
  ...(authorizedParties?.length ? { authorizedParties } : {}),
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
