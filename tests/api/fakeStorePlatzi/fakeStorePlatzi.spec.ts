import {expect} from "@playwright/test";
import {test} from "../../fixtures/platziFakeStore/auth.fixture"

test.describe("@api Platzi Fake Store API", () => {

    test.describe("Platzi Fake Store API using fixture", async () => {

        test("GET profile ", async ({authPlatzi}) => {

            const response = await authPlatzi.get("https://api.escuelajs.co/api/v1/auth/profile")
            const body = await response.json();
            console.log(body);

            expect(response.status()).toBe(200);
        })
    })
    test.describe("Platzi Fake Store API using fixture + apiHelper", async () => {

        test("GET profile ", async ({authApiHelper}) => {
            const response = await authApiHelper.get("https://api.escuelajs.co/api/v1/auth/profile")
            const body = await response.json();
            console.log(body);

            expect(response.status()).toBe(200);
        })
    })
});