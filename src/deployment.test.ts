import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type StaticWebAppConfig = {
  globalHeaders: Record<string, string>;
  routes: Array<{ route: string; headers?: Record<string, string>; rewrite?: string }>;
  responseOverrides?: Record<string, { rewrite: string; statusCode: number }>;
};

const config = JSON.parse(readFileSync(new URL("../public/staticwebapp.config.json", import.meta.url), "utf8")) as StaticWebAppConfig;

describe("Azure Static Web Apps release configuration", () => {
  it("keeps a strict CSP while allowing no inline style dependency", () => {
    expect(config.globalHeaders["Content-Security-Policy"]).toContain("style-src 'self'");
  });

  it("caches hashed assets immutably while revalidating the service worker and manifest", () => {
    const headersFor = (route: string): Record<string, string> | undefined => config.routes.find((item) => item.route === route)?.headers;
    expect(headersFor("/assets/*")?.["Cache-Control"]).toBe("public, max-age=31536000, immutable");
    expect(headersFor("/sw.js")?.["Cache-Control"]).toBe("no-cache, must-revalidate");
    expect(headersFor("/manifest.webmanifest")?.["Cache-Control"]).toBe("no-cache, must-revalidate");
  });

  it("rewrites only real application routes and serves unknown routes as 404", () => {
    const routes = config.routes.map((item) => item.route);
    expect(routes).toEqual(expect.arrayContaining(["/demo", "/privacy", "/terms"]));
    expect(config.responseOverrides?.["404"]).toEqual({ rewrite: "/index.html", statusCode: 404 });
  });
});
