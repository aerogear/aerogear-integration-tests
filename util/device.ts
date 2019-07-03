import * as path from "path";
import { BrowserObject, remote } from "webdriverio";
import { modules } from "../app/modules";

type Modules = typeof modules;

export class Device {
    public browser: BrowserObject;

    constructor(browser: BrowserObject) {
        this.browser = browser;
    }

    public executeAsync<T, A extends any[]>(
        script: (modules: Modules, ...args: A) => Promise<T>,
        ...args: A
    ): Promise<T> {
        return this.browser.executeAsync(
            `return (${script}).apply(null, [window.modules].concat(arguments)).then(arguments[arguments.length -1 ]);`,
            ...args
        );
    }

    public execute<T, A extends any[]>(
        script: (modules: Modules, ...args: A) => T,
        ...args: A
    ): Promise<T> {
        return this.browser.execute(
            `return (${script}).apply(null, [window.modules].concat(arguments))`,
            ...args
        );
    }
}

async function initDevice() {
    const browser = await remote({
        capabilities: {
            app: path.join(
                __dirname,
                "../platforms/android/app/build/outputs/apk/debug/app-debug.apk"
            ),
            autoWebview: true,
            automationName: "UiAutomator2",
            deviceName: "Android Emulator",
            platformName: "Android",
            platformVersion: "9",
        },
        logLevel: "error",
        port: 4723,
    });
    return new Device(browser);
}

let device: Device;

export async function singletonDevice() {
    if (device === undefined) {
        device = await initDevice();
    }
    return device;
}
