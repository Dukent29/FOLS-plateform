import { NextResponse } from "next/server";

/**
 * Redirects only inside this application without trusting Host or proxy
 * headers. Relative Location headers work with an IP address or a domain and
 * prevent host-header injection from selecting an external destination.
 */
export function redirectToPath(pathname: string) {
  if (
    !pathname.startsWith("/") ||
    pathname.startsWith("//") ||
    pathname.includes("\\") ||
    /[\r\n]/.test(pathname)
  ) {
    throw new Error("Redirect destination must be a safe application path");
  }

  return new NextResponse(null, {
    status: 303,
    headers: { Location: pathname },
  });
}
