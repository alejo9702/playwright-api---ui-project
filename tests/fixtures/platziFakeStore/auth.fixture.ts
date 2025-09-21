import {test as base} from 'playwright/test'
import {APIRequestContext, expect, request} from "@playwright/test";
import {ApiHelper} from "../../utils/api-helper";


type Fixtures = {
    authPlatzi: APIRequestContext;
    authApiHelper: ApiHelper;
    accessToken: string;
}

const baseUrl = "https://api.escuelajs.co/api/v1/auth/login"

let credentials = {
    "email": process?.env.FAKE_API_PLATZI_USER,
    "password": process?.env.FAKE_API_PLATZI_PASSWORD
}

async function getAccessToken() {
    const loginContext = await request.newContext();
    const authResponse = await loginContext.post(baseUrl, {data: credentials});
    expect(authResponse.status()).toBe(201);

    const body = await authResponse.json();
    await loginContext.dispose();
    return body.access_token;
}

export const test = base.extend<Fixtures>({

    authPlatzi: async ({}, use) => {

        const token = await getAccessToken();
        const authContext = await request.newContext({
            extraHTTPHeaders: {
                Authorization: `Bearer ${token}`
            }
        })
        await use(authContext)
        await authContext.dispose();
    },
    authApiHelper: async ({}, use) => {
        const token = await getAccessToken();

        const api = await ApiHelper.create(baseUrl, {
            Authorization: `Bearer ${token}`
        })

        await use(api)
        await api.dispose();
    },
    accessToken: async ({}, use) => {
        const token = await getAccessToken();
        await use(token);
    }
})