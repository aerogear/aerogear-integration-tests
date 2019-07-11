import { SecurityService } from "@aerogear/security";
import { expect } from "chai";
import { MOBILE_PLATFORM, MobilePlatform } from "../../util/config";
import { bootstrapDevice, Device } from "../../util/device";

interface Universe {
    security: SecurityService;
}

describe("device security", function() {
    this.timeout(0);

    let device: Device;

    before("boot device", async () => {
        device = await bootstrapDevice();
    });

    before("initialize security service", () => {
        device.execute(async (modules, universe: Universe) => {
            const { SecurityService } = modules["@aerogear/security"];

            universe.security = new SecurityService();
        });
    });

    it("should be possible to run rooted check", async () => {
        const result = await device.execute(
            async (modules, { security }: Universe) => {
                const { DeviceCheckType } = modules["@aerogear/security"];

                return await security.check(DeviceCheckType.rootEnabled);
            }
        );

        // From BrowserStack support: "...there are certain changes made in the boot images
        // of our devices. Due to those changes, a few plugins report the device as rooted
        // when in reality it is not..."
        // Because of that BrowserStack Android device we use for testing is reported as rooted
        // by the plugin we use. So we actually check that Android device is rooted and iOS is not.
        if (MOBILE_PLATFORM === MobilePlatform.Android) {
            expect(result.passed).true;
        } else {
            expect(result.passed).false;
        }
    });

    it("should be possible to run emulator check", async () => {
        const result = await device.execute(
            async (modules, { security }: Universe) => {
                const { DeviceCheckType } = modules["@aerogear/security"];

                return await security.check(DeviceCheckType.isEmulator);
            }
        );

        expect(result.passed).false;
    });

    it("should be possible to run debugMode check", async () => {
        const result = await device.execute(
            async (modules, { security }: Universe) => {
                const { DeviceCheckType } = modules["@aerogear/security"];

                return await security.check(DeviceCheckType.debugModeEnabled);
            }
        );

        expect(result.passed).true;
    });

    it("should be possible to run screenLock check", async () => {
        const result = await device.execute(
            async (modules, { security }: Universe) => {
                const { DeviceCheckType } = modules["@aerogear/security"];

                return await security.check(DeviceCheckType.screenLockEnabled);
            }
        );

        expect(result.passed).false;
    });

    it("should be possible to run multiple checks", async () => {
        const result = await device.execute(
            async (modules, { security }: Universe) => {
                const { DeviceCheckType } = modules["@aerogear/security"];

                return await security.checkMany(
                    DeviceCheckType.debugModeEnabled,
                    DeviceCheckType.rootEnabled,
                    DeviceCheckType.isEmulator,
                    DeviceCheckType.screenLockEnabled
                );
            }
        );

        expect(result).deep.equal([
            { name: "Debugger Check", passed: true },
            {
                name: "Rooted Check",
                passed: MOBILE_PLATFORM !== MobilePlatform.IOS,
            },
            { name: "Emulator Check", passed: false },
            { name: "Screen Lock Check", passed: false },
        ]);
    });

    it("should be possible to run custom check", async () => {
        const result = await device.execute(
            async (_, { security }: Universe) => {
                class CustomDeviceCheck {
                    public name: "My Custom Check";

                    public async check() {
                        return {
                            name: "My Custom Check",
                            passed: true,
                        };
                    }
                }

                return await security.check(new CustomDeviceCheck());
            }
        );

        expect(result.passed).true;
    });
});
