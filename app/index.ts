import * as helpers from "tslib";
import { modules } from "./modules";

// expose all typescript helpers globally
for (const key in helpers) {
    if (helpers.hasOwnProperty(key)) {
        window[key] = helpers[key];
    }
}

// initialize the universe where everyone can store everything
// @ts-ignore
window.universe = {};

// expose modules globally
// @ts-ignore
window.modules = modules;
