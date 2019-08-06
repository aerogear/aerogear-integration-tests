require("chai").should();

describe("Device Security", function() {
    it("should be possible to run `rooted` check", async function() {
        // @ts-ignore
        const result = await client.executeAsync(async done => {
            const {
                SecurityService,
                DeviceCheckType,
                // @ts-ignore
            } = window.aerogear.agSecurity;
            const securityService = new SecurityService();

            const result = await securityService.check(
                DeviceCheckType.rootEnabled
            );

            done(result);
        });

        // From BrowserStack support: "...there are certain changes made in the boot images
        // of our devices. Due to those changes, a few plugins report the device as rooted
        // when in reality it is not..."
        // Because of that BrowserStack Android device we use for testing is reported as rooted
        // by the plugin we use. So we actually check that Android device is rooted and iOS is not.
        result.passed.should.equal(process.env.MOBILE_PLATFORM !== "ios");
    });

    it("should be possible to run `emulator` check", async function() {
        // @ts-ignore
        const result = await client.executeAsync(async done => {
            const {
                SecurityService,
                DeviceCheckType,
                // @ts-ignore
            } = window.aerogear.agSecurity;
            const securityService = new SecurityService();

            const result = await securityService.check(
                DeviceCheckType.isEmulator
            );

            done(result);
        });

        result.passed.should.equal(false);
    });

    it("should be possible to run `debugMode` check", async function() {
        // @ts-ignore
        const result = await client.executeAsync(async done => {
            const {
                SecurityService,
                DeviceCheckType,
                // @ts-ignore
            } = window.aerogear.agSecurity;
            const securityService = new SecurityService();

            const result = await securityService.check(
                DeviceCheckType.debugModeEnabled
            );

            done(result);
        });

        result.passed.should.equal(true);
    });

    it("should be possible to run `screenLock` check", async function() {
        // @ts-ignore
        const result = await client.executeAsync(async done => {
            const {
                SecurityService,
                DeviceCheckType,
                // @ts-ignore
            } = window.aerogear.agSecurity;
            const securityService = new SecurityService();

            const result = await securityService.check(
                DeviceCheckType.screenLockEnabled
            );

            done(result);
        });

        result.passed.should.equal(false);
    });

    it("should be possible to run multiple checks", async function() {
        // @ts-ignore
        const result = await client.executeAsync(async done => {
            const {
                SecurityService,
                DeviceCheckType,
                // @ts-ignore
            } = window.aerogear.agSecurity;
            const securityService = new SecurityService();

            const result = await securityService.checkMany(
                DeviceCheckType.debugModeEnabled,
                DeviceCheckType.rootEnabled,
                DeviceCheckType.isEmulator,
                DeviceCheckType.screenLockEnabled
            );

            done(result);
        });

        result.find(r => r.name === "Debugger Check").passed.should.equal(true);
        result
            .find(r => r.name === "Rooted Check")
            .passed.should.equal(process.env.MOBILE_PLATFORM !== "ios");
        result
            .find(r => r.name === "Emulator Check")
            .passed.should.equal(false);
        result
            .find(r => r.name === "Screen Lock Check")
            .passed.should.equal(false);
    });

    it("should be possible to run custom check", async function() {
        // @ts-ignore
        const result = await client.executeAsync(async done => {
            class CustomDeviceCheck {
                // @ts-ignore
                get name() {
                    return "My Custom Check";
                }

                check() {
                    return Promise.resolve({
                        name: "My Custom Check",
                        passed: true,
                    });
                }
            }

            // @ts-ignore
            const { SecurityService } = window.aerogear.agSecurity;
            const securityService = new SecurityService();

            const result = await securityService.check(new CustomDeviceCheck());

            done(result);
        });

        result.passed.should.equal(true);
    });
});
