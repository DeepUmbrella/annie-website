import { defineConfig, devices } from '@playwright/test';

const frontendUrl = process.env.E2E_FRONTEND_URL || 'http://127.0.0.1:3000';
const apiUrl = process.env.E2E_API_URL || 'http://127.0.0.1:3001';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: frontendUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: `VITE_API_URL=${apiUrl} npm run dev`,
    url: frontendUrl,
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
