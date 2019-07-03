

describe("a test in typescript", () => {

    it("run script", async () => {

        console.log("hello");

        console.log(await browser.execute(() => {
            // return Object.keys(window);
            const app = require("@aerogear/app");

            return Object.keys(app);
        }));

    });

});