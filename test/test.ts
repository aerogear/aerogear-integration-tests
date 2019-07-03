import { Device, singletonDevice as bootDevice } from "../util/device";

describe("a test in typescript", function() {
    this.timeout(0);

    let device: Device;

    before("boot device", async () => {
        device = await bootDevice();
    });

    it("simple", async () => {
        const result = await device.execute((modules, hello) => {
            return hello;
        }, "Hello");
        console.log(`${result} World!`);
    });

    it("run async", async () => {
        const result = await device.executeAsync(async () => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return "hello";
        });
        console.log(`=== ${result} ===`);
    });

    it("run script", async () => {
        await device.execute(
            (modules, version, namespace, config) => {
                const { init } = modules["@aerogear/app"];
                return init({ version, namespace, ...config });
            },
            1,
            "integration",
            { clusterName: "test" }
        );
    });
});
