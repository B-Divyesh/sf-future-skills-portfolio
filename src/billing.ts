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
  localStorage.setItem(LICENSE_KEY, token.trim());
  localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: true, checkedAt: 0 } satisfies Verdict));
  url.searchParams.delete("license");
  history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

export function storeLicense(token: string): void {
  localStorage.setItem(LICENSE_KEY, token.trim());
  localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: true, checkedAt: 0 } satisfies Verdict));
}

export function clearLicense(): void {
  localStorage.removeItem(LICENSE_KEY);
  localStorage.removeItem(VERDICT_KEY);
}

export function hasOptimisticUnlock(): boolean {
  const token = localStorage.getItem(LICENSE_KEY);
  if (!token) return false;
  try {
    const verdict = JSON.parse(localStorage.getItem(VERDICT_KEY) ?? "null") as Verdict | null;
    return verdict?.valid !== false;
  } catch {
    return true;
  }
}

export async function verifyLicense(force = false): Promise<"valid" | "invalid" | "offline" | "none"> {
  const token = localStorage.getItem(LICENSE_KEY);
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
    localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: result.valid, checkedAt: Date.now() } satisfies Verdict));
    return result.valid ? "valid" : "invalid";
  } catch {
    return "offline";
  }
}
