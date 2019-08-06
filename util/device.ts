import { remote } from "webdriverio";
import { opts } from "../config/appium-opts";
import { Modules } from "../fixtures/modules";

export class Device {
    public browser: BrowserObject;

    public async init() {
        this.browser = await remote(opts);
        this.browser.setAsyncTimeout(30000);
    }

    public async close() {
        await this.browser.deleteSession();
    }

    /**
     * This is a wrap around the webdriver.io executeAsync() method
     * thats had few handy helpers and typescript support.
     */
    public async execute<U extends {}, A extends any[], R>(
        script: (modules: Modules, universe: U, ...args: A) => Promise<R>,
        ...args: A
    ): Promise<R> {
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

export const device = new Device();
