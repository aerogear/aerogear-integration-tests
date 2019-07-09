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

    public executeAsync<T, A extends any[]>(
        script: (
            modules: Modules,
            universe: Universe,
            ...args: A
        ) => Promise<T>,
        ...args: A
    ): Promise<T> {
        return this.browser.executeAsync(
            (script, ...args) => {
                const closure = new Function(
                    `_this = null; return ${script};`
                )();
                return closure
                    .apply(null, [
                        // @ts-ignore
                        window.modules,
                        // @ts-ignore
                        window.universe,
                        ...args,
                    ])
                    .then(args[args.length - 1]);
            },
            `${script}`,
            ...args
        );
    }

    public execute<T, A extends any[]>(
        script: (modules: Modules, universe: Universe, ...args: A) => T,
        ...args: A
    ): Promise<T> {
        return this.browser.execute(
            (script, ...args) => {
                const closure = new Function(
                    `_this = null; return ${script};`
                )();
                return closure.apply(null, [
                    // @ts-ignore
                    window.modules,
                    // @ts-ignore
                    window.universe,
                    ...args,
                ]);
            },
            `${script}`,
            ...args
        );
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
