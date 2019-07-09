import * as path from "path";
import { BrowserObject, remote } from "webdriverio";
import { modules } from "../app/modules";
import {
    BROWSERSTACK_APP,
    BROWSERSTACK_KEY,
    BROWSERSTACK_USER,
    MOBILE_PLATFORM,
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
    const options: WebdriverIO.RemoteOptions = {
        logLevel: "error",
    };

    if (BROWSERSTACK_APP !== undefined) {
        if (BROWSERSTACK_USER === undefined || BROWSERSTACK_KEY === undefined) {
            throw new Error(
                "BROWSERSTACK_USER or BROWSERSTACK_KEY are undefined set them or unset BROWSERSTACK_APP to test locally"
            );
        }

        options.hostname = "hub-cloud.browserstack.com";

        options.capabilities = {
            app: BROWSERSTACK_APP,
            autoWebview: true,
            // @ts-ignore
            "browserstack.appium_version": "1.9.1",
            "browserstack.debug": true,
            "browserstack.key": BROWSERSTACK_KEY,
            "browserstack.local": "true",
            "browserstack.networkLogs": true,
            "browserstack.user": BROWSERSTACK_USER,
            project: "AeroGear Integration Tests",
            real_mobile: "true",
        };

        switch (MOBILE_PLATFORM) {
            case MobilePlatform.IOS:
                // @ts-ignore
                options.capabilities.os_version = "12";
                // @ts-ignore
                options.capabilities.device = "iPhone XS";
                break;

            case MobilePlatform.Android:
                // @ts-ignore
                options.capabilities.os_version = "9.0";
                // @ts-ignore
                options.capabilities.device = "Google Pixel 3";
                break;
        }
    } else {
        // Test using local appium

        if (MOBILE_PLATFORM === MobilePlatform.IOS) {
            throw new Error("local tests on iOS is ont yet supported");
        }

        options.port = 4723;
        options.capabilities = {
            app: path.join(
                __dirname,
                "../platforms/android/app/build/outputs/apk/debug/app-debug.apk"
            ),
            autoWebview: true,
            automationName: "UiAutomator2",
            deviceName: "Any Connected Devices",
            platformName: "Android",
        };
    }

    return options;
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
