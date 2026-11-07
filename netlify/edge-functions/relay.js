/**
 * netlify-xhttp-relay
 * A tiny Netlify Edge Function that relays Xray VLESS + XHTTP traffic to your own backend.
 *
 * Environment variables (Site configuration → Environment variables):
 *   BACKEND_URL  Origin of your Xray XHTTP inbound, no trailing slash.   e.g. http://203.0.113.10:8880
 *   XHTTP_PATH   Path of the XHTTP inbound (must match the server).      e.g. /my-secret-path
 *
 * Requests whose path does not start with XHTTP_PATH fall through to the static site in /public.
 *
 * SPDX-License-Identifier: MIT
 */

// Hop-by-hop and proxy headers that must not be forwarded to the origin.
const DROP = new Set([
  "host", "connection", "keep-alive", "proxy-connection", "transfer-encoding",
  "upgrade", "te", "trailer", "forwarded", "x-forwarded-for", "x-forwarded-host",
  "x-forwarded-proto", "x-real-ip", "via",
]);

export default async (request, context) => {
  const backend = (Netlify.env.get("BACKEND_URL") || "").replace(/\/+$/, "");
  const prefix = Netlify.env.get("XHTTP_PATH") || "/";
  const url = new URL(request.url);

  // Not ours: serve the decoy site.
  if (!backend || !url.pathname.startsWith(prefix)) return context.next();

  const headers = new Headers();
  for (const [k, v] of request.headers) {
    const key = k.toLowerCase();
    if (DROP.has(key) || key.startsWith("x-nf-") || key.startsWith("x-country")) continue;
    headers.set(k, v);
  }

  const hasBody = !["GET", "HEAD"].includes(request.method);
  try {
    const upstream = await fetch(backend + url.pathname + url.search, {
      method: request.method,
      headers,
      body: hasBody ? request.body : undefined,
      redirect: "manual",
      ...(hasBody ? { duplex: "half" } : {}),
    });

    const out = new Headers(upstream.headers);
    out.delete("transfer-encoding");
    out.delete("connection");
    out.set("cache-control", "no-store");
    return new Response(upstream.body, { status: upstream.status, headers: out });
  } catch (_err) {
    return new Response("Bad Gateway", { status: 502 });
  }
};
