import chai = require("chai");
chai.should();

import { device } from "../../util/device";
import { GlobalUniverse } from "../../util/init";
import { postgres } from "../../util/postgres";

describe("Device Security with Metrics", () => {
    it("should be possible to report device check via metrics", async () => {
        await device.execute(async (modules, universe: GlobalUniverse) => {
            const { SecurityService, DeviceCheckType } = modules[
                "@aerogear/security"
            ];
            const { app } = universe;
            const securityService = new SecurityService(app.metrics);

            await securityService.checkAndPublishMetric(
                DeviceCheckType.isEmulator
            );
        });

        const result = await postgres.query("SELECT * FROM mobileappmetrics");
        const secResult = result.rows.find(row =>
            row.event_type.startsWith("security")
        );

        secResult.data.security.length.should.equal(1);
        secResult.data.security[0].name.should.equal("Emulator Check");
        secResult.data.security[0].passed.should.equal(false);
    });
});
