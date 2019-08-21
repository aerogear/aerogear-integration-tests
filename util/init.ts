import { AeroGearApp } from "@aerogear/app";
import { config as mobileServices } from "../config/mobile-services";
import { device } from "./device";
import { postgres } from "./postgres";

interface Universe {
    app: AeroGearApp;
}

before("Initialize appium", async function() {
    this.timeout(0);

    // wait for the device to be initialized
    await device.init();
});

before("Wait for cordova device ready", async function() {
    this.timeout(0);

    await device.execute(async () => {
        await new Promise(resolve => {
            document.addEventListener("deviceready", resolve, false);
        });
    });
});

before("connect to postgres", async () => {
    await postgres.connect();
});

before("reset metrics db", async () => {
    await postgres.query("DELETE FROM mobileappmetrics");
});

before("Initialize aerogear-js-sdk", async () => {
    await device.execute(async (modules, universe: Universe, config) => {
        const { init } = modules["@aerogear/app"];
        universe.app = init(config);
    }, mobileServices);
});

after("Close appium session", async () => {
    await device.close();
});

after("close postgres connection", async () => {
    await postgres.end();
});

export { Universe as GlobalUniverse };
