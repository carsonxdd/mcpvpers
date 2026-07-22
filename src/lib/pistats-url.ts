import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

// SSRF guards for tenant-supplied PiStatsAPI endpoints. Plain http MUST stay
// allowed — real PiStatsAPI deployments (game-host panels like DatHost) serve
// stats over http on a bare port. The protection model is: no loopback, no
// private/reserved ranges, checked both at save time (literal IPs) and at
// request time (DNS resolution). Residual DNS-rebinding TOCTOU between the
// lookup and the fetch is accepted for v1 — nothing sensitive on this host
// listens unauthenticated on loopback HTTP.

function isPrivateIPv4(ip: string): boolean {
  const [a, b] = ip.split(".").map(Number);
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT 100.64/10
  if (a === 169 && b === 254) return true; // link-local / cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

export function isPrivateIp(addr: string): boolean {
  if (isIP(addr) === 4) return isPrivateIPv4(addr);
  const lower = addr.toLowerCase();
  if (lower === "::" || lower === "::1") return true;
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // fc00::/7
  if (/^fe[89ab]/.test(lower)) return true; // fe80::/10
  // IPv4-mapped: URL normalization may leave dotted-quad ("::ffff:192.168.1.1")
  // or hex-group form ("::ffff:c0a8:101") — treat both as the embedded IPv4.
  if (lower.startsWith("::ffff:")) {
    const rest = lower.slice(7);
    if (rest.includes(".")) return isPrivateIPv4(rest);
    const groups = rest.split(":");
    if (groups.length === 2) {
      const hi = parseInt(groups[0], 16);
      const lo = parseInt(groups[1], 16);
      if (!Number.isNaN(hi) && !Number.isNaN(lo)) {
        return isPrivateIPv4(`${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`);
      }
    }
  }
  return false;
}

export type UrlValidation = { ok: true; url: string } | { ok: false; error: string };

// URL.hostname wraps IPv6 literals in brackets ("[::1]"); isIP needs them bare.
function bareHostname(host: string): string {
  return host.startsWith("[") && host.endsWith("]") ? host.slice(1, -1) : host;
}

// Save-time validation. Returns a normalized base URL (no trailing slash,
// credentials/query/hash stripped).
export function validatePistatsUrl(raw: string): UrlValidation {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return { ok: false, error: "Enter a full URL, e.g. http://your-host.example.net:17249" };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, error: "URL must start with http:// or https://" };
  }
  const host = bareHostname(url.hostname.toLowerCase());
  if (!host) return { ok: false, error: "URL needs a hostname." };
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".")
  ) {
    return { ok: false, error: "Local hostnames aren't allowed — use your server's public address." };
  }
  if (isIP(host) && isPrivateIp(host)) {
    return { ok: false, error: "Private and reserved IP addresses aren't allowed." };
  }
  const pathname = url.pathname.replace(/\/+$/, "");
  return { ok: true, url: `${url.protocol}//${url.host}${pathname}` };
}

// Request-time defense in depth: resolve the hostname and reject if ANY
// address is private/reserved. Throws on violation or resolution failure.
export async function assertPublicHost(urlStr: string): Promise<void> {
  const host = bareHostname(new URL(urlStr).hostname);
  if (isIP(host)) {
    if (isPrivateIp(host)) throw new Error("private address");
    return;
  }
  const addrs = await lookup(host, { all: true });
  if (addrs.length === 0) throw new Error("unresolvable host");
  for (const { address } of addrs) {
    if (isPrivateIp(address)) throw new Error("private address");
  }
}
