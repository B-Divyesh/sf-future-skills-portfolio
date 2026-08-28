const SLUG = "future-skills-portfolio";
const LICENSE_KEY = `sb_license:${SLUG}`;
const VERDICT_KEY = `sb_license_verdict:${SLUG}`;
const DAY = 86_400_000;

interface Verdict {
  valid: boolean;
  checkedAt: number;
}

export const checkoutUrl = `https://api.sociobot.in/api/v1/products/${SLUG}/checkout`;

export function captureLicense(): void {
  const url = new URL(window.location.href);
  const token = url.searchParams.get("license");
  if (!token) return;
  try {
    localStorage.setItem(LICENSE_KEY, token.trim());
    localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: true, checkedAt: 0 } satisfies Verdict));
  } catch {
    // The free experience remains available when browser storage is blocked.
  }
  url.searchParams.delete("license");
  history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

export function storeLicense(token: string): boolean {
  try {
    localStorage.setItem(LICENSE_KEY, token.trim());
    localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: true, checkedAt: 0 } satisfies Verdict));
    return true;
  } catch {
    return false;
  }
}

export function clearLicense(): void {
  try {
    localStorage.removeItem(LICENSE_KEY);
    localStorage.removeItem(VERDICT_KEY);
  } catch {
    // Nothing else to clear when storage is unavailable.
  }
}

export function hasOptimisticUnlock(): boolean {
  try {
    const token = localStorage.getItem(LICENSE_KEY);
    if (!token) return false;
    const verdict = JSON.parse(localStorage.getItem(VERDICT_KEY) ?? "null") as Verdict | null;
    return verdict?.valid !== false;
  } catch {
    return false;
  }
}

export async function verifyLicense(force = false): Promise<"valid" | "invalid" | "offline" | "none"> {
  let token: string | null;
  try { token = localStorage.getItem(LICENSE_KEY); } catch { return "none"; }
  if (!token) return "none";
  try {
    const cached = JSON.parse(localStorage.getItem(VERDICT_KEY) ?? "null") as Verdict | null;
    if (!force && cached && Date.now() - cached.checkedAt < DAY) return cached.valid ? "valid" : "invalid";
  } catch {
    // A malformed cache should be replaced by a fresh check.
  }
  try {
    const response = await fetch(`https://api.sociobot.in/api/v1/products/${SLUG}/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error("Verification unavailable");
    const result = (await response.json()) as { valid: boolean };
    try { localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: result.valid, checkedAt: Date.now() } satisfies Verdict)); } catch { /* Verification still applies in memory. */ }
    return result.valid ? "valid" : "invalid";
  } catch {
    return "offline";
  }
}
