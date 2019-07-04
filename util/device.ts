import * as path from "path";
import { BrowserObject, remote } from "webdriverio";
import { modules } from "../app/modules";

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
            newCommandTimeout: 0,
            platformName: "Android",
            platformVersion: "9",
        },
        logLevel: "error",
        port: 4723,
    });
    return new Device(browser);
}

let device: Device;

export async function bootstrapDevice() {
    if (device === undefined) {
        device = await initDevice();
    }
    return device;
}
