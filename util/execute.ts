import { BrowserObject } from "webdriverio";
import { modules } from "../app/modules";

type Modules = typeof modules;

export function execute<T, A extends Array<any>>(
  browser: BrowserObject,
  script: (modules: Modules, ...args: A) => T,
  ...args: A
): Promise<T> {
  return browser.execute(
    `return (${script}).apply(null, [window.modules].concat(arguments))`,
    ...args
  );
}
