export function getDeviceLabel(): string {
  if (typeof navigator === "undefined") return "unknown";

  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ??
    navigator.platform ??
    "unknown";

  const browser = (() => {
    const ua = navigator.userAgent;
    if (ua.includes("Edg/")) return "Edge";
    if (ua.includes("Chrome/") && !ua.includes("Edg/")) return "Chrome";
    if (ua.includes("Firefox/")) return "Firefox";
    if (ua.includes("Safari/") && !ua.includes("Chrome/")) return "Safari";
    return "Browser";
  })();

  const label = `${browser} ${platform}`;
  return label.length > 120 ? `${label.slice(0, 117)}...` : label;
}
