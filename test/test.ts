import { execute } from "../util/execute";

// import * as aerogearApp from "@aerogear/app";

describe("a test in typescript", () => {
  it("run script", async () => {

    await execute(
      browser,
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
