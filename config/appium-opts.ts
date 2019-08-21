import path = require("path");
import { Options } from "webdriver";

let opts: Options & { capabilities: { [key: string]: any } };
if (process.env.LOCAL_APPIUM === "true") {
    opts = {
        port: 4723,
        logLevel: "error",
        capabilities: {
            platformName: "Android",
            platformVersion: "9",
            deviceName: "Android Emulator",
            app: path.join(
                __dirname,
                "../testing-app/platforms/android/app/build/outputs/apk/debug/app-debug.apk"
            ),
            automationName: "UiAutomator2",
            autoWebview: true,
        },
    };
} else {
    opts = {
        hostname: "hub-cloud.browserstack.com",
        logLevel: "error",
        capabilities: {
            os_version: process.env.MOBILE_PLATFORM === "ios" ? "12" : "9.0",
            device:
                process.env.MOBILE_PLATFORM === "ios"
                    ? "iPhone XS"
                    : "Google Pixel 3",
            real_mobile: "true",
            project: "AeroGear Integration Tests",
            name: "tests",
            "browserstack.local": "true",
            "browserstack.user": process.env.BROWSERSTACK_USER,
            "browserstack.key": process.env.BROWSERSTACK_KEY,
            app: process.env.BROWSERSTACK_APP,
            autoWebview: true,
            "browserstack.appium_version": "1.9.1",
            "browserstack.networkLogs": true,
            "browserstack.debug": true,
        },
    };
}

export { opts };
