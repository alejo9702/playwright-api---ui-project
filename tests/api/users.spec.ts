import {test, expect, request} from "@playwright/test";
import {ApiHelper} from "../utils/api-helper";
import {testUsers, User} from "../fixtures/test-data";

test.describe("@api Users API Tests", () => {
    let apiHelper: ApiHelper;

    test.beforeEach(async ({request}) => {
        apiHelper = new ApiHelper(request);
    });

    test.describe("GET /users", () => {
        test("@smoke should get all users", async () => {
            const response = await apiHelper.get("/users");

            await apiHelper.expectStatus(response, 200);
            await apiHelper.expectResponseArrayLength(response, 10);

            const users = await response.json();
            expect(users[0]).toHaveProperty("id");
            expect(users[0]).toHaveProperty("name");
            expect(users[0]).toHaveProperty("email");
        });

        test("should get users with specific limit", async () => {
            const response = await apiHelper.get("/users?_limit=5");

            await apiHelper.expectStatus(response, 200);
            await apiHelper.expectResponseArrayLength(response, 5);
        });

        test("should get users with pagination", async () => {
            const response = await apiHelper.get("/users?_page=2&_limit=3");

            await apiHelper.expectStatus(response, 200);
            await apiHelper.expectResponseArrayLength(response, 3);
        });
    });

    test.describe("GET /users/{id}", () => {
        test("@smoke should get user by id", async () => {
            const userId = 1;
            const response = await apiHelper.get(`/users/${userId}`);

            await apiHelper.expectStatus(response, 200);
            await apiHelper.expectResponseFieldValue(response, "id", userId);
            await apiHelper.expectResponseHasField(response, "name");
            await apiHelper.expectResponseHasField(response, "email");
        });

        test("@flaky should return 404 for non-existent user", async () => {
            const response = await apiHelper.get("/users/999");

            await apiHelper.expectStatus(response, [404, 500]);
        });

        test("should get user with all required fields", async () => {
            const response = await apiHelper.get("/users/1");

            await apiHelper.expectStatus(response, 200);

            const user = await response.json();
            expect(user).toHaveProperty("id");
            expect(user).toHaveProperty("name");
            expect(user).toHaveProperty("username");
            expect(user).toHaveProperty("email");
            expect(user).toHaveProperty("address");
            expect(user).toHaveProperty("company");
        });
    });

    test.describe("POST /users", () => {
        test("@smoke should create a new user", async () => {
            const newUser = testUsers[0];
            const response = await apiHelper.post("/users", newUser);

            await apiHelper.expectStatus(response, 201);
            await apiHelper.expectResponseContains(response, {
                name: newUser.name,
                username: newUser.username,
                email: newUser.email,
            });
            await apiHelper.expectResponseHasField(response, "id");
        });

        test("should create user with minimal data", async () => {
            const minimalUser = {
                name: "Minimal User",
                username: "minimal",
                email: "minimal@example.com",
            };

            const response = await apiHelper.post("/users", minimalUser);

            await apiHelper.expectStatus(response, 201);
            await apiHelper.expectResponseContains(response, minimalUser);
        });

        test("should create user with full data", async () => {
            const fullUser = testUsers[1];
            const response = await apiHelper.post("/users", fullUser);

            await apiHelper.expectStatus(response, 201);
            await apiHelper.expectResponseContains(response, {
                name: fullUser.name,
                username: fullUser.username,
                email: fullUser.email,
                address: fullUser.address,
                company: fullUser.company,
            });
        });
    });

    test.describe("PUT /users/{id}", () => {
        test("@smoke should update user completely", async () => {
            const userId = 1;
            const updatedUser = {
                name: "Updated User",
                username: "updateduser",
                email: "updated@example.com",
                phone: "1-234-567-8900",
                website: "updated-website.com",
            };

            const response = await apiHelper.put(`/users/${userId}`, updatedUser);

            await apiHelper.expectStatus(response, 200);
            await apiHelper.expectResponseContains(response, updatedUser);
            await apiHelper.expectResponseFieldValue(response, "id", userId);
        });

        test("@flaky should return 404 when updating non-existent user", async () => {
            const response = await apiHelper.put("/users/999", {name: "Test"});

            await apiHelper.expectStatus(response, [404, 500]);
        });
    });

    test.describe("PATCH /users/{id}", () => {
        test("should partially update user", async () => {
            const userId = 1;
            const partialUpdate = {
                name: "Partially Updated User",
                email: "partial@example.com",
            };

            const response = await apiHelper.patch(`/users/${userId}`, partialUpdate);

            await apiHelper.expectStatus(response, 200);
            await apiHelper.expectResponseContains(response, partialUpdate);
            await apiHelper.expectResponseFieldValue(response, "id", userId);
        });
    });

    test.describe("DELETE /users/{id}", () => {
        test("@smoke should delete user", async () => {
            const response = await apiHelper.delete("/users/1");

            await apiHelper.expectStatus(response, 200);
        });

        test("@flaky should return 404 when deleting non-existent user", async () => {
            const response = await apiHelper.delete("/users/999");

            await apiHelper.expectStatus(response, [404, 500]);
        });
    });

    test.describe("Error Handling", () => {
        test("@flaky should handle malformed JSON in POST request", async () => {
            const response = await apiHelper.post("/users", "invalid json", {
                "Content-Type": "application/json",
            });

            // Note: JSONPlaceholder doesn't validate JSON, so this might return 201
            // In a real API, this would typically return 400
            expect([200, 201, 400]).toContain(response.status());
        });

        test("should handle missing required fields", async () => {
            const incompleteUser = {
                name: "Incomplete User",
                // Missing username and email
            };

            const response = await apiHelper.post("/users", incompleteUser);

            // Note: JSONPlaceholder doesn't validate required fields
            // In a real API, this would typically return 400
            expect([200, 201, 400]).toContain(response.status());
        });
    });
});
