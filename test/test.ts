import { device, Device } from "../util/device";

describe("a test in typescript", function() {
  this.timeout(0);

  let _device: Device;

  before("init device", async function() {
    _device = await device();
  });

  it("simple", async function () {
    const result = await _device.execute(function (modules, hello) {
        return hello;
    }, "Hello");
    console.log(`${result} World!`)
  });

  it("run async", async function() {
    const result = await _device.executeAsync(async function() {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return "hello";
    });
    console.log(`=== ${result} ===`);
  });

  it("run script", async function() {
    await _device.execute(
      function(modules, version, namespace, config) {
        const { init } = modules["@aerogear/app"];
        return init({ version, namespace, ...config });
      },
      1,
      "integration",
      { clusterName: "test" }
    );
  });
});
