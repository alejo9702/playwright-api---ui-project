import { chromium, expect } from "@playwright/test";
import fs from "fs";

export default async function globalSetup() {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    const email = `user_${Date.now()}@test.com`;
    const password = "Alrestr123#";
    const displayName = "Alejandro Restrepo";


    await page.goto("https://practicesoftwaretesting.com/auth/register");
    await page.locator('[data-test="first-name"]').click();
    await page.locator('[data-test="first-name"]').fill("Alejandro");
    await page.locator('[data-test="last-name"]').fill("Restrepo");
    await page.locator('[data-test="dob"]').fill("1997-02-17");
    await page.locator('[data-test="street"]').fill("st main street 56");
    await page.locator('[data-test="postal_code"]').fill("94443");
    await page.locator('[data-test="city"]').fill("Sabaneta");
    await page.locator('[data-test="state"]').fill("Antioquia");
    await page.locator('[data-test="country"]').selectOption("CO");
    await page.locator('[data-test="phone"]').fill("573023221450");
    await page.locator('[data-test="email"]').fill(email);
    await page.locator('[data-test="password"]').fill(password);
    await page.locator('[data-test="register-submit"]').click();
    await expect(page).toHaveURL(
        "https://practicesoftwaretesting.com/auth/login"
    );

    fs.mkdirSync("./storage", { recursive: true });
    fs.writeFileSync("./storage/creds.json", JSON.stringify({ email, password, displayName}));

    await browser.close();
}
