import { remote, BrowserObject } from "webdriverio";
import { modules } from "../app/modules";
import { join } from "path";

type Modules = typeof modules;

export class Device {
  browser: BrowserObject;

  constructor(browser: BrowserObject) {
    this.browser = browser;
  }

  execute<T, A extends Array<any>>(
    script: (modules: Modules, ...args: A) => T,
    ...args: A
  ): Promise<T> {
    return this.browser.execute(
      `return (${script}).apply(null, [window.modules].concat(arguments))`,
      ...args
    );
  }
}

async function init() {
  const browser = await remote({
    port: 4723,
    logLevel: "error",
    capabilities: {
      platformName: "Android",
      platformVersion: "9",
      deviceName: "Android Emulator",
      app: join(
        __dirname,
        "../platforms/android/app/build/outputs/apk/debug/app-debug.apk"
      ),
      automationName: "UiAutomator2",
      autoWebview: true
    }
  });
  return new Device(browser);
}

let _device: Device;

export async function device() {
  if (_device === undefined) {
    _device = await init();
  }
  return _device;
}
