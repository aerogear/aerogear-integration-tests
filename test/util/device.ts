import { expect } from "chai";
import { bootDevice, Device } from "../../util/device";

// Test the utils library for integration tests

describe("test device test util", function() {
    this.timeout(0);

    let device: Device;
    before("boot device", async () => {
        device = await bootDevice();
    });

    it("store and read from universe", async () => {
        interface Universe {
            hello: string;
        }

        await device.execute(async (_, universe: Universe, hello) => {
            universe.hello = hello;
        }, "Hello");

        const result = await device.execute(async (_, universe: Universe) => {
            return universe.hello;
        });

        expect(result).to.equal("Hello");
    });

    it("use a module", async () => {
        await device.execute(
            async (modules, _, config) => {
                const { init } = modules["@aerogear/app"];

                init(config);
            },
            { version: 1, namespace: "integration", clusterName: "test" }
        );
    });

    it("use await inside the async function", async () => {
        await device.execute(async () => {
            await new Promise(resolve => setTimeout(resolve, 1000));
        });
    });

    it("throw an exception", async () => {
        let error: Error;
        try {
            await device.execute(async () => {
                throw new Error("a strange exception");
            });
        } catch (e) {
            error = e;
        }
        expect(error.message).contain("a strange exception");
    });
});
