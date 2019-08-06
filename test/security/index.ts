import chai = require("chai");
chai.should();

import { DeviceCheck } from "@aerogear/security";
import { device } from "../../util/device";

describe("Device Security", () => {
    it("should be possible to run `rooted` check", async () => {
        const result = await device.execute(async modules => {
            const { SecurityService, DeviceCheckType } = modules[
                "@aerogear/security"
            ];
            const securityService = new SecurityService();

            const result = await securityService.check(
                DeviceCheckType.rootEnabled
            );

            return result;
        });

        // From BrowserStack support: "...there are certain changes made in the boot images
        // of our devices. Due to those changes, a few plugins report the device as rooted
        // when in reality it is not..."
        // Because of that BrowserStack Android device we use for testing is reported as rooted
        // by the plugin we use. So we actually check that Android device is rooted and iOS is not.
        result.passed.should.equal(process.env.MOBILE_PLATFORM !== "ios");
    });

    it("should be possible to run `emulator` check", async () => {
        const result = await device.execute(async modules => {
            const { SecurityService, DeviceCheckType } = modules[
                "@aerogear/security"
            ];
            const securityService = new SecurityService();

            const result = await securityService.check(
                DeviceCheckType.isEmulator
            );

            return result;
        });

        result.passed.should.equal(false);
    });

    it("should be possible to run `debugMode` check", async () => {
        const result = await device.execute(async modules => {
            const { SecurityService, DeviceCheckType } = modules[
                "@aerogear/security"
            ];
            const securityService = new SecurityService();

            const result = await securityService.check(
                DeviceCheckType.debugModeEnabled
            );

            return result;
        });

        result.passed.should.equal(true);
    });

    it("should be possible to run `screenLock` check", async function() {
        const result = await device.execute(async modules => {
            const { SecurityService, DeviceCheckType } = modules[
                "@aerogear/security"
            ];
            const securityService = new SecurityService();

            const result = await securityService.check(
                DeviceCheckType.screenLockEnabled
            );

            return result;
        });

        result.passed.should.equal(false);
    });

    it("should be possible to run multiple checks", async () => {
        const result = await device.execute(async modules => {
            const { SecurityService, DeviceCheckType } = modules[
                "@aerogear/security"
            ];
            const securityService = new SecurityService();

            const result = await securityService.checkMany(
                DeviceCheckType.debugModeEnabled,
                DeviceCheckType.rootEnabled,
                DeviceCheckType.isEmulator,
                DeviceCheckType.screenLockEnabled
            );

            return result;
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

    it("should be possible to run custom check", async () => {
        const result = await device.execute(async modules => {
            class CustomDeviceCheck implements DeviceCheck {
                public name = "My Custom Check";

                public async check() {
                    return {
                        name: "My Custom Check",
                        passed: true,
                    };
                }
            }

            const { SecurityService } = modules["@aerogear/security"];
            const securityService = new SecurityService();

            const result = await securityService.check(new CustomDeviceCheck());

            return result;
        });

        result.passed.should.equal(true);
    });
});
