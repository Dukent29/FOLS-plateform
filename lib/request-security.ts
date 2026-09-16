import { NextResponse } from "next/server";

function firstHeaderValue(value: string | null) {
  return value?.split(",", 1)[0]?.trim() || null;
}

function requestOrigin(request: Request) {
  const url = new URL(request.url);
  const host =
    firstHeaderValue(request.headers.get("x-forwarded-host")) ??
    firstHeaderValue(request.headers.get("host"));
  const forwardedProtocol = firstHeaderValue(request.headers.get("x-forwarded-proto"));
  const protocol =
    forwardedProtocol === "https" || forwardedProtocol === "http"
      ? forwardedProtocol
      : url.protocol.slice(0, -1);

  return host ? `${protocol}://${host}` : url.origin;
}

/** Rejects browser mutations that did not originate from this application. */
export function rejectCrossSiteRequest(request: Request) {
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return NextResponse.json({ error: "Cross-site request blocked" }, { status: 403 });
  }

  const origin = request.headers.get("origin");
  if (!origin) {
    return NextResponse.json({ error: "Request origin required" }, { status: 403 });
  }

  try {
    if (new URL(origin).origin !== requestOrigin(request)) {
      return NextResponse.json({ error: "Cross-site request blocked" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }

  return null;
}

export function requestClientKey(request: Request) {
  const value =
    firstHeaderValue(request.headers.get("x-real-ip")) ??
    firstHeaderValue(request.headers.get("x-forwarded-for"));

  return value && value.length <= 64 ? value : "unknown-client";
}

export class RequestBodyError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export async function readLimitedJson(request: Request, maxBytes = 32_768): Promise<unknown> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    throw new RequestBodyError("Content-Type must be application/json", 415);
  }

  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new RequestBodyError("Request body too large", 413);
  }

  if (!request.body) throw new RequestBodyError("Request body required", 400);

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > maxBytes) {
      await reader.cancel();
      throw new RequestBodyError("Request body too large", 413);
    }
    chunks.push(value);
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return JSON.parse(new TextDecoder().decode(body));
  } catch {
    throw new RequestBodyError("Invalid JSON body", 400);
  }
}

export function isSafeId(value: string) {
  return /^[A-Za-z0-9_-]{1,64}$/.test(value);
}
