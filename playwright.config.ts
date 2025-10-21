import {defineConfig, devices} from '@playwright/test';
import * as dotenv from "dotenv";

dotenv.config();
const API_BASE_URL = process.env.API_BASE_URL;
const UI_BASE_URL = process.env.UI_BASE_URL;

export default defineConfig({
    testDir: './tests',
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [
        ['list'],
        ['html', {
            outputFolder: 'playwright-report',
            open: process.env.CI ? 'never' : 'always'
        }]
    ],
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: API_BASE_URL || 'https://jsonplaceholder.typicode.com',

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',
    },

    /* Configure projects for major browsers */
    projects: [

        {
            name: 'api',
            use: {baseURL: API_BASE_URL},
        },

        {
            name: 'chromium',
            use: {...devices['Desktop Chrome'], baseURL: UI_BASE_URL},
        },

        {
            name: 'firefox',
            use: {...devices['Desktop Firefox'], baseURL: UI_BASE_URL},
        },

        {
            name: 'webkit',
            use: {...devices['Desktop Safari'], baseURL: UI_BASE_URL},
        },

        /* Test against mobile viewports. */
        // {
        //   name: 'Mobile Chrome',
        //   use: { ...devices['Pixel 5'] },
        // },
        // {
        //   name: 'Mobile Safari',
        //   use: { ...devices['iPhone 12'] },
        // },

        /* Test against branded browsers. */
        // {
        //   name: 'Microsoft Edge',
        //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
        // },
        // {
        //   name: 'Google Chrome',
        //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
        // },
    ],

    /* Run your local dev server before starting the tests */
    // webServer: {
    //   command: 'npm run start',
    //   url: 'http://127.0.0.1:3000',
    //   reuseExistingServer: !process.env.CI,
    // },
}); 