import { defineConfig, devices } from "playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: ".test-artifacts/results",
  timeout: 30_000,
  retries: 0,
  reporter: [
    ["list"],
    ["html", { outputFolder: ".test-artifacts/report", open: "never" }],
  ],
  use: {
    baseURL: "http://localhost:3001",
    screenshot: "only-on-failure",
    video: "off",
    trace: "off",
    actionTimeout: 10_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
