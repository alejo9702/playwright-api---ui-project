import {test, expect, request, APIRequestContext} from "@playwright/test";
import {ApiHelper} from "../utils/api-helper";


test.describe("API highlight basketball", () => {
    let api: ApiHelper;
    let season: number;
    let leagueId: number;

    test.beforeAll(async () => {
        api = await ApiHelper.create(
            "https://basketball.highlightly.net", {
                'X-RapidAPI-Key': process.env.RAPID_API_KEY!,
            }
        );
    })

    test.afterAll(async () => {
        await api.dispose();
    });


    test("@api GET /TEAMS", async () => {

        const queryParams = {
            limit: "40",
            offset: "20",
            name: "Nanterre"
        }
        const response = await api.get(`/TEAMS`, {query: queryParams});

        const responseBody = await response.json();
        console.log(response.ok())
        console.info(
            "Response status:",
            response.status(),
            "Response body:",
            JSON.stringify(responseBody, null, 2)
        );

        expect(response.ok()).toBe(true)
    });

    test("get stats and last season standings  ", async () => {
        let league: number, seasonId: number;


        await test.step("@api  @basketball GET /teams/statics", async () => {
            const res = await api.get("/teams/statistics/124179", {query: {fromDate: "2024-08-01"}});
            const body = await res.json()

            expect(body[0]).toHaveProperty("leagueId");
            expect(body[0]).toHaveProperty("leagueName");
            expect(body[0]).toHaveProperty("season");
            expect(body[0]).toHaveProperty("total");
            expect(body[0]).toHaveProperty("home");
            expect(body[0]).toHaveProperty("away");

            ({leagueId: league, season: seasonId} = body.at(-1)!);

            //   console.info("response:" + JSON.stringify(body,null, 2));
            //  console.log("leagueId: ", league, "seasonId: ", seasonId);
        })

        await test.step("@api  @basketball GET /standings", async () => {
            const res = await api.get("/standings", {query: {leagueId: league, season: seasonId}})
            const body = await res.json();
            console.info("Response body:", JSON.stringify(body, null, 2));

            expect(res.status(), "to return last season standings").toBe(200);

            expect(body.groups[0].standings.length).toBeGreaterThan(0);
            await api.expectResponseHasField(res,"league")
            expect(/\.(png|jpg|svg)$/i.test(body.league.logo)).toBe(true);

        })

    });

})


//lakers Id= 124179