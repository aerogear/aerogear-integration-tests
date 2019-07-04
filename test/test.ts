import { expect } from "chai";
import { bootstrapDevice as bootDevice, Device } from "../util/device";

describe("a test in typescript", function() {
    this.timeout(0);

    let device: Device;

    before("boot device", async () => {
        device = await bootDevice();
    });

    it("store in universe", async () => {
        await device.execute((_, universe, hello) => {
            universe.hello = hello;
        }, "Hello");
    });

    it("read from universe", async () => {
        const result = await device.execute((_, universe) => {
            return universe.hello;
        });
        expect(result).to.equal("Hello");
    });

    it("use a modules", async () => {
        await device.execute(
            (modules, _, config) => {
                const { init } = modules["@aerogear/app"];
                init(config);
            },
            { version: 1, namespace: "integration", clusterName: "test" }
        );
    });

    it("force the this", async () => {
        await device.executeAsync(async () => {
            await new Promise(resolve => setTimeout(resolve, 1000));
        });
    });

    it("throw an exception", async () => {
        await device.execute(() => {
            throw new Error("a strange exception");
        });
    });

    it("throw an async exception", async () => {
        await device.executeAsync(() => {
            throw new Error("a strange async exception");
        });
    });
});
