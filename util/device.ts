import * as path from "path";
import { BrowserObject, remote } from "webdriverio";
import { modules } from "../app/modules";
import {
    BROWSERSTACK_APP,
    BROWSERSTACK_KEY,
    BROWSERSTACK_USER,
    MOBILE_DEVICE,
    MOBILE_PLATFORM,
    MOBILE_PLATFORM_VERSION,
    MobilePlatform,
} from "./config";
import { homedir } from "os";

type Modules = typeof modules;

interface Universe {
    [key: string]: any;
}

export class Device {
    public browser: BrowserObject;

    constructor(browser: BrowserObject) {
        browser.setTimeout({
            script: 24 * 60 * 60 * 1000,
        });

        this.browser = browser;
    }

    /**
     * This is a wrap around the webdriver.io executeAsync() method
     * thats had few handy helpers and typescript support.
     */
    public async execute<T, A extends any[]>(
        script: (
            modules: Modules,
            universe: Universe,
            ...args: A
        ) => Promise<T>,
        ...args: A
    ): Promise<T> {
        const [error, result] = await this.browser.executeAsync(
            `
            var _this = null;
            var done = arguments[arguments.length - 1];
            var args = [window.modules, window.universe].concat(Array.from(arguments));
            (${script}).apply(null, args)
                .then(function (result) { 
                    done([null, result]); 
                })
                .catch(function (error) {
                    setTimeout(function () { throw error; }, 10);
                    done([error.toString(), null]); 
                });
            `,
            ...args
        );

        if (error !== null) {
            // Report error with full console logs.
            // Very handy because it allows to print anything
            // using console.log() and it will be collected and reported back.
            const console = (await this.browser.getLogs("browser"))
                .map((log: any) => `        ${log.level}: ${log.message}`)
                .join("\n");

            throw new Error(`${error}\n\n      Console:\n${console}\n`);
        }

        return result;
    }
}

function generateOptions(): WebdriverIO.RemoteOptions {
    const defaults: WebdriverIO.RemoteOptions = {
        capabilities: {
            autoWebview: true,
        },
        logLevel: "error",
    };

    if (BROWSERSTACK_APP !== undefined) {
        // Test using browserstack

        if (BROWSERSTACK_USER === undefined || BROWSERSTACK_KEY === undefined) {
            throw new Error(
                "BROWSERSTACK_USER or BROWSERSTACK_KEY are undefined set them or unset BROWSERSTACK_APP to test locally"
            );
        }

        return {
            ...defaults,
            capabilities: {
                ...defaults.capabilities,
                app: BROWSERSTACK_APP,
                // @ts-ignore
                "browserstack.appium_version": "1.9.1",
                "browserstack.debug": true,
                "browserstack.key": BROWSERSTACK_KEY,
                "browserstack.local": "true",
                "browserstack.networkLogs": true,
                "browserstack.user": BROWSERSTACK_USER,
                device: MOBILE_DEVICE,
                os_version: MOBILE_PLATFORM_VERSION,
                project: "AeroGear Integration Tests",
                real_mobile: "true",
            },
            hostname: "hub-cloud.browserstack.com",
        };
    } else {
        // Test using local appium

        if (MOBILE_PLATFORM === MobilePlatform.IOS) {
            throw new Error("local tests on iOS is ont yet supported");
        }

        return {
            ...defaults,
            capabilities: {
                ...defaults.capabilities,
                app: path.join(
                    __dirname,
                    "../platforms/android/app/build/outputs/apk/debug/app-debug.apk"
                ),
                automationName: "UiAutomator2",
                deviceName: "Any Connected Devices",
                platformName: "Android",
                platformVersion: "9",
            },
            hostname: "localhost",
            port: 4723,
        };
    }
}

async function initDevice(): Promise<Device> {
    const browser = await remote(generateOptions());
    return new Device(browser);
}

let device: Device;

export async function bootstrapDevice(): Promise<Device> {
    if (device === undefined) {
        device = await initDevice();
    }
    return device;
}
