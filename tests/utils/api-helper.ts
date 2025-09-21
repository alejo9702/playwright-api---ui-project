import {expect, APIRequestContext, request} from '@playwright/test';

export class ApiHelper {
    private context: APIRequestContext;


    static async create(baseUrl: string, headers?: Record<string, string>) {
        const ctx = await request.newContext({baseURL: baseUrl, extraHTTPHeaders: headers})
        return new ApiHelper(ctx)
    }

    constructor(request: APIRequestContext) {
        this.context = request;
    }

    async dispose() {
        await this.context.dispose();
    }

    /**
     * Make a GET request
     */
    async get(
        url: string,
        options?: { query?: Record<string, string | number | boolean>, headers?: Record<string, string> }
    ) {
        const fullUrl = options?.query
            ? `${url}?${new URLSearchParams(
                Object.entries(options.query).map(([k, v]) => [k, String(v)])
            )}`
            : url;

        return this.context.get(fullUrl, {headers: options?.headers});
    }

    /**
     * Make a POST request
     */
    async post(url: string, data?: any, headers?: Record<string, string>) {
        const requestHeaders = {
            'Content-Type': 'application/json',
            ...headers
        };
        return await this.context.post(url, {data, headers: requestHeaders});
    }

    /**
     * Make a PUT request
     */
    async put(url: string, data?: any, headers?: Record<string, string>) {
        const requestHeaders = {
            'Content-Type': 'application/json',
            ...headers
        };
        return await this.context.put(url, {data, headers: requestHeaders});
    }

    /**
     * Make a PATCH request
     */
    async patch(url: string, data?: any, headers?: Record<string, string>) {
        const requestHeaders = {
            'Content-Type': 'application/json',
            ...headers
        };
        return await this.context.patch(url, {data, headers: requestHeaders});
    }

    /**
     * Make a DELETE request
     */
    async delete(url: string, headers?: Record<string, string>) {
        return await this.context.delete(url, {headers});
    }

    /**
     * Assert response status code
     */
    async expectStatus(response: any, expectedStatus: number) {
        expect(response.status()).toBe(expectedStatus);
    }

    /**
     * Assert response contains expected data
     */
    async expectResponseContains(response: any, expectedData: any) {
        const responseData = await response.json();
        expect(responseData).toMatchObject(expectedData);
    }

    /**
     * Assert response has specific field
     */
    async expectResponseHasField(response: any, fieldName: string) {
        const responseData = await response.json();
        expect(responseData).toHaveProperty(fieldName);
    }

    /**
     * Assert response field has specific value
     */
    async expectResponseFieldValue(response: any, fieldName: string, expectedValue: any) {
        const responseData = await response.json();
        expect(responseData[fieldName]).toBe(expectedValue);
    }

    /**
     * Assert response array has specific length
     */
    async expectResponseArrayLength(response: any, expectedLength: number) {
        const responseData = await response.json();
        expect(Array.isArray(responseData)).toBe(true);
        expect(responseData).toHaveLength(expectedLength);
    }
} 