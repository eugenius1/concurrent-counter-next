import { NextResponse } from "next/server";

/**
 * A 403 for a write that a page on another site made a browser send, else
 * null. Without it any website could press counters, or create them, from
 * each of its visitors' addresses, which no per-address limit would catch.
 *
 * A request with neither header didn't come from a current browser (curl, a
 * script) and is let through: it has only its own address to spend, and the
 * rate limit covers that.
 */
export function rejectCrossSite(request: Request): Response | null {
  const site = request.headers.get("sec-fetch-site");
  const origin = request.headers.get("origin");

  let sameOrigin = true;
  if (site) {
    sameOrigin = site === "same-origin";
  } else if (origin) {
    // Compared with Host rather than a configured URL, so the same build
    // works on every domain it is deployed to
    sameOrigin = URL.parse(origin)?.host === request.headers.get("host");
  }

  return sameOrigin
    ? null
    : NextResponse.json(
        { error: "Cross-site requests are not allowed" },
        { status: 403 },
      );
}
