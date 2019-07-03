import { modules } from "./modules";
import * as helpers from "tslib";

// expose all typescript helpers globally
for (const key in helpers) {
    window[key] = helpers[key];
}

// expose modules globally
window["modules"] = modules;
