const wdio = require("webdriverio");
const { Client } = require("pg");

const opts = require("../config/appium-opts");
// @ts-ignore
const mobileServices = require("../config/mobile-services");

before("Initialize appium", async function() {
    this.timeout(0);

    // @ts-ignore
    global.client = await wdio.remote(opts);
    // @ts-ignore
    global.client.setAsyncTimeout(30000);
});

before("Wait for cordova device ready", async function() {
    this.timeout(0);

    // @ts-ignore
    await client.executeAsync(async done => {
        // @ts-ignore
        const { deviceIsReady } = window.aerogear;

        if (deviceIsReady) {
            done();
        } else {
            document.addEventListener("deviceready", done, false);
        }
    });
});

before("connect to postgres", async function() {
    // @ts-ignore
    global.postgres = new Client({
        host: process.env.PGHOST,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
    });

    // @ts-ignore
    await global.postgres.connect();
});

before("reset metrics db", async function() {
    // @ts-ignore
    await postgres.query("DELETE FROM mobileappmetrics");
});

before("Initialize aerogear-js-sdk", async function() {
    // @ts-ignore
    client.execute(config => {
        // @ts-ignore
        const { init } = window.aerogear.agApp;
        // @ts-ignore
        window.aerogear.app = init(config);
    }, mobileServices);
});

after("Close appium session", async function() {
    // @ts-ignore
    await client.deleteSession();
});

after("close postgres connection", async function() {
    // @ts-ignore
    await postgres.end();
});
