import { expect } from "chai";
import { bootstrapDevice, Device } from "../../util/device";
import { initMetricsDB, MetricsDB } from "../../util/metricsdb";
import {
    generateMetricsService,
    generateMobileServices,
} from "../../util/mobileServices";

describe("security metrics", function() {
    this.timeout(0);

    let device: Device;
    let metricsdb: MetricsDB;

    before("boot device", async () => {
        device = await bootstrapDevice();
    });

    before("initialize metricsdb", async () => {
        metricsdb = await initMetricsDB();
    });

    after("close metricsdb", async () => {
        await metricsdb.client.end();
    });

    before("clean mobileappmetrics table", async () => {
        await metricsdb.deleteMobileAppMetrics();
    });

    before("wait for device is ready", async () => {
        await device.execute(async () => {
            await new Promise(resolve => {
                document.addEventListener("deviceready", resolve, false);
            });
        });
    });

    it("should be possible to report device check via metrics", async () => {
        const mobileServices = generateMobileServices([
            generateMetricsService(),
        ]);

        await device.execute(async (modules, _, mobileServices) => {
            const { SecurityService, DeviceCheckType } = modules[
                "@aerogear/security"
            ];
            const { init } = modules["@aerogear/app"];

            const app = init(mobileServices);

            const security = new SecurityService(app.metrics);

            await security.checkAndPublishMetric(DeviceCheckType.isEmulator);
        }, mobileServices);

        const result = await metricsdb.selectMobileAppMetrics();

        const security = result.rows.find(
            row => row.event_type.trim() === "security"
        );

        expect(security).to.exist;
        expect(security.data.security.length).to.equal(1);
        expect(security.data.security[0].name).to.equal("Emulator Check");
        expect(security.data.security[0].passed).to.equal(false);
    });
});
