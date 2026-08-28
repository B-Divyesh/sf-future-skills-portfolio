import { defineConfig } from "vite";
import staticWebAppConfig from "./public/staticwebapp.config.json";

const securityHeaders = staticWebAppConfig.globalHeaders;

export default defineConfig({
  // Mirror Azure Static Web Apps' production CSP in local and preview servers,
  // so browser tests catch CSP regressions before deployment.
  server: { headers: securityHeaders },
  preview: { headers: securityHeaders },
  build: {
    target: "es2022",
    sourcemap: true,
    assetsInlineLimit: 4096,
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
