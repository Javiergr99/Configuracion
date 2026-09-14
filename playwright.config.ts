import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: "html",
  use: {
    baseURL: "http://127.0.0.1:5190",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run build && npm run preview -- --port 5190 --strictPort",
    url: "http://127.0.0.1:5190",
    reuseExistingServer: false,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
