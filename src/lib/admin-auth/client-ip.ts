const IPV4_PATTERN = /^(?:\d{1,3}\.){3}\d{1,3}$/;
const IPV6_PATTERN = /^[0-9a-fA-F:]+$/;

function isValidIpv4(ip: string): boolean {
  if (!IPV4_PATTERN.test(ip)) {
    return false;
  }

  return ip.split(".").every((octet) => {
    const value = Number(octet);
    return Number.isInteger(value) && value >= 0 && value <= 255;
  });
}

function isValidIp(ip: string): boolean {
  if (isValidIpv4(ip)) {
    return true;
  }

  return IPV6_PATTERN.test(ip) && ip.includes(":");
}

function firstForwardedIp(value: string): string | null {
  const first = value.split(",")[0]?.trim();
  if (!first || !isValidIp(first)) {
    return null;
  }

  return first;
}

export function getClientIpFromRequest(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ip = firstForwardedIp(forwardedFor);
    if (ip) {
      return ip;
    }
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp && isValidIp(realIp)) {
    return realIp;
  }

  return "unknown";
}
