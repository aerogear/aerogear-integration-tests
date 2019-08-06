require("chai").should();

describe("Device Security with Metrics", function() {
    it("should be possible to report device check via metrics", async function() {
        // @ts-ignore
        await client.executeAsync(async done => {
            const {
                SecurityService,
                DeviceCheckType,
                // @ts-ignore
            } = window.aerogear.agSecurity;
            // @ts-ignore
            const { app } = window.aerogear;
            const securityService = new SecurityService(app.metrics);

            await securityService.checkAndPublishMetric(
                DeviceCheckType.isEmulator
            );

            done();
        });

        // @ts-ignore
        const result = await postgres.query("SELECT * FROM mobileappmetrics");
        const secResult = result.rows.find(row =>
            row.event_type.startsWith("security")
        );

        secResult.data.security.length.should.equal(1);
        secResult.data.security[0].name.should.equal("Emulator Check");
        secResult.data.security[0].passed.should.equal(false);
    });
});
