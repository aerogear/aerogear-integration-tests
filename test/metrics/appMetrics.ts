import { expect } from "chai";
import { version as aerogearAppVersion } from "../../node_modules/@aerogear/app/package.json";
import { MOBILE_PLATFORM, MOBILE_PLATFORM_VERSION } from "../../util/config";
import { device } from "../../util/device";
import { initMetricsDB, MetricsDB } from "../../util/metricsdb";
import {
    generateMetricsService,
    generateMobileServices,
} from "../../util/mobileServices";
import { ONE_SECOND, sleep } from "../../util/time";

const VERSION_TABLE = {
    "9.0": "9",
};

describe("app metrics", function() {
    this.timeout(0);

    let metricsdb: MetricsDB;
    before("initialize metricsdb", async () => {
        metricsdb = await initMetricsDB();
    });

    before("clean mobileappmetrics table", async () => {
        await metricsdb.deleteMobileAppMetrics();
    });

    after("close metricsdb", async () => {
        await metricsdb.client.end();
    });

    before("wait for device is ready", async () => {
        await device.execute(async () => {
            await new Promise(resolve => {
                document.addEventListener("deviceready", resolve, false);
            });
        });
    });

    it("initialize app with metrics service", async () => {
        const mobileServices = generateMobileServices([
            generateMetricsService(),
        ]);

        await device.execute(async (modules, _, mobileServices) => {
            const { init } = modules["@aerogear/app"];
            const { expect } = modules["chai"];

            const app = init(mobileServices);

            expect(app.metrics).exist;
        }, mobileServices);
    });

    it("should receive app metrics", async () => {
        // wait for the metrics to be sent to the server
        await sleep(10 * ONE_SECOND);

        const result = await metricsdb.selectMobileAppMetrics();

        expect(result.rowCount).equal(1);

        const metric = result.rows[0];

        expect(metric.event_type)
            .be.a("string")
            .and.satisfy(v => v.startsWith("init"));

        expect(metric.data).deep.equal({
            app: {
                appId: "org.aerogear.integrationtests",
                appVersion: "1.0.0",
                framework: "cordova",
                sdkVersion: aerogearAppVersion,
            },
            device: {
                platform: MOBILE_PLATFORM,
                platformVersion: VERSION_TABLE[MOBILE_PLATFORM_VERSION],
            },
        });
    });
});
